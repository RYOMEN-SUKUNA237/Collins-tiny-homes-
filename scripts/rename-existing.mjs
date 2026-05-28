import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mdvvtrejlpvgfnbueruh.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
  console.error('Missing Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const RENAME_MAP = {
  '10th Model — Spacious Double Wide': 'The Aspenwood — Double Wide Homestead',
  '2nd Model — 3-Bed Family Home with Garage': 'The Summit Manor — Modern Family Oasis',
  'The Tumbleweed — Charming Pre-Owned Tiny': 'The Tumbleweed — Charming Rustic Park Model',
  '4th Model — Farmhouse 3-Bed with Delivery': 'The Hearthstone — Country Farmhouse Cottage',
  'Custom Tiny Home on Wheels — Off-Grid Ready': 'The Nomad Explorer — Custom Off-Grid THOW',
  '6th Model — Used 2021 Double Wide': 'The Meadowlands Homestead — Expansive Double Wide',
  'Blackberry — 1-Bed Loft Park Model': 'The Blackberry Loft — Luxury Park Cottage',
  '8th Model — Platinum 2-Bed 1,088 Sq Ft': 'The Platinum Ridge — Architectural Masterpiece',
  '9th Model — 4-Bed STON 2,400 Sq Ft': 'The Sanctuary Estate — Grand 4-Bed Villa',
  'Platinum Model — 2-Bed 1,088 Sq Ft with Delivery': 'The Horizon Ridge — Premium Dual-Loft Oasis'
};

async function run() {
  console.log('Renaming existing models in Supabase database...');
  for (const [oldTitle, newTitle] of Object.entries(RENAME_MAP)) {
    const { data, error } = await supabase
      .from('listings')
      .update({ title: newTitle })
      .eq('title', oldTitle)
      .select('id');
    
    if (error) {
      console.error(`Failed to rename "${oldTitle}":`, error.message);
    } else if (data && data.length > 0) {
      console.log(`✓ Renamed "${oldTitle}" → "${newTitle}"`);
    } else {
      console.log(`- Listing not found or already renamed for: "${oldTitle}"`);
    }
  }
  console.log('Renaming complete!');
}

run();
