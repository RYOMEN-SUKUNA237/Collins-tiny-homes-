import { NextRequest, NextResponse } from 'next/server';
import {
  deleteSupportConversation,
  getSupportConversationById,
  markSupportMessagesRead,
  updateSupportConversation,
} from '@/lib/db';

type SupportStatus = 'open' | 'answered' | 'closed';

interface UpdateSupportRequest {
  status?: SupportStatus;
  markReadByAdmin?: boolean;
  markReadByVisitor?: boolean;
}

const VALID_STATUSES: SupportStatus[] = ['open', 'answered', 'closed'];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const markRead = req.nextUrl.searchParams.get('markRead');

    if (markRead === 'admin' || markRead === 'visitor') {
      await markSupportMessagesRead(id, markRead);
    }

    const conversation = await getSupportConversationById(id);
    if (!conversation) return NextResponse.json({ error: 'Support conversation not found' }, { status: 404 });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error fetching support conversation:', error);
    return NextResponse.json({ error: 'Failed to fetch support conversation' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json() as UpdateSupportRequest;

    if (data.markReadByAdmin) await markSupportMessagesRead(id, 'admin');
    if (data.markReadByVisitor) await markSupportMessagesRead(id, 'visitor');

    if (data.status !== undefined) {
      if (!VALID_STATUSES.includes(data.status)) {
        return NextResponse.json({ error: 'Invalid support status' }, { status: 400 });
      }
      await updateSupportConversation(id, { status: data.status });
    }

    const conversation = await getSupportConversationById(id);
    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error updating support conversation:', error);
    return NextResponse.json({ error: 'Failed to update support conversation' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteSupportConversation(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting support conversation:', error);
    return NextResponse.json({ error: 'Failed to delete support conversation' }, { status: 500 });
  }
}
