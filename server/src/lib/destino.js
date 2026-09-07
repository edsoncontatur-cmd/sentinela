// Validação do destino das chamadas de integração (SGC / Contatur Meeting).
//
// O servidor é quem chama esses sistemas (proxy) com o token guardado cifrado no
// banco. A URL base é configurável pela tela de Configurações; para que essa
// configuração não vire um SSRF (fazer o servidor chamar qualquer endereço com o
// token), o destino só é aceito se:
//   * usar https (http só em desenvolvimento explícito e só para localhost);
//   * não tiver usuário:senha na URL;
//   * o host for um domínio da lista INTEGRACOES_HOSTS_PERMITIDOS (padrão:
//     grupocontaturmkp.com.br e subdomínios) — nunca IP literal nem localhost.
import net from 'net';

const IS_DEV = process.env.NODE_ENV === 'development';

export function hostsPermitidos() {
  const lista = String(process.env.INTEGRACOES_HOSTS_PERMITIDOS || 'grupocontaturmkp.com.br')
    .split(',')
    .map((h) => h.trim().toLowerCase().replace(/^\.+/, ''))
    .filter(Boolean);
  return lista;
}

function hostAceito(hostname, permitidos) {
  const h = hostname.toLowerCase();
  return permitidos.some((p) => h === p || h.endsWith(`.${p}`));
}

export class DestinoInvalidoError extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.code = 'DESTINO_INVALIDO';
  }
}

/**
 * @param {string} baseUrl URL base configurada (ex.: https://sgc.grupocontaturmkp.com.br/api/external/v1)
 * @returns {string} URL normalizada, sem barra final
 */
export function validarDestino(baseUrl) {
  let url;
  try {
    url = new URL(String(baseUrl || '').trim());
  } catch {
    throw new DestinoInvalidoError('URL da integração inválida.');
  }
  if (url.username || url.password) {
    throw new DestinoInvalidoError('URL da integração não pode conter usuário e senha.');
  }
  const host = url.hostname.replace(/^\[|\]$/g, '');
  const ehLocal = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  if (net.isIP(host) && !(IS_DEV && ehLocal)) {
    throw new DestinoInvalidoError('URL da integração não pode apontar para endereço IP.');
  }
  if (url.protocol !== 'https:') {
    if (!(IS_DEV && url.protocol === 'http:' && ehLocal)) {
      throw new DestinoInvalidoError('URL da integração precisa usar https.');
    }
  }
  if (!(IS_DEV && ehLocal) && !hostAceito(host, hostsPermitidos())) {
    throw new DestinoInvalidoError(
      `Destino não permitido: ${host}. Domínios aceitos: ${hostsPermitidos().join(', ')}.`,
    );
  }
  url.hash = '';
  url.search = '';
  return url.toString().replace(/\/+$/, '');
}
