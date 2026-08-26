import React, { useState } from 'react';
import { Lock, Mail, Activity, AlertCircle, ArrowRight, Eye, EyeOff, CheckCircle2, User } from 'lucide-react';
import { setCurrentUser } from '../utils/api';

export default function AuthPage({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('login');

  // Form Fields
  const [username, setUsername]               = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility
  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI Feedback
  const [errorMessage, setErrorMessage]   = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading]             = useState(false);

  const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;           // prevent double-submit
    setErrorMessage('');
    setSuccessMessage('');

    const isReg = activeTab === 'register';

    // ── CLIENT-SIDE VALIDATION ─────────────────────────────────────
    if (isReg) {
      if (!username.trim()) {
        setErrorMessage('Username is required.');
        return;
      }
      if (username.trim().length < 3) {
        setErrorMessage('Username must be at least 3 characters.');
        return;
      }
    }

    if (!email.trim() || !isValidEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (isReg && password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isReg
        ? 'http://localhost:8081/api/auth/signup'
        : 'http://localhost:8081/api/auth/signin';

      // For login: send email as the "username" field (backend resolves it)
      const payload = isReg
        ? { username: username.trim(), email: email.trim().toLowerCase(), password, role: ['user'] }
        : { username: email.trim().toLowerCase(), password };

      const res = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Server returned an unexpected response. Is the backend running?');
      }

      if (!res.ok) {
        // Show the exact error message from Spring Boot
        throw new Error(data.message || 'Authentication failed. Please try again.');
      }

      if (isReg) {
        setSuccessMessage('✅ Account created! You can now sign in with your email and password.');
        setActiveTab('login');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
      } else {
        // Successful Login — store JWT + user profile
        const userData = {
          id:          data.id,
          username:    data.username,
          email:       data.email,
          roles:       data.roles || ['ROLE_USER'],
          accessToken: data.accessToken,
        };
        setCurrentUser(userData);
        if (onLoginSuccess) onLoginSuccess(userData);
      }
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        setErrorMessage('Cannot reach the server. Please start the backend on port 8081.');
      } else {
        setErrorMessage(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── INPUT STYLE ─────────────────────────────────────────────────────────
  const inputStyle = {
    width: '100%',
    padding: '10px 10px 10px 38px',
    background: 'rgba(10,15,30,0.8)',
    border: '1px solid var(--border-glass)',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '0.85rem',
    outline: 'none',
  };
  const inputWithEyeStyle = { ...inputStyle, paddingRight: '40px' };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'radial-gradient(circle at 50% 30%, #0d1322 0%, #070a12 100%)',
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '32px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
            width: '54px', height: '54px', borderRadius: '16px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0,242,254,0.4)', marginBottom: '12px',
          }}>
            <Activity size={30} color="#050b14" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
            URBAN DIGITAL TWIN <span style={{ color: 'var(--accent-cyan)' }}>AI</span>
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Smart City Simulator • Secure User Portal
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
          background: 'rgba(10,15,30,0.8)', padding: '4px', borderRadius: '10px',
          marginBottom: '20px', border: '1px solid var(--border-glass)',
        }}>
          {['login', 'register'].map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => switchTab(tab)}
              style={{
                padding: '10px', borderRadius: '8px', border: 'none',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                background: activeTab === tab
                  ? 'linear-gradient(135deg, #00f2fe, #4facfe)'
                  : 'transparent',
                color: activeTab === tab ? '#050b14' : 'var(--text-muted)',
                transition: 'all 0.2s ease',
              }}
            >
              {tab === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div style={{
            background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.4)',
            color: '#f43f5e', padding: '10px 14px', borderRadius: '10px',
            fontSize: '0.8rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div style={{
            background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
            color: '#10b981', padding: '10px 14px', borderRadius: '10px',
            fontSize: '0.8rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Username (Register only) */}
          {activeTab === 'register' && (
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                Username *
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Choose a username (min 3 chars)"
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              Email Address *
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@example.com"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              Password (min 6 characters) *
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputWithEyeStyle}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{ position: 'absolute', right: '12px', top: '10px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Register only) */}
          {activeTab === 'register' && (
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                Confirm Password *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputWithEyeStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(p => !p)}
                  style={{ position: 'absolute', right: '12px', top: '10px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            className="glow-btn"
            type="submit"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '6px', opacity: loading ? 0.7 : 1 }}
          >
            {loading
              ? (activeTab === 'register' ? 'Creating Account...' : 'Signing In...')
              : (activeTab === 'register' ? 'Register Account' : 'Sign In')}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
          {activeTab === 'login'
            ? <>No account? <button type="button" onClick={() => switchTab('register')} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.72rem' }}>Register here</button></>
            : <>Already registered? <button type="button" onClick={() => switchTab('login')} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.72rem' }}>Sign in</button></>
          }
        </div>
        <div style={{ marginTop: '8px', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
          Spring Boot Security JWT • MySQL Database Authentication
        </div>
      </div>
    </div>
  );
}
