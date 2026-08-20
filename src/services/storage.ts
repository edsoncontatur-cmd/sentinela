import {
  Tenant,
  User,
  UserRole,
  MonitoredMailbox,
  Incident,
  ClientEntity,
  TenantConfig,
  TenantId,
  IncidentStatus,
  CommercialLead,
  QualityAuditRecord,
  MonthlyBroadcastCircular,
  TeamWorkloadMember,
  DepartmentMetric,
} from '../types';
import {
  INITIAL_TENANTS,
  INITIAL_USERS,
  DEFAULT_ROLES,
  INITIAL_MAILBOXES,
  INITIAL_INCIDENTS,
  INITIAL_CLIENTS,
  INITIAL_TENANT_CONFIGS,
  INITIAL_COMMERCIAL_LEADS,
  INITIAL_QUALITY_AUDITS,
  INITIAL_MONTHLY_BROADCASTS,
  INITIAL_TEAM_WORKLOAD,
  INITIAL_DEPARTMENT_METRICS,
} from './mockData';

const STORAGE_KEYS = {
  TENANTS: 'contatur_sentinel_tenants',
  USERS: 'contatur_sentinel_users',
  ROLES: 'contatur_sentinel_roles',
  MAILBOXES: 'contatur_sentinel_mailboxes',
  INCIDENTS: 'contatur_sentinel_incidents',
  CLIENTS: 'contatur_sentinel_clients',
  CONFIGS: 'contatur_sentinel_configs',
  COMMERCIAL_LEADS: 'contatur_sentinel_commercial_leads',
  QUALITY_AUDITS: 'contatur_sentinel_quality_audits',
  MONTHLY_BROADCASTS: 'contatur_sentinel_monthly_broadcasts',
  TEAM_WORKLOAD: 'contatur_sentinel_team_workload',
  ACTIVE_TENANT: 'contatur_sentinel_active_tenant',
  CURRENT_USER: 'contatur_sentinel_current_user',
};

// Inicializador de dados no LocalStorage
export function initializeStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.TENANTS)) {
    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(INITIAL_TENANTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ROLES)) {
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(DEFAULT_ROLES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MAILBOXES)) {
    localStorage.setItem(STORAGE_KEYS.MAILBOXES, JSON.stringify(INITIAL_MAILBOXES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.INCIDENTS)) {
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(INITIAL_INCIDENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONFIGS)) {
    localStorage.setItem(STORAGE_KEYS.CONFIGS, JSON.stringify(INITIAL_TENANT_CONFIGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMMERCIAL_LEADS)) {
    localStorage.setItem(STORAGE_KEYS.COMMERCIAL_LEADS, JSON.stringify(INITIAL_COMMERCIAL_LEADS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.QUALITY_AUDITS)) {
    localStorage.setItem(STORAGE_KEYS.QUALITY_AUDITS, JSON.stringify(INITIAL_QUALITY_AUDITS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MONTHLY_BROADCASTS)) {
    localStorage.setItem(STORAGE_KEYS.MONTHLY_BROADCASTS, JSON.stringify(INITIAL_MONTHLY_BROADCASTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TEAM_WORKLOAD)) {
    localStorage.setItem(STORAGE_KEYS.TEAM_WORKLOAD, JSON.stringify(INITIAL_TEAM_WORKLOAD));
  }
}

// Helpers de Tenants
export function getTenants(): Tenant[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.TENANTS);
  let tenants: Tenant[] = data ? JSON.parse(data) : INITIAL_TENANTS;

  // Sanitização / Migração de Schema para evitar crash de propriedades financeiras novas
  tenants = tenants.map((t) => {
    const initialMatch = INITIAL_TENANTS.find((it) => it.id === t.id);
    return {
      ...t,
      monthlyRevenueTotal: t.monthlyRevenueTotal ?? initialMatch?.monthlyRevenueTotal ?? 150000.0,
      activeClientsCount: t.activeClientsCount ?? initialMatch?.activeClientsCount ?? 120,
    };
  });

  return tenants;
}

// Helpers de Usuários
export function getUsers(): User[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : INITIAL_USERS;
}

export function saveUser(user: User): void {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function deleteUser(userId: string): void {
  const users = getUsers().filter((u) => u.id !== userId);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function getRoles(): UserRole[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.ROLES);
  return data ? JSON.parse(data) : DEFAULT_ROLES;
}

// Helpers de Caixas Monitoradas
export function getMailboxes(tenantId?: TenantId | 'all'): MonitoredMailbox[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.MAILBOXES);
  const mailboxes: MonitoredMailbox[] = data ? JSON.parse(data) : INITIAL_MAILBOXES;
  if (!tenantId || tenantId === 'all') return mailboxes;
  return mailboxes.filter((m) => m.tenantId === tenantId);
}

export function saveMailbox(mailbox: MonitoredMailbox): void {
  const mailboxes = getMailboxes('all');
  const index = mailboxes.findIndex((m) => m.id === mailbox.id);
  if (index >= 0) {
    mailboxes[index] = mailbox;
  } else {
    mailboxes.push(mailbox);
  }
  localStorage.setItem(STORAGE_KEYS.MAILBOXES, JSON.stringify(mailboxes));
}

// Helpers de Incidentes
export function getIncidents(tenantId?: TenantId | 'all'): Incident[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
  const incidents: Incident[] = data ? JSON.parse(data) : INITIAL_INCIDENTS;
  if (!tenantId || tenantId === 'all') return incidents;
  return incidents.filter((inc) => inc.tenantId === tenantId);
}

export function saveIncident(incident: Incident): void {
  const incidents = getIncidents('all');
  const index = incidents.findIndex((i) => i.id === incident.id);
  if (index >= 0) {
    incidents[index] = incident;
  } else {
    incidents.unshift(incident);
  }
  localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
}

export function updateIncidentStatus(
  incidentId: string, 
  status: IncidentStatus, 
  userName: string,
  resolutionNotes?: string
): void {
  const incidents = getIncidents('all');
  const incident = incidents.find((i) => i.id === incidentId);
  if (incident) {
    incident.status = status;
    if (status === 'RESOLVIDO') {
      incident.resolvedAt = new Date().toISOString();
      incident.postServiceTouchpointScheduled = true;
      if (resolutionNotes) incident.resolutionNotes = resolutionNotes;
    }
    incident.history.push({
      id: 'hist_' + Date.now(),
      type: 'status_mudou',
      authorName: userName,
      description: `Status alterado para ${status}${resolutionNotes ? ': ' + resolutionNotes : ''}`,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
  }
}

export function sendTouchpoint(incidentId: string, authorName: string): void {
  const incidents = getIncidents('all');
  const incident = incidents.find((i) => i.id === incidentId);
  if (incident) {
    incident.postServiceTouchpointSentAt = new Date().toISOString();
    incident.history.push({
      id: 'hist_touch_' + Date.now(),
      type: 'touchpoint_pos_atendimento',
      authorName,
      description: '✉️ Touchpoint de pós-atendimento e retenção transmitido com sucesso ao cliente.',
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
  }
}

// Mediação Supervisor ↔ Cliente
export function sendSupervisorWelcomeEmail(
  incidentId: string,
  supervisorName: string,
  supervisorEmail: string,
  customBody?: string
): void {
  const incidents = getIncidents('all');
  const incident = incidents.find((i) => i.id === incidentId);
  if (incident) {
    if (!incident.supervisorMediation) {
      incident.supervisorMediation = { supervisorName, supervisorEmail };
    }
    incident.supervisorMediation.supervisorName = supervisorName;
    incident.supervisorMediation.supervisorEmail = supervisorEmail;
    incident.supervisorMediation.welcomeEmailSentAt = new Date().toISOString();
    if (customBody) incident.supervisorMediation.welcomeEmailBody = customBody;

    incident.history.push({
      id: 'hist_sup_' + Date.now(),
      type: 'resposta_enviada',
      authorName: supervisorName,
      description: `✉️ E-mail oficial de acolhimento e assunção do caso transmitido ao cliente pelo Supervisor (${supervisorName}).`,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
  }
}

export function sendSupervisorStatusUpdate(
  incidentId: string,
  supervisorName: string,
  updateText: string
): void {
  const incidents = getIncidents('all');
  const incident = incidents.find((i) => i.id === incidentId);
  if (incident) {
    if (!incident.supervisorMediation) {
      incident.supervisorMediation = { supervisorName, supervisorEmail: 'supervisor@contatur.com.br' };
    }
    incident.supervisorMediation.statusUpdateEmailSentAt = new Date().toISOString();
    incident.supervisorMediation.statusUpdateBody = updateText;

    incident.history.push({
      id: 'hist_upd_' + Date.now(),
      type: 'status_mudou',
      authorName: supervisorName,
      description: `📢 Atualização de andamento transmitida ao cliente por e-mail: "${updateText}"`,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
  }
}

export function recordCsatRating(
  incidentId: string,
  rating: number,
  comment?: string
): void {
  const incidents = getIncidents('all');
  const incident = incidents.find((i) => i.id === incidentId);
  if (incident) {
    if (!incident.supervisorMediation) {
      incident.supervisorMediation = { supervisorName: 'Supervisão', supervisorEmail: 'supervisao@contatur.com.br' };
    }
    incident.supervisorMediation.csatRating = rating;
    incident.supervisorMediation.csatComment = comment;
    incident.supervisorMediation.csatRespondedAt = new Date().toISOString();

    incident.history.push({
      id: 'hist_csat_' + Date.now(),
      type: 'status_mudou',
      authorName: 'Pesquisa CSAT (Cliente)',
      description: `⭐ O cliente respondeu à pesquisa de satisfação com nota ${rating}/5 estrelas${comment ? ': "' + comment + '"' : ''}.`,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));

    // Atualizar o Health Score do cliente no Radar
    const clients = getClients('all');
    const client = clients.find((c) => c.contactEmails.includes(incident.senderEmail) || c.tenantId === incident.tenantId);
    if (client) {
      if (rating >= 4) {
        client.healthScore = Math.min(100, client.healthScore + 15);
        client.statusRelacionamento = client.healthScore >= 70 ? 'Estável' : client.statusRelacionamento;
      } else if (rating <= 2) {
        client.healthScore = Math.max(10, client.healthScore - 15);
      }
      saveClient(client);
    }
  }
}

// Helpers de Oportunidades Comerciais
export function getCommercialLeads(tenantId?: TenantId | 'all'): CommercialLead[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.COMMERCIAL_LEADS);
  const leads: CommercialLead[] = data ? JSON.parse(data) : INITIAL_COMMERCIAL_LEADS;
  if (!tenantId || tenantId === 'all') return leads;
  return leads.filter((l) => l.tenantId === tenantId);
}

export function saveCommercialLead(lead: CommercialLead): void {
  const leads = getCommercialLeads('all');
  const index = leads.findIndex((l) => l.id === lead.id);
  if (index >= 0) {
    leads[index] = lead;
  } else {
    leads.unshift(lead);
  }
  localStorage.setItem(STORAGE_KEYS.COMMERCIAL_LEADS, JSON.stringify(leads));
}

// Helpers de Auditoria de Qualidade
export function getQualityAudits(tenantId?: TenantId | 'all'): QualityAuditRecord[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.QUALITY_AUDITS);
  const audits: QualityAuditRecord[] = data ? JSON.parse(data) : INITIAL_QUALITY_AUDITS;
  if (!tenantId || tenantId === 'all') return audits;
  return audits.filter((a) => a.tenantId === tenantId);
}

export function saveQualityAudit(audit: QualityAuditRecord): void {
  const audits = getQualityAudits('all');
  const index = audits.findIndex((a) => a.id === audit.id);
  if (index >= 0) {
    audits[index] = audit;
  } else {
    audits.unshift(audit);
  }
  localStorage.setItem(STORAGE_KEYS.QUALITY_AUDITS, JSON.stringify(audits));
}

// ----------------------------------------------------
// NOVIDADES: CIRCULARES MENSAIS MULTISSETORIAIS
// ----------------------------------------------------
export function getMonthlyBroadcasts(tenantId?: TenantId | 'all'): MonthlyBroadcastCircular[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.MONTHLY_BROADCASTS);
  const broadcasts: MonthlyBroadcastCircular[] = data ? JSON.parse(data) : INITIAL_MONTHLY_BROADCASTS;
  if (!tenantId || tenantId === 'all') return broadcasts;
  return broadcasts.filter((b) => b.tenantId === tenantId);
}

export function saveMonthlyBroadcast(broadcast: MonthlyBroadcastCircular): void {
  const broadcasts = getMonthlyBroadcasts('all');
  const index = broadcasts.findIndex((b) => b.id === broadcast.id);
  if (index >= 0) {
    broadcasts[index] = broadcast;
  } else {
    broadcasts.unshift(broadcast);
  }
  localStorage.setItem(STORAGE_KEYS.MONTHLY_BROADCASTS, JSON.stringify(broadcasts));
}

export function approveCircularSection(
  circularId: string,
  departmentKey: 'folha' | 'fiscal' | 'contabil' | 'legal',
  supervisorName: string
): void {
  const broadcasts = getMonthlyBroadcasts('all');
  const broadcast = broadcasts.find((b) => b.id === circularId);
  if (broadcast) {
    const sec = broadcast.sections[departmentKey];
    sec.status = 'APROVADO';
    sec.approvedAt = new Date().toISOString();
    sec.supervisorName = supervisorName;

    // Verificar se todas as 4 seções foram aprovadas
    const allApproved =
      broadcast.sections.folha.status === 'APROVADO' &&
      broadcast.sections.fiscal.status === 'APROVADO' &&
      broadcast.sections.contabil.status === 'APROVADO' &&
      broadcast.sections.legal.status === 'APROVADO';

    if (allApproved) {
      broadcast.overallStatus = '100%_APROVADO_PRONTO';
    }

    saveMonthlyBroadcast(broadcast);
  }
}

export function rejectAndRegenerateSectionWithAI(
  circularId: string,
  departmentKey: 'folha' | 'fiscal' | 'contabil' | 'legal',
  supervisorName: string,
  feedback: string
): void {
  const broadcasts = getMonthlyBroadcasts('all');
  const broadcast = broadcasts.find((b) => b.id === circularId);
  if (broadcast) {
    const sec = broadcast.sections[departmentKey];
    sec.status = 'REJEITADO_AJUSTAR';
    sec.rejectionFeedback = feedback;
    sec.versionNumber += 1;
    sec.lastAiRegeneratedAt = new Date().toISOString();

    // A IA gera uma nova versão adaptada com base no feedback
    sec.title = `[Revisão IA v${sec.versionNumber}] ` + sec.title.replace(/^\[Revisão IA v\d+\]\s*/, '');
    sec.fullBodyText = `[Nova Redação Ajustada por IA com base na orientação: "${feedback}"]\n\n` + sec.fullBodyText;
    sec.status = 'PENDENTE_APROVACAO'; // Volta para a mesa do supervisor

    broadcast.overallStatus = 'AGUARDANDO_SUPERVISORES';
    saveMonthlyBroadcast(broadcast);
  }
}

export function dispatchMonthlyBroadcastToClients(circularId: string): void {
  const broadcasts = getMonthlyBroadcasts('all');
  const broadcast = broadcasts.find((b) => b.id === circularId);
  if (broadcast) {
    broadcast.overallStatus = 'DISPARADO_EM_LOTE';
    broadcast.dispatchedAt = new Date().toISOString();
    saveMonthlyBroadcast(broadcast);
  }
}

// ----------------------------------------------------
// NOVIDADES: CARGA DE TRABALHO & BURNOUT DA EQUIPE
// ----------------------------------------------------
export function getTeamWorkload(tenantId?: TenantId | 'all'): TeamWorkloadMember[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.TEAM_WORKLOAD);
  const workload: TeamWorkloadMember[] = data ? JSON.parse(data) : INITIAL_TEAM_WORKLOAD;
  if (!tenantId || tenantId === 'all') return workload;
  return workload.filter((w) => w.tenantId === tenantId);
}

export function saveTeamWorkload(members: TeamWorkloadMember[]): void {
  localStorage.setItem(STORAGE_KEYS.TEAM_WORKLOAD, JSON.stringify(members));
}

// ----------------------------------------------------
// NOVIDADES: DIAGNÓSTICO POR DEPARTAMENTO
// ----------------------------------------------------
export function getDepartmentMetrics(tenantId: TenantId | 'all'): DepartmentMetric[] {
  const effectiveTenant: TenantId = tenantId === 'all' ? 'contatur_sp' : tenantId;
  return INITIAL_DEPARTMENT_METRICS[effectiveTenant] || INITIAL_DEPARTMENT_METRICS['contatur_sp'];
}

// Helpers de Clientes & Fornecedores (Radar)
export function getClients(tenantId?: TenantId | 'all'): ClientEntity[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
  let clients: ClientEntity[] = data ? JSON.parse(data) : INITIAL_CLIENTS;

  // Sanitização / Migração de Schema para evitar crash de propriedades novas
  clients = clients.map((c) => {
    const initialMatch = INITIAL_CLIENTS.find((ic) => ic.id === c.id);
    const health = c.healthScore ?? initialMatch?.healthScore ?? 80;
    
    // Cálculo Preditivo de Churn Inteligente
    const churnProb = Math.max(5, Math.min(95, 100 - health + (c.ghostingStatus === 'CRITICO_GHOSTING' ? 30 : 0)));
    const riskLvl: 'BAIXO' | 'MEDIO' | 'ALTO' | 'IMINENTE' = 
      churnProb >= 75 ? 'IMINENTE' : churnProb >= 50 ? 'ALTO' : churnProb >= 25 ? 'MEDIO' : 'BAIXO';

    return {
      ...c,
      monthlyFee: c.monthlyFee ?? initialMatch?.monthlyFee ?? 5000.0,
      curveABC: c.curveABC ?? initialMatch?.curveABC ?? 'B',
      ghostingStatus: c.ghostingStatus ?? initialMatch?.ghostingStatus ?? 'NORMAL',
      interactionDropPercentage: c.interactionDropPercentage ?? initialMatch?.interactionDropPercentage ?? 0,
      healthScore: health,
      statusRelacionamento: c.statusRelacionamento ?? initialMatch?.statusRelacionamento ?? 'Estável',
      churnForecast: c.churnForecast ?? {
        churnProbabilityPercent: churnProb,
        riskLevel: riskLvl,
        topRiskFactors: [
          c.ghostingStatus === 'CRITICO_GHOSTING' ? 'Silêncio relacional prolongado (> 21 dias sem e-mails)' : 'Atritos em obrigações fiscais recentes',
          c.healthScore < 50 ? 'Notas de CSAT insatisfatórias no último trimestre' : 'Volume de chamados fora do padrão',
          'Risco financeiro elevado por faixa de honorários',
        ],
        prescriptivePlaybook: [
          {
            order: 1,
            title: 'Ligação Executiva de Cortesia da Diretoria',
            description: 'Agendar call ou visita presencial pelo Contatur Meeting em até 48h.',
            deadlineHours: 48,
            responsibleRole: 'Sócio / Diretor de Relacionamento',
          },
          {
            order: 2,
            title: 'Diagnóstico Preventivo de Enquadramento Fiscal',
            description: 'Oferecer revisão gratuita de benefícios tributários (PERSE/ICMS-ST) para encantar o cliente.',
            deadlineHours: 72,
            responsibleRole: 'Supervisão Fiscal',
          },
          {
            order: 3,
            title: 'Designação de Analista Sênior Titular',
            description: 'Trocar o ponto focal de atendimento para restabelecer a confiança operacional.',
            deadlineHours: 24,
            responsibleRole: 'Gerência Operacional',
          },
        ],
      },
      totalIncidentsCount: c.totalIncidentsCount ?? initialMatch?.totalIncidentsCount ?? 0,
      criticalIncidentsCount: c.criticalIncidentsCount ?? initialMatch?.criticalIncidentsCount ?? 0,
      contactEmails: c.contactEmails ?? initialMatch?.contactEmails ?? [],
      notes: c.notes ?? initialMatch?.notes ?? [],
    };
  });

  if (!tenantId || tenantId === 'all') return clients;
  return clients.filter((c) => c.tenantId === tenantId);
}

export function saveClient(client: ClientEntity): void {
  const clients = getClients('all');
  const index = clients.findIndex((c) => c.id === client.id);
  if (index >= 0) {
    clients[index] = client;
  } else {
    clients.push(client);
  }
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
}

// Helpers de Configurações
export function getTenantConfig(tenantId: TenantId): TenantConfig {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.CONFIGS);
  const configs: Record<TenantId, TenantConfig> = data ? JSON.parse(data) : INITIAL_TENANT_CONFIGS;
  const config = configs[tenantId] || INITIAL_TENANT_CONFIGS[tenantId] || INITIAL_TENANT_CONFIGS['contatur_sp'];
  const initial = INITIAL_TENANT_CONFIGS[tenantId] || INITIAL_TENANT_CONFIGS['contatur_sp'];

  // Sanitização profunda para garantir que novos blocos nunca quebrem
  return {
    ...config,
    meetingIntegration: config.meetingIntegration ?? initial.meetingIntegration,
    monthlyBroadcastSettings: config.monthlyBroadcastSettings ?? initial.monthlyBroadcastSettings,
    sgcIntegration: config.sgcIntegration ?? initial.sgcIntegration,
    supervisorWorkflow: config.supervisorWorkflow ?? initial.supervisorWorkflow,
  };
}

export function saveTenantConfig(config: TenantConfig): void {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.CONFIGS);
  const configs: Record<TenantId, TenantConfig> = data ? JSON.parse(data) : INITIAL_TENANT_CONFIGS;
  configs[config.tenantId] = config;
  localStorage.setItem(STORAGE_KEYS.CONFIGS, JSON.stringify(configs));
}

// Usuário Atual & Tenant Ativo
export function getCurrentUser(): User | null {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (data) return JSON.parse(data);
  return INITIAL_USERS[0];
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export function getActiveTenant(): TenantId | 'all' {
  const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_TENANT);
  if (stored) return stored as TenantId | 'all';
  return 'contatur_sp';
}

export function setActiveTenant(tenantId: TenantId | 'all'): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_TENANT, tenantId);
}
