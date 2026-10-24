import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin, requireCsrf, getClientIp } from '@/lib/api-guard';
import { auditLog } from '@/lib/auth';
import { getSession } from '@/lib/session';
import {
  getCommentsByPost,
  getPendingComments,
  updateCommentStatus,
  deleteComment,
} from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('post_id');
  const status = searchParams.get('status');

  try {
    let comments;
    if (status === 'pending') {
      comments = await getPendingComments();
    } else if (postId) {
      comments = await getCommentsByPost(postId, false);
    } else {
      comments = await getCommentsByPost('', false);
    }
    return NextResponse.json({ data: comments });
  } catch (error) {
    console.error('[admin:comments] list failed', error);
    return NextResponse.json({ message: 'Could not load comments.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const csrfError = requireCsrf(request);
  if (csrfError) return csrfError;
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  let body: { id?: string; status?: string };
  try {
    body = (await request.json()) as { id?: string; status?: string };
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  if (!body.id || !body.status || !['approved', 'rejected'].includes(body.status)) {
    return NextResponse.json(
      { message: 'A valid id and status (approved/rejected) are required.' },
      { status: 400 }
    );
  }

  try {
    const updated = await updateCommentStatus(body.id, body.status as 'approved' | 'rejected');
    if (!updated) {
      return NextResponse.json({ message: 'Comment not found.' }, { status: 404 });
    }
    await auditLog(
      getSession()?.userId ?? null,
      'update_comment_status',
      'comment',
      body.id,
      body.status,
      getClientIp(request)
    );
    return NextResponse.json({ message: `Comment ${body.status}.` });
  } catch (error) {
    console.error('[admin:comments] update failed', error);
    return NextResponse.json({ message: 'Could not update comment.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const csrfError = requireCsrf(request);
  if (csrfError) return csrfError;
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ message: 'An id is required.' }, { status: 400 });
  }

  try {
    const deleted = await deleteComment(id);
    if (!deleted) {
      return NextResponse.json({ message: 'Comment not found.' }, { status: 404 });
    }
    await auditLog(
      getSession()?.userId ?? null,
      'delete_comment',
      'comment',
      id,
      null,
      getClientIp(request)
    );
    return NextResponse.json({ message: 'Comment deleted.' });
  } catch (error) {
    console.error('[admin:comments] delete failed', error);
    return NextResponse.json({ message: 'Could not delete comment.' }, { status: 500 });
  }
}
