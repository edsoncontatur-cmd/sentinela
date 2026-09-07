// Sessão de login do Sentinela: token assinado (HMAC-SHA256) guardado em cookie
// httpOnly / secure / sameSite=lax — mesmo padrão do SGD. Substitui o "login"
// que existia só no navegador (senha comparada no bundle, sessão em localStorage).
//
// Segredo em SESSION_SECRET (mínimo 32 caracteres). Fail-closed: sem segredo o
// login responde 503 e nenhuma sessão é emitida.
import crypto from 'crypto';

export const SESSION_COOKIE = 'sentinela_session';
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8h

const IS_DEV = process.env.NODE_ENV === 'development';

export function getSessionSecret() {
  const s = String(process.env.SESSION_SECRET || '');
  return s.length >= 32 ? s : null;
}

export function isSessionConfigured() {
  return getSessionSecret() !== null;
}

function b64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

function assinar(parte, secret) {
  return crypto.createHmac('sha256', secret).update(parte).digest('base64url');
}

export function signSession(payload, agora = Date.now()) {
  const secret = getSessionSecret();
  if (!secret) {
    const err = new Error('SESSION_SECRET não configurado (mínimo 32 caracteres).');
    err.code = 'SESSION_NOT_CONFIGURED';
    throw err;
  }
  const corpo = b64url(JSON.stringify({ ...payload, iat: agora, exp: agora + SESSION_TTL_MS }));
  return `${corpo}.${assinar(corpo, secret)}`;
}

export function verifySession(token, agora = Date.now()) {
  const secret = getSessionSecret();
  if (!secret || typeof token !== 'string') return null;
  const partes = token.split('.');
  if (partes.length !== 2) return null;
  const [corpo, assinatura] = partes;
  const esperada = assinar(corpo, secret);
  const a = Buffer.from(assinatura);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(corpo, 'base64url').toString('utf8'));
    if (!payload || typeof payload.exp !== 'number' || payload.exp <= agora) return null;
    return payload;
  } catch {
    return null;
  }
}

function opcoesCookie(maxAge) {
  return {
    httpOnly: true,
    // Só desenvolvimento explícito dispensa HTTPS; NODE_ENV ausente => secure.
    secure: !IS_DEV,
    sameSite: 'lax',
    path: '/',
    maxAge,
  };
}

export function setSessionCookie(res, token) {
  res.cookie(SESSION_COOKIE, token, opcoesCookie(SESSION_TTL_MS));
}

export function clearSessionCookie(res) {
  res.cookie(SESSION_COOKIE, '', opcoesCookie(0));
}
