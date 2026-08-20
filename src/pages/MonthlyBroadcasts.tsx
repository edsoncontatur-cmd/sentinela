import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getMonthlyBroadcasts,
  approveCircularSection,
  rejectAndRegenerateSectionWithAI,
  dispatchMonthlyBroadcastToClients,
  getTenantConfig
} from '../services/storage';
import { MonthlyBroadcastCircular, CircularSectionItem } from '../types';
import {
  Radio,
  Send,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  FileText,
  Users,
  ShieldCheck,
  Building2,
  Calendar,
  Eye,
  CheckCheck,
  MessageSquareQuote
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';

export const MonthlyBroadcasts: React.FC = () => {
  const { activeTenant, currentTenant } = useAuth();
  const [broadcasts, setBroadcasts] = useState<MonthlyBroadcastCircular[]>(getMonthlyBroadcasts(activeTenant));
  const [selectedCircular, setSelectedCircular] = useState<MonthlyBroadcastCircular | null>(broadcasts[0] || null);
  
  // Modal de Leitura / Ajuste de Seção
  const [activeSectionKey, setActiveSectionKey] = useState<'folha' | 'fiscal' | 'contabil' | 'legal' | null>(null);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const activeConfig = getTenantConfig(activeTenant === 'all' ? 'contatur_sp' : activeTenant);

  const refreshBroadcasts = () => {
    const list = getMonthlyBroadcasts(activeTenant);
    setBroadcasts(list);
    if (selectedCircular) {
      const updated = list.find((b) => b.id === selectedCircular.id) || list[0] || null;
      setSelectedCircular(updated);
    }
  };

  const handleApprove = (key: 'folha' | 'fiscal' | 'contabil' | 'legal') => {
    if (!selectedCircular) return;
    const supervisorName = activeConfig.monthlyBroadcastSettings?.supervisors?.[key]?.name || 'Supervisor Responsável';
    approveCircularSection(selectedCircular.id, key, supervisorName);
    setSuccessToast(`Seção de ${key.toUpperCase()} aprovada com sucesso pelo Supervisor (${supervisorName})!`);
    setTimeout(() => setSuccessToast(null), 4000);
    setIsSectionModalOpen(false);
    refreshBroadcasts();
  };

  const handleRejectWithAi = (key: 'folha' | 'fiscal' | 'contabil' | 'legal') => {
    if (!selectedCircular || !feedbackText.trim()) return;
    setIsRegenerating(true);
    const supervisorName = activeConfig.monthlyBroadcastSettings?.supervisors?.[key]?.name || 'Supervisor';

    setTimeout(() => {
      rejectAndRegenerateSectionWithAI(selectedCircular.id, key, supervisorName, feedbackText);
      setIsRegenerating(false);
      setFeedbackText('');
      setIsSectionModalOpen(false);
      setSuccessToast(`A IA reprocessou e ajustou a proposta do setor ${key.toUpperCase()} com base na sua orientação!`);
      setTimeout(() => setSuccessToast(null), 5000);
      refreshBroadcasts();
    }, 1200);
  };

  const handleDispatch = () => {
    if (!selectedCircular) return;
    dispatchMonthlyBroadcastToClients(selectedCircular.id);
    setSuccessToast(`🎉 Circular enviada em lote com sucesso para todos os ${selectedCircular.totalRecipientsCount} clientes da carteira!`);
    setTimeout(() => setSuccessToast(null), 6000);
    refreshBroadcasts();
  };

  const openSectionModal = (key: 'folha' | 'fiscal' | 'contabil' | 'legal') => {
    setActiveSectionKey(key);
    setFeedbackText('');
    setIsSectionModalOpen(true);
  };

  if (!selectedCircular) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <Radio className="w-12 h-12 text-[#004677] mx-auto mb-3" />
        <h3 className="font-bold text-slate-800 text-lg">Nenhuma Circular Criada para esta Unidade</h3>
        <p className="text-sm text-slate-500 mt-1">A IA gera automaticamente uma nova pauta todo dia {activeConfig.monthlyBroadcastSettings?.dispatchDayOfMonth || 25}.</p>
      </div>
    );
  }

  const sectionsList: { key: 'folha' | 'fiscal' | 'contabil' | 'legal'; data: CircularSectionItem }[] = [
    { key: 'folha', data: selectedCircular.sections.folha },
    { key: 'fiscal', data: selectedCircular.sections.fiscal },
    { key: 'contabil', data: selectedCircular.sections.contabil },
    { key: 'legal', data: selectedCircular.sections.legal },
  ];

  const approvedCount = sectionsList.filter((s) => s.data.status === 'APROVADO').length;
  const isAllApproved = approvedCount === 4;

  const currentSectionData = activeSectionKey ? selectedCircular.sections[activeSectionKey] : null;

  return (
    <div className="space-y-6">
      {/* Toast de Sucesso */}
      {successToast && (
        <div className="p-4 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-between text-sm font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-5 h-5" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-white/80 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Topo da Tela */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Radio className="w-6 h-6 text-[#004677]" />
            <h1 className="text-xl font-bold text-[#004677]">
              Circulares Legislativas Mensais &bull; {currentTenant.name}
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            A IA redige mensalmente as orientações técnicas para os clientes (RH, Fiscal, Contábil e Societário) calibradas ao perfil da unidade (<strong>{selectedCircular.targetAudienceProfile}</strong>). O envio em massa só é liberado após a aprovação dos 4 supervisores.
          </p>
        </div>

        {/* Botão de Disparo Geral */}
        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="text-slate-500 block">Validação Departamental:</span>
            <span className={`font-black ${isAllApproved ? 'text-emerald-600' : 'text-amber-600'}`}>
              {approvedCount} de 4 Supervisores Aprovados
            </span>
          </div>

          <button
            disabled={!isAllApproved || selectedCircular.overallStatus === 'DISPARADO_EM_LOTE'}
            onClick={handleDispatch}
            className={`px-5 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all shadow-sm ${
              selectedCircular.overallStatus === 'DISPARADO_EM_LOTE'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                : isAllApproved
                ? 'bg-[#004677] hover:bg-[#003357] text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            {selectedCircular.overallStatus === 'DISPARADO_EM_LOTE'
              ? 'Circular Transmitida à Carteira ✓'
              : 'Disparar Circular para Toda a Carteira'}
          </button>
        </div>
      </div>

      {/* Banner de Status da Edição Atual */}
      <div className="p-4 bg-gradient-to-r from-[#004677] to-[#003357] text-white rounded-xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-lg">
            <Calendar className="w-6 h-6 text-[#6DCFF6]" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#D2BE8C] tracking-wider">
              Edição Oficial {selectedCircular.editionMonth} &bull; Previsão de Envio: {new Date(selectedCircular.scheduledDispatchDate).toLocaleDateString('pt-BR')}
            </span>
            <h2 className="text-base font-bold text-white">{selectedCircular.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-xs">
          <Users className="w-4 h-4 text-[#6DCFF6]" />
          <span>Destinatários: <strong>{selectedCircular.totalRecipientsCount} Empresas Clientes</strong></span>
        </div>
      </div>

      {/* Grid com as 4 Portas de Aprovação dos Supervisores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sectionsList.map(({ key, data }) => (
          <div
            key={key}
            className={`bg-white rounded-xl border p-5 shadow-sm space-y-4 relative flex flex-col justify-between transition-all ${
              data.status === 'APROVADO'
                ? 'border-emerald-200 bg-emerald-50/20'
                : data.status === 'REJEITADO_AJUSTAR'
                ? 'border-amber-200 bg-amber-50/20'
                : 'border-slate-200'
            }`}
          >
            <div className="space-y-2">
              {/* Header do Card Setorial */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#004677]" />
                  <span className="font-bold text-xs text-[#004677] uppercase tracking-wide">
                    {data.departmentLabel}
                  </span>
                </div>

                {data.status === 'APROVADO' ? (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold flex items-center gap-1 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aprovado pelo Supervisor
                  </span>
                ) : data.status === 'REJEITADO_AJUSTAR' ? (
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold flex items-center gap-1 border border-amber-200">
                    <RotateCcw className="w-3 h-3 text-amber-600" /> Em Revisão pela IA
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-sky-100 text-[#004677] rounded-full text-[10px] font-bold flex items-center gap-1 border border-sky-200">
                    <Sparkles className="w-3 h-3 text-[#004677]" /> Aguardando Validação
                  </span>
                )}
              </div>

              {/* Título & Resumo da Notícia Gerada por IA */}
              <div>
                <span className="text-[10px] font-bold text-slate-400">Versão {data.versionNumber} &bull; Supervisor: {data.supervisorName}</span>
                <h3 className="font-bold text-slate-800 text-sm mt-0.5 leading-snug">{data.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{data.summary}</p>
              </div>

              {/* Recomendação Prática para o Cliente */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-700 space-y-1">
                <span className="font-bold text-[#004677] block">💡 Orientação Prática ao Cliente:</span>
                <p>{data.actionableRecommendation}</p>
              </div>
            </div>

            {/* Ações do Supervisor */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => openSectionModal(key)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-slate-600" />
                Ler Texto & Ajustar com IA
              </button>

              {data.status !== 'APROVADO' ? (
                <button
                  onClick={() => handleApprove(key)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Aprovar Seção
                </button>
              ) : (
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  ✓ Validado para Envio
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Interativo de Revisão & Iteração com IA */}
      <Dialog open={isSectionModalOpen} onOpenChange={setIsSectionModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white border-t-4 border-t-[#004677]">
          {currentSectionData && activeSectionKey && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-2 text-[#004677]">
                  <Sparkles className="w-5 h-5 text-[#6DCFF6]" />
                  <DialogTitle className="text-lg font-bold">
                    Revisão Técnica: {currentSectionData.departmentLabel} (v{currentSectionData.versionNumber})
                  </DialogTitle>
                </div>
                <DialogDescription className="text-xs text-slate-500">
                  Supervisor Responsável: <strong>{currentSectionData.supervisorName}</strong> ({currentSectionData.supervisorEmail})
                </DialogDescription>
              </DialogHeader>

              {/* Texto Completo da Notícia */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-[#004677] text-sm">{currentSectionData.title}</h4>
                <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {currentSectionData.fullBodyText}
                </div>
              </div>

              {/* Campo para o Supervisor Pedir Ajustes à IA */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MessageSquareQuote className="w-4 h-4 text-[#004677]" />
                  Não concorda com algum ponto? Peça para a IA reformular:
                </label>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Ex: O prazo da convenção coletiva foi prorrogado para o dia 30, favor ajustar o texto e enfatizar as agências de turismo..."
                  className="w-full p-3 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#004677] focus:ring-1 focus:ring-[#004677]"
                />
              </div>

              {/* Botões do Modal */}
              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  disabled={!feedbackText.trim() || isRegenerating}
                  onClick={() => handleRejectWithAi(activeSectionKey)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    !feedbackText.trim() || isRegenerating
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                  }`}
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                  {isRegenerating ? 'A IA está reescrevendo...' : 'Solicitar Ajustes & Refazer com IA'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSectionModalOpen(false)}
                    className="px-3 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold"
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(activeSectionKey)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Aprovar e Liberar Seção
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
