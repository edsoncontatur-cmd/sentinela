// Autenticação e autorização por sessão no servidor (cookie httpOnly).
//
// Antes: o navegador comparava a senha com literais do bundle e guardava o
// "usuário logado" em localStorage — qualquer pessoa alterava o próprio papel.
// Agora o papel e as permissões vêm do banco a cada requisição.
import prisma from '../db.js';
import { SESSION_COOKIE, verifySession } from '../lib/session.js';

// Campos que a API devolve sobre usuários. `passwordHash` NUNCA entra aqui.
export const SELECT_USUARIO = {
  id: true,
  tenantId: true,
  name: true,
  email: true,
  role: true,
  department: true,
  permissions: true,
  isActive: true,
  isSuperAdmin: true,
  phone: true,
  avatarUrl: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

// Formato que o frontend consome (roleId em vez de role; datas em ISO).
export function sanitizeUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    roleId: u.role,
    tenantId: u.tenantId,
    department: u.department,
    isActive: u.isActive,
    isSuperAdmin: u.isSuperAdmin,
    phone: u.phone || undefined,
    avatarUrl: u.avatarUrl || undefined,
    permissions: u.permissions && typeof u.permissions === 'object' ? u.permissions : {},
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
    lastLoginAt: u.lastLoginAt instanceof Date ? u.lastLoginAt.toISOString() : u.lastLoginAt || undefined,
  };
}

export function temPermissao(usuario, modulo, acao) {
  if (!usuario) return false;
  if (usuario.isSuperAdmin) return true;
  const perms = usuario.permissions && typeof usuario.permissions === 'object' ? usuario.permissions : {};
  const mod = perms[modulo];
  return Boolean(mod && typeof mod === 'object' && mod[acao] === true);
}

// Lê o cookie de sessão e carrega o usuário do banco. Retorna:
//   { usuario }           sessão válida
//   { usuario: null }     sem sessão / sessão inválida
//   { erroBanco: true }   banco indisponível
export async function autenticarSessao(req) {
  const token = req.cookies?.[SESSION_COOKIE];
  const payload = token ? verifySession(token) : null;
  if (!payload || !payload.sub) return { usuario: null };
  try {
    const usuario = await prisma.user.findUnique({ where: { id: String(payload.sub) }, select: SELECT_USUARIO });
    if (!usuario || !usuario.isActive) return { usuario: null };
    return { usuario };
  } catch (err) {
    console.error('[Sentinela] Falha ao validar sessão no banco:', err?.message || err);
    return { usuario: null, erroBanco: true };
  }
}

export async function requireAuth(req, res, next) {
  if (req.usuario) return next();
  const { usuario, erroBanco } = await autenticarSessao(req);
  if (erroBanco) {
    return res.status(503).json({ error: 'Banco de dados indisponível. Tente novamente em instantes.' });
  }
  if (!usuario) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
  }
  req.usuario = usuario;
  req.escopo = {
    tipo: 'usuario',
    tenantId: usuario.isSuperAdmin ? null : usuario.tenantId,
    superAdmin: usuario.isSuperAdmin,
  };
  return next();
}

export function requirePermission(modulo, acao) {
  return (req, res, next) => {
    // Tokens de serviço por escritório têm escopo próprio (leitura/escrita do
    // escritório); a matriz de permissões só se aplica a usuários logados.
    if (!req.usuario) return next();
    if (temPermissao(req.usuario, modulo, acao)) return next();
    return res.status(403).json({ error: 'Você não tem permissão para esta ação.' });
  };
}

export function requireSuperAdmin(req, res, next) {
  if (req.escopo?.superAdmin) return next();
  return res.status(403).json({ error: 'Ação restrita ao SuperAdmin.' });
}
