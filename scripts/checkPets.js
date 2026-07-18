import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function testInsert() {
  const { error } = await supabase.from('pets').insert({
    owner_id: '00000000-0000-0000-0000-000000000000',
    name: 'Test Pet',
    pet_id: 'PET-1234',
    image_url: 'https://example.com/image.jpg'
  });
  console.log("Insert result:", error ? error.message : "Success");
}

testInsert();
