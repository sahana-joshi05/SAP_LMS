import React, { useEffect, useState } from 'react';
import { LifeBuoy, Plus } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export default function SupportTickets() {
  const { auth } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ student_id: '', category: 'general', priority: 'medium', subject: '', description: '' });
  const [msg, setMsg] = useState(null);
  const isStudent = auth.user.role === 'student';

  const load = () => {
    api.listTickets(auth.token).then(setTickets).catch((e) => setMsg({ type: 'error', text: e.message }));
    if (!isStudent) api.listStudents(auth.token).then(setStudents).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      const payload = isStudent ? { ...form, student_id: undefined } : form;
      await api.createTicket(auth.token, payload);
      setForm({ student_id: '', category: 'general', priority: 'medium', subject: '', description: '' });
      setMsg({ type: 'success', text: 'Ticket created.' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <Layout>
      <PageHeader title="Support Tickets" subtitle="Student issues, priorities, ownership, and resolution tracking" />
      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      <div className="card">
        <h3><Plus /> New ticket</h3>
        <form className="inline-form" onSubmit={submit}>
          {!isStudent && (
            <div className="field">
              <label>Student</label>
              <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
                <option value="">Unassigned</option>
                {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
              </select>
            </div>
          )}
          <div className="field"><label>Category</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          <div className="field">
            <label>Priority</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="field"><label>Subject</label><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required /></div>
          <div className="field"><label>Description</label><textarea rows={1} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <button className="btn" type="submit">Create</button>
        </form>
      </div>

      <div className="card">
        <h3><LifeBuoy /> Tickets</h3>
        {tickets.length === 0 ? (
          <div className="empty-state">No tickets yet.</div>
        ) : (
          <table>
            <thead><tr><th>Subject</th><th>Category</th><th>Priority</th><th>Status</th><th>Resolution</th></tr></thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.subject}</td>
                  <td>{ticket.category}</td>
                  <td><Badge status={ticket.priority} /></td>
                  <td><Badge status={ticket.status} /></td>
                  <td>{ticket.resolution_notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
