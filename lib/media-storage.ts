import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import fs from 'node:fs';
import path from 'node:path';

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

export function isR2Configured(): boolean {
  return Boolean(
    env('R2_ACCOUNT_ID') &&
    env('R2_ACCESS_KEY_ID') &&
    env('R2_SECRET_ACCESS_KEY') &&
    env('R2_BUCKET_NAME') &&
    env('R2_PUBLIC_BASE_URL')
  );
}

let r2Client: S3Client | null = null;
function getR2Client(): S3Client {
  if (r2Client) return r2Client;
  r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${env('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env('R2_ACCESS_KEY_ID')!,
      secretAccessKey: env('R2_SECRET_ACCESS_KEY')!,
    },
  });
  return r2Client;
}

/* ------------------------------------------------------------------ */
/* Cloudinary (server-side only — API secret never reaches browser)   */
/* ------------------------------------------------------------------ */

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    env('CLOUDINARY_CLOUD_NAME') &&
    env('CLOUDINARY_API_KEY') &&
    env('CLOUDINARY_API_SECRET')
  );
}

function cloudinaryUploadUrl(): string | undefined {
  const cloudName = env('CLOUDINARY_CLOUD_NAME');
  return cloudName ? `https://api.cloudinary.com/v1_1/${cloudName}/upload` : undefined;
}

function cloudinaryDeleteUrl(): string | undefined {
  const cloudName = env('CLOUDINARY_CLOUD_NAME');
  return cloudName ? `https://api.cloudinary.com/v1_1/${cloudName}/destroy` : undefined;
}

function cloudinaryAuthHeader(): string | undefined {
  const apiKey = env('CLOUDINARY_API_KEY');
  const apiSecret = env('CLOUDINARY_API_SECRET');
  if (!apiKey || !apiSecret) return undefined;
  return 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
}

async function storeUploadedFileToCloudinary(
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<StoredMedia> {
  const uploadUrl = cloudinaryUploadUrl();
  const auth = cloudinaryAuthHeader();
  if (!uploadUrl || !auth) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
    );
  }

  const formData = new FormData();
  formData.append('file', new Blob([new Uint8Array(buffer)], { type: contentType }), filename);
  formData.append('resource_type', 'auto');
  formData.append('public_id', `mesca/${Date.now()}-${sanitizeFilename(filename)}`);

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: auth,
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Cloudinary upload failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    secure_url?: string;
    public_id?: string;
    url?: string;
  };
  if (!data.secure_url) {
    throw new Error('Cloudinary upload succeeded but returned no secure_url.');
  }

  return {
    storageKey: `cloudinary:${data.public_id ?? filename}`,
    url: data.secure_url,
  };
}

async function deleteStoredFileFromCloudinary(publicId: string): Promise<void> {
  const deleteUrl = cloudinaryDeleteUrl();
  const auth = cloudinaryAuthHeader();
  if (!deleteUrl || !auth) return;

  try {
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('type', 'upload');
    await fetch(deleteUrl, {
      method: 'POST',
      headers: {
        Authorization: auth,
      },
      body: formData,
    });
  } catch { /* ignore — delete failures must not break the main flow */ }
}

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}

export interface StoredMedia {
  storageKey: string; // opaque key passed back to delete
  url: string;
}

export async function storeUploadedFile(filename: string, buffer: Buffer, contentType: string): Promise<StoredMedia> {
  if (isCloudinaryConfigured()) {
    return storeUploadedFileToCloudinary(filename, buffer, contentType);
  }

  if (isR2Configured()) {
    const key = `media/${filename}`;
    await getR2Client().send(new PutObjectCommand({
      Bucket: env('R2_BUCKET_NAME')!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));
    const base = env('R2_PUBLIC_BASE_URL');
    const url = base ? `${base.replace(/\/$/, '')}/${key}` : `https://${env('R2_BUCKET_NAME')}.${env('R2_ACCOUNT_ID')}.r2.dev/${key}`;
    return { storageKey: `r2:${key}`, url };
  }

  // Production must not silently fall back to a non-durable local filesystem.
  throw new Error(
    'No media storage provider is configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET (Cloudinary) or R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_BASE_URL (Cloudflare R2) in Vercel project settings.'
  );
}

export async function deleteStoredFile(storageKey: string): Promise<void> {
  if (storageKey.startsWith('cloudinary:')) {
    const publicId = storageKey.slice('cloudinary:'.length);
    await deleteStoredFileFromCloudinary(publicId);
    return;
  }
  if (storageKey.startsWith('r2:')) {
    if (!isR2Configured()) return;
    const key = storageKey.slice('r2:'.length);
    try {
      await getR2Client().send(new DeleteObjectCommand({
        Bucket: env('R2_BUCKET_NAME')!,
        Key: key,
      }));
    } catch { /* ignore */ }
    return;
  }
  if (storageKey.startsWith('local:')) {
    const filename = storageKey.slice('local:'.length);
    const filePath = path.join(UPLOAD_DIR, filename);
    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch { /* ignore */ }
  } else {
    // legacy absolute path
    try { if (fs.existsSync(storageKey)) fs.unlinkSync(storageKey); } catch { /* ignore */ }
  }
}