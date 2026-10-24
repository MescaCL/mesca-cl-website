'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProfileForm {
  brand_name: string;
  full_name: string;
  headline: string;
  supporting_statement: string;
  short_bio: string;
  full_bio: string;
  email: string;
  phone_number: string;
  whatsapp_number: string;
  call_button_label: string;
  whatsapp_button_label: string;
  whatsapp_preset_message: string;
  location: string;
  call_button_visible: boolean;
  whatsapp_button_visible: boolean;
  profile_image_url: string | null;
  profile_image_alt: string | null;
  hero_eyebrow: string;
  hero_primary_cta_label: string;
  hero_primary_cta_url: string;
  hero_secondary_cta_label: string;
  hero_secondary_cta_url: string;
}

const EMPTY: ProfileForm = {
  brand_name: 'Mesca CL',
  full_name: '',
  headline: '',
  supporting_statement: '',
  short_bio: '',
  full_bio: '',
  email: '',
  phone_number: '',
  whatsapp_number: '',
  call_button_label: 'Call Mesca',
  whatsapp_button_label: 'Chat on WhatsApp',
  whatsapp_preset_message: '',
  location: '',
  call_button_visible: false,
  whatsapp_button_visible: false,
  profile_image_url: null,
  profile_image_alt: '',
  hero_eyebrow: '',
  hero_primary_cta_label: 'View my work',
  hero_primary_cta_url: '/projects',
  hero_secondary_cta_label: 'Start a conversation',
  hero_secondary_cta_url: '/contact',
};

export function ProfileSettings() {
  const [form, setForm] = useState<ProfileForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/admin/profile');
        const payload = (await response.json()) as {
          data?: Record<string, unknown> | null;
          message?: string;
        };
        if (!response.ok) {
          setError(payload.message ?? 'Could not load the profile.');
          return;
        }
        if (payload.data) {
          const data = payload.data as unknown as ProfileForm;
          setForm({
            brand_name: String(data.brand_name ?? ''),
            full_name: String(data.full_name ?? ''),
            headline: String(data.headline ?? ''),
            supporting_statement: String(data.supporting_statement ?? ''),
            short_bio: String(data.short_bio ?? ''),
            full_bio: String(data.full_bio ?? ''),
            email: String(data.email ?? ''),
            phone_number: String(data.phone_number ?? ''),
            whatsapp_number: String(data.whatsapp_number ?? ''),
            call_button_label: String(data.call_button_label ?? ''),
            whatsapp_button_label: String(data.whatsapp_button_label ?? ''),
            whatsapp_preset_message: String(data.whatsapp_preset_message ?? ''),
            location: String(data.location ?? ''),
            call_button_visible: Number(data.call_button_visible) === 1,
            whatsapp_button_visible: Number(data.whatsapp_button_visible) === 1,
            profile_image_url: data.profile_image_url ?? null,
            profile_image_alt: data.profile_image_alt ?? '',
            hero_eyebrow: String(data.hero_eyebrow ?? ''),
            hero_primary_cta_label: String(data.hero_primary_cta_label ?? ''),
            hero_primary_cta_url: String(data.hero_primary_cta_url ?? ''),
            hero_secondary_cta_label: String(data.hero_secondary_cta_label ?? ''),
            hero_secondary_cta_url: String(data.hero_secondary_cta_url ?? ''),
          });
        }
      } catch {
        setError('Network error while loading the profile.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const set = (key: keyof ProfileForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    setNotice('');
    setError('');

    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          call_button_visible: form.call_button_visible ? 1 : 0,
          whatsapp_button_visible: form.whatsapp_button_visible ? 1 : 0,
        }),
      });

      const payload = (await response.json()) as {
        message?: string;
        errors?: Record<string, string>;
      };

      if (!response.ok) {
        const first = payload.errors ? Object.values(payload.errors)[0] : undefined;
        setError(first ?? payload.message ?? 'Could not save the profile.');
        return;
      }

      setNotice(payload.message ?? 'Profile saved.');
    } catch {
      setError('Network error while saving the profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card py-16 text-sm text-muted-foreground">
        <Loader2 size={16} className="animate-spin" />
        Loading profile…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Profile settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          These details appear across the public site — the header, hero, about page and contact form.
        </p>
      </header>

      {notice && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/8 px-4 py-2.5 text-sm text-emerald-600 dark:text-emerald-400">
          {notice}
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}

      <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold tracking-tight">Identity</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="brand_name">Brand name</Label>
            <Input
              id="brand_name"
              value={form.brand_name}
              onChange={(event) => set('brand_name', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(event) => set('full_name', event.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              value={form.headline}
              onChange={(event) => set('headline', event.target.value)}
            />
            <p className="text-xs text-muted-foreground">The large statement in the hero section.</p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="supporting_statement">Supporting statement</Label>
            <Textarea
              id="supporting_statement"
              rows={2}
              value={form.supporting_statement}
              onChange={(event) => set('supporting_statement', event.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="short_bio">Short bio</Label>
            <Textarea
              id="short_bio"
              rows={2}
              value={form.short_bio}
              onChange={(event) => set('short_bio', event.target.value)}
            />
            <p className="text-xs text-muted-foreground">Used in the footer and on the home page.</p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="full_bio">Full bio</Label>
            <Textarea
              id="full_bio"
              rows={7}
              value={form.full_bio}
              onChange={(event) => set('full_bio', event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Separate paragraphs with a blank line. Shown on the about page.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold tracking-tight" id="hero">Hero & landing copy</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="hero_eyebrow">Eyebrow caption</Label>
            <Input id="hero_eyebrow" value={form.hero_eyebrow} onChange={(event) => set('hero_eyebrow', event.target.value)} placeholder="Builder · Engineer · Founder" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero_primary_cta_label">Primary button label</Label>
            <Input id="hero_primary_cta_label" value={form.hero_primary_cta_label} onChange={(event) => set('hero_primary_cta_label', event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero_primary_cta_url">Primary button link</Label>
            <Input id="hero_primary_cta_url" value={form.hero_primary_cta_url} onChange={(event) => set('hero_primary_cta_url', event.target.value)} placeholder="/projects" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero_secondary_cta_label">Secondary button label</Label>
            <Input id="hero_secondary_cta_label" value={form.hero_secondary_cta_label} onChange={(event) => set('hero_secondary_cta_label', event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero_secondary_cta_url">Secondary button link</Label>
            <Input id="hero_secondary_cta_url" value={form.hero_secondary_cta_url} onChange={(event) => set('hero_secondary_cta_url', event.target.value)} placeholder="/contact" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold tracking-tight">Contact</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Public email</Label>
            <Input id="email" type="email" value={form.email} onChange={(event) => set('email', event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone number</Label>
            <Input id="phone_number" value={form.phone_number} onChange={(event) => set('phone_number', event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp_number">WhatsApp number</Label>
            <Input id="whatsapp_number" value={form.whatsapp_number} onChange={(event) => set('whatsapp_number', event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={form.location} onChange={(event) => set('location', event.target.value)} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        <h2 id="profile-image" className="font-display text-lg font-semibold tracking-tight">Profile image</h2>
        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="shrink-0">
            {form.profile_image_url ? (
              <img src={form.profile_image_url} alt={form.profile_image_alt || 'Profile photo'} className="h-32 w-32 rounded-2xl object-cover ring-1 ring-border" />
            ) : (
              <div className="grid h-32 w-32 place-items-center rounded-2xl bg-primary/10 font-display text-3xl font-bold text-primary ring-1 ring-border">
                {form.full_name ? form.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'MC'}
              </div>
            )}
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <Label htmlFor="profile_image_alt">Alt text</Label>
              <Input id="profile_image_alt" value={form.profile_image_alt ?? ''} onChange={(event) => set('profile_image_alt', event.target.value)} placeholder="Describe the photo for accessibility" className="mt-2" />
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-medium transition-colors hover:bg-accent">
                <input type="file" accept="image/*" className="sr-only" onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append('image', file);
                  formData.append('alt', form.profile_image_alt ?? '');
                  try {
                    const response = await fetch('/api/admin/profile', { method: 'POST', body: formData });
                    const payload = (await response.json()) as { url?: string; message?: string };
                    if (!response.ok) { setError(payload.message ?? 'Could not upload the image.'); return; }
                    if (payload.url) { setForm((prev) => ({ ...prev, profile_image_url: payload.url ?? null })); setNotice('Image uploaded successfully.'); }
                  } catch { setError('Network error while uploading the image.'); }
                }} />
                Upload photo
              </label>
              {form.profile_image_url && (
                <Button type="button" variant="outline" onClick={() => setForm((prev) => ({ ...prev, profile_image_url: null }))}>Remove</Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Recommended: square photo, at least 400x400px. Stored as a data URL for now.</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold tracking-tight">Floating buttons</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="space-y-4">
            <label className="flex items-center gap-2.5 text-sm">
              <input type="checkbox" className="h-4 w-4 rounded border-input accent-primary" checked={form.call_button_visible} onChange={(event) => set('call_button_visible', event.target.checked)} />
              Show the call button
            </label>
            <div className="space-y-2">
              <Label htmlFor="call_button_label">Call button label</Label>
              <Input id="call_button_label" value={form.call_button_label} onChange={(event) => set('call_button_label', event.target.value)} />
            </div>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-2.5 text-sm">
              <input type="checkbox" className="h-4 w-4 rounded border-input accent-primary" checked={form.whatsapp_button_visible} onChange={(event) => set('whatsapp_button_visible', event.target.checked)} />
              Show the WhatsApp button
            </label>
            <div className="space-y-2">
              <Label htmlFor="whatsapp_button_label">WhatsApp button label</Label>
              <Input id="whatsapp_button_label" value={form.whatsapp_button_label} onChange={(event) => set('whatsapp_button_label', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp_preset_message">Preset WhatsApp message</Label>
              <Textarea id="whatsapp_preset_message" rows={2} value={form.whatsapp_preset_message} onChange={(event) => set('whatsapp_preset_message', event.target.value)} />
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
