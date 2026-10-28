const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SOURCE_URL = process.env.TURSO_DATABASE_URL;
const SOURCE_TOKEN = process.env.TURSO_AUTH_TOKEN;
const TARGET_URL = process.env.ROLLBACK_DATABASE_URL || `file:${process.env.DATABASE_FILE || path.join(ROOT, 'database', 'mesca.rollback.db')}`;

function quoteIdent(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

async function main() {
  if (!SOURCE_URL || !SOURCE_TOKEN) {
    console.error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required for rollback source.');
    process.exit(1);
  }

  const { createClient } = require('@libsql/client');
  const source = createClient({ url: SOURCE_URL, authToken: SOURCE_TOKEN });
  const target = createClient({ url: TARGET_URL });

  try {
    if (TARGET_URL.startsWith('file:')) {
      const dir = path.dirname(TARGET_URL.slice('file:'.length));
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }

    const schemaFile = path.join(ROOT, 'lib', 'db', 'schema.sql');
    if (fs.existsSync(schemaFile)) {
      const schema = fs.readFileSync(schemaFile, 'utf8');
      await target.execute('PRAGMA foreign_keys = OFF');
      await target.executeMultiple(schema);
    }

    const tablesRes = await source.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
    const tables = tablesRes.rows.map((r) => r.name);

    for (const table of tables) {
      const colsRes = await source.execute(`PRAGMA table_info(${quoteIdent(table)})`);
      const columns = colsRes.rows.map((r) => r.name);
      if (columns.length === 0) continue;

      const rowsRes = await source.execute(`SELECT * FROM ${quoteIdent(table)}`);
      const rows = rowsRes.rows;

      await target.execute('BEGIN');
      try {
        await target.execute(`DELETE FROM ${quoteIdent(table)}`);
        const placeholders = columns.map(() => '?').join(', ');
        const sql = `INSERT INTO ${quoteIdent(table)} (${columns.map(quoteIdent).join(', ')}) VALUES (${placeholders})`;
        for (const row of rows) {
          await target.execute({ sql, args: columns.map((c) => row[c]) });
        }
        await target.execute('COMMIT');
      } catch (error) {
        await target.execute('ROLLBACK');
        throw error;
      }

      console.log(`${table}: restored ${rows.length} rows`);
    }

    await target.execute('PRAGMA foreign_keys = ON');
    console.log('Rollback complete. Local file:', TARGET_URL);
  } finally {
    source.close();
    target.close();
  }
}

main().catch((err) => {
  console.error('Rollback failed:', err);
  process.exit(1);
});