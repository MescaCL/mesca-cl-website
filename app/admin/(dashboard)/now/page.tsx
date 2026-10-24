'use client';

import { AdminResource } from '@/components/admin/admin-resource';

export default function AdminNowPage() {
  return (
    <AdminResource
      endpoint="/api/admin/now-items"
      itemLabel="Now items"
      emptyMessage="Nothing is being worked on right now. Add what you are building."
      defaultValues={{ is_visible: true, sort_order: 0 }}
      fields={[
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'category', label: 'Category', type: 'text' },
        { name: 'status', label: 'Status', type: 'text', placeholder: 'e.g. in_progress' },
        { name: 'next_milestone', label: 'Next milestone', type: 'text' },
        { name: 'image_url', label: 'Image URL', type: 'text', placeholder: 'https://' },
        { name: 'link_url', label: 'Link URL', type: 'text', placeholder: 'https://' },
        { name: 'sort_order', label: 'Sort order', type: 'number' },
        { name: 'is_visible', label: 'Visible', type: 'checkbox' },
      ]}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'category', label: 'Category' },
        { key: 'next_milestone', label: 'Next milestone' },
        {
          key: 'is_visible',
          label: 'Visible',
          render: (item) => (item.is_visible === 1 ? 'Yes' : 'No'),
        },
      ]}
    />
  );
}
