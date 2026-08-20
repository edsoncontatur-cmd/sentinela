import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTeamWorkload, saveTeamWorkload } from '../services/storage';
import { TeamWorkloadMember } from '../types';
import {
  Users,
  AlertTriangle,
  Clock,
  Mail,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
  Flame,
  ArrowRightLeft,
  Sparkles,
  Award
} from 'lucide-react';

export const TeamWorkload: React.FC = () => {
  const { activeTenant, currentTenant } = useAuth();
  const [workload, setWorkload] = useState<TeamWorkloadMember[]>(getTeamWorkload(activeTenant));
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleApplyRebalance = (memberId: string) => {
    const updated = workload.map((m) => {
      if (m.id === memberId) {
        return {
          ...m,
          activeAssignedClientsCount: Math.max(15, m.activeAssignedClientsCount - 6),
          emailsReceivedThisMonth: Math.round(m.emailsReceivedThisMonth * 0.8),
          burnoutRiskLevel: 'MODERADO' as const,
          isOverloaded: false,
          rebalancingRecommendation: 'Rebalanceamento aplicado! 6 empresas distribuídas preventivamente.',
        };
      }
      return m;
    });

    setWorkload(updated);
    saveTeamWorkload(updated);
    setSuccessToast('✓ Rebalanceamento de carteira executado com sucesso! Carga de trabalho equalizada.');
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const overloadedCount = workload.filter((w) => w.isOverloaded).length;
  const totalEmails = workload.reduce((acc, w) => acc + w.emailsReceivedThisMonth, 0);
  const avgResponseTime = workload.length > 0
    ? (workload.reduce((acc, w) => acc + w.averageResponseTimeHours, 0) / workload.length).toFixed(1)
    : '1.6';

  return (
    <div className="space-y-6">
      {/* Toast de Sucesso */}
      {successToast && (
        <div className="p-4 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-between text-sm font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-white/80 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Topo da Tela */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-600" />
            <h1 className="text-xl font-bold text-[#004677]">
              Matriz de Carga de Trabalho & Burnout &bull; {currentTenant.name}
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Monitoramento preventivo do volume de e-mails, velocidade de resposta e estafa operacional dos analistas nas quinzenas críticas (fechamento de folha dias 1 a 10 e tributário dias 15 a 20).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl border flex items-center gap-3 ${
            overloadedCount > 0 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <AlertTriangle className="w-5 h-5" />
            <div className="text-xs">
              <span className="font-bold block">{overloadedCount} Analistas Sobrecarregados</span>
              <span className="text-[10px] text-slate-500">Requer rebalanceamento de clientes</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs de Capacidade Operacional */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 font-bold">
            <Mail className="w-4 h-4 text-[#004677]" /> Volume Total de E-mails (Mês)
          </span>
          <span className="text-2xl font-black text-slate-900">{totalEmails}</span>
          <span className="text-[10px] text-slate-400 block">Distribuídos entre a equipe</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 font-bold">
            <Clock className="w-4 h-4 text-[#6DCFF6]" /> Tempo Médio de Resposta
          </span>
          <span className="text-2xl font-black text-[#004677]">{avgResponseTime} horas</span>
          <span className="text-[10px] text-emerald-600 block font-bold">✓ Dentro do SLA contratual</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 font-bold">
            <Users className="w-4 h-4 text-[#D2BE8C]" /> Analistas Monitorados
          </span>
          <span className="text-2xl font-black text-slate-900">{workload.length}</span>
          <span className="text-[10px] text-slate-400 block">Fiscal, DP, Contábil e Legal</span>
        </div>
      </div>

      {/* Grid de Analistas e Recomendações de IA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workload.map((member) => (
          <div
            key={member.id}
            className={`bg-white p-5 rounded-xl border shadow-sm space-y-4 relative transition-all ${
              member.isOverloaded ? 'border-red-200 bg-red-50/10' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Setor: {member.department} &bull; {member.analystEmail}
                </span>
                <h3 className="font-bold text-base text-slate-900">{member.analystName}</h3>
              </div>

              {member.burnoutRiskLevel === 'CRITICO_SOBRECARGA' ? (
                <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-[10px] font-bold flex items-center gap-1 border border-red-200">
                  <Flame className="w-3 h-3 text-red-600" /> Sobrecarga Crítica
                </span>
              ) : member.burnoutRiskLevel === 'ALTO' ? (
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold flex items-center gap-1 border border-amber-200">
                  <AlertTriangle className="w-3 h-3 text-amber-600" /> Risco Alto
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold flex items-center gap-1 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Carga Saudável
                </span>
              )}
            </div>

            {/* Indicadores do Analista */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg text-center">
                <span className="text-[10px] text-slate-500 block">Clientes Carteira</span>
                <span className="font-bold text-slate-900 text-sm">{member.activeAssignedClientsCount}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg text-center">
                <span className="text-[10px] text-slate-500 block">E-mails (Mês)</span>
                <span className="font-bold text-slate-900 text-sm">{member.emailsReceivedThisMonth}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg text-center">
                <span className="text-[10px] text-slate-500 block">Tempo Médio</span>
                <span className="font-bold text-[#004677] text-sm">{member.averageResponseTimeHours}h</span>
              </div>
            </div>

            {/* Recomendação da IA de Rebalanceamento */}
            {member.rebalancingRecommendation && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Sugestão de Rebalanceamento Inteligente da IA:</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{member.rebalancingRecommendation}</p>

                {member.isOverloaded && (
                  <button
                    onClick={() => handleApplyRebalance(member.id)}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Aplicar Rebalanceamento Automático de Carteira
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
