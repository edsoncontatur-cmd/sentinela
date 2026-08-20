import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getIncidents, getMailboxes, getClients, saveIncident, getTenantConfig } from '../services/storage';
import { analyzeEmailWithAI } from '../services/aiSimulator';
import { Incident, IncidentSeverity } from '../types';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Mail, 
  TrendingUp, 
  ShieldAlert, 
  Sparkles, 
  ArrowUpRight,
  Flame,
  Building2,
  Play
} from 'lucide-react';
import { Link } from 'wouter';

export const Dashboard: React.FC = () => {
  const { activeTenant, isSuperAdmin } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [simulationSuccess, setSimulationSuccess] = useState<string | null>(null);

  const loadData = () => {
    const data = getIncidents(activeTenant);
    setIncidents(data);
  };

  useEffect(() => {
    loadData();
  }, [activeTenant]);

  const totalIncidents = incidents.length;
  const activeCount = incidents.filter((i) => i.status !== 'RESOLVIDO' && i.status !== 'ARQUIVADO').length;
  const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVIDO').length;
  const highCount = incidents.filter((i) => i.severity === 'HIGH' && i.status !== 'RESOLVIDO').length;
  const resolvedCount = incidents.filter((i) => i.status === 'RESOLVIDO').length;

  const mailboxes = getMailboxes(activeTenant);
  const totalEmailsAnalyzed = mailboxes.reduce((acc, m) => acc + m.totalEmailsReceived, 0);

  // Departamentos com atritos
  const deptCounts: Record<string, number> = {};
  incidents.forEach((inc) => {
    deptCounts[inc.category] = (deptCounts[inc.category] || 0) + 1;
  });

  const handleSimulateNewEmail = () => {
    setSimulating(true);
    setSimulationSuccess(null);

    setTimeout(() => {
      const targetTenant = activeTenant === 'all' ? 'contatur_sp' : activeTenant;
      const config = getTenantConfig(targetTenant);

      const subjects = [
        'URGENTE: Notificação de Divergência de ICMS ST e Cobrança de Multa SEFAZ',
        'Holerite com cálculo incorreto de FGTS e rescisão não homologada',
        'Extrema demora no envio do Balancete para renovação de crédito bancário',
        'Contrato social travado na Junta há 3 semanas - Exigimos retorno',
      ];
      const bodies = [
        'Prezados, recebemos hoje um auto de infração da SEFAZ apontando divergência na apuração de ICMS ST transmitida por vocês. Estamos muito insatisfeitos com a falta de retorno do analista e exigimos uma solução antes do final do dia.',
        'Bom dia. O valor do FGTS rescisório do funcionário João veio com base divergente. O funcionário está no sindicato reclamando. Precisamos da guia retificada imediatamente.',
        'Olá equipe, nosso gerente do Itaú travou a linha de crédito da empresa porque o Balancete e DRE assinados ainda não foram entregues pela contabilidade.',
        'Estamos aguardando o deferimento da alteração contratual para abrir a filial. Não tivemos nenhum retorno do societário esta semana.',
      ];

      const randIndex = Math.floor(Math.random() * subjects.length);
      const subject = subjects[randIndex];
      const body = bodies[randIndex];

      const aiResult = analyzeEmailWithAI(subject, body, config);

      const newInc: Incident = {
        id: 'inc_sim_' + Date.now(),
        tenantId: targetTenant,
        mailboxId: mailboxes[0]?.id || 'mb_default',
        mailboxEmail: mailboxes[0]?.emailAddress || 'atendimento@contatur.com.br',
        messageId: 'MSG-SIM-' + Math.floor(Math.random() * 10000),
        senderName: 'Cliente Corporativo (Simulação)',
        senderEmail: 'diretoria@cliente-exemplo.com.br',
        senderType: 'CLIENTE',
        recipientEmail: mailboxes[0]?.emailAddress || 'atendimento@contatur.com.br',
        subject,
        emailBodyText: body,
        receivedAt: new Date().toISOString(),
        sentimentScore: aiResult.sentimentScore,
        severity: aiResult.severity,
        category: aiResult.category,
        aiSummary: aiResult.aiSummary,
        riskReasoning: aiResult.riskReasoning,
        highlightedPhrases: aiResult.highlightedPhrases,
        suggestedReply: aiResult.suggestedReply,
        suggestedActionPlan: aiResult.suggestedActionPlan,
        churnRiskScore: aiResult.churnRiskScore,
        status: 'NOVO',
        slaDeadline: new Date(Date.now() + (aiResult.severity === 'CRITICAL' ? 2 : 4) * 3600000).toISOString(),
        isSlaViolated: false,
        history: [
          {
            id: 'h_' + Date.now(),
            type: 'criacao',
            authorName: 'IA Sentinel (Simulador)',
            description: `Novo e-mail processado com severidade ${aiResult.severity} e departamento ${aiResult.category}.`,
            timestamp: new Date().toISOString(),
          },
        ],
      };

      saveIncident(newInc);
      loadData();
      setSimulating(false);
      setSimulationSuccess(`Novo e-mail analisado com sucesso pela IA! Severidade: ${aiResult.severity} | Depto: ${aiResult.category}`);
    }, 600);
  };

  const getSeverityBadge = (sev: IncidentSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">Crítico (Nível 1)</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Alta</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200">Média</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Baixa</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Topo do Dashboard com Ações Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#004677]">Torre de Controle &bull; Sala de Situação</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-100 text-[#004677]">
              Monitoramento Contínuo
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Visão consolidada de trocas de mensagens, detecção de atritos e probabilidade de perda de clientes.
          </p>
        </div>

        <button
          onClick={handleSimulateNewEmail}
          disabled={simulating}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#004677] hover:bg-[#003357] text-white rounded-lg text-xs font-bold shadow transition-all shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current text-[#6DCFF6]" />
          {simulating ? 'Processando IA...' : 'Simular Chegada de E-mail'}
        </button>
      </div>

      {simulationSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{simulationSuccess}</span>
          </div>
          <button onClick={() => setSimulationSuccess(null)} className="text-emerald-700 font-bold hover:underline">
            Fechar
          </button>
        </div>
      )}

      {/* Grid de KPIs Executivos com Métricas Financeiras e Operacionais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Honorários sob Risco Crítico */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-red-600 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Honorários sob Risco Crítico</p>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-red-600 mt-2">
            R$ {getClients(activeTenant).filter(c => c.statusRelacionamento === 'Crítico').reduce((acc, c) => acc + c.monthlyFee, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
          </p>
          <p className="text-[11px] text-red-500 mt-1 font-medium">
            {criticalCount} cliente(s) com risco de rescisão imediata
          </p>
        </div>

        {/* Card 2: Radar de Silêncio (Ghosting Alerts) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-purple-500 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Alerta de Silêncio (Ghosting)</p>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-800 mt-2">
            {getClients(activeTenant).filter(c => c.ghostingStatus === 'CRITICO_GHOSTING').length} Cliente(s)
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Queda &gt; 70% nas trocas de mensagens (Risco silencioso)
          </p>
        </div>

        {/* Card 3: Oportunidades Comerciais (Receita Extra) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-emerald-500 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Potencial de Receita Extra</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">
            + R$ 10.500,00/mês
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-semibold">
            3 novas oportunidades detectadas pela IA
          </p>
        </div>

        {/* Card 4: E-mails Monitorados */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-[#004677] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">E-mails Monitorados</p>
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-[#004677]">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#004677] mt-2">{totalEmailsAnalyzed.toLocaleString('pt-BR')}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Taxa de resolução: <span className="font-bold text-emerald-600">{totalIncidents > 0 ? Math.round((resolvedCount / totalIncidents) * 100) : 100}%</span>
          </p>
        </div>
      </div>

      {/* Banner de Calendário Fiscal Proativo */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
            📅
          </div>
          <div>
            <p className="font-bold text-amber-900 text-sm">
              Alerta de Calendário Fiscal Ativo &bull; Vencimento de Obrigações (Próximos 5 Dias)
            </p>
            <p className="text-amber-800 text-[11px] mt-0.5">
              DCTFWeb (vence dia 15) &bull; FGTS Digital e Folha (vence dia 20) &bull; DAS Simples Nacional (vence dia 20).
              A IA está promovendo automaticamente para <strong>Urgência Máxima</strong> qualquer e-mail referente a estas guias.
            </p>
          </div>
        </div>
        <span className="font-bold text-[10px] bg-amber-200 text-amber-900 px-2.5 py-1 rounded-full uppercase">
          Escalonamento Automático Ativo
        </span>
      </div>

      {/* Grid Central: Mapa de Departamentos e Relação de Ocorrências Críticas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Mapa de Calor por Departamento */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-[#004677] flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Atritos por Departamento
            </h3>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Volume Total
            </span>
          </div>

          <div className="space-y-3">
            {[
              { dept: 'FISCAL', label: 'Fiscal & Tributário', color: 'bg-red-500' },
              { dept: 'FOLHA', label: 'Departamento Pessoal / Folha', color: 'bg-amber-500' },
              { dept: 'LEGAL', label: 'Societário & Legalização', color: 'bg-sky-500' },
              { dept: 'CONTABIL', label: 'Contábil & Balancetes', color: 'bg-[#004677]' },
              { dept: 'FINANCEIRO', label: 'Financeiro & Fornecedores', color: 'bg-emerald-500' },
            ].map((item) => {
              const count = deptCounts[item.dept] || 0;
              const percent = totalIncidents > 0 ? Math.round((count / totalIncidents) * 100) : 0;

              return (
                <div key={item.dept} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="font-bold text-[#004677]">
                      {count} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-sky-50 border border-sky-100 rounded-lg text-xs text-[#004677] space-y-1">
            <p className="font-bold">💡 Diagnóstico Automático da IA:</p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              O setor <strong>Fiscal</strong> concentra a maior sensibilidade a multas de obrigações acessórias (DCTFWeb e DAS), demandando prioridade no tempo de resposta.
            </p>
          </div>
        </div>

        {/* Coluna 2 e 3: Tabela de Incidentes Recentes com Maior Risco */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-[#004677] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                Ocorrências Prioritárias &bull; Atenção Imediata
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                E-mails classificados pela IA com alto risco de rescisão contratual ou penalidade.
              </p>
            </div>
            <Link
              href="/incidentes"
              className="text-xs font-bold text-[#004677] hover:underline flex items-center gap-1"
            >
              Ver todos <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Remetente / Cliente</th>
                  <th className="p-2.5">Assunto & Resumo IA</th>
                  <th className="p-2.5">Severidade</th>
                  <th className="p-2.5">Risco Churn</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incidents.slice(0, 5).map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2.5">
                      <p className="font-bold text-[#004677] line-clamp-1">{inc.senderName}</p>
                      <p className="text-[10px] text-slate-500">{inc.senderEmail}</p>
                    </td>
                    <td className="p-2.5 max-w-xs">
                      <p className="font-semibold text-slate-800 line-clamp-1">{inc.subject}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{inc.aiSummary}</p>
                    </td>
                    <td className="p-2.5">{getSeverityBadge(inc.severity)}</td>
                    <td className="p-2.5">
                      <span className={`font-bold ${inc.churnRiskScore > 70 ? 'text-red-600' : 'text-amber-700'}`}>
                        {inc.churnRiskScore}%
                      </span>
                    </td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {inc.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <Link
                        href="/incidentes"
                        className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-[#004677] font-bold rounded text-[11px] border border-sky-200 transition-colors"
                      >
                        Tratar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
