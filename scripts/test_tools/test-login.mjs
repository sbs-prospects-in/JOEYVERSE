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

async function testLogin() {
  console.log('Testing login with testing@gmail.com');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'testing@gmail.com',
    password: 'password123',
  });
  
  if (error) {
    console.log('Login failed:', error.message);
  } else {
    console.log('Login successful! User ID:', data.user.id);
  }
}

testLogin();
