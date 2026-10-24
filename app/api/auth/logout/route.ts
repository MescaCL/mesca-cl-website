import { NextResponse } from 'next/server';
import { auditLog, bumpTokenVersion } from '@/lib/auth';
import { getSession, sessionCookieOptions } from '@/lib/session';
import { requireCsrf } from '@/lib/api-guard';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const csrfError = requireCsrf(request);
  if (csrfError) return csrfError;

  const session = getSession();
  if (session?.userId) {
    await bumpTokenVersion(session.userId);
    await auditLog(session.userId, 'logout', 'user', session.userId, null, null);
  } else {
    await auditLog(null, 'logout', 'user', null, null, null);
  }

  const response = NextResponse.json({ message: 'Signed out.' });

  response.cookies.set({
    ...sessionCookieOptions(),
    value: '',
    maxAge: 0,
  });

  return response;
}
