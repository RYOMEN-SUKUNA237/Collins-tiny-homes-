import { createListing, createListingImage, createLand, createLandImage, upsertSetting, getAllListings } from './db';
import { v4 as uuidv4 } from 'uuid';
import { mockListings } from './mock-data';

export async function seedDb() {
  // Check if we already seeded
  const existingListings = await getAllListings();
  if (existingListings.length > 0) {
    console.log('Database already seeded (listings exist).');
    return { status: 'already_seeded' };
  }

  console.log('Starting explicit database seeding...');

  // 1. Site Settings
  await upsertSetting('site_name', 'Collins Tiny Homes');
  await upsertSetting('site_tagline', 'Handcrafted tiny homes for sale and rent.');
  await upsertSetting('contact_email', 'hello@collinstinyhomes.com');
  await upsertSetting('contact_phone', '(555) 123-4567');
  await upsertSetting('default_down_payment_pct', '20');
  await upsertSetting('default_finance_term_months', '120');
  await upsertSetting('default_delivery_fee', '5000');
  await upsertSetting('hero_title', 'Live smaller. Live better.');
  await upsertSetting('hero_subtitle', 'Discover handcrafted tiny homes built for minimalism, freedom, and connection to nature. Find your perfect sanctuary today.');
  await upsertSetting('about_text', 'Collins Tiny Homes is dedicated to making quality, sustainable tiny homes accessible to everyone. Whether you are looking for a weekend getaway or a permanent off-grid homestead, our curated collection of homes and lands has you covered.');

  // 2. Listings
  for (const mock of mockListings) {
    await createListing({
      id: mock.id,
      title: mock.title,
      description: mock.description,
      price: mock.price,
      price_type: mock.priceType,
      sqft: mock.sqft,
      bedrooms: mock.bedrooms,
      bathrooms: mock.bathrooms,
      location: mock.location,
      state: mock.state,
      lat: mock.coordinates.lat,
      lng: mock.coordinates.lng,
      cover_image: mock.images[0],
      home_type: mock.homeType,
      off_grid_score: Math.round(mock.offGridScore / 10),
      solar_wattage: mock.specs.solarWattage || null,
      water_system: mock.specs.waterSystem || null,
      insulation_r_value: mock.specs.insulationRValue || null,
      toilet_type: mock.specs.toiletType || null,
      loft_count: mock.specs.loftCount || 0,
      heating_type: mock.specs.heatingType || null,
      rainwater_collection: mock.specs.rainwaterCollection ? true : false,
      grey_water_system: mock.specs.greyWaterSystem ? true : false,
      amenities: JSON.stringify(mock.amenities), // Or leave it as object array, supabase inserts JSONB fine
      is_featured: mock.isFeatured ? true : false,
      status: mock.status,
      down_payment_pct: mock.id === '1' ? 15 : null,
      monthly_rent: mock.priceType === 'rent' ? mock.price : 1200,
      delivery_fee: mock.id === '2' ? 6000 : null,
      finance_term_months: mock.id === '3' ? 144 : null,
    });

    // Interior images
    const roomLabels = ['Kitchen', 'Bedroom', 'Bathroom', 'Living Area', 'Exterior'];
    for (let idx = 0; idx < mock.images.length; idx++) {
      const url = mock.images[idx];
      await createListingImage({
        id: uuidv4(),
        listing_id: mock.id,
        url,
        label: roomLabels[idx] || 'Interior',
        sort_order: idx,
      });
    }
  }

  // 3. Lands
  const sampleLands = [
    {
      id: uuidv4(),
      title: 'Pine Echo Parcel',
      description: 'Nested in the deep woods of the Pacific Northwest, this 2-acre parcel is ideal for an off-grid tiny home. Dense pine forest provides excellent privacy and wind protection. The parcel has a gently sloping terrain, perfect for a foundation or a THOW on the upper ridge.',
      price: 45000,
      price_type: 'sale',
      acreage: 2,
      location: 'Bend, OR',
      state: 'Oregon',
      lat: 44.0582,
      lng: -121.3153,
      cover_image: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f', // placeholder
      terrain_type: 'forest',
      utilities: JSON.stringify({ water: false, electric: false, sewage: false }),
      zoning: 'residential',
      is_featured: true,
      status: 'available'
    },
    {
      id: uuidv4(),
      title: 'Desert Oasis Lot',
      description: 'A beautiful 5-acre expanse of high desert terrain with unobstructed views of the sunset. Perfect for a solar-powered tiny homestead. The lot has been cleared in a small section and features a drilled well. Power is available at the street.',
      price: 65000,
      price_type: 'sale',
      acreage: 5,
      location: 'Sedona, AZ',
      state: 'Arizona',
      lat: 34.8697,
      lng: -111.7609,
      cover_image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
      terrain_type: 'desert',
      utilities: JSON.stringify({ water: true, electric: true, sewage: false }),
      zoning: 'mixed',
      is_featured: true,
      status: 'available'
    },
    {
      id: uuidv4(),
      title: 'Whispering Creek Lease',
      description: 'Looking to rent land for your THOW? This half-acre spot by a year-round creek offers water and electric hookups. Extremely quiet setting just 20 minutes from town. Minimum 1-year lease strictly enforced.',
      price: 450,
      price_type: 'rent',
      acreage: 0.5,
      location: 'Asheville, NC',
      state: 'North Carolina',
      lat: 35.5951,
      lng: -82.5515,
      cover_image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739',
      terrain_type: 'mountain',
      utilities: JSON.stringify({ water: true, electric: true, sewage: true }),
      zoning: 'residential',
      is_featured: false,
      status: 'available'
    }
  ];

  for (const land of sampleLands) {
    await createLand(land);

    // Some mock land images
    await createLandImage({
      id: uuidv4(),
      land_id: land.id,
      url: land.cover_image,
      label: 'Main View',
      sort_order: 0,
    });
    await createLandImage({
      id: uuidv4(),
      land_id: land.id,
      url: 'https://images.unsplash.com/photo-1506744626753-eda8151a7474',
      label: 'Alternative View',
      sort_order: 1,
    });
  }

  console.log('Seeding complete.');
  return { status: 'success' };
}
