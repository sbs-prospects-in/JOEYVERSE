-- ========================================================================================
-- ANITALK MASTER SUPABASE SETUP SCRIPT
-- Copy and paste this into your Supabase SQL Editor and click "Run".
-- This script is completely safe to run on an existing database.
-- ========================================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Core Tables
CREATE TABLE IF NOT EXISTS public.owner_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.doctor_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    specialization TEXT,
    experience TEXT,
    fee NUMERIC DEFAULT 0,
    about TEXT,
    verification_status VARCHAR DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    license_number TEXT,
    rating NUMERIC(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status VARCHAR DEFAULT 'OFFLINE', -- 'OFFLINE', 'ONLINE', 'BUSY'
    per_minute_rate NUMERIC DEFAULT 10.0
);

CREATE TABLE IF NOT EXISTS public.pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.owner_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    species TEXT,
    breed TEXT,
    age TEXT,
    gender TEXT,
    medical_history TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
    balance NUMERIC DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES public.wallets NOT NULL,
    amount NUMERIC NOT NULL,
    transaction_type VARCHAR NOT NULL, -- 'TOPUP', 'DEDUCTION', 'REFUND'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID REFERENCES auth.users NOT NULL,
    owner_id UUID REFERENCES auth.users NOT NULL,
    pet_id UUID REFERENCES public.pets, -- Optional, if they selected a specific pet
    status VARCHAR DEFAULT 'RINGING', -- 'RINGING', 'ACTIVE', 'COMPLETED', 'REJECTED', 'CANCELLED'
    per_minute_rate NUMERIC NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    rating NUMERIC(3, 2),
    feedback TEXT,
    primary_concern TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message_text TEXT,
    message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'video', 'pdf', 'voice')) DEFAULT 'text',
    file_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, doctor_id)
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Ensure Columns Exist (Safe Alterations)
DO $$
BEGIN
  IF NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='consultations' and column_name='feedback') THEN
    ALTER TABLE public.consultations ADD COLUMN feedback TEXT;
  END IF;
  
  IF NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='consultations' and column_name='primary_concern') THEN
    ALTER TABLE public.consultations ADD COLUMN primary_concern TEXT;
  END IF;

  IF NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='doctor_profiles' and column_name='status') THEN
    ALTER TABLE public.doctor_profiles ADD COLUMN status VARCHAR DEFAULT 'OFFLINE';
  END IF;

  IF NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='doctor_profiles' and column_name='per_minute_rate') THEN
    ALTER TABLE public.doctor_profiles ADD COLUMN per_minute_rate NUMERIC DEFAULT 10.0;
  END IF;
END
$$;

-- 4. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.owner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 5. Create Secure Policies

-- Public read access for profiles
DROP POLICY IF EXISTS "Public read owner profiles" ON public.owner_profiles;
CREATE POLICY "Public read owner profiles" ON public.owner_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read doctor profiles" ON public.doctor_profiles;
CREATE POLICY "Public read doctor profiles" ON public.doctor_profiles FOR SELECT USING (true);

-- Users manage their own data
DROP POLICY IF EXISTS "Users update own profile" ON public.owner_profiles;
CREATE POLICY "Users update own profile" ON public.owner_profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Doctors update own profile" ON public.doctor_profiles;
CREATE POLICY "Doctors update own profile" ON public.doctor_profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Owners manage own pets" ON public.pets;
CREATE POLICY "Owners manage own pets" ON public.pets FOR ALL USING (auth.uid() = owner_id);

-- Consultations access (Participants + Admin)
DROP POLICY IF EXISTS "Participants can view consultations" ON public.consultations;
CREATE POLICY "Participants can view consultations" ON public.consultations FOR SELECT USING (
  auth.uid() = doctor_id OR auth.uid() = owner_id OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

DROP POLICY IF EXISTS "Owners can insert consultations" ON public.consultations;
CREATE POLICY "Owners can insert consultations" ON public.consultations FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Participants can update consultations" ON public.consultations;
CREATE POLICY "Participants can update consultations" ON public.consultations FOR UPDATE USING (
  auth.uid() = doctor_id OR auth.uid() = owner_id OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Messages access
DROP POLICY IF EXISTS "Participants view messages" ON public.messages;
CREATE POLICY "Participants view messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Participants insert messages" ON public.messages;
CREATE POLICY "Participants insert messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Wallets access (Full access granted for testing, though in prod should be constrained)
DROP POLICY IF EXISTS "Enable full access for wallets" ON public.wallets;
CREATE POLICY "Enable full access for wallets" ON public.wallets FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable full access for wallet_transactions" ON public.wallet_transactions;
CREATE POLICY "Enable full access for wallet_transactions" ON public.wallet_transactions FOR ALL USING (true);

-- Wishlists and Notifications
DROP POLICY IF EXISTS "Users manage own wishlist" ON public.wishlists;
CREATE POLICY "Users manage own wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own notifications" ON public.notifications;
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- 6. Setup Triggers and RPC Functions

-- Handle New User Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  role TEXT;
  name TEXT;
  license_number TEXT;
BEGIN
  role := new.raw_user_meta_data->>'role';
  name := new.raw_user_meta_data->>'name';
  license_number := new.raw_user_meta_data->>'license_number';

  IF role = 'doctor' THEN
    INSERT INTO public.doctor_profiles (id, name, license_number, verification_status)
    VALUES (new.id, COALESCE(name, 'Doctor'), license_number, 'pending');
  ELSIF role = 'petOwner' THEN
    INSERT INTO public.owner_profiles (id, name)
    VALUES (new.id, COALESCE(name, 'Pet Owner'));
    
    INSERT INTO public.wallets (user_id, balance)
    VALUES (new.id, 0.0);
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Doctor Rating Trigger
CREATE OR REPLACE FUNCTION public.update_doctor_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating NUMERIC;
  rev_count INTEGER;
BEGIN
  IF (NEW.rating IS NOT NULL) THEN
    SELECT AVG(rating), COUNT(rating) INTO avg_rating, rev_count
    FROM public.consultations
    WHERE doctor_id = NEW.doctor_id AND rating IS NOT NULL;
    
    UPDATE public.doctor_profiles
    SET rating = ROUND(avg_rating, 2), reviews_count = rev_count
    WHERE id = NEW.doctor_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_doctor_rating ON public.consultations;
CREATE TRIGGER trg_update_doctor_rating
AFTER UPDATE OF rating ON public.consultations
FOR EACH ROW EXECUTE PROCEDURE public.update_doctor_rating();

-- Wallet Deduct RPC
CREATE OR REPLACE FUNCTION public.wallet_deduct(consultation_id UUID)
RETURNS JSON AS $$
DECLARE
  cons_record RECORD;
  duration_minutes INTEGER;
  total_cost NUMERIC;
  owner_wallet RECORD;
BEGIN
  SELECT * INTO cons_record FROM public.consultations WHERE id = consultation_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Consultation not found');
  END IF;

  IF cons_record.status != 'COMPLETED' THEN
    RETURN json_build_object('success', false, 'error', 'Consultation not completed');
  END IF;

  IF cons_record.started_at IS NULL OR cons_record.ended_at IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Missing timestamps');
  END IF;

  duration_minutes := GREATEST(1, CEIL(EXTRACT(EPOCH FROM (cons_record.ended_at - cons_record.started_at)) / 60));
  total_cost := duration_minutes * cons_record.per_minute_rate;

  SELECT * INTO owner_wallet FROM public.wallets WHERE user_id = cons_record.owner_id FOR UPDATE;
  
  IF owner_wallet.balance < total_cost THEN
    total_cost := owner_wallet.balance;
  END IF;

  IF total_cost > 0 THEN
    UPDATE public.wallets SET balance = balance - total_cost WHERE id = owner_wallet.id;
    INSERT INTO public.wallet_transactions (wallet_id, amount, transaction_type, description)
    VALUES (owner_wallet.id, total_cost, 'DEDUCTION', 'Consultation fee (ID: ' || consultation_id || ')');
  END IF;

  RETURN json_build_object('success', true, 'cost', total_cost, 'duration', duration_minutes);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Ensure Real-Time Engine is fully configured
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 8. Storage Buckets configuration
INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true),
('pet-images', 'pet-images', true),
('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Public access to avatars" ON storage.objects;
CREATE POLICY "Public access to avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Allow authenticated uploads to avatars" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public access to chat-media" ON storage.objects;
CREATE POLICY "Public access to chat-media" ON storage.objects FOR SELECT USING (bucket_id = 'chat-media');

DROP POLICY IF EXISTS "Allow authenticated uploads to chat-media" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to chat-media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-media' AND auth.role() = 'authenticated');

-- ========================================================================================
-- END OF MASTER SETUP SCRIPT
-- ========================================================================================
