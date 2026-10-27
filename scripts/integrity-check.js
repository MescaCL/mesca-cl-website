const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const { loadEnvConfig } = require('@next/env');
loadEnvConfig(ROOT);

function dbUrl() {
  return process.env.TURSO_DATABASE_URL || `file:${process.env.DATABASE_FILE || path.join(ROOT, 'database', 'mesca.db')}`;
}

const REQUIRED_TABLES = [
  'users', 'profiles', 'categories', 'projects', 'posts', 'journey_milestones',
  'now_items', 'social_links', 'contact_submissions', 'site_settings',
  'media_files', 'audit_logs',
];

async function main() {
  const { createClient } = require('@libsql/client');
  const url = dbUrl();
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });

  const issues = [];
  const warnings = [];

  const tablesRes = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  const tables = new Set(tablesRes.rows.map((r) => r.name));

  for (const table of REQUIRED_TABLES) {
    if (!tables.has(table)) issues.push(`Missing table: ${table}`);
  }

  // Media integrity
  if (tables.has('media_files')) {
    const mediaRes = await client.execute('SELECT id, filename, file_path, file_url, file_type FROM media_files');
    let localMissing = 0;
    for (const row of mediaRes.rows) {
      const key = row.file_path;
      if (typeof key === 'string' && key.startsWith('local:')) {
        const filename = key.slice('local:'.length);
        const filePath = path.join(ROOT, 'public', 'uploads', filename);
        if (!fs.existsSync(filePath)) {
          localMissing++;
          issues.push(`Missing local media file for ${row.id}: ${filePath}`);
        }
      } else if (typeof key === 'string' && !key.startsWith('r2:') && !key.startsWith('local:')) {
        // legacy absolute path
        if (!fs.existsSync(key)) {
          localMissing++;
          issues.push(`Missing legacy media file for ${row.id}: ${key}`);
        }
      }
      if (!row.file_url) issues.push(`Media ${row.id} has empty file_url`);
    }
    console.log(`Media rows: ${mediaRes.rows.length} (missing local files: ${localMissing})`);
  }

  // R2 env consistency
  const r2Vars = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME'];
  const setVars = r2Vars.filter((name) => process.env[name] && process.env[name].trim());
  if (setVars.length > 0 && setVars.length < r2Vars.length) {
    warnings.push(`Partial R2 configuration: ${setVars.join(', ')} set; missing ${r2Vars.filter((n) => !setVars.includes(n)).join(', ')}`);
  }

  // Basic counts
  for (const table of ['users', 'posts', 'projects', 'media_files', 'contact_submissions']) {
    if (tables.has(table)) {
      const res = await client.execute(`SELECT COUNT(*) AS c FROM ${table}`);
      console.log(`${table}: ${res.rows[0].c} rows`);
    }
  }

  client.close();

  for (const warning of warnings) console.warn(`WARNING: ${warning}`);
  if (issues.length > 0) {
    console.error(`Integrity check failed with ${issues.length} issue(s):`);
    for (const issue of issues) console.error(` - ${issue}`);
    process.exit(1);
  }
  console.log('Integrity check passed.');
}

main().catch((err) => {
  console.error('Integrity check failed:', err);
  process.exit(1);
});