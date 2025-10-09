import React, { useState, useEffect } from 'react';
import './App.css';
import Button from './components/button';

function App() {
  // --- CONFIG ---
  // CRA: read API base from REACT_APP_API_URL; fallback to localhost
  const API_BASE =
    process.env.REACT_APP_API_URL?.replace(/\/+$/, '') ||
    'http://127.0.0.1:8000/api/v1';

  // Keep your existing public URL images
  const publicUrl = process.env.PUBLIC_URL || '';
  const bgUrl = `${publicUrl}/bg.jpg`;
  const logoUrl = `${publicUrl}/logo.png`;

  // --- UI STATE ---
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  // login
  const [loginEmail, setLoginEmail] = useState('');
  const [password, setPassword] = useState('');

  // signup
  const [signupPass, setSignupPass] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupError, setSignupError] = useState('');

  // common auth state
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');

  // (optional) read saved user/token if you want to reflect logged-in state later
  // const savedUser = JSON.parse(localStorage.getItem('rg_user') || 'null');
  // const savedToken = localStorage.getItem('rg_token') || '';

  function openLogin() {
    setAuthError('');
    setLoginOpen(true);
  }

  function closeLogin() {
    setLoginOpen(false);
    setLoginEmail('');
    setPassword('');
    setAuthError('');
  }

  function openSignup() {
    setSignupOpen(true);
    setSignupError('');
    setAuthError('');
  }

  function closeSignup() {
    setSignupOpen(false);
    setSignupPass('');
    setSignupEmail('');
    setSignupConfirm('');
    setSignupError('');
    setAuthError('');
  }

  // ---- API HELPERS ----
  async function apiRegister({ name, email, password }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'Register failed');
    }
    return data; // { id, name, email }
  }

  async function apiLogin({ email, password }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || 'Login failed');
    }
    return data; // { accessToken, user:{id,name,email} }
  }

  // ---- HANDLERS ----
  async function submitSignup(e) {
    e.preventDefault();
    setSignupError('');
    setAuthError('');

    // client-side validation
    const email = signupEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSignupError('Please enter a valid email address.');
      return;
    }
    if (signupPass.length < 6) {
      setSignupError('Password must be at least 6 characters long.');
      return;
    }
    if (signupPass !== signupConfirm) {
      setSignupError('Passwords do not match.');
      return;
    }

    // Backend requires a name. Since your UI doesn’t include one,
    // derive a simple display name from the email (before @).
    const derivedName = email.split('@')[0] || 'User';

    try {
      setAuthBusy(true);
      // 1) Register
      await apiRegister({ name: derivedName, email, password: signupPass });
      // 2) Auto-login
      const auth = await apiLogin({ email, password: signupPass });

      // 3) Save token & user for later use
      localStorage.setItem('rg_token', auth.accessToken);
      localStorage.setItem('rg_user', JSON.stringify(auth.user));

      closeSignup();
      // OPTIONAL: redirect or update UI based on logged-in state
    } catch (err) {
      setAuthError(err.message || 'Sign up failed');
    } finally {
      setAuthBusy(false);
    }
  }

  async function submitLogin(e) {
    e.preventDefault();
    setAuthError('');
    try {
      setAuthBusy(true);
      const auth = await apiLogin({ email: loginEmail.trim(), password });
      localStorage.setItem('rg_token', auth.accessToken);
      localStorage.setItem('rg_user', JSON.stringify(auth.user));
      closeLogin();
      // OPTIONAL: redirect or update UI based on logged-in state
    } catch (err) {
      setAuthError(err.message || 'Login failed');
    } finally {
      setAuthBusy(false);
    }
  }

  // optional debug helper from your original code
  useEffect(() => {
    if (!loginOpen) return;
    function onFocusIn() {
      const el = document.activeElement;
      if (!el) return;
      console.log('focusin ->', el.tagName, el.id || '', el.className || el);
    }
    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, [loginOpen]);

  return (
    <div className="App">
      <img src={bgUrl} alt="background" className="bg-image" />

      <div className="content">
        <img src={logoUrl} alt="logo" className="logo" />
        <p className="tagline">We're here to guide you " Your Smart Companion for Healthy Rice Fields "</p>

        <div className="actions">
          <Button variant="outline" onClick={openLogin}>Log in</Button>
          <Button variant="primary" onClick={openSignup}>Sign Up</Button>
        </div>

        {/* Shared auth error (backend errors) */}
        {authError && (
          <div style={{ color: '#b91c1c', marginTop: '0.5rem' }}>{authError}</div>
        )}
      </div>

      {loginOpen && (
        <div className="modal-backdrop" onClick={closeLogin}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-avatar-wrap">
              <img src={`${publicUrl}/user.png`} alt="user avatar" className="modal-avatar" />
            </div>
            <h2>Log in</h2>
            <form onSubmit={submitLogin}>
              <div className="field">
                <span className="label-text">Email</span>
                <input
                  id="loginEmail"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <span className="label-text">Password</span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <Button variant="outline" type="button" onClick={closeLogin}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={authBusy}>
                  {authBusy ? 'Please wait…' : 'Log in'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {signupOpen && (
        <div className="modal-backdrop" onClick={closeSignup}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-avatar-wrap">
              <img src={`${publicUrl}/user.png`} alt="user avatar" className="modal-avatar" />
            </div>
            <h2>Sign Up</h2>
            <form onSubmit={submitSignup}>
              {/* Username intentionally omitted; we'll derive from email */}
              <div className="field">
                <span className="label-text">Email</span>
                <input
                  id="signupEmail"
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <span className="label-text">Password</span>
                <input
                  id="signupPass"
                  type="password"
                  value={signupPass}
                  onChange={(e) => setSignupPass(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <span className="label-text">Confirm Password</span>
                <input
                  id="signupConfirm"
                  type="password"
                  value={signupConfirm}
                  onChange={(e) => setSignupConfirm(e.target.value)}
                  required
                />
              </div>

              {signupError && (
                <div className="signup-error" role="alert" style={{ color: '#b91c1c', marginTop: '0.25rem' }}>
                  {signupError}
                </div>
              )}

              <div className="modal-actions">
                <Button variant="outline" type="button" onClick={closeSignup}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={authBusy}>
                  {authBusy ? 'Please wait…' : 'Sign Up'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
