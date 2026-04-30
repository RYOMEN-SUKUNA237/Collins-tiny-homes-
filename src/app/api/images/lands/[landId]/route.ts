import { NextRequest, NextResponse } from 'next/server';
import { getLandImages, createLandImage } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ landId: string }> }
) {
  try {
    const { landId } = await params;
    const images = await getLandImages(landId);
    return NextResponse.json(images);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ landId: string }> }
) {
  try {
    const { landId } = await params;
    const data = await req.json();
    const existing = await getLandImages(landId);
    const nextOrder = existing.length;

    const newImg = {
      id: uuidv4(),
      land_id: landId,
      url: data.url,
      label: data.label || 'View',
      sort_order: nextOrder,
    };
    await createLandImage(newImg);
    return NextResponse.json({ success: true, image: newImg });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add image' }, { status: 500 });
  }
}
