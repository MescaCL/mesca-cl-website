'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Search, Trash2, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MediaFile {
  id: string;
  filename: string;
  original_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  alt_text: string | null;
  caption: string | null;
  description: string | null;
  uploaded_at: string;
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/media');
      const payload = (await response.json()) as { data?: MediaFile[]; message?: string };
      if (!response.ok) {
        setNotice(payload.message ?? 'Could not load media.');
        return;
      }
      setItems(payload.data ?? []);
    } catch {
      setNotice('Network error while loading media.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const needle = query.toLowerCase();
    return items.filter(
      (item) =>
        item.original_name.toLowerCase().includes(needle) ||
        item.filename.toLowerCase().includes(needle) ||
        item.file_type.toLowerCase().includes(needle)
    );
  }, [items, query]);

  const isImage = (mime: string) => mime.startsWith('image/');
  const isVideo = (mime: string) => mime.startsWith('video/');

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDelete = useCallback(async (id: string) => {
    setDeleting(id);
    try {
      const response = await fetch(`/api/admin/media?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        setNotice(payload.message ?? 'Could not delete media.');
        return;
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setNotice('Network error while deleting media.');
    } finally {
      setDeleting(null);
    }
  }, []);

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">Media Library</h2>
            <p className="text-sm text-muted-foreground">
              Uploaded images and videos used across posts and pages.
            </p>
          </div>
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search media…"
              className="pl-9 w-64"
              aria-label="Search media"
            />
          </div>
        </div>

        {notice && (
          <div className="rounded-md border border-border/80 bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            {notice}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card py-20 text-sm text-muted-foreground">
            <Loader2 size={16} className="animate-spin" />
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-20 text-center">
            <ImageIcon size={24} className="mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 font-medium">No media uploaded yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload images and videos from the post editor or media upload area.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((item) => {
              const image = isImage(item.file_type);
              const video = isVideo(item.file_type);
              const isDeleting = deleting === item.id;
              return (
                <div
                  key={item.id}
                  className="group rounded-xl border border-border/80 bg-card overflow-hidden hover:border-primary/50 transition-colors"
                >
                  <div className="aspect-video bg-muted/30 relative overflow-hidden">
                    {image ? (
                      <img
                        src={item.file_url}
                        alt={item.alt_text ?? item.original_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : video ? (
                      <video
                        src={item.file_url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        {isImage(item.file_type) ? <ImageIcon size={20} /> : <VideoIcon size={20} />}
                      </div>
                    )}
                    {isDeleting && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 size={14} className="animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium truncate" title={item.original_name}>
                      {item.original_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate" title={item.file_type}>
                      {item.file_type}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{formatSize(item.file_size)}</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={isDeleting}
                        className="h-7 w-7 rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                        aria-label="Delete media"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
