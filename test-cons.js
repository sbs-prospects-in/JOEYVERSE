import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('consultations').select('id, status, owner_id').limit(5);
  console.log("Consultations:", data);
  if (data && data.length > 0) {
     const ids = data.map(d => d.owner_id);
     const { data: owners } = await supabase.from('owner_profiles').select('*').in('id', ids);
     console.log("Owners:", owners);
  }
}
check();
