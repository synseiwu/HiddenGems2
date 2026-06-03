import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { videoId } = req.body;
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) return res.status(401).json({ error: 'Login required' });

    const { data: video, error: videoError } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (videoError || !video) return res.status(404).json({ error: 'Video not found' });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: video.stripe_price_id
        ? [{ price: video.stripe_price_id, quantity: 1 }]
        : [{
            price_data: {
              currency: 'usd',
              product_data: { name: video.title },
              unit_amount: Math.round(Number(video.price) * 100)
            },
            quantity: 1
          }],
      success_url: `${process.env.SITE_URL}/library?success=true`,
      cancel_url: `${process.env.SITE_URL}/videos/${videoId}?canceled=true`,
      metadata: { user_id: user.id, video_id: videoId, type: 'video_purchase' }
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
