import { NextRequest, NextResponse } from 'next/server';
import { getListingImages, createListingImage } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;
    const images = await getListingImages(listingId);
    return NextResponse.json(images);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;
    const data = await req.json();
    const existing = await getListingImages(listingId);
    const nextOrder = existing.length;

    const newImg = {
      id: uuidv4(),
      listing_id: listingId,
      url: data.url,
      label: data.label || 'Interior',
      sort_order: nextOrder,
    };
    await createListingImage(newImg);
    return NextResponse.json({ success: true, image: newImg });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add image' }, { status: 500 });
  }
}
