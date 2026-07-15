import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearAndSeed() {
  console.log("Attempting to clear public tables...");
  const tables = ['messages', 'consultations', 'wallets', 'doctor_profiles'];
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      console.log(`Could not delete from ${table} (might be RLS):`, error.message);
    } else {
      console.log(`Cleared table: ${table}`);
    }
  }

  const usersToCreate = [
    { email: 'tanisha@gmail.com', password: 'abc123', role: 'doctor', name: 'Tanisha' },
    { email: 'priyanshu@gmail.com', password: 'abc123', role: 'doctor', name: 'Priyanshu' },
    { email: 'shash@gmail.com', password: 'abc123', role: 'petOwner', name: 'Shash' },
    { email: 'prradi@gmail.com', password: 'abc123', role: 'petOwner', name: 'Pradi' },
  ];

  console.log("Creating/updating users...");
  for (const u of usersToCreate) {
    let user = null;
    let { data, error } = await supabase.auth.signUp({
      email: u.email,
      password: u.password,
      options: { data: { role: u.role, name: u.name } }
    });

    if (error && error.message.includes("User already registered")) {
      const loginRes = await supabase.auth.signInWithPassword({
        email: u.email,
        password: u.password,
      });
      if (loginRes.data.user) {
        user = loginRes.data.user;
        // Also update their metadata if needed
        await supabase.auth.updateUser({ data: { role: u.role, name: u.name }});
      }
    } else if (data.user) {
      user = data.user;
    }

    if (user) {
      console.log(`Successfully set up: ${u.email} as ${u.role}`);
      
      if (u.role === 'doctor') {
        const { error: upsertErr } = await supabase.from('doctor_profiles').upsert({
          id: user.id,
          name: 'Dr. ' + u.name,
          specialization: 'General Veterinarian',
          per_minute_rate: 10,
          verified: true,
        });
        if (upsertErr) console.error("Error upserting doctor:", upsertErr);
      }
      
      await supabase.from('wallets').upsert({
        id: user.id,
        balance: 1000
      });
    } else {
      console.error(`Failed to set up ${u.email}:`, error?.message);
    }
  }
  console.log("Done seeding!");
}

clearAndSeed();
