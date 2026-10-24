import { z } from 'zod';
import { createCrudRoutes } from '@/lib/crud-routes';
import { getProjects, createProject, updateProject, deleteProject } from '@/lib/data/content';

export const dynamic = 'force-dynamic';

const projectPayloadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers and hyphens'),
  summary: z.string().max(500).optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  category: z.string().optional().or(z.literal('')),
  technologies: z.string().optional().or(z.literal('')),
  status: z.enum(['idea', 'in_progress', 'prototype', 'live', 'paused', 'archived']),
  start_date: z.string().optional().or(z.literal('')),
  last_updated: z.string().optional().or(z.literal('')),
  live_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  repository_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  demo_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  featured: z.boolean().optional(),
  is_published: z.boolean().optional(),
  sort_order: z.number().int().optional(),
  seo_title: z.string().optional().or(z.literal('')),
  seo_description: z.string().optional().or(z.literal('')),
});

const routes = createCrudRoutes({
  list: () => getProjects({}),
  create: (data) => createProject(data as never),
  update: (id, data) => updateProject(id, data as never),
  remove: (id) => deleteProject(id),
  schema: projectPayloadSchema,
  resourceType: 'project',
  transform: (data) => {
    // Only transform the keys that were actually supplied, so partial
    // updates never wipe out fields the caller did not send.
    const payload: Record<string, unknown> = { ...data };
    const nullable = [
      'summary',
      'description',
      'category',
      'technologies',
      'live_url',
      'repository_url',
      'demo_url',
      'start_date',
      'last_updated',
      'seo_title',
      'seo_description',
    ];
    for (const key of nullable) {
      if (key in payload) {
        payload[key] = payload[key] === '' ? null : payload[key];
      }
    }
    if ('featured' in payload) payload.featured = payload.featured ? 1 : 0;
    if ('is_published' in payload) payload.is_published = payload.is_published ? 1 : 0;
    return payload;
  },
});

export const GET = routes.GET;
export const POST = routes.POST;
export const PUT = routes.PUT;
export const DELETE = routes.DELETE;
