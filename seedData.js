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

async function seed() {
  console.log("Seeding dummy data...");

  // Generate some fake doctor profiles
  const doctors = [
    {
      id: 'doc-1234-5678-9012-3456',
      full_name: 'Dr. Sarah Jenkins',
      specialization: 'Veterinary Surgeon',
      experience_years: 12,
      consultation_rate: 15,
      is_verified: true,
      profile_image_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300',
    },
    {
      id: 'doc-9876-5432-1098-7654',
      full_name: 'Dr. Michael Chen',
      specialization: 'Feline Specialist',
      experience_years: 8,
      consultation_rate: 12,
      is_verified: false,
    },
    {
      id: 'doc-5555-4444-3333-2222',
      full_name: 'Dr. Emily Rodriguez',
      specialization: 'Exotic Pets Expert',
      experience_years: 5,
      consultation_rate: 20,
      is_verified: true,
      is_banned: true,
      profile_image_url: 'https://images.unsplash.com/photo-1594824436998-058d01de9d7b?auto=format&fit=crop&q=80&w=300&h=300',
    }
  ];

  for (const doc of doctors) {
    await supabase.from('doctor_profiles').upsert(doc);
  }

  // Generate some fake consultations
  const consultations = [
    {
      id: 'cons-1111-2222-3333-4444',
      pet_owner_id: 'user-001',
      doctor_id: 'doc-1234-5678-9012-3456',
      status: 'COMPLETED',
      per_minute_rate: 15,
      started_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      ended_at: new Date(Date.now() - 3000000).toISOString(), // 50 mins ago (10 min session)
    },
    {
      id: 'cons-5555-6666-7777-8888',
      pet_owner_id: 'user-002',
      doctor_id: 'doc-1234-5678-9012-3456',
      status: 'ACTIVE',
      per_minute_rate: 15,
      started_at: new Date(Date.now() - 300000).toISOString(), // 5 mins ago
    },
    {
      id: 'cons-9999-0000-aaaa-bbbb',
      pet_owner_id: 'user-003',
      doctor_id: 'doc-9876-5432-1098-7654',
      status: 'COMPLETED',
      per_minute_rate: 12,
      started_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      ended_at: new Date(Date.now() - 85000000).toISOString(),
    }
  ];

  for (const cons of consultations) {
    await supabase.from('consultations').upsert(cons);
  }

  // Fake wallets
  const wallets = [
    { id: 'user-001', balance: 500 },
    { id: 'user-002', balance: 1200 },
    { id: 'user-003', balance: 50 },
    { id: 'user-004', balance: 300 },
    { id: 'user-005', balance: 0 },
  ];

  for (const w of wallets) {
    await supabase.from('wallets').upsert(w);
  }
  
  // Fake messages for the ACTIVE consultation
  const messages = [
    {
      id: 'msg-1',
      consultation_id: 'cons-5555-6666-7777-8888',
      sender_id: 'user-002',
      message_text: 'Hi Dr. Jenkins, my dog is acting very lethargic today.',
      message_type: 'text',
      created_at: new Date(Date.now() - 240000).toISOString()
    },
    {
      id: 'msg-2',
      consultation_id: 'cons-5555-6666-7777-8888',
      sender_id: 'doc-1234-5678-9012-3456',
      message_text: 'Hello! I can help with that. Is he eating or drinking normally?',
      message_type: 'text',
      created_at: new Date(Date.now() - 180000).toISOString()
    },
    {
      id: 'msg-3',
      consultation_id: 'cons-5555-6666-7777-8888',
      sender_id: 'user-002',
      message_text: 'No, he hasn\'t touched his food since yesterday.',
      message_type: 'text',
      created_at: new Date(Date.now() - 120000).toISOString()
    }
  ];
  
  for (const m of messages) {
    await supabase.from('messages').upsert(m);
  }

  console.log("Dummy data seeded successfully!");
}

seed().catch(console.error);
