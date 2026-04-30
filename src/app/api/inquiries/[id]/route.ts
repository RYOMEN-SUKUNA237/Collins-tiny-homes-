import { NextRequest, NextResponse } from 'next/server';
import { getDb, updateInquiry, deleteInquiry } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { supabase } = require('@/lib/db');
    const { data: inq } = await supabase.from('inquiries').select('*, listings(title), lands(title)').eq('id', id).single();
    
    if (!inq) return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    return NextResponse.json({
      ...inq,
      inquiryType: inq.inquiry_type,
      financePlan: inq.finance_plan,
      financeDownPayment: inq.finance_down_payment,
      financeMonthlyTotal: inq.finance_monthly_total,
      financeTermMonths: inq.finance_term_months,
      listingTitle: inq.listings?.title,
      landTitle: inq.lands?.title,
    });
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    return NextResponse.json({ error: 'Failed to fetch inquiry' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();
    const dbData: Record<string, any> = {};
    if (data.status !== undefined) dbData.status = data.status;
    if (data.name !== undefined) dbData.name = data.name;
    if (data.email !== undefined) dbData.email = data.email;
    if (data.phone !== undefined) dbData.phone = data.phone;
    if (data.message !== undefined) dbData.message = data.message;

    if (Object.keys(dbData).length > 0) await updateInquiry(id, dbData);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteInquiry(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 });
  }
}
