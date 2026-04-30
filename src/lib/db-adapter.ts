/**
 * db-adapter.ts
 * Maps raw SQLite DB rows (snake_case) → typed UI models (camelCase).
 * Import from this file when you need typed objects for rendering.
 */
import { Listing, Land } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dbRowToListing(row: any): Listing {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    priceType: row.price_type,
    sqft: row.sqft,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    location: row.location,
    state: row.state,
    coordinates: { lat: row.lat ?? 0, lng: row.lng ?? 0 },
    // Support both cover_image (DB row) and images[0] (legacy mock shape)
    coverImage: row.cover_image ?? row.coverImage ?? '',
    // Keep images array populated so ListingCard: listing.images[0] works
    images: [row.cover_image ?? row.coverImage ?? ''],
    homeType: row.home_type,
    offGridScore: row.off_grid_score ?? 0,
    specs: {
      solarWattage: row.solar_wattage ?? undefined,
      waterSystem: row.water_system ?? undefined,
      insulationRValue: row.insulation_r_value ?? undefined,
      toiletType: row.toilet_type ?? undefined,
      loftCount: row.loft_count ?? 0,
      heatingType: row.heating_type ?? undefined,
      rainwaterCollection: !!row.rainwater_collection,
      greyWaterSystem: !!row.grey_water_system,
    },
    amenities: (() => {
      if (!row.amenities) return [];
      if (Array.isArray(row.amenities)) return row.amenities;
      try { return JSON.parse(row.amenities); } catch { return []; }
    })(),
    isFeatured: !!row.is_featured,
    status: row.status ?? 'active',
    downPaymentPct: row.down_payment_pct ?? undefined,
    monthlyRent: row.monthly_rent ?? undefined,
    deliveryFee: row.delivery_fee ?? undefined,
    financeTermMonths: row.finance_term_months ?? undefined,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dbRowToLand(row: any): Land {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    priceType: row.price_type,
    acreage: row.acreage,
    location: row.location,
    state: row.state,
    coordinates: { lat: row.lat ?? 0, lng: row.lng ?? 0 },
    coverImage: row.cover_image ?? '',
    terrainType: row.terrain_type,
    utilities: (() => {
      if (!row.utilities) return {};
      if (typeof row.utilities === 'object') return row.utilities;
      try { return JSON.parse(row.utilities); } catch { return {}; }
    })(),
    zoning: row.zoning,
    isFeatured: !!row.is_featured,
    status: row.status ?? 'available',
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}
