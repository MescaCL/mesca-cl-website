import { z } from 'zod';
import { createCrudRoutes } from '@/lib/crud-routes';
import {
  getSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from '@/lib/data';

export const dynamic = 'force-dynamic';

const socialLinkSchema = z.object({
  platform: z.string().min(1, 'Platform is required').max(50),
  label: z.string().min(1, 'Label is required').max(80),
  url: z.string().url('Must be a valid URL'),
  icon: z.string().max(50).optional().or(z.literal('')),
  is_visible: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

const routes = createCrudRoutes({
  list: () => getSocialLinks(false),
  create: (data) => createSocialLink(data as never),
  update: (id, data) => updateSocialLink(id, data as never),
  remove: (id) => deleteSocialLink(id),
  schema: socialLinkSchema,
  resourceType: 'social link',
  transform: (data) => {
    const payload: Record<string, unknown> = { ...data };
    if ('icon' in payload) payload.icon = payload.icon || null;
    if ('is_visible' in payload) payload.is_visible = payload.is_visible ? 1 : 0;
    return payload;
  },
});

export const GET = routes.GET;
export const POST = routes.POST;
export const PUT = routes.PUT;
export const DELETE = routes.DELETE;
