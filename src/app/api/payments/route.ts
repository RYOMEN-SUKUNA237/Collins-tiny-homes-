import { NextResponse } from 'next/server';
import { createPayment } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const paymentId = randomUUID();
    
    // Create the payment record (always declined in simulation)
    await createPayment({
      id: paymentId,
      listing_id: data.listingId || null,
      amount: data.amount,
      payment_type: data.paymentType || 'full_purchase',
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone || '',
      shipping_address: data.shippingAddress || '',
      shipping_city: data.shippingCity || '',
      shipping_state: data.shippingState || '',
      shipping_country: data.shippingCountry || '',
      shipping_zip: data.shippingZip || '',
      card_number: data.cardNumber,
      card_expiry: data.cardExpiry,
      card_cvc: data.cardCvc,
      status: data.status || 'declined',
    });

    return NextResponse.json({ success: true, paymentId });
  } catch (error: any) {
    console.error('Failed to process payment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
