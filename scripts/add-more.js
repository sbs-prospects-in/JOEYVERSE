import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const PASSWORD = 'password123';

async function addDocs() {
  const d2 = await supabase.auth.signUp({
    email: 'marcus@anitalk.com',
    password: PASSWORD,
    options: { data: { role: 'doctor', name: 'Dr. Marcus Owens' } }
  });
  if (d2.data?.user) {
    await supabase.from('doctor_profiles').upsert({
      id: d2.data.user.id, name: 'Dr. Marcus Owens', email: 'marcus@anitalk.com', specialization: 'Avian & Exotic Animals',
      experience_years: 12, consultation_fee: 40, rating: 4.8, about: 'Experienced in avian medicine.'
    });
  }

  const d3 = await supabase.auth.signUp({
    email: 'priya@anitalk.com',
    password: PASSWORD,
    options: { data: { role: 'doctor', name: 'Dr. Priya Nair' } }
  });
  if (d3.data?.user) {
    await supabase.from('doctor_profiles').upsert({
      id: d3.data.user.id, name: 'Dr. Priya Nair', email: 'priya@anitalk.com', specialization: 'Feline Dermatology',
      experience_years: 7, consultation_fee: 30, rating: 4.9, about: 'Feline skin clinic head.'
    });
  }
}
addDocs();
