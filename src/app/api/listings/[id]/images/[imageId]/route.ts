import { NextRequest, NextResponse } from 'next/server';
import { updateListingImage, deleteListingImage } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const p = await params;
    const data = await req.json();
    
    updateListingImage(p.imageId, {
      label: data.label,
      sort_order: data.sortOrder,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating listing image:', error);
    return NextResponse.json({ error: 'Failed to update listing image' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const p = await params;
    deleteListingImage(p.imageId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting listing image:', error);
    return NextResponse.json({ error: 'Failed to delete listing image' }, { status: 500 });
  }
}
