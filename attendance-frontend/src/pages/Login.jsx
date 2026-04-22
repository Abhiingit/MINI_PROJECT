import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy]         = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true);
    const ok = await login(email, password);
    setBusy(false);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="login-shell">
      <div className="login-card fade-up">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <LayoutDashboard size={18} color="white" />
          </div>
          <span className="login-brand-name">AttendTrack</span>
        </div>

        <h1 className="login-heading">Sign in</h1>
        <p className="login-sub">Enter your credentials to access your dashboard.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <div className="input-wrap">
              <span className="input-icon"><Mail size={14} /></span>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="field" style={{ marginBottom: '20px' }}>
            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <span className="input-icon"><Lock size={14} /></span>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={busy || !email || !password}
          >
            {busy ? <span className="spinner" /> : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
