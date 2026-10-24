import { NextResponse, type NextRequest } from 'next/server';
import { contactSchema } from '@/lib/validations';
import { createContactSubmission, countRecentSubmissions } from '@/lib/data/content';
import { requireCsrf } from '@/lib/api-guard';

export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MINUTES = 60;
const RATE_LIMIT_MAX = 5;

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export async function POST(request: NextRequest) {
  const csrfError = requireCsrf(request);
  if (csrfError) return csrfError;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: 'Invalid request body. Expected JSON.' },
      { status: 400 }
    );
  }

  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const field = issue.path[0];
      if (typeof field === 'string' && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    });

    return NextResponse.json(
      { message: 'Please correct the highlighted fields.', errors: fieldErrors },
      { status: 422 }
    );
  }

  const ipAddress = getClientIp(request);

  try {
    if (await countRecentSubmissions(ipAddress, RATE_LIMIT_WINDOW_MINUTES) >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { message: 'You have sent several messages recently. Please try again later.' },
        { status: 429 }
      );
    }
   } catch (error) {
     console.error('[contact] rate-limit check failed', error);
     return NextResponse.json(
       { message: 'We could not process your message right now. Please try again shortly.' },
       { status: 503 }
     );
   }

  try {
    await createContactSubmission({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject ?? null,
      category: parsed.data.category ?? null,
      message: parsed.data.message,
      ip_address: ipAddress,
      user_agent: request.headers.get('user-agent'),
    });
  } catch (error) {
    console.error('[contact] failed to persist submission', error);
    return NextResponse.json(
      { message: 'We could not send your message right now. Please try again shortly.' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: 'Thanks for reaching out — I will get back to you soon.' },
    { status: 201 }
  );
}
