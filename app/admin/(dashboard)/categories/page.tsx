'use client';

import { AdminResource } from '@/components/admin/admin-resource';

export default function AdminCategoriesPage() {
  return (
    <AdminResource
      endpoint="/api/admin/categories"
      itemLabel="Categories"
      emptyMessage="No categories yet. Add one to organise your work."
      fields={[
        { name: 'name', label: 'Name', type: 'text', required: true },
        {
          name: 'slug',
          label: 'Slug',
          type: 'text',
          required: true,
          help: 'Lowercase letters, numbers and hyphens.',
        },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'color', label: 'Colour', type: 'text', placeholder: '#3b82f6' },
      ]}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'slug', label: 'Slug' },
        { key: 'description', label: 'Description' },
      ]}
    />
  );
}
