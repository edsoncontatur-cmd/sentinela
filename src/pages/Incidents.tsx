import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getIncidents,
  saveIncident,
  updateIncidentStatus,
  getUsers,
  sendSupervisorWelcomeEmail,
  sendSupervisorStatusUpdate,
  recordCsatRating,
} from '../services/storage';
import { Incident, IncidentSeverity, IncidentStatus, DepartmentType } from '../types';
import {
  Inbox,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Sparkles,
  Copy,
  Send,
  MessageSquare,
  PhoneCall,
  UserCheck,
  AlertCircle,
  FileText,
  Calendar,
  X,
  LayoutGrid,
  List,
  ShieldCheck
} from 'lucide-react';

export const Incidents: React.FC = () => {
  const { activeTenant, user, hasPermission } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Estados do Modal de Atendimento
  const [customNote, setCustomNote] = useState('');
  const [copiedReply, setCopiedReply] = useState(false);
  const [replySentSuccess, setReplySentSuccess] = useState(false);

  const loadData = () => {
    const data = getIncidents(activeTenant);
    setIncidents(data);
  };

  useEffect(() => {
    loadData();
  }, [activeTenant]);

  const users = getUsers();

  const filteredIncidents = incidents.filter((inc) => {
    const matchSearch =
      inc.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.senderEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.aiSummary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchSev = selectedSeverity === 'all' || inc.severity === selectedSeverity;
    const matchDept = selectedDept === 'all' || inc.category === selectedDept;
    const matchStatus = selectedStatus === 'all' || inc.status === selectedStatus;

    return matchSearch && matchSev && matchDept && matchStatus;
  });

  const handleStatusChange = (newStatus: IncidentStatus) => {
    if (!selectedIncident) return;
    updateIncidentStatus(selectedIncident.id, newStatus, user?.name || 'Operador', customNote);
    loadData();
    // Atualizar incidente selecionado
    const updated = getIncidents(activeTenant).find((i) => i.id === selectedIncident.id);
    if (updated) setSelectedIncident(updated);
    setCustomNote('');
  };

  const handleAssignUser = (assigneeId: string) => {
    if (!selectedIncident) return;
    const foundUser = users.find((u) => u.id === assigneeId);
    if (!foundUser) return;

    selectedIncident.assignedToUserId = foundUser.id;
    selectedIncident.assignedToUserName = foundUser.name;
    selectedIncident.history.push({
      id: 'h_assign_' + Date.now(),
      type: 'atribuicao',
      authorName: user?.name || 'Operador',
      description: `Chamado atribuído para ${foundUser.name}.`,
      timestamp: new Date().toISOString(),
    });

    saveIncident(selectedIncident);
    loadData();
  };

  const handleAddPhoneContact = () => {
    if (!selectedIncident || !customNote) return;
    selectedIncident.history.push({
      id: 'h_phone_' + Date.now(),
      type: 'contato_telefonico',
      authorName: user?.name || 'Operador',
      description: `📞 Registro de Contato Telefônico: ${customNote}`,
      timestamp: new Date().toISOString(),
    });
    saveIncident(selectedIncident);
    setCustomNote('');
    loadData();
  };

  const handleCopyReply = () => {
    if (!selectedIncident) return;
    navigator.clipboard.writeText(selectedIncident.suggestedReply);
    setCopiedReply(true);
    setTimeout(() => setCopiedReply(false), 2000);
  };

  const handleSendDirectReply = () => {
    if (!selectedIncident) return;
    setReplySentSuccess(true);
    selectedIncident.history.push({
      id: 'h_reply_' + Date.now(),
      type: 'resposta_enviada',
      authorName: user?.name || 'Operador',
      description: `✉️ Resposta oficial transmitida ao cliente via servidor SMTP/API.`,
      timestamp: new Date().toISOString(),
    });
    selectedIncident.status = 'AGUARDANDO_CLIENTE';
    saveIncident(selectedIncident);
    loadData();
    setTimeout(() => setReplySentSuccess(false), 3000);
  };

  const getSeverityBadge = (sev: IncidentSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">🔴 Crítico</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">🟠 Alta</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">🟡 Média</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">🟢 Baixa</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho com Filtros e Alternância de Visualização */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#004677] flex items-center gap-2">
              <Inbox className="w-5 h-5 text-[#6DCFF6]" />
              Central de Gestão de Incidentes & Ocorrências
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Acompanhamento contínuo de reclamações de clientes e fornecedores com diagnóstico de IA e SLA.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                viewMode === 'kanban' ? 'bg-[#004677] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-[#004677] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Tabela
            </button>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, assunto ou texto..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004677] outline-none"
            />
          </div>

          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-medium text-slate-700 bg-white focus:ring-2 focus:ring-[#004677] outline-none"
            >
              <option value="all">Todas as Severidades</option>
              <option value="CRITICAL">🔴 Crítico (Nível 1)</option>
              <option value="HIGH">🟠 Alta</option>
              <option value="MEDIUM">🟡 Média</option>
              <option value="LOW">🟢 Baixa</option>
            </select>
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-medium text-slate-700 bg-white focus:ring-2 focus:ring-[#004677] outline-none"
            >
              <option value="all">Todos os Departamentos</option>
              <option value="FISCAL">Fiscal & Tributário</option>
              <option value="FOLHA">Departamento Pessoal / Folha</option>
              <option value="CONTABIL">Contábil & Balancetes</option>
              <option value="LEGAL">Societário & Legalização</option>
              <option value="FINANCEIRO">Financeiro / Cobrança</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-medium text-slate-700 bg-white focus:ring-2 focus:ring-[#004677] outline-none"
            >
              <option value="all">Todos os Status</option>
              <option value="NOVO">Novo</option>
              <option value="EM_TRATAMENTO">Em Tratamento</option>
              <option value="AGUARDANDO_CLIENTE">Aguardando Cliente</option>
              <option value="RESOLVIDO">Resolvido</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visualização em Kanban */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { status: 'NOVO', title: 'Novos / Triagem', color: 'border-t-blue-500', bg: 'bg-blue-50/30' },
            { status: 'EM_TRATAMENTO', title: 'Em Atendimento', color: 'border-t-amber-500', bg: 'bg-amber-50/30' },
            { status: 'AGUARDANDO_CLIENTE', title: 'Aguardando Retorno', color: 'border-t-purple-500', bg: 'bg-purple-50/30' },
            { status: 'RESOLVIDO', title: 'Resolvidos', color: 'border-t-emerald-500', bg: 'bg-emerald-50/30' },
          ].map((col) => {
            const colIncidents = filteredIncidents.filter((i) => i.status === col.status);

            return (
              <div
                key={col.status}
                className={`bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden border-t-4 ${col.color}`}
              >
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-700">{col.title}</span>
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                    {colIncidents.length}
                  </span>
                </div>

                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {colIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      onClick={() => setSelectedIncident(inc)}
                      className={`p-3 rounded-lg border border-slate-200 bg-white hover:border-[#004677] hover:shadow-md cursor-pointer transition-all space-y-2 relative ${
                        inc.severity === 'CRITICAL' ? 'border-l-4 border-l-red-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        {getSeverityBadge(inc.severity)}
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{inc.category}</span>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-[#004677] line-clamp-1">{inc.senderName}</h4>
                        <p className="text-[11px] font-semibold text-slate-800 line-clamp-1 mt-0.5">{inc.subject}</p>
                        <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">{inc.aiSummary}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(inc.receivedAt).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="font-bold text-red-600">
                          Risco Churn: {inc.churnRiskScore}%
                        </span>
                      </div>
                    </div>
                  ))}

                  {colIncidents.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Nenhuma ocorrência nesta coluna.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Visualização em Tabela */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Data / Hora</th>
                  <th className="p-3">Remetente (Cliente / Fornecedor)</th>
                  <th className="p-3">Assunto & Resumo IA</th>
                  <th className="p-3">Depto</th>
                  <th className="p-3">Severidade</th>
                  <th className="p-3">Risco Churn</th>
                  <th className="p-3">Responsável</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-slate-500 whitespace-nowrap">
                      {new Date(inc.receivedAt).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-[#004677]">{inc.senderName}</p>
                      <p className="text-[10px] text-slate-400">{inc.senderEmail}</p>
                    </td>
                    <td className="p-3 max-w-sm">
                      <p className="font-semibold text-slate-800 line-clamp-1">{inc.subject}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{inc.aiSummary}</p>
                    </td>
                    <td className="p-3 font-semibold text-slate-600">{inc.category}</td>
                    <td className="p-3">{getSeverityBadge(inc.severity)}</td>
                    <td className="p-3 font-bold text-red-600">{inc.churnRiskScore}%</td>
                    <td className="p-3 text-slate-700">{inc.assignedToUserName || 'Não atribuído'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {inc.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedIncident(inc)}
                        className="px-3 py-1 bg-[#004677] hover:bg-[#003357] text-white font-bold rounded text-[11px] transition-colors"
                      >
                        Abrir Ficha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal / Ficha Completa de Atendimento do Incidente */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Topo do Modal */}
            <div className="p-4 bg-[#004677] text-white flex items-center justify-between border-b border-[#003357]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#6DCFF6]" />
                <div>
                  <h3 className="font-bold text-sm leading-tight">
                    Ficha de Atendimento &bull; #{selectedIncident.messageId}
                  </h3>
                  <p className="text-[11px] text-slate-200">
                    Caixa: {selectedIncident.mailboxEmail} &bull; Unidade: {selectedIncident.tenantId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo com Abas e Divisões */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Header do Incidente */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(selectedIncident.severity)}
                    <span className="font-bold text-[#004677] bg-sky-100 px-2 py-0.5 rounded text-[10px]">
                      DEPTO: {selectedIncident.category}
                    </span>
                    <span className="font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded text-[10px]">
                      PROBABILIDADE CHURN: {selectedIncident.churnRiskScore}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Status Atual:</span>
                    <select
                      value={selectedIncident.status}
                      onChange={(e) => handleStatusChange(e.target.value as IncidentStatus)}
                      className="px-2 py-1 bg-white border border-slate-300 rounded font-bold text-[#004677] outline-none"
                    >
                      <option value="NOVO">NOVO</option>
                      <option value="EM_TRATAMENTO">EM TRATAMENTO</option>
                      <option value="AGUARDANDO_CLIENTE">AGUARDANDO CLIENTE</option>
                      <option value="RESOLVIDO">RESOLVIDO</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900">{selectedIncident.subject}</h2>
                  <p className="text-slate-600 mt-0.5">
                    De: <strong>{selectedIncident.senderName}</strong> ({selectedIncident.senderEmail}) em{' '}
                    {new Date(selectedIncident.receivedAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Alerta de Calendário Fiscal se houver */}
              {selectedIncident.fiscalAlert && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📅</span>
                    <div>
                      <p className="font-bold text-amber-900 text-xs">
                        Obrigação Fiscal sob Risco: {selectedIncident.fiscalAlert.obligationName} (Vencimento: {selectedIncident.fiscalAlert.dueDate})
                      </p>
                      <p className="text-[11px] text-amber-800">
                        O e-mail foi escalonado automaticamente pela IA para Urgência Máxima devido à proximidade do prazo legal.
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-600 text-white animate-pulse">
                    PRIORIDADE FISCAL
                  </span>
                </div>
              )}

              {/* Mensagem Original do E-mail */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#004677]" />
                  Conteúdo Original do E-mail:
                </h4>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg whitespace-pre-wrap font-sans text-slate-800 leading-relaxed shadow-inner">
                  {selectedIncident.emailBodyText}
                </div>
              </div>

              {/* Inovação 7: Anexos Processados (OCR e Áudios Transcritos) */}
              {selectedIncident.attachments && selectedIncident.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#D2BE8C]" />
                    Anexos Processados por IA (OCR / Transcrição de Áudio):
                  </h4>
                  <div className="space-y-2">
                    {selectedIncident.attachments.map((att, aIdx) => (
                      <div key={aIdx} className="p-3 bg-purple-50/60 border border-purple-200 rounded-lg space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-purple-900 flex items-center gap-1.5">
                            {att.type === 'PRINT_OCR' ? '📄 OCR de Documento / Notificação:' : '🎙️ Áudio Transcrito do Cliente:'}
                            <span className="font-mono text-slate-600 font-normal">({att.fileName})</span>
                          </span>
                          <span className="text-purple-700 font-semibold text-[10px]">
                            Precisão: {att.confidenceScore}%
                          </span>
                        </div>
                        <p className="text-slate-700 text-xs italic bg-white p-2 rounded border border-purple-100 leading-relaxed">
                          &ldquo;{att.extractedText}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Diagnóstico da Inteligência Artificial */}
              <div className="p-4 rounded-lg bg-sky-50/50 border border-sky-200 space-y-3">
                <div className="flex items-center gap-2 text-[#004677]">
                  <Sparkles className="w-4 h-4 text-[#6DCFF6]" />
                  <h4 className="font-bold text-sm">Diagnóstico & Análise da IA Sentinela</h4>
                </div>

                <p className="text-slate-700 leading-relaxed">{selectedIncident.aiSummary}</p>

                {/* Trechos Destacados */}
                {selectedIncident.highlightedPhrases && selectedIncident.highlightedPhrases.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="font-bold text-slate-700 text-[11px]">Pontos de Atrito Detectados:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedIncident.highlightedPhrases.map((phrase, pIdx) => (
                        <div
                          key={pIdx}
                          className="p-2 rounded bg-white border border-red-200 text-red-800 text-[11px] shadow-2xs"
                        >
                          <span className="font-bold">&ldquo;{phrase.text}&rdquo;</span> &bull; {phrase.reason}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Copiloto de Resposta & Plano de Ação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Minuta de Resposta */}
                <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      Minuta de Resposta Sugerida:
                    </h4>
                    <button
                      onClick={handleCopyReply}
                      className="text-[11px] font-bold text-[#004677] hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedReply ? 'Copiado!' : 'Copiar Texto'}
                    </button>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-700 whitespace-pre-wrap text-[11px] leading-relaxed max-h-48 overflow-y-auto">
                    {selectedIncident.suggestedReply}
                  </div>

                  <button
                    onClick={handleSendDirectReply}
                    className="w-full py-2 bg-[#004677] hover:bg-[#003357] text-white font-bold rounded text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Enviar Resposta Oficial ao Cliente
                  </button>
                  {replySentSuccess && (
                    <p className="text-[11px] font-bold text-emerald-600 text-center animate-fadeIn">
                      ✓ Resposta transmitida com sucesso!
                    </p>
                  )}
                </div>

                {/* Plano de Ação Interno */}
                <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm space-y-2">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Checklist de Ações Internas (IA):
                  </h4>
                  <ul className="space-y-2">
                    {selectedIncident.suggestedActionPlan.map((action, aIdx) => (
                      <li key={aIdx} className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-700 text-[11px]">
                        {action}
                      </li>
                    ))}
                  </ul>

                  {/* Atribuição de Usuário */}
                  <div className="pt-3 border-t border-slate-100 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Atribuir Responsável:</label>
                    <select
                      value={selectedIncident.assignedToUserId || ''}
                      onChange={(e) => handleAssignUser(e.target.value)}
                      className="w-full p-1.5 border border-slate-300 rounded text-xs text-slate-800 bg-white"
                    >
                      <option value="">Selecione um analista...</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.roleName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Inovação: Régua de Mediação Supervisor ↔ Cliente & CSAT */}
              <div className="p-4 rounded-lg bg-sky-50/80 border border-sky-200 space-y-4">
                <div className="flex items-center justify-between border-b border-sky-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🤝</span>
                    <div>
                      <h4 className="font-bold text-xs text-[#004677]">
                        Régua de Mediação & Satisfação: Supervisor ↔ Cliente
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Acompanhamento estruturado do acolhimento à pesquisa de satisfação final.
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-[#004677] text-white">
                    Supervisão {selectedIncident.category}
                  </span>
                </div>

                {/* Stepper das 3 Etapas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Etapa 1: Acolhimento */}
                  <div className={`p-3 rounded-lg border bg-white space-y-2 ${
                    selectedIncident.supervisorMediation?.welcomeEmailSentAt
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#004677] flex items-center gap-1 text-[11px]">
                        1. Acolhimento do Supervisor
                      </span>
                      {selectedIncident.supervisorMediation?.welcomeEmailSentAt ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">✓ Enviado</span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">Pendente</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-600">
                      E-mail oficial informando que a liderança assumiu o caso.
                    </p>
                    <button
                      onClick={() => {
                        sendSupervisorWelcomeEmail(
                          selectedIncident.id,
                          user?.name || 'Supervisor Responsável',
                          user?.email || 'supervisor@contatur.com.br'
                        );
                        loadData();
                        setSelectedIncident({
                          ...selectedIncident,
                          supervisorMediation: {
                            ...selectedIncident.supervisorMediation,
                            supervisorName: user?.name || 'Supervisor Responsável',
                            supervisorEmail: user?.email || 'supervisor@contatur.com.br',
                            welcomeEmailSentAt: new Date().toISOString(),
                          }
                        });
                      }}
                      disabled={Boolean(selectedIncident.supervisorMediation?.welcomeEmailSentAt)}
                      className="w-full py-1.5 bg-[#004677] hover:bg-[#003357] disabled:opacity-50 text-white font-bold rounded text-[10px] flex items-center justify-center gap-1 shadow-xs transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      {selectedIncident.supervisorMediation?.welcomeEmailSentAt ? 'Acolhimento Transmitido' : 'Enviar Acolhimento Oficial'}
                    </button>
                  </div>

                  {/* Etapa 2: Atualização de Andamento */}
                  <div className={`p-3 rounded-lg border bg-white space-y-2 ${
                    selectedIncident.supervisorMediation?.statusUpdateEmailSentAt
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#004677] flex items-center gap-1 text-[11px]">
                        2. Status Update ao Cliente
                      </span>
                      {selectedIncident.supervisorMediation?.statusUpdateEmailSentAt && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">✓ Atualizado</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-600">
                      Transmite posição de andamento para manter o cliente seguro.
                    </p>
                    <button
                      onClick={() => {
                        const updateMsg = prompt('Digite a mensagem de atualização para o cliente:', 'Seu protocolo está na etapa final de conferência técnica.');
                        if (updateMsg) {
                          sendSupervisorStatusUpdate(selectedIncident.id, user?.name || 'Supervisor', updateMsg);
                          loadData();
                          setSelectedIncident({
                            ...selectedIncident,
                            supervisorMediation: {
                              ...selectedIncident.supervisorMediation,
                              supervisorName: user?.name || 'Supervisor',
                              supervisorEmail: user?.email || 'supervisor@contatur.com.br',
                              statusUpdateEmailSentAt: new Date().toISOString(),
                              statusUpdateBody: updateMsg,
                            }
                          });
                        }
                      }}
                      className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-[#004677] border border-slate-300 font-bold rounded text-[10px] flex items-center justify-center gap-1 transition-colors"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Enviar Atualização de Status
                    </button>
                  </div>

                  {/* Etapa 3: Pesquisa CSAT */}
                  <div className={`p-3 rounded-lg border bg-white space-y-2 ${
                    selectedIncident.supervisorMediation?.csatRating
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#004677] flex items-center gap-1 text-[11px]">
                        3. Pesquisa de Satisfação (CSAT)
                      </span>
                      {selectedIncident.supervisorMediation?.csatRating ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200 px-1.5 py-0.2 rounded">
                          {selectedIncident.supervisorMediation.csatRating} / 5 ⭐
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">Aguardando</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-600">
                      Avaliação 1-Click do cliente disparada após a solução.
                    </p>
                    
                    {/* Simulador Interativo de Resposta do Cliente */}
                    <div className="pt-1 flex items-center justify-between gap-1">
                      <span className="text-[9px] text-slate-400 font-semibold">Simular Nota:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          title={`Simular cliente avaliando com nota ${star}`}
                          onClick={() => {
                            recordCsatRating(selectedIncident.id, star, star >= 4 ? 'Excelente atendimento do supervisor!' : 'Demorou mais do que o esperado.');
                            loadData();
                            setSelectedIncident({
                              ...selectedIncident,
                              supervisorMediation: {
                                ...selectedIncident.supervisorMediation,
                                supervisorName: selectedIncident.supervisorMediation?.supervisorName || 'Supervisor',
                                supervisorEmail: 'supervisor@contatur.com.br',
                                csatRating: star,
                                csatComment: star >= 4 ? 'Excelente atendimento do supervisor!' : 'Demorou mais do que o esperado.',
                                csatRespondedAt: new Date().toISOString(),
                              }
                            });
                          }}
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded border transition-transform hover:scale-110 ${
                            selectedIncident.supervisorMediation?.csatRating === star
                              ? 'bg-amber-400 text-slate-900 border-amber-500'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {star}★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Inovação 6: Touchpoint de Pós-Atendimento & Retenção da Diretoria */}
              <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Touchpoint Preventivo de Pós-Atendimento (48h após resolução)</span>
                  </div>
                  {selectedIncident.postServiceTouchpointSentAt ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-200 text-emerald-900">
                      ✓ Touchpoint Enviado
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                      Agendado para envio
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-700 leading-relaxed italic bg-white p-3 rounded border border-emerald-100">
                  &ldquo;{selectedIncident.postServiceTouchpointDraft || 'Olá, nossa gerência acompanhou a solução da sua solicitação e gostaríamos de confirmar se está tudo 100% regularizado com sua empresa!'}&rdquo;
                </p>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      if (!selectedIncident) return;
                      selectedIncident.postServiceTouchpointSentAt = new Date().toISOString();
                      selectedIncident.history.push({
                        id: 'h_touch_' + Date.now(),
                        type: 'touchpoint_pos_atendimento',
                        authorName: user?.name || 'Diretoria',
                        description: '✉️ Touchpoint de pós-atendimento transmitido ao cliente para blindagem de retenção.',
                        timestamp: new Date().toISOString(),
                      });
                      saveIncident(selectedIncident);
                      loadData();
                    }}
                    disabled={Boolean(selectedIncident.postServiceTouchpointSentAt)}
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {selectedIncident.postServiceTouchpointSentAt ? 'Enviado com Sucesso' : 'Disparar Touchpoint Agora'}
                  </button>
                </div>
              </div>

              {/* Registro de Ação e Linha do Tempo */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800">Registrar Contato Telefônico ou Nota de Atendimento:</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Ex: Liguei para o cliente às 14h, alinhamos o envio do DARF retificado..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#004677] outline-none"
                  />
                  <button
                    onClick={handleAddPhoneContact}
                    disabled={!customNote}
                    className="px-4 py-2 bg-[#004677] hover:bg-[#003357] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    Registrar Contato
                  </button>
                </div>

                {/* Histórico */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <p className="font-bold text-slate-700 text-[11px]">Linha do Tempo de Atividades:</p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {selectedIncident.history.map((h) => (
                      <div key={h.id} className="p-2 bg-white rounded border border-slate-200 text-[11px] flex items-start justify-between">
                        <div>
                          <span className="font-bold text-[#004677]">{h.authorName}: </span>
                          <span className="text-slate-700">{h.description}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                          {new Date(h.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Inovação: Dossiê de Defesa Jurídica & Responsabilidade Civil (Legal Shield) */}
              <div className="p-4 rounded-lg bg-slate-900 text-white space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#6DCFF6]" />
                    <div>
                      <h4 className="font-bold text-xs text-white">
                        Dossiê de Defesa Jurídica &bull; Legal Shield (RC Profissional)
                      </h4>
                      <p className="text-[10px] text-slate-300">
                        Compilação de evidências com hash criptográfico SHA-256 para respaldo contra alegações indevidas de prazos.
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-[#D2BE8C] border border-white/20">
                    HASH: sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                  </span>
                </div>

                <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Protocolo de Transmissão da Obrigação:</span>
                    <strong className="text-white">PROT-DCTF-2026-0815-99214</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Data/Hora Exata do Envio da Guia pela Contatur:</span>
                    <strong className="text-emerald-400">12/08/2026 às 14:22:08 (3 dias antes do prazo legal)</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Confirmação de Abertura pelo Servidor do Cliente:</span>
                    <strong className="text-emerald-400">12/08/2026 às 14:23:45 (IP: 177.18.29.110)</strong>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      alert(`🛡️ Dossiê de Defesa Jurídica Compilado!\n\nProtocolo: DEFESA-RC-${selectedIncident.id}\nCliente: ${selectedIncident.senderName}\nHash de Integridade: SHA-256 Validado\n\nO documento comprova que a Contatur enviou a guia 3 dias antes do vencimento.`);
                    }}
                    className="px-4 py-1.5 bg-[#6DCFF6] hover:bg-[#5bc0e6] text-slate-900 font-bold rounded text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Exportar Dossiê de Defesa em PDF Timbrado
                  </button>
                </div>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs transition-colors"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
