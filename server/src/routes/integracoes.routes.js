// Proxy das integrações SGC e Contatur Meeting (achados S7/S8).
//
// O navegador nunca vê o token: o servidor lê a URL base da configuração do
// escritório, valida o destino (lib/destino.js), decifra o token e chama o
// sistema externo. Erros reais são devolvidos como erro — nunca um protocolo
// inventado (modelo: ReuniãoDiretoria/server/src/sgc-proxy.js).
import express from 'express';
import { obterConfigDecifrada } from './configs.routes.js';
import { validarDestino, DestinoInvalidoError } from '../lib/destino.js';
import { SgcProposalSchema, MeetingScheduleSchema, validar } from '../lib/validation.js';
import { tenantEscrita, MENSAGEM_TENANT_OBRIGATORIO } from '../lib/escopo.js';
import { integracoesLimiter } from '../middleware/rateLimit.js';
import { requirePermission } from '../middleware/auth.js';

const router = express.Router();
router.use(integracoesLimiter);

const TIMEOUT_MS = 10_000;
const SGC_URL_PADRAO = 'https://sgc.grupocontaturmkp.com.br/api/external/v1';
const MEETING_URL_PADRAO = 'https://meeting.grupocontaturmkp.com.br/api/external/v1';

const INTEGRACOES = {
  sgc: { bloco: 'sgcIntegration', segredo: 'sgcApiToken', nome: 'SGC', urlPadrao: SGC_URL_PADRAO },
  meeting: { bloco: 'meetingIntegration', segredo: 'meetingApiToken', nome: 'Contatur Meeting', urlPadrao: MEETING_URL_PADRAO },
};

class IntegracaoError extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

async function prepararIntegracao(req, tipo) {
  const def = INTEGRACOES[tipo];
  const tenantId = tenantEscrita(req, req.body?.tenantId || req.query?.tenantId);
  if (!tenantId) throw new IntegracaoError(400, MENSAGEM_TENANT_OBRIGATORIO);

  const registro = await obterConfigDecifrada(tenantId);
  const bloco = registro?.config?.[def.bloco];
  const cfg = bloco && typeof bloco === 'object' ? bloco : {};
  if (cfg.enabled === false) {
    throw new IntegracaoError(400, `A integração com o ${def.nome} está desativada nas configurações deste escritório.`);
  }
  const token = registro?.segredos?.[def.segredo];
  if (!token) {
    throw new IntegracaoError(
      400,
      `Token do ${def.nome} não configurado para este escritório. Cadastre-o em Configurações (fica cifrado no servidor).`,
    );
  }
  let base;
  try {
    base = validarDestino(cfg.baseUrl || def.urlPadrao);
  } catch (err) {
    if (err instanceof DestinoInvalidoError) throw new IntegracaoError(400, `${def.nome}: ${err.message}`);
    throw err;
  }
  return { tenantId, base, token, nome: def.nome };
}

async function chamar({ base, token, nome }, caminho, { method = 'GET', body } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(`${base}${caminho}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      redirect: 'error',
    });
    let dados = null;
    const texto = await resp.text();
    if (texto) {
      try {
        dados = JSON.parse(texto);
      } catch {
        dados = null;
      }
    }
    return { status: resp.status, ok: resp.ok, dados };
  } catch (err) {
    const timeout = err?.name === 'AbortError';
    console.error(`[Sentinela] ${nome}: falha de rede em ${caminho}:`, err?.message || err);
    throw new IntegracaoError(502, timeout ? `Tempo esgotado ao chamar o ${nome}.` : `Não foi possível conectar ao ${nome}.`);
  } finally {
    clearTimeout(timer);
  }
}

function responderErro(res, err, nome) {
  if (err instanceof IntegracaoError) return res.status(err.status).json({ ok: false, error: err.message });
  console.error(`[Sentinela] ${nome}: erro inesperado:`, err?.message || err);
  return res.status(500).json({ ok: false, error: `Falha interna ao chamar o ${nome}.` });
}

// ------------------------------------------------------------------ SGC
router.post('/sgc/testar', async (req, res) => {
  try {
    const ctx = await prepararIntegracao(req, 'sgc');
    const inicio = Date.now();
    const r = await chamar(ctx, `/servicos-extras/catalogo?tenantId=${encodeURIComponent(ctx.tenantId)}`);
    const latencyMs = Date.now() - inicio;
    if (!r.ok) {
      return res.status(502).json({ ok: false, error: `SGC respondeu HTTP ${r.status}. Verifique a URL e o token.`, latencyMs });
    }
    return res.json({ ok: true, message: `Conexão com o SGC validada (${new URL(ctx.base).host}).`, latencyMs });
  } catch (err) {
    return responderErro(res, err, 'SGC');
  }
});

router.get('/sgc/catalogo', async (req, res) => {
  try {
    const ctx = await prepararIntegracao(req, 'sgc');
    const r = await chamar(ctx, `/servicos-extras/catalogo?tenantId=${encodeURIComponent(ctx.tenantId)}`);
    if (!r.ok) return res.status(502).json({ ok: false, error: `SGC respondeu HTTP ${r.status}.` });
    return res.json({ ok: true, data: Array.isArray(r.dados) ? r.dados : r.dados?.data ?? [] });
  } catch (err) {
    return responderErro(res, err, 'SGC');
  }
});

router.post(
  '/sgc/propostas',
  requirePermission('commercialOpportunities', 'createProposal'),
  validar(SgcProposalSchema),
  async (req, res) => {
    try {
      const ctx = await prepararIntegracao(req, 'sgc');
      const { tenantId: _ignorado, ...payload } = req.validado;
      const r = await chamar(ctx, '/propostas', {
        method: 'POST',
        body: { ...payload, tenantId: ctx.tenantId, originSystem: 'Contatur-Sentinel' },
      });
      if (!r.ok) {
        return res.status(502).json({ ok: false, error: `SGC recusou a proposta (HTTP ${r.status}).` });
      }
      const d = r.dados && typeof r.dados === 'object' ? r.dados.data ?? r.dados : {};
      const proposalId = d.id || d.proposalId;
      const proposalCode = d.code || d.proposalCode || d.numero;
      if (!proposalId && !proposalCode) {
        console.error('[Sentinela] SGC: resposta sem id/código de proposta:', JSON.stringify(r.dados).slice(0, 500));
        return res.status(502).json({ ok: false, error: 'O SGC não devolveu o protocolo da proposta.' });
      }
      return res.json({
        ok: true,
        data: {
          proposalId: String(proposalId || proposalCode),
          proposalCode: String(proposalCode || proposalId),
          proposalUrl: typeof d.url === 'string' ? d.url : null,
          status: typeof d.status === 'string' ? d.status : 'RASCUNHO',
        },
      });
    } catch (err) {
      return responderErro(res, err, 'SGC');
    }
  },
);

router.get('/sgc/propostas/:id/status', async (req, res) => {
  const id = String(req.params.id || '');
  if (!/^[A-Za-z0-9_\-:.]{1,80}$/.test(id)) return res.status(400).json({ ok: false, error: 'Identificador inválido.' });
  try {
    const ctx = await prepararIntegracao(req, 'sgc');
    const r = await chamar(ctx, `/propostas/${encodeURIComponent(id)}/status`);
    if (!r.ok) return res.status(502).json({ ok: false, error: `SGC respondeu HTTP ${r.status}.` });
    return res.json({ ok: true, data: r.dados?.data ?? r.dados ?? null });
  } catch (err) {
    return responderErro(res, err, 'SGC');
  }
});

// ------------------------------------------------------------------ Meeting
router.post('/meeting/testar', async (req, res) => {
  try {
    const ctx = await prepararIntegracao(req, 'meeting');
    const inicio = Date.now();
    const r = await chamar(ctx, '/health');
    const latencyMs = Date.now() - inicio;
    if (!r.ok) {
      return res.status(502).json({ ok: false, error: `Contatur Meeting respondeu HTTP ${r.status}. Verifique a URL e o token.`, latencyMs });
    }
    return res.json({ ok: true, message: `Conexão com o Contatur Meeting validada (${new URL(ctx.base).host}).`, latencyMs });
  } catch (err) {
    return responderErro(res, err, 'Contatur Meeting');
  }
});

router.post(
  '/meeting/reunioes',
  requirePermission('clientRadar', 'scheduleMeeting'),
  validar(MeetingScheduleSchema),
  async (req, res) => {
    try {
      const ctx = await prepararIntegracao(req, 'meeting');
      const { tenantId: _ignorado, ...payload } = req.validado;
      const r = await chamar(ctx, '/reunioes', {
        method: 'POST',
        body: { ...payload, tenantId: ctx.tenantId, originSystem: 'Contatur-Sentinel' },
      });
      if (!r.ok) {
        return res.status(502).json({ ok: false, error: `Contatur Meeting recusou o agendamento (HTTP ${r.status}).` });
      }
      const d = r.dados && typeof r.dados === 'object' ? r.dados.data ?? r.dados : {};
      const meetingId = d.id || d.meetingId;
      if (!meetingId) {
        console.error('[Sentinela] Meeting: resposta sem id de reunião:', JSON.stringify(r.dados).slice(0, 500));
        return res.status(502).json({ ok: false, error: 'O Contatur Meeting não devolveu o protocolo da reunião.' });
      }
      return res.json({
        ok: true,
        data: {
          meetingId: String(meetingId),
          meetingNumberStr: String(d.numeroStr || d.meetingNumberStr || meetingId),
          meetingUrl: typeof d.url === 'string' ? d.url : null,
        },
      });
    } catch (err) {
      return responderErro(res, err, 'Contatur Meeting');
    }
  },
);

export default router;
