const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DB_FILE = process.env.DATABASE_FILE || path.join(ROOT, 'database', 'mesca.db');
const SCHEMA_FILE = path.join(ROOT, 'lib', 'db', 'schema.sql');

function dbUrl() {
  return process.env.TURSO_DATABASE_URL || `file:${DB_FILE}`;
}

async function main() {
  const { createClient } = require('@libsql/client');
  const url = dbUrl();
  if (url.startsWith('file:')) {
    const dir = path.dirname(url.slice('file:'.length));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created database directory: ${dir}`);
    }
  }

  if (!fs.existsSync(SCHEMA_FILE)) {
    console.error(`Schema file not found at ${SCHEMA_FILE}`);
    process.exit(1);
  }

  const schema = fs.readFileSync(SCHEMA_FILE, 'utf8');
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });

  await client.execute('PRAGMA foreign_keys = ON');
  await client.executeMultiple(schema);

  const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
  const tables = result.rows.map((r) => r.name);

  client.close();

  console.log(`Database ready at ${url}`);
  console.log(`Tables (${tables.length}): ${tables.join(', ')}`);
}

main().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});