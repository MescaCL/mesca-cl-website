'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Pencil, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResourceForm, type FieldDef } from '@/components/admin/resource-form';

export interface ColumnDef {
  key: string;
  label: string;
  render?: (item: Record<string, unknown>) => React.ReactNode;
}

interface AdminResourceProps {
  endpoint: string;
  fields: FieldDef[];
  columns: ColumnDef[];
  itemLabel: string;
  emptyMessage?: string;
  defaultValues?: Record<string, unknown>;
}

export function AdminResource({
  endpoint,
  fields,
  columns,
  itemLabel,
  emptyMessage = 'Nothing here yet.',
  defaultValues = {},
}: AdminResourceProps) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const singular = itemLabel.replace(/s$/, '');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(endpoint);
      const payload = (await response.json()) as {
        data?: Record<string, unknown>[];
        message?: string;
      };
      if (!response.ok) {
        setError(payload.message ?? 'Could not load data.');
        return;
      }
      setItems(payload.data ?? []);
    } catch {
      setError('Network error while loading data.');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const needle = query.toLowerCase();
    return items.filter((item) => JSON.stringify(item).toLowerCase().includes(needle));
  }, [items, query]);

  const startCreate = () => {
    setEditing({ __new: true });
    setForm({ ...defaultValues });
    setFormError('');
    setNotice('');
  };

  const startEdit = (item: Record<string, unknown>) => {
    setEditing(item);
    const next: Record<string, unknown> = {};
    fields.forEach((field) => {
      const value = item[field.name];
      next[field.name] = field.type === 'checkbox' ? Boolean(value) : (value ?? '');
    });
    setForm(next);
    setFormError('');
    setNotice('');
  };

  const cancel = () => {
    setEditing(null);
    setForm({});
    setFormError('');
  };

  const save = async () => {
    setSaving(true);
    setFormError('');

    const isNew = Boolean(editing?.__new);
    const payload = isNew ? form : { ...form, id: editing?.id };

    try {
      const response = await fetch(endpoint, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        message?: string;
        errors?: Record<string, string>;
      };

      if (!response.ok) {
        const first = result.errors ? Object.values(result.errors)[0] : undefined;
        setFormError(first ?? result.message ?? 'Could not save. Please try again.');
        return;
      }

      setNotice(result.message ?? 'Saved.');
      setEditing(null);
      await load();
    } catch {
      setFormError('Network error while saving.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return;

    try {
      const response = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(result.message ?? 'Could not delete.');
        return;
      }
      setNotice(result.message ?? 'Deleted.');
      await load();
    } catch {
      setError('Network error while deleting.');
    }
  };


  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{itemLabel}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'} in the database
          </p>
        </div>
        <Button onClick={startCreate}>
          <Plus size={15} />
          New {singular}
        </Button>
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

      {editing && (
        <div className="rounded-2xl border border-primary/25 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              {editing.__new ? `New ${singular.toLowerCase()}` : `Edit ${singular.toLowerCase()}`}
            </h2>
            <button
              type="button"
              onClick={cancel}
              className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Cancel"
            >
              <X size={16} />
            </button>
          </div>

          <ResourceForm
            fields={fields}
            form={form}
            onChange={(name, value) => setForm((prev) => ({ ...prev, [name]: value }))}
          />

          {formError && (
            <p className="mt-5 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-2.5 text-sm text-destructive">
              {formError}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
            <Button variant="outline" onClick={cancel} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search…"
          className="pl-9"
          aria-label="Search"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card py-16 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border/70 bg-muted/40">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((item) => (
                  <tr key={String(item.id)} className="transition-colors hover:bg-muted/30">
                    {columns.map((column) => (
                      <td key={column.key} className="px-5 py-4 align-middle">
                        {column.render ? column.render(item) : String(item[column.key] ?? '—')}
                      </td>
                    ))}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          aria-label="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(String(item.id))}
                          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
