import React, { useEffect, useState } from 'react';
import { Bell, Download, ScrollText } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export default function AdminReports() {
  const { auth } = useAuth();
  const [summary, setSummary] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [notification, setNotification] = useState({ recipient_user_id: '', channel: 'in_app', subject: '', message: '' });
  const [msg, setMsg] = useState(null);

  const load = () => {
    api.getReportSummary(auth.token).then(setSummary).catch((e) => setMsg({ type: 'error', text: e.message }));
    api.getAuditLogs(auth.token).then(setAuditLogs).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const sendNotification = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.createNotification(auth.token, notification);
      setNotification({ recipient_user_id: '', channel: 'in_app', subject: '', message: '' });
      setMsg({ type: 'success', text: 'Notification queued.' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const downloadCsv = async () => {
    const res = await fetch('/api/reports/export.csv', { headers: { Authorization: `Bearer ${auth.token}` } });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lms-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <PageHeader
        title="Reports & Audit"
        subtitle="Management KPIs, authorized export, notification queue, and important record changes"
        cta={<button className="btn-cta" type="button" onClick={downloadCsv}><Download size={16} /> Export CSV</button>}
      />
      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      {summary && (
        <div className="stat-grid">
          <StatCard icon={ScrollText} num={summary.total_leads} label="Leads" />
          <StatCard icon={ScrollText} num={summary.total_students} label="Students" />
          <StatCard icon={ScrollText} num={summary.pending_tickets} label="Pending Tickets" />
          <StatCard icon={ScrollText} num={summary.issued_certificates} label="Issued Certificates" />
        </div>
      )}

      <div className="card">
        <h3><Bell /> Queue notification</h3>
        <form className="inline-form" onSubmit={sendNotification}>
          <div className="field"><label>Recipient user ID</label><input value={notification.recipient_user_id} onChange={(e) => setNotification({ ...notification, recipient_user_id: e.target.value })} /></div>
          <div className="field">
            <label>Channel</label>
            <select value={notification.channel} onChange={(e) => setNotification({ ...notification, channel: e.target.value })}>
              <option value="in_app">In app</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
            </select>
          </div>
          <div className="field"><label>Subject</label><input value={notification.subject} onChange={(e) => setNotification({ ...notification, subject: e.target.value })} /></div>
          <div className="field"><label>Message</label><textarea rows={1} value={notification.message} onChange={(e) => setNotification({ ...notification, message: e.target.value })} required /></div>
          <button className="btn" type="submit">Queue</button>
        </form>
      </div>

      <div className="card">
        <h3>Audit log</h3>
        {auditLogs.length === 0 ? (
          <div className="empty-state">No audit entries yet.</div>
        ) : (
          <table>
            <thead><tr><th>Action</th><th>Entity</th><th>Actor</th><th>When</th><th>Details</th></tr></thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td><Badge status={log.action} /></td>
                  <td>{log.entity_type} #{log.entity_id}</td>
                  <td>{log.actor_role}</td>
                  <td>{log.created_at}</td>
                  <td>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
