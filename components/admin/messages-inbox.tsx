'use client';

import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Inbox, Loader2, Mail, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { classNames } from '@/components/ui/utils';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  category: string | null;
  message: string;
  status: string;
  submitted_at: string;
}

const STATUS_FILTERS = ['all', 'new', 'read', 'replied', 'archived'];

export function MessagesInbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = filter === 'all' ? '' : `?status=${filter}`;
      const response = await fetch(`/api/admin/contacts${query}`);
      const payload = (await response.json()) as { data?: Message[]; message?: string };
      if (!response.ok) {
        setError(payload.message ?? 'Could not load messages.');
        return;
      }
      setMessages(payload.data ?? []);
    } catch {
      setError('Network error while loading messages.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/admin/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) return;
      setMessages((prev) =>
        prev.map((message) => (message.id === id ? { ...message, status } : message))
      );
      setSelected((current) =>
        current && current.id === id ? { ...current, status } : current
      );
    } catch {
      setError('Network error while updating the message.');
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this message permanently?')) return;
    try {
      const response = await fetch(`/api/admin/contacts?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!response.ok) return;
      setMessages((prev) => prev.filter((message) => message.id !== id));
      setSelected(null);
    } catch {
      setError('Network error while deleting the message.');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Messages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                setFilter(status);
                setSelected(null);
              }}
              className={classNames(
                'rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                filter === status
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </header>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card py-16 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          Loading…
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
          <Inbox className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">No messages in this view.</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm lg:col-span-2">
            <ul className="divide-y divide-border/60">
              {messages.map((message) => (
                <li key={message.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(message);
                      if (message.status === 'new') void updateStatus(message.id, 'read');
                    }}
                    className={classNames(
                      'w-full px-5 py-4 text-left transition-colors hover:bg-muted/40',
                      selected?.id === message.id && 'bg-primary/5'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{message.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {message.subject ?? message.email}
                        </p>
                      </div>
                      {message.status === 'new' && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                      {message.message}
                    </p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-muted-foreground/70">
                      {format(new Date(message.submitted_at), 'd MMM yyyy, HH:mm')}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm lg:col-span-3">
            {!selected ? (
              <div className="flex h-full min-h-[18rem] flex-col items-center justify-center text-center">
                <Mail className="h-9 w-9 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">Select a message to read it.</p>
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold tracking-tight">
                      {selected.subject ?? 'No subject'}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selected.name} ·{' '}
                      <a href={`mailto:${selected.email}`} className="text-primary hover:underline">
                        {selected.email}
                      </a>
                    </p>
                    {selected.category && (
                      <span className="mt-2 inline-block rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                        {selected.category}
                      </span>
                    )}
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => remove(selected.id)}>
                    <Trash2 size={14} />
                    Delete
                  </Button>
                </div>

                <p className="mt-6 whitespace-pre-wrap rounded-xl border border-border/70 bg-muted/30 p-4 text-sm leading-relaxed text-foreground/90">
                  {selected.message}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {['new', 'read', 'replied', 'archived'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => updateStatus(selected.id, status)}
                      className={classNames(
                        'rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                        selected.status === status
                          ? 'border-primary/40 bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      Mark as {status}
                    </button>
                  ))}
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent(
                      `Re: ${selected.subject ?? 'Your message'}`
                    )}`}
                    className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Reply by email
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
