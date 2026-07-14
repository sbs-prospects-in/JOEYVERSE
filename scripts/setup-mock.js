import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const PASSWORD = 'password123';

async function setupMock() {
  const o1 = await supabase.auth.signUp({
    email: 'sarah@anitalk.com',
    password: PASSWORD,
    options: { data: { role: 'petOwner', name: 'Sarah Connor' } }
  });
  if (o1.data?.user) {
    await supabase.from('owner_profiles').upsert({
      id: o1.data.user.id, name: 'Sarah Connor', email: 'sarah@anitalk.com'
    });
    const { data: pet } = await supabase.from('pets').insert({
      owner_id: o1.data.user.id, name: 'Max', species: 'Dog', breed: 'Golden Retriever',
      age_years: 3, weight_kg: 25, conditions: 'Healthy'
    }).select().single();

    // Fetch dr anjali
    const { data: dr } = await supabase.from('doctor_profiles').select('id').limit(1).single();
    if (dr && pet) {
      await supabase.from('appointments').insert({
        owner_id: o1.data.user.id, doctor_id: dr.id, pet_id: pet.id,
        scheduled_at: new Date(Date.now() + 86400000).toISOString(),
        status: 'PENDING', amount: 35, issue_description: 'Annual checkup'
      });
    }
  }
}
setupMock();
