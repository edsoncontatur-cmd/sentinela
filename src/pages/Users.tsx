import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsers, saveUser, deleteUser, getRoles } from '../services/storage';
import { User, UserRole, ScreenPermissions, DepartmentType, TenantId } from '../types';
import { FULL_PERMISSIONS, UNIT_ADMIN_PERMISSIONS, SUPERVISOR_PERMISSIONS, ANALYST_PERMISSIONS } from '../services/mockData';
import {
  Users as UsersIcon,
  UserPlus,
  ShieldCheck,
  Edit2,
  Trash2,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
  CheckSquare,
  Square
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { activeTenant, isSuperAdmin, hasPermission, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Campos do formulário
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    department: DepartmentType;
    roleId: string;
    tenantId: TenantId | 'all';
    isActive: boolean;
    permissions: ScreenPermissions;
  }>({
    name: '',
    email: '',
    department: 'FISCAL',
    roleId: 'role_analyst',
    tenantId: activeTenant === 'all' ? 'contatur_sp' : activeTenant,
    isActive: true,
    permissions: JSON.parse(JSON.stringify(ANALYST_PERMISSIONS)),
  });

  const loadData = () => {
    const all = getUsers();
    if (isSuperAdmin && activeTenant === 'all') {
      setUsers(all);
    } else {
      setUsers(all.filter((u) => u.tenantId === activeTenant || u.tenantId === 'all'));
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTenant]);

  const roles = getRoles();

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      department: 'FISCAL',
      roleId: 'role_analyst',
      tenantId: activeTenant === 'all' ? 'contatur_sp' : activeTenant,
      isActive: true,
      permissions: JSON.parse(JSON.stringify(ANALYST_PERMISSIONS)),
    });
    setIsCreating(true);
    setEditingUser(null);
  };

  const handleOpenEdit = (user: User) => {
    setFormData({
      name: user.name,
      email: user.email,
      department: user.department,
      roleId: user.roleId,
      tenantId: user.tenantId,
      isActive: user.isActive,
      permissions: JSON.parse(JSON.stringify(user.permissions)),
    });
    setEditingUser(user);
    setIsCreating(false);
  };

  const handleRoleTemplateChange = (roleId: string) => {
    let templatePerms = ANALYST_PERMISSIONS;
    if (roleId === 'role_superadmin') templatePerms = FULL_PERMISSIONS;
    else if (roleId === 'role_unit_admin') templatePerms = UNIT_ADMIN_PERMISSIONS;
    else if (roleId === 'role_supervisor') templatePerms = SUPERVISOR_PERMISSIONS;

    setFormData((prev) => ({
      ...prev,
      roleId,
      permissions: JSON.parse(JSON.stringify(templatePerms)),
    }));
  };

  const handleTogglePermission = (module: keyof ScreenPermissions, action: string) => {
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev.permissions));
      const mod = copy[module] as Record<string, boolean>;
      mod[action] = !mod[action];
      return { ...prev, permissions: copy };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const roleObj = roles.find((r) => r.id === formData.roleId);

    const userToSave: User = {
      id: editingUser ? editingUser.id : 'usr_' + Date.now(),
      name: formData.name,
      email: formData.email,
      department: formData.department,
      roleId: formData.roleId,
      roleName: roleObj ? roleObj.name : 'Personalizado',
      tenantId: formData.tenantId,
      isActive: formData.isActive,
      permissions: formData.permissions,
      createdAt: editingUser ? editingUser.createdAt : new Date().toISOString(),
    };

    saveUser(userToSave);
    loadData();
    setIsCreating(false);
    setEditingUser(null);
    setSaveSuccessMsg(`Usuário ${formData.name} salvo com sucesso!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleDelete = (userId: string) => {
    if (userId === 'usr_edson_superadmin') {
      alert('Não é permitido excluir o SuperAdmin Global.');
      return;
    }
    deleteUser(userId);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#004677] flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-[#6DCFF6]" />
              Gestão de Usuários & Matriz Granular de Acessos (RBAC)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Cadastro de colaboradores e parametrização tela a tela e recurso a recurso.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#004677] hover:bg-[#003357] text-white rounded-lg text-xs font-bold shadow transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Novo Usuário
          </button>
        </div>

        {saveSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Nome / Usuário</th>
                <th className="p-3">E-mail Corporativo</th>
                <th className="p-3">Unidade / Tenant</th>
                <th className="p-3">Departamento</th>
                <th className="p-3">Perfil de Acesso</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#004677] text-white flex items-center justify-center text-xs font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-slate-600">{u.email}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-[#004677]">
                      {u.tenantId === 'all' ? '🌐 Todas (SuperAdmin)' : u.tenantId}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-700">{u.department}</td>
                  <td className="p-3">
                    <span className="font-bold text-slate-800">{u.roleName}</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {u.isActive ? 'Ativo' : 'Bloqueado'}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="p-1.5 bg-slate-100 hover:bg-sky-50 text-[#004677] rounded transition-colors"
                      title="Editar Permissões"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!u.isSuperAdmin && (
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-1.5 bg-slate-100 hover:bg-red-50 text-red-600 rounded transition-colors"
                        title="Excluir Usuário"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Criação / Edição com Matriz de Permissões */}
      {(isCreating || editingUser) && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-[#004677] text-white flex items-center justify-between border-b border-[#003357]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#6DCFF6]" />
                <h3 className="font-bold text-sm">
                  {isCreating ? 'Cadastrar Novo Usuário' : `Editar Acessos & Permissões: ${editingUser?.name}`}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingUser(null);
                }}
                className="p-1 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              {/* Dados Básicos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Nome Completo:</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Mariana Souza"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#004677]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">E-mail Corporativo:</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="mariana@contatur.com.br"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#004677]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Departamento:</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value as DepartmentType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#004677]"
                  >
                    <option value="FISCAL">Fiscal & Tributário</option>
                    <option value="FOLHA">Departamento Pessoal / Folha</option>
                    <option value="CONTABIL">Contábil</option>
                    <option value="LEGAL">Societário & Legalização</option>
                    <option value="FINANCEIRO">Financeiro</option>
                    <option value="DIRETORIA">Diretoria</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Perfil Template Base:</label>
                  <select
                    value={formData.roleId}
                    onChange={(e) => handleRoleTemplateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#004677]"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Matriz Granular de Permissões */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#004677]">
                    Matriz de Controle de Acesso por Tela e Recurso:
                  </h4>
                  <span className="text-[11px] text-slate-500">Marque/desmarque os privilégios específicos</span>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  {/* Dashboard */}
                  <div className="space-y-1.5">
                    <p className="font-bold text-slate-800 text-[11px]">1. Dashboard & Indicadores:</p>
                    <div className="flex flex-wrap gap-4 pl-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.dashboard.view}
                          onChange={() => handleTogglePermission('dashboard', 'view')}
                          className="rounded text-[#004677]"
                        />
                        <span>Visualizar Painel</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.dashboard.filterDepartment}
                          onChange={() => handleTogglePermission('dashboard', 'filterDepartment')}
                          className="rounded text-[#004677]"
                        />
                        <span>Filtrar por Departamento</span>
                      </label>
                    </div>
                  </div>

                  {/* Incidentes */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200">
                    <p className="font-bold text-slate-800 text-[11px]">2. Central de Incidentes & Ocorrências:</p>
                    <div className="flex flex-wrap gap-4 pl-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.incidents.view}
                          onChange={() => handleTogglePermission('incidents', 'view')}
                          className="rounded text-[#004677]"
                        />
                        <span>Acessar Tela</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.incidents.changeStatus}
                          onChange={() => handleTogglePermission('incidents', 'changeStatus')}
                          className="rounded text-[#004677]"
                        />
                        <span>Alterar Status / Resolver</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.incidents.useAiCopilot}
                          onChange={() => handleTogglePermission('incidents', 'useAiCopilot')}
                          className="rounded text-[#004677]"
                        />
                        <span>Usar Copiloto IA (Gerar Minutas)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.incidents.sendDirectReply}
                          onChange={() => handleTogglePermission('incidents', 'sendDirectReply')}
                          className="rounded text-[#004677]"
                        />
                        <span>Enviar E-mail Direto</span>
                      </label>
                    </div>
                  </div>

                  {/* Radar de Clientes */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200">
                    <p className="font-bold text-slate-800 text-[11px]">3. Radar de Clientes & Fornecedores:</p>
                    <div className="flex flex-wrap gap-4 pl-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.clientRadar.view}
                          onChange={() => handleTogglePermission('clientRadar', 'view')}
                          className="rounded text-[#004677]"
                        />
                        <span>Visualizar Health Score</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.clientRadar.addRelationshipNote}
                          onChange={() => handleTogglePermission('clientRadar', 'addRelationshipNote')}
                          className="rounded text-[#004677]"
                        />
                        <span>Registrar Notas de Retenção</span>
                      </label>
                    </div>
                  </div>

                  {/* Configurações */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200">
                    <p className="font-bold text-slate-800 text-[11px]">4. Configurações da Unidade:</p>
                    <div className="flex flex-wrap gap-4 pl-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.settings.view}
                          onChange={() => handleTogglePermission('settings', 'view')}
                          className="rounded text-[#004677]"
                        />
                        <span>Acessar Aba Configurações</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.settings.editEmailProvider}
                          onChange={() => handleTogglePermission('settings', 'editEmailProvider')}
                          className="rounded text-[#004677]"
                        />
                        <span>Editar Conexão de E-mails</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.settings.editAiProvider}
                          onChange={() => handleTogglePermission('settings', 'editAiProvider')}
                          className="rounded text-[#004677]"
                        />
                        <span>Editar Modelos & Chaves de IA</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.settings.editAlertChannels}
                          onChange={() => handleTogglePermission('settings', 'editAlertChannels')}
                          className="rounded text-[#004677]"
                        />
                        <span>Editar Canais de Alerta (Teams/Whats)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 -mx-6 -mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#004677] hover:bg-[#003357] text-white font-bold rounded-lg shadow-md"
                >
                  Salvar Usuário & Permissões
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
