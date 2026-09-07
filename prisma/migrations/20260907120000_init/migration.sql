-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "activeClientsCount" INTEGER NOT NULL DEFAULT 0,
    "monthlyRevenueTotal" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'role_analyst',
    "department" TEXT NOT NULL DEFAULT 'GERAL',
    "permissions" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitored_mailboxes" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "protocol" TEXT NOT NULL DEFAULT 'GRAPH_API',
    "host" TEXT,
    "port" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "syncIntervalMin" INTEGER NOT NULL DEFAULT 5,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monitored_mailboxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientCnpj" TEXT,
    "senderEmail" TEXT NOT NULL,
    "recipientMailbox" TEXT NOT NULL,
    "department" TEXT NOT NULL DEFAULT 'GERAL',
    "subject" TEXT NOT NULL,
    "rawBody" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "suggestedAction" TEXT,
    "suggestedResponseDraft" TEXT,
    "urgency" TEXT NOT NULL DEFAULT 'MEDIA',
    "sentiment" TEXT NOT NULL DEFAULT 'NEUTRO',
    "status" TEXT NOT NULL DEFAULT 'NOVO',
    "resolutionNotes" TEXT,
    "assignedTo" TEXT,
    "postServiceTouchpointScheduled" BOOLEAN NOT NULL DEFAULT false,
    "postServiceTouchpointSentAt" TIMESTAMP(3),
    "supervisorMediation" JSONB,
    "history" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "curveABC" TEXT NOT NULL DEFAULT 'B',
    "monthlyFee" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "healthScore" INTEGER NOT NULL DEFAULT 80,
    "ghostingStatus" TEXT NOT NULL DEFAULT 'NORMAL',
    "interactionDropPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "statusRelacionamento" TEXT NOT NULL DEFAULT 'Estável',
    "contactEmails" JSONB NOT NULL DEFAULT '[]',
    "notes" JSONB NOT NULL DEFAULT '[]',
    "churnForecast" JSONB,
    "totalIncidentsCount" INTEGER NOT NULL DEFAULT 0,
    "criticalIncidentsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commercial_leads" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "detectedNeed" TEXT NOT NULL,
    "estimatedValue" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "sourceEmailSubject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOVO',
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commercial_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_audits" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "incidentCode" TEXT NOT NULL,
    "analystName" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "emailSubject" TEXT NOT NULL,
    "auditScore" INTEGER NOT NULL DEFAULT 85,
    "status" TEXT NOT NULL DEFAULT 'CONFORME',
    "positivePoints" JSONB NOT NULL DEFAULT '[]',
    "improvementAreas" JSONB NOT NULL DEFAULT '[]',
    "feedback" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quality_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_broadcasts" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "referenceMonth" TEXT NOT NULL,
    "overallStatus" TEXT NOT NULL DEFAULT 'EM_ELABORACAO_IA',
    "sections" JSONB NOT NULL,
    "dispatchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_broadcasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_workload" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "openTicketsCount" INTEGER NOT NULL DEFAULT 0,
    "slaBreachRisk" TEXT NOT NULL DEFAULT 'NORMAL',
    "burnoutIndex" INTEGER NOT NULL DEFAULT 30,
    "sentimentScore" DOUBLE PRECISION NOT NULL DEFAULT 80.0,
    "lastOvertimeAlert" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_workload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_configs" (
    "tenantId" TEXT NOT NULL,
    "aiSensitivity" TEXT NOT NULL DEFAULT 'MODERADA',
    "quietHoursStart" TEXT NOT NULL DEFAULT '19:00',
    "quietHoursEnd" TEXT NOT NULL DEFAULT '07:00',
    "enableAutoDraft" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnCriticalSentiment" BOOLEAN NOT NULL DEFAULT true,
    "sgcIntegration" JSONB NOT NULL DEFAULT '{}',
    "meetingIntegration" JSONB NOT NULL DEFAULT '{}',
    "supervisorWorkflow" JSONB NOT NULL DEFAULT '{}',
    "monthlyBroadcastSettings" JSONB NOT NULL DEFAULT '{}',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "secrets" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_configs_pkey" PRIMARY KEY ("tenantId")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

-- CreateIndex
CREATE INDEX "monitored_mailboxes_tenantId_idx" ON "monitored_mailboxes"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "incidents_code_key" ON "incidents"("code");

-- CreateIndex
CREATE INDEX "incidents_tenantId_idx" ON "incidents"("tenantId");

-- CreateIndex
CREATE INDEX "incidents_status_idx" ON "incidents"("status");

-- CreateIndex
CREATE INDEX "incidents_urgency_idx" ON "incidents"("urgency");

-- CreateIndex
CREATE INDEX "clients_tenantId_idx" ON "clients"("tenantId");

-- CreateIndex
CREATE INDEX "clients_healthScore_idx" ON "clients"("healthScore");

-- CreateIndex
CREATE UNIQUE INDEX "clients_tenantId_cnpj_key" ON "clients"("tenantId", "cnpj");

-- CreateIndex
CREATE INDEX "commercial_leads_tenantId_idx" ON "commercial_leads"("tenantId");

-- CreateIndex
CREATE INDEX "commercial_leads_status_idx" ON "commercial_leads"("status");

-- CreateIndex
CREATE INDEX "quality_audits_tenantId_idx" ON "quality_audits"("tenantId");

-- CreateIndex
CREATE INDEX "monthly_broadcasts_tenantId_idx" ON "monthly_broadcasts"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_broadcasts_tenantId_referenceMonth_key" ON "monthly_broadcasts"("tenantId", "referenceMonth");

-- CreateIndex
CREATE INDEX "team_workload_tenantId_idx" ON "team_workload"("tenantId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitored_mailboxes" ADD CONSTRAINT "monitored_mailboxes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commercial_leads" ADD CONSTRAINT "commercial_leads_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_audits" ADD CONSTRAINT "quality_audits_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_broadcasts" ADD CONSTRAINT "monthly_broadcasts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_workload" ADD CONSTRAINT "team_workload_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_configs" ADD CONSTRAINT "tenant_configs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

