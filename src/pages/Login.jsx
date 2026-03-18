// ── src/pages/Login.jsx ──
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { login, register, isAuth } = useAuth();
  const navigate = useNavigate();
  const [tab,     setTab]     = useState('signin');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', role: '',
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  if (isAuth) return <Navigate to="/jobs" replace />;

  const handleSignIn = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/jobs');
    } catch (err) {
      // Dev mode: bypass auth if backend not running
      if (process.env.NODE_ENV === 'development') { navigate('/jobs'); return; }
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await register(form);
      navigate('/jobs');
    } catch (err) {
      if (process.env.NODE_ENV === 'development') { navigate('/jobs'); return; }
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      {/* LEFT */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo">Job<span>Hunt</span>AI</div>
          <div className="login-logo-sub">AI Job Intelligence Platform</div>
        </div>

        <h1 className="login-hero">
          Find your next role<br />with <span>AI precision</span>
        </h1>
        <p className="login-sub">
          Real-time job indexing across 16+ sources. Semantic search,
          salary intelligence, and personalized AI matches — all in one command center.
        </p>

        <div className="login-stats">
          {[['1.2M+','Jobs indexed'],['16','Live sources'],['15min','Refresh cycle'],['95%','AI accuracy']].map(([v,l]) => (
            <div key={l} className="login-stat">
              <div className="ls-val">{v}</div>
              <div className="ls-lbl">{l}</div>
            </div>
          ))}
        </div>

        <div className="login-ticker">
          {[
            ['var(--accent)', '83 new jobs in last hour'],
            ['var(--a2)',     '247 added today'],
            ['var(--a3)',     '24 users online'],
          ].map(([color, text]) => (
            <div key={text} className="ticker-item">
              <span className="live-dot" style={{ background: color }} />
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div className="login-right">
        <div className="login-card fade-up">

          {/* Tabs */}
          <div className="login-tabs">
            <button className={`ltab ${tab === 'signin' ? 'active' : ''}`} onClick={() => setTab('signin')}>Sign In</button>
            <button className={`ltab ${tab === 'signup' ? 'active' : ''}`} onClick={() => setTab('signup')}>Sign Up</button>
          </div>

          {error && <div className="login-error">{error}</div>}

          {/* Sign In */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn}>
              <h2 className="form-title">Welcome back</h2>
              <p className="form-sub">Sign in to your JobHuntAI account</p>
              <Field label="Email">
                <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
              </Field>
              <Field label="Password">
                <input className="input" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required />
              </Field>
              <div className="forgot">Forgot password?</div>
              <button className="btn btn-primary login-submit" type="submit" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Sign In →'}
              </button>
              <SocialButtons />
            </form>
          )}

          {/* Sign Up */}
          {tab === 'signup' && (
            <form onSubmit={handleRegister}>
              <h2 className="form-title">Create account</h2>
              <p className="form-sub">Start finding smarter jobs today</p>
              <div className="row2">
                <Field label="First name">
                  <input className="input" type="text" value={form.firstName} onChange={set('firstName')} placeholder="Arjun" required />
                </Field>
                <Field label="Last name">
                  <input className="input" type="text" value={form.lastName} onChange={set('lastName')} placeholder="Sharma" required />
                </Field>
              </div>
              <Field label="Email">
                <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
              </Field>
              <Field label="Password">
                <input className="input" type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters" required />
              </Field>
              <Field label="Primary Role">
                <input className="input" type="text" value={form.role} onChange={set('role')} placeholder="e.g. Python Backend Developer" />
              </Field>
              <button className="btn btn-primary login-submit" type="submit" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Create Account →'}
              </button>
              <SocialButtons label="sign up" />
            </form>
          )}

          <p className="login-terms">
            By continuing you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="login-field">
      <label className="field-lbl">{label}</label>
      {children}
    </div>
  );
}

function SocialButtons({ label = 'continue' }) {
  return (
    <>
      <div className="login-or">
        <span className="or-line" /><span className="or-text">or {label} with</span><span className="or-line" />
      </div>
      <button type="button" className="btn social-btn">
        <svg width="15" height="15" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        Google
      </button>
      <button type="button" className="btn social-btn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        LinkedIn
      </button>
    </>
  );
}
