// Usuários (achado S13: nunca devolver passwordHash; S5: allowlist de campos).
import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db.js';
import { UserCreateSchema, UserUpdateSchema, validar } from '../lib/validation.js';
import { SELECT_USUARIO, sanitizeUser, requirePermission } from '../middleware/auth.js';
import { filtroLeitura, filtroPorId, tenantEscrita, MENSAGEM_TENANT_OBRIGATORIO } from '../lib/escopo.js';

const router = express.Router();

function erroInterno(res, contexto, err) {
  console.error(`[Sentinela] ${contexto}:`, err?.message || err);
  return res.status(500).json({ error: 'Não foi possível concluir a operação. Tente novamente ou avise o administrador.' });
}

router.get('/', requirePermission('users', 'view'), async (req, res) => {
  try {
    const usuarios = await prisma.user.findMany({
      where: filtroLeitura(req),
      orderBy: { name: 'asc' },
      select: SELECT_USUARIO,
    });
    res.json(usuarios.map(sanitizeUser));
  } catch (err) {
    return erroInterno(res, 'Falha ao listar usuários', err);
  }
});

router.post('/', requirePermission('users', 'create'), validar(UserCreateSchema), async (req, res) => {
  const { senha, tenantId: tenantDoCorpo, isSuperAdmin, ...dados } = req.validado;
  const tenantId = tenantEscrita(req, tenantDoCorpo);
  if (!tenantId) return res.status(400).json({ error: MENSAGEM_TENANT_OBRIGATORIO });
  if (isSuperAdmin && !req.escopo?.superAdmin) {
    return res.status(403).json({ error: 'Somente um SuperAdmin pode conceder o perfil SuperAdmin.' });
  }
  try {
    const existente = await prisma.user.findUnique({ where: { email: dados.email }, select: { id: true } });
    if (existente) return res.status(409).json({ error: 'Já existe um usuário com este e-mail.' });
    const passwordHash = await bcrypt.hash(senha, 12);
    const criado = await prisma.user.create({
      data: {
        ...dados,
        permissions: dados.permissions ?? {},
        isSuperAdmin: Boolean(isSuperAdmin),
        passwordHash,
        tenantId,
      },
      select: SELECT_USUARIO,
    });
    res.status(201).json(sanitizeUser(criado));
  } catch (err) {
    return erroInterno(res, 'Falha ao criar usuário', err);
  }
});

router.patch('/:id', requirePermission('users', 'edit'), validar(UserUpdateSchema), async (req, res) => {
  const { senha, tenantId: tenantDoCorpo, isSuperAdmin, ...dados } = req.validado;
  const id = String(req.params.id);
  if (isSuperAdmin !== undefined && !req.escopo?.superAdmin) {
    return res.status(403).json({ error: 'Somente um SuperAdmin pode alterar o perfil SuperAdmin.' });
  }
  try {
    const alvo = await prisma.user.findFirst({ where: filtroPorId(req, id), select: SELECT_USUARIO });
    if (!alvo) return res.status(404).json({ error: 'Usuário não encontrado neste escritório.' });
    if (alvo.isSuperAdmin && !req.escopo?.superAdmin) {
      return res.status(403).json({ error: 'Somente um SuperAdmin pode editar outro SuperAdmin.' });
    }
    // Ninguém desativa a si mesmo nem remove o próprio SuperAdmin (evita ficar trancado fora).
    if (req.usuario && req.usuario.id === id) {
      if (dados.isActive === false) return res.status(400).json({ error: 'Você não pode desativar o seu próprio usuário.' });
      if (isSuperAdmin === false) return res.status(400).json({ error: 'Você não pode remover o seu próprio perfil SuperAdmin.' });
    }
    const data = { ...dados };
    if (isSuperAdmin !== undefined) data.isSuperAdmin = isSuperAdmin;
    if (senha) data.passwordHash = await bcrypt.hash(senha, 12);
    if (tenantDoCorpo) {
      // Mudar o escritório de um usuário só é possível para quem enxerga todos.
      if (!req.escopo?.superAdmin) return res.status(403).json({ error: 'Não é permitido mover usuários entre escritórios.' });
      data.tenantId = tenantDoCorpo;
    }
    if (data.email && data.email !== alvo.email) {
      const duplicado = await prisma.user.findUnique({ where: { email: data.email }, select: { id: true } });
      if (duplicado) return res.status(409).json({ error: 'Já existe um usuário com este e-mail.' });
    }
    const atualizado = await prisma.user.update({ where: { id }, data, select: SELECT_USUARIO });
    res.json(sanitizeUser(atualizado));
  } catch (err) {
    return erroInterno(res, 'Falha ao atualizar usuário', err);
  }
});

router.delete('/:id', requirePermission('users', 'delete'), async (req, res) => {
  const id = String(req.params.id);
  if (req.usuario && req.usuario.id === id) {
    return res.status(400).json({ error: 'Você não pode excluir o seu próprio usuário.' });
  }
  try {
    const alvo = await prisma.user.findFirst({ where: filtroPorId(req, id), select: { id: true, isSuperAdmin: true } });
    if (!alvo) return res.status(404).json({ error: 'Usuário não encontrado neste escritório.' });
    if (alvo.isSuperAdmin && !req.escopo?.superAdmin) {
      return res.status(403).json({ error: 'Somente um SuperAdmin pode excluir outro SuperAdmin.' });
    }
    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    return erroInterno(res, 'Falha ao excluir usuário', err);
  }
});

export default router;
