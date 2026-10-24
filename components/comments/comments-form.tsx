'use client';

import { useState } from 'react';

interface Props {
  postId: string;
  onSubmitted?: () => void;
}

export function CommentsForm({ postId, onSubmitted }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': (window as unknown as { csrfToken: string }).csrfToken },
        body: JSON.stringify({ post_id: postId, author_name: name, author_email: email, content }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? 'Failed to submit.');
      setName('');
      setEmail('');
      setContent('');
      onSubmitted?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit comment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border p-2 rounded text-sm"
        required
        maxLength={100}
      />
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-2 rounded text-sm"
        required
        maxLength={150}
      />
      <textarea
        placeholder="Your comment"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border p-2 rounded text-sm min-h-[100px]"
        required
        maxLength={5000}
      />
      <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-white rounded text-sm hover:bg-primary-dark">
        {submitting ? 'Submitting…' : 'Submit Comment'}
      </button>
    </form>
  );
}
