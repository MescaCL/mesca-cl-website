const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const { loadEnvConfig } = require('@next/env');
loadEnvConfig(ROOT);

function dbUrl() {
  return process.env.TURSO_DATABASE_URL || `file:${process.env.DATABASE_FILE || path.join(ROOT, 'database', 'mesca.db')}`;
}

async function main() {
  const url = dbUrl();
  if (url.startsWith('libsql://') || url.startsWith('https://')) {
    console.error('Remote Turso databases cannot be copied as a local file by this script.');
    console.error('Use Turso backups/CLI or run npm run db:migrate:turso in reverse via rollback script.');
    process.exit(1);
  }

  const sourcePath = url.slice('file:'.length);
  if (!fs.existsSync(sourcePath)) {
    console.error(`Database file not found: ${sourcePath}`);
    process.exit(1);
  }

  const backupDir = path.join(ROOT, 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const targetPath = path.join(backupDir, `mesca-${stamp}.db`);
  fs.copyFileSync(sourcePath, targetPath);

  // Copy sidecar files if present.
  for (const suffix of ['-wal', '-shm', '-journal']) {
    const sidecar = sourcePath + suffix;
    if (fs.existsSync(sidecar)) fs.copyFileSync(sidecar, targetPath + suffix);
  }

  console.log(`Database backed up to ${targetPath}`);
}

main().catch((err) => {
  console.error('Backup failed:', err);
  process.exit(1);
});