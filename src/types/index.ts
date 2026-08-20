export type TenantId = 'contatur_sp' | 'contatur_rj' | 'mkp_sp';

export interface Tenant {
  id: TenantId;
  name: string;
  shortName: string;
  city: string;
  uf: string;
  cnpj: string;
  activeMailboxesCount: number;
  monthlyRevenueTotal: number; // Faturamento total da carteira em R$
  activeClientsCount?: number;
}

export type DepartmentType = 'FISCAL' | 'FOLHA' | 'CONTABIL' | 'LEGAL' | 'FINANCEIRO' | 'DIRETORIA' | 'GERAL';

export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentStatus = 'NOVO' | 'EM_TRATAMENTO' | 'AGUARDANDO_CLIENTE' | 'RESOLVIDO' | 'ARQUIVADO';

export type EmailProviderType = 'm365' | 'google_workspace' | 'imap';

export type AIProviderType = 'gemini' | 'openai' | 'claude' | 'azure_openai' | 'ollama';

export type CommercialOpportunityType = 
  | 'ABERTURA_FILIAL' 
  | 'AUMENTO_QUADRO_FOLHA' 
  | 'BPO_FINANCEIRO' 
  | 'CONSULTORIA_TRIBUTARIA' 
  | 'RECUPERACAO_CREDITOS' 
  | 'HOLDING_PATRIMONIAL';

export interface SgcServiceCatalogItem {
  code: string;
  name: string;
  department: DepartmentType;
  basePrice: number;
  description: string;
}

export interface SgcProposalResponse {
  success: boolean;
  proposalId: string;
  proposalCode: string;
  proposalUrl: string;
  status: 'RASCUNHO' | 'ENVIADA' | 'ASSINADA' | 'DECLINADA';
  createdAt: string;
}

export interface CommercialLead {
  id: string;
  tenantId: TenantId;
  clientName: string;
  clientCnpj: string;
  opportunityType: CommercialOpportunityType;
  title: string;
  detectedTextSnippet: string;
  estimatedMonthlyValue: number; // Valor estimado do novo honorário em R$
  confidenceScore: number; // 0 a 100%
  aiProposalDraft: string; // Minuta de proposta comercial gerada pela IA
  status: 'NOVO' | 'EM_PROPOSTA' | 'CONTRATADO' | 'DECLINADO';
  detectedAt: string;
  
  // Integração com o SGC (Sistema de Gestão de Contratos e Propostas)
  sgcProposalId?: string;
  sgcProposalCode?: string;
  sgcProposalUrl?: string;
  sgcStatus?: 'RASCUNHO' | 'ENVIADA' | 'ASSINADA' | 'DECLINADA';
  sgcSyncedAt?: string;
}

export interface QualityAuditRecord {
  id: string;
  tenantId: TenantId;
  incidentId: string;
  analystName: string;
  analystEmail: string;
  department: DepartmentType;
  clientEmail: string;
  replyTextAudited: string;
  toneClassification: 'Excelente / Empático' | 'Adequado' | 'Frio / Distante' | 'Ríspido / Inadequado';
  qualityScore: number; // 0 a 100
  aiFeedback: string;
  flaggedPhrases: string[];
  auditedAt: string;
}

export interface AttachmentAnalysis {
  fileName: string;
  type: 'PRINT_OCR' | 'AUDIO_TRANSCRIPTION' | 'PDF_EXTRACT';
  extractedText: string;
  confidenceScore: number;
}

export interface FiscalDeadlineAlert {
  obligationName: string; // ex: 'DCTFWeb', 'EFD-Reinf', 'DAS', 'FGTS Digital'
  dueDate: string;
  daysRemaining: number;
  isUrgentPromotion: boolean;
}

// ----------------------------------------------------
// NOVIDADES: CIRCULARES MENSAIS MULTISSETORIAIS & APROVAÇÃO POR IA
// ----------------------------------------------------
export type CircularSectionStatus = 'PENDENTE_APROVACAO' | 'APROVADO' | 'REJEITADO_AJUSTAR';

export interface CircularSectionItem {
  id: string;
  department: 'FOLHA' | 'FISCAL' | 'CONTABIL' | 'LEGAL';
  departmentLabel: string;
  supervisorName: string;
  supervisorEmail: string;
  title: string;
  summary: string;
  fullBodyText: string;
  actionableRecommendation: string;
  status: CircularSectionStatus;
  rejectionFeedback?: string; // Comentários do supervisor para a IA refazer
  versionNumber: number;
  lastAiRegeneratedAt?: string;
  approvedAt?: string;
}

export interface MonthlyBroadcastCircular {
  id: string;
  tenantId: TenantId;
  editionMonth: string; // ex: '2026-08'
  title: string;
  targetAudienceProfile: 'Turismo, Hotelaria & Eventos' | 'Indústria, Comércio Geral & Logística';
  overallStatus: 'EM_ELABORACAO' | 'AGUARDANDO_SUPERVISORES' | '100%_APROVADO_PRONTO' | 'DISPARADO_EM_LOTE';
  scheduledDispatchDate: string;
  sections: {
    folha: CircularSectionItem;
    fiscal: CircularSectionItem;
    contabil: CircularSectionItem;
    legal: CircularSectionItem;
  };
  totalRecipientsCount: number;
  dispatchedAt?: string;
  createdAt: string;
}

// ----------------------------------------------------
// NOVIDADES: MATRIZ DE WORKLOAD & BURNOUT DA EQUIPE
// ----------------------------------------------------
export interface TeamWorkloadMember {
  id: string;
  tenantId: TenantId;
  analystName: string;
  analystEmail: string;
  department: DepartmentType;
  activeAssignedClientsCount: number;
  emailsReceivedThisMonth: number;
  averageResponseTimeHours: number;
  burnoutRiskLevel: 'BAIXO' | 'MODERADO' | 'ALTO' | 'CRITICO_SOBRECARGA';
  isOverloaded: boolean;
  rebalancingRecommendation?: string; // Sugestão da IA para redistribuir clientes
}

// ----------------------------------------------------
// NOVIDADES: DIAGNÓSTICO POR DEPARTAMENTO
// ----------------------------------------------------
export interface DepartmentMetric {
  department: DepartmentType;
  departmentLabel: string;
  avgResponseTimeHours: number;
  csatAverageRating: number; // 1 a 5
  totalIncidentsResolved: number;
  complaintsRate: number; // %
  praisesCount: number;
  slaComplianceRate: number; // %
}

// ----------------------------------------------------
// NOVIDADES: PREDITOR DE CHURN & PLAYBOOK DE RESGATE
// ----------------------------------------------------
export interface ChurnPlaybookAction {
  order: number;
  title: string;
  description: string;
  deadlineHours: number;
  responsibleRole: string;
}

export interface ChurnPrediction {
  churnProbabilityPercent: number; // 0 a 100%
  riskLevel: 'BAIXO' | 'MEDIO' | 'ALTO' | 'IMINENTE';
  topRiskFactors: string[];
  prescriptivePlaybook: ChurnPlaybookAction[];
}

// ----------------------------------------------------
// NOVIDADES: INTEGRAÇÃO COM CONTATUR MEETING
// ----------------------------------------------------
export interface MeetingSchedulePayload {
  tenantId: TenantId;
  clientId: string;
  clientName: string;
  clientCnpj: string;
  subject: string;
  proposedDate: string; // ISO
  location: string; // ex: 'Sala Diretoria SP' ou 'Microsoft Teams'
  participantsEmails: string[];
  executiveBriefingHtml: string; // Injeção do Dossiê 360° na ata/pauta
  originSystem: 'Contatur-Sentinel';
}

export interface MeetingScheduleResponse {
  success: boolean;
  meetingId: string;
  meetingNumberStr: string;
  meetingUrl: string;
  scheduledAt: string;
}

// ----------------------------------------------------
// NOVIDADES: DOSSIÊ JURÍDICO DE DEFESA (LEGAL SHIELD)
// ----------------------------------------------------
export interface LegalEvidenceItem {
  timestamp: string;
  type: 'ENVIO_GUIA' | 'ALERTA_VENCIMENTO' | 'RESPOSTA_CLIENTE' | 'CONFIRMACAO_LEITURA';
  description: string;
  proofHash: string; // Hash SHA-256 da mensagem/anexo
}

export interface LegalShieldDossier {
  protocolNumber: string;
  tenantId: TenantId;
  clientName: string;
  clientCnpj: string;
  obligationOrMatter: string;
  generatedAt: string;
  integritySealSha256: string;
  evidences: LegalEvidenceItem[];
  legalSummary: string;
}

// Matriz de permissões detalhada por tela e recurso
export interface ScreenPermissions {
  dashboard: {
    view: boolean;
    viewAllUnits: boolean; // exclusivo superadmin
    filterDepartment: boolean;
  };
  incidents: {
    view: boolean;
    viewOnlyOwn: boolean;
    viewOnlyDepartment: boolean;
    changeStatus: boolean;
    assignUser: boolean;
    deleteOrArchive: boolean;
    useAiCopilot: boolean;
    sendDirectReply: boolean;
    sendPostServiceTouchpoint: boolean;
  };
  commercialOpportunities: {
    view: boolean;
    createProposal: boolean;
    changeStatus: boolean;
  };
  monthlyBroadcasts: {
    view: boolean;
    approveSection: boolean;
    requestAiAdjustment: boolean;
    dispatchToClients: boolean;
  };
  teamWorkload: {
    view: boolean;
    applyRebalancing: boolean;
  };
  departmentDiagnosis: {
    view: boolean;
  };
  qualityAudit: {
    view: boolean;
    exportAuditReport: boolean;
  };
  unitBenchmark: {
    view: boolean;
  };
  clientRadar: {
    view: boolean;
    editHealthScore: boolean;
    addRelationshipNote: boolean;
    scheduleMeeting: boolean;
  };
  mailboxes: {
    view: boolean;
    toggleActive: boolean;
    triggerSync: boolean;
  };
  settings: {
    view: boolean;
    editEmailProvider: boolean;
    editAiProvider: boolean;
    editAlertChannels: boolean;
    editSlaAndRules: boolean;
    editFiscalRules: boolean;
    editBroadcastRules: boolean;
    editMeetingIntegration: boolean;
  };
  users: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    managePermissions: boolean;
  };
  reports: {
    view: boolean;
    exportPdf: boolean;
    exportExcel: boolean;
  };
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: ScreenPermissions;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  tenantId: TenantId | 'all'; // 'all' exclusivo para SuperAdmin Edson
  department: DepartmentType;
  isActive: boolean;
  isSuperAdmin?: boolean;
  avatarUrl?: string;
  phone?: string;
  password?: string;
  permissions: ScreenPermissions;
  createdAt: string;
  lastLoginAt?: string;
}

export interface MonitoredMailbox {
  id: string;
  tenantId: TenantId;
  emailAddress: string;
  displayName: string;
  department: DepartmentType;
  isActive: boolean;
  provider: EmailProviderType;
  totalEmailsReceived: number;
  totalIncidentsFound: number;
  lastSyncAt: string;
  status: 'sincronizando' | 'ativo' | 'pausado' | 'erro_autenticacao';
  errorDetails?: string;
}

export interface HighlightedPhrase {
  text: string;
  reason: string;
  impact: 'severo' | 'moderado' | 'leve';
}

export interface IncidentTimelineEvent {
  id: string;
  type: 'criacao' | 'atribuicao' | 'status_mudou' | 'minuta_gerada' | 'resposta_enviada' | 'contato_telefonico' | 'nota_interna' | 'touchpoint_pos_atendimento';
  authorName: string;
  description: string;
  timestamp: string;
}

export interface SupervisorMediation {
  supervisorName: string;
  supervisorEmail: string;
  welcomeEmailSentAt?: string;
  welcomeEmailBody?: string;
  statusUpdateEmailSentAt?: string;
  statusUpdateBody?: string;
  csatEmailSentAt?: string;
  csatRating?: number; // 1 a 5 estrelas
  csatComment?: string;
  csatRespondedAt?: string;
}

export interface Incident {
  id: string;
  tenantId: TenantId;
  mailboxId: string;
  mailboxEmail: string;
  messageId: string;
  
  // Dados do E-mail
  senderName: string;
  senderEmail: string;
  senderType: 'CLIENTE' | 'FORNECEDOR' | 'DESCONHECIDO';
  recipientEmail: string;
  subject: string;
  emailBodyText: string;
  receivedAt: string;
  
  // Inovação: Anexos Processados (OCR e Áudios)
  attachments?: AttachmentAnalysis[];
  
  // Inovação: Cruzamento com Calendário Fiscal
  fiscalAlert?: FiscalDeadlineAlert;
  
  // Análise da Inteligência Artificial
  sentimentScore: number; // -1.0 a +1.0
  severity: IncidentSeverity;
  category: DepartmentType;
  aiSummary: string;
  riskReasoning: string;
  highlightedPhrases: HighlightedPhrase[];
  suggestedReply: string;
  suggestedActionPlan: string[];
  churnRiskScore: number; // 0 a 100%
  
  // Inovação de Mediação Supervisor ↔ Cliente
  supervisorMediation?: SupervisorMediation;
  
  // Inovação: Touchpoint Pós-Atendimento
  postServiceTouchpointScheduled?: boolean;
  postServiceTouchpointDraft?: string;
  postServiceTouchpointSentAt?: string;

  // Gestão do Incidente
  status: IncidentStatus;
  assignedToUserId?: string;
  assignedToUserName?: string;
  slaDeadline: string;
  isSlaViolated: boolean;
  resolvedAt?: string;
  resolutionNotes?: string;
  history: IncidentTimelineEvent[];
}

export interface ClientEntity {
  id: string;
  tenantId: TenantId;
  name: string;
  cnpjCpf: string;
  type: 'CLIENTE' | 'FORNECEDOR';
  contactEmails: string[];
  primaryDepartment: DepartmentType;
  
  // Honorário Mensal em R$
  monthlyFee: number;
  curveABC: 'A' | 'B' | 'C'; // Classificação financeira
  
  healthScore: number; // 0 (crítico) a 100 (excelente)
  statusRelacionamento: 'Excelente' | 'Estável' | 'Em Risco' | 'Crítico';
  
  // Ghosting Alert / Frieza Relacional
  ghostingStatus: 'NORMAL' | 'ATENCAO_QUEDA_INTERACAO' | 'CRITICO_GHOSTING';
  interactionDropPercentage: number; // ex: 75% de queda de mensagens
  lastEmailReceivedDate: string;
  
  // Preditor de Churn & Playbook
  churnForecast?: ChurnPrediction;
  
  // Integração com Contatur Meeting
  lastMeetingDate?: string;
  lastMeetingSubject?: string;
  lastMeetingProtocol?: string;
  
  totalIncidentsCount: number;
  criticalIncidentsCount: number;
  lastIncidentDate?: string;
  notes: string[];
}

export interface TenantConfig {
  tenantId: TenantId;
  
  // Provedor de E-mail
  email: {
    provider: EmailProviderType;
    m365: {
      tenantId: string;
      clientId: string;
      clientSecret: string;
      adminEmail: string;
    };
    googleWorkspace: {
      adminEmail: string;
      serviceAccountJson: string;
      delegatedSubject: string;
    };
    imap: {
      host: string;
      port: number;
      useSsl: boolean;
      user: string;
      pass: string;
    };
    syncIntervalMinutes: number;
    monitorBoardOfDirectors: boolean; // Configuração se caixas da diretoria/sócios são monitoradas
    lastTestedAt?: string;
    connectionStatus: 'conectado' | 'desconectado' | 'erro';
  };
  
  // Motor de Inteligência Artificial
  ai: {
    provider: AIProviderType;
    apiKey: string;
    model: string;
    temperature: number;
    customEndpoint?: string;
    systemPrompt: string;
    minConfidenceScore: number;
    enableCommercialDetection: boolean;
    enableQualityAuditing: boolean;
    enableOcrAndAudioTranscription: boolean;
    lastTestedAt?: string;
  };
  
  // Canais de Alerta
  alertChannels: {
    emailNotifications: {
      enabled: boolean;
      destinationEmails: string[];
      sendOnCritical: boolean;
      sendOnHigh: boolean;
      sendOnCommercialLead: boolean;
    };
    msTeams: {
      enabled: boolean;
      webhookUrl: string;
      sendOnCritical: boolean;
      sendOnHigh: boolean;
      sendOnCommercialLead: boolean;
    };
    whatsapp: {
      enabled: boolean;
      apiEndpoint: string;
      apiToken: string;
      destinationNumbers: string[];
      sendOnCritical: boolean;
      sendOnHigh: boolean;
    };
    discord: {
      enabled: boolean;
      webhookUrl: string;
      sendOnCritical: boolean;
    };
    telegram: {
      enabled: boolean;
      botToken: string;
      chatId: string;
      sendOnCritical: boolean;
    };
  };
  
  // Régua de Mediação Supervisor ↔ Cliente
  supervisorWorkflow: {
    enabled: boolean;
    autoSendWelcomeEmail: boolean;
    welcomeEmailTemplate: string;
    statusUpdateTemplate: string;
    csatEmailTemplate: string;
    escalateToDirectorHours: number;
  };

  // Integração com o SGC (Sistema de Gestão de Contratos e Serviços Extras)
  sgcIntegration: {
    enabled: boolean;
    baseUrl: string;
    apiToken: string;
    autoPushLeads: boolean;
    lastTestedAt?: string;
    connectionStatus: 'conectado' | 'desconectado' | 'erro';
  };

  // Integração com Contatur Meeting (Reuniões de Diretoria & Pautas)
  meetingIntegration: {
    enabled: boolean;
    baseUrl: string;
    apiToken: string;
    autoInjectDossierInAgenda: boolean;
    defaultMeetingLocation: string;
    lastTestedAt?: string;
    connectionStatus: 'conectado' | 'desconectado' | 'erro';
  };

  // Gestão de Circulares Mensais Multissetoriais
  monthlyBroadcastSettings: {
    enabled: boolean;
    targetAudienceProfile: 'Turismo, Hotelaria & Eventos' | 'Indústria, Comércio Geral & Logística';
    dispatchDayOfMonth: number; // ex: 25
    autoDispatchWhenAllApproved: boolean;
    supervisors: {
      folha: { name: string; email: string };
      fiscal: { name: string; email: string };
      contabil: { name: string; email: string };
      legal: { name: string; email: string };
    };
    approvalRequestEmailTemplate: string;
  };

  // Regras de SLA, Calendário Fiscal e Filtros
  slaAndRules: {
    slaHoursCritical: number;
    slaHoursHigh: number;
    slaHoursMedium: number;
    slaHoursLow: number;
    autoPromoteNearFiscalDeadline: boolean;
    touchpointDelayHours: number;
    blacklistKeywords: string[];
    priorityKeywords: string[];
    autoIgnoreSpamAndNewsletters: boolean;
  };
}
