import type { Metadata } from 'next';
import SupportInbox from '@/components/admin/SupportInbox';
import { getAllSupportConversations } from '@/lib/db';
import type { SupportConversation } from '@/lib/types';

export const metadata: Metadata = { title: 'Support Inbox | Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminSupportPage() {
  let conversations: SupportConversation[] = [];
  try {
    conversations = await getAllSupportConversations();
  } catch (err) {
    console.warn('Failed to load support conversations:', err);
    conversations = [];
  }

  const openCount = conversations.filter(c => c.status === 'open').length;
  const unreadCount = conversations.reduce(
    (total, c) => total + (c.unread_count || 0),
    0,
  );

  return (
    <>
      {/* Page header — responsive padding, hidden on xs so inbox has full height */}
      <header className="sticky top-0 z-40 flex shrink-0 items-center justify-between border-b border-sage/10 bg-white/95 px-4 py-3 backdrop-blur-sm sm:px-8 sm:py-4">
        <div>
          <h1 className="font-serif text-xl font-semibold text-charcoal sm:text-2xl">
            Support Inbox
          </h1>
          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-charcoal-light">
            <span>{conversations.length} total</span>
            {openCount > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                {openCount} open
              </span>
            )}
            {unreadCount > 0 && (
              <span className="rounded-full bg-clay/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-charcoal">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
      </header>

      {/*
        On mobile the inbox fills the remaining viewport height edge-to-edge.
        On desktop we add comfortable padding around the rounded card.
      */}
      <div className="lg:p-6">
        <SupportInbox initialConversations={conversations} />
      </div>
    </>
  );
}
