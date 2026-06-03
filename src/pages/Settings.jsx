export default function Settings({ session, profile, navigate }) {
  if (!session) return <section className="page"><button className="primary" onClick={() => navigate('/login')}>Login first</button></section>;

  return (
    <section className="page narrow">
      <p className="eyebrow">Settings</p>
      <h1>Account Settings</h1>
      <div className="settings-card">
        <p><strong>Email:</strong> {session.user.email}</p>
        <p><strong>Role:</strong> {profile?.role || 'user'}</p>
        <p><strong>VIP Status:</strong> {profile?.vip_status || 'inactive'}</p>
        <button className="primary" onClick={() => navigate('/library')}>View Library</button>
      </div>
    </section>
  );
}
