import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const DOCTOR_EMAIL = 'doctor@anitalk.com';
const OWNER_EMAIL = 'owner@anitalk.com';
const PASSWORD = 'password123';

async function setup() {
  console.log("Setting up Supabase Data...");

  // 1. Setup Doctor
  let doctorUser = null;
  const { data: docData, error: docErr } = await supabase.auth.signUp({
    email: DOCTOR_EMAIL,
    password: PASSWORD,
    options: { data: { role: 'doctor', name: 'Dr. Anjali Mehta' } }
  });

  if (docErr && docErr.message.includes('already registered')) {
    console.log("Doctor already registered. Logging in...");
    const { data: loginData } = await supabase.auth.signInWithPassword({ email: DOCTOR_EMAIL, password: PASSWORD });
    doctorUser = loginData?.user;
  } else {
    doctorUser = docData?.user;
  }

  if (doctorUser) {
    console.log("Doctor ID:", doctorUser.id);
    await supabase.from('doctor_profiles').upsert({
      id: doctorUser.id,
      name: 'Dr. Anjali Mehta',
      email: DOCTOR_EMAIL,
      specialization: 'Canine & Feline Medicine',
      experience_years: 10,
      consultation_fee: 35,
      rating: 4.9,
      about: 'Specialist in companion animal diagnostics, preventative clinical therapy, and vaccine schedules.'
    });
    await supabase.from('doctor_availability').upsert({
      doctor_id: doctorUser.id,
      current_status: 'Online',
      is_accepting_emergencies: true
    });
  }

  // 2. Setup Pet Owner
  let ownerUser = null;
  const { data: ownerData, error: ownerErr } = await supabase.auth.signUp({
    email: OWNER_EMAIL,
    password: PASSWORD,
    options: { data: { role: 'petOwner', name: 'Sarah Connor' } }
  });

  if (ownerErr && ownerErr.message.includes('already registered')) {
    console.log("Owner already registered. Logging in...");
    const { data: loginData } = await supabase.auth.signInWithPassword({ email: OWNER_EMAIL, password: PASSWORD });
    ownerUser = loginData?.user;
  } else {
    ownerUser = ownerData?.user;
  }

  if (ownerUser && doctorUser) {
    console.log("Owner ID:", ownerUser.id);
    await supabase.from('owner_profiles').upsert({
      id: ownerUser.id,
      name: 'Sarah Connor',
      email: OWNER_EMAIL,
      phone: '+1 555-0199'
    });

    const { data: petData } = await supabase.from('pets').insert({
      owner_id: ownerUser.id,
      name: 'Max',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: 3,
      gender: 'Male',
      weight: 25.5
    }).select().single();

    if (petData) {
      await supabase.from('appointments').insert({
        doctor_id: doctorUser.id,
        owner_id: ownerUser.id,
        pet_id: petData.id,
        scheduled_at: new Date(Date.now() + 86400000).toISOString(),
        status: 'PENDING',
        symptoms: 'Slight limp in left hind leg after running.',
        consultation_type: 'Video',
        fee: 35
      });
    }
  }
  console.log("Setup complete!");
}
setup().catch(console.error);
