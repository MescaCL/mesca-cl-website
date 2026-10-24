'use client';

import { useEffect, useRef } from 'react';
import type { Post } from '@/types';

/**
 * Renderer for admin-authored rich text content stored as HTML in the database.
 *
 * The block editor produces HTML (paragraphs, headings, lists, blockquotes,
 * images, videos) that is stored verbatim in the `posts.content` column. This
 * component renders it with the site's editorial typography.
 *
 * Security: content is authored by admins only and stored after the editor's
 * own escaping. We render it as-is so images, videos and formatting survive.
 */
interface ContentRendererProps {
  content: string | null;
  className?: string;
}

export function ContentRenderer({ content, className }: ContentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const html = content ?? '';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Load Twitter widgets if a twitter-tweet block exists
    if (container.querySelector('.twitter-tweet') && !(window as unknown as { twttr?: unknown }).twttr) {
      const s = document.createElement('script');
      s.src = 'https://platform.twitter.com/widgets.js';
      s.async = true;
      s.charset = 'utf-8';
      document.body.appendChild(s);
    } else if ((window as unknown as { twttr?: { widgets?: { load?: (el?: unknown) => void } } }).twttr?.widgets?.load) {
      (window as unknown as { twttr: { widgets: { load: (el?: unknown) => void } } }).twttr.widgets.load(container);
    }
  }, [html]);

  if (!html.trim()) {
    return (
      <p className={className}>
        This article is being written. Check back shortly for the full story.
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className ?? 'prose-invert max-w-none text-[15px] leading-[1.75] text-foreground/90'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}


/**
 * Extract a plain-text excerpt from rich text content by stripping tags.
 * Used for meta descriptions and search results.
 */
export function excerptFromContent(content: string | null, maxLength = 220): string {
  if (!content) return '';
  const text = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Read time estimate based on word count (~200 words per minute).
 */
export function estimateReadingTime(content: string | null): number {
  if (!content) return 0;
  const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
