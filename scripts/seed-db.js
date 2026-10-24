const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DB_FILE = process.env.DATABASE_FILE || path.join(ROOT, 'database', 'mesca.db');

const DEFAULT_PROFILE = {
  brand_name: 'Mesca CL',
  full_name: 'Chineke Olisadubem Louis',
  headline: 'Building the future, one project at a time.',
  supporting_statement:
    'Software engineer, AI tinkerer and entrepreneur documenting the full journey in public.',
  short_bio:
    'I build software, explore what AI can genuinely do, and write about the process along the way.',
  full_bio:
    'I am Chineke Olisadubem Louis, the founder behind Mesca CL.\n\nI started out curious about how software actually gets built, and never stopped. Today I work across product engineering and applied AI, shipping things that people genuinely use.\n\nThis site is my public notebook — projects, lessons, and the honest story of what it takes to build in public.',
  email: 'chinekelouisolisadubem@gmail.com',
  location: 'Enugu, Nigeria',
  call_button_visible: 1,
  whatsapp_button_visible: 1,
  call_button_label: 'Call Mesca',
  whatsapp_button_label: 'Chat on WhatsApp',
  whatsapp_preset_message:
    'Hello Mesca CL! I found your website and would like to get in touch.',
};

const DEFAULT_CATEGORIES = [
  { name: 'Technology', slug: 'technology', description: 'Software engineering and tech insights', color: '#3b82f6' },
  { name: 'AI & Automation', slug: 'ai-automation', description: 'Artificial intelligence and automation projects', color: '#8b5cf6' },
  { name: 'Building Products', slug: 'building-products', description: 'Product development and entrepreneurship', color: '#10b981' },
  { name: 'Personal Development', slug: 'personal-development', description: 'Learning, discipline, and growth', color: '#f59e0b' },
  { name: 'Creator Lessons', slug: 'creator-lessons', description: 'Lessons from building in public', color: '#ec4899' },
];

const DEFAULT_SOCIAL_LINKS = [
  { platform: 'TikTok', label: 'TikTok', url: 'https://tiktok.com/@mesca_cl', icon: 'tiktok', sort_order: 1 },
  { platform: 'Instagram', label: 'Instagram', url: 'https://www.instagram.com/am_mescacl', icon: 'instagram', sort_order: 2 },
  { platform: 'LinkedIn', label: 'LinkedIn', url: 'https://www.linkedin.com/in/mescacl', icon: 'linkedin', sort_order: 3 },
  { platform: 'Facebook', label: 'Facebook', url: 'https://www.facebook.com/mescacl', icon: 'facebook', sort_order: 4 },
  { platform: 'X', label: 'X', url: 'https://x.com/MescaCL', icon: 'x', sort_order: 5 },
  { platform: 'YouTube', label: 'YouTube', url: 'https://youtube.com/@mescacl', icon: 'youtube', sort_order: 6 },
  { platform: 'GitHub', label: 'GitHub', url: 'https://github.com/mesca-cl', icon: 'github', sort_order: 7 },
];

const DEFAULT_SECTIONS = [
  { section_type: 'hero', title: 'Hero Section', content: 'Primary headline and calls to action.', sort_order: 1 },
  { section_type: 'introduction', title: 'Introduction', content: 'Short bio and positioning statement.', sort_order: 2 },
  { section_type: 'currently_building', title: 'Currently Building', content: 'Live snapshot of current focus.', sort_order: 3 },
  { section_type: 'featured_projects', title: 'Featured Projects', content: 'Highlighted published projects.', sort_order: 4 },
  { section_type: 'latest_content', title: 'Latest Content', content: 'Most recent published posts.', sort_order: 5 },
  { section_type: 'social_links', title: 'Social Links', content: 'Social channels to showcase.', sort_order: 6 },
  { section_type: 'contact', title: 'Contact', content: 'Closing contact prompt.', sort_order: 7 },
];

const DEFAULT_SETTINGS = [
  { key: 'site_tagline', value: 'Builder · AI tinkerer · Entrepreneur' },
  { key: 'site_description', value: 'Personal brand website of Mesca CL.' },
  { key: 'contact_email', value: 'chinekelouisolisadubem@gmail.com' },
  { key: 'posts_per_page', value: '9' },
  { key: 'projects_per_page', value: '12' },
];


function main() {
  if (!fs.existsSync(DB_FILE)) {
    console.error(`Database not found at ${DB_FILE}. Run "npm run db:setup" first.`);
    process.exit(1);
  }

  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync(DB_FILE);
  db.exec('PRAGMA foreign_keys = ON');

  // Profile -----------------------------------------------------------------
  const profileCount = db.prepare('SELECT COUNT(*) as count FROM profiles').get().count;
  if (profileCount === 0) {
    const keys = Object.keys(DEFAULT_PROFILE);
    db.prepare(
      `INSERT INTO profiles (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`
    ).run(...keys.map((key) => DEFAULT_PROFILE[key]));
    console.log('Seeded profile.');
  } else {
    console.log('Profile already present — skipped.');
  }

  // Categories --------------------------------------------------------------
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  if (categoryCount === 0) {
    const insert = db.prepare(
      'INSERT INTO categories (name, slug, description, color) VALUES (?, ?, ?, ?)'
    );
    for (const category of DEFAULT_CATEGORIES) {
      insert.run(category.name, category.slug, category.description, category.color);
    }
    console.log(`Seeded ${DEFAULT_CATEGORIES.length} categories.`);
  } else {
    console.log('Categories already present — skipped.');
  }

  // Social links -----------------------------------------------------------
  const socialCount = db.prepare('SELECT COUNT(*) as count FROM social_links').get().count;
  if (socialCount === 0) {
    const insert = db.prepare(
      'INSERT INTO social_links (platform, label, url, icon, is_visible, sort_order) VALUES (?, ?, ?, ?, 1, ?)'
    );
    for (const link of DEFAULT_SOCIAL_LINKS) {
      insert.run(link.platform, link.label, link.url, link.icon, link.sort_order);
    }
    console.log(`Seeded ${DEFAULT_SOCIAL_LINKS.length} social links.`);
  } else {
    console.log('Social links already present — skipped.');
  }


  // Homepage sections ------------------------------------------------------
  const sectionCount = db.prepare('SELECT COUNT(*) as count FROM homepage_sections').get().count;
  if (sectionCount === 0) {
    const insert = db.prepare(
      'INSERT INTO homepage_sections (section_type, title, content, is_visible, sort_order) VALUES (?, ?, ?, 1, ?)'
    );
    for (const section of DEFAULT_SECTIONS) {
      insert.run(section.section_type, section.title, section.content, section.sort_order);
    }
    console.log(`Seeded ${DEFAULT_SECTIONS.length} homepage sections.`);
  } else {
    console.log('Homepage sections already present — skipped.');
  }

  // Settings ----------------------------------------------------------------
  const insertSetting = db.prepare(
    `INSERT INTO site_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  );
  for (const setting of DEFAULT_SETTINGS) {
    insertSetting.run(setting.key, setting.value);
  }
  console.log(`Seeded ${DEFAULT_SETTINGS.length} site settings.`);

  db.close();
  console.log('Seed complete.');
}

main();
