import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function setupWallets() {
  console.log("Fetching all users...");
  // We can't fetch auth.users directly via anon, but we can fetch profiles
  const { data: owners } = await supabase.from('owner_profiles').select('id');
  const { data: doctors } = await supabase.from('doctor_profiles').select('id');
  
  const allUsers = [...(owners || []), ...(doctors || [])];
  
  for (const user of allUsers) {
    const { error } = await supabase.from('wallets').upsert({
      user_id: user.id,
      balance: 100.0 // Give everyone  starting balance
    });
    if (error) {
      console.log('Error creating wallet for', user.id, error.message);
    } else {
      console.log('Created wallet for', user.id);
    }
  }
  console.log("Done!");
}
setupWallets();
