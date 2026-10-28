import { NextResponse } from 'next/server';
import { requireAdmin, requireCsrf } from '@/lib/api-guard';
import { getDatabase } from '@/lib/db/index';

const ALLOWED_KEYS = new Set([
  // General
  'site_name', 'site_description', 'public_url', 'contact_email',
  // Metadata & SEO
  'seo_title', 'seo_description', 'opengraph_image',
  // Homepage
  'hero_eyebrow', 'hero_primary_cta_label', 'hero_primary_cta_url',
  'hero_secondary_cta_label', 'hero_secondary_cta_url', 'hero_secondary_email',
  // Social
  'social_x_url', 'social_github_url', 'social_linkedin_url', 'social_email_url',
  // Media
  'default_cover_image', 'default_cover_alt',
]);

function normalize(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  return null;
}

export const dynamic = 'force-dynamic';

function validateKey(key: string): string | null {
  return ALLOWED_KEYS.has(key) ? key : null;
}

function jsonError(message: string, status = 500) {
  return NextResponse.json({ message }, { status });
}

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const db = getDatabase();
  try {
    const stmt = db.prepare(
      'SELECT id, key, value, category FROM site_settings ORDER BY category ASC, key ASC'
    );
    const rows = await stmt.all();
    const data = (rows as { id: string; key: string; value: string | null; category: string }[]).map((r) => ({
      id: r.id,
      key: r.key,
      value: r.value,
      category: r.category,
    }));
    return NextResponse.json({ data });
  } catch (error) {
    console.error('[admin:settings] load failed', error);
    return jsonError('Could not load settings.');
  } finally {
    db.close();
  }
}

export async function POST(request: Request) {
  const csrfError = requireCsrf(request);
  if (csrfError) return csrfError;
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid request body.', 400);
  }

  const record = body as { key?: unknown; value?: unknown; category?: unknown };
  const key = validateKey(typeof record.key === 'string' ? record.key : '');
  if (!key) return jsonError('Invalid setting key.', 422);

  const value = normalize(record.value);
  const cat = validateKey(typeof record.category === 'string' ? record.category : 'general');
  if (!cat) return jsonError('Invalid category.', 422);

  const db = getDatabase();
  try {
    await db.prepare(
      `INSERT INTO site_settings (key, value, category) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, category = excluded.category, updated_at = CURRENT_TIMESTAMP`
    ).run(key, value, cat);
    return NextResponse.json({ message: 'Setting saved.', key, value, category: cat });
  } catch (error) {
    console.error('[admin:settings] save failed', error);
    return jsonError('Could not save setting.');
  } finally {
    db.close();
  }
}