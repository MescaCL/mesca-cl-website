import { redirect } from 'next/navigation';
import { getSession, isAuthenticated, SESSION_MAX_AGE } from '@/lib/session';
import { getUserById } from '@/lib/auth';
import { SignOutButton } from '@/components/admin/sign-out-button';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Account security' };

export default async function AccountSecurityPage() {
  if (!isAuthenticated()) {
    redirect('/admin/login');
  }

  const session = getSession();
  const user = session ? await getUserById(session.userId) : null;

  const expiryDays = Math.max(1, Math.round(SESSION_MAX_AGE / 86400));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Account security</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your administrator session and account access.
        </p>
      </div>

      <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold tracking-tight">Signed-in account</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{user?.email ?? 'Unknown'}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <dt className="text-muted-foreground">Role</dt>
            <dd className="font-medium">{user?.role ?? 'admin'}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <dt className="text-muted-foreground">Session lifetime</dt>
            <dd className="font-medium">{expiryDays} days</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold tracking-tight">Password</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Passwords are changed with the secure interactive setup command so credentials are
          never exposed in the browser or source code:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-muted/60 p-3 text-xs">
          npm run admin:setup
        </pre>
        <p className="mt-2 text-sm text-muted-foreground">
          Running it resets the password, restores the admin role, reactivates the account, and
          revokes older sessions.
        </p>
      </section>

      <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold tracking-tight">Session</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Signing out revokes this session immediately. Expired or revoked sessions cannot access
          protected APIs.
        </p>
        <div className="mt-4">
          <SignOutButton />
        </div>
      </section>
    </div>
  );
}
