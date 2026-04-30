import { type NextRequest, NextResponse } from 'next/server';

// Simple pass-through middleware — Supabase auth is handled at the component level.
// When real Supabase credentials are configured, you can re-enable session refresh here.
export async function proxy(request: NextRequest) {
  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
