const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');
const os = require('os');
const ROOT = path.join(__dirname, '..');
const { loadEnvConfig } = require('@next/env');
loadEnvConfig(ROOT);

const SOURCE_URL = process.env.SOURCE_DATABASE_URL || `file:${process.env.DATABASE_FILE || path.join(ROOT, 'database', 'mesca.db')}`;
const TARGET_URL = process.env.TURSO_DATABASE_URL;
const TARGET_TOKEN = process.env.TURSO_AUTH_TOKEN;
const SCHEMA_FILE = path.join(ROOT, 'lib', 'db', 'schema.sql');
const DRY_RUN = process.argv.includes('--dry-run') || process.argv.includes('--preflight');

function quoteIdent(name) {
  return `\"${String(name).replace(/\"/g, '\"\"')}\"`;
}

async function getTables(client) {
  const res = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
  return res.rows.map((r) => r.name);
}

async function getColumns(client, table) {
  const res = await client.execute(`PRAGMA table_info(${quoteIdent(table)})`);
  return res.rows.map((r) => ({
    name: r.name,
    type: r.type,
    notnull: Number(r.notnull || 0),
    dflt_value: r.dflt_value,
    pk: Number(r.pk || 0),
  }));
}

async function countRows(client, table) {
  const res = await client.execute(`SELECT COUNT(*) AS c FROM ${quoteIdent(table)}`);
  return Number(res.rows[0].c);
}

async function getForeignKeyIssues(client) {
  const res = await client.execute('PRAGMA foreign_key_check');
  return res.rows;
}
async function loadSchemaTemplate() {
  const tempPath = path.join(os.tmpdir(), `mesca-schema-check-${process.pid}-${Date.now()}.db`);
  const tempClient = createClient({ url: `file:${tempPath}` });
  try {
    if (fs.existsSync(SCHEMA_FILE)) {
      const schema = fs.readFileSync(SCHEMA_FILE, 'utf8');
      await tempClient.executeMultiple(schema);
    }

    const tables = await getTables(tempClient);
    const columns = {};
    const columnMeta = {};
    for (const table of tables) {
      const cols = await getColumns(tempClient, table);
      columns[table] = cols.map((c) => c.name);
      columnMeta[table] = cols;
    }
    return { tables, columns, columnMeta };
  } finally {
    tempClient.close();
    for (const suffix of ['', '-wal', '-shm', '-journal']) {
      try {
        fs.unlinkSync(tempPath + suffix);
      } catch {
        // The sidecar may not exist; ignore cleanup errors.
      }
    }
  }
}

function checkSchemaCompatibility(sourceTables, sourceColumns, schema) {
  const issues = [];
  for (const table of sourceTables) {
    if (!schema.tables.includes(table)) {
      issues.push(`Source table "${table}" is not defined by lib/db/schema.sql, so the destination cannot create it.`);
      continue;
    }

    const targetColumns = new Set(schema.columns[table]);
    const missingColumns = sourceColumns[table].filter((column) => !targetColumns.has(column));
    if (missingColumns.length > 0) {
      issues.push(`Table "${table}" has source columns missing from the destination schema: ${missingColumns.join(', ')}.`);
    }

    const sourceColumnSet = new Set(sourceColumns[table]);
    for (const column of schema.columnMeta[table]) {
      if (column.notnull === 1 && column.dflt_value == null && column.pk !== 1 && !sourceColumnSet.has(column.name)) {
        issues.push(`Table "${table}" requires non-null column "${column.name}", which is absent from the source and has no default value.`);
      }
    }
  }
  return issues;
}

async function inspectDestination(client, sourceTables) {
  const targetTables = await getTables(client);
  const counts = {};
  for (const table of targetTables) {
    counts[table] = await countRows(client, table);
  }

  const nonEmptyTables = targetTables.filter((table) => counts[table] > 0);
  const unknownTables = targetTables.filter((table) => !sourceTables.includes(table));
  const totalRows = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return {
    targetTables,
    counts,
    nonEmptyTables,
    unknownTables,
    totalRows,
  };
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
    const sourceTables = await getTables(source);
    const sourceColumns = {};
    const sourceCounts = {};
    for (const table of sourceTables) {
      sourceColumns[table] = (await getColumns(source, table)).map((column) => column.name);
      sourceCounts[table] = await countRows(source, table);
    }

    const sourceForeignKeyIssues = await getForeignKeyIssues(source);
    const schema = await loadSchemaTemplate();
    const schemaIssues = checkSchemaCompatibility(sourceTables, sourceColumns, schema);
    const destination = await inspectDestination(target, sourceTables);

    const blockers = [];
    if (destination.nonEmptyTables.length > 0) {
      blockers.push(
        `Destination is not empty. Non-empty tables: ${destination.nonEmptyTables
          .map((table) => `${table} (${destination.counts[table]} rows)`)
          .join(', ')}.`
      );
    }
    blockers.push(...schemaIssues);

    if (DRY_RUN) {
      console.log('Migration preflight (dry run). No database changes were made.');
      console.log(`Source: ${SOURCE_URL.startsWith('file:') ? 'local SQLite' : 'configured source'}`);
      console.log(`Destination: ${new URL(TARGET_URL).hostname}`);
      console.log('');
      console.log('Source table counts:');
      for (const table of sourceTables) {
        console.log(`  ${table}: ${sourceCounts[table]} rows`);
      }
      console.log('');
      console.log(`Destination tables: ${destination.targetTables.length}`);
      console.log(`Destination total rows: ${destination.totalRows}`);
      if (destination.nonEmptyTables.length > 0) {
        console.log(`Destination non-empty tables: ${destination.nonEmptyTables.join(', ')}`);
      } else {
        console.log('Destination is empty.');
      }
      if (destination.unknownTables.length > 0) {
        console.log(`Destination has tables not present in source: ${destination.unknownTables.join(', ')}`);
      }
      console.log('');
      console.log(`Schema compatibility: ${schemaIssues.length === 0 ? 'OK' : 'FAILED'}`);
      if (schemaIssues.length > 0) {
        for (const issue of schemaIssues) console.log(`  - ${issue}`);
      }
      console.log(`Source foreign-key check: ${sourceForeignKeyIssues.length === 0 ? 'OK' : `${sourceForeignKeyIssues.length} issue(s)`}`);
      if (sourceForeignKeyIssues.length > 0) {
        console.warn('  Warning: source contains foreign-key violations; review before migrating.');
      }

      if (blockers.length > 0) {
        console.log('');
        console.error('Preflight failed. Migration would be aborted.');
        for (const blocker of blockers) console.error(`  - ${blocker}`);
        process.exitCode = 1;
      } else {
        console.log('');
        console.log('Preflight passed. The destination is empty and the schema is compatible.');
      }
      return;
    }

    if (blockers.length > 0) {
      console.error('Migration aborted before any changes because preflight checks failed:');
      for (const blocker of blockers) console.error(`  - ${blocker}`);
      process.exitCode = 1;
      return;
    }

    if (sourceForeignKeyIssues.length > 0) {
      console.warn(`Warning: source foreign-key check reported ${sourceForeignKeyIssues.length} issue(s).`);
    }

    await target.execute('PRAGMA foreign_keys = OFF');
    await target.execute('BEGIN');

    try {
      if (fs.existsSync(SCHEMA_FILE)) {
        const schemaSql = fs.readFileSync(SCHEMA_FILE, 'utf8');
        await target.executeMultiple(schemaSql);
      }

      const counts = {};

      for (const table of sourceTables) {
        const columns = sourceColumns[table];
        if (columns.length === 0) continue;

        const rowsRes = await source.execute(`SELECT * FROM ${quoteIdent(table)}`);
        const rows = rowsRes.rows;
        counts[table] = { source: rows.length, target: 0 };

        await target.execute(`DELETE FROM ${quoteIdent(table)}`);

        const placeholders = columns.map(() => '?').join(', ');
        const sql = `INSERT INTO ${quoteIdent(table)} (${columns.map(quoteIdent).join(', ')}) VALUES (${placeholders})`;

        for (const row of rows) {
          const args = columns.map((column) => row[column]);
          await target.execute({ sql, args });
        }

        const targetCountRes = await target.execute(`SELECT COUNT(*) AS c FROM ${quoteIdent(table)}`);
        counts[table].target = Number(targetCountRes.rows[0].c);
        console.log(`${table}: migrated ${counts[table].target}/${counts[table].source} rows`);
      }

      await target.execute('COMMIT');
    } catch (error) {
      await target.execute('ROLLBACK');
      throw error;
    }

    await target.execute('PRAGMA foreign_keys = ON');

    const targetForeignKeyIssues = await getForeignKeyIssues(target);
    if (targetForeignKeyIssues.length > 0) {
      console.warn(`Warning: destination foreign-key check reported ${targetForeignKeyIssues.length} issue(s).`);
    }

    const mismatches = Object.entries(counts).filter(([, count]) => count.source !== count.target);
    if (mismatches.length > 0) {
      console.error('Row-count verification failed:');
      for (const [table, count] of mismatches) {
        console.error(` - ${table}: source=${count.source}, target=${count.target}`);
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

