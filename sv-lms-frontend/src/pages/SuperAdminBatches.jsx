import React, { useEffect, useState } from 'react';
import { Eye, Layers, Trash2, Users } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export default function SuperAdminBatches() {
  const { auth } = useAuth();
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);

  const load = () => {
    api.listBatches(auth.token).then(setBatches).catch((e) => setError(e.message));
    api.listStudents(auth.token).then(setStudents).catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
  }, []);

  const removeBatch = async (batch) => {
    setError('');
    setMsg(null);
    try {
      await api.deleteBatch(auth.token, batch.id);
      setMsg({ type: 'success', text: `Batch "${batch.batch_name}" removed.` });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <PageHeader title="Batches & Students" subtitle="Institute-wide view across every batch and student" />
      {error && <div className="msg error">{error}</div>}
      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      <div className="card">
        <h3><Layers /> All batches</h3>
        {batches.length === 0 ? (
          <div className="empty-state">No batches yet.</div>
        ) : (
          <table>
            <thead><tr><th>Batch</th><th>Course</th><th>Mode</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className="list-item-title">{b.batch_name}</div>
                    <div className="list-item-sub">{b.timing || 'Timing not set'}</div>
                  </td>
                  <td>{b.course_name}</td>
                  <td><Badge status={b.mode} /></td>
                  <td><Badge status={b.status} /></td>
                  <td>
                    <button className="icon-danger-btn" type="button" onClick={() => removeBatch(b)} title="Remove batch" aria-label={`Remove ${b.batch_name}`}>
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3><Users /> All students</h3>
        {students.length === 0 ? (
          <div className="empty-state">No students yet.</div>
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Enrolled</th><th>Remaining</th><th>Status</th><th>View</th></tr></thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td><td>{s.email}</td><td>{s.enrollment_date}</td>
                  <td className="num-cell">&#8377;{s.remaining_payment_amount || 0}</td>
                  <td><Badge status={s.status} /></td>
                  <td>
                    <button className="icon-view-btn" type="button" onClick={() => setViewStudent(s)} title="View admission details">
                      <Eye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {viewStudent && (
        <div className="modal-backdrop">
          <div className="modal-card lead-view-modal">
            <button className="modal-close" type="button" onClick={() => setViewStudent(null)}>x</button>
            <h3><Eye /> Admission details</h3>
            <div className="detail-grid">
              <div><span>Name</span><strong>{viewStudent.name}</strong></div>
              <div><span>Email</span><strong>{viewStudent.email}</strong></div>
              <div><span>Phone</span><strong>{viewStudent.phone || '-'}</strong></div>
              <div><span>Remaining amount</span><strong>&#8377;{viewStudent.remaining_payment_amount || 0}</strong></div>
              <div><span>Transaction ID</span><strong>{viewStudent.transaction_id || '-'}</strong></div>
              <div><span>Due date</span><strong>{viewStudent.fee_due_date || '-'}</strong></div>
              <div><span>Date of birth</span><strong>{viewStudent.date_of_birth || '-'}</strong></div>
              <div><span>Gender</span><strong>{viewStudent.gender || '-'}</strong></div>
              <div><span>State</span><strong>{viewStudent.state || '-'}</strong></div>
              <div><span>Country</span><strong>{viewStudent.country || '-'}</strong></div>
              <div><span>Status</span><strong>{viewStudent.status}</strong></div>
              <div><span>Degree</span><strong>{viewStudent.degree || '-'}</strong></div>
              <div><span>Passed year</span><strong>{viewStudent.passed_year || '-'}</strong></div>
              <div><span>Marks</span><strong>{viewStudent.marks || '-'}</strong></div>
              <div><span>University</span><strong>{viewStudent.university || '-'}</strong></div>
              <div className="detail-full"><span>Personal details</span><strong>{viewStudent.personal_details || '-'}</strong></div>
              <div className="detail-full"><span>Educational details</span><strong>{viewStudent.educational_details || '-'}</strong></div>
              <div className="detail-full"><span>Fee details</span><strong>{viewStudent.fee_details || '-'}</strong></div>
              <div className="detail-full"><span>Document details</span><strong>{viewStudent.document_details || '-'}</strong></div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
