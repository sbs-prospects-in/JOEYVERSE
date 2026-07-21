-- Phase 5: Fix Admin updating doctor verification
-- ==========================================

-- Allow admins to update doctor_profiles (specifically for the 'verified' flag)
DROP POLICY IF EXISTS "Admins update doctor profiles" ON public.doctor_profiles;
CREATE POLICY "Admins update doctor profiles" ON public.doctor_profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.admin_profiles a WHERE a.id = auth.uid())
);
