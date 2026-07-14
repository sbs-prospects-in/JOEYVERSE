-- ==========================================
-- FIX WALLET RLS FOR MOCK TOP-UPS & BILLING
-- ==========================================

-- 1. Allow users to insert their own wallet (if it doesn't exist)
DROP POLICY IF EXISTS "Users can insert own wallet" ON public.wallets;
CREATE POLICY "Users can insert own wallet" 
ON public.wallets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 2. Allow users to update their own wallet balance
DROP POLICY IF EXISTS "Users can update own wallet" ON public.wallets;
CREATE POLICY "Users can update own wallet" 
ON public.wallets FOR UPDATE 
USING (auth.uid() = user_id);

-- 3. Allow users to insert their own wallet transactions
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.wallet_transactions;
CREATE POLICY "Users can insert own transactions" 
ON public.wallet_transactions FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.wallets 
    WHERE wallets.id = wallet_transactions.wallet_id 
    AND wallets.user_id = auth.uid()
  )
);
