import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local
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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log("Supabase URL:", supabaseUrl);
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in env!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Checking listings count...");
  const { data: listings, error: lError } = await supabase.from('listings').select('id, title, price_type, status');
  if (lError) {
    console.error("Error fetching listings:", lError);
  } else {
    console.log(`Found ${listings?.length || 0} listings:`);
    listings?.forEach(l => {
      console.log(` - ID: ${l.id}, Title: ${l.title}, PriceType: ${l.price_type}, Status: ${l.status}`);
    });
  }

  console.log("\nChecking lands count...");
  const { data: lands, error: landError } = await supabase.from('lands').select('id, title, status');
  if (landError) {
    console.error("Error fetching lands:", landError);
  } else {
    console.log(`Found ${lands?.length || 0} lands:`);
    lands?.forEach(l => {
      console.log(` - ID: ${l.id}, Title: ${l.title}, Status: ${l.status}`);
    });
  }
}

main().catch(err => {
  console.error("Fatal:", err);
});
