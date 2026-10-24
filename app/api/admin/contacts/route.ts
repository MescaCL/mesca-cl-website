import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin, getClientIp, requireCsrf } from '@/lib/api-guard';
import { auditLog } from '@/lib/auth';
import { getSession } from '@/lib/session';
import {
  getContactSubmissions,
  updateContactSubmissionStatus,
  deleteContactSubmission,
} from '@/lib/data/content';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['new', 'read', 'replied', 'archived'];

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const status = request.nextUrl.searchParams.get('status') ?? undefined;

  try {
    return NextResponse.json({ data: await getContactSubmissions(status) });
  } catch (error) {
    console.error('[admin:contacts] list failed', error);
    return NextResponse.json({ message: 'Could not load messages.' }, { status: 500 });
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

  if (!body.id || !body.status || !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ message: 'A valid id and status are required.' }, { status: 400 });
  }

  try {
    const updated = await updateContactSubmissionStatus(body.id, body.status);
    if (!updated) {
      return NextResponse.json({ message: 'Message not found.' }, { status: 404 });
    }
    await auditLog(
      getSession()?.userId ?? null,
      'update',
      'contact_submission',
      body.id,
      body.status,
      getClientIp(request)
    );
    return NextResponse.json({ message: 'Message status updated.' });
  } catch (error) {
    console.error('[admin:contacts] update failed', error);
    return NextResponse.json({ message: 'Could not update message.' }, { status: 500 });
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
    const deleted = await deleteContactSubmission(id);
    if (!deleted) {
      return NextResponse.json({ message: 'Message not found.' }, { status: 404 });
    }
    await auditLog(
      getSession()?.userId ?? null,
      'delete',
      'contact_submission',
      id,
      null,
      getClientIp(request)
    );
    return NextResponse.json({ message: 'Message deleted.' });
  } catch (error) {
    console.error('[admin:contacts] delete failed', error);
    return NextResponse.json({ message: 'Could not delete message.' }, { status: 500 });
  }
}
