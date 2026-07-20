-- ========================================================================================
-- JOEYVERSE SCHEMA UPDATES
-- Run this in the Supabase SQL Editor AFTER the main schema.sql
-- ========================================================================================

-- 1. Add short_id sequence columns for human-readable IDs
-- Add serial short_id to owner_profiles
ALTER TABLE public.owner_profiles ADD COLUMN IF NOT EXISTS short_id SERIAL;
ALTER TABLE public.doctor_profiles ADD COLUMN IF NOT EXISTS short_id SERIAL;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS short_id SERIAL;

-- 2. Add age_unit column to pets (to store 'Years' or 'Months')
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS age_unit TEXT DEFAULT 'Years';

-- 3. Add city, state, languages, experience, qualification, bio to doctor_profiles
ALTER TABLE public.doctor_profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.doctor_profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.doctor_profiles ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['English'];
ALTER TABLE public.doctor_profiles ADD COLUMN IF NOT EXISTS experience TEXT;
ALTER TABLE public.doctor_profiles ADD COLUMN IF NOT EXISTS qualification TEXT;
ALTER TABLE public.doctor_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.doctor_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.doctor_profiles ADD COLUMN IF NOT EXISTS per_minute_rate INTEGER DEFAULT 10;

-- 4. Add city, state, phone, avatar_url to owner_profiles
ALTER TABLE public.owner_profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.owner_profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.owner_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 5. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('consultation', 'wallet', 'appointment', 'chat', 'system')) DEFAULT 'system',
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only see and manage their own notifications
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Enable Realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 6. Enable Realtime for doctor_profiles (for status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.doctor_profiles;

-- 7. Wishlist table with unique constraint to prevent duplicates
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, doctor_id)
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);

-- ========================================================================================
-- SCHEMA UPDATES COMPLETE
-- ========================================================================================
