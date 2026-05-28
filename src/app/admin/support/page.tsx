import type { Metadata } from 'next';
import SupportInbox from '@/components/admin/SupportInbox';
import { getAllSupportConversations } from '@/lib/db';

export const metadata: Metadata = { title: 'Support Inbox | Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminSupportPage() {
  const conversations = await getAllSupportConversations();
  const openCount = conversations.filter(conversation => conversation.status === 'open').length;
  const unreadCount = conversations.reduce((total, conversation) => total + (conversation.unread_count || 0), 0);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-sage/10 bg-white/90 px-8 py-4 backdrop-blur-sm">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-charcoal">Support Inbox</h1>
          <p className="mt-0.5 text-xs text-charcoal-light">
            {conversations.length} total conversations
            {openCount > 0 && (
              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                {openCount} open
              </span>
            )}
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-clay/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-charcoal">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
      </header>

      <div className="p-8">
        <SupportInbox initialConversations={conversations} />
      </div>
    </>
  );
}
