import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { videoId } = req.query;
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) return res.status(401).json({ error: 'Login required' });

    const { data: video } = await supabaseAdmin.from('videos').select('id, access_type').eq('id', videoId).single();
    if (!video) return res.status(404).json({ error: 'Video not found' });

    const { data: profile } = await supabaseAdmin.from('profiles').select('vip_status').eq('id', user.id).single();
    const { data: purchase } = await supabaseAdmin
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('video_id', videoId)
      .eq('payment_status', 'paid')
      .maybeSingle();

    const allowed = Boolean(purchase) || video.access_type === 'free' || (video.access_type === 'vip' && profile?.vip_status === 'active');
    if (!allowed) return res.status(403).json({ error: 'Access denied' });

    const { data: link } = await supabaseAdmin.from('video_access_links').select('external_video_link').eq('video_id', videoId).single();
    if (!link?.external_video_link) return res.status(404).json({ error: 'Link not found' });

    return res.status(200).json({ url: link.external_video_link });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
