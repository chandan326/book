import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialTab = 'signin', onAuthSuccess }) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'signin') {
        await login(email, password);
      } else if (tab === 'signup') {
        await register(email, password, fullName);
      } else {
        alert("Password reset link sent to email if account exists.");
        onClose();
        return;
      }
      if (onAuthSuccess) onAuthSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Authentication failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '0.75rem',
        width: '100%',
        maxWidth: '440px',
        padding: '2rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        position: 'relative'
      }}>
        {/* Close button */}
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', color: '#0F172A' }}>
            {tab === 'signin' ? 'Welcome Back' : tab === 'signup' ? 'Create Author Account' : 'Reset Password'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem' }}>
            {tab === 'signin' ? 'Sign in to access your manuscript studio' : 'Join PANNA.AI Book Platform'}
          </p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
          <button 
            onClick={() => { setTab('signin'); setError(''); }}
            style={{ flex: 1, padding: '0.5rem', background: 'none', border: 'none', borderBottom: tab === 'signin' ? '2px solid #2563EB' : 'none', color: tab === 'signin' ? '#2563EB' : '#64748B', fontWeight: 600, cursor: 'pointer' }}
          >
            Sign In
          </button>
          <button 
            onClick={() => { setTab('signup'); setError(''); }}
            style={{ flex: 1, padding: '0.5rem', background: 'none', border: 'none', borderBottom: tab === 'signup' ? '2px solid #2563EB' : 'none', color: tab === 'signup' ? '#2563EB' : '#64748B', fontWeight: 600, cursor: 'pointer' }}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEF2F2', color: '#DC2626', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #FCA5A5' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {tab === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input 
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Chandan Rai"
                  style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.9rem' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chandan.rai771714@gmail.com"
                style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.75rem' }}
          >
            {loading ? 'Processing...' : tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.75rem', color: '#94A3B8' }}>
          Initial Administrator email configured for <strong style={{ color: '#2563EB' }}>chandan.rai771714@gmail.com</strong>
        </div>
      </div>
    </div>
  );
}
