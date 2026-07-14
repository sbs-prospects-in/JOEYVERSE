import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

// We need raw body for stripe webhook verification
app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe-webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(cors());

// --- ROUTES ---

// 1. Create Checkout Session for Scheduled Consultations
app.post('/api/create-checkout', async (req, res) => {
  try {
    const { consultationId } = req.body;
    
    // Create an authenticated Supabase client for this specific request
    const supabaseClient = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: req.headers.authorization || ''
          }
        }
      }
    );

    // Verify consultation exists
    const { data: consultation, error } = await supabaseClient
      .from('consultations')
      .select('*, doctor:doctor_profiles(name)')
      .eq('id', consultationId)
      .single();

    if (error || !consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Scheduled Consultation with ${consultation.doctor.name}`,
              description: 'Pet Healthcare Consultation Fee'
            },
            unit_amount: 50000, // ₹500.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin || 'http://localhost:5173'}/pet-owner/dashboard?payment=success`,
      cancel_url: `${req.headers.origin || 'http://localhost:5173'}/pet-owner/dashboard?payment=cancelled`,
      client_reference_id: consultationId,
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Stripe Webhook
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    const consultationId = session.client_reference_id;

    if (consultationId) {
      // For webhooks, we must use the Service Role key to bypass RLS and update the db
      const supabaseWebhookClient = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
      );
      
      // Update consultation status to SCHEDULED upon payment success
      await supabaseWebhookClient
        .from('consultations')
        .update({ status: 'SCHEDULED' })
        .eq('id', consultationId);
    }
  }

  res.json({ received: true });
});

// 3. Wallet Top-Up (Service Role required to bypass RLS for wallets)
app.post('/api/wallet/topup', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (!userId || !amount) return res.status(400).json({ error: 'Missing userId or amount' });

    const supabaseServiceRoleClient = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
    );

    // 1. Get current wallet
    const { data: wallet } = await supabaseServiceRoleClient
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    let walletId = wallet?.id;
    let newBalance = amount;

    if (wallet) {
      newBalance += Number(wallet.balance || 0);
      await supabaseServiceRoleClient
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', walletId);
    } else {
      const { data: newWallet } = await supabaseServiceRoleClient
        .from('wallets')
        .insert({ user_id: userId, balance: newBalance })
        .select()
        .single();
      walletId = newWallet?.id;
    }

    if (walletId) {
      await supabaseServiceRoleClient.from('wallet_transactions').insert({
        wallet_id: walletId,
        amount: amount,
        transaction_type: 'TOPUP',
        description: 'Mock Add Funds (API)'
      });
    }

    res.json({ success: true, balance: newBalance });
  } catch (error) {
    console.error('Topup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- CRON JOBS ---
// Server-side billing loop: deducts balance every minute for ACTIVE instant consultations
const supabaseServiceRoleClient = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

setInterval(async () => {
  try {
    const { error } = await supabaseServiceRoleClient.rpc('process_active_consultations_billing');
    if (error) {
      console.error('Billing cron error:', error.message);
    }
  } catch (err) {
    console.error('Billing cron exception:', err.message);
  }
}, 10000);


if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Local Express server running at http://localhost:${PORT}`);
  });
}

export default app;
