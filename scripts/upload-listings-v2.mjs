import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// ── Supabase credentials ──────────────────────────────────────────────────────
const SUPABASE_URL = 'https://mdvvtrejlpvgfnbueruh.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kdnZ0cmVqbHB2Z2ZuYnVlcnVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzU0NjM2OCwiZXhwIjoyMDkzMTIyMzY4fQ.4ZYIs4eCsNJK2QHIDjxzH1neno808ZF5-tsVB5V2pTg';
const BUCKET = 'listing-images';
const DATA_DIR = path.join(process.cwd(), 'public', 'uploads', 'TINY HOME DATA', 'uploads 1.1');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ── Pre-compiled listing metadata (parsed from all script.txt files in uploads 1.1) ──
const LISTINGS_META = [
  {
    folder: '2015 Swift Moselle Tiny Home',
    title: '2015 Swift Moselle — 3-Bed 40ft Family Tiny Home',
    price: 30000, priceType: 'sale', sqft: 480, bedrooms: 3, bathrooms: 1,
    homeType: 'foundation', offGridScore: 55,
    description: 'A beautifully spacious 40ft x 12ft Swift Moselle single-section layout offering 3 bedrooms — perfect for family living or guests. Features double-glazed windows for insulation and noise reduction, patio doors opening up the living space, and gas central heating. Timber frame construction with insulated walls, roof, and floor make it comfortable year-round. Delivery available. Ideal for lake or land setups with site prep and utility hookups.',
    amenities: ['Double-Glazed Windows', 'Patio Doors', 'Gas Central Heating', 'Timber Frame', 'Delivery Available', 'Low-Maintenance Exterior'],
    specs: { heatingType: 'Gas central heating', waterSystem: 'Municipal' },
  },
  {
    folder: '2026 Island 6128 Tiny Home',
    title: '2026 Island 6128 — 1,500 Sq Ft Modern Family Home',
    price: 32000, priceType: 'sale', sqft: 1500, bedrooms: 3, bathrooms: 2,
    homeType: 'foundation', offGridScore: 30,
    description: 'A newer 2026 Island 6128 model offering 1,500 sq ft of comfortable, modern living space — perfect for full-time living or families downsizing without sacrificing space. This move-in ready home blends spacious room layouts with practical low-maintenance design. Financing available with flexible terms. Delivery quote available based on your location.',
    amenities: ['1,500 Sq Ft', 'Newer 2026 Model', 'Move-In Ready', 'Financing Available', 'Delivery Available', 'Family Layout'],
    specs: { heatingType: 'Central HVAC', waterSystem: 'Municipal' },
  },
  {
    folder: 'Brownwood-Blackwood',
    title: 'Brownwood-Blackwood — 2-Bed 845 Sq Ft with Screened Porch',
    price: 20000, priceType: 'sale', sqft: 845, bedrooms: 2, bathrooms: 2,
    homeType: 'foundation', offGridScore: 40,
    description: 'Introducing the Brownwood-Blackwood: a beautifully designed 845 sq ft single-section home with 2 bedrooms, 2 full bathrooms, and double porches including a screened-in back porch for year-round enjoyment. Features modern black shiplap accents, black tile showers, stained Southern Yellow Pine ceilings, and a cozy built-in desk nook. Includes delivery and tiedowns to all states, ductless mini-split A/C and heating, and full warranty coverage. Down payment: $1,000. Financing available.',
    amenities: ['Screened Back Porch', 'Black Shiplap Accents', 'Southern Yellow Pine Ceilings', 'Built-In Desk Nook', 'Ductless A/C', 'Extended Warranty'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal' },
  },
  {
    folder: 'MAYFORD MODEL',
    title: 'Mayford — 758 Sq Ft 2-Bed with Island Kitchen',
    price: 40000, priceType: 'sale', sqft: 758, bedrooms: 2, bathrooms: 1,
    homeType: 'foundation', offGridScore: 35,
    description: 'The Mayford model packs style and functionality into 758 sq ft. Features a metal roof, light wood accent on the island bar with three pendant lights, a private bathroom in the main bedroom, trey ceiling, upgraded stainless steel appliances, ceiling ventilation, brown cabinets throughout, and durable lino flooring. Ideal for first-time home buyers, Airbnb investment, or downsizing in comfort. Down payment: $3,000. Financing available.',
    amenities: ['Metal Roof', 'Island Bar with Pendant Lights', 'Trey Ceiling', 'Stainless Steel Appliances', 'Ceiling Ventilation', 'Financing Available'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal' },
  },
  {
    folder: 'THE ANDERSON',
    title: 'The Anderson — Multi-Sleep Tiny Home with Loft & Bunk Beds',
    price: 19000, priceType: 'sale', sqft: 320, bedrooms: 2, bathrooms: 1,
    homeType: 'foundation', offGridScore: 55,
    description: 'The Anderson is a smartly designed tiny home perfect for families, vacation getaways, or rental income. The main floor features an open living area, full kitchen, private rear bedroom, built-in bunk beds, full bathroom, and stackable washer/dryer space. A spacious upper loft with room for a queen mattress adds extra sleeping capacity. The covered front porch adds curb appeal. Efficient layout with maximum use of vertical space. Delivery available to all states. Down payment: $800. Reservation fee: $500.',
    amenities: ['Built-In Bunk Beds', 'Queen Loft', 'Covered Front Porch', 'Washer/Dryer Space', 'Full Kitchen', 'Delivery All States'],
    specs: { heatingType: 'Mini-split', waterSystem: 'Municipal', loftCount: 1 },
  },
  {
    folder: 'The Largest Diamond Series Model',
    title: 'The Daniel — Largest Diamond Series 1,024 Sq Ft',
    price: 73000, priceType: 'sale', sqft: 1024, bedrooms: 2, bathrooms: 2,
    homeType: 'foundation', offGridScore: 42,
    description: "Introducing The Daniel — the largest model in the Diamond Series. This expansive 1,024 sq ft home features a massive covered front porch, spacious kitchen island, built-in entertainment center, pantry, built-in desk, clerestory with oversized picture windows, 2 bedrooms and 2 full bathrooms. The Diamond Series is known for beautifully designed porches, elegant metal accents, farmhouse lights, luxurious tile showers, and premium built-ins throughout. Includes A/C, steps, and a 7-year warranty. Down payment: $4,000. Financing available.",
    amenities: ['Covered Front Porch', 'Kitchen Island', 'Built-In Entertainment Center', 'Pantry', 'Clerestory Windows', '7-Year Warranty'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal' },
  },
  {
    folder: 'The Oasis  2 Bed  2 Bath  940 SQ FT  $55,000',
    title: 'The Oasis — 2-Bed 2-Bath 940 Sq Ft',
    price: 55000, priceType: 'sale', sqft: 940, bedrooms: 2, bathrooms: 2,
    homeType: 'foundation', offGridScore: 38,
    description: 'The Oasis offers a smart 2 bed / 2 bath layout with 940 sq ft of open living space — comfortable, efficient, and move-in ready. Perfect for small families, first-time homeowners, or anyone looking for affordable modern living. Includes ductless A/C and heating system, manufacturer\'s warranty, and a 7-year extended service contract. Rent-to-own (RTO) available. Cross-country delivery available. Note: No appliances or furniture included.',
    amenities: ['Open Living Space', 'Ductless A/C', 'Rent-to-Own Available', '7-Year Extended Warranty', 'Delivery Nationwide'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal' },
  },
  {
    folder: 'the Lark',
    title: 'The Lark — 1-Bed 399 Sq Ft Park Model with Loft',
    price: 55550, priceType: 'sale', sqft: 399, bedrooms: 1, bathrooms: 1,
    homeType: 'foundation', offGridScore: 50,
    description: "The Lark is a 1-bed/1-bath 399 sq ft RV park model tiny house featuring a unique floor plan with added loft. The living room is opened up by removing the fireplace and hutch — creating more room for a dining table or desk. The bedroom features built-ins that fit a queen bed between them with a private back door. The bathroom features a handicap-accessible shower. Price includes all upgrades/options shown, delivery and tiedowns within 100 miles, ductless A/C and heat system, temporary wooden steps, manufacturer's warranty, and extended warranty. Down payment: $3,300.",
    amenities: ['Sleeping Loft', 'Handicap-Accessible Shower', 'Queen Bedroom Built-Ins', 'Ductless A/C', 'Delivery Within 100 Miles', 'Extended Warranty'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal', loftCount: 1 },
  },
  {
    folder: 'uload 2',
    title: 'The Boujee — 4-Bed 3-Bath Luxury Tiny Home',
    price: 120900, priceType: 'sale', sqft: 1800, bedrooms: 4, bathrooms: 3,
    homeType: 'foundation', offGridScore: 20,
    description: '"The Boujee" is available now — a spacious 4-bedroom 3-bathroom luxury home ready for delivery. This impressive home comes complete with all appliances and is priced at $120,900 including delivery and setup. Trade-ins available. Financing options available with flexible terms. Down payment: $8,000. Refundable reservation deposit: $2,500.',
    amenities: ['All Appliances Included', 'Delivery & Setup Included', 'Trade-Ins Available', 'Financing Available', '4 Bedrooms', '3 Full Bathrooms'],
    specs: { heatingType: 'Central HVAC', waterSystem: 'Municipal' },
  },
  {
    folder: 'upload1',
    title: 'Grand 4-Bed 2-Bath Home — Walk-In Closet & Luxury Suite',
    price: 160000, priceType: 'sale', sqft: 2200, bedrooms: 4, bathrooms: 2,
    homeType: 'foundation', offGridScore: 15,
    description: 'A stunning large home offering 4 bedrooms, 2 bathrooms, and an extra bonus room. Features a spacious open living room perfect for family time, a large kitchen with island and tons of cabinet space, a private primary suite with walk-in closet and luxury bathroom (separate tub and shower), dedicated laundry room, and a smart split-bedroom layout for maximum privacy. Ideal for families, remote workers, or anyone who needs big rooms and comfortable living. Down payment: $10,000. Refundable reservation fee: $2,000.',
    amenities: ['Walk-In Closet', 'Separate Tub & Shower', 'Kitchen Island', 'Dedicated Laundry Room', 'Split-Bedroom Layout', 'Extra Bonus Room'],
    specs: { heatingType: 'Central HVAC', waterSystem: 'Municipal' },
  },
  {
    folder: 'upload3',
    title: 'Modern 2-Bed 758 Sq Ft — Trey Ceiling & Island Bar',
    price: 40000, priceType: 'sale', sqft: 758, bedrooms: 2, bathrooms: 1,
    homeType: 'foundation', offGridScore: 35,
    description: 'A stylish and practical 2-bedroom 1-bathroom home at 758 sq ft. Highlights include a metal roof, light wood accent island bar with three pendant lights above, private bathroom in the main bedroom, trey ceiling, upgraded stainless steel appliances, ceiling ventilation, brown cabinets throughout, and durable lino flooring. Side entry design. Down payment: $3,000. Financing available. Contact immediately — limited availability.',
    amenities: ['Metal Roof', 'Island Bar', 'Trey Ceiling', 'Stainless Steel Appliances', 'Ceiling Ventilation', 'Financing Available'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal' },
  },
];

// ── Helper: Upload a file to Supabase Storage ─────────────────────────────────
async function uploadImage(localPath, storagePath) {
  const fileBuffer = fs.readFileSync(localPath);
  const ext = path.extname(localPath).toLowerCase();
  const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };
  const contentType = mimeMap[ext] || 'image/jpeg';

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, {
    contentType, upsert: true,
  });
  if (error) throw new Error(`Upload failed for ${storagePath}: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

// ── Helper: Get images from a folder (handles missing 'main' prefix) ─────────
function getImages(folderPath) {
  const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const files = fs.readdirSync(folderPath);
  const images = files.filter(f => IMAGE_EXTS.includes(path.extname(f).toLowerCase()));

  // Prefer a file named 'main.*' or 'mai.*'
  let mainImage = images.find(f => f.toLowerCase().startsWith('main'));
  if (!mainImage) mainImage = images.find(f => f.toLowerCase().startsWith('mai'));

  // If still nothing, use the first image sorted alphabetically
  const sortedImages = [...images].sort();
  if (!mainImage) mainImage = sortedImages[0];

  const otherImages = images.filter(f => f !== mainImage);

  return { mainImage, otherImages };
}

// ── Main upload function ──────────────────────────────────────────────────────
async function main() {
  console.log(`\n🏠 Collins Tiny Homes — Bulk Upload v2 (uploads 1.1)`);
  console.log(`📁 Data dir: ${DATA_DIR}`);
  console.log(`🔗 Supabase: ${SUPABASE_URL}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const meta of LISTINGS_META) {
    const folderPath = path.join(DATA_DIR, meta.folder);

    if (!fs.existsSync(folderPath)) {
      console.warn(`⚠️  Folder not found: ${meta.folder}`);
      errorCount++;
      continue;
    }

    try {
      console.log(`\n📦 Processing: ${meta.title}`);
      const { mainImage, otherImages } = getImages(folderPath);

      if (!mainImage) {
        console.warn(`  ⚠️  No images found in ${meta.folder} — skipping`);
        errorCount++;
        continue;
      }

      // Upload main image
      const listingId = randomUUID();
      const safeFolderName = meta.folder.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 40);
      const mainExt = path.extname(mainImage).toLowerCase();
      const mainStoragePath = `listings/${listingId}/main${mainExt}`;

      console.log(`  📸 Uploading main image: ${mainImage}`);
      const coverImageUrl = await uploadImage(path.join(folderPath, mainImage), mainStoragePath);
      console.log(`  ✅ Main image URL: ${coverImageUrl}`);

      // Insert listing record
      const { error: listingError } = await supabase.from('listings').insert([{
        id: listingId,
        title: meta.title,
        description: meta.description,
        price: meta.price,
        price_type: 'both',
        sqft: meta.sqft,
        bedrooms: meta.bedrooms,
        bathrooms: meta.bathrooms,
        location: 'United States',
        state: 'Nationwide',
        lat: 37.0902,
        lng: -95.7129,
        cover_image: coverImageUrl,
        home_type: meta.homeType,
        off_grid_score: meta.offGridScore,
        solar_wattage: meta.specs?.solarWattage || (meta.price > 29000 ? 1600 : null),
        water_system: meta.specs?.waterSystem || null,
        insulation_r_value: meta.specs?.insulationRValue || null,
        toilet_type: meta.specs?.toiletType || null,
        loft_count: meta.specs?.loftCount || 0,
        heating_type: meta.specs?.heatingType || null,
        rainwater_collection: meta.specs?.rainwaterCollection || false,
        grey_water_system: meta.specs?.greyWaterSystem || false,
        amenities: meta.amenities || [],
        is_featured: false,
        status: 'active',
        created_at: new Date().toISOString(),
      }]);

      if (listingError) throw new Error(`DB insert failed: ${listingError.message}`);
      console.log(`  ✅ Listing inserted: ${listingId}`);

      // Upload and insert gallery images
      let sortOrder = 0;
      const imageInserts = [];

      // Add cover image as first gallery image too
      imageInserts.push({
        id: randomUUID(),
        listing_id: listingId,
        url: coverImageUrl,
        label: 'Main',
        sort_order: sortOrder++,
      });

      for (const imgFile of otherImages.slice(0, 20)) { // cap at 20 extras
        try {
          const imgExt = path.extname(imgFile).toLowerCase();
          const imgStoragePath = `listings/${listingId}/${sortOrder}${imgExt}`;
          console.log(`  📸 Uploading gallery image: ${imgFile}`);
          const imgUrl = await uploadImage(path.join(folderPath, imgFile), imgStoragePath);
          imageInserts.push({
            id: randomUUID(),
            listing_id: listingId,
            url: imgUrl,
            label: `Photo ${sortOrder}`,
            sort_order: sortOrder++,
          });
        } catch (imgErr) {
          console.warn(`  ⚠️  Could not upload ${imgFile}: ${imgErr.message}`);
        }
      }

      if (imageInserts.length > 0) {
        const { error: imgError } = await supabase.from('listing_images').insert(imageInserts);
        if (imgError) console.warn(`  ⚠️  Image DB insert warning: ${imgError.message}`);
        else console.log(`  ✅ ${imageInserts.length} images saved to DB`);
      }

      successCount++;
    } catch (err) {
      console.error(`  ❌ ERROR for ${meta.folder}: ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`✅ Done! ${successCount} listings uploaded, ${errorCount} errors.`);
}

main().catch(err => { console.error('Fatal error:', err); process.exit(1); });
