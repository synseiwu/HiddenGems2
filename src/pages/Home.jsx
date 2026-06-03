import { ArrowRight, Crown, ShieldCheck, Zap } from 'lucide-react';

export default function Home({ navigate }) {
  return (
    <section className="page home-page">
      <div className="hero split">
        <div>
          <p className="eyebrow">Premium video marketplace</p>
          <h1>Unlock exclusive Hidden Gems without slowing the site down.</h1>
          <p className="hero-copy">
            Browse curated video listings, purchase access, and open external video links from your personal library.
          </p>
          <div className="hero-actions">
            <button className="primary big" onClick={() => navigate('/videos')}>Browse Videos <ArrowRight size={18} /></button>
            <button className="secondary big" onClick={() => navigate('/vip')}>View VIP</button>
          </div>
        </div>
        <div className="vip-panel">
          <Crown size={42} />
          <h2>VIP Access</h2>
          <p>Promote your premium offer directly on the homepage with a bold upgrade card.</p>
          <button className="full-btn" onClick={() => navigate('/vip')}>Upgrade to VIP</button>
        </div>
      </div>

      <div className="feature-grid">
        <div className="feature-card"><Zap /><h3>Fast thumbnails</h3><p>Compressed WebP thumbnails, lazy loading, and lightweight cards.</p></div>
        <div className="feature-card"><ShieldCheck /><h3>Protected links</h3><p>External video links stay hidden until purchase or VIP access is verified.</p></div>
        <div className="feature-card"><Crown /><h3>VIP ready</h3><p>VIP upgrades can unlock premium listings and account status.</p></div>
      </div>

      <div className="how-it-works">
        <h2>How it works</h2>
        <div className="steps">
          <span>Create account</span>
          <span>Browse videos</span>
          <span>Purchase access</span>
          <span>Open from library</span>
        </div>
      </div>
    </section>
  );
}
