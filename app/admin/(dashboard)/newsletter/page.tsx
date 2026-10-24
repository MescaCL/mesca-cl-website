import { getNewsletterSubscribers } from '@/lib/data';
import { getDatabase } from '@/lib/db';
import type { NewsletterSubscriber } from '@/types';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

function getSubscriberTitle(status: string | undefined): string {
  if (!status) return 'All subscribers';
  if (status === 'unsubscribed') return 'Unsubscribed';
  return `Active subscribers (${status})`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default async function AdminNewsletterPage() {
  const session = getSession();
  if (!session?.userId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700">
          <p>You must be logged in to view subscribers.</p>
        </div>
      </div>
    );
  }

  const conn = await getDatabase();
  try {
    const all = await conn.prepare('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC').all() as NewsletterSubscriber[];
    const active = await conn.prepare('SELECT COUNT(*) as count FROM newsletter_subscribers WHERE status = ?').get('active') as { count: number };
    const unsubscribed = await conn.prepare('SELECT COUNT(*) as count FROM newsletter_subscribers WHERE status = ?').get('unsubscribed') as { count: number };

    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Newsletter Subscribers</h1>
            <p className="text-sm text-gray-500">{active.count} active · {unsubscribed.count} unsubscribed</p>
          </div>
        </div>

        <div className="bg-white rounded border p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Email</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Source</th>
                <th className="text-left py-2">Subscribed</th>
                <th className="text-left py-2">Unsubscribed</th>
              </tr>
            </thead>
            <tbody>
              {all.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="py-2">{s.email}</td>
                  <td className="py-2"><span className={`px-2 py-0.5 rounded text-xs ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{s.status}</span></td>
                  <td className="py-2">{s.source ?? 'website'}</td>
                  <td className="py-2">{formatDate(s.subscribed_at)}</td>
                  <td className="py-2">{s.unsubscribed_at ? formatDate(s.unsubscribed_at) : '-'}</td>
                </tr>
              ))}
              {all.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-gray-500">No subscribers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  } finally {
    conn.close();
  }
}
