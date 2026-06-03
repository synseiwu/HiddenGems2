import { Gem, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Header({ session, profile, navigate }) {
  const [open, setOpen] = useState(false);
  const isAdmin = profile?.role === 'admin';

  const go = (path) => {
    navigate(path);
    setOpen(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    go('/');
  };

  return (
    <header className="site-header">
      <button className="brand" onClick={() => go('/')}>
        <Gem size={24} />
        <span>Hidden Gems</span>
      </button>

      <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle menu">
        {open ? <X /> : <Menu />}
      </button>

      <nav className={open ? 'nav open' : 'nav'}>
        <button onClick={() => go('/')}>Home</button>
        <button onClick={() => go('/videos')}>Videos</button>
        <button onClick={() => go('/vip')}>VIP</button>
        <button onClick={() => go('/about')}>About</button>
        {session && <button onClick={() => go('/library')}>Library</button>}
        {session && <button onClick={() => go('/settings')}>Settings</button>}
        {isAdmin && <button className="admin-link" onClick={() => go('/admin')}>Admin</button>}
        {!session ? (
          <button className="primary" onClick={() => go('/login')}>Login / Sign Up</button>
        ) : (
          <button className="secondary" onClick={logout}>Logout</button>
        )}
      </nav>
    </header>
  );
}
