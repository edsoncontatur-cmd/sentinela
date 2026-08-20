import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getIncidents, getClients, getMailboxes } from '../services/storage';
import { FileText, Download, Printer, Filter, CheckCircle2, TrendingUp, ShieldAlert } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { activeTenant } = useAuth();
  const incidents = getIncidents(activeTenant);
  const clients = getClients(activeTenant);
  const mailboxes = getMailboxes(activeTenant);

  const [period, setPeriod] = useState('mensal');
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

        {/* Resumo em Números */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-2xl font-black text-[#004677]">{totalIncidents}</p>
            <p className="text-[11px] font-bold text-slate-500 uppercase mt-1">Total de Atritos</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-2xl font-black text-red-600">{criticalCount}</p>
            <p className="text-[11px] font-bold text-red-700 uppercase mt-1">Críticos (Nível 1)</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-2xl font-black text-amber-700">{highCount}</p>
            <p className="text-[11px] font-bold text-amber-800 uppercase mt-1">Severidade Alta</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-2xl font-black text-emerald-700">{resolvedCount}</p>
            <p className="text-[11px] font-bold text-emerald-800 uppercase mt-1">Resolvidos</p>
          </div>
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
