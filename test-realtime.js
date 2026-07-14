import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const ownerClient = createClient(supabaseUrl, supabaseKey);
const docClient = createClient(supabaseUrl, supabaseKey);

async function testFlow() {
  const ts = Date.now();
  console.log("1. Signing up fresh test Pet Owner & Doctor");
  const { data: ownerAuth, error: e1 } = await ownerClient.auth.signUp({
    email: `owner_${ts}@anitalk.com`,
    password: 'password123'
  });
  if (e1) return console.error("Owner signup failed:", e1);

  const { data: docAuth, error: e2 } = await docClient.auth.signUp({
    email: `doc_${ts}@anitalk.com`,
    password: 'password123'
  });
  if (e2) return console.error("Doc signup failed:", e2);

  // We must insert dummy profiles for them
  await ownerClient.from('owner_profiles').insert({ id: ownerAuth.user.id, name: 'Test Owner' });
  await docClient.from('doctor_profiles').insert({ id: docAuth.user.id, name: 'Test Doctor' });

  console.log("2. Owner creates RINGING consultation");
  const { data: consult, error: e3 } = await ownerClient.from('consultations').insert({
    doctor_id: docAuth.user.id,
    owner_id: ownerAuth.user.id,
    per_minute_rate: 35,
    status: 'RINGING'
  }).select().single();
  if (e3) return console.error("Insert error:", e3);

  const consultationId = consult.id;
  console.log("Created Consultation:", consultationId);

  console.log("3. Owner subscribes to realtime channel:", `ringing_${consultationId}`);
  let received = false;
  const channel = ownerClient
    .channel(`ringing_${consultationId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'consultations',
      filter: `id=eq.${consultationId}`
    }, (payload) => {
      console.log(">>> PET OWNER RECEIVED UPDATE:", payload.new.status);
      received = true;
    })
    .subscribe(async (status) => {
      console.log("Subscription status:", status);
      if (status === 'SUBSCRIBED') {
        console.log("4. Doctor accepts (updates to ACTIVE)");
        const { error: e4 } = await docClient.from('consultations')
          .update({ status: 'ACTIVE', started_at: new Date().toISOString() })
          .eq('id', consultationId);
        if (e4) console.error("Doctor update error:", e4);
        else console.log("Doctor successfully updated to ACTIVE");
      }
    });

  setTimeout(async () => {
    if (!received) {
      console.log("❌ Test Failed: Update not received by owner. Realtime or RLS is blocking it.");
    } else {
      console.log("✅ Test Passed: Update received successfully.");
    }
    process.exit(0);
  }, 5000);
}

testFlow();
