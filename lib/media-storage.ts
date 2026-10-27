import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import fs from 'node:fs';
import path from 'node:path';
import { isProductionEnvironment } from './db/index';

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

export function isR2Configured(): boolean {
  return Boolean(env('R2_ACCOUNT_ID') && env('R2_ACCESS_KEY_ID') && env('R2_SECRET_ACCESS_KEY') && env('R2_BUCKET_NAME'));
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

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}

export interface StoredMedia {
  storageKey: string; // opaque key passed back to delete
  url: string;
}

export async function storeUploadedFile(filename: string, buffer: Buffer, contentType: string): Promise<StoredMedia> {
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

  // Local dev fallback only — never silently use ephemeral serverless storage in production.
  if (isProductionEnvironment()) {
    throw new Error(
      'R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME in production before allowing uploads.'
    );
  }

  // Local dev fallback
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const filePath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  return { storageKey: `local:${filename}`, url: `/uploads/${filename}` };
}

export async function deleteStoredFile(storageKey: string): Promise<void> {
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