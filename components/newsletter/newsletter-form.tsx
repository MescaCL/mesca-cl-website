'use client';

import { useState } from 'react';

export function NewsletterForm({ source = 'website' }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': (window as unknown as { csrfToken: string }).csrfToken },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? 'Failed to subscribe.');
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
