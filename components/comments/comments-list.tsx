'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Comment } from '@/types';

interface Props {
  postId: string;
  initialComments: Comment[];
  approvedOnly: boolean;
}

const STATUS_LABEL: Record<string, string> = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
};

export function CommentsList({ postId, initialComments, approvedOnly }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (approvedOnly) params.set('status', 'approved');
      params.set('post_id', postId);
      const res = await fetch(`/api/admin/comments?${params.toString()}`, {
        cache: 'no-store',
        headers: { 'x-csrf-token': (window as unknown as { csrfToken: string }).csrfToken },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'Failed to load comments.');
      }
      const data = await res.json();
      setComments(data.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load comments.');
    } finally {
      setLoading(false);
    }
  }, [postId, approvedOnly]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const approve = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/comments`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': (window as unknown as { csrfToken: string }).csrfToken },
        body: JSON.stringify({ id, status: 'approved' }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'Failed to approve.');
      }
      await fetchComments();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to approve comment.');
    } finally {
      setLoading(false);
    }
  };

  const reject = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/comments`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': (window as unknown as { csrfToken: string }).csrfToken },
        body: JSON.stringify({ id, status: 'rejected' }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'Failed to reject.');
      }
      await fetchComments();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reject comment.');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/comments?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-csrf-token': (window as unknown as { csrfToken: string }).csrfToken },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'Failed to delete.');
      }
      await fetchComments();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete comment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Comments ({comments.length})</h3>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      {loading && <p className="text-sm text-gray-500">Loading…</p>}
      {!loading && comments.length === 0 && <p className="text-sm text-gray-500">No comments yet.</p>}
      <ul className="space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="border p-3 rounded bg-white">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-sm">{c.author_name}</p>
                <p className="text-xs text-gray-500">{c.created_at}</p>
              </div>
              <span className="text-xs text-gray-400">{STATUS_LABEL[c.status]}</span>
            </div>
            <p className="mt-1 text-sm">{c.content}</p>
            {approvedOnly && c.status === 'pending' && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => approve(c.id)}
                  disabled={loading}
                  className="text-xs text-green-700 hover:underline"
                >
                  Approve
                </button>
                <button
                  onClick={() => reject(c.id)}
                  disabled={loading}
                  className="text-xs text-red-600 hover:underline"
                >
                  Reject
                </button>
                <button
                  onClick={() => remove(c.id)}
                  disabled={loading}
                  className="text-xs text-gray-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
