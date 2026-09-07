// Limitação de taxa (express-rate-limit). Chave por IP — e, no login, por
// IP + e-mail, para que um único IP não bloqueie todos os usuários nem um
// e-mail seja martelado a partir de vários IPs sem limite.
//
// O IP real depende de `app.set('trust proxy', TRUST_PROXY)` (IIS na VM).
import rateLimit from 'express-rate-limit';

const opcoesComuns = {
  standardHeaders: true,
  legacyHeaders: false,
};

// IPv6: agrupa por bloco /64 para que um mesmo cliente não escape do limite
// trocando o sufixo do endereço.
export function chaveIp(ip) {
  const s = String(ip || '').trim();
  if (!s.includes(':')) return s;
  const semZona = s.split('%')[0];
  const grupos = semZona.split(':');
  return grupos.slice(0, 4).join(':') + '::/64';
}

export const apiLimiter = rateLimit({
  ...opcoesComuns,
  windowMs: 15 * 60 * 1000,
  limit: 600,
  message: { error: 'Muitas requisições. Aguarde alguns minutos e tente novamente.' },
});

export const loginLimiter = rateLimit({
  ...opcoesComuns,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: (req) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    return `${chaveIp(req.ip)}|${email}`;
  },
  validate: { keyGeneratorIpFallback: false },
  message: {
    error: 'Muitas tentativas de acesso para este e-mail. Aguarde 15 minutos antes de tentar novamente.',
  },
});

export const bootstrapLimiter = rateLimit({
  ...opcoesComuns,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: { error: 'Muitas tentativas de bootstrap. Aguarde uma hora.' },
});

export const integracoesLimiter = rateLimit({
  ...opcoesComuns,
  windowMs: 15 * 60 * 1000,
  limit: 60,
  message: { error: 'Muitas chamadas de integração em pouco tempo. Aguarde alguns minutos.' },
});
