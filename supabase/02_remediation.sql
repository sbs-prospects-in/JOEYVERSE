-- ========================================================================================
-- ANITALK ARCHITECTURE REMEDIATION & SECURITY LOCKDOWN
-- Run this in the Supabase SQL Editor
-- ========================================================================================

-- 1. DROP LEGACY TABLES (Folding scheduled bookings into consultations)
-- This removes the double-source-of-truth problem.
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.chats CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;

-- 2. UPDATE CONSULTATIONS TABLE
-- Add scheduled_at to support the Stripe scheduled booking flow natively
ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;

-- 3. RECREATE MESSAGES TABLE (Linked to consultations)
CREATE TABLE public.messages (
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

-- 4. RLS LOCKDOWN
-- Ensure RLS is enabled
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Wallets
DROP POLICY IF EXISTS "Enable read access for all" ON public.wallets;
CREATE POLICY "Users can only read own wallet" 
ON public.wallets FOR SELECT 
USING (auth.uid() = user_id);
-- No INSERT/UPDATE/DELETE policies for wallets, making client-side writes impossible

-- Wallet Transactions
DROP POLICY IF EXISTS "Enable read access for all" ON public.wallet_transactions;
CREATE POLICY "Users can read own transactions" 
ON public.wallet_transactions FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.wallets WHERE wallets.id = wallet_transactions.wallet_id AND wallets.user_id = auth.uid()));
-- No INSERT/UPDATE/DELETE policies for wallet_transactions

-- Consultations
DROP POLICY IF EXISTS "Enable read access for all" ON public.consultations;
CREATE POLICY "Participants can view consultations" 
ON public.consultations FOR SELECT 
USING (auth.uid() = doctor_id OR auth.uid() = owner_id);

CREATE POLICY "Owners can insert consultations" 
ON public.consultations FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Participants can update consultations" 
ON public.consultations FOR UPDATE 
USING (auth.uid() = doctor_id OR auth.uid() = owner_id);

-- Messages
CREATE POLICY "Participants view messages" 
ON public.messages FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Participants insert messages" 
ON public.messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receivers can update is_read" 
ON public.messages FOR UPDATE 
USING (auth.uid() = receiver_id);

-- 5. SERVER-SIDE BILLING FUNCTION
-- Atomic function to deduct 1 minute of consultation time from wallet
CREATE OR REPLACE FUNCTION process_active_consultations_billing()
RETURNS void AS $$
DECLARE
    consultation_rec RECORD;
    wallet_rec RECORD;
    new_balance NUMERIC;
    rate NUMERIC;
BEGIN
    -- Loop through all active consultations
    FOR consultation_rec IN 
        SELECT id, owner_id, per_minute_rate 
        FROM public.consultations 
        WHERE status = 'ACTIVE'
    LOOP
        rate := consultation_rec.per_minute_rate;
        
        -- Get the owner's wallet
        SELECT * INTO wallet_rec 
        FROM public.wallets 
        WHERE user_id = consultation_rec.owner_id 
        FOR UPDATE; -- Lock the row
        
        IF FOUND THEN
            IF wallet_rec.balance >= rate THEN
                -- Deduct the amount
                new_balance := wallet_rec.balance - rate;
                
                UPDATE public.wallets 
                SET balance = new_balance 
                WHERE id = wallet_rec.id;
                
                -- Record the transaction
                INSERT INTO public.wallet_transactions (wallet_id, amount, transaction_type, description)
                VALUES (wallet_rec.id, -rate, 'CONSULTATION_DEDUCTION', 'Minute deduction for consultation ' || consultation_rec.id);
                
                -- Check if balance is now insufficient for next minute
                IF new_balance < rate THEN
                   -- Optional: Send a low balance warning via a real-time message if needed
                END IF;
            ELSE
                -- Insufficient balance, auto-complete the consultation
                UPDATE public.consultations 
                SET status = 'COMPLETED', ended_at = now() 
                WHERE id = consultation_rec.id;
            END IF;
        ELSE
            -- No wallet found, auto-complete the consultation to be safe
            UPDATE public.consultations 
            SET status = 'COMPLETED', ended_at = now() 
            WHERE id = consultation_rec.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
