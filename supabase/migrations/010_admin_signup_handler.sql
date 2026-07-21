
-- Update handle_new_user to automatically insert into admin_profiles if role is 'admin'
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $body
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
    INSERT INTO public.doctor_profiles (id, name, license_number, specialization, phone)
    VALUES (new.id, COALESCE(name, 'Doctor'), license_number, specialization, phone);
    
    -- Initialize default availability
    INSERT INTO public.doctor_availability (doctor_id)
    VALUES (new.id);
  ELSIF role = 'petOwner' THEN
    INSERT INTO public.owner_profiles (id, name)
    VALUES (new.id, COALESCE(name, 'Pet Owner'));
  ELSIF role = 'admin' THEN
    INSERT INTO public.admin_profiles (id)
    VALUES (new.id);
  END IF;

  RETURN new;
END;
$body LANGUAGE plpgsql SECURITY DEFINER;
