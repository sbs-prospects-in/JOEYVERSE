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

async function testSignup() {
  console.log('Testing signup with testing@gmail.com');
  const { data, error } = await supabase.auth.signUp({
    email: 'testing@gmail.com',
    password: 'password123',
  });
  
  console.log('Error object:', error);
  if (error) {
    console.log('Error message:', error.message);
    console.log('Error keys:', Object.keys(error));
  }
  
  console.log('Data object:', data);
}

testSignup();
