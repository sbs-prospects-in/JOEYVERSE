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

// Explicit CORS
app.use(cors({
  origin: process.env.VITE_FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// --- ROUTES ---

// 0. Create Payment Intent for Wallet Recharge
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'inr', userId } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amounts in the smallest currency unit
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      description: 'Anitalk Wallet Recharge',
      metadata: {
        userId,
        type: 'wallet_topup'
      }
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

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
    return res.status(500).send("Server configuration error");
  }

  const supabaseWebhookClient = createClient(
    process.env.VITE_SUPABASE_URL,
    serviceKey
  );

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    const consultationId = session.client_reference_id;

    if (consultationId) {
      // Update consultation status to SCHEDULED upon payment success
      await supabaseWebhookClient
        .from('consultations')
        .update({ status: 'SCHEDULED' })
        .eq('id', consultationId);
    }
  } else if (stripeEvent.type === 'payment_intent.succeeded') {
    const paymentIntent = stripeEvent.data.object;
    
    // Process wallet topup if metadata matches
    if (paymentIntent.metadata?.type === 'wallet_topup' && paymentIntent.metadata?.userId) {
      const amountInINR = paymentIntent.amount_received / 100;
      
      const { error } = await supabaseWebhookClient.rpc('wallet_topup', {
        p_user_id: paymentIntent.metadata.userId,
        p_amount: amountInINR,
        p_stripe_payment_intent_id: paymentIntent.id
      });
      
      if (error) {
        console.error('Failed to topup wallet via webhook:', error);
      }
    }
  }

  res.json({ received: true });
});

// 3. Wallet Deduct (uses RPC function with SECURITY DEFINER to bypass RLS)
app.post('/api/wallet/deduct', async (req, res) => {
  try {
    const { userId, amount, description } = req.body;
    if (!userId || !amount) return res.status(400).json({ error: 'Missing userId or amount' });

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    const supabaseClient = createClient(
      process.env.VITE_SUPABASE_URL,
      serviceKey
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


if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Local Express server running at http://localhost:${PORT}`);
  });
}

export default app;
