-- Mesca CL — full database schema
-- Applied by `npm run db:setup` (scripts/setup-db.js)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME,
  is_active INTEGER DEFAULT 1,
  token_version INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  category TEXT DEFAULT 'general',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  brand_name TEXT DEFAULT 'Mesca CL',
  full_name TEXT DEFAULT 'Chineke Olisadubem Louis',
  short_bio TEXT,
  full_bio TEXT,
  headline TEXT,
  supporting_statement TEXT,
  email TEXT DEFAULT 'mescacl@gmail.com',
  phone_number TEXT DEFAULT '+2349131120763',
  whatsapp_number TEXT DEFAULT '+2349131120763',
  call_button_label TEXT DEFAULT 'Call Mesca',
  whatsapp_button_label TEXT DEFAULT 'Chat on WhatsApp',
  call_button_visible INTEGER DEFAULT 1,
  whatsapp_button_visible INTEGER DEFAULT 1,
  whatsapp_preset_message TEXT DEFAULT 'Hello Mesca CL, I found your website and would like to get in touch.',
  profile_image_url TEXT,
  profile_image_alt TEXT,
  hero_eyebrow TEXT,
  hero_primary_cta_label TEXT,
  hero_primary_cta_url TEXT,
  hero_secondary_cta_label TEXT,
  hero_secondary_cta_url TEXT,
  location TEXT DEFAULT 'Enugu, Nigeria',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS homepage_sections (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  section_type TEXT NOT NULL,
  title TEXT,
  content TEXT,
  config TEXT,
  is_visible INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  description TEXT,
  cover_image_url TEXT,
  gallery_urls TEXT,
  category TEXT,
  technologies TEXT,
  status TEXT DEFAULT 'idea',
  start_date DATETIME,
  last_updated DATETIME,
  live_url TEXT,
  repository_url TEXT,
  demo_url TEXT,
  featured INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image_url TEXT,
  gallery_urls TEXT,
  post_type TEXT DEFAULT 'article',
  category TEXT,
  tags TEXT,
  status TEXT DEFAULT 'draft',
  featured INTEGER DEFAULT 0,
  published_at DATETIME,
  scheduled_at DATETIME,
  reading_time INTEGER,
  seo_title TEXT,
  seo_description TEXT,
  related_project_id TEXT,
  related_post_ids TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS journey_milestones (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  description TEXT,
  milestone_date DATETIME,
  category TEXT,
  image_url TEXT,
  related_project_id TEXT,
  link_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS now_items (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT,
  related_project_id TEXT,
  link_url TEXT,
  image_url TEXT,
  next_milestone TEXT,
  sort_order INTEGER DEFAULT 0,
  is_visible INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS social_links (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  platform TEXT NOT NULL,
  label TEXT,
  url TEXT NOT NULL,
  icon TEXT,
  is_visible INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  category TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT
);

CREATE TABLE IF NOT EXISTS support_campaigns (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  purpose TEXT,
  description TEXT,
  cover_image_url TEXT,
  suggested_amounts TEXT,
  target_amount REAL,
  currency TEXT DEFAULT 'NGN',
  is_enabled INTEGER DEFAULT 0,
  provider TEXT,
  provider_config TEXT,\n    bank_account_holder TEXT,\n    bank_name TEXT,\n    account_number TEXT,\n    payment_instructions TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media_files (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  filename TEXT NOT NULL,
  original_name TEXT,
  file_path TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER,
  alt_text TEXT,
  caption TEXT,
  description TEXT,
  uploaded_by TEXT,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS button_configs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  style TEXT DEFAULT 'primary',
  icon TEXT,
  placement TEXT,
  is_visible INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS login_rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  reset_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  post_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  source TEXT DEFAULT 'website',
  subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at DATETIME
);

CREATE TABLE IF NOT EXISTS page_views (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  path TEXT NOT NULL,
  visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  ip_address TEXT
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments (post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments (status);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers (email);

CREATE INDEX IF NOT EXISTS idx_projects_published ON projects (is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects (category);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts (status, published_at);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts (category);
CREATE INDEX IF NOT EXISTS idx_social_links_visible ON social_links (is_visible, sort_order);
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_submissions (status, submitted_at);
CREATE INDEX IF NOT EXISTS idx_contact_ip ON contact_submissions (ip_address, submitted_at);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs (user_id, created_at);

