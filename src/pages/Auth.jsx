import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Auth({ navigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    const action = mode === 'login'
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password });
    const { error } = await action;
    if (error) return setMessage(error.message);
    navigate('/videos');
  };

  return (
    <section className="page auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="primary full-btn">{mode === 'login' ? 'Login' : 'Sign Up'}</button>
        {message && <p className="error">{message}</p>}
        <button type="button" className="link-btn" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Login'}
        </button>
      </form>
    </section>
  );
}
