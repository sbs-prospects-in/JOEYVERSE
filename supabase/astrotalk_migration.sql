-- ========================================================================================
-- ANITALK ASTROTALK-MODEL MIGRATION
-- Copy and paste this into your Supabase SQL Editor and click "Run".
-- ========================================================================================

-- 1. Modify Doctor Profiles for Live Status & Per-Minute Rates
ALTER TABLE public.doctor_profiles 
ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'OFFLINE',
ADD COLUMN IF NOT EXISTS per_minute_rate NUMERIC DEFAULT 10.0;

-- 2. Create Wallets Table
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
    balance NUMERIC DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Wallet Transactions Table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES public.wallets NOT NULL,
    amount NUMERIC NOT NULL,
    transaction_type VARCHAR NOT NULL, -- 'TOPUP', 'DEDUCTION'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Consultations Table (Replaces old Appointments)
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
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security) if needed, though for a prototype we can keep it open or just grant all
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- For prototype simplicity, allow all access
DROP POLICY IF EXISTS "Enable read access for all" ON public.wallets;
CREATE POLICY "Enable read access for all" ON public.wallets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all" ON public.wallet_transactions;
CREATE POLICY "Enable read access for all" ON public.wallet_transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all" ON public.consultations;
CREATE POLICY "Enable read access for all" ON public.consultations FOR ALL USING (true) WITH CHECK (true);

-- Ensure doctor_profiles is fully open for prototype editing
DROP POLICY IF EXISTS "Enable full access for all" ON public.doctor_profiles;
CREATE POLICY "Enable full access for all" ON public.doctor_profiles FOR ALL USING (true) WITH CHECK (true);
