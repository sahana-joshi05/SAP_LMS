import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { api } from '../api.js';
import logo from '../assets/logo-icon-square.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
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
            <h2>Reset password</h2>
            <p className="tagline">We'll send a reset link to your email</p>
          </div>
        </div>

        {error && <div className="msg error"><AlertCircle size={16} />{error}</div>}

        {sent ? (
          <div className="msg success">
            <CheckCircle2 size={16} />
            If an account exists for that email, a reset link has been sent. In this dev
            build, check the backend console log for the link (no real email is sent yet).
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 18, fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to login
        </Link>
      </div>
    </div>
  );
}
