import crypto from 'crypto';
import { sign, verify, SignOptions, VerifyOptions } from 'jsonwebtoken';
import { getDatabase } from './db/index';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production.');
  }
  // Development-only fallback; never use in production.
  return 'dev-only-insecure-secret-change-me';
}

const parsedSessionMaxAge = Number(process.env.SESSION_MAX_AGE);
const SESSION_MAX_AGE =
  Number.isFinite(parsedSessionMaxAge) && parsedSessionMaxAge > 0
    ? parsedSessionMaxAge
    : 14400;

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  tokenVersion: number;
}

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, keylen: 64 };

/**
 * Hash a password using scrypt from node:crypto.
 * Format: `scrypt$<salt-hex>$<derived-hex>`
 *
 * scrypt avoids the native-module compilation that bcrypt requires, keeping
 * the project installable on any machine with Node.js.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, SCRYPT_PARAMS.keylen, {
    N: SCRYPT_PARAMS.N,
    r: SCRYPT_PARAMS.r,
    p: SCRYPT_PARAMS.p,
  });
  return `scrypt$${salt}$${derived.toString('hex')}`;
}

/** Verify a plain-text password against a stored scrypt hash. */
export function verifyPassword(plainPassword: string, storedHash: string): boolean {
  const [scheme, salt, hash] = storedHash.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;

  try {
    const derived = crypto.scryptSync(plainPassword, salt, SCRYPT_PARAMS.keylen, {
      N: SCRYPT_PARAMS.N,
      r: SCRYPT_PARAMS.r,
      p: SCRYPT_PARAMS.p,
    });
    const expected = Buffer.from(hash, 'hex');
    if (expected.length !== derived.length) return false;
    return crypto.timingSafeEqual(expected, derived);
  } catch {
    return false;
  }
}

export function generateToken(payload: JWTPayload): string {
  return sign(payload, getJwtSecret(), { expiresIn: SESSION_MAX_AGE } as SignOptions);
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = verify(token, getJwtSecret(), {} as VerifyOptions) as JWTPayload;
    if (typeof decoded.tokenVersion !== 'number') return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ id: string; email: string; role: string; tokenVersion: number } | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const db = await getDatabase();
  const user = await db
    .prepare('SELECT * FROM users WHERE email = ? AND is_active = 1')
    .get(normalizedEmail) as
    | { id: string; email: string; password_hash: string; role: string; token_version: number }
    | undefined;

  if (!user) {
    db.close();
    return null;
  }

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    db.close();
    return null;
  }

  await db.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
  db.close();

  return { id: user.id, email: user.email, role: user.role, tokenVersion: user.token_version ?? 0 };
}

export async function createAdminUser(email: string, password: string): Promise<void> {
  const passwordHash = await hashPassword(password);
  const db = await getDatabase();

  try {
    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      throw new Error('User with this email already exists');
    }

    await db.prepare("INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'admin')").run(
      email.toLowerCase().trim(),
      passwordHash
    );
  } finally {
    db.close();
  }
}

export async function getUserById(
  userId: string
): Promise<{ id: string; email: string; role: string; token_version: number } | null> {
  const db = await getDatabase();
  const user = await db
    .prepare('SELECT id, email, role, token_version FROM users WHERE id = ? AND is_active = 1')
    .get(userId) as { id: string; email: string; role: string; token_version: number } | undefined;
  db.close();
  return user ?? null;
}

export async function bumpTokenVersion(userId: string): Promise<void> {
  const db = await getDatabase();
  try {
    await db.prepare(
      'UPDATE users SET token_version = COALESCE(token_version, 0) + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(userId);
  } finally {
    db.close();
  }
}
export async function auditLog(
  userId: string | null,
  action: string,
  resourceType: string | null,
  resourceId: string | null,
  details: string | null,
  ipAddress: string | null
): Promise<void> {
  try {
    const db = await getDatabase();
    await db.prepare(
      'INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(userId, action, resourceType, resourceId, details, ipAddress);
    db.close();
  } catch {
    // Audit logging should never break the main flow
  }
}


