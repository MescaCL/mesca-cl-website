import { ProfileSettings } from '@/components/admin/profile-settings';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Settings' };

export default async function AdminSettingsPage() {
  return <ProfileSettings />;
}
