import { z } from 'zod';
import { createCrudRoutes } from '@/lib/crud-routes';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/data';

export const dynamic = 'force-dynamic';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers and hyphens'),
  description: z.string().max(300).optional().or(z.literal('')),
  color: z.string().max(30).optional().or(z.literal('')),
});

const routes = createCrudRoutes({
  list: () => getCategories(),
  create: (data) => createCategory(data as never),
  update: (id, data) => updateCategory(id, data as never),
  remove: (id) => deleteCategory(id),
  schema: categorySchema,
  resourceType: 'category',
  transform: (data) => {
    const payload: Record<string, unknown> = { ...data };
    for (const key of ['description', 'color']) {
      if (key in payload) payload[key] = payload[key] || null;
    }
    return payload;
  },
});

export const GET = routes.GET;
export const POST = routes.POST;
export const PUT = routes.PUT;
export const DELETE = routes.DELETE;
