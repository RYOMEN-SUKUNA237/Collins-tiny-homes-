import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const cities = [
  { name: 'Asheville', state: 'North Carolina', stateAbbr: 'NC', lat: 35.5951, lng: -82.5515 },
  { name: 'Austin', state: 'Texas', stateAbbr: 'TX', lat: 30.2672, lng: -97.7431 },
  { name: 'Denver', state: 'Colorado', stateAbbr: 'CO', lat: 39.7392, lng: -104.9903 },
  { name: 'Sedona', state: 'Arizona', stateAbbr: 'AZ', lat: 34.8697, lng: -111.7601 },
  { name: 'Portland', state: 'Oregon', stateAbbr: 'OR', lat: 45.5152, lng: -122.6784 },
  { name: 'Lake Placid', state: 'New York', stateAbbr: 'NY', lat: 44.2795, lng: -73.9799 },
  { name: 'Bend', state: 'Oregon', stateAbbr: 'OR', lat: 44.0582, lng: -121.3153 },
  { name: 'Outer Banks', state: 'North Carolina', stateAbbr: 'NC', lat: 35.5585, lng: -75.4665 },
  { name: 'Seattle', state: 'Washington', stateAbbr: 'WA', lat: 47.6062, lng: -122.3321 },
  { name: 'Bozeman', state: 'Montana', stateAbbr: 'MT', lat: 45.6770, lng: -111.0429 },
  { name: 'Taos', state: 'New Mexico', stateAbbr: 'NM', lat: 36.4072, lng: -105.5731 },
  { name: 'Burlington', state: 'Vermont', stateAbbr: 'VT', lat: 44.4756, lng: -73.2121 },
  { name: 'Orlando', state: 'Florida', stateAbbr: 'FL', lat: 28.5383, lng: -81.3792 },
  { name: 'Savannah', state: 'Georgia', stateAbbr: 'GA', lat: 32.0809, lng: -81.0912 },
  { name: 'Nashville', state: 'Tennessee', stateAbbr: 'TN', lat: 36.1627, lng: -86.7816 },
  { name: 'San Diego', state: 'California', stateAbbr: 'CA', lat: 32.7157, lng: -117.1611 },
  { name: 'Phoenix', state: 'Arizona', stateAbbr: 'AZ', lat: 33.4484, lng: -112.0740 },
  { name: 'Salt Lake City', state: 'Utah', stateAbbr: 'UT', lat: 40.7608, lng: -111.8910 },
  { name: 'Boise', state: 'Idaho', stateAbbr: 'ID', lat: 43.6150, lng: -116.2023 },
  { name: 'Madison', state: 'Wisconsin', stateAbbr: 'WI', lat: 43.0731, lng: -89.4012 }
];

async function run() {
  console.log("Updating listing locations in Supabase database...");
  try {
    const { data: listings, error: lError } = await supabase.from('listings').select('id, title');
    if (lError) throw lError;

    console.log(`Found ${listings.length} listings to update.`);
    for (let i = 0; i < listings.length; i++) {
      const listing = listings[i];
      const city = cities[i % cities.length];
      const locationText = `${city.name}, ${city.stateAbbr}`;
      
      const { error } = await supabase.from('listings').update({
        location: locationText,
        state: city.state,
        lat: city.lat,
        lng: city.lng
      }).eq('id', listing.id);

      if (error) {
        console.error(`❌ Failed to update listing ${listing.title}:`, error.message);
      } else {
        console.log(`✅ Updated ${listing.title} -> ${locationText}`);
      }
    }

    console.log("Updating land locations in Supabase database...");
    const { data: lands, error: landError } = await supabase.from('lands').select('id, title');
    if (landError) {
      console.log("Skipping lands table or error:", landError.message);
    } else {
      console.log(`Found ${lands.length} land records to update.`);
      for (let i = 0; i < lands.length; i++) {
        const land = lands[i];
        const city = cities[(i + 5) % cities.length]; // offset
        const locationText = `${city.name}, ${city.stateAbbr}`;

        const { error } = await supabase.from('lands').update({
          location: locationText,
          state: city.state,
          lat: city.lat,
          lng: city.lng
        }).eq('id', land.id);

        if (error) {
          console.error(`❌ Failed to update land ${land.title}:`, error.message);
        } else {
          console.log(`✅ Updated land ${land.title} -> ${locationText}`);
        }
      }
    }

    console.log("\n🎉 All locations updated successfully!");
  } catch (err) {
    console.error("❌ Location update failed:", err.message);
  }
}

run();
