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
    // Migration 1: Add category column to site_settings if missing
    const siteSchemaRes = await client.execute("PRAGMA table_info(site_settings)");
    const hasCategory = siteSchemaRes.rows.some((r) => r.name === 'category');
    if (!hasCategory) {
      console.log('Applying: ALTER TABLE site_settings ADD COLUMN category TEXT DEFAULT \'general\'');
      await client.execute("ALTER TABLE site_settings ADD COLUMN category TEXT DEFAULT 'general'");
      console.log('site_settings: category column added.');
    } else {
      console.log('site_settings: category column already exists.');
    }

    // Migration 2: Add sort_order column to support_campaigns if missing
    const supportSchemaRes = await client.execute("PRAGMA table_info(support_campaigns)");
    const hasSortOrder = supportSchemaRes.rows.some((r) => r.name === 'sort_order');
    if (!hasSortOrder) {
      console.log('Applying: ALTER TABLE support_campaigns ADD COLUMN sort_order INTEGER DEFAULT 0');
      await client.execute('ALTER TABLE support_campaigns ADD COLUMN sort_order INTEGER DEFAULT 0');
      console.log('support_campaigns: sort_order column added.');
    } else {
      console.log('support_campaigns: sort_order column already exists.');
    }

    // Verify support_campaigns query works
    const testQuery = await client.execute(
      'SELECT * FROM support_campaigns ORDER BY sort_order ASC, created_at DESC'
    );
    console.log('support_campaigns query test succeeded. Rows:', testQuery.rows.length);

    // Verify site_settings query works
    const settingsQuery = await client.execute(
      'SELECT id, key, value, category FROM site_settings ORDER BY category ASC, key ASC'
    );
    console.log('site_settings query test succeeded. Rows:', settingsQuery.rows.length);

    await client.close();
    console.log('\nAll migrations complete and verified.');
  } catch (err) {
    console.error('Migration failed:', err);
    try { await client.close(); } catch { /* ignore */ }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});