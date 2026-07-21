-- Phase 3: Fix pets RLS policy so doctors can view pet profiles for their consultations

DROP POLICY IF EXISTS "Doctors view patients" ON public.pets;

CREATE POLICY "Doctors view patients" ON public.pets FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.consultations WHERE consultations.pet_id = pets.id AND consultations.doctor_id = auth.uid())
);
