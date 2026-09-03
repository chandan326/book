import React, { useEffect, useRef, useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose, initialTab = 'signin', onAuthSuccess }) {
  const { login, register, loginWithGoogle, requestPasswordReset } = useAuth();
  const [tab, setTab] = useState(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const googleButton = useRef(null);

  const finishAuth = () => { onAuthSuccess?.(); onClose(); };

  useEffect(() => {
    if (!isOpen || !import.meta.env.VITE_GOOGLE_CLIENT_ID || tab === 'reset') return;
    const render = () => {
      if (!window.google || !googleButton.current) return;
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          try { setLoading(true); await loginWithGoogle(credential); finishAuth(); }
          catch (err) { setError(err.message || 'Google sign-in failed.'); }
          finally { setLoading(false); }
        }
      });
      googleButton.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleButton.current, { theme: 'outline', size: 'large', width: 360, text: 'continue_with' });
    };
    const existing = document.querySelector('script[data-panna-google]');
    if (existing) { render(); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true; script.defer = true; script.dataset.pannaGoogle = 'true'; script.onload = render;
    document.head.appendChild(script);
  }, [isOpen, tab]);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault(); setError(''); setNotice(''); setLoading(true);
    try {
      if (tab === 'signin') await login(email, password);
      else if (tab === 'signup') await register(email, password, fullName);
      else { const result = await requestPasswordReset(email); setNotice(result.message); return; }
      finishAuth();
    } catch (err) { setError(err.message || 'Authentication failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-backdrop" role="dialog" aria-modal="true" aria-label="PANNA account access">
      <div className="auth-card">
        <button className="auth-close" onClick={onClose} aria-label="Close"><X size={20}/></button>
        <div className="auth-brand"><span><Sparkles size={18}/></span>PANNA.AI</div>
        <h2>{tab === 'signin' ? 'Welcome back, author' : tab === 'signup' ? 'Create your author workspace' : 'Reset your password'}</h2>
        <p className="auth-subtitle">{tab === 'reset' ? 'We will send a secure, time-limited link to your email.' : 'Write, improve and publish from one focused workspace.'}</p>
        {tab !== 'reset' && <div className="auth-tabs"><button className={tab === 'signin' ? 'active' : ''} onClick={() => setTab('signin')}>Sign in</button><button className={tab === 'signup' ? 'active' : ''} onClick={() => setTab('signup')}>Create account</button></div>}
        {error && <div className="auth-alert error">{error}</div>}
        {notice && <div className="auth-alert success">{notice}</div>}
        {tab !== 'reset' && import.meta.env.VITE_GOOGLE_CLIENT_ID && <><div ref={googleButton} className="google-button"/><div className="auth-divider"><span>or continue with email</span></div></>}
        <form onSubmit={handleSubmit} className="auth-form">
          {tab === 'signup' && <label>Full name<div className="auth-input"><User size={17}/><input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your author name" required/></div></label>}
          <label>Email address<div className="auth-input"><Mail size={17}/><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required/></div></label>
          {tab !== 'reset' && <label>Password<div className="auth-input"><Lock size={17}/><input type="password" minLength="8" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 8 characters" required/></div></label>}
          {tab === 'signin' && <button type="button" className="forgot-link" onClick={() => setTab('reset')}>Forgot password?</button>}
          <button className="auth-submit" disabled={loading}>{loading ? 'Please wait…' : tab === 'signin' ? 'Open my workspace' : tab === 'signup' ? 'Create author account' : 'Send reset link'}</button>
        </form>
        {tab === 'reset' && <button className="auth-back" onClick={() => setTab('signin')}><ArrowLeft size={15}/> Back to sign in</button>}
        <div className="auth-trust"><ShieldCheck size={16}/> Secure sign-in · Your manuscript stays private</div>
      </div>
    </div>
  );
}
