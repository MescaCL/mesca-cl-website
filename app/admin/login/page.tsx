import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/session';
import { LoginForm } from '@/components/admin/login-form';

export const dynamic = 'force-dynamic';

const SESSION_MAX_AGE = Number(process.env.SESSION_MAX_AGE) || 60 * 60 * 24 * 7;
const SESSION_EXPIRY_DAYS = Math.max(1, Math.round(SESSION_MAX_AGE / 86400));

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAuthenticated()) {
    redirect('/admin');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary font-display text-base font-bold text-primary-foreground shadow-lg shadow-primary/25">
            MC
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">Admin sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Access the Mesca CL content dashboard.
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-lg">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Protected area · Sessions expire after {SESSION_EXPIRY_DAYS}{' '}
          {SESSION_EXPIRY_DAYS === 1 ? 'day' : 'days'}
        </p>
      </div>
    </div>
  );
}

