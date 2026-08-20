import React from 'react';
import { useAuth } from '../context/AuthContext';
import { getTenants, getIncidents, getClients, getMailboxes } from '../services/storage';
import {
  BarChart3,
  Building2,
  TrendingUp,
  ShieldAlert,
  Clock,
  CheckCircle2,
  DollarSign,
  Star,
  Award
} from 'lucide-react';

export const UnitBenchmark: React.FC = () => {
  const tenants = getTenants();
  const allIncidents = getIncidents('all');
  const allClients = getClients('all');
  const allMailboxes = getMailboxes('all');

  const unitMetrics = tenants.map((t) => {
    const unitIncidents = (allIncidents || []).filter((i) => i.tenantId === t.id);
    const unitClients = (allClients || []).filter((c) => c.tenantId === t.id);
    const criticalIncidents = unitIncidents.filter((i) => i.severity === 'CRITICAL').length;
    const resolvedIncidents = unitIncidents.filter((i) => i.status === 'RESOLVIDO').length;

    const resolutionRate = unitIncidents.length > 0
      ? Math.round((resolvedIncidents / unitIncidents.length) * 100)
      : 100;

    const criticalHonorariosRisk = unitClients
      .filter((c) => c.statusRelacionamento === 'Crítico')
      .reduce((acc, c) => acc + (c.monthlyFee || 0), 0);

    const avgHealthScore = unitClients.length > 0
      ? Math.round(unitClients.reduce((acc, c) => acc + (c.healthScore || 80), 0) / unitClients.length)
      : 85;

    const monthlyRevenue = t.monthlyRevenueTotal ?? 150000;

    return {
      tenant: t,
      totalIncidents: unitIncidents.length,
      criticalIncidents,
      resolvedIncidents,
      resolutionRate,
      criticalHonorariosRisk,
      avgHealthScore,
      monthlyRevenue,
      totalClients: unitClients.length,
    };
  });

  return (
    <div className="space-y-6">
      {/* Topo do Benchmark */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-[#D2BE8C]" />
          <h1 className="text-xl font-bold text-[#004677]">
            Benchmark Executivo Comparativo &bull; Grupo Contatur
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          Comparativo de eficiência operacional, tempo de resposta, satisfação e risco financeiro entre as 3 empresas do grupo.
        </p>
      </div>

      {/* Grid Comparativo dos 3 Escritórios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {unitMetrics.map((um, idx) => (
          <div
            key={um.tenant.id}
            className={`bg-white p-6 rounded-xl border border-slate-200 shadow-md space-y-5 relative border-t-4 ${
              idx === 0 ? 'border-t-[#004677]' : idx === 1 ? 'border-t-[#6DCFF6]' : 'border-t-[#D2BE8C]'
            }`}
          >
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {um.tenant.city} &bull; {um.tenant.uf}
                </span>
                <h3 className="font-bold text-lg text-[#004677]">{um.tenant.name}</h3>
              </div>
              <Building2 className="w-5 h-5 text-slate-400" />
            </div>

            {/* Health Score Geral da Unidade */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Satisfação Média (NPS Relacional):</span>
                <span className="font-black text-[#004677] text-sm">{um.avgHealthScore} / 100</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#004677] to-[#6DCFF6] rounded-full transition-all duration-500"
                  style={{ width: `${um.avgHealthScore}%` }}
                />
              </div>
            </div>

            {/* Métricas Principais */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                <span className="text-slate-600">Faturamento da Carteira:</span>
                <span className="font-bold text-slate-900">
                  R$ {um.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-red-50 border border-red-100">
                <span className="text-red-800 font-bold">Honorários sob Risco Crítico:</span>
                <span className="font-black text-red-600">
                  R$ {um.criticalHonorariosRisk.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                <span className="text-slate-600">Taxa de Resolução no Prazo:</span>
                <span className="font-bold text-emerald-600">{um.resolutionRate}%</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                <span className="text-slate-600">Total de Ocorrências:</span>
                <span className="font-bold text-slate-900">{um.totalIncidents} ({um.criticalIncidents} críticas)</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
