import { NextResponse } from 'next/server';
import { seedDb } from '@/lib/seed';

export async function POST() {
  try {
    const result = await seedDb();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seeding failed', detail: String(error) }, { status: 500 });
  }
}
