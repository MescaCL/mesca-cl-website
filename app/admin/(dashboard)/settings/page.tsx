'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfileSettings } from '@/components/admin/profile-settings';
import { useCurrentHash } from '@/components/admin/use-current-hash';
import { Loader2, Save, Upload, Image as LucideImage } from 'lucide-react';

type Section = 'site' | 'hero' | 'profile-image' | 'profile-details';

interface SiteSetting {
  key: string;
  value: string | null;
}

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

const EMPTY_PROFILE: ProfileForm = {
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

const EMPTY_SITE: Record<string, string | null> = {
  site_name: null,
  site_description: null,
  public_url: null,
  contact_email: null,
  seo_title: null,
  seo_description: null,
  opengraph_image: null,
  social_x_url: null,
  social_github_url: null,
  social_linkedin_url: null,
  social_email_url: null,
  default_cover_image: null,
  default_cover_alt: null,
};

async function apiJson(url: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  if (res.status === 401) {
    window.location.href = '/admin/login';
  }
  return res;
}

async function fetchJsonSafe(url: string, init?: RequestInit): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const res = await apiJson(url, init);
    const ct = res.headers.get('content-type') ?? '';
    if (!ct.includes('application/json')) {
      const text = await res.text();
      return { ok: false, error: `Server returned non-JSON response (${res.status}): ${text.slice(0, 200)}` };
    }
    const data = await res.json();
    return { ok: res.ok, data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Request failed.' };
  }
}

export default function AdminSettingsPage() {
  const [section, setSection] = useState<Section>('site');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const [siteValues, setSiteValues] = useState<Record<string, string | null>>({ ...EMPTY_SITE });
  const [profile, setProfile] = useState<ProfileForm>({ ...EMPTY_PROFILE });
  const [uploading, setUploading] = useState(false);

  const currentHash = useCurrentHash();

  const goToSite = useCallback(() => {
    setSection('site');
    window.location.hash = '';
  }, []);

  const goToHero = useCallback(() => {
    setSection('hero');
    window.location.hash = 'hero';
  }, []);

  const goToProfileImage = useCallback(() => {
    setSection('profile-image');
    window.location.hash = 'profile-image';
  }, []);

  const goToProfileDetails = useCallback(() => {
    setSection('profile-details');
    window.location.hash = 'profile-details';
  }, []);

  useEffect(() => {
    const updateSection = () => {
      const h = window.location.hash;
      if (h === '#hero') setSection('hero');
      else if (h === '#profile-image') setSection('profile-image');
      else if (h === '#profile-details') setSection('profile-details');
      else setSection('site');
    };

    updateSection();
    window.addEventListener('hashchange', updateSection);
    return () => window.removeEventListener('hashchange', updateSection);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        if (section === 'site') {
          const result = await fetchJsonSafe('/api/admin/settings');
          if (!result.ok) throw new Error(result.error ?? 'Could not load site settings.');
          const payload = result.data as { data?: SiteSetting[] };
          const map: Record<string, string | null> = { ...EMPTY_SITE };
          (payload.data ?? []).forEach((s: { key: string; value: string | null }) => {
            if (s.key in map) map[s.key] = s.value;
          });
          setSiteValues(map);
        } else if (section === 'hero' || section === 'profile-details') {
          const result = await fetchJsonSafe('/api/admin/profile');
          if (!result.ok) throw new Error(result.error ?? 'Could not load profile.');
          const payload = result.data as { data?: Record<string, unknown> };
          const d = payload.data ?? {};
          setProfile({
            brand_name: String(d.brand_name ?? ''),
            full_name: String(d.full_name ?? ''),
            headline: String(d.headline ?? ''),
            supporting_statement: String(d.supporting_statement ?? ''),
            short_bio: String(d.short_bio ?? ''),
            full_bio: String(d.full_bio ?? ''),
            email: String(d.email ?? ''),
            phone_number: String(d.phone_number ?? ''),
            whatsapp_number: String(d.whatsapp_number ?? ''),
            call_button_label: String(d.call_button_label ?? ''),
            whatsapp_button_label: String(d.whatsapp_button_label ?? ''),
            whatsapp_preset_message: String(d.whatsapp_preset_message ?? ''),
            location: String(d.location ?? ''),
            call_button_visible: Number(d.call_button_visible) === 1,
            whatsapp_button_visible: Number(d.whatsapp_button_visible) === 1,
            profile_image_url: (d.profile_image_url as string | null) ?? null,
            profile_image_alt: (d.profile_image_alt as string | null) ?? '',
            hero_eyebrow: String(d.hero_eyebrow ?? ''),
            hero_primary_cta_label: String(d.hero_primary_cta_label ?? ''),
            hero_primary_cta_url: String(d.hero_primary_cta_url ?? ''),
            hero_secondary_cta_label: String(d.hero_secondary_cta_label ?? ''),
            hero_secondary_cta_url: String(d.hero_secondary_cta_url ?? ''),
          });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [section, currentHash]);

  const saveSite = useCallback(async () => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      for (const [key, value] of Object.entries(siteValues)) {
        const result = await fetchJsonSafe('/api/admin/settings', {
          method: 'POST',
          body: JSON.stringify({ key, value, category: 'general' }),
        });
        if (!result.ok) {
          const payload = result.data as { message?: string } | undefined;
          throw new Error(payload?.message || 'Failed to save site settings.');
        }
      }
      setNotice('Site settings saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }, [siteValues]);

  const saveProfile = useCallback(async () => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await fetchJsonSafe('/api/admin/profile', {
        method: 'PUT',
        body: JSON.stringify({
          brand_name: profile.brand_name,
          full_name: profile.full_name,
          headline: profile.headline,
          supporting_statement: profile.supporting_statement,
          short_bio: profile.short_bio,
          full_bio: profile.full_bio,
          email: profile.email,
          phone_number: profile.phone_number,
          whatsapp_number: profile.whatsapp_number,
          call_button_label: profile.call_button_label,
          whatsapp_button_label: profile.whatsapp_button_label,
          whatsapp_preset_message: profile.whatsapp_preset_message,
          location: profile.location,
          call_button_visible: profile.call_button_visible ? 1 : 0,
          whatsapp_button_visible: profile.whatsapp_button_visible ? 1 : 0,
          profile_image_url: profile.profile_image_url,
          profile_image_alt: profile.profile_image_alt,
          hero_eyebrow: profile.hero_eyebrow,
          hero_primary_cta_label: profile.hero_primary_cta_label,
          hero_primary_cta_url: profile.hero_primary_cta_url,
          hero_secondary_cta_label: profile.hero_secondary_cta_label,
          hero_secondary_cta_url: profile.hero_secondary_cta_url,
        }),
      });
      if (!result.ok) {
        const payload = result.data as { message?: string } | undefined;
        throw new Error(payload?.message || 'Failed to save profile.');
      }
      setNotice('Profile saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  }, [profile]);

  const saveImage = useCallback(async () => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await fetchJsonSafe('/api/admin/profile', {
        method: 'PUT',
        body: JSON.stringify({
          profile_image_url: profile.profile_image_url,
          profile_image_alt: profile.profile_image_alt,
        }),
      });
      if (!result.ok) {
        const payload = result.data as { message?: string } | undefined;
        throw new Error(payload?.message || 'Failed to save image settings.');
      }
      setNotice('Image settings saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save image settings.');
    } finally {
      setSaving(false);
    }
  }, [profile]);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('alt', profile.profile_image_alt ?? '');
      const result = await fetchJsonSafe('/api/admin/profile', { method: 'POST', body: formData });
      if (!result.ok) {
        const payload = result.data as { message?: string } | undefined;
        throw new Error(payload?.message || 'Could not upload the image.');
      }
      const payload = result.data as { url?: string; message?: string };
      if (payload.url) {
        setProfile((prev) => ({ ...prev, profile_image_url: payload.url ?? null }));
        setNotice('Image uploaded successfully.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error while uploading the image.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = useCallback(() => {
    setProfile((prev) => ({ ...prev, profile_image_url: null, profile_image_alt: '' }));
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight">Site Settings</h1>
        <span className="text-sm text-muted-foreground">Admin panel</span>
      </div>

      <div className="flex flex-row gap-2 border-t border-border/70 pt-4">
        <button
          type="button"
          onClick={goToSite}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${section === 'site' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground'}`}
        >
          Homepage Settings
        </button>
        <button
          type="button"
          onClick={goToProfileDetails}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${section === 'profile-details' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground'}`}
        >
          Profile Details
        </button>
        <button
          type="button"
          onClick={goToProfileImage}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${section === 'profile-image' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground'}`}
        >
          Profile &amp; Photograph
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          {section === 'site' && (
            <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
              <h2 className="font-display text-lg font-bold tracking-tight">Homepage Settings</h2>
              <p className="text-sm text-muted-foreground">
                Edit the text, labels, buttons, and links shown on the public homepage.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Site name</Label>
                  <Input id="site_name" value={siteValues.site_name ?? ''} onChange={(e) => setSiteValues((prev) => ({ ...prev, site_name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site_description">Site description</Label>
                  <Input id="site_description" value={siteValues.site_description ?? ''} onChange={(e) => setSiteValues((prev) => ({ ...prev, site_description: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="public_url">Public website URL</Label>
                  <Input id="public_url" value={siteValues.public_url ?? ''} onChange={(e) => setSiteValues((prev) => ({ ...prev, public_url: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact email</Label>
                  <Input id="contact_email" type="email" value={siteValues.contact_email ?? ''} onChange={(e) => setSiteValues((prev) => ({ ...prev, contact_email: e.target.value }))} />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={saveSite} disabled={saving}>
                  {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} />}{' '}
                  Save Homepage Settings
                </Button>
              </div>
            </section>
          )}
          {section === 'hero' && (
            <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
              <h2 className="font-display text-lg font-bold tracking-tight">Hero Section</h2>
              <p className="text-sm text-muted-foreground">
                Edit the eyebrow caption, call-to-action buttons, and links shown on the public homepage hero.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="hero_eyebrow">Eyebrow caption</Label>
                  <Input id="hero_eyebrow" value={profile.hero_eyebrow} onChange={(e) => setProfile((prev) => ({ ...prev, hero_eyebrow: e.target.value }))} placeholder="Builder · Engineer · Founder" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero_primary_cta_label">Primary button label</Label>
                  <Input id="hero_primary_cta_label" value={profile.hero_primary_cta_label} onChange={(e) => setProfile((prev) => ({ ...prev, hero_primary_cta_label: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero_primary_cta_url">Primary button link</Label>
                  <Input id="hero_primary_cta_url" value={profile.hero_primary_cta_url} onChange={(e) => setProfile((prev) => ({ ...prev, hero_primary_cta_url: e.target.value }))} placeholder="/projects" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero_secondary_cta_label">Secondary button label</Label>
                  <Input id="hero_secondary_cta_label" value={profile.hero_secondary_cta_label} onChange={(e) => setProfile((prev) => ({ ...prev, hero_secondary_cta_label: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero_secondary_cta_url">Secondary button link</Label>
                  <Input id="hero_secondary_cta_url" value={profile.hero_secondary_cta_url} onChange={(e) => setProfile((prev) => ({ ...prev, hero_secondary_cta_url: e.target.value }))} placeholder="/contact" />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={saveProfile} disabled={saving}>
                  {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} />}{' '}
                  Save Hero Settings
                </Button>
              </div>
            </section>
          )}
          {section === 'profile-details' && (
            <ProfileSettings hideImageUpload />
          )}

          {section === 'profile-image' && (
            <div className="space-y-6" id="profile-image">
              <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
                <h2 className="font-display text-lg font-bold tracking-tight">Profile Photograph</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload, replace, or remove your portrait photograph.
                </p>

                <div className="mt-6 flex items-start gap-4">
                  <div className="flex flex-col items-center gap-3">
                    {profile.profile_image_url ? (
                      <>
                        <img
                          src={profile.profile_image_url}
                          alt={profile.profile_image_alt ?? 'Profile photo'}
                          className="w-32 h-32 rounded-full object-cover border border-border"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={removeImage}
                          disabled={saving || uploading}
                        >
                          Remove
                        </Button>
                      </>
                    ) : (
                      <div className="w-32 h-32 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
                        <LucideImage size={48} className="text-muted-foreground" />
                      </div>
                    )}
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <Upload size={16} />
                      {uploading ? 'Uploading...' : 'Upload photo'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                      />
                    </label>
                    {profile.profile_image_url && (
                      <p className="text-xs text-muted-foreground">
                        Recommended: square photo, at least 400x400px.
                      </p>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="profile_image_alt">Alt text</Label>
                      <Input
                        id="profile_image_alt"
                        value={profile.profile_image_alt ?? ''}
                        onChange={(e) => setProfile((prev) => ({ ...prev, profile_image_alt: e.target.value }))}
                        placeholder="Portrait photograph"
                      />
                    </div>
                    <Button onClick={saveImage} disabled={saving || uploading} className="mt-2">
                      {saving || uploading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} />}{' '}
                      Save Changes
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Stored in persistent media storage. Changes update across the site.
                </p>
              </section>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-border text-sm text-muted-foreground">
        Changes are saved to the database and take effect immediately on the public website.
      </div>
    </div>
  );
}
