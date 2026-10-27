const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const { loadEnvConfig } = require('@next/env');
loadEnvConfig(ROOT);

function dbUrl() {
  return process.env.TURSO_DATABASE_URL || `file:${process.env.DATABASE_FILE || path.join(ROOT, 'database', 'mesca.db')}`;
}

function r2Env(name) {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

function contentTypeFor(filename, fallback) {
  if (fallback) return fallback;
  const ext = path.extname(filename).toLowerCase();
  const map = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif',
    '.webp': 'image/webp', '.avif': 'image/avif', '.mp4': 'video/mp4',
    '.webm': 'video/webm', '.ogg': 'video/ogg',
  };
  return map[ext] || 'application/octet-stream';
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function uploadWithRetry(s3, Bucket, Key, Body, ContentType, attempts = 3) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      await s3.send(new (require('@aws-sdk/client-s3').PutObjectCommand)({
        Bucket,
        Key,
        Body,
        ContentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }));
      return;
    } catch (error) {
      lastError = error;
      if (i < attempts - 1) await sleep(500 * (i + 1));
    }
  }
  throw lastError;
}

async function main() {
  const r2Vars = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME'];
  const missing = r2Vars.filter((name) => !r2Env(name));
  if (missing.length > 0) {
    console.error(`R2 is not fully configured. Missing: ${missing.join(', ')}`);
    process.exit(1);
  }

  const { createClient } = require('@libsql/client');
  const { S3Client } = require('@aws-sdk/client-s3');
  const client = createClient({ url: dbUrl(), authToken: process.env.TURSO_AUTH_TOKEN });

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${r2Env('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: r2Env('R2_ACCESS_KEY_ID'),
      secretAccessKey: r2Env('R2_SECRET_ACCESS_KEY'),
    },
  });

  const { PutObjectCommand } = require('@aws-sdk/client-s3');

  // Monkey patch uploadWithRetry to use PutObjectCommand
  async function doUpload(Bucket, Key, Body, ContentType) {
    let lastError;
    for (let i = 0; i < 3; i++) {
      try {
        await s3.send(new PutObjectCommand({
          Bucket,
          Key,
          Body,
          ContentType,
          CacheControl: 'public, max-age=31536000, immutable',
        }));
        return;
      } catch (error) {
        lastError = error;
        if (i < 2) await sleep(500 * (i + 1));
      }
    }
    throw lastError;
  }

  const rows = await client.execute('SELECT id, filename, file_path, file_url, file_type FROM media_files');
  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows.rows) {
    const storageKey = row.file_path;
    if (typeof storageKey === 'string' && storageKey.startsWith('r2:')) {
      skipped++;
      continue;
    }

    let filename = row.filename;
    let localPath;
    if (typeof storageKey === 'string' && storageKey.startsWith('local:')) {
      filename = storageKey.slice('local:'.length);
      localPath = path.join(ROOT, 'public', 'uploads', filename);
    } else if (typeof storageKey === 'string') {
      localPath = storageKey;
      filename = path.basename(storageKey);
    } else {
      console.warn(`Skip ${row.id}: unsupported storage key`);
      failed++;
      continue;
    }

    if (!fs.existsSync(localPath)) {
      console.warn(`Skip ${row.id}: local file missing ${localPath}`);
      failed++;
      continue;
    }

    const buffer = fs.readFileSync(localPath);
    const key = `media/${filename}`;
    const contentType = contentTypeFor(filename, row.file_type);

    try {
      await doUpload(r2Env('R2_BUCKET_NAME'), key, buffer, contentType);
      const base = r2Env('R2_PUBLIC_BASE_URL');
      const url = base ? `${base.replace(/\/$/, '')}/${key}` : `https://${r2Env('R2_BUCKET_NAME')}.${r2Env('R2_ACCOUNT_ID')}.r2.dev/${key}`;

      await client.execute({
        sql: 'UPDATE media_files SET file_path = ?, file_url = ?, file_type = COALESCE(file_type, ?) WHERE id = ?',
        args: [`r2:${key}`, url, contentType, row.id],
      });

      migrated++;
      console.log(`Migrated ${row.id} -> ${url}`);
    } catch (error) {
      failed++;
      console.error(`Failed ${row.id}: ${error && error.message ? error.message : error}`);
    }
  }

  client.close();
  console.log(`Done. Migrated ${migrated}, skipped ${skipped}, failed ${failed}.`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error('Upload migration failed:', err);
  process.exit(1);
});