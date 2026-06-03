import { Lock, Play, Sparkles } from 'lucide-react';

export default function VideoCard({ video, purchased, isVip, navigate }) {
  const unlocked = purchased || video.access_type === 'free' || (video.access_type === 'vip' && isVip);

  return (
    <article className="video-card">
      <div className="thumb-wrap">
        <img src={video.thumbnail_url || '/placeholder.webp'} alt={video.title} loading="lazy" />
        <span className="badge">{video.category || 'Featured'}</span>
      </div>
      <div className="card-body">
        <h3>{video.title}</h3>
        <p>{video.description}</p>
        <div className="card-row">
          <strong>{video.access_type === 'vip' ? 'VIP' : `$${Number(video.price || 0).toFixed(2)}`}</strong>
          <span>{unlocked ? <Play size={16} /> : video.access_type === 'vip' ? <Sparkles size={16} /> : <Lock size={16} />}</span>
        </div>
        <button className="full-btn" onClick={() => navigate(`/videos/${video.id}`)}>
          {unlocked ? 'Access Video' : 'View Details'}
        </button>
      </div>
    </article>
  );
}
