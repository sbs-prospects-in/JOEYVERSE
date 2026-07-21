-- ==============================================================================
-- Phase 4: Bug Fixes for Chat, Storage, and Feedback
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. FIX: Pet Images Storage RLS
-- ------------------------------------------------------------------------------
-- The 'pet-images' bucket was created, but no policies allowed users to upload!

DROP POLICY IF EXISTS "Allow authenticated uploads to pet-images" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to pet-images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'pet-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow public view for pet-images" ON storage.objects;
CREATE POLICY "Allow public view for pet-images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'pet-images');

DROP POLICY IF EXISTS "Users can update own pet-images" ON storage.objects;
CREATE POLICY "Users can update own pet-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'pet-images' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Users can delete own pet-images" ON storage.objects;
CREATE POLICY "Users can delete own pet-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'pet-images' AND auth.uid() = owner);


-- ------------------------------------------------------------------------------
-- 2. FIX: Messages Table Schema (Real-time Chat Fix)
-- ------------------------------------------------------------------------------
-- The messages table originally relied on `chat_id` and the deprecated `chats` table.
-- We must switch this to `consultation_id` so the frontend insert and realtime listeners work.

ALTER TABLE public.messages DROP COLUMN IF EXISTS chat_id CASCADE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE;

-- Re-apply policies for messages
DROP POLICY IF EXISTS "Participants view messages" ON public.messages;
CREATE POLICY "Participants view messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Participants insert messages" ON public.messages;
CREATE POLICY "Participants insert messages" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.consultations c 
    WHERE c.id = consultation_id 
    AND (
      (c.owner_id = sender_id AND c.doctor_id = receiver_id) OR
      (c.doctor_id = sender_id AND c.owner_id = receiver_id)
    )
  )
);


-- ------------------------------------------------------------------------------
-- 3. FIX: Consultations Table RLS (Feedback Submission Fix)
-- ------------------------------------------------------------------------------
-- The UPDATE policy might have been missing or corrupted, preventing the pet owner 
-- from saving their rating and feedback.

DROP POLICY IF EXISTS "Participants can update consultations" ON public.consultations;
CREATE POLICY "Participants can update consultations" 
ON public.consultations FOR UPDATE 
USING (auth.uid() = doctor_id OR auth.uid() = owner_id);

-- Make sure participants can also read consultations
DROP POLICY IF EXISTS "Participants can view consultations" ON public.consultations;
CREATE POLICY "Participants can view consultations" 
ON public.consultations FOR SELECT 
USING (auth.uid() = doctor_id OR auth.uid() = owner_id);

-- Make sure owners can create consultations (to start them)
DROP POLICY IF EXISTS "Owners can insert consultations" ON public.consultations;
CREATE POLICY "Owners can insert consultations" 
ON public.consultations FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- End of fixes
