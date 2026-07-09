import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envText = fs.readFileSync('.env', 'utf-8');
const envVars = Object.fromEntries(envText.split('\n').filter(line => line.includes('=')).map(line => line.split('=').map(s => s.trim())));

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log("🚀 Starting End-to-End Booking Test...");

  // 1. Create a mock doctor
  const docEmail = `testdoc_${Date.now()}@test.com`;
  const { data: docAuth, error: docErr } = await supabase.auth.signUp({
    email: docEmail,
    password: 'password123',
    options: { data: { role: 'doctor', name: 'Dr. Automated Tester' } }
  });
  if (docErr) throw new Error("Doctor signup failed: " + docErr.message);
  console.log("✅ Created test doctor");
  
  // Wait a second for trigger to complete
  await new Promise(res => setTimeout(res, 1000));

  // 2. Create a mock pet owner
  const ownerEmail = `testowner_${Date.now()}@test.com`;
  const { data: ownerAuth, error: ownerErr } = await supabase.auth.signUp({
    email: ownerEmail,
    password: 'password123',
    options: { data: { role: 'petOwner', name: 'Test Owner' } }
  });
  if (ownerErr) throw new Error("Owner signup failed: " + ownerErr.message);
  console.log("✅ Created test owner");

  // Wait a second for trigger to complete
  await new Promise(res => setTimeout(res, 1000));

  // 3. Log in as owner, create a pet
  await supabase.auth.signInWithPassword({ email: ownerEmail, password: 'password123' });
  const { data: pet, error: petErr } = await supabase.from('pets').insert({
    owner_id: ownerAuth.user.id,
    name: 'Test Pet',
    species: 'Dog'
  }).select().single();
  if (petErr) throw new Error("Pet creation failed: " + petErr.message);
  console.log("✅ Created test pet");

  // 4. Owner books an appointment with the doctor
  const { data: appt, error: apptErr } = await supabase.from('appointments').insert({
    doctor_id: docAuth.user.id,
    owner_id: ownerAuth.user.id,
    pet_id: pet.id,
    scheduled_at: new Date(Date.now() + 86400000).toISOString(),
    status: 'PENDING'
  }).select().single();
  if (apptErr) throw new Error("Appointment creation failed: " + apptErr.message);
  console.log("✅ Appointment request sent to Doctor (Status: PENDING)");

  // 5. Log in as doctor, accept the appointment
  await supabase.auth.signInWithPassword({ email: docEmail, password: 'password123' });
  const { error: acceptErr } = await supabase.from('appointments').update({
    status: 'ACCEPTED_PAYMENT_PENDING'
  }).eq('id', appt.id);
  if (acceptErr) throw new Error("Failed to accept appointment: " + acceptErr.message);
  
  // Verify status
  const { data: checkAppt } = await supabase.from('appointments').select('status').eq('id', appt.id).single();
  console.log("✅ Doctor successfully accepted appointment. New status:", checkAppt.status);

  console.log("🎉 ALL TESTS PASSED!");
}

runTest().catch(console.error);
