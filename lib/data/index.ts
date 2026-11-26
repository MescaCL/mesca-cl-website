import { getDatabase, generateId } from '../db/index';
import type { Profile, SocialLink, Category, SiteSetting, Comment, NewsletterSubscriber } from '@/types';

export * from './content';

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

export async function getProfile(): Promise<Profile | null> {
  const conn = await getDatabase();
  try {
    const row = await conn
      .prepare('SELECT * FROM profiles ORDER BY created_at ASC LIMIT 1')
      .get() as Profile | undefined;
    return row ?? null;
  } finally {
    conn.close();
  }
}

export async function updateProfile(data: Partial<Profile>): Promise<Profile | null> {
  const conn = await getDatabase();
  try {
    const existing = await conn
      .prepare('SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1')
      .get() as { id: string } | undefined;
    if (!existing) return null;

    const setFields: string[] = [];
    const setValues: unknown[] = [];

    if (typeof data?.brand_name === 'string') {
      setFields.push('brand_name = ?');
      setValues.push(data.brand_name);
    }
    if (typeof data?.full_name === 'string') {
      setFields.push('full_name = ?');
      setValues.push(data.full_name);
    }
    if (typeof data?.headline === 'string') {
      setFields.push('headline = ?');
      setValues.push(data.headline);
    }
    if (typeof data?.supporting_statement === 'string') {
      setFields.push('supporting_statement = ?');
      setValues.push(data.supporting_statement);
    }
    if (typeof data?.short_bio === 'string') {
      setFields.push('short_bio = ?');
      setValues.push(data.short_bio);
    }
    if (typeof data?.full_bio === 'string') {
      setFields.push('full_bio = ?');
      setValues.push(data.full_bio);
    }
    if (typeof data?.email === 'string') {
      setFields.push('email = ?');
      setValues.push(data.email);
    }
    if (typeof data?.phone_number === 'string') {
      setFields.push('phone_number = ?');
      setValues.push(data.phone_number);
    }
    if (typeof data?.whatsapp_number === 'string') {
      setFields.push('whatsapp_number = ?');
      setValues.push(data.whatsapp_number);
    }
    if (typeof data?.call_button_label === 'string') {
      setFields.push('call_button_label = ?');
      setValues.push(data.call_button_label);
    }
    if (typeof data?.whatsapp_button_label === 'string') {
      setFields.push('whatsapp_button_label = ?');
      setValues.push(data.whatsapp_button_label);
    }
    if (typeof data?.whatsapp_preset_message === 'string') {
      setFields.push('whatsapp_preset_message = ?');
      setValues.push(data.whatsapp_preset_message);
    }
    if (typeof data?.location === 'string') {
      setFields.push('location = ?');
      setValues.push(data.location);
    }
    if (typeof data?.call_button_visible === 'boolean') {
      setFields.push('call_button_visible = ?');
      setValues.push(data.call_button_visible ? 1 : 0);
    }
    if (typeof data?.whatsapp_button_visible === 'boolean') {
      setFields.push('whatsapp_button_visible = ?');
      setValues.push(data.whatsapp_button_visible ? 1 : 0);
    }
    if (typeof data?.profile_image_url === 'string') {
      setFields.push('profile_image_url = ?');
      setValues.push(data.profile_image_url);
    } else if (data?.profile_image_url === null) {
      setFields.push('profile_image_url = ?');
      setValues.push(null);
    }
    if (typeof data?.profile_image_alt === 'string') {
      setFields.push('profile_image_alt = ?');
      setValues.push(data.profile_image_alt);
    } else if (data?.profile_image_alt === null) {
      setFields.push('profile_image_alt = ?');
      setValues.push(null);
    }
    if (typeof data?.hero_eyebrow === 'string') {
      setFields.push('hero_eyebrow = ?');
      setValues.push(data.hero_eyebrow);
    }
    if (typeof data?.hero_primary_cta_label === 'string') {
      setFields.push('hero_primary_cta_label = ?');
      setValues.push(data.hero_primary_cta_label);
    }
    if (typeof data?.hero_primary_cta_url === 'string') {
      setFields.push('hero_primary_cta_url = ?');
      setValues.push(data.hero_primary_cta_url);
    }
    if (typeof data?.hero_secondary_cta_label === 'string') {
      setFields.push('hero_secondary_cta_label = ?');
      setValues.push(data.hero_secondary_cta_label);
    }
    if (typeof data?.hero_secondary_cta_url === 'string') {
      setFields.push('hero_secondary_cta_url = ?');
      setValues.push(data.hero_secondary_cta_url);
    }
    if (typeof data?.call_button_visible === 'number') {
      setFields.push('call_button_visible = ?');
      setValues.push(data.call_button_visible);
    }
    if (typeof data?.whatsapp_button_visible === 'number') {
      setFields.push('whatsapp_button_visible = ?');
      setValues.push(data.whatsapp_button_visible);
    }
    if (setFields.length > 0) {
      setValues.push(existing.id);
      await conn
        .prepare(`UPDATE profiles SET ${setFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
        .run(...setValues);
      console.log('[profile] UPDATE executed:', { fields: setFields, whereId: existing.id });
    }

    const row = await conn
      .prepare('SELECT * FROM profiles WHERE id = ?')
      .get(existing.id) as Profile | undefined;

    if (!row) {
      return null;
    }

    const submittedValues: Record<string, unknown> = {};
    const persistedValues: Record<string, unknown> = {};
    let allMatch = true;
    for (const field of setFields) {
      // setFields entries are SQL fragments like "profile_image_url = ?";
      // extract just the column name to look up values in data/row.
      const column = field.split(' = ')[0];
      const submitted = (data as Record<string, unknown>)[column];
      const persisted = (row as unknown as Record<string, unknown>)[column];
      submittedValues[column] = submitted;
      persistedValues[column] = persisted;
      if (submitted !== persisted) {
        if (!(submitted == null && persisted == null)) {
          allMatch = false;
        }
      }
    }
    if (!allMatch) {
      console.error('[profile] value mismatch:', { submittedValues, persistedValues, whereId: existing.id });
      return null;
    }

    return row;
  } finally {
    conn.close();
  }
}

/* ------------------------------------------------------------------ */
/* Social links                                                        */
/* ------------------------------------------------------------------ */

export async function getSocialLinks(onlyVisible = true): Promise<SocialLink[]> {
  const conn = await getDatabase();
  try {
    const sql = onlyVisible
      ? 'SELECT * FROM social_links WHERE is_visible = 1 ORDER BY sort_order ASC'
      : 'SELECT * FROM social_links ORDER BY sort_order ASC';
    return await conn.prepare(sql).all() as SocialLink[];
  } finally {
    conn.close();
  }
}

export async function createSocialLink(data: Partial<SocialLink>): Promise<SocialLink> {
  const conn = await getDatabase();
  try {
    const id = generateId();
    const payload: Record<string, unknown> = { ...(data as Record<string, unknown>), id };
    const keys = Object.keys(payload);
    await conn
      .prepare(
        `INSERT INTO social_links (${keys.join(', ')}) VALUES (${keys
          .map(() => '?')
          .join(', ')})`
      )
      .run(...keys.map((key) => (payload[key] as unknown)));
    return await conn.prepare('SELECT * FROM social_links WHERE id = ?').get(id) as SocialLink;
  } finally {
    conn.close();
  }
}

export async function updateSocialLink(
  id: string,
  data: Partial<SocialLink>
): Promise<SocialLink | null> {
  const conn = await getDatabase();
  try {
    const keys = Object.keys(data).filter((key) => key !== 'id');
    if (keys.length > 0) {
      const setClause = keys.map((key) => `${key} = ?`).join(', ');
      await conn
        .prepare(
          `UPDATE social_links SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        )
        .run(...keys.map((key) => (data as Record<string, unknown>)[key]), id);
    }
    const row = await conn.prepare('SELECT * FROM social_links WHERE id = ?').get(id) as
      | SocialLink
      | undefined;
    return row ?? null;
  } finally {
    conn.close();
  }
}

export async function deleteSocialLink(id: string): Promise<boolean> {
  const conn = await getDatabase();
  try {
    const result = await conn.prepare('DELETE FROM social_links WHERE id = ?').run(id);
    return result.changes > 0;
  } finally {
    conn.close();
  }
}


/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export async function getCategories(): Promise<Category[]> {
  const conn = await getDatabase();
  try {
    return await conn.prepare('SELECT * FROM categories ORDER BY name ASC').all() as Category[];
  } finally {
    conn.close();
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const conn = await getDatabase();
  try {
    return (
      (await conn.prepare('SELECT * FROM categories WHERE slug = ?').get(slug) as
        | Category
        | undefined) ?? null
    );
  } finally {
    conn.close();
  }
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  const conn = await getDatabase();
  try {
    const id = generateId();
    const payload: Record<string, unknown> = { ...(data as Record<string, unknown>), id };
    const keys = Object.keys(payload);
    await conn
      .prepare(
        `INSERT INTO categories (${keys.join(', ')}) VALUES (${keys
          .map(() => '?')
          .join(', ')})`
      )
      .run(...keys.map((key) => (payload[key] as unknown)));
    return await conn.prepare('SELECT * FROM categories WHERE id = ?').get(id) as Category;
  } finally {
    conn.close();
  }
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category | null> {
  const conn = await getDatabase();
  try {
    const keys = Object.keys(data).filter((key) => key !== 'id');
    if (keys.length > 0) {
      const setClause = keys.map((key) => `${key} = ?`).join(', ');
      await conn
        .prepare(
          `UPDATE categories SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        )
        .run(...keys.map((key) => (data as Record<string, unknown>)[key]), id);
    }
    const row = await conn.prepare('SELECT * FROM categories WHERE id = ?').get(id) as
      | Category
      | undefined;
    return row ?? null;
  } finally {
    conn.close();
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  const conn = await getDatabase();
  try {
    const result = await conn.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return result.changes > 0;
  } finally {
    conn.close();
  }
}

/* ------------------------------------------------------------------ */
/* Site settings                                                       */
/* ------------------------------------------------------------------ */

export async function getSetting(key: string): Promise<string | null> {
  const conn = await getDatabase();
  try {
    const row = await conn.prepare('SELECT value FROM site_settings WHERE key = ?').get(key) as
      | { value: string | null }
      | undefined;
    return row?.value ?? null;
  } finally {
    conn.close();
  }
}

export async function getAllSettings(): Promise<SiteSetting[]> {
  const conn = await getDatabase();
  try {
    return await conn.prepare('SELECT * FROM site_settings ORDER BY key ASC').all() as SiteSetting[];
  } finally {
    conn.close();
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  const conn = await getDatabase();
  try {
    await conn
      .prepare(
        `INSERT INTO site_settings (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
      )
      .run(key, value);
  } finally {
    conn.close();
  }
}


/* ------------------------------------------------------------------ */
/* Comments                                                           */
/* ------------------------------------------------------------------ */

export async function getCommentsByPost(postId: string, approvedOnly = true): Promise<Comment[]> {
  const conn = await getDatabase();
  try {
    if (approvedOnly) {
      return await conn
        .prepare('SELECT * FROM comments WHERE post_id = ? AND status = ? ORDER BY created_at ASC')
        .all(postId, 'approved') as Comment[];
    }
    if (postId) {
      return await conn
        .prepare('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC')
        .all(postId) as Comment[];
    }
    return await conn
      .prepare('SELECT * FROM comments ORDER BY created_at DESC')
      .all() as Comment[];
  } finally {
    conn.close();
  }
}

export async function getPendingComments(): Promise<Comment[]> {
  const conn = await getDatabase();
  try {
    return await conn
      .prepare('SELECT * FROM comments WHERE status = ? ORDER BY created_at DESC')
      .all('pending') as Comment[];
  } finally {
    conn.close();
  }
}

export async function createComment(data: {
  post_id: string;
  author_name: string;
  author_email: string;
  content: string;
  ip_address?: string | null;
  user_agent?: string | null;
}): Promise<Comment> {
  const conn = await getDatabase();
  try {
    const id = generateId();
    await conn
      .prepare(
        `INSERT INTO comments (id, post_id, author_name, author_email, content, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        id,
        data.post_id,
        data.author_name,
        data.author_email,
        data.content,
        data.ip_address ?? null,
        data.user_agent ?? null
      );
    const row = await conn.prepare('SELECT * FROM comments WHERE id = ?').get(id) as Comment;
    return row;
  } finally {
    conn.close();
  }
}

export async function updateCommentStatus(id: string, status: 'approved' | 'rejected'): Promise<boolean> {
  const conn = await getDatabase();
  try {
    const result = await conn
      .prepare('UPDATE comments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, id);
    return result.changes > 0;
  } finally {
    conn.close();
  }
}

export async function deleteComment(id: string): Promise<boolean> {
  const conn = await getDatabase();
  try {
    const result = await conn.prepare('DELETE FROM comments WHERE id = ?').run(id);
    return result.changes > 0;
  } finally {
    conn.close();
  }
}

/* ------------------------------------------------------------------ */
/* Newsletter                                                         */
/* ------------------------------------------------------------------ */

export async function subscribeNewsletter(email: string, source = 'website'): Promise<NewsletterSubscriber> {
  const conn = await getDatabase();
  try {
    const id = generateId();
    await conn
      .prepare(
        `INSERT INTO newsletter_subscribers (id, email, source)
         VALUES (?, ?, ?)
         ON CONFLICT(email) DO UPDATE SET status = 'active', source = excluded.source, subscribed_at = CURRENT_TIMESTAMP, unsubscribed_at = NULL`
      )
      .run(id, email, source);
    const row = await conn
      .prepare('SELECT * FROM newsletter_subscribers WHERE email = ?')
      .get(email) as NewsletterSubscriber;
    return row;
  } finally {
    conn.close();
  }
}

export async function getNewsletterSubscribers(status?: string): Promise<NewsletterSubscriber[]> {
  const conn = await getDatabase();
  try {
    return status
      ? await conn
          .prepare(
            'SELECT * FROM newsletter_subscribers WHERE status = ? ORDER BY subscribed_at DESC'
          )
          .all(status) as NewsletterSubscriber[]
      : await conn
          .prepare('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC')
          .all() as NewsletterSubscriber[];
  } finally {
    conn.close();
  }
}

export async function deleteNewsletterSubscriber(email: string): Promise<boolean> {
  const conn = await getDatabase();
  try {
    const result = await conn.prepare('DELETE FROM newsletter_subscribers WHERE email = ?').run(email);
    return result.changes > 0;
  } finally {
    conn.close();
  }
}

export async function unsubscribeNewsletter(email: string): Promise<boolean> {
  const conn = await getDatabase();
  try {
    const result = await conn
      .prepare(
        'UPDATE newsletter_subscribers SET status = ?, unsubscribed_at = CURRENT_TIMESTAMP WHERE email = ?'
      )
      .run('unsubscribed', email);
    return result.changes > 0;
  } finally {
    conn.close();
  }
}

/* ------------------------------------------------------------------ */
/* Navigation items                                                   */
/* ------------------------------------------------------------------ */

export interface NavItem {
  id: string;
  label: string;
  url: string;
  sort_order: number;
  is_visible: number;
  created_at: string;
  updated_at: string;
}

export async function getNavItems(visibleOnly = true): Promise<NavItem[]> {
  const conn = await getDatabase();
  try {
    const sql = visibleOnly
      ? 'SELECT * FROM nav_items WHERE is_visible = 1 ORDER BY sort_order ASC, label ASC'
      : 'SELECT * FROM nav_items ORDER BY sort_order ASC, label ASC';
    return await conn.prepare(sql).all() as NavItem[];
  } finally {
    conn.close();
  }
}

export async function getNavItem(id: string): Promise<NavItem | null> {
  const conn = await getDatabase();
  try {
    const row = await conn.prepare('SELECT * FROM nav_items WHERE id = ?').get(id) as
      | NavItem
      | undefined;
    return row ?? null;
  } finally {
    conn.close();
  }
}

export async function createNavItem(data: {
  label: string;
  url: string;
  sort_order?: number;
  is_visible?: boolean;
}): Promise<NavItem> {
  const conn = await getDatabase();
  try {
    const id = generateId();
    await conn
      .prepare(
        `INSERT INTO nav_items (id, label, url, sort_order, is_visible)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        id,
        data.label,
        data.url,
        data.sort_order ?? 0,
        data.is_visible ?? true ? 1 : 0
      );
    const row = await getNavItem(id);
    if (!row) throw new Error('Failed to create nav item');
    return row;
  } finally {
    conn.close();
  }
}

export async function updateNavItem(
  id: string,
  data: Partial<{ label: string; url: string; sort_order: number; is_visible: boolean }>
): Promise<NavItem | null> {
  const conn = await getDatabase();
  try {
    const setFields: string[] = [];
    const setValues: unknown[] = [];

    if (data.label !== undefined) {
      setFields.push('label = ?');
      setValues.push(data.label);
    }
    if (data.url !== undefined) {
      setFields.push('url = ?');
      setValues.push(data.url);
    }
    if (data.sort_order !== undefined) {
      setFields.push('sort_order = ?');
      setValues.push(data.sort_order);
    }
    if (data.is_visible !== undefined) {
      setFields.push('is_visible = ?');
      setValues.push(data.is_visible ? 1 : 0);
    }

    if (setFields.length > 0) {
      setFields.push('updated_at = CURRENT_TIMESTAMP');
      await conn
        .prepare(`UPDATE nav_items SET ${setFields.join(', ')} WHERE id = ?`)
        .run(...setValues, id);
    }

    return await getNavItem(id);
  } finally {
    conn.close();
  }
}

export async function deleteNavItem(id: string): Promise<boolean> {
  const conn = await getDatabase();
  try {
    const result = await conn.prepare('DELETE FROM nav_items WHERE id = ?').run(id);
    return result.changes > 0;
  } finally {
    conn.close();
  }
}

/* ------------------------------------------------------------------ */
/* CMS page metadata and content blocks                               */
/* ------------------------------------------------------------------ */

interface CtaBandConfig {
  heading: string;
  description: string;
}

export async function getCtaBandConfig(): Promise<CtaBandConfig> {
  const conn = await getDatabase();
  try {
    const heading = await conn
      .prepare("SELECT value FROM site_settings WHERE key = 'cta_band_heading'")
      .get() as { value: string | null } | undefined;
    const description = await conn
      .prepare("SELECT value FROM site_settings WHERE key = 'cta_band_description'")
      .get() as { value: string | null } | undefined;

    return {
      heading: heading?.value ?? 'Have an idea worth building?',
      description:
        description?.value ??
        "I'm always up for collaborating on meaningful products, mentoring early builders, or simply talking about what it takes to ship.",
    };
  } finally {
    conn.close();
  }
}

export async function setCtaBandConfig(config: {
  heading: string;
  description: string;
}): Promise<void> {
  const conn = await getDatabase();
  try {
    await conn.prepare('BEGIN').run();
    await conn
      .prepare(
        `INSERT INTO site_settings (key, value) VALUES ('cta_band_heading', ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
      )
      .run(config.heading);
    await conn
      .prepare(
        `INSERT INTO site_settings (key, value) VALUES ('cta_band_description', ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
      )
      .run(config.description);
    await conn.prepare('COMMIT').run();
  } catch {
    await conn.prepare('ROLLBACK').run();
    throw new Error('Failed to save CTA band config');
  } finally {
    conn.close();
  }
}

interface FooterExploreLink {
  href: string;
  label: string;
}

export async function getFooterExploreLinks(): Promise<FooterExploreLink[]> {
  const conn = await getDatabase();
  try {
    const row = await conn
      .prepare("SELECT value FROM site_settings WHERE key = 'footer_explore_links'")
      .get() as { value: string | null } | undefined;

    if (!row?.value) {
      return [
        { href: '/projects', label: 'Projects' },
        { href: '/journey', label: 'Journey' },
        { href: '/blog', label: 'Blog' },
        { href: '/contact', label: 'Contact' },
      ];
    }

    try {
      return JSON.parse(row.value) as FooterExploreLink[];
    } catch {
      return [
        { href: '/projects', label: 'Projects' },
        { href: '/journey', label: 'Journey' },
        { href: '/blog', label: 'Blog' },
        { href: '/contact', label: 'Contact' },
      ];
    }
  } finally {
    conn.close();
  }
}

export async function setFooterExploreLinks(links: FooterExploreLink[]): Promise<void> {
  const conn = await getDatabase();
  try {
    await conn
      .prepare(
        `INSERT INTO site_settings (key, value) VALUES ('footer_explore_links', ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
      )
      .run(JSON.stringify(links));
  } finally {
    conn.close();
  }
}

interface PageMetadata {
  eyebrow: string;
  title: string;
  description: string;
}

const PAGE_META_DEFAULTS: Record<string, PageMetadata> = {
  blog: {
    eyebrow: 'Writing',
    title: 'Blog & field notes',
    description:
      'Long-form articles, quick gists, and honest notes from the build. New posts when there is something worth saying.',
  },
  projects: {
    eyebrow: 'Portfolio',
    title: 'Projects & builds',
    description:
      "Everything I've designed, built, and shipped — plus the things still taking shape.",
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Reach Out to ME',
    description:
      "If it's for Collaborations, mentorship, freelance work, or just a conversation about what we can or will do. Be it ANYTHING — my inbox is open.",
  },
  journey: {
    eyebrow: 'Journey',
    title: 'The road so far',
    description:
      'Not a highlight reel — the actual sequence of things built, learned, and occasionally broken along the way.',
  },
};

export async function getPageMetadata(page: 'blog' | 'projects' | 'contact' | 'journey'): Promise<PageMetadata> {
  const conn = await getDatabase();
  try {
    const defaults = PAGE_META_DEFAULTS[page];
    const eyebrow = await conn
      .prepare("SELECT value FROM site_settings WHERE key = ?")
      .get(`${page}_eyebrow`) as { value: string | null } | undefined;
    const title = await conn
      .prepare("SELECT value FROM site_settings WHERE key = ?")
      .get(`${page}_title`) as { value: string | null } | undefined;
    const description = await conn
      .prepare("SELECT value FROM site_settings WHERE key = ?")
      .get(`${page}_description`) as { value: string | null } | undefined;

    return {
      eyebrow: eyebrow?.value ?? defaults.eyebrow,
      title: title?.value ?? defaults.title,
      description: description?.value ?? defaults.description,
    };
  } finally {
    conn.close();
  }
}

export async function setPageMetadata(
  page: 'blog' | 'projects' | 'contact' | 'journey',
  metadata: Partial<PageMetadata>
): Promise<void> {
  const conn = await getDatabase();
  try {
    await conn.prepare('BEGIN').run();

    if (metadata.eyebrow !== undefined) {
      await conn
        .prepare(
          `INSERT INTO site_settings (key, value) VALUES (?, ?)
           ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
        )
        .run(`${page}_eyebrow`, metadata.eyebrow);
    }
    if (metadata.title !== undefined) {
      await conn
        .prepare(
          `INSERT INTO site_settings (key, value) VALUES (?, ?)
           ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
        )
        .run(`${page}_title`, metadata.title);
    }
    if (metadata.description !== undefined) {
      await conn
        .prepare(
          `INSERT INTO site_settings (key, value) VALUES (?, ?)
           ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
        )
        .run(`${page}_description`, metadata.description);
    }

    await conn.prepare('COMMIT').run();
  } catch {
    await conn.prepare('ROLLBACK').run();
    throw new Error(`Failed to save ${page} page metadata`);
  } finally {
    conn.close();
  }
}

export async function getContactResponseTime(): Promise<string> {
  const conn = await getDatabase();
  try {
    const row = await conn
      .prepare("SELECT value FROM site_settings WHERE key = 'contact_response_time'")
      .get() as { value: string | null } | undefined;
    return row?.value ?? 'Usually within 2–3 days';
  } finally {
    conn.close();
  }
}

export interface HomepageMetadata {
  eyebrow: string;
  title: string;
  description: string;
}

const HOMEPAGE_META_DEFAULTS: HomepageMetadata = {
  eyebrow: 'Builder · Engineer · Founder',
  title: 'Mesca CL - Portfolio & Projects',
  description: 'Building the future, one project at a time. Showcasing designed, built, and shipped work.',
};

export async function getHomepageMetadata(): Promise<HomepageMetadata> {
  const conn = await getDatabase();
  try {
    const eyebrow = await conn
      .prepare("SELECT value FROM site_settings WHERE key = 'homepage_eyebrow'")
      .get() as { value: string | null } | undefined;
    const title = await conn
      .prepare("SELECT value FROM site_settings WHERE key = 'homepage_title'")
      .get() as { value: string | null } | undefined;
    const description = await conn
      .prepare("SELECT value FROM site_settings WHERE key = 'homepage_description'")
      .get() as { value: string | null } | undefined;

    return {
      eyebrow: eyebrow?.value ?? HOMEPAGE_META_DEFAULTS.eyebrow,
      title: title?.value ?? HOMEPAGE_META_DEFAULTS.title,
      description: description?.value ?? HOMEPAGE_META_DEFAULTS.description,
    };
  } finally {
    conn.close();
  }
}

export async function setHomepageMetadata(metadata: Partial<HomepageMetadata>): Promise<void> {
  const conn = await getDatabase();
  try {
    await conn.prepare('BEGIN').run();

    if (metadata.eyebrow !== undefined) {
      await conn
        .prepare(`INSERT INTO site_settings (key, value) VALUES ('homepage_eyebrow', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`)
        .run(metadata.eyebrow);
    }
    if (metadata.title !== undefined) {
      await conn
        .prepare(`INSERT INTO site_settings (key, value) VALUES ('homepage_title', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`)
        .run(metadata.title);
    }
    if (metadata.description !== undefined) {
      await conn
        .prepare(`INSERT INTO site_settings (key, value) VALUES ('homepage_description', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`)
        .run(metadata.description);
    }

    await conn.prepare('COMMIT').run();
  } catch {
    await conn.prepare('ROLLBACK').run();
    throw new Error('Failed to save homepage metadata');
  } finally {
    conn.close();
  }
}

export async function setContactResponseTime(time: string): Promise<void> {
  const conn = await getDatabase();
  try {
    await conn
      .prepare(
        `INSERT INTO site_settings (key, value) VALUES ('contact_response_time', ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
      )
      .run(time);
  } finally {
    conn.close();
  }
}


