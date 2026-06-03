import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import {
  createSupportConversation,
  createSupportMessage,
  getAllSupportConversations,
  getSupportConversationById,
  supabase,
} from '@/lib/db';
import { notifySupportMessageCreated } from '@/lib/email';

interface StartSupportRequest {
  sessionId?: string;
  visitorName?: string;
  visitorEmail?: string | null;
  subject?: string;
  initialMessage?: string;
}

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId');

    if (sessionId) {
      const { data, error } = await supabase
        .from('support_conversations')
        .select('id')
        .eq('session_id', sessionId)
        .order('last_message_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return NextResponse.json(null);
      const conversation = await getSupportConversationById(data.id);
      return NextResponse.json(conversation);
    }

    const conversations = await getAllSupportConversations();
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching support conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch support conversations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json() as StartSupportRequest;
    const visitorName = data.visitorName?.trim();
    const initialMessage = data.initialMessage?.trim();

    if (!visitorName || !initialMessage) {
      return NextResponse.json({ error: 'Name and message are required' }, { status: 400 });
    }

    const conversation = await createSupportConversation({
      session_id: data.sessionId || uuidv4(),
      visitor_name: visitorName.slice(0, 80),
      visitor_email: data.visitorEmail?.trim() ? data.visitorEmail.trim().slice(0, 160) : null,
      subject: (data.subject?.trim() || 'General support').slice(0, 120),
      status: 'open',
      last_message_at: new Date().toISOString(),
    });

    await createSupportMessage({
      conversation_id: conversation.id,
      sender_type: 'visitor',
      sender_name: visitorName.slice(0, 80),
      body: initialMessage.slice(0, 1200),
      read_by_admin: false,
      read_by_visitor: true,
    });

    // Notify admin of the new support conversation asynchronously
    notifySupportMessageCreated(
      {
        visitor_name: visitorName,
        visitor_email: data.visitorEmail || null,
        subject: data.subject || 'General support',
      },
      {
        sender_type: 'visitor',
        sender_name: visitorName,
        body: initialMessage,
      }
    ).catch((err) => console.error('Failed to notify admin of support chat via email:', err));

    const fullConversation = await getSupportConversationById(conversation.id);
    return NextResponse.json(fullConversation, { status: 201 });
  } catch (error) {
    console.error('Error creating support conversation:', error);
    return NextResponse.json({ error: 'Failed to create support conversation' }, { status: 500 });
  }
}
