import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from './lib/supabaseClient';
import './styles/global.css';
import Header from './components/Header';
import Home from './pages/Home';
import Videos from './pages/Videos';
import VideoDetail from './pages/VideoDetail';
import Library from './pages/Library';
import Vip from './pages/Vip';
import About from './pages/About';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import Auth from './pages/Auth';

function App() {
  const [route, setRoute] = useState(window.location.pathname);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function loadProfile() {
      if (!session?.user) {
        setProfile(null);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setProfile(data);
    }
    loadProfile();
  }, [session]);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setRoute(path);
    window.scrollTo(0, 0);
  };

  const context = useMemo(() => ({ session, profile, navigate, setProfile }), [session, profile]);

  let page = <Home {...context} />;
  if (route === '/videos') page = <Videos {...context} />;
  if (route.startsWith('/videos/')) page = <VideoDetail {...context} videoId={route.split('/')[2]} />;
  if (route === '/library') page = <Library {...context} />;
  if (route === '/vip') page = <Vip {...context} />;
  if (route === '/about') page = <About />;
  if (route === '/settings') page = <Settings {...context} />;
  if (route === '/admin') page = <Admin {...context} />;
  if (route === '/login' || route === '/signup') page = <Auth {...context} />;

  return (
    <>
      <Header session={session} profile={profile} navigate={navigate} />
      <main>{page}</main>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
