-- ==============================================================================
-- PHASE 0: SECURITY & CORRECTNESS FIXES
-- ==============================================================================

-- 1. WALLET IDEMPOTENCY
ALTER TABLE public.wallet_transactions 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT UNIQUE;

-- Update wallet_topup to handle idempotency
CREATE OR REPLACE FUNCTION public.wallet_topup(p_user_id UUID, p_amount NUMERIC, p_stripe_payment_intent_id TEXT DEFAULT NULL)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id UUID;
  v_new_balance NUMERIC;
  v_existing_tx UUID;
BEGIN
  -- Idempotency check if payment intent is provided
  IF p_stripe_payment_intent_id IS NOT NULL THEN
    SELECT id INTO v_existing_tx 
    FROM public.wallet_transactions 
    WHERE stripe_payment_intent_id = p_stripe_payment_intent_id 
    LIMIT 1;

    IF v_existing_tx IS NOT NULL THEN
      -- Already processed this payment intent, just return the current balance
      SELECT balance INTO v_new_balance FROM public.wallets WHERE user_id = p_user_id;
      RETURN v_new_balance;
    END IF;
  END IF;

  -- Get or create wallet
  SELECT id, balance INTO v_wallet_id, v_new_balance
  FROM public.wallets
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  IF v_wallet_id IS NULL THEN
    -- Create new wallet
    v_new_balance := p_amount;
    INSERT INTO public.wallets (user_id, balance)
    VALUES (p_user_id, v_new_balance)
    RETURNING id INTO v_wallet_id;
  ELSE
    -- Update existing
    v_new_balance := COALESCE(v_new_balance, 0) + p_amount;
    UPDATE public.wallets SET balance = v_new_balance WHERE id = v_wallet_id;
  END IF;
  
  -- Record transaction
  INSERT INTO public.wallet_transactions (wallet_id, amount, transaction_type, description, stripe_payment_intent_id)
  VALUES (v_wallet_id, p_amount, 'TOPUP', 'Wallet Recharge', p_stripe_payment_intent_id);
  
  RETURN v_new_balance;
END;
$$;

-- 2. LOCK DOWN OPEN RLS POLICIES (Revert unsafe "remediation" policies)
-- Wallets
DROP POLICY IF EXISTS "Enable read access for all" ON public.wallets;
DROP POLICY IF EXISTS "Users can insert own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Users can update own wallet" ON public.wallets;

DROP POLICY IF EXISTS "Users view own wallet" ON public.wallets;
CREATE POLICY "Users view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);

-- Wallet Transactions
DROP POLICY IF EXISTS "Enable read access for all" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.wallet_transactions;

DROP POLICY IF EXISTS "Users view own wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Users view own wallet transactions" ON public.wallet_transactions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.wallets WHERE wallets.id = wallet_transactions.wallet_id AND wallets.user_id = auth.uid()
  )
);

-- Consultations
DROP POLICY IF EXISTS "Enable read access for all" ON public.consultations;

-- Doctor Profiles
DROP POLICY IF EXISTS "Enable full access for all" ON public.doctor_profiles;

-- Restore safe policies for Doctor Profiles (in case they were completely removed instead of just overridden)
DROP POLICY IF EXISTS "Public read doctor profiles" ON public.doctor_profiles;
DROP POLICY IF EXISTS "Doctors update own profile" ON public.doctor_profiles;
CREATE POLICY "Public read doctor profiles" ON public.doctor_profiles FOR SELECT USING (true);
CREATE POLICY "Doctors update own profile" ON public.doctor_profiles FOR UPDATE USING (auth.uid() = id);

-- 3. CHAT MEDIA BUCKET
DROP POLICY IF EXISTS "Allow public view for chat-media" ON storage.objects;
-- Provide authenticated access (will use signed URLs for specific access in API if needed)
DROP POLICY IF EXISTS "Participants view chat-media" ON storage.objects;
CREATE POLICY "Participants view chat-media" ON storage.objects FOR SELECT USING (
  bucket_id = 'chat-media' AND auth.role() = 'authenticated'
);

-- 4. MESSAGES RLS
DROP POLICY IF EXISTS "Participants insert messages" ON public.messages;

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

-- 5. ADMIN CHAT INSPECTION
CREATE TABLE IF NOT EXISTS public.admin_chat_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  consultation_id UUID NOT NULL REFERENCES public.consultations(id),
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: We assume the 'admin_profiles' or equivalent exists to check admin role.
-- Let's check if role exists on auth.users or if there is an admin_profiles table.
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_profiles
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins view admin profiles" ON public.admin_profiles;
CREATE POLICY "Admins view admin profiles" ON public.admin_profiles FOR SELECT USING (
  auth.uid() = id
);

-- Add Admin viewing capability to messages
DROP POLICY IF EXISTS "Admins view all messages" ON public.messages;
CREATE POLICY "Admins view all messages" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admin_profiles a WHERE a.id = auth.uid())
);

-- 6. DATA MODEL CONSOLIDATION (Deprecate appointments, use consultations)
ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS consultation_type VARCHAR DEFAULT 'instant', -- 'instant' or 'scheduled'
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;
