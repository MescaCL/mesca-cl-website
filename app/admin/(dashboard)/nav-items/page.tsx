'use client';

import { AdminResource } from '@/components/admin/admin-resource';

export default function AdminNavItemsPage() {
  return (
    <AdminResource
      endpoint="/api/admin/nav-items"
      itemLabel="Navigation items"
      emptyMessage="No navigation items yet. Add your first menu link."
      defaultValues={{ sort_order: 0, is_visible: true }}
      fields={[
        { name: 'label', label: 'Label', type: 'text', required: true },
        { name: 'url', label: 'URL', type: 'text', required: true, help: 'e.g. /projects or https://example.com' },
        { name: 'sort_order', label: 'Sort order', type: 'number', help: 'Lower numbers appear first' },
        { name: 'is_visible', label: 'Visible', type: 'checkbox' },
      ]}
      columns={[
        { key: 'label', label: 'Label' },
        { key: 'url', label: 'URL' },
        {
          key: 'sort_order',
          label: 'Order',
          render: (item) => String(item.sort_order ?? 0),
        },
        {
          key: 'is_visible',
          label: 'Visible',
          render: (item) => (item.is_visible === 1 ? 'Yes' : 'No'),
        },
      ]}
    />
  );
}