-- ========================================================================================
-- JOEYVERSE SCHEMA UPDATES - PHASE 1
-- Run this in the Supabase SQL Editor
-- 1. Dynamic Pricing for Doctors
-- 2. Platform Revenue Tracking
-- 3. Consolidated Billing RPC
-- ========================================================================================

-- 1. Update Doctor Profiles for Dynamic Pricing
ALTER TABLE public.doctor_profiles 
  ADD COLUMN IF NOT EXISTS per_minute_rate NUMERIC(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pending_rate_request NUMERIC(10, 2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rate_status TEXT CHECK (rate_status IN ('Approved', 'Pending Approval', 'Rejected')) DEFAULT 'Approved';

-- 2. Create Platform Revenue Table
CREATE TABLE IF NOT EXISTS public.platform_revenue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
    total_amount NUMERIC(10, 2) NOT NULL,
    doctor_share NUMERIC(10, 2) NOT NULL,
    platform_share NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Platform Revenue
ALTER TABLE public.platform_revenue ENABLE ROW LEVEL SECURITY;

-- Platform Revenue Policies
CREATE POLICY "Admins can view platform revenue" ON public.platform_revenue FOR SELECT USING (
  auth.jwt() ->> 'role' = 'service_role' OR auth.uid() IN (
    SELECT id FROM auth.users WHERE FALSE
  )
);

-- 3. Replace existing wallet_deduct with a robust process_consultation_billing RPC
CREATE OR REPLACE FUNCTION public.process_consultation_billing(
    p_consultation_id UUID,
    p_pet_owner_id UUID,
    p_doctor_id UUID,
    p_duration_minutes INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_doctor_rate NUMERIC(10, 2);
    v_total_fee NUMERIC(10, 2);
    v_doctor_share NUMERIC(10, 2);
    v_platform_share NUMERIC(10, 2);
    
    v_owner_wallet_id UUID;
    v_doctor_wallet_id UUID;
    v_owner_balance NUMERIC(10, 2);
    v_doctor_balance NUMERIC(10, 2);
    
    v_existing_revenue UUID;
BEGIN
    -- 1. Idempotency Check: Has this consultation already been billed?
    SELECT id INTO v_existing_revenue FROM public.platform_revenue WHERE consultation_id = p_consultation_id LIMIT 1;
    IF v_existing_revenue IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Consultation already billed');
    END IF;

    -- 2. Fetch Doctor's Approved Rate
    SELECT per_minute_rate INTO v_doctor_rate 
    FROM public.doctor_profiles 
    WHERE id = p_doctor_id AND rate_status = 'Approved';
    
    IF v_doctor_rate IS NULL THEN
        -- Fallback if no approved rate, or default to 0
        v_doctor_rate := 0;
    END IF;

    -- 3. Calculate Fees
    v_total_fee := v_doctor_rate * p_duration_minutes;
    v_doctor_share := v_total_fee * 0.70;
    v_platform_share := v_total_fee * 0.30;

    IF v_total_fee <= 0 THEN
        RETURN jsonb_build_object('success', true, 'message', 'No fee required', 'total_fee', 0);
    END IF;

    -- 4. Deduct from Pet Owner Wallet
    SELECT id, balance INTO v_owner_wallet_id, v_owner_balance
    FROM public.wallets WHERE user_id = p_pet_owner_id FOR UPDATE;

    IF v_owner_wallet_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pet Owner wallet not found');
    END IF;

    UPDATE public.wallets SET balance = balance - v_total_fee WHERE id = v_owner_wallet_id;
    INSERT INTO public.wallet_transactions (wallet_id, amount, transaction_type, description)
    VALUES (v_owner_wallet_id, -v_total_fee, 'CONSULTATION_DEDUCTION', 'Consultation fee for ' || p_duration_minutes || ' mins');

    -- 5. Credit Doctor Wallet
    -- Ensure doctor has a wallet
    SELECT id, balance INTO v_doctor_wallet_id, v_doctor_balance
    FROM public.wallets WHERE user_id = p_doctor_id FOR UPDATE;

    IF v_doctor_wallet_id IS NULL THEN
        INSERT INTO public.wallets (user_id, balance) VALUES (p_doctor_id, v_doctor_share)
        RETURNING id INTO v_doctor_wallet_id;
    ELSE
        UPDATE public.wallets SET balance = balance + v_doctor_share WHERE id = v_doctor_wallet_id;
    END IF;

    INSERT INTO public.wallet_transactions (wallet_id, amount, transaction_type, description)
    VALUES (v_doctor_wallet_id, v_doctor_share, 'CONSULTATION_EARNING', 'Earnings for ' || p_duration_minutes || ' min consultation');

    -- 6. Record Platform Revenue
    INSERT INTO public.platform_revenue (consultation_id, doctor_id, total_amount, doctor_share, platform_share)
    VALUES (p_consultation_id, p_doctor_id, v_total_fee, v_doctor_share, v_platform_share);

    RETURN jsonb_build_object(
        'success', true, 
        'total_fee', v_total_fee, 
        'doctor_share', v_doctor_share, 
        'platform_share', v_platform_share
    );
END;
$$;
