-- Add primary concern column to consultations
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS primary_concern TEXT;
