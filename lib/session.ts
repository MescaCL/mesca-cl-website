import { cookies } from 'next/headers';
import { verifyToken, JWTPayload, getUserById } from './auth';

export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'mesca_session';

export async function isAuthenticated(): Promise<boolean> {
  const session = getSession();
  if (!session || session.role !== 'admin') return false;
  const user = await getUserById(session.userId);
  if (!user || user.role !== 'admin') return false;
  if ((session.tokenVersion ?? -1) !== (user.token_version ?? 0)) return false;
  return true;
}

const parsedSessionMaxAge = Number(process.env.SESSION_MAX_AGE);
const SESSION_MAX_AGE_SECONDS =
  Number.isFinite(parsedSessionMaxAge) && parsedSessionMaxAge > 0
    ? parsedSessionMaxAge
    : 14400;
export const SESSION_MAX_AGE = SESSION_MAX_AGE_SECONDS;

export function formatSessionDuration(seconds: number = SESSION_MAX_AGE): string {
  const safeSeconds =
    Number.isFinite(seconds) && seconds > 0 ? seconds : SESSION_MAX_AGE;
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = Math.floor(safeSeconds % 60);
  const parts: string[] = [];

  if (hours > 0) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
  if (remainingSeconds > 0) {
    parts.push(`${remainingSeconds} second${remainingSeconds === 1 ? '' : 's'}`);
  }

  return parts.length > 0 ? parts.join(' ') : '0 seconds';
}

export function isCookieSecure(): boolean {
  const override = process.env.COOKIE_SECURE;
  if (override !== undefined) {
    return override.toLowerCase() === 'true' || override === '1';
  }
  return process.env.NODE_ENV === 'production';
}

export function sessionCookieOptions(maxAge: number = SESSION_MAX_AGE) {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    path: '/',
    maxAge,
    sameSite: 'lax' as const,
    secure: isCookieSecure(),
  };
}

export function getSession(): JWTPayload | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}
