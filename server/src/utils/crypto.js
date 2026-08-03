import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// Derive 32-byte key from ENCRYPTION_KEY or fallback secret
const getSecretKey = () => {
  const secret = process.env.ENCRYPTION_KEY || 'hrmspro-default-secure-encryption-key-32bytes';
  return crypto.scryptSync(secret, 'hrmspro-salt', 32);
};

/**
 * Encrypt sensitive plain text string using AES-256-GCM.
 * Output format: "ivHex:authTagHex:encryptedHex"
 */
export function encryptText(text) {
  if (!text || typeof text !== 'string') return text;
  // If already encrypted, don't double encrypt
  if (text.includes(':') && text.split(':').length === 3) return text;

  try {
    const key = getSecretKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('encryptText failed:', error);
    return text;
  }
}

/**
 * Decrypt AES-256-GCM encrypted string back to plain text.
 */
export function decryptText(encryptedText) {
  if (!encryptedText || typeof encryptedText !== 'string') return encryptedText;
  if (!encryptedText.includes(':')) return encryptedText; // Unencrypted plain string fallback

  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return encryptedText;

    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = getSecretKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    return encryptedText;
  }
}

/**
 * Returns a masked bank account string e.g. "•••• •••• 4321".
 */
export function maskBankAccount(accountNumber) {
  if (!accountNumber) return '';
  const raw = decryptText(accountNumber);
  if (!raw) return '';
  const cleaned = String(raw).replace(/\s+/g, '');
  if (cleaned.length <= 4) return `•••• ${cleaned}`;
  return `•••• •••• ${cleaned.slice(-4)}`;
}
