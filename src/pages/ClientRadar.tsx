import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getClients, saveClient } from '../services/storage';
import { scheduleClientMeeting } from '../services/meetingService';
import { ClientEntity } from '../types';
import {
  Activity,
  Search,
  Building,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
  Plus,
  MessageSquare,
  FileText,
  X,
  Sparkles,
  Calendar,
  PhoneCall,
  ExternalLink,
  ShieldAlert,
  Flame,
  Award,
  Layers,
  Clock,
  CheckCheck
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';

export const ClientRadar: React.FC = () => {
  const { activeTenant, currentTenant, user } = useAuth();
  const [clients, setClients] = useState<ClientEntity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<ClientEntity | null>(null);
  const [dossierClient, setDossierClient] = useState<ClientEntity | null>(null);
  const [newNote, setNewNote] = useState('');
  const [isSchedulingMeeting, setIsSchedulingMeeting] = useState(false);
  const [meetingSuccessToast, setMeetingSuccessToast] = useState<string | null>(null);

  const loadData = () => {
    const data = getClients(activeTenant);
    setClients(data);
  };

  useEffect(() => {
    loadData();
  }, [activeTenant]);

  const filteredClients = clients.filter((c) => {
    const nameMatch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const cnpjMatch = (c.cnpjCpf || '').includes(searchTerm);
    const emailMatch = (c.contactEmails || []).some((e) =>
      (e || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchSearch = nameMatch || cnpjMatch || emailMatch;

    const matchStatus = filterStatus === 'all' || c.statusRelacionamento === filterStatus;
    const matchType = filterType === 'all' || c.type === filterType;

    return matchSearch && matchStatus && matchType;
  });

  const handleAddNote = () => {
    if (!selectedClient || !newNote) return;
    const timestamp = new Date().toLocaleDateString('pt-BR');
    if (!selectedClient.notes) selectedClient.notes = [];
    selectedClient.notes.unshift(`${timestamp} (${user?.name || 'Gestor'}): ${newNote}`);
    saveClient(selectedClient);
    setNewNote('');
    loadData();
  };

  const handleScheduleMeeting = async (client: ClientEntity) => {
    setIsSchedulingMeeting(true);
    const htmlBriefing = `
      <h3>Dossiê Executivo 360° — ${client.name}</h3>
      <p><strong>CNPJ:</strong> ${client.cnpjCpf}</p>
      <p><strong>Honorário Mensal:</strong> R$ ${(client.monthlyFee || 5000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês</p>
      <p><strong>Health Score:</strong> ${client.healthScore || 80}/100 (Status: ${client.statusRelacionamento})</p>
      <p><strong>Risco de Churn:</strong> ${client.churnForecast?.churnProbabilityPercent || 25}% (${client.churnForecast?.riskLevel || 'BAIXO'})</p>
      <h4>Fatores de Atenção Identificados pela IA:</h4>
      <ul>
        ${(client.churnForecast?.topRiskFactors || []).map((f) => `<li>${f}</li>`).join('')}
      </ul>
    `;

    const res = await scheduleClientMeeting({
      tenantId: client.tenantId,
      clientId: client.id,
      clientName: client.name,
      clientCnpj: client.cnpjCpf,
      subject: `Alinhamento Executivo e Retenção — ${client.name}`,
      proposedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Sala de Reuniões da Diretoria / Microsoft Teams',
      participantsEmails: client.contactEmails || [],
      executiveBriefingHtml: htmlBriefing,
      originSystem: 'Contatur-Sentinel',
    });

    setIsSchedulingMeeting(false);
    if (res.success) {
      client.lastMeetingDate = new Date().toISOString();
      client.lastMeetingSubject = 'Alinhamento Estratégico & Retenção';
      client.lastMeetingProtocol = res.meetingNumberStr;
      saveClient(client);
      setMeetingSuccessToast(`📅 Reunião agendada com sucesso no Contatur Meeting! Protocolo: ${res.meetingNumberStr}`);
      setTimeout(() => setMeetingSuccessToast(null), 6000);
      loadData();
    }
  };

  const getStatusBadge = (status?: ClientEntity['statusRelacionamento']) => {
    switch (status) {
      case 'Crítico':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">🔴 Crítico</span>;
      case 'Em Risco':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">🟠 Em Risco</span>;
      case 'Estável':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200">🟡 Estável</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">🟢 Excelente</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast de Agendamento */}
      {meetingSuccessToast && (
        <div className="p-4 bg-[#004677] text-white rounded-xl shadow-lg flex items-center justify-between text-sm font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-5 h-5 text-[#6DCFF6]" />
            <span>{meetingSuccessToast}</span>
          </div>
          <button onClick={() => setMeetingSuccessToast(null)} className="text-white/80 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Topo do Radar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h1 className="text-xl font-bold text-[#004677] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#6DCFF6]" />
            Radar 360° de Clientes, Health Score & Preditor de Churn
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoramento de saúde relacional, risco matemático de rescisão contratual, alerta de silêncio (Ghosting) e integração com o Contatur Meeting.
          </p>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por Razão Social, CNPJ ou e-mail..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004677] outline-none"
            />
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-medium text-slate-700 bg-white focus:ring-2 focus:ring-[#004677] outline-none"
            >
              <option value="all">Todos os Status de Saúde</option>
              <option value="Crítico">🔴 Crítico (Score &lt; 50)</option>
              <option value="Em Risco">🟠 Em Risco (Score 50-70)</option>
              <option value="Estável">🟡 Estável (Score 70-85)</option>
              <option value="Excelente">🟢 Excelente (Score &gt; 85)</option>
            </select>
          </div>

          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-medium text-slate-700 bg-white focus:ring-2 focus:ring-[#004677] outline-none"
            >
              <option value="all">Todos os Tipos (Clientes & Fornecedores)</option>
              <option value="CLIENTE">Apenas Clientes</option>
              <option value="FORNECEDOR">Apenas Fornecedores</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Cards de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const healthScore = client.healthScore ?? 80;
          const monthlyFee = client.monthlyFee ?? 5000;
          const curveABC = client.curveABC ?? 'B';
          const totalIncidents = client.totalIncidentsCount ?? 0;
          const criticalIncidents = client.criticalIncidentsCount ?? 0;
          const churnProb = client.churnForecast?.churnProbabilityPercent || Math.max(10, 100 - healthScore);

          return (
            <div
              key={client.id}
              className={`bg-white p-5 rounded-xl border shadow-sm space-y-3 relative hover:border-[#004677] transition-all flex flex-col justify-between ${
                churnProb >= 70 ? 'border-red-200' : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {client.type || 'CLIENTE'} &bull; {client.primaryDepartment || 'GERAL'}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-sky-100 text-[#004677]">
                        Curva {curveABC}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-[#004677] mt-0.5 line-clamp-1">{client.name}</h3>
                    <p className="text-[11px] text-slate-500 font-mono">CNPJ: {client.cnpjCpf}</p>
                  </div>

                  {getStatusBadge(client.statusRelacionamento)}
                </div>

                {/* Alerta de Ghosting */}
                {client.ghostingStatus === 'CRITICO_GHOSTING' && (
                  <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-lg text-purple-900 text-[11px] flex items-center gap-2">
                    <span className="text-base">👻</span>
                    <div>
                      <span className="font-bold block">Alerta de Silêncio (Ghosting):</span>
                      <span>Queda de {client.interactionDropPercentage || 80}% nas mensagens há 21 dias.</span>
                    </div>
                  </div>
                )}

                {/* Preditor de Churn por IA */}
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-red-500" /> Probabilidade de Churn:
                    </span>
                    <span className={`font-black ${churnProb >= 70 ? 'text-red-600' : churnProb >= 40 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {churnProb}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        churnProb >= 70 ? 'bg-red-600' : churnProb >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${churnProb}%` }}
                    />
                  </div>
                </div>

                {/* Métricas de Honorários e Incidentes */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Honorário Mensal:</span>
                    <span className="font-bold text-slate-900">
                      R$ {monthlyFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Incidentes Ativos:</span>
                    <span className="font-bold text-red-600">
                      {totalIncidents} ({criticalIncidents} críticos)
                    </span>
                  </div>
                </div>

                {/* Protocolo do Meeting se houver reunião recente */}
                {client.lastMeetingProtocol && (
                  <div className="p-2 bg-sky-50 border border-sky-100 rounded-lg text-[10px] text-[#004677] flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Meeting: {client.lastMeetingProtocol}
                    </span>
                    <span className="text-emerald-700 font-bold">Agendado ✓</span>
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedClient(client)}
                  className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] flex items-center justify-center gap-1 transition-colors"
                >
                  <FileText className="w-3 h-3" /> Notas
                </button>

                <button
                  onClick={() => setDossierClient(client)}
                  className="py-1.5 bg-[#004677] hover:bg-[#003357] text-white font-bold rounded-lg text-[11px] flex items-center justify-center gap-1 transition-colors shadow-xs"
                >
                  <Sparkles className="w-3 h-3 text-[#6DCFF6]" /> Dossiê VIP & Meeting
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal 1: Histórico 360° e Anotações */}
      {selectedClient && (
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent className="max-w-2xl bg-white border-t-4 border-t-[#004677]">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-[#004677]">
                Histórico 360° & Notas: {selectedClient.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                CNPJ: {selectedClient.cnpjCpf} &bull; Score: {selectedClient.healthScore || 80}/100
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <p className="font-bold text-slate-700">E-mails de Contato Monitorados:</p>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedClient.contactEmails || []).map((em, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-white border border-slate-300 rounded font-mono text-[11px]">
                      {em}
                    </span>
                  ))}
                </div>
              </div>

              {/* Inclusão de Nova Nota */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Registrar Ação de Retenção ou Alinhamento:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Ex: Realizada reunião de alinhamento com a diretoria do cliente..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#004677]"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote}
                    className="px-4 py-2 bg-[#004677] hover:bg-[#003357] text-white font-bold rounded-lg text-xs flex items-center gap-1 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Lista de Notas */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <p className="font-bold text-slate-800">Histórico de Relacionamento & Notas Preventivas:</p>
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {(selectedClient.notes || []).map((note, nIdx) => (
                    <div key={nIdx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 leading-relaxed">
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal 2: Dossiê Executivo VIP 360° + Agendamento Meeting */}
      {dossierClient && (
        <Dialog open={!!dossierClient} onOpenChange={() => setDossierClient(null)}>
          <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto bg-white border-t-4 border-t-[#004677] p-0">
            {/* Header VIP */}
            <div className="p-6 bg-gradient-to-r from-[#004677] to-[#003357] text-white space-y-1">
              <span className="text-[10px] font-bold text-[#D2BE8C] uppercase tracking-wider">
                Ficha Executiva VIP &bull; Preparação para Visitas & Reuniões de Diretoria
              </span>
              <DialogTitle className="text-xl font-bold text-white">
                {dossierClient.name}
              </DialogTitle>
              <p className="text-xs text-slate-200">
                CNPJ: {dossierClient.cnpjCpf} &bull; Curva {dossierClient.curveABC} &bull; Honorário: R$ {(dossierClient.monthlyFee || 5000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
              </p>
            </div>

            <div className="p-6 space-y-5 text-xs text-slate-800">
              {/* Playbook Prescritivo de Resgate da IA */}
              <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <span>Playbook de Retenção Executiva Recomendado pela IA:</span>
                </div>

                <div className="space-y-2">
                  {(dossierClient.churnForecast?.prescriptivePlaybook || []).map((step) => (
                    <div key={step.order} className="p-2.5 bg-white rounded-lg border border-amber-200 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#004677] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {step.order}
                      </span>
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{step.title}</span>
                          <span className="text-[10px] font-bold text-amber-800">Prazo: {step.deadlineHours}h</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{step.description}</p>
                        <span className="text-[10px] text-slate-400 block font-medium">Responsável: {step.responsibleRole}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fatores de Atenção */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-[#004677] block text-xs">⚠️ Fatores Críticos Detectados no Histórico:</span>
                <ul className="space-y-1 list-disc pl-4 text-slate-700 text-xs">
                  {(dossierClient.churnForecast?.topRiskFactors || []).map((fact, idx) => (
                    <li key={idx}>{fact}</li>
                  ))}
                </ul>
              </div>

              {/* Botão de Agendamento Direto no Contatur Meeting */}
              <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-[#004677] text-sm flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#6DCFF6]" />
                    Agendador Integrado: Contatur Meeting
                  </span>
                  <p className="text-slate-600 text-xs">
                    Transmita este Dossiê 360° instantaneamente para a pauta e ata da diretoria no Contatur Meeting.
                  </p>
                </div>

                <button
                  disabled={isSchedulingMeeting}
                  onClick={() => handleScheduleMeeting(dossierClient)}
                  className="px-5 py-2.5 bg-[#004677] hover:bg-[#003357] text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all shrink-0"
                >
                  <Calendar className="w-4 h-4 text-[#6DCFF6]" />
                  {isSchedulingMeeting ? 'Conectando ao Meeting...' : 'Agendar Reunião no Meeting'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
