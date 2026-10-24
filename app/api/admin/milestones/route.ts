import { z } from 'zod';
import { createCrudRoutes } from '@/lib/crud-routes';
import {
  getMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from '@/lib/data/content';

export const dynamic = 'force-dynamic';

const milestoneSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional().or(z.literal('')),
  milestone_date: z.string().max(50).optional().or(z.literal('')),
  category: z.string().max(80).optional().or(z.literal('')),
  image_url: z.string().optional().or(z.literal('')),
  related_project_id: z.string().optional().or(z.literal('')),
  link_url: z.string().optional().or(z.literal('')),
  sort_order: z.number().int().optional(),
});

const routes = createCrudRoutes({
  list: () => getMilestones(),
  create: (data) => createMilestone(data as never),
  update: (id, data) => updateMilestone(id, data as never),
  remove: (id) => deleteMilestone(id),
  schema: milestoneSchema,
  resourceType: 'milestone',
  transform: (data) => {
    const payload: Record<string, unknown> = { ...data };
    const nullable = [
      'description',
      'milestone_date',
      'category',
      'image_url',
      'related_project_id',
      'link_url',
    ];
    for (const key of nullable) {
      if (key in payload) payload[key] = payload[key] || null;
    }
    return payload;
  },
});

export const GET = routes.GET;
export const POST = routes.POST;
export const PUT = routes.PUT;
export const DELETE = routes.DELETE;
