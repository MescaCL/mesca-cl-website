import { NextResponse, type NextRequest } from 'next/server';
import { isAuthenticated } from '@/lib/session';

export const dynamic = 'force-dynamic';

/** Best-effort client IP extraction for audit logging. */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

function allowedOrigins(request: Request): Set<string> {
  const origins = new Set<string>();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      origins.add(new URL(siteUrl).origin);
    } catch {
      // ignore malformed config
    }
  }

  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host');
  if (host) {
    const proto =
      request.headers.get('x-forwarded-proto') ||
      (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
    origins.add(`${proto}://${host}`);
  }

  return origins;
}

/**
 * CSRF defence for cookie-authenticated, state-changing endpoints.
 *
 * Browsers always attach an `Origin` (and usually `Referer`) header to
 * cross-origin and same-origin state-changing requests. We require that header
 * to match one of the trusted origins derived from NEXT_PUBLIC_SITE_URL and the
 * current request host. Requests without an Origin/Referer are rejected, which
 * also blocks simple cross-site form posts.
 */
export function requireCsrf(request: Request): NextResponse | null {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return null;

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const trusted = allowedOrigins(request);

  let requestOrigin: string | null = null;
  if (origin) {
    requestOrigin = origin;
  } else if (referer) {
    try {
      requestOrigin = new URL(referer).origin;
    } catch {
      requestOrigin = null;
    }
  }

  if (!requestOrigin || !trusted.has(requestOrigin)) {
    return NextResponse.json(
      { message: 'Cross-site request rejected.' },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Guard used by every protected admin API route.
 * Returns a 401 response when the caller has no valid admin session.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { message: 'Authentication required.' },
      { status: 401 }
    );
  }
  return null;
}
