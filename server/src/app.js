// Aplicação Express do Sentinela (correção de auditoria 2026-09-07).
//
// * Login no servidor (cookie httpOnly) — /api/auth/*
// * Segredos de integração só no servidor, cifrados — /api/configs/*
// * Proxy SGC / Contatur Meeting com validação de destino — /api/integracoes/*
// * Zod por rota, helmet, rate limit, trust proxy, erros neutros, health com SELECT 1
//
// `index.js` continua sendo o entrypoint (`node server/src/index.js`); este
// arquivo só monta o app, para que os testes possam subi-lo em porta aleatória.
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import prisma from './db.js';
import { seedDatabase } from './seed.js';
import { segredoConfere, isEncryptionConfigured } from './lib/crypto.js';
import { isSessionConfigured } from './lib/session.js';
import { ESCRITORIOS } from './lib/validation.js';
import { autenticarSessao } from './middleware/auth.js';
import { apiLimiter } from './middleware/rateLimit.js';
import authRoutes, { bootstrapSecretValido } from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import configsRoutes from './routes/configs.routes.js';
import integracoesRoutes from './routes/integracoes.routes.js';
import dadosRoutes from './routes/dados.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const DIST_DIR = path.resolve(__dirname, '../../dist');

// Ambiente. Só `development` explícito relaxa qualquer proteção. Qualquer
// outro valor — inclusive `undefined` — é tratado como exposto (fail-closed).
export const IS_DEV = process.env.NODE_ENV === 'development';
export const IS_PROD = process.env.NODE_ENV === 'production';

// `app.set('trust proxy', ...)` a partir de TRUST_PROXY: "1"/"2" = número de
// proxies (IIS na VM), "true" = confiar em todos, vazio/"false" = nenhum.
export function lerTrustProxy(valor = process.env.TRUST_PROXY) {
  const v = String(valor ?? '').trim().toLowerCase();
  if (v === '' || v === '0' || v === 'false') return false;
  if (v === 'true') return true;
  if (/^\d+$/.test(v)) return parseInt(v, 10);
  return v; // ex.: "loopback" ou lista de IPs
}

// ---------------------------------------------------------------- Tokens de serviço
// Um token POR ESCRITÓRIO (leitura/escrita) + token global só-leitura. O escopo
// vem do token; o tenantId enviado pelo cliente é ignorado. Mantidos para
// integrações máquina-a-máquina; usuários usam a sessão (cookie).
const TOKENS_POR_ESCRITORIO = new Map();
for (const tenantId of ESCRITORIOS) {
  const valor = (process.env[`SENTINELA_API_TOKEN_${tenantId.toUpperCase()}`] || '').trim();
  if (valor) TOKENS_POR_ESCRITORIO.set(tenantId, valor);
}
const TOKEN_GLOBAL_LEITURA = (process.env.SENTINELA_API_TOKEN || '').trim();
const HA_TOKEN_CONFIGURADO = TOKENS_POR_ESCRITORIO.size > 0 || TOKEN_GLOBAL_LEITURA !== '';

function resolveEscopoToken(recebido) {
  if (!recebido) return null;
  let escopo = null;
  // Percorre todos sem interromper, para a ordem das variáveis não virar canal de tempo.
  for (const [tenantId, token] of TOKENS_POR_ESCRITORIO) {
    if (segredoConfere(recebido, token)) escopo = { tipo: 'escritorio', tenantId, superAdmin: false };
  }
  if (!escopo && segredoConfere(recebido, TOKEN_GLOBAL_LEITURA)) {
    escopo = { tipo: 'global_leitura', tenantId: null, superAdmin: false };
  }
  return escopo;
}

function ehLeitura(metodo) {
  return metodo === 'GET' || metodo === 'HEAD';
}

// Autenticação de /api/* (exceto /api/health e /api/auth/*): sessão (cookie)
// ou token de serviço. Sem nenhum dos dois: 401.
async function autenticarApi(req, res, next) {
  const { usuario, erroBanco } = await autenticarSessao(req);
  if (erroBanco) return res.status(503).json({ error: 'Banco de dados indisponível. Tente novamente em instantes.' });
  if (usuario) {
    req.usuario = usuario;
    req.escopo = { tipo: 'usuario', tenantId: usuario.isSuperAdmin ? null : usuario.tenantId, superAdmin: usuario.isSuperAdmin };
    return next();
  }

  const auth = String(req.headers.authorization || '');
  const recebido = auth.startsWith('Bearer ') ? auth.slice(7).trim() : String(req.headers['x-api-key'] || '').trim();
  if (recebido) {
    const escopo = resolveEscopoToken(recebido);
    if (!escopo) return res.status(401).json({ error: 'Não autorizado.' });
    if (escopo.tipo === 'global_leitura') {
      if (!ehLeitura(req.method)) {
        return res.status(403).json({ error: 'Token global é somente leitura. Use o token do escritório para gravar.' });
      }
      const solicitado = String(req.query.tenantId || req.headers['x-tenant-id'] || '').trim();
      if (!ESCRITORIOS.includes(solicitado)) {
        return res.status(400).json({ error: `Token global exige tenantId explícito de um escritório: ${ESCRITORIOS.join(', ')}.` });
      }
      req.escopo = { tipo: 'global_leitura', tenantId: solicitado, superAdmin: false };
      return next();
    }
    req.escopo = escopo;
    return next();
  }

  // Desenvolvimento local explícito e sem NENHUMA credencial configurada:
  // comportamento antigo (API aberta) para não travar o `npm run dev`.
  if (IS_DEV && !HA_TOKEN_CONFIGURADO && !isSessionConfigured()) {
    req.escopo = { tipo: 'desenvolvimento', tenantId: null, superAdmin: true };
    return next();
  }

  return res.status(401).json({ error: 'Faça login para acessar o Sentinela.' });
}

export function avisosDeConfiguracao(log = console) {
  if (!isSessionConfigured()) {
    log.error('[Sentinela] SESSION_SECRET ausente ou curto (mínimo 32 caracteres): o login responderá 503.');
  }
  if (!isEncryptionConfigured()) {
    log.error('[Sentinela] SENTINELA_ENCRYPTION_KEY ausente/inválida (64 hex): segredos de integração não poderão ser salvos.');
  }
  if (process.env.BOOTSTRAP_SECRET && !bootstrapSecretValido()) {
    log.error('[Sentinela] BOOTSTRAP_SECRET definido mas curto (mínimo 16 caracteres): bootstrap desativado.');
  }
  if (!process.env.PUBLIC_URL && !IS_DEV) {
    log.error('[Sentinela] PUBLIC_URL não configurado fora de desenvolvimento: CORS recusará todas as origens cruzadas.');
  }
}

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', lerTrustProxy());

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'"],
          'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
          'img-src': ["'self'", 'data:', 'https:'],
          'connect-src': ["'self'"],
          'frame-ancestors': ["'self'"],
          'object-src': ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // CORS restrito à própria origem pública; fora de desenvolvimento sem
  // PUBLIC_URL nenhuma origem cruzada é aceita.
  const PUBLIC_ORIGIN = (process.env.PUBLIC_URL || '').replace(/\/+$/, '');
  if (PUBLIC_ORIGIN) app.use(cors({ origin: PUBLIC_ORIGIN, credentials: true }));
  else if (IS_DEV) app.use(cors({ origin: true, credentials: true }));
  else app.use(cors({ origin: false }));

  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  // ------------------------------------------------------------ Health (SELECT 1)
  const healthHandler = async (req, res) => {
    let database = 'ok';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      database = 'unavailable';
      console.error('[Sentinela] Health: banco indisponível:', err?.message || err);
    }
    const ok = database === 'ok';
    res.status(ok ? 200 : 503).json({
      status: ok ? 'UP' : 'DEGRADED',
      app: 'sentinela',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      database,
    });
  };
  app.get(['/health.json', '/health', '/api/health'], healthHandler);

  // ------------------------------------------------------------ API
  app.use('/api', apiLimiter);
  app.use('/api/auth', authRoutes);
  app.use('/api', autenticarApi);

  app.post('/api/seed', async (req, res) => {
    if (!IS_DEV) return res.status(403).json({ error: 'Seed disponível apenas em desenvolvimento.' });
    try {
      await seedDatabase();
      res.json({ ok: true, message: 'Banco de dados populado com sucesso' });
    } catch (err) {
      console.error('[Sentinela] Erro no seed:', err);
      res.status(500).json({ error: 'Falha ao executar seed. Veja o log do servidor.' });
    }
  });

  app.use('/api/users', usersRoutes);
  app.use('/api/configs', configsRoutes);
  app.use('/api/integracoes', integracoesRoutes);
  app.use('/api', dadosRoutes);

  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Rota não encontrada.' });
  });

  // ------------------------------------------------------------ Estáticos + SPA
  app.use(express.static(DIST_DIR, { index: false }));
  // Express 5: curinga nomeado (`'*'` solto derrubava o servidor no boot).
  app.get('/*splat', (req, res) => {
    const indexPath = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
    return res.status(404).type('text/plain; charset=utf-8').send('Sentinela: arquivos de produção não encontrados. Execute npm run build primeiro.');
  });

  // ------------------------------------------------------------ Erros
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido no corpo da requisição.' });
    if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'Corpo da requisição muito grande.' });
    console.error('[Sentinela] Erro não tratado:', err?.stack || err);
    if (res.headersSent) return;
    res.status(500).json({ error: 'Erro interno. Tente novamente ou avise o administrador.' });
  });

  return app;
}
