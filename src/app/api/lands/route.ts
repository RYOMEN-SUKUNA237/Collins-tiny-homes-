import { NextRequest, NextResponse } from 'next/server';
import { getAllLands, createLand } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const filters = {
      priceType: searchParams.get('priceType') || undefined,
      terrainType: searchParams.get('terrainType') || undefined,
      zoning: searchParams.get('zoning') || undefined,
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const lands = await getAllLands(filters);
    
    // Parse JSON utilities
    const parsedLands = lands.map((l: any) => ({
      ...l,
      utilities: l.utilities ? (typeof l.utilities === 'string' ? JSON.parse(l.utilities) : l.utilities) : { water: false, electric: false, sewage: false },
      images: [l.cover_image], // Align with frontend expectations initially
      priceType: l.price_type,
      terrainType: l.terrain_type,
      isFeatured: !!l.is_featured,
      coordinates: { lat: l.lat, lng: l.lng },
    }));

    return NextResponse.json(parsedLands);
  } catch (error) {
    console.error('Error fetching lands:', error);
    return NextResponse.json({ error: 'Failed to fetch lands' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const newId = uuidv4();
    
    const dbData = {
      id: newId,
      title: data.title,
      description: data.description,
      price: data.price,
      price_type: data.priceType,
      acreage: data.acreage,
      location: data.location,
      state: data.state,
      lat: data.coordinates?.lat || 0,
      lng: data.coordinates?.lng || 0,
      cover_image: data.coverImage,
      terrain_type: data.terrainType,
      utilities: JSON.stringify(data.utilities || { water: false, electric: false, sewage: false }),
      zoning: data.zoning,
      is_featured: data.isFeatured ? 1 : 0,
      status: data.status || 'available',
    };

    await createLand(dbData);
    
    return NextResponse.json({ success: true, id: newId });
  } catch (error) {
    console.error('Error creating land:', error);
    return NextResponse.json({ error: 'Failed to create land' }, { status: 500 });
  }
}
