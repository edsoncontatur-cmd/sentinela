import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getQualityAudits, saveQualityAudit } from '../services/storage';
import { QualityAuditRecord } from '../types';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  User,
  Star,
  ThumbsUp,
  ThumbsDown,
  FileText
} from 'lucide-react';

export const QualityAudit: React.FC = () => {
  const { activeTenant, hasPermission } = useAuth();
  const [audits, setAudits] = useState<QualityAuditRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAudit, setSelectedAudit] = useState<QualityAuditRecord | null>(null);

  const loadData = () => {
    const data = getQualityAudits(activeTenant);
    setAudits(data);
  };

  useEffect(() => {
    loadData();
  }, [activeTenant]);

  const filteredAudits = audits.filter(
    (a) =>
      a.analystName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.replyTextAudited.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgScore = audits.length > 0
    ? Math.round(audits.reduce((acc, a) => acc + a.qualityScore, 0) / audits.length)
    : 100;

  const getToneBadge = (tone: QualityAuditRecord['toneClassification']) => {
    switch (tone) {
      case 'Excelente / Empático':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">🟢 Excelente / Empático</span>;
      case 'Adequado':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">🔵 Adequado</span>;
      case 'Frio / Distante':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">🟠 Frio / Distante</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">🔴 Ríspido / Inadequado</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Topo com Indicadores */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#004677] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#6DCFF6]" />
              Auditoria de Qualidade & Tom de Resposta dos Analistas
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              A IA audita e-mails enviados pelos analistas da Contatur, detectando rispidez, frieza ou falta de clareza preventiva.
            </p>
          </div>

          <div className="bg-sky-50 border border-sky-200 px-4 py-2.5 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#004677] text-white flex items-center justify-center font-bold">
              <Star className="w-5 h-5 text-[#D2BE8C]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Índice Médio de Qualidade</p>
              <p className="text-lg font-black text-[#004677] leading-tight">{avgScore} / 100</p>
            </div>
          </div>
        </div>

        {/* Busca */}
        <div className="pt-2 border-t border-slate-100 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-4.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por analista, departamento ou texto da resposta..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004677] outline-none"
          />
        </div>
      </div>

      {/* Grid de Auditorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAudits.map((audit) => (
          <div
            key={audit.id}
            className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 relative hover:border-[#004677] transition-all border-l-4 ${
              audit.qualityScore < 50
                ? 'border-l-red-500'
                : audit.qualityScore < 80
                ? 'border-l-amber-500'
                : 'border-l-emerald-500'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {audit.department} &bull; {audit.analystEmail}
                </span>
                <h3 className="font-bold text-sm text-[#004677] mt-0.5">{audit.analystName}</h3>
              </div>

              {getToneBadge(audit.toneClassification)}
            </div>

            {/* Resposta do Analista */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs leading-relaxed font-sans shadow-inner">
              <span className="font-bold text-[10px] text-slate-400 block uppercase mb-1">Resposta Auditada:</span>
              &ldquo;{audit.replyTextAudited}&rdquo;
            </div>

            {/* Feedback da IA */}
            <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-lg text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-[#004677] font-bold text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-[#6DCFF6]" />
                <span>Avaliação da IA ({audit.qualityScore} pts):</span>
              </div>
              <p className="text-slate-700 text-[11px] leading-relaxed">{audit.aiFeedback}</p>
            </div>

            {/* Trechos Problemáticos se houver */}
            {audit.flaggedPhrases.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {audit.flaggedPhrases.map((phrase, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold border border-red-200">
                    ⚠️ Termo Inadequado: &ldquo;{phrase}&rdquo;
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
