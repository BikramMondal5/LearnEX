import crypto from 'crypto';

// AES-256-CBC requires a 32-byte key (256 bits)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secure-encryption-key-32-bytes!!';

// Ensure key is exactly 32 bytes by hashing if needed
function getKey(): Buffer {
  const key = Buffer.from(ENCRYPTION_KEY);
  
  // If the key is already 32 bytes, use it directly
  if (key.length === 32) {
    return key;
  }
  
  // Otherwise, hash the key to get a consistent 32-byte key
  return crypto.createHash('sha256').update(key).digest();
}

const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
} 