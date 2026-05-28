import { NextRequest, NextResponse } from "next/server";
import {
  getListingById,
  updateListing,
  deleteListing,
  getListingImages,
} from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const p = await params;
    const listing = await getListingById(p.id);

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const dbImages = await getListingImages(p.id);
    const images = [listing.cover_image, ...dbImages.map((i) => i.url)];

    const parsedListing = {
      ...listing,
      amenities: listing.amenities
        ? typeof listing.amenities === "string"
          ? JSON.parse(listing.amenities)
          : listing.amenities
        : [],
      images: Array.from(new Set(images)), // remove duplicates if cover is in images
      specs: {
        solarWattage: listing.solar_wattage,
        waterSystem: listing.water_system,
        insulationRValue: listing.insulation_r_value,
        toiletType: listing.toilet_type,
        loftCount: listing.loft_count,
        heatingType: listing.heating_type,
        rainwaterCollection: !!listing.rainwater_collection,
        greyWaterSystem: !!listing.grey_water_system,
      },
      priceType: listing.price_type,
      homeType: listing.home_type,
      offGridScore: listing.off_grid_score,
      isFeatured: !!listing.is_featured,
      downPaymentPct: listing.down_payment_pct,
      monthlyRent: listing.monthly_rent,
      deliveryFee: listing.delivery_fee,
      financeTermMonths: listing.finance_term_months,
      coordinates: { lat: listing.lat, lng: listing.lng },
      gallery: dbImages, // raw gallery data with labels
    };

    return NextResponse.json(parsedListing);
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const p = await params;
    const data = await req.json();

    const dbData: Record<string, unknown> = {};
    if (data.title !== undefined) dbData.title = data.title;
    if (data.description !== undefined) dbData.description = data.description;
    if (data.price !== undefined) dbData.price = data.price;
    if (data.priceType !== undefined) dbData.price_type = data.priceType;
    if (data.sqft !== undefined) dbData.sqft = data.sqft;
    if (data.bedrooms !== undefined) dbData.bedrooms = data.bedrooms;
    if (data.bathrooms !== undefined) dbData.bathrooms = data.bathrooms;
    if (data.location !== undefined) dbData.location = data.location;
    if (data.state !== undefined) dbData.state = data.state;
    if (data.coordinates?.lat !== undefined) dbData.lat = data.coordinates.lat;
    if (data.coordinates?.lng !== undefined) dbData.lng = data.coordinates.lng;
    if (data.coverImage !== undefined) dbData.cover_image = data.coverImage;
    if (data.homeType !== undefined) dbData.home_type = data.homeType;
    if (data.offGridScore !== undefined)
      dbData.off_grid_score = data.offGridScore;
    if (data.specs?.solarWattage !== undefined)
      dbData.solar_wattage = data.specs.solarWattage;
    if (data.specs?.waterSystem !== undefined)
      dbData.water_system = data.specs.waterSystem;
    if (data.specs?.insulationRValue !== undefined)
      dbData.insulation_r_value = data.specs.insulationRValue;
    if (data.specs?.toiletType !== undefined)
      dbData.toilet_type = data.specs.toiletType;
    if (data.specs?.loftCount !== undefined)
      dbData.loft_count = data.specs.loftCount;
    if (data.specs?.heatingType !== undefined)
      dbData.heating_type = data.specs.heatingType;
    if (data.specs?.rainwaterCollection !== undefined)
      dbData.rainwater_collection = data.specs.rainwaterCollection ? 1 : 0;
    if (data.specs?.greyWaterSystem !== undefined)
      dbData.grey_water_system = data.specs.greyWaterSystem ? 1 : 0;
    if (data.amenities !== undefined)
      dbData.amenities = JSON.stringify(data.amenities);
    if (data.isFeatured !== undefined)
      dbData.is_featured = data.isFeatured ? 1 : 0;
    if (data.status !== undefined) dbData.status = data.status;
    if (data.downPaymentPct !== undefined)
      dbData.down_payment_pct = data.downPaymentPct;
    if (data.monthlyRent !== undefined) dbData.monthly_rent = data.monthlyRent;
    if (data.deliveryFee !== undefined) dbData.delivery_fee = data.deliveryFee;
    if (data.financeTermMonths !== undefined)
      dbData.finance_term_months = data.financeTermMonths;

    if (Object.keys(dbData).length > 0) {
      await updateListing(p.id, dbData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating listing:", error);
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const p = await params;
    await deleteListing(p.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 },
    );
  }
}
