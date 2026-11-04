'use client';

import { useState } from 'react';

async function fetchJsonSafe(url: string, init?: RequestInit): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(url, init);
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

export function NewsletterForm({ source = 'website' }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await fetchJsonSafe('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': (window as unknown as { csrfToken: string }).csrfToken },
        body: JSON.stringify({ email, source }),
      });
      if (!result.ok) throw new Error(result.error ?? 'Failed to subscribe.');
      setEmail('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to subscribe.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 border p-2 rounded text-sm"
        required
      />
      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 bg-primary text-white rounded text-sm hover:bg-primary-dark"
      >
        {submitting ? 'Subscribing…' : 'Subscribe'}
      </button>
    </form>
  );
}
