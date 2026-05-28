import { Client } from 'pg';
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

const projRefMatch = env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/(.*)\.supabase\.co/);
const projRef = projRefMatch ? projRefMatch[1] : '';

const host = `db.${projRef}.supabase.co`;
const passwords = [
  'FreightAdmin2024!',
  'RYOMEN-SUKUNA237',
  'RyomenSukuna237',
  'RyomenSukuna!',
  'Ryomen_Sukuna',
  'RyomenSukuna2024!',
  'RyomenSukuna2026!',
  'postgres',
  'password'
];

async function tryConnect(password) {
  const client = new Client({
    host,
    port: 5432,
    user: 'postgres',
    password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 3000
  });

  try {
    await client.connect();
    console.log(`🎉 SUCCESS! Password is: ${password}`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`❌ Failed with password: ${password} (${err.message})`);
    return false;
  }
}

async function run() {
  for (const pw of passwords) {
    const ok = await tryConnect(pw);
    if (ok) {
      process.exit(0);
    }
  }
  console.log("No passwords succeeded.");
}

run();
