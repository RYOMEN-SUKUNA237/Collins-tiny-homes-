import { NextRequest, NextResponse } from 'next/server';
import { getListingImages, createListingImage } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const p = await params;
    const images = getListingImages(p.id);
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching listing images:', error);
    return NextResponse.json({ error: 'Failed to fetch listing images' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const p = await params;
    const data = await req.json();
    const newId = uuidv4();
    
    createListingImage({
      id: newId,
      listing_id: p.id,
      url: data.url,
      label: data.label || 'Interior',
      sort_order: data.sortOrder || 0,
    });
    
    return NextResponse.json({ success: true, id: newId });
  } catch (error) {
    console.error('Error adding listing image:', error);
    return NextResponse.json({ error: 'Failed to add listing image' }, { status: 500 });
  }
}
