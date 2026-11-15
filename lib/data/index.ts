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
    for (const key of setFields) {
      const submitted = (data as Record<string, unknown>)[key];
      const persisted = (row as unknown as Record<string, unknown>)[key];
      submittedValues[key] = submitted;
      persistedValues[key] = persisted;
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


