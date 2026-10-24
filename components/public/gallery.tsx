'use client';

import { Image as ImageIcon, Video as VideoIcon, Maximize2 as MaximizeIcon } from 'lucide-react';

interface GalleryItem {
  url: string;
  type: 'image' | 'video';
  alt?: string;
}

interface GalleryProps {
  items: GalleryItem[];
  className?: string;
}

export function Gallery({ items, className }: GalleryProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className={className ?? 'grid gap-2 md:grid-cols-2 lg:grid-cols-3'}>
      {items.map((item, index) => (
        <figure
          key={index}
          className="group rounded-xl border border-border/80 bg-muted/40 overflow-hidden relative aspect-[4/3]"
        >
          {item.type === 'image' ? (
            <img
              src={item.url}
              alt={item.alt ?? `Gallery image ${index + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
              loading="lazy"
            />
          ) : (
            <video
              src={item.url}
              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
              muted
              playsInline
              preload="metadata"
            />
          )}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <MaximizeIcon size={20} className="text-white" />
          </div>
          <div className="absolute bottom-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 backdrop-blur text-white/90">
            {item.type === 'image' ? <ImageIcon size={14} /> : <VideoIcon size={14} />}
          </div>
        </figure>
      ))}
    </div>
  );
}

/**
 * Parse a JSON-encoded gallery_urls string from a post into GalleryItem[].
 * Each entry can be a URL string or an object { url, type, alt }.
 */
export function parseGalleryUrls(galleryUrls: string | null): GalleryItem[] {
  if (!galleryUrls) return [];
  try {
    const parsed = JSON.parse(galleryUrls);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((entry) => {
      if (typeof entry === 'string') {
        const isVideo = /\.(mp4|webm|ogg)(\?|$)/i.test(entry);
        return { url: entry, type: (isVideo ? 'video' : 'image') };
      }
      if (entry && typeof entry === 'object' && 'url' in entry) {
        return {
          url: String(entry.url),
          type: entry.type === 'video' ? 'video' : 'image',
          alt: entry.alt ?? undefined,
        };
      }
      return null;
    }).filter(Boolean) as GalleryItem[];
  } catch {
    return [];
  }
}
