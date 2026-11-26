import { z } from 'zod';
import { createCrudRoutes } from '@/lib/crud-routes';
import {
  getNavItems,
  createNavItem,
  updateNavItem,
  deleteNavItem,
} from '@/lib/data';

export const dynamic = 'force-dynamic';

const navItemSchema = z.object({
  label: z.string().min(1, 'Label is required').max(80),
  url: z.string().min(1, 'URL is required').max(200),
  sort_order: z.number().int().optional(),
  is_visible: z.boolean().optional(),
});

const routes = createCrudRoutes({
  list: () => getNavItems(false),
  create: (data) => createNavItem(data as never),
  update: (id, data) => updateNavItem(id, data as never),
  remove: (id) => deleteNavItem(id),
  schema: navItemSchema,
  resourceType: 'nav item',
  transform: (data) => {
    const payload: Record<string, unknown> = { ...data };
    if ('is_visible' in payload) payload.is_visible = payload.is_visible ? 1 : 0;
    return payload;
  },
});

export const GET = routes.GET;
export const POST = routes.POST;
export const PUT = routes.PUT;
export const DELETE = routes.DELETE;