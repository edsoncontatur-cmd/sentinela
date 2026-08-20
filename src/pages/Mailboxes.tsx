import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMailboxes, saveMailbox, getTenantConfig } from '../services/storage';
import { MonitoredMailbox, DepartmentType, TenantConfig } from '../types';
import {
  Mail,
  RefreshCw,
  Power,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Search,
  Plus,
  ShieldAlert
} from 'lucide-react';

export const Mailboxes: React.FC = () => {
  const { activeTenant, hasPermission } = useAuth();
  const [mailboxes, setMailboxes] = useState<MonitoredMailbox[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const targetTenant = activeTenant === 'all' ? 'contatur_sp' : activeTenant;
  const config = getTenantConfig(targetTenant);

  const loadData = () => {
    const data = getMailboxes(activeTenant);
    setMailboxes(data);
  };

  useEffect(() => {
    loadData();
  }, [activeTenant]);

  const filteredMailboxes = mailboxes.filter(
    (m) =>
      m.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleActive = (mailbox: MonitoredMailbox) => {
    if (!hasPermission('mailboxes', 'toggleActive')) return;
    mailbox.isActive = !mailbox.isActive;
    mailbox.status = mailbox.isActive ? 'ativo' : 'pausado';
    saveMailbox(mailbox);
    loadData();
  };

  const handleSyncAll = () => {
    if (!hasPermission('mailboxes', 'triggerSync')) return;
    setSyncingAll(true);
    setSyncSuccessMsg(null);

    setTimeout(() => {
      const updated = mailboxes.map((m) => ({
        ...m,
        lastSyncAt: new Date().toISOString(),
        status: m.isActive ? ('ativo' as const) : ('pausado' as const),
      }));
      updated.forEach((m) => saveMailbox(m));
      setMailboxes(updated);
      setSyncingAll(false);
      setSyncSuccessMsg('Sincronização de 100% das caixas concluída via API corporativa!');
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Topo */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#004677] flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#6DCFF6]" />
              Central de Caixas Postais Monitoradas
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Descoberta e sincronização contínua de todas as caixas de e-mail corporativas da unidade.
            </p>
          </div>

          <button
            onClick={handleSyncAll}
            disabled={syncingAll}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#004677] hover:bg-[#003357] text-white rounded-lg text-xs font-bold shadow transition-all shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin' : ''}`} />
            {syncingAll ? 'Sincronizando Domínio...' : 'Sincronizar Todas as Caixas'}
          </button>
        </div>

        {syncSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{syncSuccessMsg}</span>
            </div>
            <button onClick={() => setSyncSuccessMsg(null)} className="text-emerald-700 font-bold hover:underline">
              Fechar
            </button>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-4.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por conta de e-mail ou nome da caixa..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004677] outline-none"
          />
        </div>
      </div>

      {/* Grid de Caixas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMailboxes.map((mb) => (
          <div
            key={mb.id}
            className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 transition-all ${
              !mb.isActive ? 'opacity-60 bg-slate-50' : 'hover:border-[#004677]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {mb.provider.toUpperCase()} &bull; {mb.department}
                </span>
                <h3 className="font-bold text-sm text-[#004677] mt-0.5 line-clamp-1">{mb.displayName}</h3>
                <p className="text-[11px] text-slate-600 font-mono mt-0.5">{mb.emailAddress}</p>
              </div>

              {mb.department === 'DIRETORIA' && !config.email.monitorBoardOfDirectors ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                  🔒 Sigilo da Diretoria (Isento)
                </span>
              ) : (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    mb.isActive
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {mb.isActive ? 'Monitoramento Ativo' : 'Pausado'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">E-mails Lidos:</span>
                <span className="font-bold text-slate-800">{mb.totalEmailsReceived.toLocaleString('pt-BR')}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Incidentes Gerados:</span>
                <span className="font-bold text-red-600">{mb.totalIncidentsFound}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>Último Sync: {new Date(mb.lastSyncAt).toLocaleTimeString('pt-BR')}</span>

              <button
                onClick={() => handleToggleActive(mb)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-colors ${
                  mb.isActive
                    ? 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <Power className="w-3 h-3" />
                {mb.isActive ? 'Pausar' : 'Reativar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
