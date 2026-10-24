import { getDatabase } from '@/lib/db';
import type { Comment } from '@/types';
import { getSession } from '@/lib/session';
import { CommentsList } from '@/components/comments/comments-list';
import { CommentsForm } from '@/components/comments/comments-form';

export const dynamic = 'force-dynamic';

function getPostId(): string | null {
  return null;
}

async function getPostTitle(postId: string | null): Promise<string> {
  if (!postId) return 'Comments';
  const conn = await getDatabase();
  try {
    const row = await conn.prepare('SELECT title FROM posts WHERE id = ?').get(postId) as { title: string } | undefined;
    return row?.title ?? 'Comments';
  } finally {
    conn.close();
  }
}

export default async function AdminCommentsPage() {
  const session = getSession();
  if (!session?.userId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700">
          <p>You must be logged in to view comments.</p>
        </div>
      </div>
    );
  }

  const postId = getPostId();
  const postTitle = await getPostTitle(postId);

  const conn = await getDatabase();
  try {
    const comments = await conn.prepare('SELECT * FROM comments ORDER BY created_at DESC').all() as Comment[];
    const pendingCount = await conn.prepare('SELECT COUNT(*) as count FROM comments WHERE status = ?').get('pending') as { count: number };
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Comments</h1>
          <p className="text-sm text-gray-500">{postTitle} · {comments.length} total · {pendingCount.count} pending</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white rounded border p-4">
            <h2 className="text-sm font-semibold text-gray-600 mb-3">Approved comments</h2>
            <CommentsList postId={postId ?? ''} initialComments={comments.filter((c) => c.status === 'approved')} approvedOnly={true} />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded p-4">
            <h2 className="text-sm font-semibold text-amber-700 mb-3">Pending approvals</h2>
            <CommentsList postId={postId ?? ''} initialComments={comments.filter((c) => c.status === 'pending')} approvedOnly={false} />
          </div>
        </div>
      </div>
    );
  } finally {
    conn.close();
  }
}
