import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin, requireCsrf } from '@/lib/api-guard';
import { getProfile, updateProfile } from '@/lib/data';
import { createSupportCampaign } from '@/lib/data/content';
import { storeUploadedFile, deleteStoredFile, sanitizeFilename } from '@/lib/media-storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    return NextResponse.json({ data: await getProfile() });
  } catch (error) {
    console.error('[admin:profile] load failed', error);
    return NextResponse.json({ message: 'Could not load profile.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const csrfError = requireCsrf(request);
  if (csrfError) return csrfError;
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  const allowed = [
    'brand_name',
    'full_name',
    'short_bio',
    'full_bio',
    'headline',
    'supporting_statement',
    'email',
    'phone_number',
    'whatsapp_number',
    'call_button_label',
    'whatsapp_button_label',
    'call_button_visible',
    'whatsapp_button_visible',
    'whatsapp_preset_message',
    'profile_image_url',
    'profile_image_alt',
    'hero_eyebrow',
    'hero_primary_cta_label',
    'hero_primary_cta_url',
    'hero_secondary_cta_label',
    'hero_secondary_cta_url',
    'location',
  ];

  const payload: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) {
      payload[key] = body[key] === '' ? null : body[key];
    }
  }

  if (payload.email !== undefined && payload.email !== null) {
    if (typeof payload.email !== 'string' || !payload.email.includes('@')) {
      return NextResponse.json(
        { message: 'Please provide a valid email address.', errors: { email: 'Invalid email address' } },
        { status: 422 }
      );
    }
  }

  try {
    const profile = await updateProfile(payload);
    return NextResponse.json({ data: profile, message: 'Profile updated.' });
  } catch (error) {
    console.error('[admin:profile] update failed', error);
    return NextResponse.json({ message: 'Could not update profile.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const csrfError = requireCsrf(request);
  if (csrfError) return csrfError;
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const formData = await request.formData();

    const file = formData.get('image') as File | null;
    if (file) {
      // Validate file type and size on the server.
      if (!file.type || !file.type.startsWith('image/')) {
        return NextResponse.json({ message: 'Only image files are allowed.' }, { status: 415 });
      }
      const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ message: 'Image must be 2 MB or smaller.' }, { status: 413 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const safeName = sanitizeFilename(file.name);
      const timestamp = Date.now();
      const filename = `${timestamp}-${safeName}`;

      const stored = await storeUploadedFile(filename, buffer, file.type);

      const alt = (formData.get('alt') as string | null) ?? file.name ?? 'Profile photo';

      try {
        const profile = await updateProfile({
          profile_image_url: stored.url,
          profile_image_alt: alt,
        });
        return NextResponse.json({ data: profile, url: stored.url, message: 'Profile image uploaded.' });
      } catch (updateError) {
        console.error('[admin:profile] update failed', updateError);
        // Roll back the stored file if the database update failed.
        await deleteStoredFile(stored.storageKey);
        return NextResponse.json({ message: 'Could not update profile with image.' }, { status: 500 });
      }
    }

    const title = formData.get('title') as string | null;
    if (title) {
      const purpose = formData.get('purpose') as string | null;
      const description = formData.get('description') as string | null;
      const suggested_amounts = formData.get('suggested_amounts') as string | null;
      const target_amount = formData.get('target_amount') as string | null;
      const currency = formData.get('currency') as string | null;
      const is_enabled = formData.get('is_enabled') as string | null;
      const provider = formData.get('provider') as string | null;
      const provider_config = formData.get('provider_config') as string | null;

      const campaign = await createSupportCampaign({
        title,
        purpose: purpose ?? undefined,
        description: description ?? undefined,
        suggested_amounts: suggested_amounts ?? undefined,
        target_amount: target_amount ? Number(target_amount) : undefined,
        currency: currency ?? '',
        is_enabled: is_enabled ? Number(is_enabled) : 0,
        provider: provider ?? undefined,
        provider_config: provider_config ?? undefined,
      });

      return NextResponse.json({ data: campaign, message: 'Support campaign created.' });
    }

    return NextResponse.json({ message: 'No valid action specified.' }, { status: 400 });
  } catch (error) {
    console.error('[admin:profile] POST failed', error);
    return NextResponse.json({ message: 'Could not process request.' }, { status: 500 });
  }
}
