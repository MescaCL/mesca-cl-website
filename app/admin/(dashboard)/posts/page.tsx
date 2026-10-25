'use client';

import { AdminResource } from '@/components/admin/admin-resource';
import { StatusBadge } from '@/components/shared/status-badge';
import { PostTypeBadge } from '@/components/shared/post-type-badge';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'archived', label: 'Archived' },
];

const TYPE_OPTIONS = [
  { value: 'article', label: 'Article' },
  { value: 'daily_gist', label: 'Daily gist' },
  { value: 'weekly_gist', label: 'Weekly gist' },
  { value: 'monthly_recap', label: 'Monthly recap' },
];

export default function AdminPostsPage() {
  return (
    <AdminResource
      endpoint="/api/admin/posts"
      itemLabel="Posts"
      emptyMessage="No posts yet. Write your first article."
      defaultValues={{ status: 'draft', post_type: 'article', featured: false }}
      fields={[
        { name: 'title', label: 'Title', type: 'text', required: true },
        {
          name: 'slug',
          label: 'Slug',
          type: 'text',
          required: true,
          help: 'Lowercase letters, numbers and hyphens. Used in the URL.',
        },
        { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
        {
          name: 'content',
          label: 'Content',
          type: 'textarea',
          help: 'Separate paragraphs with blank lines. Start a line with ## for a heading.',
        },
        { name: 'post_type', label: 'Post type', type: 'select', options: TYPE_OPTIONS },
        { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS },
        { name: 'category', label: 'Category', type: 'text' },
        {
          name: 'tags',
          label: 'Tags',
          type: 'text',
          help: 'Comma separated, e.g. ai, nextjs',
        },
        { name: 'published_at', label: 'Published at', type: 'date' },
        { name: 'scheduled_at', label: 'Scheduled at', type: 'date' },
        { name: 'reading_time', label: 'Reading time (minutes)', type: 'number' },
        { name: 'seo_title', label: 'SEO title', type: 'text' },
        { name: 'seo_description', label: 'SEO description', type: 'textarea' },
        { name: 'featured', label: 'Featured', type: 'checkbox' },
        {
          name: 'cover_image_url',
          label: 'Cover Image URL',
          type: 'text',
          placeholder: 'https://...',
          help: 'Paste a media library URL for the post cover image.',
        },
        {
          name: 'gallery_urls',
          label: 'Gallery URLs',
          type: 'textarea',
          help: 'JSON array of image/video URLs, e.g. ["https://..."].',
        },
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
        {
          key: 'post_type',
          label: 'Type',
          render: (item) => <PostTypeBadge type={String(item.post_type)} />,
        },
        {
          key: 'status',
          label: 'Status',
          render: (item) => <StatusBadge status={String(item.status)} />,
        },
        { key: 'category', label: 'Category' },
        {
          key: 'published_at',
          label: 'Published',
          render: (item) =>
            item.published_at ? (
              new Date(String(item.published_at)).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            ) : (
              '—'
            ),
        },
        {
          key: 'cover_image_url',
          label: 'Cover',
          render: (item) =>
            item.cover_image_url ? (
              <img
                src={String(item.cover_image_url)}
                alt="Cover"
                className="h-8 w-8 rounded object-cover"
              />
            ) : (
              '—'
            ),
        },
      ]}
    />
  );
}
