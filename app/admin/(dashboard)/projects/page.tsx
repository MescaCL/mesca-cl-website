'use client';

import { AdminResource } from '@/components/admin/admin-resource';
import { StatusBadge } from '@/components/shared/status-badge';

const STATUS_OPTIONS = [
  { value: 'idea', label: 'Idea' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'prototype', label: 'Prototype' },
  { value: 'live', label: 'Live' },
  { value: 'paused', label: 'Paused' },
  { value: 'archived', label: 'Archived' },
];

export default function AdminProjectsPage() {
  return (
    <AdminResource
      endpoint="/api/admin/projects"
      itemLabel="Projects"
      emptyMessage="No projects yet. Create your first one to get started."
      defaultValues={{ status: 'idea', is_published: false, featured: false, sort_order: 0 }}
      fields={[
        { name: 'title', label: 'Title', type: 'text', required: true },
        {
          name: 'slug',
          label: 'Slug',
          type: 'text',
          required: true,
          help: 'Lowercase letters, numbers and hyphens. Used in the URL.',
        },
        { name: 'summary', label: 'Summary', type: 'textarea', placeholder: 'One or two lines.' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'category', label: 'Category', type: 'text' },
        {
          name: 'technologies',
          label: 'Technologies',
          type: 'text',
          help: 'Comma separated, e.g. Next.js, TypeScript, Tailwind',
        },
        { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS },
        { name: 'start_date', label: 'Start date', type: 'date' },
        { name: 'last_updated', label: 'Last updated', type: 'date' },
        { name: 'live_url', label: 'Live URL', type: 'text', placeholder: 'https://' },
        { name: 'repository_url', label: 'Repository URL', type: 'text', placeholder: 'https://' },
        { name: 'demo_url', label: 'Demo URL', type: 'text', placeholder: 'https://' },
        { name: 'seo_title', label: 'SEO title', type: 'text' },
        { name: 'seo_description', label: 'SEO description', type: 'textarea' },
        { name: 'featured', label: 'Featured', type: 'checkbox' },
        { name: 'is_published', label: 'Published', type: 'checkbox' },
        { name: 'sort_order', label: 'Sort order', type: 'number' },
      ]}
      columns={[
        {
          key: 'title',
          label: 'Title',
          render: (item) => (
            <div>
              <p className="font-medium">{String(item.title)}</p>
              <p className="font-mono text-xs text-muted-foreground">/{String(item.slug)}</p>
            </div>
          ),
        },
        { key: 'category', label: 'Category' },
        {
          key: 'status',
          label: 'Status',
          render: (item) => <StatusBadge status={String(item.status)} />,
        },
        {
          key: 'visibility',
          label: 'Visibility',
          render: (item) => (
            <span className={item.is_published === 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}>
              {item.is_published === 1 ? 'Live' : 'Hidden'}
            </span>
          ),
        },
        {
          key: 'featured',
          label: 'Featured',
          render: (item) => (item.featured === 1 ? '★' : '—'),
        },
      ]}
    />
  );
}
