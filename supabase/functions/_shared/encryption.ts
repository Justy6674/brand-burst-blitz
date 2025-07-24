import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'https://deno.land/std@0.168.0/node/crypto.ts';

// Use the same encryption key for all TOTP secrets (store in environment)
const ENCRYPTION_KEY = Deno.env.get('TOTP_ENCRYPTION_KEY') || 'fallback-key-for-dev-only-change-in-prod';

// Ensure key is 32 bytes for AES-256
function getEncryptionKey(): Buffer {
  const key = createHash('sha256').update(ENCRYPTION_KEY).digest();
  return key;
}

/**
 * Encrypt a TOTP secret for secure database storage
 */
export function encryptTOTPSecret(secret: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(16); // Generate random IV for each encryption
  
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(secret, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return IV + encrypted data as a single string
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt a TOTP secret from database
 */
export function decryptTOTPSecret(encryptedData: string): string {
  const key = getEncryptionKey();
  const [ivHex, encryptedHex] = encryptedData.split(':');
  
  if (!ivHex || !encryptedHex) {
    throw new Error('Invalid encrypted data format');
  }
  
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = encryptedHex;
  
  const decipher = createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Check if data is encrypted (contains IV separator)
 */
export function isEncrypted(data: string): boolean {
  return data.includes(':') && data.split(':').length === 2;
}