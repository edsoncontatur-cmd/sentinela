// Expurgo de incidentes por prazo de retenção (LGPD — achado S4).
//
// Os incidentes guardam o corpo bruto de e-mails de terceiros. Este módulo
// apaga, uma vez por dia, os incidentes criados há mais de RETENTION_DAYS dias
// (padrão 365). A modelagem em si (rawBody, burnoutIndex, avaliação nominal) é
// decisão de produto e não foi alterada.
const UM_DIA_MS = 24 * 60 * 60 * 1000;

export function diasRetencao(env = process.env) {
  const n = parseInt(String(env.RETENTION_DAYS ?? '365'), 10);
  return Number.isFinite(n) && n > 0 ? n : 365;
}

export function dataLimite(dias, agora = new Date()) {
  return new Date(agora.getTime() - dias * UM_DIA_MS);
}

export async function expurgarIncidentes(prisma, dias = diasRetencao(), agora = new Date()) {
  const limite = dataLimite(dias, agora);
  const resultado = await prisma.incident.deleteMany({ where: { createdAt: { lt: limite } } });
  return { apagados: resultado.count, limite, dias };
}

export function iniciarExpurgoPeriodico(prisma, log = console) {
  const executar = async () => {
    try {
      const r = await expurgarIncidentes(prisma);
      if (r.apagados > 0) {
        log.log(`[Sentinela] Expurgo LGPD: ${r.apagados} incidente(s) com mais de ${r.dias} dias apagado(s).`);
      }
    } catch (err) {
      log.error('[Sentinela] Expurgo LGPD falhou (banco indisponível?):', err?.message || err);
    }
  };
  const inicial = setTimeout(executar, 15_000);
  const periodico = setInterval(executar, UM_DIA_MS);
  inicial.unref?.();
  periodico.unref?.();
  return () => {
    clearTimeout(inicial);
    clearInterval(periodico);
  };
}
