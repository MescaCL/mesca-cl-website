import { adminFetch } from '@/lib/admin-fetch';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';

interface SiteSetting {
  key: string;
  value: string | null;
}

function SettingRow({
  label,
  key,
  value,
  onChange,
  placeholder,
  type = 'text',
  showClear = true,
}: {
  label: string;
  key: string;
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'url';
  showClear?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={`setting-${key}`} className="text-xs font-medium">{label}</Label>
        {showClear && value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)} aria-label={`Clear ${label}`}>
            <Trash2 size={13} />
          </Button>
        )}
      </div>
      <Input
        id={`setting-${key}`}
        value={value ?? ''}
        placeholder={placeholder}
        type={type}
        onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
      />
    </div>
  );
}

export function GeneralSettings({ get, save }: { get: (k: string) => string | null; save: (k: string, v: string | null) => void }) {
  return (
    <div className="space-y-3">
      <SettingRow label="Website / Site name" key="site_name" value={get('site_name')} onChange={(v) => save('site_name', v)} placeholder="Mesca CL" />
      <SettingRow label="Site description" key="site_description" value={get('site_description')} onChange={(v) => save('site_description', v)} placeholder="A personal brand and writing site." />
      <SettingRow label="Public website URL" key="public_url" value={get('public_url')} onChange={(v) => save('public_url', v)} placeholder="https://mesca-cl.com" type="url" />
      <SettingRow label="Public contact email" key="contact_email" value={get('contact_email')} onChange={(v) => save('contact_email', v)} placeholder="hello@mesca-cl.com" type="email" />
    </div>
  );
}

export function HomepageSettings({ get, save }: { get: (k: string) => string | null; save: (k: string, v: string | null) => void }) {
  return (
    <div className="space-y-3">
      <SettingRow label="Hero eyebrow" key="hero_eyebrow" value={get('hero_eyebrow')} onChange={(v) => save('hero_eyebrow', v)} placeholder="Open to conversations" />
      <SettingRow label="Hero primary heading" key="hero_primary_cta_label" value={get('hero_primary_cta_label')} onChange={(v) => save('hero_primary_cta_label', v)} placeholder="Have an idea worth building?" />
      <SettingRow label="Hero primary CTA URL" key="hero_primary_cta_url" value={get('hero_primary_cta_url')} onChange={(v) => save('hero_primary_cta_url', v)} placeholder="/projects" />
      <SettingRow label="Hero secondary button label" key="hero_secondary_cta_label" value={get('hero_secondary_cta_label')} onChange={(v) => save('hero_secondary_cta_label', v)} placeholder="Let's talk" />
      <SettingRow label="Hero secondary CTA URL" key="hero_secondary_cta_url" value={get('hero_secondary_cta_url')} onChange={(v) => save('hero_secondary_cta_url', v)} placeholder="/contact" />
      <SettingRow label="Hero secondary email" key="hero_secondary_email" value={get('hero_secondary_email')} onChange={(v) => save('hero_secondary_email', v)} placeholder="contact@mesca-cl.com" type="email" />
    </div>
  );
}
export function MetadataSettings({ get, save }: { get: (k: string) => string | null; save: (k: string, v: string | null) => void }) {
  return (
    <div className="space-y-3">
      <SettingRow label="Default SEO title" key="seo_title" value={get('seo_title')} onChange={(v) => save('seo_title', v)} placeholder="Mesca CL — Engineer & builder" />
      <SettingRow label="Default SEO description" key="seo_description" value={get('seo_description')} onChange={(v) => save('seo_description', v)} placeholder="Website and writing by Mesca CL." />
      <SettingRow label="Social sharing image" key="opengraph_image" value={get('opengraph_image')} onChange={(v) => save('opengraph_image', v)} placeholder="https://mesca-cl.com/og.png" type="url" />
    </div>
  );
}

export function SocialSettings({ get, save }: { get: (k: string) => string | null; save: (k: string, v: string | null) => void }) {
  return (
    <div className="space-y-3">
      <SettingRow label="Twitter / X URL" key="social_x_url" value={get('social_x_url')} onChange={(v) => save('social_x_url', v)} placeholder="https://x.com/mescacl" type="url" />
      <SettingRow label="GitHub URL" key="social_github_url" value={get('social_github_url')} onChange={(v) => save('social_github_url', v)} placeholder="https://github.com/mescacl" type="url" />
      <SettingRow label="LinkedIn URL" key="social_linkedin_url" value={get('social_linkedin_url')} onChange={(v) => save('social_linkedin_url', v)} placeholder="https://linkedin.com/in/mescacl" type="url" />
      <SettingRow label="Email URL" key="social_email_url" value={get('social_email_url')} onChange={(v) => save('social_email_url', v)} placeholder="mailto:mescacl@gmail.com" />
    </div>
  );
}

export function MediaSettings({ get, save }: { get: (k: string) => string | null; save: (k: string, v: string | null) => void }) {
  return (
    <div className="space-y-3">
      <SettingRow label="Default cover image" key="default_cover_image" value={get('default_cover_image')} onChange={(v) => save('default_cover_image', v)} placeholder="URL to an image" type="url" />
      <SettingRow label="Default alt text" key="default_cover_alt" value={get('default_cover_alt')} onChange={(v) => save('default_cover_alt', v)} placeholder="Default cover image" />
    </div>
  );
}

export function SecuritySettings() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
        <ShieldCheck size={16} className="text-primary" />
        <div className="text-sm">
          <span className="block font-medium">CSRF protection</span>
          <span className="text-muted-foreground">Enabled on admin forms.</span>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
        <ShieldCheck size={16} className="text-primary" />
        <div className="text-sm">
          <span className="block font-medium">Admin auth</span>
          <span className="text-muted-foreground">Session + JWT, rate limited.</span>
        </div>
      </div>
    </div>
  );
}


