-- ==============================================================================
-- Phase 6: Fix Admin RLS Policies (Using JWT Role)
-- ==============================================================================

-- 1. Fix doctor_profiles update for admins (previously failed due to missing admin_profiles table)
DROP POLICY IF EXISTS "Admins update doctor profiles" ON public.doctor_profiles;
CREATE POLICY "Admins update doctor profiles" ON public.doctor_profiles 
FOR UPDATE USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- 2. Allow admins to view all consultations
DROP POLICY IF EXISTS "Admins view consultations" ON public.consultations;
CREATE POLICY "Admins view consultations" ON public.consultations 
FOR SELECT USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- 3. Allow admins to update consultations (e.g., force ending a consultation)
DROP POLICY IF EXISTS "Admins update consultations" ON public.consultations;
CREATE POLICY "Admins update consultations" ON public.consultations 
FOR UPDATE USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
