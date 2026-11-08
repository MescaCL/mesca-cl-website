const { createClient } = require('@libsql/client');

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error('TURSO_DATABASE_URL is not set.');
    process.exit(1);
  }

  const client = createClient({ url, authToken: token });

  try {
    const r = await client.execute("PRAGMA table_info(support_campaigns)");
    console.log('support_campaigns columns:');
    for (const row of r.rows) {
      console.log(' ', row.name, row.type);
    }
    const q = await client.execute('SELECT * FROM support_campaigns ORDER BY sort_order ASC, created_at DESC');
    console.log('Query works, rows:', q.rows.length);

    const s = await client.execute("PRAGMA table_info(site_settings)");
    console.log('\nsite_settings columns:');
    for (const row of s.rows) {
      console.log(' ', row.name, row.type);
    }
    const sq = await client.execute('SELECT id, key, value, category FROM site_settings ORDER BY category ASC, key ASC');
    console.log('Settings query works, rows:', sq.rows.length);

    await client.close();
    console.log('\nSchema verification complete.');
  } catch (err) {
    console.error('Verification failed:', err);
    try { await client.close(); } catch { /* ignore */ }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});