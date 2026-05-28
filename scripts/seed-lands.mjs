import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple env parser to read env.local
const envPath = path.resolve(__dirname, '../.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[match[1]] = value;
    }
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Service Role Key in .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleLands = [
  {
    id: randomUUID(),
    title: 'Pine Echo Parcel',
    description: 'Nested in the deep woods of the Pacific Northwest, this 2-acre parcel is ideal for an off-grid tiny home. Dense pine forest provides excellent privacy and wind protection. The parcel has a gently sloping terrain, perfect for a foundation or a THOW on the upper ridge.',
    price: 45000,
    price_type: 'sale',
    acreage: 2,
    location: 'Bend, OR',
    state: 'Oregon',
    lat: 44.0582,
    lng: -121.3153,
    cover_image: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f',
    terrain_type: 'forest',
    utilities: { water: false, electric: false, sewage: false },
    zoning: 'residential',
    is_featured: true,
    status: 'available'
  },
  {
    id: randomUUID(),
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
    utilities: { water: true, electric: true, sewage: false },
    zoning: 'mixed',
    is_featured: true,
    status: 'available'
  },
  {
    id: randomUUID(),
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
    utilities: { water: true, electric: true, sewage: true },
    zoning: 'residential',
    is_featured: false,
    status: 'available'
  }
];

async function run() {
  console.log("Checking if lands already exist in database...");
  const { data: existingLands, error: checkError } = await supabase
    .from('lands')
    .select('id');
  
  if (checkError) {
    console.error("❌ Failed to query lands:", checkError.message);
    process.exit(1);
  }

  if (existingLands && existingLands.length > 0) {
    console.log(`✅ Lands already seeded. Count: ${existingLands.length}`);
    process.exit(0);
  }

  console.log("Seeding lands table...");
  for (const land of sampleLands) {
    const { error: landError } = await supabase.from('lands').insert([land]);
    if (landError) {
      console.error(`❌ Failed to insert land: ${land.title}`, landError.message);
      continue;
    }
    console.log(`✅ Seeded land: ${land.title}`);

    // Insert land images
    const images = [
      { id: randomUUID(), land_id: land.id, url: land.cover_image, label: 'Main View', sort_order: 0 },
      { id: randomUUID(), land_id: land.id, url: 'https://images.unsplash.com/photo-1506744626753-eda8151a7474', label: 'Alternative View', sort_order: 1 }
    ];

    const { error: imgError } = await supabase.from('land_images').insert(images);
    if (imgError) {
      console.warn(`⚠️ Failed to insert land images for ${land.title}:`, imgError.message);
    } else {
      console.log(`  ✅ Inserted ${images.length} images for ${land.title}`);
    }
  }

  console.log("🎉 Lands seeding completed!");
}

run();
