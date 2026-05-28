import { NextRequest, NextResponse } from 'next/server';
import { seedDb } from '@/lib/seed';

export async function POST(req: NextRequest) {
  try {
    let reset = false;
    try {
      const body = await req.json();
      reset = !!body.reset;
    } catch {
      // Empty or non-JSON body defaults to false
    }

    const result = await seedDb({ reset });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seeding failed', detail: String(error) }, { status: 500 });
  }
}
