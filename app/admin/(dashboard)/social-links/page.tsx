'use client';

import { AdminResource } from '@/components/admin/admin-resource';
import { SocialIcon } from '@/components/shared/social-icon';

const PLATFORM_OPTIONS = [
  { value: 'x', label: 'X (Twitter)' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'github', label: 'GitHub' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

export default function AdminSocialLinksPage() {
  return (
    <AdminResource
      endpoint="/api/admin/social-links"
      itemLabel="Social links"
      emptyMessage="No social links yet. Add the channels you want to showcase."
      defaultValues={{ is_visible: true, sort_order: 0 }}
      fields={[
        { name: 'platform', label: 'Platform', type: 'select', options: PLATFORM_OPTIONS, required: true },
        { name: 'label', label: 'Label', type: 'text', required: true },
        { name: 'url', label: 'URL', type: 'text', required: true, placeholder: 'https://' },
        {
          name: 'icon',
          label: 'Icon',
          type: 'text',
          help: 'One of: x, linkedin, github, instagram, tiktok, youtube, facebook, whatsapp',
        },
        { name: 'sort_order', label: 'Sort order', type: 'number' },
        { name: 'is_visible', label: 'Visible', type: 'checkbox' },
      ]}
      columns={[
        {
          key: 'platform',
          label: 'Platform',
          render: (item) => (
            <span className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-muted text-muted-foreground">
                <SocialIcon platform={String(item.icon || item.platform)} className="h-3.5 w-3.5" />
              </span>
              {String(item.label ?? item.platform)}
            </span>
          ),
        },
        { key: 'url', label: 'URL' },
        {
          key: 'is_visible',
          label: 'Visible',
          render: (item) => (item.is_visible === 1 ? 'Yes' : 'No'),
        },
        { key: 'sort_order', label: 'Order' },
      ]}
    />
  );
}
