// Entrypoint de produção (`node server/src/index.js`). A montagem do app está
// em ./app.js; aqui só lemos o ambiente, subimos o servidor e agendamos o
// expurgo LGPD de incidentes (RETENTION_DAYS, padrão 365).
import prisma from './db.js';
import { createApp, avisosDeConfiguracao, IS_PROD } from './app.js';
import { iniciarExpurgoPeriodico, diasRetencao } from './lib/retencao.js';

const PORT = Number(process.env.PORT) || 4016;

avisosDeConfiguracao();

const app = createApp();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Sentinela] Servidor iniciado na porta ${PORT} (http://localhost:${PORT})`);
  console.log(`[Sentinela] Expurgo LGPD de incidentes: ${diasRetencao()} dias (RETENTION_DAYS).`);
  if (IS_PROD && !process.env.DATABASE_URL) {
    console.error('[Sentinela] ATENÇÃO: DATABASE_URL não configurada — /api/health responderá 503.');
  }
});

iniciarExpurgoPeriodico(prisma);
