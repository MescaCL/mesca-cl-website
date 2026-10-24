import { NextResponse, type NextRequest } from 'next/server';
import { getDatabase, generateId } from '@/lib/db/index';
import { requireCsrf } from '@/lib/api-guard';
import { getSession } from '@/lib/session';
import { auditLog } from '@/lib/auth';
import { storeUploadedFile, deleteStoredFile, sanitizeFilename } from '@/lib/media-storage';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif',
  'video/mp4', 'video/webm', 'video/ogg',
];

export async function POST(request: NextRequest) {
  const session = getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }
  const csrfError = requireCsrf(request);
  if (csrfError) return csrfError;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ message: 'No file provided.' }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ message: 'File too large (max 10 MB).' }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ message: 'Unsupported file type.' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = sanitizeFilename(file.name);
    const timestamp = Date.now();
    const filename = `${timestamp}-${safeName}`;

    const stored = await storeUploadedFile(filename, buffer, file.type);

    const id = generateId();
    const db = await getDatabase();
    try {
      await db.prepare(
        `INSERT INTO media_files (id, filename, original_name, file_path, file_url, file_type, file_size, alt_text, caption, description, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        id, filename, file.name, stored.storageKey, stored.url, file.type, file.size,
        (formData.get('alt_text') as string) ?? null,
        (formData.get('caption') as string) ?? null,
        (formData.get('description') as string) ?? null,
        session.userId
      );

      const row = await db.prepare('SELECT * FROM media_files WHERE id = ?').get(id) as {
        filename: string; original_name: string; file_url: string; file_type: string;
        file_size: number; alt_text: string | null; caption: string | null;
        description: string | null; uploaded_at: string;
      };

      await auditLog(session.userId, 'media_upload', 'media_file', id, `Uploaded ${file.name}`, null);

      return NextResponse.json(
        {
          message: 'File uploaded.',
          media: {
            id, filename: row.filename, original_name: row.original_name,
            file_url: row.file_url, file_type: row.file_type, file_size: row.file_size,
            alt_text: row.alt_text, caption: row.caption, description: row.description,
            uploaded_at: row.uploaded_at,
          },
        },
        { status: 201 }
      );
    } finally {
      db.close();
    }
  } catch (error) {
    console.error('[media] upload failed', error);
    return NextResponse.json({ message: 'Upload failed.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  const db = await getDatabase();
  try {
    const files = await db.prepare(
      `SELECT id, filename, original_name, file_url, file_type, file_size, alt_text, caption, description, uploaded_at FROM media_files ORDER BY uploaded_at DESC LIMIT 100`
    ).all() as Array<{
      id: string; filename: string; original_name: string; file_url: string;
      file_type: string; file_size: number; alt_text: string | null;
      caption: string | null; description: string | null; uploaded_at: string;
    }>;

    return NextResponse.json({ data: files });
  } finally {
    db.close();
  }
}

export async function DELETE(request: NextRequest) {
  const session = getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }
  const csrfError = requireCsrf(request);
  if (csrfError) return csrfError;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ message: 'Media ID required.' }, { status: 400 });

  const db = await getDatabase();
  try {
    const row = await db.prepare('SELECT * FROM media_files WHERE id = ?').get(id) as
      | { file_path: string; file_url: string } | undefined;

    if (!row) return NextResponse.json({ message: 'Media not found.' }, { status: 404 });

    await deleteStoredFile(row.file_path);

    await db.prepare('DELETE FROM media_files WHERE id = ?').run(id);
    await auditLog(session.userId, 'media_delete', 'media_file', id, `Deleted ${row.file_url}`, null);

    return NextResponse.json({ message: 'Media deleted.' });
  } finally {
    db.close();
  }
}
