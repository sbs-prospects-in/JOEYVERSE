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

async function testDb() {
  console.log('Testing db connection');
  const { data, error } = await supabase.from('users').select('*').limit(1);
  console.log('Users query error:', error);
  console.log('Users query data:', data);
  
  const { data: data2, error: error2 } = await supabase.from('profiles').select('*').limit(1);
  console.log('Profiles query error:', error2);
}

testDb();
