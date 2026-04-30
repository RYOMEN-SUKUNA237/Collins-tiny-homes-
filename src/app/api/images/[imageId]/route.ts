import { NextRequest, NextResponse } from 'next/server';
import { deleteListingImage, deleteLandImage, supabase } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const { imageId } = await params;

    // Try listing_images first
    const { data: listingImg } = await supabase.from('listing_images').select('*').eq('id', imageId).single();
    if (listingImg) {
      await deleteListingImage(imageId);
      // Try to remove the file from disk
      if (listingImg.url?.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), 'public', listingImg.url);
        try { await unlink(filePath); } catch {}
      }
      return NextResponse.json({ success: true });
    }

    // Try land_images
    const { data: landImg } = await supabase.from('land_images').select('*').eq('id', imageId).single();
    if (landImg) {
      await deleteLandImage(imageId);
      if (landImg.url?.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), 'public', landImg.url);
        try { await unlink(filePath); } catch {}
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const { imageId } = await params;
    const { label, sort_order } = await req.json();

    const updateData: Record<string, any> = {};
    if (label !== undefined) updateData.label = label;
    if (sort_order !== undefined) updateData.sort_order = sort_order;
    if (Object.keys(updateData).length === 0) return NextResponse.json({ success: true });

    // Try listing_images
    const { data: listingImg } = await supabase.from('listing_images').select('id').eq('id', imageId).single();
    if (listingImg) {
      await supabase.from('listing_images').update(updateData).eq('id', imageId);
      return NextResponse.json({ success: true });
    }
    // Try land_images
    const { data: landImg } = await supabase.from('land_images').select('id').eq('id', imageId).single();
    if (landImg) {
      await supabase.from('land_images').update(updateData).eq('id', imageId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update image' }, { status: 500 });
  }
}
