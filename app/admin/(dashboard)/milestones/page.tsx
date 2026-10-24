'use client';

import { AdminResource } from '@/components/admin/admin-resource';

export default function AdminMilestonesPage() {
  return (
    <AdminResource
      endpoint="/api/admin/milestones"
      itemLabel="Milestones"
      emptyMessage="No milestones yet. Add the first one to start your timeline."
      defaultValues={{ sort_order: 0 }}
      fields={[
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'milestone_date', label: 'Date', type: 'text', placeholder: 'e.g. 2024-06' },
        { name: 'category', label: 'Category', type: 'text' },
        { name: 'image_url', label: 'Image URL', type: 'text', placeholder: 'https://' },
        { name: 'link_url', label: 'Link URL', type: 'text', placeholder: 'https://' },
        { name: 'sort_order', label: 'Sort order', type: 'number' },
      ]}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'milestone_date', label: 'Date' },
        { key: 'category', label: 'Category' },
        { key: 'sort_order', label: 'Order' },
      ]}
    />
  );
}
