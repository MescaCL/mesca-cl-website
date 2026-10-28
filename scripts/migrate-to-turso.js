const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SOURCE_URL = process.env.SOURCE_DATABASE_URL || `file:${process.env.DATABASE_FILE || path.join(ROOT, 'database', 'mesca.db')}`;
const TARGET_URL = process.env.TURSO_DATABASE_URL;
const TARGET_TOKEN = process.env.TURSO_AUTH_TOKEN;
const SCHEMA_FILE = path.join(ROOT, 'lib', 'db', 'schema.sql');

function quoteIdent(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

async function main() {
  if (!TARGET_URL) {
    console.error('TURSO_DATABASE_URL is required.');
    process.exit(1);
  }
  if (!TARGET_TOKEN) {
    console.error('TURSO_AUTH_TOKEN is required.');
    process.exit(1);
  }

  const { createClient } = require('@libsql/client');
  const source = createClient({ url: SOURCE_URL });
  const target = createClient({ url: TARGET_URL, authToken: TARGET_TOKEN });

  try {
    if (fs.existsSync(SCHEMA_FILE)) {
      const schema = fs.readFileSync(SCHEMA_FILE, 'utf8');
      await target.execute('PRAGMA foreign_keys = OFF');
      await target.executeMultiple(schema);
    }

    const tablesRes = await source.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
    const tables = tablesRes.rows.map((r) => r.name);

    const counts = {};

    for (const table of tables) {
      const colsRes = await source.execute(`PRAGMA table_info(${quoteIdent(table)})`);
      const columns = colsRes.rows.map((r) => r.name);
      if (columns.length === 0) continue;

      const rowsRes = await source.execute(`SELECT * FROM ${quoteIdent(table)}`);
      const rows = rowsRes.rows;
      counts[table] = { source: rows.length, target: 0 };

      await target.execute('BEGIN');
      try {
        await target.execute(`DELETE FROM ${quoteIdent(table)}`);
        const placeholders = columns.map(() => '?').join(', ');
        const sql = `INSERT INTO ${quoteIdent(table)} (${columns.map(quoteIdent).join(', ')}) VALUES (${placeholders})`;

        for (const row of rows) {
          const args = columns.map((c) => row[c]);
          await target.execute({ sql, args });
        }
        await target.execute('COMMIT');
      } catch (error) {
        await target.execute('ROLLBACK');
        throw error;
      }

      const targetCountRes = await target.execute(`SELECT COUNT(*) AS c FROM ${quoteIdent(table)}`);
      counts[table].target = Number(targetCountRes.rows[0].c);
      console.log(`${table}: migrated ${counts[table].target}/${counts[table].source} rows`);
    }

    await target.execute('PRAGMA foreign_keys = ON');

    const mismatches = Object.entries(counts).filter(([, c]) => c.source !== c.target);
    if (mismatches.length > 0) {
      console.error('Row-count verification failed:');
      for (const [table, c] of mismatches) {
        console.error(` - ${table}: source=${c.source}, target=${c.target}`);
      }
      process.exitCode = 1;
    } else {
      console.log('Migration complete. All row counts verified.');
    }
  } finally {
    source.close();
    target.close();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});