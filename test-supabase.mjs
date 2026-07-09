
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const envLines = envContent.split('\n');
let url = '';
let key = '';

for (const line of envLines) {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
}

console.log('Testing URL:', url);
console.log('Testing Key (first 10 chars):', key.substring(0, 10));

async function testSupabase() {
  try {
    const res = await fetch(`${url}/auth/v1/settings?apikey=${key}`);
    const data = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', data);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testSupabase();
