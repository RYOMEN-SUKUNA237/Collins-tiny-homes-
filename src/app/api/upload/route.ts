import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `File type "${file.type}" not allowed. Use JPEG, PNG, WebP, or GIF.` }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `File exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB).` }, { status: 400 });
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 50);
    const filename = `${uniqueSuffix}-${safeName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error } = await supabase.storage
      .from('listing-images')
      .upload(`public/${filename}`, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json({ error: 'Failed to upload image to storage' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('listing-images')
      .getPublicUrl(`public/${filename}`);

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
