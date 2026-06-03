import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Library({ session, navigate }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!session?.user) return navigate('/login');
    supabase
      .from('purchases')
      .select('purchased_at, videos(*)')
      .eq('user_id', session.user.id)
      .eq('payment_status', 'paid')
      .order('purchased_at', { ascending: false })
      .then(({ data }) => setItems(data || []));
  }, [session]);

  const openProtectedLink = async (videoId) => {
    const { data: authData } = await supabase.auth.getSession();
    const res = await fetch(`/api/get-video-link?videoId=${videoId}`, {
      headers: { Authorization: `Bearer ${authData.session?.access_token}` }
    });
    const data = await res.json();
    if (data.url) window.open(data.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="page">
      <p className="eyebrow">Your account</p>
      <h1>Purchased Library</h1>
      <div className="video-grid">
        {items.map((item) => (
          <article className="video-card" key={item.videos.id}>
            <div className="thumb-wrap"><img src={item.videos.thumbnail_url} alt={item.videos.title} loading="lazy" /></div>
            <div className="card-body">
              <h3>{item.videos.title}</h3>
              <p>Purchased: {new Date(item.purchased_at).toLocaleDateString()}</p>
              <button className="full-btn" onClick={() => openProtectedLink(item.videos.id)}>Access Video</button>
            </div>
          </article>
        ))}
      </div>
      {!items.length && <p className="empty">No purchased videos yet.</p>}
    </section>
  );
}
