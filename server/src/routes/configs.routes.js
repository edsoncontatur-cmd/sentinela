// Configurações por escritório (achados S3/S8).
//
// Os segredos (client secret M365, senha IMAP, chave de IA, tokens WhatsApp/
// Telegram/SGC/Meeting, webhooks) ficam SÓ no servidor, cifrados com
// AES-256-GCM em `tenant_configs.secrets`. A API nunca os devolve: informa
// apenas `secretsConfigurados: { sgcApiToken: true, ... }`.
import express from 'express';
import prisma from '../db.js';
import { encryptSecret, decryptSecret, isEncryptionConfigured, MENSAGEM_CHAVE_AUSENTE } from '../lib/crypto.js';
import { TenantConfigPutSchema, SECRET_KEYS, removerCamposSecretos, validar } from '../lib/validation.js';
import { ESCRITORIOS } from '../lib/escopo.js';
import { temPermissao } from '../middleware/auth.js';

const router = express.Router();

// Permissão da tela de Configurações exigida para gravar cada segredo.
const PERMISSAO_POR_SEGREDO = {
  m365ClientSecret: 'editEmailProvider',
  googleServiceAccountJson: 'editEmailProvider',
  imapPass: 'editEmailProvider',
  aiApiKey: 'editAiProvider',
  msTeamsWebhookUrl: 'editAlertChannels',
  whatsappApiToken: 'editAlertChannels',
  discordWebhookUrl: 'editAlertChannels',
  telegramBotToken: 'editAlertChannels',
  sgcApiToken: 'editMeetingIntegration',
  meetingApiToken: 'editMeetingIntegration',
};

function erroInterno(res, contexto, err) {
  console.error(`[Sentinela] ${contexto}:`, err?.message || err);
  return res.status(500).json({ error: 'Não foi possível concluir a operação. Tente novamente ou avise o administrador.' });
}

// O :tenantId da URL só é aceito quando coincide com o escopo (ou o escopo vê todos).
function escritorioDaRota(req, res) {
  const solicitado = String(req.params.tenantId || '');
  if (!ESCRITORIOS.includes(solicitado)) {
    res.status(400).json({ error: `Escritório inválido. Use: ${ESCRITORIOS.join(', ')}.` });
    return null;
  }
  const fixo = req.escopo?.tenantId;
  if (fixo && solicitado !== fixo) {
    res.status(403).json({ error: 'Você não tem acesso a este escritório.' });
    return null;
  }
  return solicitado;
}

function semSegredos(config) {
  if (!config) return null;
  const { secrets, ...resto } = config;
  const cifrados = secrets && typeof secrets === 'object' ? secrets : {};
  const secretsConfigurados = {};
  for (const k of SECRET_KEYS) secretsConfigurados[k] = Boolean(cifrados[k]);
  return { ...resto, secretsConfigurados };
}

export async function obterConfigDecifrada(tenantId) {
  const config = await prisma.tenantConfig.findUnique({ where: { tenantId } });
  if (!config) return null;
  const cifrados = config.secrets && typeof config.secrets === 'object' ? config.secrets : {};
  const segredos = {};
  for (const k of SECRET_KEYS) segredos[k] = cifrados[k] ? decryptSecret(cifrados[k]) : null;
  return { config: semSegredos(config), segredos };
}

router.get('/:tenantId', async (req, res) => {
  const tenantId = escritorioDaRota(req, res);
  if (tenantId === null) return;
  if (req.usuario && !temPermissao(req.usuario, 'settings', 'view')) {
    return res.status(403).json({ error: 'Você não tem permissão para ver as configurações.' });
  }
  try {
    const config = await prisma.tenantConfig.findUnique({ where: { tenantId } });
    const resposta = semSegredos(config) || { tenantId, secretsConfigurados: Object.fromEntries(SECRET_KEYS.map((k) => [k, false])) };
    res.json({ ...resposta, encryptionConfigured: isEncryptionConfigured() });
  } catch (err) {
    return erroInterno(res, 'Falha ao buscar configuração', err);
  }
});

router.put('/:tenantId', validar(TenantConfigPutSchema), async (req, res) => {
  const tenantId = escritorioDaRota(req, res);
  if (tenantId === null) return;
  if (req.usuario && !temPermissao(req.usuario, 'settings', 'view')) {
    return res.status(403).json({ error: 'Você não tem permissão para alterar as configurações.' });
  }
  const { secrets: novosSegredos, ...dados } = req.validado;

  // Blocos JSON nunca carregam campos de segredo (defesa em profundidade).
  for (const bloco of ['sgcIntegration', 'meetingIntegration', 'supervisorWorkflow', 'monthlyBroadcastSettings', 'settings']) {
    if (dados[bloco] !== undefined) dados[bloco] = removerCamposSecretos(dados[bloco]);
  }

  const cifrar = {};
  const entradas = Object.entries(novosSegredos || {}).filter(([, v]) => typeof v === 'string' && v.trim() !== '');
  if (entradas.length > 0) {
    if (!isEncryptionConfigured()) {
      // Fail-closed: sem chave, nada é gravado (nem os campos comuns), para o
      // usuário não achar que o token foi salvo.
      return res.status(503).json({ error: MENSAGEM_CHAVE_AUSENTE });
    }
    for (const [chave, valor] of entradas) {
      if (req.usuario && !temPermissao(req.usuario, 'settings', PERMISSAO_POR_SEGREDO[chave])) {
        return res.status(403).json({ error: `Você não tem permissão para alterar o segredo "${chave}".` });
      }
      cifrar[chave] = encryptSecret(valor.trim());
    }
  }

  try {
    const atual = await prisma.tenantConfig.findUnique({ where: { tenantId }, select: { secrets: true } });
    const secretsAtuais = atual?.secrets && typeof atual.secrets === 'object' ? atual.secrets : {};
    const secrets = { ...secretsAtuais, ...cifrar };
    const salvo = await prisma.tenantConfig.upsert({
      where: { tenantId },
      update: { ...dados, secrets },
      create: { ...dados, secrets, tenantId },
    });
    res.json({ ...semSegredos(salvo), encryptionConfigured: isEncryptionConfigured() });
  } catch (err) {
    return erroInterno(res, 'Falha ao salvar configuração', err);
  }
});

export default router;
