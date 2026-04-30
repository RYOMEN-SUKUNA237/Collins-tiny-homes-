import { NextRequest, NextResponse } from 'next/server';
import { getAllSettings, upsertSetting } from '@/lib/db';

export async function GET() {
  try {
    const settings = await getAllSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        await upsertSetting(key, value);
      }
    }
    return NextResponse.json({ success: true, settings: await getAllSettings() });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
