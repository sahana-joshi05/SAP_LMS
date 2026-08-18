import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../api.js';
import logo from '../assets/logo-icon-square.png';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [manualToken, setManualToken] = useState(token);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(manualToken, newPassword);
      setDone(true);
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
            <h2>Set a new password</h2>
            <p className="tagline">Paste the reset token from your email</p>
          </div>
        </div>

        {error && <div className="msg error"><AlertCircle size={16} />{error}</div>}

        {done ? (
          <div className="msg success">
            <CheckCircle2 size={16} />
            Password updated. You can log in with your new password now.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Reset token</label>
              <input value={manualToken} onChange={(e) => setManualToken(e.target.value)} required />
            </div>
            <div className="field">
              <label>New password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div className="field">
              <label>Confirm new password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        )}

        {done ? (
          <button className="btn secondary" style={{ width: '100%', marginTop: 14 }} onClick={() => navigate('/login')}>
            Go to login
          </button>
        ) : (
          <Link to="/login" style={{ display: 'block', marginTop: 18, fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>
            Back to login
          </Link>
        )}
      </div>
    </div>
  );
}
