import { NextRequest, NextResponse } from 'next/server';
import { getAllInquiries, createInquiry } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const filters = {
      type: searchParams.get('type') || undefined,
      status: searchParams.get('status') || undefined,
    };

    const inquiriesData = await getAllInquiries(filters);
    const inquiries = inquiriesData.map((inq: any) => ({
      ...inq,
      inquiryType: inq.inquiry_type,
      financePlan: inq.finance_plan,
      financeDownPayment: inq.finance_down_payment,
      financeMonthlyTotal: inq.finance_monthly_total,
      financeTermMonths: inq.finance_term_months,
      listingTitle: inq.listing_title,
      landTitle: inq.land_title,
    }));
    
    return NextResponse.json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const newId = uuidv4();
    
    await createInquiry({
      id: newId,
      listing_id: data.listingId || null,
      land_id: data.landId || null,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      message: data.message,
      inquiry_type: data.inquiryType,
      finance_plan: data.financePlan || null,
      finance_down_payment: data.financeDownPayment || null,
      finance_monthly_total: data.financeMonthlyTotal || null,
      finance_term_months: data.financeTermMonths || null,
      status: 'new',
    });
    
    return NextResponse.json({ success: true, id: newId });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json({ error: 'Failed to create inquiry' }, { status: 500 });
  }
}
