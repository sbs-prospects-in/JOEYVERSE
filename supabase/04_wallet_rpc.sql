-- ==========================================
-- WALLET TOPUP & DEDUCT RPC FUNCTIONS
-- These run with SECURITY DEFINER to bypass RLS
-- ==========================================

-- 1. Top-up wallet
CREATE OR REPLACE FUNCTION public.wallet_topup(p_user_id UUID, p_amount NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id UUID;
  v_new_balance NUMERIC;
BEGIN
  -- Get or create wallet
  SELECT id, balance INTO v_wallet_id, v_new_balance
  FROM public.wallets
  WHERE user_id = p_user_id;
  
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
  INSERT INTO public.wallet_transactions (wallet_id, amount, transaction_type, description)
  VALUES (v_wallet_id, p_amount, 'TOPUP', 'Wallet Recharge');
  
  RETURN v_new_balance;
END;
$$;

-- 2. Deduct from wallet
CREATE OR REPLACE FUNCTION public.wallet_deduct(p_user_id UUID, p_amount NUMERIC, p_description TEXT DEFAULT 'Consultation fee')
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id UUID;
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
  v_existing_tx UUID;
BEGIN
  SELECT id, balance INTO v_wallet_id, v_current_balance
  FROM public.wallets
  WHERE user_id = p_user_id;
  
  IF v_wallet_id IS NULL THEN
    RETURN 0;
  END IF;

  -- Idempotency: skip if already deducted for this description
  SELECT id INTO v_existing_tx
  FROM public.wallet_transactions
  WHERE wallet_id = v_wallet_id AND description = p_description
  LIMIT 1;

  IF v_existing_tx IS NOT NULL THEN
    RETURN COALESCE(v_current_balance, 0);
  END IF;
  
  v_new_balance := GREATEST(0, COALESCE(v_current_balance, 0) - p_amount);
  UPDATE public.wallets SET balance = v_new_balance WHERE id = v_wallet_id;
  
  -- Record transaction
  INSERT INTO public.wallet_transactions (wallet_id, amount, transaction_type, description)
  VALUES (v_wallet_id, -p_amount, 'CONSULTATION_DEDUCTION', p_description);
  
  RETURN v_new_balance;
END;
$$;
