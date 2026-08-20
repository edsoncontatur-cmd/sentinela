import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, TenantId, ScreenPermissions } from '../types';
import { getCurrentUser, setCurrentUser, getTenants, getUsers, setActiveTenant as persistActiveTenant, getActiveTenant as retrieveActiveTenant } from '../services/storage';

interface AuthContextType {
  user: User | null;
  activeTenant: TenantId | 'all';
  currentTenant: { id: string; name: string };
  isSuperAdmin: boolean;
  login: (email: string, pass: string) => { success: boolean; message?: string };
  logout: () => void;
  switchTenant: (tenantId: TenantId | 'all') => void;
  hasPermission: (module: keyof ScreenPermissions, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(() => getCurrentUser());
  const [activeTenant, setActiveTenantState] = useState<TenantId | 'all'>(() => {
    const curr = getCurrentUser();
    if (curr?.isSuperAdmin) {
      return retrieveActiveTenant();
    }
    return (curr?.tenantId as TenantId) || 'contatur_sp';
  });

  const tenants = getTenants();
  const currentTenant = activeTenant === 'all'
    ? { id: 'all', name: 'Grupo Contatur (Visão Consolidada)' }
    : (tenants.find((t) => t.id === activeTenant) || { id: activeTenant, name: activeTenant });

  const isSuperAdmin = Boolean(user?.isSuperAdmin || user?.tenantId === 'all');

  useEffect(() => {
    if (user && !user.isSuperAdmin) {
      setActiveTenantState(user.tenantId as TenantId);
      persistActiveTenant(user.tenantId as TenantId);
    }
  }, [user]);

  const login = (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Validação de SuperAdmin Edson
    if (cleanEmail === 'edson@contatur.com.br' && pass === '@&dson3757GG27') {
      const allUsers = getUsers();
      let edson = allUsers.find(u => u.email.toLowerCase() === 'edson@contatur.com.br');
      if (!edson) {
        edson = allUsers[0];
      }
      setUserState(edson);
      setCurrentUser(edson);
      return { success: true };
    }

    // Validação dos demais usuários
    const allUsers = getUsers();
    const found = allUsers.find(u => u.email.toLowerCase() === cleanEmail && u.isActive);
    if (found) {
      setUserState(found);
      setCurrentUser(found);
      setActiveTenantState(found.tenantId as TenantId);
      persistActiveTenant(found.tenantId as TenantId);
      return { success: true };
    }

    return { success: false, message: 'Credenciais inválidas ou usuário desativado.' };
  };

  const logout = () => {
    setUserState(null);
    setCurrentUser(null);
  };

  const switchTenant = (tenantId: TenantId | 'all') => {
    if (isSuperAdmin) {
      setActiveTenantState(tenantId);
      persistActiveTenant(tenantId);
    }
  };

  const hasPermission = (module: keyof ScreenPermissions, action: string): boolean => {
    if (isSuperAdmin) return true;
    if (!user) return false;

    const modPerms = user.permissions[module] as Record<string, boolean>;
    if (!modPerms) return false;
    return Boolean(modPerms[action]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeTenant,
        currentTenant,
        isSuperAdmin,
        login,
        logout,
        switchTenant,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
