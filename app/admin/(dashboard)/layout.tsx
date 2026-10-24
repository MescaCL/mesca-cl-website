import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/session';
import { AdminShell } from '@/components/admin/admin-shell';

export const dynamic = 'force-dynamic';

/**
 * Guards every page inside the `(dashboard)` route group.
 * Unauthenticated visitors are redirected to the sign-in screen.
 */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAuthenticated()) {
    redirect('/admin/login');
  }

  return <AdminShell>{children}</AdminShell>;
}
