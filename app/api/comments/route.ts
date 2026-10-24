import { NextResponse, type NextRequest } from 'next/server';
import { requireCsrf, getClientIp } from '@/lib/api-guard';
import { createComment } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const csrfError = requireCsrf(request);
  if (csrfError) return csrfError;

  let body: {
    post_id?: string;
    author_name?: string;
    author_email?: string;
    content?: string;
  };

  try {
    body = (await request.json()) as {
      post_id?: string;
      author_name?: string;
      author_email?: string;
      content?: string;
    };
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  if (!body.post_id || !body.author_name || !body.author_email || !body.content) {
    return NextResponse.json(
      { message: 'post_id, author_name, author_email and content are required.' },
      { status: 400 }
    );
  }

  if (body.author_name.length > 100) {
    return NextResponse.json({ message: 'Name too long.' }, { status: 400 });
  }
  if (body.content.length > 5000) {
    return NextResponse.json({ message: 'Comment too long.' }, { status: 400 });
  }

  try {
    const comment = await createComment({
      post_id: body.post_id,
      author_name: body.author_name.trim(),
      author_email: body.author_email.trim(),
      content: body.content.trim(),
      ip_address: getClientIp(request),
      user_agent: request.headers.get('user-agent') ?? null,
    });

    return NextResponse.json(
      { message: 'Comment submitted. It will appear after approval.', comment },
      { status: 201 }
    );
  } catch (error) {
    console.error('[comments] create failed', error);
    return NextResponse.json({ message: 'Could not submit comment.' }, { status: 500 });
  }
}
