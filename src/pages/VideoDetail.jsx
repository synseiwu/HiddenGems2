import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function VideoDetail({ videoId, session, profile, navigate }) {
  const [video, setVideo] = useState(null);
  const [purchased, setPurchased] = useState(false);

  useEffect(() => {
    supabase.from('videos').select('*').eq('id', videoId).single().then(({ data }) => setVideo(data));
  }, [videoId]);

  useEffect(() => {
    if (!session?.user || !videoId) return;
    supabase
      .from('purchases')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('video_id', videoId)
      .eq('payment_status', 'paid')
      .maybeSingle()
      .then(({ data }) => setPurchased(Boolean(data)));
  }, [session, videoId]);

  const buy = async () => {
    if (!session) return navigate('/login');
    const { data: authData } = await supabase.auth.getSession();
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authData.session?.access_token}`
      },
      body: JSON.stringify({ videoId })
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const openProtectedLink = async () => {
    const { data: authData } = await supabase.auth.getSession();
    const res = await fetch(`/api/get-video-link?videoId=${videoId}`, {
      headers: { Authorization: `Bearer ${authData.session?.access_token}` }
    });
    const data = await res.json();
    if (data.url) window.open(data.url, '_blank', 'noopener,noreferrer');
  };

  if (!video) return <section className="page"><p>Loading video...</p></section>;

  const vipUnlocked = video.access_type === 'vip' && profile?.vip_status === 'active';
  const unlocked = purchased || vipUnlocked || video.access_type === 'free';

  return (
    <section className="page detail-layout">
      <img className="detail-thumb" src={video.thumbnail_url} alt={video.title} />
      <div className="detail-info">
        <p className="eyebrow">{video.category}</p>
        <h1>{video.title}</h1>
        <p>{video.description}</p>
        <p className="price-line">{video.access_type === 'vip' ? 'VIP Access' : `$${Number(video.price || 0).toFixed(2)}`}</p>
        {unlocked ? (
          <button className="primary big" onClick={openProtectedLink}>Open External Video Link</button>
        ) : (
          <button className="primary big" onClick={video.access_type === 'vip' ? () => navigate('/vip') : buy}>
            {video.access_type === 'vip' ? 'Upgrade to VIP' : 'Purchase with Stripe'}
          </button>
        )}
        <p className="muted">The video is hosted externally. The link only appears after verified access.</p>
      </div>
    </section>
  );
}
