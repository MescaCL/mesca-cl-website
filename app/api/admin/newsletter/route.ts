import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin, requireCsrf, getClientIp } from '@/lib/api-guard';
import { auditLog } from '@/lib/auth';
import { getSession } from '@/lib/session';
import { getNewsletterSubscribers, unsubscribeNewsletter, deleteNewsletterSubscriber } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const status = request.nextUrl.searchParams.get('status');
  try {
    return NextResponse.json({
      data: await getNewsletterSubscribers(status as string | undefined),
    });
  } catch (error) {
    console.error('[admin:newsletter] list failed', error);
    return NextResponse.json({ message: 'Could not load subscribers.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const csrfError = requireCsrf(request);
  if (csrfError) return csrfError;
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const email = request.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ message: 'An email is required.' }, { status: 400 });
  }

  try {
    const deleted = await deleteNewsletterSubscriber(email);
    if (!deleted) {
      return NextResponse.json({ message: 'Subscriber not found.' }, { status: 404 });
    }
    await auditLog(
      getSession()?.userId ?? null,
      'unsubscribe_newsletter',
      'newsletter_subscriber',
      email,
      'deleted',
      getClientIp(request)
    );
    return NextResponse.json({ message: 'Subscriber removed.' });
  } catch (error) {
    console.error('[admin:newsletter] delete failed', error);
    return NextResponse.json({ message: 'Could not remove subscriber.' }, { status: 500 });
  }
}
