import React from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '../../context/AuthContext';
import { getIncidents } from '../../services/storage';
import {
  LayoutDashboard,
  Inbox,
  Activity,
  Mail,
  Users,
  Settings,
  FileText,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  Globe,
  Flame,
  Layers
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { hasPermission, isSuperAdmin, activeTenant } = useAuth();
  const allIncidents = getIncidents(activeTenant);
  const newIncidentsCount = allIncidents.filter((i) => i.status === 'NOVO').length;
  const criticalCount = allIncidents.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVIDO').length;

  const navItems = [
    {
      label: 'Torre de Controle',
      path: '/',
      icon: LayoutDashboard,
      show: hasPermission('dashboard', 'view'),
    },
    {
      label: 'Central de Incidentes',
      path: '/incidentes',
      icon: Inbox,
      badge: newIncidentsCount > 0 ? newIncidentsCount : undefined,
      badgeColor: criticalCount > 0 ? 'bg-red-500 text-white' : 'bg-[#6DCFF6] text-[#004677]',
      show: hasPermission('incidents', 'view'),
    },
    {
      label: 'Radar 360° & Churn',
      path: '/radar-clientes',
      icon: Activity,
      show: hasPermission('clientRadar', 'view'),
    },
    {
      label: 'Circulares Mensais IA',
      path: '/circulares-mensais',
      icon: Globe,
      show: true,
    },
    {
      label: 'Oportunidades & SGC',
      path: '/oportunidades-comerciais',
      icon: TrendingUp,
      show: hasPermission('commercialOpportunities', 'view'),
    },
    {
      label: 'Carga & Burnout',
      path: '/equipe-workload',
      icon: Flame,
      show: true,
    },
    {
      label: 'Diagnóstico por Setor',
      path: '/diagnostico-setores',
      icon: Layers,
      show: true,
    },
    {
      label: 'Auditoria de Qualidade',
      path: '/auditoria-qualidade',
      icon: ShieldCheck,
      show: hasPermission('qualityAudit', 'view'),
    },
    {
      label: 'Benchmark do Grupo',
      path: '/benchmark',
      icon: BarChart3,
      show: hasPermission('unitBenchmark', 'view'),
    },
    {
      label: 'Caixas Monitoradas',
      path: '/caixas-postais',
      icon: Mail,
      show: hasPermission('mailboxes', 'view'),
    },
    {
      label: 'Usuários & Permissões',
      path: '/usuarios',
      icon: Users,
      show: hasPermission('users', 'view'),
    },
    {
      label: 'Configurações',
      path: '/configuracoes',
      icon: Settings,
      show: hasPermission('settings', 'view'),
    },
    {
      label: 'Relatórios & Exportação',
      path: '/relatorios',
      icon: FileText,
      show: hasPermission('reports', 'view'),
    },
  ];

  return (
    <aside className="w-64 bg-[#004677] text-white flex flex-col justify-between shrink-0 shadow-lg border-r border-[#003357]">
      <div className="p-4 space-y-6">
        {/* Banner de Risco Ativo se houver casos críticos */}
        {criticalCount > 0 && (
          <div className="p-3 bg-red-600/90 border border-red-400/50 rounded-lg text-xs flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-white animate-bounce" />
              <div>
                <p className="font-bold text-white leading-tight">Alerta Crítico Ativo</p>
                <p className="text-[10px] text-red-100">{criticalCount} chamado(s) Nível 1</p>
              </div>
            </div>
            <Link href="/incidentes" className="text-[10px] underline font-bold text-white hover:text-red-200">
              Ver
            </Link>
          </div>
        )}

        {/* Menu de Navegação */}
        <nav className="space-y-1">
          <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider px-3 mb-2">
            Menu Operacional
          </p>

          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-white text-[#004677] shadow-sm font-bold'
                      : 'text-slate-100 hover:bg-[#003357] hover:text-[#6DCFF6]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-[#004677]' : 'text-[#6DCFF6] group-hover:text-white'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight
                      className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                        isActive ? 'text-[#004677] opacity-100' : 'text-slate-400'
                      }`}
                    />
                  </div>
                </Link>
              );
            })}
        </nav>
      </div>

      {/* Rodapé da Sidebar */}
      <div className="p-4 border-t border-[#003357] bg-[#003860]/50 text-[11px] text-slate-300 space-y-1">
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
          <span>SENTINEL AI</span>
          <span className="text-[#6DCFF6]">v3.5.0</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Grupo Contatur &bull; Multi-Tenant Seguro
        </p>
      </div>
    </aside>
  );
};
