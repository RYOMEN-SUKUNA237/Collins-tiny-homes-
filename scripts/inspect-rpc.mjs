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
  console.log("Querying Supabase OpenAPI spec to list available endpoints/functions...");
  try {
    const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`;
    const response = await fetch(url, {
      headers: {
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    });
    
    if (response.ok) {
      const spec = await response.json();
      console.log("Paths available:");
      for (const p of Object.keys(spec.paths)) {
        if (p.includes('/rpc/')) {
          console.log(`  - RPC: ${p}`);
        }
      }
    } else {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
    }
  } catch (err) {
    console.error("❌ Request failed:", err);
  }
}

run();
