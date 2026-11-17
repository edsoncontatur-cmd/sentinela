import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getIncidents } from '../services/storage';
import { FileText, Download, Printer, CheckCircle2 } from 'lucide-react';
import { CartaoComposicao } from '@/components/common/CartaoComposicao';
import { composicaoIncidentesPorSeveridade } from '@/lib/composicao-cartoes';

export const ReportsPage: React.FC = () => {
  const { activeTenant } = useAuth();
  const incidents = getIncidents(activeTenant);

  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const totalIncidents = incidents.length;
  const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL').length;
  const highCount = incidents.filter((i) => i.severity === 'HIGH').length;
  const resolvedCount = incidents.filter((i) => i.status === 'RESOLVIDO').length;

  const handleExportCsv = () => {
    const headers = ['Data', 'Remetente', 'Email', 'Assunto', 'Severidade', 'Departamento', 'Risco Churn', 'Status'];
    const rows = incidents.map((i) => [
      new Date(i.receivedAt).toLocaleDateString('pt-BR'),
      `"${i.senderName.replace(/"/g, '""')}"`,
      i.senderEmail,
      `"${i.subject.replace(/"/g, '""')}"`,
      i.severity,
      i.category,
      `${i.churnRiskScore}%`,
      i.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_sentinel_${activeTenant}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess('Relatório exportado em CSV/Excel com sucesso!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Topo */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#004677] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#6DCFF6]" />
              Relatórios Executivos & Auditoria de Atendimento
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Consolidação de métricas, índices de churn e relatórios periódicos de qualidade para a Diretoria.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / PDF
            </button>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#004677] hover:bg-[#003357] text-white rounded-lg text-xs font-bold shadow transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar Excel / CSV
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{downloadSuccess}</span>
          </div>
        )}
      </div>

      {/* Sumário Executivo */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#004677]">Boletim de Retenção & Qualidade Operacional</h2>
            <p className="text-xs text-slate-500">Unidade: {activeTenant.toUpperCase()} &bull; Grupo Contatur</p>
          </div>
          <span className="text-xs font-bold bg-sky-50 text-[#004677] px-3 py-1 rounded-full border border-sky-200">
            Período: Agosto / 2026
          </span>
        </div>

        {/* Resumo em Números — clique abre a composição */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <CartaoComposicao
            testId="kpi-relatorio-total"
            titulo="Total de Atritos"
            valor={totalIncidents}
            valorClassName="text-primary"
            explica="Todas as ocorrências registradas na unidade no período do boletim."
            linhas={composicaoIncidentesPorSeveridade(incidents, 'TODOS')}
            rodape={`${totalIncidents} ocorrência(s)`}
            className="bg-slate-50 p-4 shadow-none"
          />
          <CartaoComposicao
            testId="kpi-relatorio-criticos"
            titulo="Críticos (Nível 1)"
            tituloClassName="text-red-700"
            valor={criticalCount}
            valorClassName="text-red-600"
            explica="Ocorrências classificadas pela IA com severidade CRITICAL."
            linhas={composicaoIncidentesPorSeveridade(incidents, 'CRITICAL')}
            rodape={`${criticalCount} crítico(s)`}
            className="bg-red-50 border-red-200 p-4 shadow-none"
          />
          <CartaoComposicao
            testId="kpi-relatorio-alta"
            titulo="Severidade Alta"
            tituloClassName="text-amber-800"
            valor={highCount}
            valorClassName="text-amber-700"
            explica="Ocorrências classificadas pela IA com severidade HIGH."
            linhas={composicaoIncidentesPorSeveridade(incidents, 'HIGH')}
            rodape={`${highCount} de severidade alta`}
            className="bg-amber-50 border-amber-200 p-4 shadow-none"
          />
          <CartaoComposicao
            testId="kpi-relatorio-resolvidos"
            titulo="Resolvidos"
            tituloClassName="text-emerald-800"
            valor={resolvedCount}
            valorClassName="text-emerald-700"
            explica="Ocorrências com status RESOLVIDO no boletim da unidade."
            linhas={composicaoIncidentesPorSeveridade(incidents, 'RESOLVIDO')}
            rodape={`${resolvedCount} resolvido(s) de ${totalIncidents}`}
            className="bg-emerald-50 border-emerald-200 p-4 shadow-none"
          />
        </div>

        {/* Tabela do Relatório */}
        <div className="space-y-2">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
            Detalhamento de Todas as Ocorrências Registradas
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Data</th>
                  <th className="p-2.5">Cliente / Fornecedor</th>
                  <th className="p-2.5">Assunto</th>
                  <th className="p-2.5">Depto</th>
                  <th className="p-2.5">Severidade</th>
                  <th className="p-2.5">Risco Churn</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incidents.map((inc) => (
                  <tr key={inc.id}>
                    <td className="p-2.5 whitespace-nowrap">{new Date(inc.receivedAt).toLocaleDateString('pt-BR')}</td>
                    <td className="p-2.5 font-bold text-[#004677]">{inc.senderName}</td>
                    <td className="p-2.5">{inc.subject}</td>
                    <td className="p-2.5 font-semibold">{inc.category}</td>
                    <td className="p-2.5">{inc.severity}</td>
                    <td className="p-2.5 font-bold text-red-600">{inc.churnRiskScore}%</td>
                    <td className="p-2.5">{inc.status}</td>
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
