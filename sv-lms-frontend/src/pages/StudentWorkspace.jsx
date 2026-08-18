import React, { useEffect, useState } from 'react';
import { Award, Bell, ClipboardList, FileUp } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export default function StudentWorkspace() {
  const { auth } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [submission, setSubmission] = useState({ assignment_id: '', submission_text: '', submission_url: '' });
  const [msg, setMsg] = useState(null);

  const load = () => {
    api.listAssignments(auth.token).then(setAssignments).catch(() => {});
    api.listExams(auth.token).then(setExams).catch(() => {});
    api.listCertificates(auth.token).then(setCertificates).catch(() => {});
    api.listNotifications(auth.token).then(setNotifications).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.submitAssignment(auth.token, submission.assignment_id, {
        submission_text: submission.submission_text,
        submission_url: submission.submission_url,
      });
      setSubmission({ assignment_id: '', submission_text: '', submission_url: '' });
      setMsg({ type: 'success', text: 'Assignment submitted.' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <Layout>
      <PageHeader title="Assignments, Exams & Certificates" subtitle="Submit work, view test schedules, notices, and certificate status" />
      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      <div className="card">
        <h3><FileUp /> Submit assignment</h3>
        <form className="inline-form" onSubmit={submit}>
          <div className="field">
            <label>Assignment</label>
            <select value={submission.assignment_id} onChange={(e) => setSubmission({ ...submission, assignment_id: e.target.value })} required>
              <option value="">Select assignment</option>
              {assignments.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
          </div>
          <div className="field"><label>Text</label><textarea rows={1} value={submission.submission_text} onChange={(e) => setSubmission({ ...submission, submission_text: e.target.value })} /></div>
          <div className="field"><label>Link</label><input value={submission.submission_url} onChange={(e) => setSubmission({ ...submission, submission_url: e.target.value })} /></div>
          <button className="btn" type="submit">Submit</button>
        </form>
      </div>

      <div className="card-grid-2">
        <div className="card">
          <h3><ClipboardList /> Assignments</h3>
          <table>
            <thead><tr><th>Title</th><th>Deadline</th><th>Status</th></tr></thead>
            <tbody>{assignments.map((item) => <tr key={item.id}><td>{item.title}</td><td>{item.deadline || '-'}</td><td><Badge status={item.status} /></td></tr>)}</tbody>
          </table>
        </div>
        <div className="card">
          <h3>Exams</h3>
          <table>
            <thead><tr><th>Title</th><th>When</th><th>Marks</th></tr></thead>
            <tbody>{exams.map((item) => <tr key={item.id}><td>{item.title}</td><td>{item.scheduled_at || '-'}</td><td>{item.total_marks || '-'}</td></tr>)}</tbody>
          </table>
        </div>
      </div>

      <div className="card-grid-2">
        <div className="card">
          <h3><Award /> Certificates</h3>
          <table>
            <thead><tr><th>Certificate</th><th>Status</th><th>Verification</th></tr></thead>
            <tbody>{certificates.map((item) => <tr key={item.id}><td>{item.certificate_number}</td><td><Badge status={item.eligibility_status} /></td><td>{item.verification_id || '-'}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="card">
          <h3><Bell /> Notifications</h3>
          {notifications.length === 0 ? <div className="empty-state">No notifications yet.</div> : notifications.map((item) => (
            <div className="list-item-row" key={item.id}>
              <div style={{ flex: 1 }}>
                <div className="list-item-title">{item.subject || item.channel}</div>
                <div className="list-item-sub">{item.message}</div>
              </div>
              <Badge status={item.status} />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
