-- ==========================================
-- PHASE 1: DOCTOR VERIFICATION & ENFORCEMENT
-- ==========================================

-- 1. Add Phone column to doctor_profiles if missing
ALTER TABLE public.doctor_profiles
ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. Update the handle_new_user trigger to include phone and specialization
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
    INSERT INTO public.doctor_profiles (id, name, license_number, specialization, phone)
    VALUES (new.id, COALESCE(name, 'Doctor'), license_number, specialization, phone);
    
    -- Initialize default availability
    INSERT INTO public.doctor_availability (doctor_id)
    VALUES (new.id);
  ELSIF role = 'petOwner' THEN
    INSERT INTO public.owner_profiles (id, name, phone)
    VALUES (new.id, COALESCE(name, 'Pet Owner'), phone);
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger to enforce verification for ONLINE status
CREATE OR REPLACE FUNCTION public.enforce_doctor_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- If they are trying to go ONLINE but are not verified, block it
  IF NEW.status = 'ONLINE' AND (NEW.verified IS NULL OR NEW.verified = false) THEN
    RAISE EXCEPTION 'Doctor must be verified by an admin before going ONLINE.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_doctor_verification ON public.doctor_profiles;
CREATE TRIGGER trg_enforce_doctor_verification
  BEFORE UPDATE OF status ON public.doctor_profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.enforce_doctor_verification();
