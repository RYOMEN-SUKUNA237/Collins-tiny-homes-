import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key')
      .limit(1);

    if (error) throw error;

    return NextResponse.json({
      status: 'success',
      message: 'Supabase database pinged successfully to prevent pausing.',
      timestamp: new Date().toISOString(),
      data
    });
  } catch (err: any) {
    console.error('Keep-awake cron failed:', err);
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Unexpected database query failure'
    }, { status: 500 });
  }
}
