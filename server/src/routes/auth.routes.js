// Autenticação no servidor (achados S1/S2).
//   POST /api/auth/login      e-mail + senha (bcrypt contra users.passwordHash)
//   POST /api/auth/logout     apaga o cookie
//   GET  /api/auth/me         usuário da sessão (papel e permissões vêm do banco)
//   POST /api/auth/bootstrap  cria o PRIMEIRO usuário (SuperAdmin) — exige
//                             BOOTSTRAP_SECRET (>= 16 chars, comparação em tempo
//                             constante) e só funciona enquanto não há usuário.
import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db.js';
import { signSession, setSessionCookie, clearSessionCookie, isSessionConfigured } from '../lib/session.js';
import { segredoConfere } from '../lib/crypto.js';
import { LoginSchema, BootstrapSchema, validar } from '../lib/validation.js';
import { SELECT_USUARIO, sanitizeUser, requireAuth } from '../middleware/auth.js';
import { loginLimiter, bootstrapLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

const MENSAGEM_CREDENCIAIS = 'E-mail ou senha incorretos.';
// Hash de referência usado quando o e-mail não existe (custo igual ao real).
const HASH_FALSO = bcrypt.hashSync('sentinela-hash-de-referencia', 12);

// Permissões completas do SuperAdmin (espelha FULL_PERMISSIONS do frontend).
export const PERMISSOES_SUPERADMIN = {
  dashboard: { view: true, viewAllUnits: true, filterDepartment: true },
  incidents: {
    view: true, viewOnlyOwn: false, viewOnlyDepartment: false, changeStatus: true, assignUser: true,
    deleteOrArchive: true, useAiCopilot: true, sendDirectReply: true, sendPostServiceTouchpoint: true,
  },
  commercialOpportunities: { view: true, createProposal: true, changeStatus: true },
  monthlyBroadcasts: { view: true, approveSection: true, requestAiAdjustment: true, dispatchToClients: true },
  teamWorkload: { view: true, applyRebalancing: true },
  departmentDiagnosis: { view: true },
  qualityAudit: { view: true, exportAuditReport: true },
  unitBenchmark: { view: true },
  clientRadar: { view: true, editHealthScore: true, addRelationshipNote: true, scheduleMeeting: true },
  mailboxes: { view: true, toggleActive: true, triggerSync: true },
  settings: {
    view: true, editEmailProvider: true, editAiProvider: true, editAlertChannels: true, editSlaAndRules: true,
    editFiscalRules: true, editBroadcastRules: true, editMeetingIntegration: true,
  },
  users: { view: true, create: true, edit: true, delete: true, managePermissions: true },
  reports: { view: true, exportPdf: true, exportExcel: true },
};

export function bootstrapSecretValido() {
  const s = String(process.env.BOOTSTRAP_SECRET || '');
  return s.length >= 16 ? s : null;
}

router.post('/login', loginLimiter, validar(LoginSchema), async (req, res) => {
  if (!isSessionConfigured()) {
    console.error('[Sentinela] Login recusado: SESSION_SECRET ausente ou curto (mínimo 32 caracteres).');
    return res.status(503).json({
      error: 'Login indisponível: o servidor ainda não tem o segredo de sessão configurado. Avise o administrador.',
    });
  }
  const { email } = req.validado;
  const senha = req.validado.senha || req.validado.password || '';

  let usuario;
  try {
    usuario = await prisma.user.findUnique({
      where: { email },
      select: { ...SELECT_USUARIO, passwordHash: true },
    });
  } catch (err) {
    console.error('[Sentinela] Login: banco indisponível:', err?.message || err);
    return res.status(503).json({ error: 'Banco de dados indisponível. Tente novamente em instantes.' });
  }

  // Sempre executa um bcrypt.compare (mesmo sem usuário) para não revelar
  // pela latência se o e-mail existe.
  const hash = usuario?.passwordHash || HASH_FALSO;
  const senhaOk = await bcrypt.compare(senha, hash);

  if (!usuario || !usuario.passwordHash || !senhaOk) {
    return res.status(401).json({ error: MENSAGEM_CREDENCIAIS });
  }
  if (!usuario.isActive) {
    return res.status(403).json({ error: 'Este usuário está inativo. Contate a diretoria.' });
  }

  try {
    await prisma.user.update({ where: { id: usuario.id }, data: { lastLoginAt: new Date() } });
  } catch (err) {
    console.error('[Sentinela] Login: falha ao registrar lastLoginAt (não bloqueante):', err?.message || err);
  }

  const token = signSession({ sub: usuario.id });
  setSessionCookie(res, token);
  const { passwordHash: _omitido, ...semHash } = usuario;
  return res.json({ success: true, user: sanitizeUser({ ...semHash, lastLoginAt: new Date() }) });
});

router.post('/logout', (req, res) => {
  clearSessionCookie(res);
  return res.json({ success: true });
});

router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: sanitizeUser(req.usuario) });
});

router.post('/bootstrap', bootstrapLimiter, async (req, res) => {
  const esperado = bootstrapSecretValido();
  if (!esperado) {
    return res.status(503).json({ error: 'Bootstrap desativado: BOOTSTRAP_SECRET não configurado (mínimo 16 caracteres).' });
  }
  const parse = BootstrapSchema.safeParse(req.body ?? {});
  // Valida o segredo antes de detalhar erros de campos (não dá dica a quem não tem o segredo).
  const recebido = String(req.body?.bootstrapSecret || '');
  if (!segredoConfere(recebido, esperado)) {
    return res.status(401).json({ error: 'Segredo de bootstrap inválido.' });
  }
  if (!parse.success) {
    return res.status(400).json({
      error: 'Dados inválidos. Informe nome, e-mail, senha (mínimo 8 caracteres) e escritório.',
    });
  }
  const { nome, email, senha, tenantId } = parse.data;

  try {
    const existentes = await prisma.user.count();
    if (existentes > 0) {
      return res.status(409).json({ error: 'Bootstrap indisponível: já existem usuários cadastrados.' });
    }
    const passwordHash = await bcrypt.hash(senha, 12);
    const criado = await prisma.user.create({
      data: {
        name: nome,
        email,
        passwordHash,
        role: 'role_superadmin',
        department: 'DIRETORIA',
        permissions: PERMISSOES_SUPERADMIN,
        isActive: true,
        isSuperAdmin: true,
        tenant: {
          connectOrCreate: {
            where: { id: tenantId },
            create: tenantPadrao(tenantId),
          },
        },
      },
      select: SELECT_USUARIO,
    });
    console.log(`[Sentinela] Bootstrap: SuperAdmin ${criado.email} criado.`);
    return res.status(201).json({ success: true, user: sanitizeUser(criado) });
  } catch (err) {
    console.error('[Sentinela] Bootstrap falhou:', err?.message || err);
    return res.status(500).json({ error: 'Não foi possível criar o usuário inicial. Verifique o log do servidor.' });
  }
});

function tenantPadrao(id) {
  const base = {
    contatur_sp: { name: 'Contatur São Paulo', slug: 'contatur-sp', city: 'São Paulo' },
    contatur_rio: { name: 'Contatur Rio', slug: 'contatur-rio', city: 'Rio de Janeiro' },
    mkp_sp: { name: 'MKP São Paulo', slug: 'mkp-sp', city: 'São Paulo' },
  }[id];
  return { id, cnpj: '', ...base };
}

export default router;
