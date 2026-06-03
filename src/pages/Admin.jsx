import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { compressThumbnail } from '../lib/imageCompression';

const emptyForm = {
  title: '', description: '', category: '', price: '3.00', stripe_price_id: '', external_video_link: '', access_type: 'paid', published: true
};

export default function Admin({ session, profile, navigate }) {
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [thumb, setThumb] = useState(null);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (!session) navigate('/login');
    if (profile && !isAdmin) navigate('/');
  }, [session, profile]);

  const load = async () => {
    const { data } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
    setVideos(data || []);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const uploadThumbnail = async () => {
    if (!thumb) return editing?.thumbnail_url || null;
    const compressed = await compressThumbnail(thumb);
    const path = `thumbnails/${compressed.name}`;
    const { error } = await supabase.storage.from('thumbnails').upload(path, compressed, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('thumbnails').getPublicUrl(path);
    return data.publicUrl;
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage('Saving...');
    try {
      const thumbnail_url = await uploadThumbnail();
      const { external_video_link, ...videoFields } = form;
      const payload = { ...videoFields, price: Number(form.price), thumbnail_url };
      const res = editing
        ? await supabase.from('videos').update(payload).eq('id', editing.id).select('id').single()
        : await supabase.from('videos').insert(payload).select('id').single();
      if (res.error) throw res.error;
      const targetVideoId = editing?.id || res.data.id;
      const linkRes = await supabase.from('video_access_links').upsert({
        video_id: targetVideoId,
        external_video_link
      }, { onConflict: 'video_id' });
      if (linkRes.error) throw linkRes.error;
      setForm(emptyForm); setThumb(null); setEditing(null); setMessage('Saved successfully.'); load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const edit = (video) => {
    setEditing(video);
    setForm({
      title: video.title || '', description: video.description || '', category: video.category || '',
      price: String(video.price || '3.00'), stripe_price_id: video.stripe_price_id || '',
      external_video_link: '', access_type: video.access_type || 'paid', published: video.published
    });
  };

  const remove = async (id) => {
    await supabase.from('videos').delete().eq('id', id);
    load();
  };

  if (!isAdmin) return <section className="page"><p>Admin access required.</p></section>;

  return (
    <section className="page admin-page">
      <p className="eyebrow">Admin</p>
      <h1>Video Management</h1>
      <form className="admin-form" onSubmit={submit}>
        <input placeholder="Video title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input placeholder="Stripe Price ID" value={form.stripe_price_id} onChange={(e) => setForm({ ...form, stripe_price_id: e.target.value })} />
        <input placeholder="External video link" value={form.external_video_link} onChange={(e) => setForm({ ...form, external_video_link: e.target.value })} required />
        <select value={form.access_type} onChange={(e) => setForm({ ...form, access_type: e.target.value })}>
          <option value="paid">Paid</option><option value="vip">VIP</option><option value="free">Free</option>
        </select>
        <label className="checkbox"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Published</label>
        <input type="file" accept="image/*" onChange={(e) => setThumb(e.target.files?.[0])} />
        <button className="primary full-btn">{editing ? 'Update Video' : 'Publish Video'}</button>
        {message && <p className="muted">{message}</p>}
      </form>
      <div className="admin-list">
        {videos.map((video) => <div className="admin-row" key={video.id}><span>{video.title}</span><button onClick={() => edit(video)}>Edit</button><button onClick={() => remove(video.id)}>Delete</button></div>)}
      </div>
    </section>
  );
}
