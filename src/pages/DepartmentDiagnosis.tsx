import React from 'react';
import { useAuth } from '../context/AuthContext';
import { getDepartmentMetrics } from '../services/storage';
import {
  Layers,
  Award,
  Clock,
  Star,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ThumbsUp,
  ShieldCheck
} from 'lucide-react';

export const DepartmentDiagnosis: React.FC = () => {
  const { activeTenant, currentTenant } = useAuth();
  const metrics = getDepartmentMetrics(activeTenant);

  return (
    <div className="space-y-6">
      {/* Topo da Tela */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-1">
        <div className="flex items-center gap-2">
          <Layers className="w-6 h-6 text-[#004677]" />
          <h1 className="text-xl font-bold text-[#004677]">
            Termômetro de Eficiência por Departamento &bull; {currentTenant.name}
          </h1>
        </div>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          Comparativo setorial de velocidade de resposta, satisfação média dos clientes (CSAT), volume de elogios vs. atritos e cumprimento de SLAs entre Fiscal, Folha, Contábil e Societário.
        </p>
      </div>

      {/* Grid com os 4 Departamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((m, idx) => (
          <div
            key={m.department}
            className={`bg-white p-6 rounded-xl border border-slate-200 shadow-md space-y-4 relative border-t-4 ${
              idx === 0 ? 'border-t-[#004677]' : idx === 1 ? 'border-t-[#6DCFF6]' : idx === 2 ? 'border-t-[#D2BE8C]' : 'border-t-emerald-600'
            }`}
          >
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Setor Operacional #{idx + 1}
                </span>
                <h3 className="font-bold text-base text-[#004677]">{m.departmentLabel}</h3>
              </div>
              <Award className="w-5 h-5 text-[#D2BE8C]" />
            </div>

            {/* Barra de Satisfação CSAT */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> Nota Média CSAT:
                </span>
                <span className="font-black text-[#004677] text-sm">{m.csatAverageRating} / 5.0</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#004677] to-[#6DCFF6] rounded-full"
                  style={{ width: `${(m.csatAverageRating / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Métricas do Setor */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                <span className="text-slate-500 block text-[11px]">Tempo Médio Resposta</span>
                <span className="font-bold text-[#004677] text-base">{m.avgResponseTimeHours} horas</span>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg space-y-1">
                <span className="text-emerald-800 block text-[11px]">Conformidade de SLA</span>
                <span className="font-bold text-emerald-600 text-base">{m.slaComplianceRate}%</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                <span className="text-slate-500 block text-[11px]">Chamados Resolvidos</span>
                <span className="font-bold text-slate-800 text-base">{m.totalIncidentsResolved}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                <span className="text-slate-500 block text-[11px] flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3 text-emerald-600" /> Elogios Registrados
                </span>
                <span className="font-bold text-slate-800 text-base">{m.praisesCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
