'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

async function fetchJsonSafe(url: string, init?: RequestInit): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const isFormData = init?.body instanceof FormData;
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (init?.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((value, key) => { headers[key] = value; });
      } else {
        Object.assign(headers, init.headers);
      }
    }
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(url, { ...init, headers });
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

interface CtaBandConfig { heading: string; description: string; }
interface FooterLink { href: string; label: string; }
interface PageMetadata { eyebrow: string; title: string; description: string; }

export default function AdminCmsSettingsPage() {
  const [ctaBand, setCtaBand] = useState<CtaBandConfig>({ heading: '', description: '' });
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);
  const [pageMeta, setPageMeta] = useState<Record<string, PageMetadata>>({});
  const [contactResponseTime, setContactResponseTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ctaRes, footerRes, blogRes, projectsRes, contactRes, journeyRes, crtRes] = await Promise.all([
        fetchJsonSafe('/api/admin/cms-content?section=cta-band'),
        fetchJsonSafe('/api/admin/cms-content?section=footer-links'),
        fetchJsonSafe('/api/admin/cms-content?section=page-metadata&page=blog'),
        fetchJsonSafe('/api/admin/cms-content?section=page-metadata&page=projects'),
        fetchJsonSafe('/api/admin/cms-content?section=page-metadata&page=contact'),
        fetchJsonSafe('/api/admin/cms-content?section=page-metadata&page=journey'),
        fetchJsonSafe('/api/admin/cms-content?section=contact-response-time'),
      ]);

      if (ctaRes.ok) setCtaBand(ctaRes.data.data ?? { heading: '', description: '' });
      if (footerRes.ok) setFooterLinks(footerRes.data.data?.links ?? []);
      if (blogRes.ok) setPageMeta((prev) => ({ ...prev, blog: blogRes.data.data ?? {} as PageMetadata }));
      if (projectsRes.ok) setPageMeta((prev) => ({ ...prev, projects: projectsRes.data.data ?? {} as PageMetadata }));
      if (contactRes.ok) setPageMeta((prev) => ({ ...prev, contact: contactRes.data.data ?? {} as PageMetadata }));
      if (journeyRes.ok) setPageMeta((prev) => ({ ...prev, journey: journeyRes.data.data ?? {} as PageMetadata }));
      if (crtRes.ok) setContactResponseTime(crtRes.data.data?.time ?? '');
    } catch {
      setError('Failed to load CMS settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const saveCtaBand = useCallback(async () => {
    setSaving('cta-band');
    setNotice('');
    setError('');
    try {
      const result = await fetchJsonSafe('/api/admin/cms-content', {
        method: 'POST',
        body: JSON.stringify({ section: 'cta-band', ...ctaBand }),
      });
      if (!result.ok) throw new Error(result.error ?? 'Failed to save CTA band.');
      setNotice('CTA band saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save CTA band.');
    } finally {
      setSaving(null);
    }
  }, [ctaBand]);

  const saveFooterLinks = useCallback(async () => {
    setSaving('footer-links');
    setNotice('');
    setError('');
    try {
      const result = await fetchJsonSafe('/api/admin/cms-content', {
        method: 'POST',
        body: JSON.stringify({ section: 'footer-links', links: footerLinks }),
      });
      if (!result.ok) throw new Error(result.error ?? 'Failed to save footer links.');
      setNotice('Footer links saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save footer links.');
    } finally {
      setSaving(null);
    }
  }, [footerLinks]);

  const savePageMeta = useCallback(async (page: string) => {
    setSaving(page);
    setNotice('');
    setError('');
    try {
      const result = await fetchJsonSafe('/api/admin/cms-content', {
        method: 'POST',
        body: JSON.stringify({ section: 'page-metadata', page, ...pageMeta[page] }),
      });
      if (!result.ok) throw new Error(result.error ?? `Failed to save ${page} metadata.`);
      setNotice(`${page} metadata saved.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : `Failed to save ${page} metadata.`);
    } finally {
      setSaving(null);
    }
  }, [pageMeta]);

  const saveContactResponseTime = useCallback(async () => {
    setSaving('contact-response-time');
    setNotice('');
    setError('');
    try {
      const result = await fetchJsonSafe('/api/admin/cms-content', {
        method: 'POST',
        body: JSON.stringify({ section: 'contact-response-time', time: contactResponseTime }),
      });
      if (!result.ok) throw new Error(result.error ?? 'Failed to save response time.');
      setNotice('Contact response time saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save response time.');
    } finally {
      setSaving(null);
    }
  }, [contactResponseTime]);

  const addFooterLink = () => {
    setFooterLinks([...footerLinks, { href: '', label: '' }]);
  };

  const removeFooterLink = (index: number) => {
    setFooterLinks(footerLinks.filter((_, i) => i !== index));
  };

  const updateFooterLink = (index: number, field: 'href' | 'label', value: string) => {
    const next = [...footerLinks];
    next[index] = { ...next[index], [field]: value };
    setFooterLinks(next);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading CMS settings…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">CMS Content Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage public-facing text content that appears across the website.
        </p>
      </div>

      {notice && <p className="text-sm text-emerald-600">{notice}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Homepage CTA Band</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cta-heading">Heading</Label>
              <Input
                id="cta-heading"
                value={ctaBand.heading}
                onChange={(e) => setCtaBand((prev) => ({ ...prev, heading: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cta-description">Description</Label>
              <Textarea
                id="cta-description"
                value={ctaBand.description}
                onChange={(e) => setCtaBand((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={saveCtaBand} disabled={saving === 'cta-band'}>
              {saving === 'cta-band' ? 'Saving…' : 'Save CTA Band'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Page Metadata (Blog, Projects, Contact, Journey)</CardTitle>
        </CardHeader>
        <CardContent>
          {['blog', 'projects', 'contact', 'journey'].map((page) => {
            const meta = pageMeta[page] ?? { eyebrow: '', title: '', description: '' };
            return (
              <div key={page} className="border-b pb-6 last:border-0 last:pb-0">
                <h3 className="font-medium">{page.charAt(0).toUpperCase() + page.slice(1)}</h3>
                <div className="grid gap-3 md:grid-cols-3 mt-3">
                  <div className="space-y-2">
                    <Label htmlFor={`meta-eyebrow-${page}`}>Eyebrow</Label>
                    <Input
                      id={`meta-eyebrow-${page}`}
                      value={meta.eyebrow}
                      onChange={(e) =>
                        setPageMeta((prev) => ({
                          ...prev,
                          [page]: { ...prev[page], eyebrow: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`meta-title-${page}`}>Title</Label>
                    <Input
                      id={`meta-title-${page}`}
                      value={meta.title}
                      onChange={(e) =>
                        setPageMeta((prev) => ({
                          ...prev,
                          [page]: { ...prev[page], title: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`meta-description-${page}`}>Description</Label>
                    <Textarea
                      id={`meta-description-${page}`}
                      value={meta.description}
                      onChange={(e) =>
                        setPageMeta((prev) => ({
                          ...prev,
                          [page]: { ...prev[page], description: e.target.value },
                        }))
                      }
                      rows={2}
                    />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    onClick={() => savePageMeta(page)}
                    disabled={saving === page}
                  >
                    {saving === page ? 'Saving…' : 'Save'}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Contact Page Response Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="contact-response-time">Response time text</Label>
            <Input
              id="contact-response-time"
              value={contactResponseTime}
              onChange={(e) => setContactResponseTime(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Displayed on the contact page under contact details.
            </p>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={saveContactResponseTime} disabled={saving === 'contact-response-time'}>
              {saving === 'contact-response-time' ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}