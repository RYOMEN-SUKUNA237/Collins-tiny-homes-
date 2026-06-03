import { NextRequest, NextResponse } from 'next/server';
import { createSupportMessage, getSupportConversationById, getSupportMessages } from '@/lib/db';
import { notifySupportMessageCreated } from '@/lib/email';

type SenderType = 'visitor' | 'admin' | 'system';

interface CreateSupportMessageRequest {
  senderType?: SenderType;
  senderName?: string;
  body?: string;
}

const VALID_SENDERS: SenderType[] = ['visitor', 'admin', 'system'];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const messages = await getSupportMessages(id);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching support messages:', error);
    return NextResponse.json({ error: 'Failed to fetch support messages' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conversation = await getSupportConversationById(id);
    if (!conversation) return NextResponse.json({ error: 'Support conversation not found' }, { status: 404 });

    const data = await req.json() as CreateSupportMessageRequest;
    const senderType = data.senderType || 'visitor';
    const body = data.body?.trim();

    if (!VALID_SENDERS.includes(senderType)) {
      return NextResponse.json({ error: 'Invalid sender type' }, { status: 400 });
    }

    if (!body) {
      return NextResponse.json({ error: 'Message body is required' }, { status: 400 });
    }

    const message = await createSupportMessage({
      conversation_id: id,
      sender_type: senderType,
      sender_name: data.senderName?.trim()?.slice(0, 80) || (senderType === 'admin' ? 'Collins Support' : conversation.visitor_name),
      body: body.slice(0, 1600),
      read_by_admin: senderType === 'admin',
      read_by_visitor: senderType === 'visitor',
    });

    // Notify admin asynchronously if it's from visitor
    if (senderType === 'visitor') {
      notifySupportMessageCreated(conversation, {
        sender_type: senderType,
        sender_name: message.sender_name,
        body: message.body,
      }).catch((err) => console.error('Failed to notify admin of support message via email:', err));
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error creating support message:', error);
    return NextResponse.json({ error: 'Failed to create support message' }, { status: 500 });
  }
}
