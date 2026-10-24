'use client';

import { useCallback, useEffect, useState } from 'react';
import { Image as ImageIcon, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MediaItem {
  id: string;
  filename: string;
  original_name: string | null;
  file_url: string | null;
  file_type: string | null;
  alt_text: string | null;
}

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImagePicker({ value, onChange, label = 'Image' }: ImagePickerProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/media');
      const payload = (await res.json()) as { data?: MediaItem[]; message?: string };
      if (!res.ok) {
        setError(payload.message ?? 'Could not load media.');
        return;
      }
      setItems((payload.data ?? []).filter((m) => m.file_type?.startsWith('image/')));
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/media', { method: 'POST', body: formData });
      const payload = (await res.json()) as { media?: MediaItem; message?: string };
      if (!res.ok || !payload.media?.file_url) {
        setError(payload.message ?? 'Upload failed.');
        return;
      }
      onChange(payload.media.file_url);
      setOpen(false);
    } catch {
      setError('Upload failed.');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const filtered = query.trim()
    ? items.filter((m) =>
        (m.original_name ?? m.filename).toLowerCase().includes(query.toLowerCase())
      )
    : items;
  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="h-40 w-auto max-w-full rounded-lg border border-border object-cover"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-destructive text-destructive-foreground shadow"
            aria-label="Remove image"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <div className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-muted-foreground">
          <ImageIcon size={24} />
        </div>
      )}

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          {value ? 'Replace image' : 'Select / upload image'}
        </Button>
        {value && (
          <span className="truncate text-xs text-muted-foreground self-center">{value}</span>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-xl bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="font-semibold">{label}</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search media…"
                className="flex-1"
              />
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Upload from device
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleUpload(f);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>

            {error && <p className="px-4 pt-2 text-sm text-destructive">{error}</p>}

            <div className="max-h-[55vh] overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 size={18} className="animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No images yet. Upload one above.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {filtered.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        if (m.file_url) {
                          onChange(m.file_url);
                          setOpen(false);
                        }
                      }}
                      className="group overflow-hidden rounded-lg border border-border hover:border-primary"
                    >
                      <div className="aspect-square bg-muted/30">
                        <img
                          src={m.file_url ?? ''}
                          alt={m.alt_text ?? m.original_name ?? ''}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <p className="truncate px-2 py-1 text-xs">{m.original_name ?? m.filename}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

