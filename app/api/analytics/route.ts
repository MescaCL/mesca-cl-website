import { NextResponse, type NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  const db = await getDatabase();
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    if (path) {
      const row = await db
        .prepare('SELECT COUNT(*) as count FROM page_views WHERE path = ?')
        .get(path) as { count: number };
      return NextResponse.json({ count: row.count, path });
    }
    const rows = await db
      .prepare('SELECT path, COUNT(*) as count FROM page_views GROUP BY path ORDER BY count DESC')
      .all() as { path: string; count: number }[];
    const result: Record<string, { count: number }> = {};
    for (const row of rows) {
      result[row.path] = { count: row.count };
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('[analytics] error', error);
    return NextResponse.json({}, { status: 500 });
  } finally {
    db.close();
  }
}

export async function POST(request: NextRequest) {
  const db = await getDatabase();
  try {
    const body = await request.json();
    const path = body.path || request.nextUrl.pathname;
    const ipAddress =
      body.ipAddress ||
      (request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown');
    const userAgent = body.userAgent || request.headers.get('user-agent') || 'unknown';

    await db.prepare(
      'INSERT INTO page_views (path, user_agent, ip_address) VALUES (?, ?, ?)'
    ).run(path, userAgent, ipAddress);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[analytics] error', error);
    return NextResponse.json({ success: false }, { status: 500 });
  } finally {
    db.close();
  }
}