import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import VideoCard from '../components/VideoCard';

export default function Videos({ session, profile, navigate }) {
  const [videos, setVideos] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    supabase.from('videos').select('*').eq('published', true).order('created_at', { ascending: false }).then(({ data }) => setVideos(data || []));
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    supabase.from('purchases').select('video_id').eq('user_id', session.user.id).eq('payment_status', 'paid').then(({ data }) => setPurchases(data || []));
  }, [session]);

  const categories = ['all', ...new Set(videos.map((v) => v.category).filter(Boolean))];
  const purchasedIds = new Set(purchases.map((p) => p.video_id));

  const filtered = useMemo(() => {
    let list = videos.filter((v) => {
      const matchesSearch = `${v.title} ${v.description}`.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'all' || v.category === category;
      return matchesSearch && matchesCategory;
    });
    if (sort === 'price-low') list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === 'title') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [videos, query, category, sort]);

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Marketplace</p>
          <h1>Browse Videos</h1>
        </div>
      </div>
      <div className="filters">
        <input placeholder="Search videos..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="title">Title</option>
        </select>
      </div>
      <div className="video-grid">
        {filtered.map((video) => (
          <VideoCard key={video.id} video={video} purchased={purchasedIds.has(video.id)} isVip={profile?.vip_status === 'active'} navigate={navigate} />
        ))}
      </div>
      {!filtered.length && <p className="empty">No videos found yet.</p>}
    </section>
  );
}
