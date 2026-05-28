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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log("Listing tables in Supabase...");
  // Let's query site_settings to see if it works, and listings
  const { data: listings } = await supabase.from('listings').select('id').limit(1);
  console.log("Listings query success:", !!listings);
  
  // Let's see if we can do an arbitrary query or check RPC
  // Wait, let's try to query 'projects'
  const { data: projects, error: pError } = await supabase.from('projects').select('*').limit(1);
  if (pError) {
    console.log("❌ projects table query error:", pError.message);
  } else {
    console.log("✅ projects table exists!");
  }

  // Let's try to query 'finance_plans' again
  const { data: fplans, error: fError } = await supabase.from('finance_plans').select('*').limit(1);
  if (fError) {
    console.log("❌ finance_plans table query error:", fError.message);
  } else {
    console.log("✅ finance_plans table exists!");
  }
}

run();
