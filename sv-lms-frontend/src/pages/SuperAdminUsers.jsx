import React, { useEffect, useState } from 'react';
import { Edit3, Eye, EyeOff, Trash2, UserPlus, X } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

const SUPERADMIN_ROLES = ['admin', 'counselor', 'operations', 'seo', 'trainer', 'student'];
const ADMIN_ROLES = ['counselor', 'operations', 'seo', 'trainer'];

export default function SuperAdminUsers() {
  const { auth } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'counselor' });
  const [msg, setMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const roleOptions = auth.user.role === 'superadmin' ? SUPERADMIN_ROLES : ADMIN_ROLES;

  const load = () => api.listUsers(auth.token).then(setUsers).catch((e) => setMsg({ type: 'error', text: e.message }));

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ name: '', email: '', phone: '', password: '', role: 'counselor' });
    setEditingUser(null);
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      if (editingUser) {
        await api.updateUser(auth.token, editingUser.id, form);
        setMsg({ type: 'success', text: `User "${form.name}" updated.` });
      } else {
        await api.createUser(auth.token, form);
        setMsg({ type: 'success', text: `User "${form.name}" created.` });
      }
      resetForm();
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleEdit = (user) => {
    setMsg(null);
    setEditingUser(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      role: user.role || 'counselor',
    });
    setShowPassword(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(`Delete user "${user.name}"? This cannot be undone.`);
    if (!confirmed) return;

    setMsg(null);
    setDeletingId(user.id);
    try {
      await api.deleteUser(auth.token, user.id);
      setMsg({ type: 'success', text: `User "${user.name}" deleted.` });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout>
      <PageHeader title="Users" subtitle="Create login credentials for Admin, Counselor, Operations, SEO, Instructor, and Student roles" />
      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      <div className="card">
        <h3><UserPlus /> {editingUser ? 'Edit user' : 'Create a new user'}</h3>
        <form className="inline-form" onSubmit={handleSubmit}>
          <div className="field"><label>Name</label><input name="name" value={form.name} onChange={handleChange} required /></div>
          <div className="field"><label>Email</label><input name="email" type="email" value={form.email} onChange={handleChange} required /></div>
          <div className="field"><label>Phone</label><input name="phone" value={form.phone} onChange={handleChange} /></div>
          <div className="field">
            <label>Password</label>
            <div className="password-input-wrap">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required={!editingUser}
                placeholder={editingUser ? 'Leave blank to keep current password' : ''}
              />
              <button
                type="button"
                className="password-eye-btn"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>
          <div className="field">
            <label>Role</label>
            <select name="role" value={form.role} onChange={handleChange}>
              {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button className="btn" type="submit">{editingUser ? 'Update user' : 'Create user'}</button>
          {editingUser && (
            <button className="btn secondary" type="button" onClick={resetForm}>
              <X size={16} /> Cancel
            </button>
          )}
        </form>
      </div>

      <div className="card">
        <h3>All users</h3>
        {users.length === 0 ? (
          <div className="empty-state">No users yet.</div>
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                  <td><Badge status={u.status} /></td>
                  <td>
                    <button
                      type="button"
                      className="icon-edit-btn"
                      onClick={() => handleEdit(u)}
                      disabled={u.role === 'superadmin'}
                      title={u.role === 'superadmin' ? 'Super Admin cannot be edited here' : 'Edit user'}
                      aria-label={`Edit ${u.name}`}
                    >
                      <Edit3 />
                    </button>
                    <button
                      type="button"
                      className="icon-danger-btn"
                      onClick={() => handleDelete(u)}
                      disabled={deletingId === u.id || u.id === auth.user.id || u.role === 'superadmin'}
                      title={u.role === 'superadmin' ? 'Super Admin cannot be deleted' : 'Delete user'}
                      aria-label={`Delete ${u.name}`}
                    >
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
