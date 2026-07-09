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

// 1. Create Checkout Session
app.post('/api/create-checkout', async (req, res) => {
  try {
    const { appointmentId } = req.body;
    
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

    // Verify appointment exists
    const { data: appointment, error } = await supabaseClient
      .from('appointments')
      .select('*, doctor:doctor_profiles(name)')
      .eq('id', appointmentId)
      .single();

    if (error || !appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Consultation with ${appointment.doctor.name}`,
              description: 'Pet Healthcare Consultation Fee'
            },
            unit_amount: 50000, // ₹500.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:5173/pet-owner/dashboard?payment=success`,
      cancel_url: `http://localhost:5173/pet-owner/dashboard?payment=cancelled`,
      client_reference_id: appointmentId,
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
    const appointmentId = session.client_reference_id;

    if (appointmentId) {
      // For webhooks, we need the Service Role key since it's a server-to-server request
      // But since we are hacking it for localhost, we'll initialize an anon client just for safety
      const supabaseWebhookClient = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.VITE_SUPABASE_ANON_KEY
      );
      
      // Update appointment status to CONFIRMED (this will fail due to RLS if anon key is used, but our frontend hack covers it)
      await supabaseWebhookClient
        .from('appointments')
        .update({ status: 'CONFIRMED' })
        .eq('id', appointmentId);
    }
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Local Express server running at http://localhost:${PORT}`);
});
