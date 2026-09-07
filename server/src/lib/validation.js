// Validação de entrada (Zod) por rota, com allowlist de campos (`.strict()`):
// qualquer chave fora da lista é rejeitada com 400. Antes o servidor passava
// `req.body` inteiro para o Prisma (mass assignment).
import { z } from 'zod';

export const ESCRITORIOS = ['contatur_sp', 'contatur_rio', 'mkp_sp'];
export const ROLE_IDS = ['role_superadmin', 'role_unit_admin', 'role_supervisor', 'role_analyst'];
export const DEPARTAMENTOS = ['FISCAL', 'FOLHA', 'DP', 'CONTABIL', 'LEGAL', 'FINANCEIRO', 'DIRETORIA', 'ATENDIMENTO', 'GERAL'];

// Nomes dos segredos aceitos em `secrets` (cifrados no servidor).
export const SECRET_KEYS = [
  'm365ClientSecret',
  'googleServiceAccountJson',
  'imapPass',
  'aiApiKey',
  'msTeamsWebhookUrl',
  'whatsappApiToken',
  'discordWebhookUrl',
  'telegramBotToken',
  'sgcApiToken',
  'meetingApiToken',
];

// Campos que NUNCA podem ser gravados dentro dos blocos JSON de configuração
// (só entram via `secrets`, cifrados).
export const CAMPOS_SECRETOS = ['apiToken', 'clientSecret', 'pass', 'apiKey', 'botToken', 'serviceAccountJson', 'webhookUrl', 'password', 'senha'];

const texto = (max = 200) => z.string().trim().max(max);
const textoObrigatorio = (max = 200) => z.string().trim().min(1, 'obrigatório').max(max);
const email = z.string().trim().toLowerCase().email('e-mail inválido').max(200);
const dataIso = z.string().datetime({ offset: true });
const horaHHMM = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'hora no formato HH:MM');

export const TenantIdSchema = z.enum(ESCRITORIOS);

const objetoJson = (maxBytes = 200_000) =>
  z
    .record(z.string(), z.unknown())
    .refine((o) => JSON.stringify(o).length <= maxBytes, { message: `objeto muito grande (máx. ${maxBytes} bytes)` });

const arrayJson = (maxBytes = 200_000) =>
  z
    .array(z.unknown())
    .refine((a) => JSON.stringify(a).length <= maxBytes, { message: `lista muito grande (máx. ${maxBytes} bytes)` });

export const PermissionsSchema = z.record(z.string().max(60), z.record(z.string().max(60), z.boolean()));

// ---------------------------------------------------------------- Autenticação
export const LoginSchema = z
  .object({
    email,
    senha: z.string().min(1).max(200).optional(),
    password: z.string().min(1).max(200).optional(),
  })
  .strict()
  .refine((d) => Boolean(d.senha || d.password), { message: 'Informe a senha.' });

export const BootstrapSchema = z
  .object({
    bootstrapSecret: z.string().min(16).max(500),
    nome: textoObrigatorio(120).default('Administrador'),
    email,
    senha: z.string().min(8, 'mínimo 8 caracteres').max(200),
    tenantId: TenantIdSchema.default('contatur_sp'),
  })
  .strict();

// ---------------------------------------------------------------- Usuários
const senhaNova = z.string().min(8, 'mínimo 8 caracteres').max(200);

export const UserCreateSchema = z
  .object({
    name: textoObrigatorio(120),
    email,
    senha: senhaNova,
    role: z.enum(ROLE_IDS).default('role_analyst'),
    department: z.enum(DEPARTAMENTOS).default('GERAL'),
    tenantId: TenantIdSchema.optional(),
    permissions: PermissionsSchema.optional(),
    isActive: z.boolean().optional(),
    isSuperAdmin: z.boolean().optional(),
    phone: texto(30).optional(),
    avatarUrl: z.string().trim().url().max(500).optional(),
  })
  .strict();

export const UserUpdateSchema = z
  .object({
    name: textoObrigatorio(120).optional(),
    email: email.optional(),
    senha: senhaNova.optional(),
    role: z.enum(ROLE_IDS).optional(),
    department: z.enum(DEPARTAMENTOS).optional(),
    tenantId: TenantIdSchema.optional(),
    permissions: PermissionsSchema.optional(),
    isActive: z.boolean().optional(),
    isSuperAdmin: z.boolean().optional(),
    phone: texto(30).nullable().optional(),
    avatarUrl: z.string().trim().url().max(500).nullable().optional(),
  })
  .strict();

// ---------------------------------------------------------------- Caixas postais
export const MailboxCreateSchema = z
  .object({
    tenantId: TenantIdSchema.optional(),
    name: textoObrigatorio(120),
    email,
    department: z.enum(DEPARTAMENTOS).default('GERAL'),
    protocol: z.enum(['GRAPH_API', 'IMAP', 'EXCHANGE']).default('GRAPH_API'),
    host: texto(200).optional(),
    port: z.number().int().min(1).max(65535).optional(),
    active: z.boolean().optional(),
    syncIntervalMin: z.number().int().min(1).max(1440).optional(),
  })
  .strict();

// ---------------------------------------------------------------- Incidentes
const urgencia = z.enum(['BAIXA', 'MEDIA', 'ALTA', 'CRITICA']);
const sentimento = z.enum(['POSITIVO', 'NEUTRO', 'INSATISFEITO', 'RANCOROSO_CRITICO']);
const statusIncidente = z.enum(['NOVO', 'EM_ANALISE', 'RESPOSTA_RASCUNHO', 'RESPONDIDO', 'RESOLVIDO', 'IGNORADO']);

export const IncidentCreateSchema = z
  .object({
    tenantId: TenantIdSchema.optional(),
    code: textoObrigatorio(40),
    clientName: textoObrigatorio(200),
    clientCnpj: texto(20).optional(),
    senderEmail: email,
    recipientMailbox: textoObrigatorio(200),
    department: z.enum(DEPARTAMENTOS).optional(),
    subject: textoObrigatorio(500),
    rawBody: z.string().max(200_000),
    summary: z.string().max(10_000),
    suggestedAction: z.string().max(10_000).optional(),
    suggestedResponseDraft: z.string().max(20_000).optional(),
    urgency: urgencia.optional(),
    sentiment: sentimento.optional(),
    status: statusIncidente.optional(),
    resolutionNotes: z.string().max(10_000).optional(),
    assignedTo: texto(120).optional(),
    postServiceTouchpointScheduled: z.boolean().optional(),
    supervisorMediation: objetoJson(20_000).optional(),
    history: arrayJson(100_000).optional(),
  })
  .strict();

export const IncidentPatchSchema = z
  .object({
    summary: z.string().max(10_000).optional(),
    suggestedAction: z.string().max(10_000).nullable().optional(),
    suggestedResponseDraft: z.string().max(20_000).nullable().optional(),
    urgency: urgencia.optional(),
    sentiment: sentimento.optional(),
    status: statusIncidente.optional(),
    department: z.enum(DEPARTAMENTOS).optional(),
    resolutionNotes: z.string().max(10_000).nullable().optional(),
    assignedTo: texto(120).nullable().optional(),
    postServiceTouchpointScheduled: z.boolean().optional(),
    postServiceTouchpointSentAt: dataIso.nullable().optional(),
    resolvedAt: dataIso.nullable().optional(),
    supervisorMediation: objetoJson(20_000).nullable().optional(),
    history: arrayJson(100_000).optional(),
  })
  .strict();

// ---------------------------------------------------------------- Clientes (Radar)
export const ClientCreateSchema = z
  .object({
    tenantId: TenantIdSchema.optional(),
    name: textoObrigatorio(200),
    cnpj: textoObrigatorio(20),
    curveABC: z.enum(['A', 'B', 'C']).optional(),
    monthlyFee: z.number().min(0).optional(),
    healthScore: z.number().int().min(0).max(100).optional(),
    ghostingStatus: z.enum(['NORMAL', 'ALERTA_SILENCIO', 'CRITICO_GHOSTING']).optional(),
    interactionDropPercentage: z.number().min(0).max(100).optional(),
    statusRelacionamento: z.enum(['Excelente', 'Estável', 'Em Risco', 'Crítico']).optional(),
    contactEmails: z.array(email).max(50).optional(),
    notes: arrayJson(50_000).optional(),
    churnForecast: objetoJson(20_000).optional(),
    totalIncidentsCount: z.number().int().min(0).optional(),
    criticalIncidentsCount: z.number().int().min(0).optional(),
  })
  .strict();

// ---------------------------------------------------------------- Leads
export const LeadCreateSchema = z
  .object({
    tenantId: TenantIdSchema.optional(),
    clientName: textoObrigatorio(200),
    contactEmail: email,
    detectedNeed: z.string().max(10_000),
    estimatedValue: z.number().min(0).optional(),
    confidenceScore: z.number().min(0).max(1).optional(),
    sourceEmailSubject: textoObrigatorio(500),
    status: z.enum(['NOVO', 'CONTATADO', 'PROPOSTA_ENVIADA', 'GANHO', 'PERDIDO']).optional(),
    assignedTo: texto(120).optional(),
  })
  .strict();

// ---------------------------------------------------------------- Auditoria de qualidade
export const AuditCreateSchema = z
  .object({
    tenantId: TenantIdSchema.optional(),
    incidentCode: textoObrigatorio(40),
    analystName: textoObrigatorio(120),
    department: z.enum(DEPARTAMENTOS),
    emailSubject: textoObrigatorio(500),
    auditScore: z.number().int().min(0).max(100).optional(),
    status: z.enum(['CONFORME', 'ALERTA_POSTURA', 'NAO_CONFORME_GRAVE']).optional(),
    positivePoints: z.array(z.string().max(500)).max(50).optional(),
    improvementAreas: z.array(z.string().max(500)).max(50).optional(),
    feedback: z.string().max(10_000),
  })
  .strict();

// ---------------------------------------------------------------- Circulares mensais
const statusCircular = z.enum(['EM_ELABORACAO_IA', 'AGUARDANDO_SUPERVISORES', '100%_APROVADO_PRONTO', 'DISPARADO_EM_LOTE']);

export const BroadcastCreateSchema = z
  .object({
    tenantId: TenantIdSchema.optional(),
    referenceMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'formato AAAA-MM'),
    overallStatus: statusCircular.optional(),
    sections: objetoJson(200_000),
    dispatchedAt: dataIso.nullable().optional(),
  })
  .strict();

export const BroadcastPatchSchema = z
  .object({
    overallStatus: statusCircular.optional(),
    sections: objetoJson(200_000).optional(),
    dispatchedAt: dataIso.nullable().optional(),
  })
  .strict();

// ---------------------------------------------------------------- Configuração por escritório
export const TenantConfigPutSchema = z
  .object({
    aiSensitivity: z.enum(['BAIXA', 'MODERADA', 'ALTA']).optional(),
    quietHoursStart: horaHHMM.optional(),
    quietHoursEnd: horaHHMM.optional(),
    enableAutoDraft: z.boolean().optional(),
    notifyOnCriticalSentiment: z.boolean().optional(),
    sgcIntegration: objetoJson(20_000).optional(),
    meetingIntegration: objetoJson(20_000).optional(),
    supervisorWorkflow: objetoJson(50_000).optional(),
    monthlyBroadcastSettings: objetoJson(50_000).optional(),
    settings: objetoJson(200_000).optional(),
    // Só os segredos que o usuário digitou de novo. String vazia = manter o atual.
    secrets: z.record(z.enum(SECRET_KEYS), z.string().max(8_000)).optional(),
  })
  .strict();

// Remove recursivamente campos com nome de segredo de um objeto JSON de
// configuração (defesa em profundidade: mesmo que a tela mande, não grava).
export function removerCamposSecretos(valor) {
  if (Array.isArray(valor)) return valor.map(removerCamposSecretos);
  if (valor && typeof valor === 'object') {
    const saida = {};
    for (const [k, v] of Object.entries(valor)) {
      if (CAMPOS_SECRETOS.includes(k)) continue;
      saida[k] = removerCamposSecretos(v);
    }
    return saida;
  }
  return valor;
}

// ---------------------------------------------------------------- Integrações (proxy)
export const SgcProposalSchema = z
  .object({
    tenantId: TenantIdSchema.optional(),
    clientCnpj: textoObrigatorio(20),
    clientName: textoObrigatorio(200),
    serviceCode: textoObrigatorio(60),
    suggestedMonthlyFee: z.number().min(0),
    aiContextSnippet: z.string().max(4_000).default(''),
  })
  .strict();

export const MeetingScheduleSchema = z
  .object({
    tenantId: TenantIdSchema.optional(),
    clientId: textoObrigatorio(80),
    clientName: textoObrigatorio(200),
    clientCnpj: texto(20).default(''),
    subject: textoObrigatorio(300),
    proposedDate: dataIso,
    location: texto(200).default(''),
    participantsEmails: z.array(email).max(50).default([]),
    executiveBriefingHtml: z.string().max(50_000).default(''),
  })
  .strict();

// ---------------------------------------------------------------- Middleware
export function formatarErros(zodError) {
  return zodError.issues.slice(0, 20).map((i) => ({
    campo: i.path.join('.') || '(raiz)',
    mensagem: i.message,
  }));
}

export function validar(schema, origem = 'body') {
  return (req, res, next) => {
    const resultado = schema.safeParse(req[origem] ?? {});
    if (!resultado.success) {
      return res.status(400).json({
        error: 'Dados inválidos. Verifique os campos informados.',
        campos: formatarErros(resultado.error),
      });
    }
    req.validado = resultado.data;
    return next();
  };
}
