import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import logo from '../assets/logo-icon-square.png';

const ROLE_HOME = {
  superadmin: '/superadmin',
  admin: '/admin',
  counselor: '/counselor',
  operations: '/operations',
  seo: '/seo',
  trainer: '/trainer',
  student: '/student',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await api.login(email, password);
      login(token, user);
      navigate(ROLE_HOME[user.role] || '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <img src={logo} alt="SV Curiotech" className="login-brand-mark" />
          <div>
            <h2>SV LMS</h2>
            <p className="tagline">SAP Training Institute Portal</p>
          </div>
        </div>
        {error && <div className="msg error"><AlertCircle size={16} />{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <Link to="/forgot-password" style={{ display: 'block', marginTop: 14, fontSize: 12.5, color: 'var(--muted)', textAlign: 'center', textDecoration: 'none' }}>
          Forgot password?
        </Link>
      </div>
    </div>
  );
}
