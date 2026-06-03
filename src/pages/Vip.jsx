export default function Vip({ session, navigate }) {
  const upgrade = async () => {
    if (!session) return navigate('/login');
    const { supabase } = await import('../lib/supabaseClient');
    const { data: authData } = await supabase.auth.getSession();
    const res = await fetch('/api/create-vip-checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authData.session?.access_token}` }
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <section className="page narrow center">
      <p className="eyebrow">VIP</p>
      <h1>Upgrade for premium access.</h1>
      <div className="pricing-card">
        <h2>VIP Membership</h2>
        <p className="price">$19.99</p>
        <p>Unlock VIP-only videos and premium access features.</p>
        <button className="primary big" onClick={upgrade}>Upgrade with Stripe</button>
      </div>
    </section>
  );
}
