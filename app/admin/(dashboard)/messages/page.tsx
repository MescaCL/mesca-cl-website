import { MessagesInbox } from '@/components/admin/messages-inbox';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Messages' };

export default async function AdminMessagesPage() {
  return <MessagesInbox />;
}
