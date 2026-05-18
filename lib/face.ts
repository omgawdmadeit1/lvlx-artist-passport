import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits

// In production: Use a proper KMS or per-user derived key from passkey
// For demo: Derive from a master secret + userId
function getEncryptionKey(userId: string): Buffer {
  const masterSecret = process.env.FACE_ENCRYPTION_SECRET || 'vitapass-demo-face-secret-2026';
  return crypto.scryptSync(masterSecret, userId, KEY_LENGTH);
}

export function encryptEmbedding(embedding: Float32Array, userId: string): { encrypted: Buffer; iv: Buffer } {
  const key = getEncryptionKey(userId);
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const embeddingBuffer = Buffer.from(embedding.buffer);
  let encrypted = cipher.update(embeddingBuffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const authTag = cipher.getAuthTag();

  // Prepend auth tag to encrypted data (common pattern)
  const finalEncrypted = Buffer.concat([authTag, encrypted]);

  return {
    encrypted: finalEncrypted,
    iv,
  };
}

export function decryptEmbedding(encryptedData: Buffer, iv: Buffer, userId: string): Float32Array {
  const key = getEncryptionKey(userId);
  
  const authTag = encryptedData.subarray(0, 16);
  const encrypted = encryptedData.subarray(16);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return new Float32Array(decrypted.buffer);
}

// Cosine similarity for face matching (industry standard)
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Threshold for successful match (tune this in production)
export const FACE_MATCH_THRESHOLD = 0.82;
