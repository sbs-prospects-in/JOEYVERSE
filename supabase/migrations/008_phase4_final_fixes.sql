-- ==============================================================================
-- Phase 4: Final Bug Fixes (Admin Recursion & Missing Columns)
-- ==============================================================================

-- 1. FIX: Infinite Recursion on admin_profiles
-- The previous policy caused an infinite loop, crashing all message queries!
DROP POLICY IF EXISTS "Admins view admin profiles" ON public.admin_profiles;
CREATE POLICY "Admins view admin profiles" ON public.admin_profiles FOR SELECT USING (
  auth.uid() = id
);


-- 2. FIX: Missing Columns for Feedback
-- The consultations table was missing the rating and review_text columns, 
-- causing the feedback submission to fail.
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2);
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS review_text TEXT;

-- (Re-apply UPDATE policy for good measure to ensure feedback can be saved)
DROP POLICY IF EXISTS "Participants can update consultations" ON public.consultations;
CREATE POLICY "Participants can update consultations" 
ON public.consultations FOR UPDATE 
USING (auth.uid() = doctor_id OR auth.uid() = owner_id);

-- End of fixes
