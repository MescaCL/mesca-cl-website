'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminFetch } from '@/lib/admin-fetch';
import { GeneralSettings, HomepageSettings, MetadataSettings, SocialSettings, MediaSettings, SecuritySettings } from './settings-sections';

type CategoryKey = keyof typeof CATEGORIES;

const CATEGORIES: Record<string, string> = {
  general: 'General',
  homepage: 'Homepage',
  metadata: 'Metadata & SEO',
  social: 'Social Media',
  media: 'Media / Images',
  security: 'Security & Privacy',
};

export default function SiteSettingsPage() {
  const [activeCat, setActiveCat] = useState<CategoryKey>('general');
  const [values, setValues] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await adminFetch('/settings');
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message ?? 'Failed to load settings.');
      const map: Record<string, string | null> = {};
      (payload.data ?? []).forEach((s: { key: string; value: string | null }) => {
        map[s.key] = s.value;
      });
      setValues(map);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const save = async (key: string, value: string | null) => {
    setSaving(true);
    setError('');
    try {
      const res = await adminFetch('/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, category: activeCat }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message ?? 'Failed to save.');
      await load();
      setNotice('Setting saved.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const get = (key: string): string | null => values[key] ?? null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={18} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Site Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage global and homepage settings that drive the public website.
          </p>
        </div>
        <div className="flex gap-2">
          {(Object.keys(CATEGORIES) as CategoryKey[]).map((cat) => (
            <Button
              key={cat}
              variant={activeCat === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCat(cat)}
              className="capitalize"
            >
              {CATEGORIES[cat]}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {activeCat === 'general' && (
          <GeneralSettings get={get} save={save} />
        )}
        {activeCat === 'homepage' && (
          <HomepageSettings get={get} save={save} />
        )}
        {activeCat === 'metadata' && (
          <MetadataSettings get={get} save={save} />
        )}
        {activeCat === 'social' && (
          <SocialSettings get={get} save={save} />
        )}
        {activeCat === 'media' && (
          <MediaSettings get={get} save={save} />
        )}
        {activeCat === 'security' && (
          <SecuritySettings />
        )}
      </div>

      {notice && (
        <div className="rounded-xl border border-border/80 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          {notice}
        </div>
      )}
    </div>
  );
}
