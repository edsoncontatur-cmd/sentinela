// Escopo de escritório (tenant) da requisição.
//
// `req.escopo` é definido pelo middleware de autenticação de /api:
//   { tipo: 'usuario',        tenantId: <do usuário> | null (SuperAdmin), superAdmin }
//   { tipo: 'escritorio',     tenantId: <do token de serviço> }
//   { tipo: 'global_leitura', tenantId: <validado na query> }
//   { tipo: 'desenvolvimento', tenantId: null }   (só NODE_ENV=development sem auth)
//
// O escritório efetivo NUNCA vem do corpo do cliente quando o escopo já o fixa.
import { ESCRITORIOS } from './validation.js';

export { ESCRITORIOS };

function tenantSolicitado(req) {
  return String(req.query?.tenantId || req.headers['x-tenant-id'] || '').trim();
}

export function podeVerTodos(req) {
  return Boolean(req.escopo?.superAdmin) || req.escopo?.tipo === 'desenvolvimento';
}

// Filtro Prisma para leituras.
export function filtroLeitura(req) {
  const fixo = req.escopo?.tenantId;
  if (fixo) return { tenantId: fixo };
  const solicitado = tenantSolicitado(req);
  if (ESCRITORIOS.includes(solicitado)) return { tenantId: solicitado };
  // SuperAdmin / desenvolvimento sem tenant explícito: visão consolidada.
  return {};
}

// Escritório para gravação. Retorna null quando não é possível determinar
// (SuperAdmin sem informar o escritório) — o chamador responde 400.
export function tenantEscrita(req, tenantDoCorpo) {
  const fixo = req.escopo?.tenantId;
  if (fixo) return fixo;
  const candidato = String(tenantDoCorpo || tenantSolicitado(req) || '').trim();
  if (ESCRITORIOS.includes(candidato)) return candidato;
  return null;
}

// Impede que uma escrita por id alcance registro de outro escritório.
export function filtroPorId(req, id) {
  const fixo = req.escopo?.tenantId;
  return fixo ? { id, tenantId: fixo } : { id };
}

export const MENSAGEM_TENANT_OBRIGATORIO =
  'Informe o escritório (tenantId: contatur_sp, contatur_rio ou mkp_sp) para gravar.';
