const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function env(name) {
  return process.env[name];
}

async function main() {
  const url = env('TURSO_DATABASE_URL');
  const token = env('TURSO_AUTH_TOKEN');

  if (!url) {
    console.error('TURSO_DATABASE_URL is not set.');
    process.exit(1);
  }

  const client = createClient({ url, authToken: token });

  try {
    // Step 1: List all tables
    const tablesRes = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    );
    const tables = tablesRes.rows.map((r) => r.name);
    console.log('Tables:', tables.join(', '));

    // Step 2: Inspect site_settings schema
    const schemaRes = await client.execute("PRAGMA table_info(site_settings)");
    console.log('\n--- site_settings schema ---');
    for (const row of schemaRes.rows) {
      console.log(row);
    }

    // Step 3: Check if category column exists
    const hasCategory = schemaRes.rows.some((r) => r.name === 'category');
    console.log(`\ncategory column exists: ${hasCategory}`);

    // Step 4: Count existing settings
    const countRes = await client.execute('SELECT COUNT(*) AS c FROM site_settings');
    console.log(`\nsite_settings row count: ${countRes.rows[0].c}`);

    // Step 5: Show existing settings
    const settingsRes = await client.execute('SELECT id, key, value FROM site_settings');
    console.log('\n--- existing site_settings ---');
    for (const row of settingsRes.rows) {
      console.log(row);
    }

    if (!hasCategory) {
      console.log('\n>>> category column is MISSING. Migration needed.');
    } else {
      console.log('\n>>> category column already exists. No migration needed.');
    }

    // Step 6: Backup - dump all tables to a local SQLite file
    const backupDir = path.join(ROOT, 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `mesca-prod-backup-${stamp}.db`);

    const localClient = createClient({ url: `file:${backupPath}` });

    try {
      // Create all tables in backup
      const schemaSql = [];
      for (const table of tables) {
        const createRes = await client.execute(
          `SELECT sql FROM sqlite_master WHERE type='table' AND name=?`,
          [table]
        );
        if (createRes.rows.length > 0 && createRes.rows[0].sql) {
          schemaSql.push(createRes.rows[0].sql);
        }
      }
      // Also copy indexes
      const indexesRes = await client.execute(
        "SELECT sql FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' AND sql IS NOT NULL"
      );
      for (const row of indexesRes.rows) {
        if (row.sql) schemaSql.push(row.sql);
      }

      for (const sql of schemaSql) {
        await localClient.execute(sql);
      }

      // Copy all data
      const counts = {};
      for (const table of tables) {
        const rowsRes = await client.execute(`SELECT * FROM ${table}`);
        const rows = rowsRes.rows;
        counts[table] = rows.length;
        if (rows.length === 0) continue;

        const colsRes = await client.execute(`PRAGMA table_info(${table})`);
        const columns = colsRes.rows.map((r) => r.name);
        const placeholders = columns.map(() => '?').join(', ');
        const colsQuoted = columns.map((c) => `"${c}"`).join(', ');
        const sql = `INSERT INTO ${table} (${colsQuoted}) VALUES (${placeholders})`;

        for (const row of rows) {
          const args = columns.map((c) => row[c]);
          await localClient.execute({ sql, args });
        }
      }

      localClient.close();

      console.log('\n--- Backup created ---');
      console.log(`Backup path: ${backupPath}`);
      console.log('Row counts per table:', JSON.stringify(counts, null, 2));
    } catch (err) {
      try { localClient.close(); } catch { /* ignore */ }
      console.error('Backup creation failed:', err);
      process.exit(1);
    }
  } catch (err) {
    console.error('Operation failed:', err);
    process.exit(1);
  } finally {
    try { client.close(); } catch { /* ignore */ }
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});