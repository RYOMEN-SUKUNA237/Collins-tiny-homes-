import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: Ensure package is installed
function ensureDependency(name) {
  try {
    import.meta.resolve(name);
  } catch {
    console.log(`Dependency "${name}" is missing. Installing...`);
    execSync(`npm install ${name}`, { stdio: 'inherit' });
  }
}

// 1. Ensure 'pg' is installed
ensureDependency('pg');

// Now import 'pg' dynamically
const { Client } = await import('pg');

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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || '';
// Project reference is derived from URL: https://[ref].supabase.co
const projRefMatch = supabaseUrl.match(/https:\/\/(.*)\.supabase\.co/);
const projRef = projRefMatch ? projRefMatch[1] : '';

if (!projRef) {
  console.error("Could not determine Supabase project reference from NEXT_PUBLIC_SUPABASE_URL.");
  process.exit(1);
}

const dbHost = process.env.SUPABASE_DB_HOST || env.SUPABASE_DB_HOST || `db.${projRef}.supabase.co`;
const dbUser = process.env.SUPABASE_DB_USER || env.SUPABASE_DB_USER || 'postgres';
const dbName = process.env.SUPABASE_DB_NAME || env.SUPABASE_DB_NAME || 'postgres';
const dbPort = Number(process.env.SUPABASE_DB_PORT || env.SUPABASE_DB_PORT || 5432);

// Check for password
let dbPassword = process.env.SUPABASE_DB_PASSWORD || env.SUPABASE_DB_PASSWORD || '';

async function askPassword() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question('Enter your Supabase Database Password: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function run() {
  if (!dbPassword) {
    console.log(`Connecting to: Host=${dbHost}, Port=${dbPort}, User=${dbUser}, DB=${dbName}`);
    dbPassword = await askPassword();
  }

  if (!dbPassword) {
    console.error("Database password is required to run migrations.");
    process.exit(1);
  }

  const client = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting to Supabase PostgreSQL database...");
    await client.connect();
    console.log("Connected successfully!");

    const sqlFiles = [
      'supabase_base_schema.sql',
      'supabase_discovery_and_finance_migration.sql',
      'support_messaging_migration.sql'
    ];

    for (const sqlFile of sqlFiles) {
      const filePath = path.resolve(__dirname, '..', sqlFile);
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ SQL file not found: ${sqlFile} - skipping.`);
        continue;
      }
      console.log(`Executing SQL script: ${sqlFile}...`);
      const sqlContent = fs.readFileSync(filePath, 'utf-8');
      await client.query(sqlContent);
      console.log(`✅ Completed ${sqlFile}`);
    }

    console.log("\n🎉 Database migrations applied successfully!");
  } catch (err) {
    console.error("\n❌ Database migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
