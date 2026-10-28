import { getDatabase, generateId } from '../db/index';
import type {
  Project,
  Post,
  JourneyMilestone,
  NowItem,
  ContactSubmission,
  ButtonConfig,
  HomepageSection,
} from '@/types';

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

/**
 * Build an `INSERT` statement from a plain object.
 *
 * The id is generated in application code because the `id` columns are
 * `TEXT PRIMARY KEY` â€” SQLite's `lastInsertRowid` would return the internal
 * rowid, which does not match the stored text id.
 */
async function insertRow(
  table: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const conn = await getDatabase();
  try {
    const id = generateId();
    const payload: Record<string, unknown> = { ...data, id };
    const keys = Object.keys(payload);
    const placeholders = keys.map(() => '?').join(', ');
    await conn
      .prepare(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`)
      .run(...keys.map((key) => (payload[key] as unknown)));
    const row = await conn.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
    return (row ?? {}) as Record<string, unknown>;
  } finally {
    conn.close();
  }
}

/** Build an `UPDATE` statement from a plain object. */
async function updateRow(
  table: string,
  id: string,
  data: Record<string, unknown>,
  hasUpdatedAt = true
): Promise<Record<string, unknown> | null> {
  const conn = await getDatabase();
  try {
    const keys = Object.keys(data).filter((key) => key !== 'id' && key !== 'created_at');
    if (keys.length > 0) {
      const setClause = keys.map((key) => `${key} = ?`).join(', ');
      const suffix = hasUpdatedAt ? ', updated_at = CURRENT_TIMESTAMP' : '';
      await conn
        .prepare(`UPDATE ${table} SET ${setClause}${suffix} WHERE id = ?`)
        .run(...keys.map((key) => data[key]), id);
    }
    const row = await conn.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
    return (row ?? null) as Record<string, unknown> | null;
  } finally {
    conn.close();
  }
}

/** Delete a row and report whether anything was removed. */
async function deleteRow(table: string, id: string): Promise<boolean> {
  const conn = await getDatabase();
  try {
    const result = await conn.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
    return result.changes > 0;
  } finally {
    conn.close();
  }
}

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export interface ProjectFilters {
  publishedOnly?: boolean;
  featuredOnly?: boolean;
  category?: string;
  limit?: number;
}

export async function getProjects(filters: ProjectFilters = {}): Promise<Project[]> {
  const conn = await getDatabase();
  try {
    const clauses: string[] = [];
    const params: unknown[] = [];

    if (filters.publishedOnly) clauses.push('is_published = 1');
    if (filters.featuredOnly) clauses.push('featured = 1');
    if (filters.category) {
      clauses.push('category = ?');
      params.push(filters.category);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const limit = filters.limit ? `LIMIT ${Number(filters.limit)}` : '';

    return await conn
      .prepare(
        `SELECT * FROM projects ${where} ORDER BY sort_order ASC, created_at DESC ${limit}`
      )
      .all(...params) as Project[];
  } finally {
    conn.close();
  }
}

export async function getProjectBySlug(slug: string, publishedOnly = true): Promise<Project | null> {
  const conn = await getDatabase();
  try {
    const sql = publishedOnly
      ? 'SELECT * FROM projects WHERE slug = ? AND is_published = 1'
      : 'SELECT * FROM projects WHERE slug = ?';
    return (await conn.prepare(sql).get(slug) as Project | undefined) ?? null;
  } finally {
    conn.close();
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  const conn = await getDatabase();
  try {
    return (await conn.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project | undefined) ?? null;
  } finally {
    conn.close();
  }
}

export async function createProject(data: Partial<Project>): Promise<Project> {
  return insertRow('projects', data as Record<string, unknown>) as unknown as Project;
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project | null> {
  return updateRow('projects', id, data as Record<string, unknown>) as unknown as Project | null;
}

export async function deleteProject(id: string): Promise<boolean> {
  return deleteRow('projects', id);
}


/* ------------------------------------------------------------------ */
/* Posts                                                               */
/* ------------------------------------------------------------------ */

export interface PostFilters {
  publishedOnly?: boolean;
  featuredOnly?: boolean;
  category?: string;
  postType?: string;
  search?: string;
  limit?: number;
}

export async function getPosts(filters: PostFilters = {}): Promise<Post[]> {
  const conn = await getDatabase();
  try {
    const clauses: string[] = [];
    const params: unknown[] = [];

    if (filters.publishedOnly) {
      clauses.push(
        "(status = 'published' AND (published_at IS NULL OR published_at <= CURRENT_TIMESTAMP))"
      );
    }
    if (filters.featuredOnly) clauses.push('featured = 1');
    if (filters.category) {
      clauses.push('category = ?');
      params.push(filters.category);
    }
    if (filters.postType) {
      clauses.push('post_type = ?');
      params.push(filters.postType);
    }
    if (filters.search) {
      clauses.push(
        '(title LIKE ? OR excerpt LIKE ? OR content LIKE ?)'
      );
      const like = `%${filters.search}%`;
      params.push(like, like, like);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const limit = filters.limit ? `LIMIT ${Number(filters.limit)}` : '';

    return await conn
      .prepare(
        `SELECT * FROM posts ${where} ORDER BY COALESCE(published_at, created_at) DESC ${limit}`
      )
      .all(...params) as Post[];
  } finally {
    conn.close();
  }
}

export async function getPostBySlug(slug: string, publishedOnly = true): Promise<Post | null> {
  const conn = await getDatabase();
  try {
    const sql = publishedOnly
      ? "SELECT * FROM posts WHERE slug = ? AND status = 'published' AND (published_at IS NULL OR published_at <= CURRENT_TIMESTAMP)"
      : 'SELECT * FROM posts WHERE slug = ?';
    return (await conn.prepare(sql).get(slug) as Post | undefined) ?? null;
  } finally {
    conn.close();
  }
}

export async function getPostById(id: string): Promise<Post | null> {
  const conn = await getDatabase();
  try {
    return (await conn.prepare('SELECT * FROM posts WHERE id = ?').get(id) as Post | undefined) ?? null;
  } finally {
    conn.close();
  }
}

export async function createPost(data: Partial<Post>): Promise<Post> {
  return insertRow('posts', data as Record<string, unknown>) as unknown as Post;
}

export async function updatePost(id: string, data: Partial<Post>): Promise<Post | null> {
  return updateRow('posts', id, data as Record<string, unknown>) as unknown as Post | null;
}

export async function deletePost(id: string): Promise<boolean> {
  return deleteRow('posts', id);
}

/* ------------------------------------------------------------------ */
/* Journey milestones                                                  */
/* ------------------------------------------------------------------ */

export async function getMilestones(): Promise<JourneyMilestone[]> {
  const conn = await getDatabase();
  try {
    return await conn
      .prepare(
        'SELECT * FROM journey_milestones ORDER BY sort_order ASC, milestone_date DESC'
      )
      .all() as JourneyMilestone[];
  } finally {
    conn.close();
  }
}

export async function createMilestone(data: Partial<JourneyMilestone>): Promise<JourneyMilestone> {
  return insertRow('journey_milestones', data as Record<string, unknown>) as unknown as JourneyMilestone;
}

export async function updateMilestone(
  id: string,
  data: Partial<JourneyMilestone>
): Promise<JourneyMilestone | null> {
  return updateRow(
    'journey_milestones',
    id,
    data as Record<string, unknown>
  ) as unknown as JourneyMilestone | null;
}

export async function deleteMilestone(id: string): Promise<boolean> {
  return deleteRow('journey_milestones', id);
}


/* ------------------------------------------------------------------ */
/* Now items (currently building)                                      */
/* ------------------------------------------------------------------ */

export async function getNowItems(): Promise<NowItem[]> {
  const conn = await getDatabase();
  try {
    return await conn
      .prepare('SELECT * FROM now_items WHERE is_visible = 1 ORDER BY sort_order ASC')
      .all() as NowItem[];
  } finally {
    conn.close();
  }
}

export async function getAllNowItems(): Promise<NowItem[]> {
  const conn = await getDatabase();
  try {
    return await conn.prepare('SELECT * FROM now_items ORDER BY sort_order ASC').all() as NowItem[];
  } finally {
    conn.close();
  }
}

export async function createNowItem(data: Partial<NowItem>): Promise<NowItem> {
  return insertRow('now_items', data as Record<string, unknown>) as unknown as NowItem;
}

export async function updateNowItem(id: string, data: Partial<NowItem>): Promise<NowItem | null> {
  return updateRow('now_items', id, data as Record<string, unknown>) as unknown as NowItem | null;
}

export async function deleteNowItem(id: string): Promise<boolean> {
  return deleteRow('now_items', id);
}

/* ------------------------------------------------------------------ */
/* Homepage sections                                                   */
/* ------------------------------------------------------------------ */

export async function getHomepageSections(): Promise<HomepageSection[]> {
  const conn = await getDatabase();
  try {
    return await conn
      .prepare('SELECT * FROM homepage_sections WHERE is_visible = 1 ORDER BY sort_order ASC')
      .all() as HomepageSection[];
  } finally {
    conn.close();
  }
}

export async function getAllHomepageSections(): Promise<HomepageSection[]> {
  const conn = await getDatabase();
  try {
    return await conn
      .prepare('SELECT * FROM homepage_sections ORDER BY sort_order ASC')
      .all() as HomepageSection[];
  } finally {
    conn.close();
  }
}

export async function updateHomepageSection(
  id: string,
  data: Partial<HomepageSection>
): Promise<HomepageSection | null> {
  return updateRow('homepage_sections', id, data as Record<string, unknown>) as unknown as HomepageSection | null;
}

/* ------------------------------------------------------------------ */
/* Button configs                                                      */
/* ------------------------------------------------------------------ */

export async function getButtonConfigs(onlyVisible = true): Promise<ButtonConfig[]> {
  const conn = await getDatabase();
  try {
    const sql = onlyVisible
      ? 'SELECT * FROM button_configs WHERE is_visible = 1 ORDER BY sort_order ASC'
      : 'SELECT * FROM button_configs ORDER BY sort_order ASC';
    return await conn.prepare(sql).all() as ButtonConfig[];
  } finally {
    conn.close();
  }
}

export async function createButtonConfig(data: Partial<ButtonConfig>): Promise<ButtonConfig> {
  return insertRow('button_configs', data as Record<string, unknown>) as unknown as ButtonConfig;
}

export async function updateButtonConfig(
  id: string,
  data: Partial<ButtonConfig>
): Promise<ButtonConfig | null> {
  return updateRow('button_configs', id, data as Record<string, unknown>) as unknown as ButtonConfig | null;
}

export async function deleteButtonConfig(id: string): Promise<boolean> {
  return deleteRow('button_configs', id);
}

/* ------------------------------------------------------------------ */
/* Support Campaigns                                                     */
/* ------------------------------------------------------------------ */

export interface SupportCampaignForm {
  id?: string;
  title: string;
  purpose?: string | null;
  description?: string | null;
  suggested_amounts?: string | null;
  target_amount?: number | null;
  currency?: string | null;
  is_enabled?: number;
  provider?: string | null;
  provider_config?: string | null;
  bank_account_holder?: string | null;
  bank_name?: string | null;
  account_number?: string | null;
  payment_instructions?: string | null;
}

export async function createSupportCampaign(data: SupportCampaignForm): Promise<SupportCampaignForm> {
  const conn = await getDatabase();
  try {
    const id = generateId();
    const payload: Record<string, unknown> = {
      id,
      title: data.title,
      purpose: data.purpose ?? null,
      description: data.description ?? null,
      suggested_amounts: data.suggested_amounts ?? null,
      target_amount: data.target_amount ?? null,
      currency: data.currency ?? 'NGN',
      is_enabled: data.is_enabled ?? 0,
      provider: data.provider ?? null,
      provider_config: data.provider_config ?? null,
    };
    const row = insertRow('support_campaigns', payload);
    return row as unknown as SupportCampaignForm;
  } finally {
    conn.close();
  }
}

export async function getSupportCampaigns(onlyEnabled = false): Promise<SupportCampaignForm[]> {
  const conn = await getDatabase();
  try {
    const sql = onlyEnabled ? 'SELECT * FROM support_campaigns WHERE is_enabled = 1 ORDER BY sort_order ASC, created_at DESC' : 'SELECT * FROM support_campaigns ORDER BY sort_order ASC, created_at DESC';
    return await conn.prepare(sql).all() as unknown as SupportCampaignForm[];
  } finally {
    conn.close();
  }
}

export async function getSupportCampaign(id: string): Promise<SupportCampaignForm | null> {
  const conn = await getDatabase();
  try {
    const row = await conn.prepare('SELECT * FROM support_campaigns WHERE id = ?').get(id) as SupportCampaignForm | undefined;
    return row ?? null;
  } finally {
    conn.close();
  }
}

export async function updateSupportCampaign(id: string, data: SupportCampaignForm): Promise<SupportCampaignForm | null> {
  const conn = await getDatabase();
  try {
    const keys = Object.keys(data).filter((key) => key !== 'id' && key !== 'created_at');
    if (keys.length > 0) {
      const setClause = keys.map((key) => `${key} = ?`).join(', ');
      await conn
        .prepare(`UPDATE support_campaigns SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
        .run(...keys.map((key) => (data as unknown as Record<string, unknown>)[key]), id);
    }
    return await getSupportCampaign(id);
  } finally {
    conn.close();
  }
}

export async function deleteSupportCampaign(id: string): Promise<boolean> {
  return deleteRow('support_campaigns', id);
}

/* ------------------------------------------------------------------ */
/* Contact submissions                                                 */
/* ------------------------------------------------------------------ */

export async function createContactSubmission(data: {
  name: string;
  email: string;
  subject?: string | null;
  category?: string | null;
  message: string;
  ip_address?: string | null;
  user_agent?: string | null;
}): Promise<ContactSubmission> {
  const conn = await getDatabase();
  try {
    const id = generateId();
    await conn
      .prepare(
        `INSERT INTO contact_submissions (id, name, email, subject, category, message, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        id,
        data.name,
        data.email,
        data.subject ?? null,
        data.category ?? null,
        data.message,
        data.ip_address ?? null,
        data.user_agent ?? null
      );
    const row = await conn.prepare('SELECT * FROM contact_submissions WHERE id = ?').get(id);
    return row as ContactSubmission;
  } finally {
    conn.close();
  }
}

export async function getContactSubmissions(status?: string): Promise<ContactSubmission[]> {
  const conn = await getDatabase();
  try {
    return (
      status
        ? await conn
            .prepare(
              'SELECT * FROM contact_submissions WHERE status = ? ORDER BY submitted_at DESC'
            )
            .all(status)
        : await conn
            .prepare('SELECT * FROM contact_submissions ORDER BY submitted_at DESC')
            .all()
    ) as ContactSubmission[];
  } finally {
    conn.close();
  }
}

export async function getContactSubmission(id: string): Promise<ContactSubmission | null> {
  const conn = await getDatabase();
  try {
    return (
      (await conn.prepare('SELECT * FROM contact_submissions WHERE id = ?').get(id) as
        | ContactSubmission
        | undefined) ?? null
    );
  } finally {
    conn.close();
  }
}

export async function updateContactSubmissionStatus(id: string, status: string): Promise<boolean> {
  const conn = await getDatabase();
  try {
    const result = await conn
      .prepare('UPDATE contact_submissions SET status = ? WHERE id = ?')
      .run(status, id);
    return result.changes > 0;
  } finally {
    conn.close();
  }
}

export async function deleteContactSubmission(id: string): Promise<boolean> {
  return deleteRow('contact_submissions', id);
}

/** Count recent submissions from an IP inside the given window (rate limiting). */
export async function countRecentSubmissions(ipAddress: string, withinMinutes: number): Promise<number> {
  const conn = await getDatabase();
  try {
    const row = await conn
      .prepare(
        `SELECT COUNT(*) as count FROM contact_submissions
         WHERE ip_address = ? AND submitted_at >= datetime('now', ?)`
      )
      .get(ipAddress, `-${withinMinutes} minutes`) as { count: number };
    return row.count;
  } finally {
    conn.close();
  }
}


