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

async function run() {
  console.log("Checking Supabase connection and tables...");
  try {
    const { data: listings, error: lError } = await supabase
      .from('listings')
      .select('id, title, price_type');
    
    if (lError) {
      console.error("❌ Failed to query listings table:", lError.message);
    } else {
      console.log(`✅ Connection OK. Listings count: ${listings ? listings.length : 0}`);
      if (listings) {
        listings.forEach(l => {
          console.log(`  - ${l.title} (Price type: ${l.price_type})`);
        });
      }
    }

    const { data: settings, error: sError } = await supabase
      .from('site_settings')
      .select('*');
    
    if (sError) {
      console.error("❌ Failed to query site_settings table:", sError.message);
    } else {
      console.log(`✅ Site settings count: ${settings ? settings.length : 0}`);
    }
  } catch (err) {
    console.error("❌ Connection failed with error:", err);
  }
}

run();
