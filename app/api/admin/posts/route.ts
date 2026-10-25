import { z } from 'zod';
import { createCrudRoutes } from '@/lib/crud-routes';
import { getPosts, createPost, updatePost, deletePost } from '@/lib/data/content';

export const dynamic = 'force-dynamic';

const postPayloadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers and hyphens'),
  excerpt: z.string().max(500).optional().or(z.literal('')),
  content: z.string().optional().or(z.literal('')),
  post_type: z.enum(['article', 'daily_gist', 'weekly_gist', 'monthly_recap']),
  status: z.enum(['draft', 'published', 'scheduled', 'archived']),
  category: z.string().optional().or(z.literal('')),
  tags: z.string().optional().or(z.literal('')),
  published_at: z.string().optional().or(z.literal('')),
  scheduled_at: z.string().optional().or(z.literal('')),
  reading_time: z.number().int().positive().optional(),
  featured: z.boolean().optional(),
  cover_image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  gallery_urls: z.string().optional().or(z.literal('')),
  seo_title: z.string().optional().or(z.literal('')),
  seo_description: z.string().optional().or(z.literal('')),
});

const routes = createCrudRoutes({
  list: () => getPosts({}),
  create: (data) => createPost(data as never),
  update: (id, data) => updatePost(id, data as never),
  remove: (id) => deletePost(id),
  schema: postPayloadSchema,
  resourceType: 'post',
  transform: (data) => {
    const payload: Record<string, unknown> = { ...data };
    const nullable = [
      'excerpt',
      'content',
      'category',
      'tags',
      'published_at',
      'scheduled_at',
      'cover_image_url',
      'gallery_urls',
      'seo_title',
      'seo_description',
    ];
    for (const key of nullable) {
      if (key in payload) {
        payload[key] = payload[key] === '' ? null : payload[key];
      }
    }
    if ('featured' in payload) payload.featured = payload.featured ? 1 : 0;
    return payload;
  },
});

export const GET = routes.GET;
export const POST = routes.POST;
export const PUT = routes.PUT;
export const DELETE = routes.DELETE;
