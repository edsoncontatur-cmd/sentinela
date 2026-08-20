import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCommercialLeads, saveCommercialLead, getTenantConfig } from '../services/storage';
import { pushLeadToSgc } from '../services/sgcService';
import { CommercialLead, CommercialOpportunityType } from '../types';
import {
  TrendingUp,
  DollarSign,
  Sparkles,
  Search,
  FileText,
  Copy,
  Send,
  Building,
  CheckCircle2,
  X,
  Briefcase,
  ExternalLink,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export const CommercialOpportunities: React.FC = () => {
  const { activeTenant, hasPermission, user } = useAuth();
  const [leads, setLeads] = useState<CommercialLead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<CommercialLead | null>(null);
  const [copiedProposal, setCopiedProposal] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);
  const [pushingToSgc, setPushingToSgc] = useState(false);

  const targetTenant = activeTenant === 'all' ? 'contatur_sp' : activeTenant;
  const config = getTenantConfig(targetTenant);

  const loadData = () => {
    const data = getCommercialLeads(activeTenant);
    setLeads(data);
  };

  useEffect(() => {
    loadData();
  }, [activeTenant]);

  const filteredLeads = leads.filter((l) => {
    const matchSearch =
      l.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.detectedTextSnippet.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPotentialRevenue = leads
    .filter((l) => l.status !== 'DECLINADO')
    .reduce((acc, l) => acc + l.estimatedMonthlyValue, 0);

  const handleCopyProposal = () => {
    if (!selectedLead) return;
    navigator.clipboard.writeText(selectedLead.aiProposalDraft);
    setCopiedProposal(true);
    setTimeout(() => setCopiedProposal(false), 2000);
  };

  const handleChangeStatus = (newStatus: CommercialLead['status']) => {
    if (!selectedLead) return;
    selectedLead.status = newStatus;
    saveCommercialLead(selectedLead);
    loadData();
    setStatusSuccess(`Status da oportunidade alterado para ${newStatus}!`);
    setTimeout(() => setStatusSuccess(null), 3000);
  };

  const handlePushToSgc = async (lead: CommercialLead) => {
    setPushingToSgc(true);
    try {
      const response = await pushLeadToSgc(lead, config);
      lead.sgcProposalId = response.proposalId;
      lead.sgcProposalCode = response.proposalCode;
      lead.sgcProposalUrl = response.proposalUrl;
      lead.sgcStatus = response.status;
      lead.sgcSyncedAt = new Date().toISOString();
      lead.status = 'EM_PROPOSTA';

      saveCommercialLead(lead);
      if (selectedLead && selectedLead.id === lead.id) {
        setSelectedLead({ ...lead });
      }
      loadData();
      setStatusSuccess(`🚀 Proposta ${response.proposalCode} gerada e enviada com sucesso para o SGC!`);
      setTimeout(() => setStatusSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setPushingToSgc(false);
    }
  };

  const getOpportunityBadge = (type: CommercialOpportunityType) => {
    switch (type) {
      case 'ABERTURA_FILIAL':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-[#004677] border border-sky-200">🏢 Abertura de Filial</span>;
      case 'AUMENTO_QUADRO_FOLHA':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">👥 Expansão de Quadro</span>;
      case 'BPO_FINANCEIRO':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">💼 BPO Financeiro</span>;
      case 'CONSULTORIA_TRIBUTARIA':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">⚖️ Consultoria Tributária</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">📈 Oportunidade</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Topo com KPIs Financeiros de Novos Honorários */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#004677] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Radar de Oportunidades & Integrador SGC
              </h1>
              <span className="px-2 py-0.5 bg-sky-100 text-[#004677] rounded text-[10px] font-bold border border-sky-200">
                Conectado ao SGC Contatur
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              A IA detecta intenções de compra nos e-mails e gera pré-propostas oficiais integradas ao SGC da unidade.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-800 uppercase">Potencial de Receita Extra</p>
              <p className="text-lg font-black text-emerald-700 leading-tight">
                R$ {totalPotentialRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, título ou trecho..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004677] outline-none"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-700 focus:ring-2 focus:ring-[#004677] outline-none"
            >
              <option value="all">Todos os Status de Oportunidade</option>
              <option value="NOVO">Novo Lead Detectado</option>
              <option value="EM_PROPOSTA">Em Elaboração / No SGC</option>
              <option value="CONTRATADO">Contratado / Upgrade Fechado</option>
              <option value="DECLINADO">Declinado</option>
            </select>
          </div>
        </div>
      </div>

      {statusSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusSuccess}</span>
        </div>
      )}

      {/* Grid de Cards de Oportunidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLeads.map((lead) => (
          <div
            key={lead.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 relative hover:border-[#004677] transition-all border-t-4 border-t-emerald-500"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                {getOpportunityBadge(lead.opportunityType)}
                <h3 className="font-bold text-sm text-[#004677] mt-2 line-clamp-1">{lead.title}</h3>
                <p className="text-[11px] text-slate-600 font-semibold">{lead.clientName}</p>
              </div>

              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {lead.status}
              </span>
            </div>

            {/* Trecho Detectado pela IA */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[11px] leading-relaxed italic">
              &ldquo;{lead.detectedTextSnippet}&rdquo;
            </div>

            {/* Status SGC se já integrado */}
            {lead.sgcProposalCode ? (
              <div className="p-2 bg-sky-50 border border-sky-200 rounded-lg flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-[#004677] font-bold">
                  <Briefcase className="w-3.5 h-3.5 text-[#6DCFF6]" />
                  <span>SGC: {lead.sgcProposalCode}</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-sky-200 text-[#004677]">
                  {lead.sgcStatus || 'RASCUNHO'}
                </span>
              </div>
            ) : (
              <div className="p-2 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-between text-[10px] text-slate-500">
                <span>Não exportado para o SGC</span>
                <button
                  onClick={() => handlePushToSgc(lead)}
                  disabled={pushingToSgc}
                  className="font-bold text-[#004677] hover:underline flex items-center gap-0.5"
                >
                  <span>Exportar 1-Click</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Valor e Confiança */}
            <div className="grid grid-cols-2 gap-2 p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100 text-xs">
              <div>
                <span className="text-emerald-800 text-[10px] block font-bold">Honorário Estimado:</span>
                <span className="font-black text-emerald-700">
                  + R$ {lead.estimatedMonthlyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 text-[10px] block">Precisão IA:</span>
                <span className="font-bold text-[#004677]">{lead.confidenceScore}%</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedLead(lead)}
              className="w-full py-2 bg-[#004677] hover:bg-[#003357] text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#6DCFF6]" />
              Ver Minuta & Ações SGC
            </button>
          </div>
        ))}
      </div>

      {/* Modal da Proposta Comercial & SGC */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-[#004677] text-white flex items-center justify-between border-b border-[#003357]">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#6DCFF6]" />
                  Proposta Comercial &bull; {selectedLead.title}
                </h3>
                <p className="text-xs text-slate-200">{selectedLead.clientName}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-1 rounded text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Card de Integração com o SGC */}
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#004677] text-xs flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-[#6DCFF6]" />
                      Esteira SGC (Sistema de Gestão de Contratos e Propostas)
                    </span>
                    <p className="text-[11px] text-slate-600">
                      Gere a proposta oficial no SGC para envio formal e assinatura digital do cliente.
                    </p>
                  </div>

                  {selectedLead.sgcProposalCode ? (
                    <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-200">
                      Sincronizado ({selectedLead.sgcProposalCode})
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePushToSgc(selectedLead)}
                      disabled={pushingToSgc}
                      className="px-3 py-1.5 bg-[#004677] hover:bg-[#003357] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {pushingToSgc ? 'Criando no SGC...' : 'Criar Proposta no SGC'}
                    </button>
                  )}
                </div>

                {selectedLead.sgcProposalCode && (
                  <div className="p-2.5 bg-white border border-sky-100 rounded-lg flex items-center justify-between text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Protocolo SGC Oficial:</span>
                      <span className="font-bold text-[#004677] font-mono">{selectedLead.sgcProposalCode}</span>
                    </div>
                    <a
                      href={selectedLead.sgcProposalUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-sky-100 hover:bg-sky-200 text-[#004677] font-bold rounded text-xs flex items-center gap-1 transition-colors"
                    >
                      <span>Abrir no SGC</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Impacto na Receita</span>
                  <span className="text-base font-black text-emerald-700">
                    + R$ {selectedLead.estimatedMonthlyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Status:</span>
                  <select
                    value={selectedLead.status}
                    onChange={(e) => handleChangeStatus(e.target.value as any)}
                    className="px-2 py-1 bg-white border border-slate-300 rounded font-bold text-[#004677]"
                  >
                    <option value="NOVO">NOVO</option>
                    <option value="EM_PROPOSTA">EM PROPOSTA</option>
                    <option value="CONTRATADO">CONTRATADO</option>
                    <option value="DECLINADO">DECLINADO</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">Minuta de Proposta Gerada pela IA:</label>
                  <button
                    onClick={handleCopyProposal}
                    className="text-[11px] font-bold text-[#004677] hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedProposal ? 'Copiado!' : 'Copiar Proposta'}
                  </button>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg whitespace-pre-wrap font-sans text-slate-800 leading-relaxed max-h-52 overflow-y-auto">
                  {selectedLead.aiProposalDraft}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2 bg-[#004677] text-white font-bold rounded-lg text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
