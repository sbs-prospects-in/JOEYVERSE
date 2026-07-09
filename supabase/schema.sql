-- ========================================================================================
-- PETCONNECT SUPABASE SCHEMA
-- This script safely drops existing structures and rebuilds the PetConnect database schema.
-- Copy and paste this entirely into the Supabase SQL Editor and click "Run".
-- ========================================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. DROP EXISTING TABLES (For clean setup)
-- ==========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.chats CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.doctor_availability CASCADE;
DROP TABLE IF EXISTS public.pets CASCADE;
DROP TABLE IF EXISTS public.doctor_profiles CASCADE;
DROP TABLE IF EXISTS public.owner_profiles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE; -- Drop old combined table if it exists

-- ==========================================
-- 2. CREATE TABLES
-- ==========================================

-- 2.1 Owner Profiles
CREATE TABLE public.owner_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.2 Doctor Profiles
CREATE TABLE public.doctor_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    specialization TEXT,
    license_number TEXT,
    bio TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.3 Doctor Availability
CREATE TABLE public.doctor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
    current_status TEXT NOT NULL CHECK (current_status IN ('Available Now', 'Accepting Requests', 'In Consultation', 'Offline')) DEFAULT 'Offline',
    working_days TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    start_time TIME DEFAULT '09:00:00',
    end_time TIME DEFAULT '17:00:00',
    slot_duration_minutes INTEGER DEFAULT 30,
    max_daily_appointments INTEGER DEFAULT 10,
    UNIQUE(doctor_id)
);

-- 2.4 Pets
CREATE TABLE public.pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.owner_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    age INTEGER,
    medical_history TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.5 Appointments
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.owner_profiles(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'REJECTED', 'ACCEPTED_PAYMENT_PENDING', 'CONFIRMED', 'READY_FOR_CHAT', 'COMPLETED', 'CANCELED')) DEFAULT 'PENDING',
    meeting_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.6 Payments
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')) DEFAULT 'PENDING',
    stripe_session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.7 Chats
CREATE TABLE public.chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.owner_profiles(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(appointment_id)
);

-- 2.8 Messages
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message_text TEXT,
    message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'video', 'pdf', 'voice')) DEFAULT 'text',
    file_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.9 Documents
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    doc_type TEXT NOT NULL CHECK (doc_type IN ('prescription', 'report', 'xray', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE public.owner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. RLS POLICIES
-- ==========================================

-- Owner Profiles: Owners can read/update their own profile. Anyone can read an owner's name.
CREATE POLICY "Public read owner profiles" ON public.owner_profiles FOR SELECT USING (true);
CREATE POLICY "Owners update own profile" ON public.owner_profiles FOR UPDATE USING (auth.uid() = id);

-- Doctor Profiles: Publicly readable (for discovery). Doctors update their own.
CREATE POLICY "Public read doctor profiles" ON public.doctor_profiles FOR SELECT USING (true);
CREATE POLICY "Doctors update own profile" ON public.doctor_profiles FOR UPDATE USING (auth.uid() = id);

-- Doctor Availability: Publicly readable. Doctors update their own.
CREATE POLICY "Public read doctor availability" ON public.doctor_availability FOR SELECT USING (true);
CREATE POLICY "Doctors update own availability" ON public.doctor_availability FOR ALL USING (auth.uid() = doctor_id);

-- Pets: Owners can CRUD their own pets. Doctors can view pets assigned to their appointments.
CREATE POLICY "Owners manage own pets" ON public.pets FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Doctors view patients" ON public.pets FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.appointments WHERE appointments.pet_id = pets.id AND appointments.doctor_id = auth.uid())
);

-- Appointments: Owners manage theirs, Doctors manage theirs.
CREATE POLICY "Users view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = doctor_id);
CREATE POLICY "Owners create appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Doctors update appointments" ON public.appointments FOR UPDATE USING (auth.uid() = doctor_id);
CREATE POLICY "Owners update appointments" ON public.appointments FOR UPDATE USING (auth.uid() = owner_id);

-- Chats: Only participants can view.
CREATE POLICY "Participants view chats" ON public.chats FOR SELECT USING (auth.uid() = doctor_id OR auth.uid() = owner_id);

-- Messages: Only participants can read/insert.
CREATE POLICY "Participants view messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Participants insert messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receivers can update is_read" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);

-- Documents: Uploader manages, linked appointment participants can view.
CREATE POLICY "Uploaders manage documents" ON public.documents FOR ALL USING (auth.uid() = uploader_id);
CREATE POLICY "Participants view documents" ON public.documents FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.appointments WHERE appointments.id = documents.appointment_id AND (appointments.doctor_id = auth.uid() OR appointments.owner_id = auth.uid()))
);

-- ==========================================
-- 5. SUPABASE STORAGE BUCKETS
-- ==========================================
-- Ensure you run this via Supabase dashboard manually if this SQL fails for buckets, 
-- or use the Supabase Storage UI to create these buckets.
INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true),
('pet-images', 'pet-images', true),
('chat-media', 'chat-media', false),
('medical-documents', 'medical-documents', false)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 6. AUTHENTICATION TRIGGER
-- ==========================================
-- Automatically route new signups into correct profile tables based on metadata
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  role TEXT;
  name TEXT;
  license_number TEXT;
BEGIN
  -- Extract from metadata
  role := new.raw_user_meta_data->>'role';
  name := new.raw_user_meta_data->>'name';
  license_number := new.raw_user_meta_data->>'license_number';

  IF role = 'doctor' THEN
    INSERT INTO public.doctor_profiles (id, name, license_number)
    VALUES (new.id, COALESCE(name, 'Doctor'), license_number);
    
    -- Initialize default availability
    INSERT INTO public.doctor_availability (doctor_id)
    VALUES (new.id);
  ELSIF role = 'petOwner' THEN
    INSERT INTO public.owner_profiles (id, name)
    VALUES (new.id, COALESCE(name, 'Pet Owner'));
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 7. ENABLE REALTIME
-- ==========================================
-- Realtime is required for live chat and instant dashboard updates
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ==========================================
-- SUPABASE SCHEMA COMPLETE
-- ==========================================
