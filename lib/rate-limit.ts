import { getDatabase } from './db';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function nowMs(): number {
  return Date.now();
}

export async function checkLoginRateLimit(key: string): Promise<{ allowed: boolean; retryAfter: number }> {
  const db = await getDatabase();
  try {
    const now = nowMs();
    const row = await db
      .prepare('SELECT count, reset_at FROM login_rate_limits WHERE key = ?')
      .get(key) as { count: number; reset_at: number } | undefined;

    if (!row || row.reset_at <= now) {
      const resetAt = now + WINDOW_MS;
      await db.prepare(
        'INSERT INTO login_rate_limits (key, count, reset_at) VALUES (?, ?, ?) ' +
          'ON CONFLICT(key) DO UPDATE SET count = 0, reset_at = excluded.reset_at'
      ).run(key, 0, resetAt);
      return { allowed: true, retryAfter: 0 };
    }

    if (row.count >= MAX_ATTEMPTS) {
      return { allowed: false, retryAfter: Math.ceil((row.reset_at - now) / 1000) };
    }
    return { allowed: true, retryAfter: 0 };
  } finally {
    db.close();
  }
}

export async function recordLoginFailure(key: string): Promise<void> {
  const db = await getDatabase();
  try {
    const now = nowMs();
    const row = await db
      .prepare('SELECT count, reset_at FROM login_rate_limits WHERE key = ?')
      .get(key) as { count: number; reset_at: number } | undefined;

    if (!row || row.reset_at <= now) {
      await db.prepare('INSERT INTO login_rate_limits (key, count, reset_at) VALUES (?, ?, ?) ' +
        'ON CONFLICT(key) DO UPDATE SET count = 1, reset_at = excluded.reset_at').run(key, 1, now + WINDOW_MS);
    } else {
      await db.prepare('UPDATE login_rate_limits SET count = count + 1 WHERE key = ?').run(key);
    }
  } finally {
    db.close();
  }
}

export async function clearLoginAttempts(key: string): Promise<void> {
  const db = await getDatabase();
  try {
    await db.prepare('DELETE FROM login_rate_limits WHERE key = ?').run(key);
  } finally {
    db.close();
  }
}
