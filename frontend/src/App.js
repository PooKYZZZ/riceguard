import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import Button from './components/button';

function App() {
  const publicUrl = process.env.PUBLIC_URL;
  const bgUrl = `${publicUrl}/bg.jpg`;
  const logoUrl = `${publicUrl}/logo.png`;

  // React Router navigation
  const navigate = useNavigate();

  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signupPass, setSignupPass] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupError, setSignupError] = useState('');

  function openLogin() {
    setLoginOpen(true);
  }

  function closeLogin() {
    setLoginOpen(false);
    setUsername('');
    setPassword('');
  }

  function openSignup() {
    setSignupOpen(true);
  }

  function closeSignup() {
    setSignupOpen(false);
    setSignupPass('');
    setSignupEmail('');
    setSignupConfirm('');
    setSignupError('');
  }

  function submitSignup(e) {
    e.preventDefault();
    setSignupError('');
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

    console.log('Signup submit', { signupEmail, signupPass });
    closeSignup();
  }

  function submitLogin(e) {
    e.preventDefault();
    console.log('Login submit', { username, password });
    closeLogin();
    navigate('/scan'); // ✅ Redirect to Scan Page after login
  }

  // Debug helper
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
        <p className="tagline">
          We're here to guide you — "Your Smart Companion for Healthy Rice Fields"
        </p>

        <div className="actions">
          <Button variant="outline" onClick={openLogin}>
            Log in
          </Button>
          <Button variant="primary" onClick={openSignup}>
            Sign Up
          </Button>
        </div>
      </div>

      {/* ✅ Login Modal */}
      {loginOpen && (
        <div className="modal-backdrop">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-avatar-wrap">
              <img
                src={`${process.env.PUBLIC_URL}/user.png`}
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
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                <Button variant="primary" type="submit">
                  Log in
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Signup Modal */}
      {signupOpen && (
        <div className="modal-backdrop">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-avatar-wrap">
              <img
                src={`${process.env.PUBLIC_URL}/user.png`}
                alt="user avatar"
                className="modal-avatar"
              />
            </div>
            <h2>Sign Up</h2>
            <form onSubmit={submitSignup}>
              {/** Username removed for signup **/}
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
                <Button variant="primary" type="submit">
                  Sign Up
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
