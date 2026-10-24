import { NextResponse, type NextRequest } from 'next/server';
import { requireCsrf, getClientIp } from '@/lib/api-guard';
import { subscribeNewsletter } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const csrfError = requireCsrf(request);
  if (csrfError) return csrfError;

  let body: { email?: string; source?: string };
  try {
    body = (await request.json()) as { email?: string; source?: string };
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json({ message: 'A valid email is required.' }, { status: 400 });
  }

  try {
    const subscriber = await subscribeNewsletter(
      body.email.trim().toLowerCase(),
      body.source ?? 'website'
    );
    return NextResponse.json(
      { message: 'Subscribed successfully.', subscriber },
      { status: 201 }
    );
  } catch (error) {
    console.error('[newsletter] subscribe failed', error);
    return NextResponse.json({ message: 'Could not subscribe.' }, { status: 500 });
  }
}
