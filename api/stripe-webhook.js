import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const sig = req.headers['stripe-signature'];
  const rawBody = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata || {};

    if (metadata.type === 'video_purchase') {
      await supabaseAdmin.from('purchases').upsert({
        user_id: metadata.user_id,
        video_id: metadata.video_id,
        payment_status: 'paid',
        stripe_session_id: session.id,
        purchased_at: new Date().toISOString()
      }, { onConflict: 'stripe_session_id' });
    }

    if (metadata.type === 'vip_upgrade' && metadata.user_id) {
      await supabaseAdmin.from('profiles').update({ vip_status: 'active' }).eq('id', metadata.user_id);
      await supabaseAdmin.from('vip_subscriptions').insert({
        user_id: metadata.user_id,
        status: 'active',
        stripe_subscription_id: session.subscription || session.id,
        started_at: new Date().toISOString()
      });
    }
  }

  return res.status(200).json({ received: true });
}
