import { NextRequest, NextResponse } from 'next/server';
import { getLandById, updateLand, deleteLand, getLandImages } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const land: any = await getLandById(id);
    if (!land) return NextResponse.json({ error: 'Land not found' }, { status: 404 });

    const dbImages = await getLandImages(id);

    return NextResponse.json({
      ...land,
      utilities: land.utilities ? (typeof land.utilities === 'string' ? JSON.parse(land.utilities) : land.utilities) : { water: false, electric: false, sewage: false },
      images: Array.from(new Set([land.cover_image, ...dbImages.map((i: any) => i.url)])),
      gallery: dbImages,
      priceType: land.price_type,
      terrainType: land.terrain_type,
      isFeatured: !!land.is_featured,
      coordinates: { lat: land.lat, lng: land.lng },
    });
  } catch (error) {
    console.error('Error fetching land:', error);
    return NextResponse.json({ error: 'Failed to fetch land' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();

    const dbData: Record<string, any> = {};
    if (data.title !== undefined) dbData.title = data.title;
    if (data.description !== undefined) dbData.description = data.description;
    if (data.price !== undefined) dbData.price = Number(data.price);
    if (data.priceType !== undefined) dbData.price_type = data.priceType;
    if (data.acreage !== undefined) dbData.acreage = Number(data.acreage);
    if (data.location !== undefined) dbData.location = data.location;
    if (data.state !== undefined) dbData.state = data.state;
    if (data.coordinates?.lat !== undefined) dbData.lat = data.coordinates.lat;
    if (data.coordinates?.lng !== undefined) dbData.lng = data.coordinates.lng;
    if (data.coverImage !== undefined) dbData.cover_image = data.coverImage;
    if (data.terrainType !== undefined) dbData.terrain_type = data.terrainType;
    if (data.utilities !== undefined) dbData.utilities = JSON.stringify(data.utilities);
    if (data.zoning !== undefined) dbData.zoning = data.zoning;
    if (data.isFeatured !== undefined) dbData.is_featured = data.isFeatured ? 1 : 0;
    if (data.status !== undefined) dbData.status = data.status;

    if (Object.keys(dbData).length > 0) await updateLand(id, dbData);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating land:', error);
    return NextResponse.json({ error: 'Failed to update land' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteLand(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting land:', error);
    return NextResponse.json({ error: 'Failed to delete land' }, { status: 500 });
  }
}
