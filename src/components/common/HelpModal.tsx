import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { DetailedHelpItem } from '../../data/helpCatalog';
import {
  HelpCircle,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Info,
  Layers,
  Search,
  CheckSquare,
  HelpCircle as QuestionIcon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  helpData: DetailedHelpItem;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  helpData,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'whatIs' | 'beforeYouStart' | 'fieldGuide' | 'stepByStep' | 'troubleshooting'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!helpData) return null;

  const { sections, title, subtitle } = helpData;

  const filteredFields = sections.fieldGuide.items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredIssues = sections.troubleshooting.issues.filter(
    (item) =>
      item.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.solution.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[88vh] flex flex-col bg-white border-t-4 border-t-[#004677] p-0 overflow-hidden shadow-2xl rounded-2xl">
        {/* Header com Identidade Contatur */}
        <div className="p-6 bg-gradient-to-r from-[#004677] to-[#003357] text-white space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-xs">
                <HelpCircle className="w-6 h-6 text-[#6DCFF6]" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#D2BE8C]">
                  Manual do Usuário & Central de Ajuda Oficial
                </span>
                <DialogTitle className="text-xl font-bold text-white leading-tight">
                  {title}
                </DialogTitle>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed max-w-2xl">
            {subtitle}
          </p>

          {/* Campo de Busca Rápida no Help */}
          <div className="pt-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-300 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar termo, botão, campo ou dúvida neste guia..."
                className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-slate-300 outline-none focus:bg-white/20 focus:border-[#6DCFF6] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Abas de Navegação Rápida do Help */}
        <div className="flex flex-wrap gap-1 p-2 bg-slate-100 border-b border-slate-200 text-xs shrink-0 px-6">
          {[
            { id: 'all', label: '📖 Guia Completo' },
            { id: 'whatIs', label: '1. O que é' },
            { id: 'beforeYouStart', label: '2. Pré-requisitos' },
            { id: 'fieldGuide', label: '3. Guia de Campos' },
            { id: 'stepByStep', label: '4. Passo a Passo' },
            { id: 'troubleshooting', label: '5. FAQ / Soluções' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                activeTab === tab.id
                  ? 'bg-[#004677] text-white shadow-xs'
                  : 'bg-transparent text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo Rico do Help com Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-800 leading-relaxed">
          {/* SEÇÃO 1: O QUE É */}
          {(activeTab === 'all' || activeTab === 'whatIs') && (
            <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-100 space-y-3">
              <h4 className="text-sm font-bold text-[#004677] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#6DCFF6]" />
                {sections.whatIs.title}
              </h4>
              <p className="text-slate-700 leading-relaxed">{sections.whatIs.content}</p>

              {sections.whatIs.highlights && sections.whatIs.highlights.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="font-bold text-[11px] text-[#004677] block uppercase tracking-wide">
                    Destaques Principais:
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {sections.whatIs.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-white rounded-lg border border-sky-100 text-slate-700">
                        <Sparkles className="w-3.5 h-3.5 text-[#004677] shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SEÇÃO 2: ANTES DE COMEÇAR */}
          {(activeTab === 'all' || activeTab === 'beforeYouStart') && (
            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-3">
              <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                {sections.beforeYouStart.title}
              </h4>
              
              <ul className="space-y-1.5">
                {sections.beforeYouStart.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>

              <div className="p-2.5 bg-white rounded-lg border border-amber-200 text-amber-900 text-[11px] font-medium flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span><strong>Permissões de Acesso:</strong> {sections.beforeYouStart.rolePermissions}</span>
              </div>
            </div>
          )}

          {/* SEÇÃO 3: GUIA DE CAMPOS E BOTÕES */}
          {(activeTab === 'all' || activeTab === 'fieldGuide') && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[#004677] flex items-center gap-2 border-b border-slate-200 pb-2">
                <Layers className="w-4 h-4 text-[#6DCFF6]" />
                {sections.fieldGuide.title}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredFields.map((f, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 hover:border-[#004677] transition-all">
                    <span className="font-bold text-[#004677] text-xs block">{f.name}</span>
                    <p className="text-slate-600 leading-relaxed">{f.description}</p>
                    {f.tip && (
                      <p className="text-[11px] text-emerald-700 bg-emerald-50 p-1.5 rounded border border-emerald-100 mt-1 font-medium">
                        💡 <strong>Dica:</strong> {f.tip}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEÇÃO 4: PASSO A PASSO */}
          {(activeTab === 'all' || activeTab === 'stepByStep') && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-sm font-bold text-[#004677] flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                {sections.stepByStep.title}
              </h4>

              <div className="space-y-2">
                {sections.stepByStep.steps.map((st, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-[#004677] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-slate-700">{st.replace(/^\d+\.\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEÇÃO 5: PROBLEMAS COMUNS / FAQ */}
          {(activeTab === 'all' || activeTab === 'troubleshooting') && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-red-700 flex items-center gap-2 border-b border-slate-200 pb-2">
                <QuestionIcon className="w-4 h-4 text-red-600" />
                {sections.troubleshooting.title}
              </h4>

              <div className="space-y-3">
                {filteredIssues.map((iss, i) => (
                  <div key={i} className="p-3.5 bg-red-50/40 border border-red-200 rounded-xl space-y-2">
                    <div className="flex items-start gap-2 text-red-900 font-bold">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{iss.problem}</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-red-100 text-slate-700 leading-relaxed text-[11px]">
                      <span className="font-bold text-emerald-700 block mb-0.5">✓ Como Resolver:</span>
                      {iss.solution}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Fechamento */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 px-6">
          <span className="text-[11px] text-slate-500 font-medium">
            Grupo Contatur &bull; Manual Operacional Integrado v2.0
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#004677] hover:bg-[#003357] text-white rounded-lg font-bold text-xs transition-colors shadow-sm"
          >
            Entendido, fechar ajuda
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
