import { NextRequest, NextResponse } from "next/server";
import { getAllListings, createListing } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const filters = {
      priceType: searchParams.get("priceType") || undefined,
      homeType: searchParams.get("homeType") || undefined,
      minOffGrid: searchParams.has("minOffGrid")
        ? parseInt(searchParams.get("minOffGrid")!)
        : undefined,
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
    };

    const listings = await getAllListings(filters);

    // Parse JSON amenities and other specs
    const parsedListings = listings.map((l) => ({
      ...l,
      amenities: l.amenities
        ? typeof l.amenities === "string"
          ? JSON.parse(l.amenities)
          : l.amenities
        : [],
      images: [l.cover_image], // To align with frontend expected mock structure temporarily
      specs: {
        solarWattage: l.solar_wattage,
        waterSystem: l.water_system,
        insulationRValue: l.insulation_r_value,
        toiletType: l.toilet_type,
        loftCount: l.loft_count,
        heatingType: l.heating_type,
        rainwaterCollection: !!l.rainwater_collection,
        greyWaterSystem: !!l.grey_water_system,
      },
      priceType: l.price_type,
      homeType: l.home_type,
      offGridScore: l.off_grid_score,
      isFeatured: !!l.is_featured,
      downPaymentPct: l.down_payment_pct,
      monthlyRent: l.monthly_rent,
      deliveryFee: l.delivery_fee,
      financeTermMonths: l.finance_term_months,
      coordinates: { lat: l.lat, lng: l.lng },
    }));

    return NextResponse.json(parsedListings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 },
    );
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
      sqft: data.sqft,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      location: data.location,
      state: data.state,
      lat: data.coordinates?.lat || 0,
      lng: data.coordinates?.lng || 0,
      cover_image: data.coverImage,
      home_type: data.homeType,
      off_grid_score: data.offGridScore || 0,
      solar_wattage: data.specs?.solarWattage || null,
      water_system: data.specs?.waterSystem || null,
      insulation_r_value: data.specs?.insulationRValue || null,
      toilet_type: data.specs?.toiletType || null,
      loft_count: data.specs?.loftCount || 0,
      heating_type: data.specs?.heatingType || null,
      rainwater_collection: data.specs?.rainwaterCollection ? 1 : 0,
      grey_water_system: data.specs?.greyWaterSystem ? 1 : 0,
      amenities: JSON.stringify(data.amenities || []),
      is_featured: data.isFeatured ? 1 : 0,
      status: data.status || "active",
      down_payment_pct: data.downPaymentPct || null,
      monthly_rent: data.monthlyRent || null,
      delivery_fee: data.deliveryFee || null,
      finance_term_months: data.financeTermMonths || null,
    };

    await createListing(dbData);

    return NextResponse.json({ success: true, id: newId });
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 },
    );
  }
}
