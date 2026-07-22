-- Fix for handle_new_user trigger in Supabase
-- This fixes the issue where the trigger attempts to insert into `verification_status` 
-- which does not exist in `doctor_profiles` (it's called `verified`).

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  role TEXT;
  name TEXT;
  license_number TEXT;
  specialization TEXT;
  phone TEXT;
BEGIN
  -- Extract from metadata
  role := new.raw_user_meta_data->>'role';
  name := new.raw_user_meta_data->>'name';
  license_number := new.raw_user_meta_data->>'license_number';
  specialization := new.raw_user_meta_data->>'specialization';
  phone := new.raw_user_meta_data->>'phone';

  IF role = 'doctor' THEN
    -- Fixed: Insert into 'verified' (as false) rather than 'verification_status'
    INSERT INTO public.doctor_profiles (id, name, license_number, specialization, phone, verified)
    VALUES (new.id, COALESCE(name, 'Doctor'), license_number, specialization, phone, false);
    
    -- Initialize default availability
    INSERT INTO public.doctor_availability (doctor_id)
    VALUES (new.id);
  ELSIF role = 'petOwner' THEN
    INSERT INTO public.owner_profiles (id, name, phone)
    VALUES (new.id, COALESCE(name, 'Pet Owner'), phone);
    
    -- Note: wallets table creation depends on your schema, 
    -- if you still use it, keep this:
    INSERT INTO public.wallets (user_id, balance)
    VALUES (new.id, 0.0);
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
