'use client';

import { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import type { Post } from '@/types';

/**
 * Renderer for admin-authored rich text content stored as HTML in the database.
 *
 * The block editor produces HTML (paragraphs, headings, lists, blockquotes,
 * images, videos) that is stored verbatim in the `posts.content` column. This
 * component sanitizes the HTML then renders it with the site's editorial
 * typography.
 *
 * Security: content is authored by admins only. We run DOMPurify before
 * `dangerouslySetInnerHTML` as defense in depth — stripping unsafe scripts,
 * event handlers, and untrusted iframe sources — while preserving supported
 * video embeds (YouTube, Vimeo, TikTok, Instagram, Facebook), images, and
 * rich-text formatting.
 */
interface ContentRendererProps {
  content: string | null;
  className?: string;
}

// Allowed iframe src origins for third-party video embeds.
const ALLOWED_IFRAME_ORIGINS = [
  'https://www.youtube.com',
  'https://player.vimeo.com',
  'https://www.tiktok.com',
  'https://www.instagram.com',
  'https://www.facebook.com',
];

export function ContentRenderer({ content, className }: ContentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rawHtml = content ?? '';
  const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
    ADD_ATTR: ['allow', 'loading'],
    ADD_TAGS: ['iframe'],
    ALLOWED_ATTR: [
      'alt',
      'allow',
      'allowfullscreen',
      'class',
      'frameborder',
      'height',
      'href',
      'loading',
      'rel',
      'scrolling',
      'src',
      'style',
      'target',
      'title',
      'width',
    ],
    ALLOWED_TAGS: [
      'a',
      'b',
      'blockquote',
      'br',
      'code',
      'div',
      'em',
      'figure',
      'figcaption',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'hr',
      'i',
      'iframe',
      'img',
      'li',
      'ol',
      'p',
      'pre',
      'span',
      'strong',
      'u',
      'ul',
    ],
    FORCE_BODY: false,
  });

  // Strip any iframe whose src is not an allowed embed origin.
  const safeHtml = sanitizedHtml.replace(
    /<iframe\b[^>]*src="([^"]*)"[^>]*>[\s\S]*?<\/iframe>/gi,
    (match, src) => {
      try {
        const url = new URL(src);
        if (ALLOWED_IFRAME_ORIGINS.some((origin) => url.origin === origin)) {
          return match;
        }
      } catch {
        // Not a valid URL — drop the iframe.
      }
      return '';
    }
  );

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
  }, [safeHtml]);

  if (!safeHtml.trim()) {
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
      dangerouslySetInnerHTML={{ __html: safeHtml }}
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
