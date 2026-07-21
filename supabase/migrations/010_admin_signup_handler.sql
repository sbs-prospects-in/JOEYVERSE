-- Update handle_new_user to automatically insert into admin_profiles if role is 'admin'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  role TEXT;
  name_val TEXT;
  license_number TEXT;
BEGIN
  -- Extract from metadata
  role := new.raw_user_meta_data->>'role';
  name_val := new.raw_user_meta_data->>'name';
  license_number := new.raw_user_meta_data->>'license_number';

  IF role = 'doctor' THEN
    INSERT INTO public.doctor_profiles (id, name, license_number)
    VALUES (new.id, COALESCE(name_val, split_part(new.email, '@', 1)), license_number);
    
    -- Initialize default availability
    INSERT INTO public.doctor_availability (doctor_id)
    VALUES (new.id);
    
  ELSIF role = 'petOwner' THEN
    INSERT INTO public.owner_profiles (id, name)
    VALUES (new.id, COALESCE(name_val, split_part(new.email, '@', 1)));
    
  -- If role is admin or anything else, just skip profile insertion since we don't have an admin_profiles table
  END IF;

  -- Create wallet for all users (including admins)
  INSERT INTO public.wallets (user_id, balance)
  VALUES (new.id, 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
