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

// Middlewares
// CORS restrito à própria origem pública em produção (antes: aberto a qualquer site).
const PUBLIC_ORIGIN = (process.env.PUBLIC_URL || '').replace(/\/+$/, '');
app.use(cors(PUBLIC_ORIGIN ? { origin: PUBLIC_ORIGIN } : {}));
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

// Proteção da API (2026-09-06). O Sentinela ainda não tem login no servidor: o
// frontend guarda tudo em localStorage e não chama /api/*. Até existir
// autenticação real, toda rota /api/* (exceto health) exige o token de serviço
// SENTINELA_API_TOKEN. Em produção sem o token configurado a API responde 503
// (fail-closed) em vez de ficar aberta na internet.
const API_TOKEN = (process.env.SENTINELA_API_TOKEN || '').trim();
const IS_PROD = process.env.NODE_ENV === 'production';

function tokenConfere(recebido) {
  if (!API_TOKEN || !recebido) return false;
  const a = Buffer.from(recebido);
  const b = Buffer.from(API_TOKEN);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (!API_TOKEN) {
    if (IS_PROD) {
      return res.status(503).json({ error: 'API do Sentinela desativada: SENTINELA_API_TOKEN não configurado.' });
    }
    return next(); // desenvolvimento local sem token: comportamento antigo
  }
  const auth = String(req.headers.authorization || '');
  const recebido = auth.startsWith('Bearer ') ? auth.slice(7).trim() : String(req.headers['x-api-key'] || '').trim();
  if (!tokenConfere(recebido)) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }
  return next();
});


// Helper para extrair tenant
function getTenantFilter(req) {
  const tenantId = req.query.tenantId || req.headers['x-tenant-id'];
  if (!tenantId || tenantId === 'all') return {};
  return { tenantId: String(tenantId) };
}

// Seed endpoint
app.post('/api/seed', async (req, res) => {
  if (IS_PROD) {
    return res.status(403).json({ error: 'Seed desativado em produção.' });
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
    const tenants = await prisma.tenant.findMany({
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
    const user = await prisma.user.create({ data: req.body });
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
    const mailbox = await prisma.monitoredMailbox.create({ data: req.body });
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
    const incident = await prisma.incident.create({ data: req.body });
    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao criar incidente', details: error.message });
  }
});

app.patch('/api/incidents/:id', async (req, res) => {
  try {
    const incident = await prisma.incident.update({
      where: { id: req.params.id },
      data: req.body,
    });
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
    const client = await prisma.clientEntity.create({ data: req.body });
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
    const lead = await prisma.commercialLead.create({ data: req.body });
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
    const audit = await prisma.qualityAuditRecord.create({ data: req.body });
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
    const broadcast = await prisma.monthlyBroadcastCircular.create({ data: req.body });
    res.json(broadcast);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao criar circular', details: error.message });
  }
});

app.patch('/api/monthly-broadcasts/:id', async (req, res) => {
  try {
    const broadcast = await prisma.monthlyBroadcastCircular.update({
      where: { id: req.params.id },
      data: req.body,
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
app.get('/api/configs/:tenantId', async (req, res) => {
  try {
    const config = await prisma.tenantConfig.findUnique({
      where: { tenantId: req.params.tenantId },
    });
    res.json(config || {});
  } catch (error) {
    res.status(500).json({ error: 'Falha ao buscar configuração', details: error.message });
  }
});

app.put('/api/configs/:tenantId', async (req, res) => {
  try {
    const config = await prisma.tenantConfig.upsert({
      where: { tenantId: req.params.tenantId },
      update: req.body,
      create: { ...req.body, tenantId: req.params.tenantId },
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

app.get('*', (req, res) => {
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
});
