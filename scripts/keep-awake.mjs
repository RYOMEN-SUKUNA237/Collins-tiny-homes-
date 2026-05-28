import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mdvvtrejlpvgfnbueruh.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kdnZ0cmVqbHB2Z2ZuYnVlcnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NDYzNjgsImV4cCI6MjA5MzEyMjM2OH0.0F_A4Gzb7VPOtjLYSWHBHm4d5Fb9fpVVy7_oluwmtyQ';

async function keepSupabaseAwake() {
  console.log(`[${new Date().toISOString()}] Pinging Supabase to prevent project pause...`);
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // A simple lightweight query to wake up the database
    const { data, error } = await supabase
      .from('site_settings')
      .select('key')
      .limit(1);
      
    if (error) {
      console.error(`[${new Date().toISOString()}] Error pinging Supabase:`, error.message);
      process.exit(1);
    }
    
    console.log(`[${new Date().toISOString()}] Ping successful! Project is awake.`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Fatal error during ping:`, err);
    process.exit(1);
  }
}

keepSupabaseAwake();
