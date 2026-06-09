import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mdvvtrejlpvgfnbueruh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kdnZ0cmVqbHB2Z2ZuYnVlcnVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzU0NjM2OCwiZXhwIjoyMDkzMTIyMzY4fQ.4ZYIs4eCsNJK2QHIDjxzH1neno808ZF5-tsVB5V2pTg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, title, status');
  
  if (error) {
    console.error("Error fetching listings:", error);
    return;
  }

  console.log("Current listings status:");
  listings.forEach(l => {
    console.log(`- ${l.title}: ${l.status}`);
  });

  const sold = listings.filter(l => l.status === 'sold');
  if (sold.length > 0) {
    console.log(`Resetting ${sold.length} sold listings back to active...`);
    for (const l of sold) {
      await supabase.from('listings').update({ status: 'active' }).eq('id', l.id);
    }
    console.log("Done!");
  } else {
    console.log("No listings are marked as sold yet.");
  }
}

run();
