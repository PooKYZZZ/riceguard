import React, { useState, useEffect } from 'react';
import './App.css';
import Button from './components/button';
import Home from './components/pages/home';

function App() {
  // --- CONFIG ---
  const API_BASE =
    process.env.REACT_APP_API_URL?.replace(/\/+$/, '') ||
    'http://127.0.0.1:8000/api/v1';

  const publicUrl = process.env.PUBLIC_URL || '';
  const bgUrl = `${publicUrl}/bg.jpg`;
  const logoUrl = `${publicUrl}/logo.png`;

  // --- UI STATE ---
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [route, setRoute] = useState('main');

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

  // ---------------- LOGIN & SIGNUP MODALS ----------------
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

  // ---------------- API HELPERS ----------------
  async function apiRegister({ name, email, password }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Register failed');
    return data;
  }

  async function apiLogin({ email, password }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Login failed');
    return data;
  }

  // ---------------- HANDLERS ----------------
  async function submitSignup(e) {
    e.preventDefault();
    setSignupError('');
    setAuthError('');

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

    const derivedName = email.split('@')[0] || 'User';

    try {
      setAuthBusy(true);
      await apiRegister({ name: derivedName, email, password: signupPass });
      const auth = await apiLogin({ email, password: signupPass });

      localStorage.setItem('rg_token', auth.accessToken);
      localStorage.setItem('rg_user', JSON.stringify(auth.user));

      closeSignup();
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
    } catch (err) {
      setAuthError(err.message || 'Login failed');
    } finally {
      setAuthBusy(false);
    }
  }

  // optional debug helper
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

  // ---------------- RENDER ----------------
  return (
    <div className="App">
      <div className="top-nav">
        <Button variant="outline" onClick={() => setRoute('home')}>Home</Button>
      </div>
      <img src={bgUrl} alt="background" className="bg-image" />

      {route === 'home' ? (
        <Home />
      ) : route === 'history' ? (
        <div className="content">
          <h2 style={{ color: 'white' }}>History (placeholder)</h2>
          <p style={{ color: 'white' }}>No history view implemented yet.</p>
        </div>
      ) : (
      <div className="content">
        <img src={logoUrl} alt="logo" className="logo" />

<<<<<<< HEAD
        {localStorage.getItem('rg_user') ? (
          <>
            <p className="tagline">
              Welcome back,{' '}
              {JSON.parse(localStorage.getItem('rg_user')).name ||
                JSON.parse(localStorage.getItem('rg_user')).email}
              !
            </p>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
            >
              Log out
            </Button>
          </>
        ) : (
          <>
            <p className="tagline">
              We're here to guide you — Your Smart Companion for Healthy Rice Fields
            </p>
            <div className="actions">
              <Button variant="outline" onClick={openLogin}>
                Log in
              </Button>
              <Button variant="primary" onClick={openSignup}>
                Sign Up
              </Button>
            </div>
          </>
        )}

=======
        <div className="logo-actions">
          <Button variant="outline" onClick={() => setRoute('home')}>Home</Button>
          <Button variant="outline" onClick={() => setRoute('history')}>History</Button>
          <Button
            variant="outline"
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            Logout
          </Button>
        </div>

        {localStorage.getItem('rg_user') ? (
          <>
            <p className="tagline">
              Welcome back,{' '}
              {JSON.parse(localStorage.getItem('rg_user')).name ||
                JSON.parse(localStorage.getItem('rg_user')).email}
              !
            </p>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
            >
              Log out
            </Button>
          </>
        ) : (
          <>
            <p className="tagline">
              We're here to guide you — Your Smart Companion for Healthy Rice Fields
            </p>
            <div className="actions">
              <Button variant="outline" onClick={openLogin}>
                Log in
              </Button>
              <Button variant="primary" onClick={openSignup}>
                Sign Up
              </Button>
            </div>
          </>
        )}

>>>>>>> 29e2dda8098aebbeb1130ef77f899e1273300065
        {/* Shared auth error */}
        {authError && (
          <div style={{ color: '#b91c1c', marginTop: '0.5rem' }}>{authError}</div>
        )}
  </div>

  )}

  {loginOpen && (
        <div className="modal-backdrop" onClick={closeLogin}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-avatar-wrap">
              <img
                src={`${publicUrl}/user.png`}
                alt="user avatar"
                className="modal-avatar"
              />
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
                <Button variant="outline" type="button" onClick={closeLogin}>
                  Cancel
                </Button>
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
              <img
                src={`${publicUrl}/user.png`}
                alt="user avatar"
                className="modal-avatar"
              />
            </div>
            <h2>Sign Up</h2>
            <form onSubmit={submitSignup}>
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
                <div
                  className="signup-error"
                  role="alert"
                  style={{ color: '#b91c1c', marginTop: '0.25rem' }}
                >
                  {signupError}
                </div>
              )}

              <div className="modal-actions">
                <Button variant="outline" type="button" onClick={closeSignup}>
                  Cancel
                </Button>
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