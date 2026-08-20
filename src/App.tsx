import React, { useState } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { HelpModal } from './components/common/HelpModal';
import { COMPREHENSIVE_HELP_CATALOG } from './data/helpCatalog';

import { Login } from './pages/Login';
import { Dashboard } from './pages/dashboard';
import { Incidents } from './pages/Incidents';
import { ClientRadar } from './pages/ClientRadar';
import { MonthlyBroadcasts } from './pages/MonthlyBroadcasts';
import { CommercialOpportunities } from './pages/CommercialOpportunities';
import { TeamWorkload } from './pages/TeamWorkload';
import { DepartmentDiagnosis } from './pages/DepartmentDiagnosis';
import { QualityAudit } from './pages/QualityAudit';
import { UnitBenchmark } from './pages/UnitBenchmark';
import { Mailboxes } from './pages/Mailboxes';
import { UsersPage } from './pages/Users';
import { SettingsPage } from './pages/Settings';
import { ReportsPage } from './pages/Reports';

const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const [location] = useLocation();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  if (!user) {
    return <Login />;
  }

  const currentHelp = COMPREHENSIVE_HELP_CATALOG[location] || COMPREHENSIVE_HELP_CATALOG['/'];

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f3f0] text-slate-900">
      <Navbar onOpenHelp={() => setIsHelpOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/incidentes" component={Incidents} />
            <Route path="/radar-clientes" component={ClientRadar} />
            <Route path="/circulares-mensais" component={MonthlyBroadcasts} />
            <Route path="/oportunidades-comerciais" component={CommercialOpportunities} />
            <Route path="/equipe-workload" component={TeamWorkload} />
            <Route path="/diagnostico-setores" component={DepartmentDiagnosis} />
            <Route path="/auditoria-qualidade" component={QualityAudit} />
            <Route path="/benchmark" component={UnitBenchmark} />
            <Route path="/caixas-postais" component={Mailboxes} />
            <Route path="/usuarios" component={UsersPage} />
            <Route path="/configuracoes" component={SettingsPage} />
            <Route path="/relatorios" component={ReportsPage} />
            <Route>
              <Dashboard />
            </Route>
          </Switch>
        </main>
      </div>

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        helpData={currentHelp}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
