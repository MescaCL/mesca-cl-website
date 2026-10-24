import { z } from 'zod';
import { createCrudRoutes } from '@/lib/crud-routes';
import {
  getAllNowItems,
  createNowItem,
  updateNowItem,
  deleteNowItem,
} from '@/lib/data/content';

export const dynamic = 'force-dynamic';

const nowItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional().or(z.literal('')),
  category: z.string().max(80).optional().or(z.literal('')),
  status: z.string().max(50).optional().or(z.literal('')),
  related_project_id: z.string().optional().or(z.literal('')),
  link_url: z.string().optional().or(z.literal('')),
  image_url: z.string().optional().or(z.literal('')),
  next_milestone: z.string().max(200).optional().or(z.literal('')),
  is_visible: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

const routes = createCrudRoutes({
  list: () => getAllNowItems(),
  create: (data) => createNowItem(data as never),
  update: (id, data) => updateNowItem(id, data as never),
  remove: (id) => deleteNowItem(id),
  schema: nowItemSchema,
  resourceType: 'now item',
  transform: (data) => {
    const payload: Record<string, unknown> = { ...data };
    const nullable = [
      'description',
      'category',
      'status',
      'related_project_id',
      'link_url',
      'image_url',
      'next_milestone',
    ];
    for (const key of nullable) {
      if (key in payload) payload[key] = payload[key] || null;
    }
    if ('is_visible' in payload) payload.is_visible = payload.is_visible ? 1 : 0;
    return payload;
  },
});

export const GET = routes.GET;
export const POST = routes.POST;
export const PUT = routes.PUT;
export const DELETE = routes.DELETE;
