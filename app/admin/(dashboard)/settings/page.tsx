'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, Save, Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Section = 'site' | 'hero' | 'profile-image';

interface SiteSetting {
  key: string;
  value: string | null;
}

interface ProfileForm {
  brand_name: string;
  hero_eyebrow: string;
  hero_primary_cta_label: string;
  hero_primary_cta_url: string;
  hero_secondary_cta_label: string;
  hero_secondary_cta_url: string;
  hero_secondary_email: string;
  profile_image_url: string | null;
  profile_image_alt: string;
}

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

const EMPTY_PROFILE: ProfileForm = {
  brand_name: '',
  hero_eyebrow: '',
  hero_primary_cta_label: '',
  hero_primary_cta_url: '',
  hero_secondary_cta_label: '',
  hero_secondary_cta_url: '',
  hero_secondary_email: '',
  profile_image_url: null,
  profile_image_alt: '',
};

async function apiJson(url: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 401) {
    window.location.href = '/admin/login';
  }
  return res;
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

  useEffect(() => {
    const updateSection = () => {
      const h = window.location.hash;
      if (h === '#hero') setSection('hero');
      else if (h === '#profile-image') setSection('profile-image');
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
          const res = await apiJson('/api/admin/settings');
          if (!res.ok) throw new Error('Could not load site settings.');
          const payload = (await res.json()) as { data?: SiteSetting[] };
          const map: Record<string, string | null> = { ...EMPTY_SITE };
          (payload.data ?? []).forEach((s: { key: string; value: string | null }) => {
            if (s.key in map) map[s.key] = s.value;
          });
          setSiteValues(map);
        } else {
          const res = await apiJson('/api/admin/profile');
          if (!res.ok) throw new Error('Could not load profile.');
          const payload = (await res.json()) as { data?: Record<string, unknown> };
          const d = payload.data ?? {};
          setProfile({
            brand_name: String(d.brand_name ?? ''),
            hero_eyebrow: String(d.hero_eyebrow ?? ''),
            hero_primary_cta_label: String(d.hero_primary_cta_label ?? ''),
            hero_primary_cta_url: String(d.hero_primary_cta_url ?? ''),
            hero_secondary_cta_label: String(d.hero_secondary_cta_label ?? ''),
            hero_secondary_cta_url: String(d.hero_secondary_cta_url ?? ''),
            hero_secondary_email: String(d.hero_secondary_email ?? ''),
            profile_image_url: (d.profile_image_url as string | null) ?? null,
            profile_image_alt: String(d.profile_image_alt ?? ''),
          });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [section]);

  const saveSite = useCallback(async () => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      for (const [key, value] of Object.entries(siteValues)) {
        const res = await apiJson('/api/admin/settings', {
          method: 'POST',
          body: JSON.stringify({ key, value, category: 'general' }),
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({ message: 'Save failed' }));
          throw new Error(payload.message || 'Failed to save site settings.');
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
      const res = await apiJson('/api/admin/profile', {
        method: 'PUT',
        body: JSON.stringify({
          hero_eyebrow: profile.hero_eyebrow,
          hero_primary_cta_label: profile.hero_primary_cta_label,
          hero_primary_cta_url: profile.hero_primary_cta_url,
          hero_secondary_cta_label: profile.hero_secondary_cta_label,
          hero_secondary_cta_url: profile.hero_secondary_cta_url,
          hero_secondary_email: profile.hero_secondary_email,
          profile_image_url: profile.profile_image_url,
          profile_image_alt: profile.profile_image_alt,
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({ message: 'Save failed' }));
        throw new Error(payload.message || 'Failed to save profile.');
      }
      setNotice('Profile saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }, [profile]);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return;
    }
    const MAX_BYTES = 2 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setError('Image must be 2 MB or smaller.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('alt', profile.profile_image_alt ?? file.name);
      const res = await fetch('/api/admin/profile', { method: 'POST', body: formData });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(payload.message || 'Failed to upload image.');
      }
      const payload = await res.json();
      if (payload.url) {
        setProfile((prev) => ({ ...prev, profile_image_url: payload.url }));
        setNotice('Image uploaded successfully.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await apiJson('/api/admin/profile', {
        method: 'PUT',
        body: JSON.stringify({ profile_image_url: null, profile_image_alt: null }),
      });
      if (!res.ok) throw new Error('Failed to remove image.');
      setProfile((prev) => ({ ...prev, profile_image_url: null, profile_image_alt: '' }));
      setNotice('Image removed.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove image.');
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="font-display text-2xl font-bold tracking-tight">Site Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage global and homepage settings that drive the public website.
          </p>
        </div>
        <nav className="flex gap-3">
          <Button
            variant={section === 'site' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { window.location.hash = ''; setSection('site'); }}
          >
            Site Settings
          </Button>
          <Button
            variant={section === 'hero' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { window.location.hash = 'hero'; setSection('hero'); }}
          >
            Edit Homepage
          </Button>
          <Button
            variant={section === 'profile-image' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { window.location.hash = 'profile-image'; setSection('profile-image'); }}
          >
            Profile & Photograph
          </Button>
        </nav>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {notice && (
        <div className="rounded-xl border border-border/80 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          {notice}
        </div>
      )}

      {section === 'site' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <Label>Site name</Label>
            <Input
              value={siteValues.site_name ?? ''}
              onChange={(e) => setSiteValues((prev) => ({ ...prev, site_name: e.target.value || null }))}
              placeholder="Mesca CL"
            />
          </div>
          <div className="space-y-4">
            <Label>Site description</Label>
            <Textarea
              value={siteValues.site_description ?? ''}
              onChange={(e) => setSiteValues((prev) => ({ ...prev, site_description: e.target.value || null }))}
              placeholder="A personal brand and writing site."
            />
          </div>
          <div className="space-y-4">
            <Label>Public website URL</Label>
            <Input
              type="url"
              value={siteValues.public_url ?? ''}
              onChange={(e) => setSiteValues((prev) => ({ ...prev, public_url: e.target.value || null }))}
              placeholder="https://mesca-cl.com"
            />
          </div>
          <div className="space-y-4">
            <Label>Public contact email</Label>
            <Input
              type="email"
              value={siteValues.contact_email ?? ''}
              onChange={(e) => setSiteValues((prev) => ({ ...prev, contact_email: e.target.value || null }))}
              placeholder="hello@mesca-cl.com"
            />
          </div>
          <div className="space-y-4">
            <Label>Default SEO title</Label>
            <Input
              value={siteValues.seo_title ?? ''}
              onChange={(e) => setSiteValues((prev) => ({ ...prev, seo_title: e.target.value || null }))}
              placeholder="Mesca CL — Engineer & builder"
            />
          </div>
          <div className="space-y-4">
            <Label>Default SEO description</Label>
            <Textarea
              value={siteValues.seo_description ?? ''}
              onChange={(e) => setSiteValues((prev) => ({ ...prev, seo_description: e.target.value || null }))}
              placeholder="Website and writing by Mesca CL."
            />
          </div>
          <div className="space-y-4">
            <Label>Social sharing image</Label>
            <Input
              type="url"
              value={siteValues.opengraph_image ?? ''}
              onChange={(e) => setSiteValues((prev) => ({ ...prev, opengraph_image: e.target.value || null }))}
              placeholder="https://mesca-cl.com/og.png"
            />
          </div>
          <div className="space-y-4">
            <Label>Twitter / X URL</Label>
            <Input
              type="url"
              value={siteValues.social_x_url ?? ''}
              onChange={(e) => setSiteValues((prev) => ({ ...prev, social_x_url: e.target.value || null }))}
              placeholder="https://x.com/mescacl"
            />
          </div>
          <div className="space-y-4">
            <Label>GitHub URL</Label>
            <Input
              type="url"
              value={siteValues.social_github_url ?? ''}
              onChange={(e) => setSiteValues((prev) => ({ ...prev, social_github_url: e.target.value || null }))}
              placeholder="https://github.com/mescacl"
            />
          </div>
          <div className="space-y-4">
            <Label>LinkedIn URL</Label>
            <Input
              type="url"
              value={siteValues.social_linkedin_url ?? ''}
              onChange={(e) => setSiteValues((prev) => ({ ...prev, social_linkedin_url: e.target.value || null }))}
              placeholder="https://linkedin.com/in/mescacl"
            />
          </div>
          <div className="space-y-4">
            <Label>Email URL</Label>
            <Input
              type="email"
              value={siteValues.social_email_url ?? ''}
              onChange={(e) => setSiteValues((prev) => ({ ...prev, social_email_url: e.target.value || null }))}
              placeholder="mailto:mescacl@gmail.com"
            />
          </div>
          <div className="space-y-4">
            <Label>Default cover image</Label>
            <Input
              type="url"
              value={siteValues.default_cover_image ?? ''}
              onChange={(e) => setSiteValues((prev) => ({ ...prev, default_cover_image: e.target.value || null }))}
              placeholder="URL to an image"
            />
          </div>
          <div className="space-y-4">
            <Label>Default alt text</Label>
            <Input
              value={siteValues.default_cover_alt ?? ''}
              onChange={(e) => setSiteValues((prev) => ({ ...prev, default_cover_alt: e.target.value || null }))}
              placeholder="Default cover image"
            />
          </div>
          <Button onClick={saveSite} disabled={saving} className="mt-4">
            {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} />}{' '}
            Save Site Settings
          </Button>
        </div>
      )}

      {section === 'hero' && (
        <div className="grid gap-4 lg:grid-cols-2" id="hero">
          <div className="space-y-4">
            <Label>Hero eyebrow</Label>
            <Input
              value={profile.hero_eyebrow}
              onChange={(e) => setProfile((prev) => ({ ...prev, hero_eyebrow: e.target.value }))}
              placeholder="Open to conversations"
            />
          </div>
          <div className="space-y-4">
            <Label>Hero primary heading</Label>
            <Input
              value={profile.hero_primary_cta_label}
              onChange={(e) => setProfile((prev) => ({ ...prev, hero_primary_cta_label: e.target.value }))}
              placeholder="Have an idea worth building?"
            />
          </div>
          <div className="space-y-4">
            <Label>Hero primary CTA URL</Label>
            <Input
              type="url"
              value={profile.hero_primary_cta_url}
              onChange={(e) => setProfile((prev) => ({ ...prev, hero_primary_cta_url: e.target.value }))}
              placeholder="/projects"
            />
          </div>
          <div className="space-y-4">
            <Label>Hero secondary button label</Label>
            <Input
              value={profile.hero_secondary_cta_label}
              onChange={(e) => setProfile((prev) => ({ ...prev, hero_secondary_cta_label: e.target.value }))}
              placeholder="Let's talk"
            />
          </div>
          <div className="space-y-4">
            <Label>Hero secondary CTA URL</Label>
            <Input
              type="url"
              value={profile.hero_secondary_cta_url}
              onChange={(e) => setProfile((prev) => ({ ...prev, hero_secondary_cta_url: e.target.value }))}
              placeholder="/contact"
            />
          </div>
          <div className="space-y-4">
            <Label>Hero secondary email</Label>
            <Input
              type="email"
              value={profile.hero_secondary_email}
              onChange={(e) => setProfile((prev) => ({ ...prev, hero_secondary_email: e.target.value }))}
              placeholder="contact@mesca-cl.com"
            />
          </div>
          <Button onClick={saveProfile} disabled={saving} className="mt-4">
            {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} />}{' '}
            Save Homepage Settings
          </Button>
        </div>
      )}

      {section === 'profile-image' && (
        <div className="space-y-6" id="profile-image">
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
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
                      onClick={handleRemoveImage}
                      disabled={saving}
                    >
                      Remove
                    </Button>
                  </>
                ) : (
                  <div className="w-32 h-32 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
                    <Image size={48} className="text-muted-foreground" />
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
                      if (file) {
                        void handleImageUpload(file);
                      }
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
                    value={profile.profile_image_alt}
                    onChange={(e) => setProfile((prev) => ({ ...prev, profile_image_alt: e.target.value }))}
                    placeholder="Portrait photograph"
                  />
                </div>
                <Button onClick={saveProfile} disabled={saving || uploading} className="mt-2">
                  {saving || uploading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} />}{' '}
                  Save Changes
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Stored in persistent media storage. Changes update across the site.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-border text-sm text-muted-foreground">
        Changes are saved to the database and take effect immediately on the public website.
      </div>
    </div>
  );
}
