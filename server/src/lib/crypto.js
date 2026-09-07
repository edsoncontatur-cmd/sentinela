// Criptografia e comparação de segredos do Sentinela.
//
// * AES-256-GCM para os segredos de integração gravados em `tenant_configs.secrets`
//   (client secret M365, senha IMAP, chave de IA, tokens WhatsApp/Telegram/SGC/
//   Meeting, webhooks). Chave em SENTINELA_ENCRYPTION_KEY (64 caracteres hex).
//   Fail-closed: sem chave válida, gravar segredo falha com erro claro e nada é
//   salvo em texto claro.
// * Comparação de segredos sempre em tempo constante sobre digests SHA-256 de
//   tamanho fixo (não vaza nem o conteúdo nem o comprimento).
import crypto from 'crypto';

const ENV_KEY = 'SENTINELA_ENCRYPTION_KEY';

function lerChave() {
  const hex = String(process.env[ENV_KEY] || '').trim();
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) return null;
  return Buffer.from(hex, 'hex');
}

export function isEncryptionConfigured() {
  return lerChave() !== null;
}

export const MENSAGEM_CHAVE_AUSENTE =
  'Criptografia de segredos não configurada no servidor (SENTINELA_ENCRYPTION_KEY com 64 caracteres hexadecimais). ' +
  'Peça ao administrador para definir a variável na VM antes de salvar chaves e tokens de integração.';

export function encryptSecret(plainText) {
  const key = lerChave();
  if (!key) {
    const err = new Error(MENSAGEM_CHAVE_AUSENTE);
    err.code = 'ENCRYPTION_NOT_CONFIGURED';
    throw err;
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function decryptSecret(cipherTextBase64) {
  const key = lerChave();
  if (!key || !cipherTextBase64) return null;
  try {
    const raw = Buffer.from(String(cipherTextBase64), 'base64');
    if (raw.length < 29) return null;
    const iv = raw.subarray(0, 12);
    const authTag = raw.subarray(12, 28);
    const encrypted = raw.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}

// Comparação em tempo constante. Aceita strings de tamanhos diferentes sem
// vazar o tamanho: compara os digests SHA-256 (sempre 32 bytes).
export function segredoConfere(recebido, esperado) {
  if (!recebido || !esperado) return false;
  const a = crypto.createHash('sha256').update(String(recebido)).digest();
  const b = crypto.createHash('sha256').update(String(esperado)).digest();
  return crypto.timingSafeEqual(a, b);
}
