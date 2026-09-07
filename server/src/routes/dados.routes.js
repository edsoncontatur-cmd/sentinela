// Rotas de dados por escritório (tenants, caixas, incidentes, clientes, leads,
// auditorias, circulares, carga de equipe). Achados S5 (allowlist Zod por
// rota), S10 (erro neutro + log) e S4 (DELETE de incidente).
import express from 'express';
import prisma from '../db.js';
import {
  MailboxCreateSchema,
  IncidentCreateSchema,
  IncidentPatchSchema,
  ClientCreateSchema,
  LeadCreateSchema,
  AuditCreateSchema,
  BroadcastCreateSchema,
  BroadcastPatchSchema,
  validar,
} from '../lib/validation.js';
import { filtroLeitura, filtroPorId, tenantEscrita, MENSAGEM_TENANT_OBRIGATORIO } from '../lib/escopo.js';
import { requirePermission } from '../middleware/auth.js';

const router = express.Router();

function erroInterno(res, contexto, err) {
  console.error(`[Sentinela] ${contexto}:`, err?.message || err);
  return res.status(500).json({ error: 'Não foi possível concluir a operação. Tente novamente ou avise o administrador.' });
}

// Separa o tenantId validado do corpo e resolve o escritório efetivo.
function dadosParaCriar(req, res) {
  const { tenantId: doCorpo, ...dados } = req.validado;
  const tenantId = tenantEscrita(req, doCorpo);
  if (!tenantId) {
    res.status(400).json({ error: MENSAGEM_TENANT_OBRIGATORIO });
    return null;
  }
  return { ...dados, tenantId };
}

// ------------------------------------------------------------------ Tenants
router.get('/tenants', async (req, res) => {
  try {
    const fixo = req.escopo?.tenantId;
    const tenants = await prisma.tenant.findMany({ where: fixo ? { id: fixo } : {}, orderBy: { name: 'asc' } });
    res.json(tenants);
  } catch (err) {
    return erroInterno(res, 'Falha ao buscar tenants', err);
  }
});

// ------------------------------------------------------------------ Caixas postais
router.get('/mailboxes', requirePermission('mailboxes', 'view'), async (req, res) => {
  try {
    res.json(await prisma.monitoredMailbox.findMany({ where: filtroLeitura(req), orderBy: { name: 'asc' } }));
  } catch (err) {
    return erroInterno(res, 'Falha ao buscar caixas de e-mail', err);
  }
});

router.post('/mailboxes', requirePermission('mailboxes', 'toggleActive'), validar(MailboxCreateSchema), async (req, res) => {
  const data = dadosParaCriar(req, res);
  if (!data) return;
  try {
    res.status(201).json(await prisma.monitoredMailbox.create({ data }));
  } catch (err) {
    return erroInterno(res, 'Falha ao criar caixa de e-mail', err);
  }
});

// ------------------------------------------------------------------ Incidentes
router.get('/incidents', requirePermission('incidents', 'view'), async (req, res) => {
  try {
    res.json(await prisma.incident.findMany({ where: filtroLeitura(req), orderBy: { createdAt: 'desc' } }));
  } catch (err) {
    return erroInterno(res, 'Falha ao buscar incidentes', err);
  }
});

router.post('/incidents', requirePermission('incidents', 'view'), validar(IncidentCreateSchema), async (req, res) => {
  const data = dadosParaCriar(req, res);
  if (!data) return;
  try {
    res.status(201).json(await prisma.incident.create({ data }));
  } catch (err) {
    if (err?.code === 'P2002') return res.status(409).json({ error: 'Já existe um incidente com este código.' });
    return erroInterno(res, 'Falha ao criar incidente', err);
  }
});

router.patch('/incidents/:id', requirePermission('incidents', 'changeStatus'), validar(IncidentPatchSchema), async (req, res) => {
  const id = String(req.params.id);
  try {
    const alterados = await prisma.incident.updateMany({ where: filtroPorId(req, id), data: req.validado });
    if (alterados.count === 0) return res.status(404).json({ error: 'Incidente não encontrado neste escritório.' });
    res.json(await prisma.incident.findUnique({ where: { id } }));
  } catch (err) {
    return erroInterno(res, 'Falha ao atualizar incidente', err);
  }
});

router.delete('/incidents/:id', requirePermission('incidents', 'deleteOrArchive'), async (req, res) => {
  const id = String(req.params.id);
  try {
    const apagados = await prisma.incident.deleteMany({ where: filtroPorId(req, id) });
    if (apagados.count === 0) return res.status(404).json({ error: 'Incidente não encontrado neste escritório.' });
    res.json({ success: true });
  } catch (err) {
    return erroInterno(res, 'Falha ao excluir incidente', err);
  }
});

// ------------------------------------------------------------------ Clientes (Radar)
router.get('/clients', requirePermission('clientRadar', 'view'), async (req, res) => {
  try {
    res.json(await prisma.clientEntity.findMany({ where: filtroLeitura(req), orderBy: { healthScore: 'asc' } }));
  } catch (err) {
    return erroInterno(res, 'Falha ao buscar clientes', err);
  }
});

router.post('/clients', requirePermission('clientRadar', 'editHealthScore'), validar(ClientCreateSchema), async (req, res) => {
  const data = dadosParaCriar(req, res);
  if (!data) return;
  try {
    res.status(201).json(await prisma.clientEntity.create({ data }));
  } catch (err) {
    if (err?.code === 'P2002') return res.status(409).json({ error: 'Já existe um cliente com este CNPJ neste escritório.' });
    return erroInterno(res, 'Falha ao salvar cliente', err);
  }
});

// ------------------------------------------------------------------ Leads
router.get('/commercial-leads', requirePermission('commercialOpportunities', 'view'), async (req, res) => {
  try {
    res.json(await prisma.commercialLead.findMany({ where: filtroLeitura(req), orderBy: { createdAt: 'desc' } }));
  } catch (err) {
    return erroInterno(res, 'Falha ao buscar leads', err);
  }
});

router.post('/commercial-leads', requirePermission('commercialOpportunities', 'changeStatus'), validar(LeadCreateSchema), async (req, res) => {
  const data = dadosParaCriar(req, res);
  if (!data) return;
  try {
    res.status(201).json(await prisma.commercialLead.create({ data }));
  } catch (err) {
    return erroInterno(res, 'Falha ao criar lead', err);
  }
});

// ------------------------------------------------------------------ Auditoria de qualidade
router.get('/quality-audits', requirePermission('qualityAudit', 'view'), async (req, res) => {
  try {
    res.json(await prisma.qualityAuditRecord.findMany({ where: filtroLeitura(req), orderBy: { createdAt: 'desc' } }));
  } catch (err) {
    return erroInterno(res, 'Falha ao buscar auditorias', err);
  }
});

router.post('/quality-audits', requirePermission('qualityAudit', 'view'), validar(AuditCreateSchema), async (req, res) => {
  const data = dadosParaCriar(req, res);
  if (!data) return;
  try {
    res.status(201).json(await prisma.qualityAuditRecord.create({ data }));
  } catch (err) {
    return erroInterno(res, 'Falha ao criar auditoria', err);
  }
});

// ------------------------------------------------------------------ Circulares mensais
router.get('/monthly-broadcasts', requirePermission('monthlyBroadcasts', 'view'), async (req, res) => {
  try {
    res.json(await prisma.monthlyBroadcastCircular.findMany({ where: filtroLeitura(req), orderBy: { referenceMonth: 'desc' } }));
  } catch (err) {
    return erroInterno(res, 'Falha ao buscar circulares', err);
  }
});

router.post('/monthly-broadcasts', requirePermission('monthlyBroadcasts', 'approveSection'), validar(BroadcastCreateSchema), async (req, res) => {
  const data = dadosParaCriar(req, res);
  if (!data) return;
  try {
    res.status(201).json(await prisma.monthlyBroadcastCircular.create({ data }));
  } catch (err) {
    if (err?.code === 'P2002') return res.status(409).json({ error: 'Já existe uma circular para este mês neste escritório.' });
    return erroInterno(res, 'Falha ao criar circular', err);
  }
});

router.patch('/monthly-broadcasts/:id', requirePermission('monthlyBroadcasts', 'approveSection'), validar(BroadcastPatchSchema), async (req, res) => {
  const id = String(req.params.id);
  try {
    const alterados = await prisma.monthlyBroadcastCircular.updateMany({ where: filtroPorId(req, id), data: req.validado });
    if (alterados.count === 0) return res.status(404).json({ error: 'Circular não encontrada neste escritório.' });
    res.json(await prisma.monthlyBroadcastCircular.findUnique({ where: { id } }));
  } catch (err) {
    return erroInterno(res, 'Falha ao atualizar circular', err);
  }
});

// ------------------------------------------------------------------ Carga de trabalho
router.get('/team-workload', requirePermission('teamWorkload', 'view'), async (req, res) => {
  try {
    res.json(await prisma.teamWorkloadMember.findMany({ where: filtroLeitura(req), orderBy: { burnoutIndex: 'desc' } }));
  } catch (err) {
    return erroInterno(res, 'Falha ao buscar equipe', err);
  }
});

export default router;
