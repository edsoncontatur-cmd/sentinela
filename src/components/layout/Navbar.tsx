import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTenants } from '../../services/storage';
import { TenantId } from '../../types';
import { 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  LogOut, 
  User as UserIcon, 
  HelpCircle,
  Mail,
  Activity
} from 'lucide-react';

interface NavbarProps {
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenHelp }) => {
  const { user, activeTenant, isSuperAdmin, switchTenant, logout } = useAuth();
  const tenants = getTenants();

  const currentTenantName = () => {
    if (activeTenant === 'all') return 'Visão Consolidada (Todas as Unidades)';
    const found = tenants.find((t) => t.id === activeTenant);
    return found ? found.name : 'Contatur São Paulo';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Filete Ocre Superior 2px - Padrão Contatur */}
      <div className="h-[2px] w-full bg-[#D2BE8C]" />

      <div className="px-6 py-2.5 flex items-center justify-between">
        {/* Lado Esquerdo: Logo & Nome do Sistema */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#004677] flex items-center justify-center text-white shadow-sm border border-[#003357]">
              <ShieldCheck className="w-5 h-5 text-[#6DCFF6]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-[#004677]">CONTATUR</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-100 text-[#004677] border border-sky-200">
                  SENTINEL IA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium -mt-0.5">
                Monitoramento Inteligente de E-mails & Gestão de Incidentes
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden md:block" />

          {/* Seletor de Tenant para SuperAdmin ou Badge Fixo para Usuário de Unidade */}
          {isSuperAdmin ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md">
              <Building2 className="w-4 h-4 text-[#004677]" />
              <label htmlFor="tenant-select" className="text-xs font-medium text-slate-600 hidden sm:inline">
                Unidade Ativa:
              </label>
              <select
                id="tenant-select"
                value={activeTenant}
                onChange={(e) => switchTenant(e.target.value as TenantId | 'all')}
                className="text-xs font-bold text-[#004677] bg-transparent border-0 focus:ring-0 cursor-pointer outline-none"
              >
                <option value="contatur_sp">🏢 Contatur São Paulo</option>
                <option value="contatur_rj">🏢 Contatur Rio</option>
                <option value="mkp_sp">🏢 MKP São Paulo</option>
                <option value="all">🌐 Visão Consolidada (3 Empresas)</option>
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-sky-50 border border-sky-100 px-3 py-1.5 rounded-md">
              <Building2 className="w-4 h-4 text-[#004677]" />
              <span className="text-xs font-bold text-[#004677]">{currentTenantName()}</span>
            </div>
          )}
        </div>

        {/* Lado Direito: Status IA, Ajuda e Perfil */}
        <div className="flex items-center gap-3">
          {/* Badge de Status do Motor de IA */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold">IA Sentinela Operacional</span>
          </div>

          {/* Botão de Ajuda Contextual */}
          <button
            onClick={onOpenHelp}
            title="Ajuda e Manual desta tela"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-[#004677] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md transition-colors border border-slate-200"
          >
            <HelpCircle className="w-4 h-4 text-[#004677]" />
            <span className="hidden sm:inline">Ajuda</span>
          </button>

          <div className="h-6 w-px bg-slate-200" />

          {/* Usuário e Logout */}
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name || 'SuperAdmin'}</p>
              <p className="text-[10px] text-slate-500 font-medium">{user?.roleName || 'Diretoria'}</p>
            </div>

            <div className="w-8 h-8 rounded-full bg-[#004677] text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'E'}
            </div>

            <button
              onClick={logout}
              title="Encerrar Sessão"
              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
