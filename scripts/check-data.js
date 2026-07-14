import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkData() {
  console.log("Checking tables...");
  const tables = ['owner_profiles', 'pets', 'appointments'];
  for (let t of tables) {
    const { count } = await supabase.from(t).select('*', { count: 'exact', head: true });
    console.log(t, 'count:', count);
  }
}
checkData();
