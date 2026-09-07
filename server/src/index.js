import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import prisma from './db.js';
import { seedDatabase } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4015;
const DIST_DIR = path.resolve(__dirname, '../../dist');

// Ambiente. Regra (2026-09-07): só `development` explícito relaxa qualquer
// proteção. Qualquer outro valor — inclusive `undefined`, o padrão do Node
// quando a variável não é definida na VM — é tratado como ambiente exposto e
// aplica as regras fechadas (fail-closed).
const IS_DEV = process.env.NODE_ENV === 'development';
const IS_PROD = process.env.NODE_ENV === 'production';

// Middlewares
// CORS restrito à própria origem pública. Sem PUBLIC_URL definido, fora de
// desenvolvimento, nenhuma origem cruzada é aceita (antes: `cors({})` voltava a
// `*` e abria a API para qualquer site).
const PUBLIC_ORIGIN = (process.env.PUBLIC_URL || '').replace(/\/+$/, '');
if (PUBLIC_ORIGIN) {
  app.use(cors({ origin: PUBLIC_ORIGIN }));
} else if (IS_DEV) {
  app.use(cors());
} else {
  console.error(
    '[Sentinela] PUBLIC_URL não configurado fora de desenvolvimento: ' +
      'CORS recusará todas as origens cruzadas. Defina PUBLIC_URL no .env da VM.',
  );
  app.use(cors({ origin: false }));
}
app.use(express.json({ limit: '1mb' }));

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// ---------------------------------------------------------
// 1. HEALTH-CHECK (Sem autenticação)
// ---------------------------------------------------------
const healthHandler = (req, res) => {
  res.json({
    status: 'UP',
    app: 'sentinela',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    database: process.env.DATABASE_URL ? 'configured' : 'not_configured',
  });
};

app.get('/health.json', healthHandler);
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// ---------------------------------------------------------
// 2. ROTAS DA API REST (Multi-Tenant)
// ---------------------------------------------------------

// Proteção da API. O Sentinela ainda não tem login no servidor: o frontend
// guarda tudo em localStorage e não chama /api/*. Até existir autenticação
// real, toda rota /api/* (exceto health) exige um token de serviço.
//
// Escopo por escritório (2026-09-07). Antes havia um único token global e o
// escritório vinha de `?tenantId=` / `x-tenant-id`: quem tivesse o token lia e
// escrevia em qualquer escritório (IDOR multi-tenant). Agora:
//
//   * SENTINELA_API_TOKEN_CONTATUR_SP / _CONTATUR_RIO / _MKP_SP — um token por
//     escritório, leitura e escrita. O escritório é resolvido a partir do token
//     apresentado e o `tenantId` enviado pelo cliente é IGNORADO.
//   * SENTINELA_API_TOKEN — token global, mantido apenas para leitura
//     consolidada (relatórios/monitoramento). Nunca escreve (403 em métodos de
//     escrita) e exige `tenantId` explícito de um escritório conhecido.
//
// Sem nenhum token configurado a API responde 503 (fail-closed), exceto em
// desenvolvimento explícito (NODE_ENV=development).
const ESCRITORIOS = ['contatur_sp', 'contatur_rio', 'mkp_sp'];

const TOKENS_POR_ESCRITORIO = new Map();
for (const tenantId of ESCRITORIOS) {
  const nomeVar = `SENTINELA_API_TOKEN_${tenantId.toUpperCase()}`;
  const valor = (process.env[nomeVar] || '').trim();
  if (valor) TOKENS_POR_ESCRITORIO.set(tenantId, valor);
}
const TOKEN_GLOBAL_LEITURA = (process.env.SENTINELA_API_TOKEN || '').trim();
const HA_TOKEN_CONFIGURADO = TOKENS_POR_ESCRITORIO.size > 0 || TOKEN_GLOBAL_LEITURA !== '';

// Comparação em tempo constante sobre digests de tamanho fixo (evita também
// vazar o tamanho do segredo pela diferença de comprimento).
function segredoConfere(recebido, esperado) {
  if (!recebido || !esperado) return false;
  const a = crypto.createHash('sha256').update(String(recebido)).digest();
  const b = crypto.createHash('sha256').update(String(esperado)).digest();
  return crypto.timingSafeEqual(a, b);
}

function resolveEscopo(recebido) {
  if (!recebido) return null;
  let escopo = null;
  // Percorre todos os tokens sem interromper o laço, para não transformar a
  // ordem das variáveis em um canal de tempo.
  for (const [tenantId, token] of TOKENS_POR_ESCRITORIO) {
    if (segredoConfere(recebido, token)) escopo = { tipo: 'escritorio', tenantId };
  }
  if (!escopo && segredoConfere(recebido, TOKEN_GLOBAL_LEITURA)) {
    escopo = { tipo: 'global_leitura', tenantId: null };
  }
  return escopo;
}

function ehLeitura(metodo) {
  return metodo === 'GET' || metodo === 'HEAD';
}

app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();

  if (!HA_TOKEN_CONFIGURADO) {
    if (IS_DEV) {
      // Desenvolvimento local explícito: sem escopo, comportamento antigo.
      req.escopo = { tipo: 'desenvolvimento', tenantId: null };
      return next();
    }
    return res.status(503).json({
      error:
        'API do Sentinela desativada: nenhum token de serviço configurado ' +
        '(SENTINELA_API_TOKEN_CONTATUR_SP / _CONTATUR_RIO / _MKP_SP).',
    });
  }

  const auth = String(req.headers.authorization || '');
  const recebido = auth.startsWith('Bearer ')
    ? auth.slice(7).trim()
    : String(req.headers['x-api-key'] || '').trim();

  const escopo = resolveEscopo(recebido);
  if (!escopo) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  if (escopo.tipo === 'global_leitura') {
    if (!ehLeitura(req.method)) {
      return res.status(403).json({
        error:
          'Token global é somente leitura. Use o token do escritório ' +
          '(SENTINELA_API_TOKEN_<ESCRITORIO>) para gravar.',
      });
    }
    const solicitado = String(req.query.tenantId || req.headers['x-tenant-id'] || '').trim();
    if (!ESCRITORIOS.includes(solicitado)) {
      return res.status(400).json({
        error:
          'Token global exige tenantId explícito de um escritório: ' +
          `${ESCRITORIOS.join(', ')}.`,
      });
    }
    req.escopo = { tipo: 'global_leitura', tenantId: solicitado };
    return next();
  }

  req.escopo = escopo;
  return next();
});

// Escritório efetivo da requisição. Vem sempre do token (ou do tenantId
// validado, no caso do token global de leitura); nunca do corpo/query do
// cliente. `null` só ocorre em desenvolvimento sem token.
function escopoTenantId(req) {
  return (req.escopo && req.escopo.tenantId) || null;
}

// Helper para extrair tenant
function getTenantFilter(req) {
  const doEscopo = escopoTenantId(req);
  if (doEscopo) return { tenantId: doEscopo };
  // Desenvolvimento sem token: comportamento antigo (filtro opcional).
  const tenantId = req.query.tenantId || req.headers['x-tenant-id'];
  if (!tenantId || tenantId === 'all') return {};
  return { tenantId: String(tenantId) };
}

// Força o escritório do token nos dados gravados, ignorando o tenantId do corpo.
function dadosComTenant(req, body) {
  const dados = { ...(body || {}) };
  const doEscopo = escopoTenantId(req);
  if (doEscopo) dados.tenantId = doEscopo;
  return dados;
}

// Impede que uma escrita por id alcance registro de outro escritório.
function filtroPorId(req, id) {
  const doEscopo = escopoTenantId(req);
  return doEscopo ? { id, tenantId: doEscopo } : { id };
}

// Seed endpoint
app.post('/api/seed', async (req, res) => {
  if (!IS_DEV) {
    return res.status(403).json({ error: 'Seed disponível apenas em desenvolvimento.' });
  }
  try {
    await seedDatabase();
    res.json({ ok: true, message: 'Banco de dados populado com sucesso' });
  } catch (error) {
    console.error('Erro no seed:', error);
    res.status(500).json({ error: 'Falha ao executar seed', details: error.message });
  }
});

// Tenants (Escritórios: SP, Rio, MKP)
app.get('/api/tenants', async (req, res) => {
  try {
    const doEscopo = escopoTenantId(req);
    const tenants = await prisma.tenant.findMany({
      where: doEscopo ? { id: doEscopo } : {},
      orderBy: { name: 'asc' },
    });
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao buscar tenants', details: error.message });
  }
});

// Usuários
app.get('/api/users', async (req, res) => {
  try {
    const where = getTenantFilter(req);
    const users = await prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao buscar usuários', details: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = await prisma.user.create({ data: dadosComTenant(req, req.body) });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao criar usuário', details: error.message });
  }
});

// Caixas Postais Monitoradas
app.get('/api/mailboxes', async (req, res) => {
  try {
    const where = getTenantFilter(req);
    const mailboxes = await prisma.monitoredMailbox.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    res.json(mailboxes);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao buscar caixas de e-mail', details: error.message });
  }
});

app.post('/api/mailboxes', async (req, res) => {
  try {
    const mailbox = await prisma.monitoredMailbox.create({ data: dadosComTenant(req, req.body) });
    res.json(mailbox);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao criar caixa de e-mail', details: error.message });
  }
});

// Incidentes & Reclamações
app.get('/api/incidents', async (req, res) => {
  try {
    const where = getTenantFilter(req);
    const incidents = await prisma.incident.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao buscar incidentes', details: error.message });
  }
});

app.post('/api/incidents', async (req, res) => {
  try {
    const incident = await prisma.incident.create({ data: dadosComTenant(req, req.body) });
    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao criar incidente', details: error.message });
  }
});

app.patch('/api/incidents/:id', async (req, res) => {
  try {
    const dados = dadosComTenant(req, req.body);
    const alterados = await prisma.incident.updateMany({
      where: filtroPorId(req, req.params.id),
      data: dados,
    });
    if (alterados.count === 0) {
      return res.status(404).json({ error: 'Incidente não encontrado neste escritório.' });
    }
    const incident = await prisma.incident.findUnique({ where: { id: req.params.id } });
    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao atualizar incidente', details: error.message });
  }
});

// Radar de Clientes & Prevenção de Churn
app.get('/api/clients', async (req, res) => {
  try {
    const where = getTenantFilter(req);
    const clients = await prisma.clientEntity.findMany({
      where,
      orderBy: { healthScore: 'asc' },
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao buscar clientes', details: error.message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const client = await prisma.clientEntity.create({ data: dadosComTenant(req, req.body) });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao salvar cliente', details: error.message });
  }
});

// Oportunidades Comerciais
app.get('/api/commercial-leads', async (req, res) => {
  try {
    const where = getTenantFilter(req);
    const leads = await prisma.commercialLead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao buscar leads', details: error.message });
  }
});

app.post('/api/commercial-leads', async (req, res) => {
  try {
    const lead = await prisma.commercialLead.create({ data: dadosComTenant(req, req.body) });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao criar lead', details: error.message });
  }
});

// Auditoria de Qualidade
app.get('/api/quality-audits', async (req, res) => {
  try {
    const where = getTenantFilter(req);
    const audits = await prisma.qualityAuditRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(audits);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao buscar auditorias', details: error.message });
  }
});

app.post('/api/quality-audits', async (req, res) => {
  try {
    const audit = await prisma.qualityAuditRecord.create({ data: dadosComTenant(req, req.body) });
    res.json(audit);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao criar auditoria', details: error.message });
  }
});

// Circulares Mensais Multissetoriais
app.get('/api/monthly-broadcasts', async (req, res) => {
  try {
    const where = getTenantFilter(req);
    const broadcasts = await prisma.monthlyBroadcastCircular.findMany({
      where,
      orderBy: { referenceMonth: 'desc' },
    });
    res.json(broadcasts);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao buscar circulares', details: error.message });
  }
});

app.post('/api/monthly-broadcasts', async (req, res) => {
  try {
    const broadcast = await prisma.monthlyBroadcastCircular.create({
      data: dadosComTenant(req, req.body),
    });
    res.json(broadcast);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao criar circular', details: error.message });
  }
});

app.patch('/api/monthly-broadcasts/:id', async (req, res) => {
  try {
    const alterados = await prisma.monthlyBroadcastCircular.updateMany({
      where: filtroPorId(req, req.params.id),
      data: dadosComTenant(req, req.body),
    });
    if (alterados.count === 0) {
      return res.status(404).json({ error: 'Circular não encontrada neste escritório.' });
    }
    const broadcast = await prisma.monthlyBroadcastCircular.findUnique({
      where: { id: req.params.id },
    });
    res.json(broadcast);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao atualizar circular', details: error.message });
  }
});

// Carga de Trabalho & Burnout
app.get('/api/team-workload', async (req, res) => {
  try {
    const where = getTenantFilter(req);
    const workload = await prisma.teamWorkloadMember.findMany({
      where,
      orderBy: { burnoutIndex: 'desc' },
    });
    res.json(workload);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao buscar equipe', details: error.message });
  }
});

// Configurações por Tenant
// O :tenantId da URL só é aceito quando coincide com o escritório do token.
function escritorioDaRota(req, res) {
  const solicitado = String(req.params.tenantId || '');
  const doEscopo = escopoTenantId(req);
  if (doEscopo && solicitado !== doEscopo) {
    res.status(403).json({ error: 'Token não tem acesso a este escritório.' });
    return null;
  }
  return solicitado;
}

app.get('/api/configs/:tenantId', async (req, res) => {
  const tenantId = escritorioDaRota(req, res);
  if (tenantId === null) return;
  try {
    const config = await prisma.tenantConfig.findUnique({ where: { tenantId } });
    res.json(config || {});
  } catch (error) {
    res.status(500).json({ error: 'Falha ao buscar configuração', details: error.message });
  }
});

app.put('/api/configs/:tenantId', async (req, res) => {
  const tenantId = escritorioDaRota(req, res);
  if (tenantId === null) return;
  try {
    const dados = { ...(req.body || {}) };
    delete dados.tenantId;
    const config = await prisma.tenantConfig.upsert({
      where: { tenantId },
      update: dados,
      create: { ...dados, tenantId },
    });
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao atualizar configuração', details: error.message });
  }
});

// ---------------------------------------------------------
// 3. ARQUIVOS ESTÁTICOS DE PRODUÇÃO & SPA FALLBACK
// ---------------------------------------------------------
app.use(express.static(DIST_DIR));

// Express 5 (instalado: 5.2.1) não aceita mais o curinga solto `'*'` — o servidor
// nem chegava a subir ("Missing parameter name at index 1"). O curinga nomeado
// `/*splat` é a forma equivalente na versão 5.
app.get('/*splat', (req, res) => {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Sentinela: Arquivos de produção não encontrados. Execute npm run build primeiro.');
  }
});

// Inicialização
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Sentinela] Servidor iniciado na porta ${PORT} (http://localhost:${PORT})`);
  if (IS_PROD && !HA_TOKEN_CONFIGURADO) {
    console.error('[Sentinela] ATENÇÃO: API /api/* respondendo 503 — nenhum token de serviço configurado.');
  }
});
