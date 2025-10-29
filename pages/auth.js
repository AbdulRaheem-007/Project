import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => sub?.subscription?.unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Sign-up successful. You can now sign in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage('Signed in');
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div>
      <h1>Auth</h1>
      {user ? (
        <div>
          <p>Signed in as {user.email}</p>
          <button onClick={signOut}>Sign out</button>
        </div>
      ) : (
        <form onSubmit={handleAuth} className="card" style={{ maxWidth: 420 }}>
          <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="submit">{mode === 'signup' ? 'Sign up' : 'Sign in'}</button>
            <button type="button" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>
              Switch to {mode === 'signup' ? 'Sign in' : 'Sign up'}
            </button>
          </div>
          {message && <p>{message}</p>}
        </form>
      )}
      <p style={{ marginTop: 16 }}>Note: Enable Email+Password provider in Supabase Auth.</p>
    </div>
  );
}
