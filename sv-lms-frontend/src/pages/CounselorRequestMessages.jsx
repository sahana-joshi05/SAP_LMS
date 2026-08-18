import React, { useEffect, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export default function CounselorRequestMessages() {
  const { auth } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({ subject: '', message: '', channel: 'in_app' });
  const [msg, setMsg] = useState(null);

  const load = () => api.listNotifications(auth.token).then(setNotifications).catch(() => {});

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.createNotification(auth.token, form);
      setForm({ subject: '', message: '', channel: 'in_app' });
      setMsg({ type: 'success', text: 'Request message queued.' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <Layout>
      <PageHeader title="Request Message" subtitle="Queue applicant or internal communication requests" />
      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}
      <div className="card">
        <h3><Send /> New message request</h3>
        <form className="inline-form" onSubmit={submit}>
          <div className="field"><label>Subject</label><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
          <div className="field"><label>Channel</label><select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}><option value="in_app">In app</option><option value="email">Email</option><option value="whatsapp">WhatsApp</option><option value="sms">SMS</option></select></div>
          <div className="field"><label>Message</label><textarea rows={1} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required /></div>
          <button className="btn" type="submit">Submit</button>
        </form>
      </div>
      <div className="card">
        <h3><MessageSquare /> Message history</h3>
        {notifications.length === 0 ? <div className="empty-state">No messages yet.</div> : notifications.map((item) => (
          <div className="list-item-row" key={item.id}>
            <div style={{ flex: 1 }}>
              <div className="list-item-title">{item.subject || item.channel}</div>
              <div className="list-item-sub">{item.message}</div>
            </div>
            <Badge status={item.status} />
          </div>
        ))}
      </div>
    </Layout>
  );
}
