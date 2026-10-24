import { NextResponse, type NextRequest } from 'next/server';
import { authenticateUser, generateToken, auditLog } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { sessionCookieOptions } from '@/lib/session';
import { requireCsrf } from '@/lib/api-guard';
import {
  checkLoginRateLimit,
  recordLoginFailure,
  clearLoginAttempts,
} from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

function rateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return (forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip')) || request.ip || 'unknown';
}

export async function POST(request: NextRequest) {
  const csrfError = requireCsrf(request);
  if (csrfError) return csrfError;

  const ipKey = rateLimitKey(request);
  const rl = await checkLoginRateLimit(ipKey);
  if (!rl.allowed) {
    return NextResponse.json(
      { message: 'Too many sign-in attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Please provide a valid email address and password.' },
      { status: 422 }
    );
  }

  const { email, password } = parsed.data;

  try {
    const user = await authenticateUser(email, password);

    if (!user) {
      await recordLoginFailure(ipKey);
      await auditLog(null, 'login_failed', 'user', null, email, null);
      return NextResponse.json(
        { message: 'Incorrect email or password.' },
        { status: 401 }
      );
    }

    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    await auditLog(user.id, 'login_success', 'user', user.id, null, null);
    await clearLoginAttempts(ipKey);

    const response = NextResponse.json({
      message: 'Signed in successfully.',
      user: { id: user.id, email: user.email, role: user.role },
    });

    response.cookies.set({
      ...sessionCookieOptions(),
      value: token,
    });

    return response;
  } catch (error) {
    console.error('[auth] login failed', error);
    return NextResponse.json(
      { message: 'Sign-in is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
