import React, { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
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
  const roleOptions = auth.user.role === 'superadmin' ? SUPERADMIN_ROLES : ADMIN_ROLES;

  const load = () => api.listUsers(auth.token).then(setUsers).catch((e) => setMsg({ type: 'error', text: e.message }));

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.createUser(auth.token, form);
      setMsg({ type: 'success', text: `User "${form.name}" created.` });
      setForm({ name: '', email: '', phone: '', password: '', role: 'counselor' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <Layout>
      <PageHeader title="Users" subtitle="Create login credentials for Admin, Counselor, Operations, SEO, Instructor, and Student roles" />
      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      <div className="card">
        <h3><UserPlus /> Create a new user</h3>
        <form className="inline-form" onSubmit={handleSubmit}>
          <div className="field"><label>Name</label><input name="name" value={form.name} onChange={handleChange} required /></div>
          <div className="field"><label>Email</label><input name="email" type="email" value={form.email} onChange={handleChange} required /></div>
          <div className="field"><label>Phone</label><input name="phone" value={form.phone} onChange={handleChange} /></div>
          <div className="field"><label>Password</label><input name="password" type="password" value={form.password} onChange={handleChange} required /></div>
          <div className="field">
            <label>Role</label>
            <select name="role" value={form.role} onChange={handleChange}>
              {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button className="btn" type="submit">Create user</button>
        </form>
      </div>

      <div className="card">
        <h3>All users</h3>
        {users.length === 0 ? (
          <div className="empty-state">No users yet.</div>
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                  <td><Badge status={u.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
