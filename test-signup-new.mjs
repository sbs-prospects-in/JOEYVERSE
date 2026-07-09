import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env', 'utf8');
const envLines = envContent.split('\n');
let url = '';
let key = '';

for (const line of envLines) {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
}

const supabase = createClient(url, key);

async function testSignupNew() {
  const randomEmail = `testuser_${Date.now()}@example.com`;
  console.log(`Testing signup with ${randomEmail}`);
  const { data, error } = await supabase.auth.signUp({
    email: randomEmail,
    password: 'password123',
    options: {
      data: {
        role: 'petOwner',
        name: 'Test User'
      }
    }
  });
  
  console.log('Error object:', error);
  if (error) {
    console.log('Error message:', error.message);
  }
  
  console.log('Data object:', data);
}

testSignupNew();
