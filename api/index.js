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

// 0. Create Payment Intent for Wallet Recharge
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'inr' } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amounts in the smallest currency unit
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      description: 'Anitalk Wallet Recharge',
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
});

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

// 3. Wallet Top-Up (uses RPC function with SECURITY DEFINER to bypass RLS)
app.post('/api/wallet/topup', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (!userId || !amount) return res.status(400).json({ error: 'Missing userId or amount' });

    const supabaseClient = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
    );

    const { data: newBalance, error } = await supabaseClient.rpc('wallet_topup', {
      p_user_id: userId,
      p_amount: amount
    });

    if (error) throw error;

    res.json({ success: true, balance: newBalance });
  } catch (error) {
    console.error('Topup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Wallet Deduct (uses RPC function with SECURITY DEFINER to bypass RLS)
app.post('/api/wallet/deduct', async (req, res) => {
  try {
    const { userId, amount, description } = req.body;
    if (!userId || !amount) return res.status(400).json({ error: 'Missing userId or amount' });

    const supabaseClient = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
    );

    const { data: newBalance, error } = await supabaseClient.rpc('wallet_deduct', {
      p_user_id: userId,
      p_amount: amount,
      p_description: description || 'Consultation fee'
    });

    if (error) throw error;

    res.json({ success: true, balance: newBalance });
  } catch (error) {
    console.error('Deduct error:', error);
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
    // 1. Auto-end active consultations that run out of balance
    const { data: activeCons } = await supabaseServiceRoleClient
      .from('consultations')
      .select('id, started_at, per_minute_rate, owner_id')
      .eq('status', 'ACTIVE');
      
    if (activeCons && activeCons.length > 0) {
      for (const c of activeCons) {
         if (!c.started_at) continue;
         
         const { data: walletData } = await supabaseServiceRoleClient
            .from('wallets')
            .select('balance')
            .eq('user_id', c.owner_id)
            .single();
            
         if (!walletData) continue;
         
         const start = new Date(c.started_at).getTime();
         const now = Date.now();
         const seconds = Math.floor((now - start) / 1000);
         const intervals = Math.ceil(Math.max(seconds, 1) / 60);
         const costSoFar = intervals * c.per_minute_rate;
         
         if (costSoFar > walletData.balance) {
            await supabaseServiceRoleClient.from('consultations').update({
              status: 'COMPLETED',
              ended_at: new Date().toISOString()
            }).eq('id', c.id);
         }
      }
    }
    
    // 2. Bill recently COMPLETED consultations
    const { data: completedCons } = await supabaseServiceRoleClient
      .from('consultations')
      .select('id, started_at, ended_at, per_minute_rate, owner_id')
      .eq('status', 'COMPLETED')
      .not('ended_at', 'is', null)
      .not('started_at', 'is', null)
      .order('ended_at', { ascending: false })
      .limit(20);
      
    if (completedCons && completedCons.length > 0) {
       for (const c of completedCons) {
          const desc = `Consultation Fee - ${c.id}`;
          const start = new Date(c.started_at).getTime();
          const end = new Date(c.ended_at).getTime();
          let seconds = Math.floor((end - start) / 1000);
          if (seconds < 0) seconds = 0;
          // Charge minimum of 1 interval for any connected call
          const intervals = Math.ceil(Math.max(seconds, 1) / 60);
          const fee = intervals * c.per_minute_rate;
          
          if (fee > 0) {
             // Idempotent call, will only deduct once per description
             await supabaseServiceRoleClient.rpc('wallet_deduct', {
               p_user_id: c.owner_id,
               p_amount: fee,
               p_description: desc
             });
          }
       }
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
