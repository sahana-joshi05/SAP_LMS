import React, { useEffect, useState } from 'react';
import { Layers, CalendarCheck } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export default function OperationsBatches() {
  const { auth } = useAuth();
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [form, setForm] = useState({ course_id: '', trainer_id: '', batch_name: '', start_date: '', mode: 'online', timing: '' });
  const [msg, setMsg] = useState(null);

  // attendance state
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [roster, setRoster] = useState([]);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceMap, setAttendanceMap] = useState({});

  const load = () => api.listBatches(auth.token).then(setBatches).catch((e) => setMsg({ type: 'error', text: e.message }));

  useEffect(() => {
    load();
    api.listCourses(auth.token).then(setCourses).catch(() => {});
    api.listUsers(auth.token, 'trainer').then(setTrainers).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.createBatch(auth.token, form);
      setMsg({ type: 'success', text: `Batch "${form.batch_name}" created.` });
      setForm({ course_id: '', trainer_id: '', batch_name: '', start_date: '', mode: 'online', timing: '' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const openAttendance = async (batchId) => {
    setSelectedBatch(batchId);
    setMsg(null);
    try {
      const detail = await api.getBatch(auth.token, batchId);
      setRoster(detail.roster);
      const initMap = {};
      detail.roster.forEach((s) => { initMap[s.student_id] = 'present'; });
      setAttendanceMap(initMap);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const submitAttendance = async () => {
    setMsg(null);
    const records = roster.map((s) => ({ student_id: s.student_id, status: attendanceMap[s.student_id] || 'present' }));
    try {
      await api.markAttendance(auth.token, { batch_id: selectedBatch, session_date: sessionDate, records });
      setMsg({ type: 'success', text: 'Attendance recorded.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <Layout>
      <PageHeader title="Batches" subtitle="Create batches, assign trainers, and mark attendance" />
      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      <div className="card">
        <h3><Layers /> Create a batch</h3>
        <form className="inline-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Course</label>
            <select name="course_id" value={form.course_id} onChange={handleChange} required>
              <option value="">-- select --</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Trainer</label>
            <select name="trainer_id" value={form.trainer_id} onChange={handleChange}>
              <option value="">-- unassigned --</option>
              {trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="field"><label>Batch name</label><input name="batch_name" value={form.batch_name} onChange={handleChange} placeholder="FICO-Evening-Batch-2" required /></div>
          <div className="field"><label>Start date</label><input name="start_date" type="date" value={form.start_date} onChange={handleChange} /></div>
          <div className="field">
            <label>Mode</label>
            <select name="mode" value={form.mode} onChange={handleChange}>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className="field"><label>Timing</label><input name="timing" value={form.timing} onChange={handleChange} placeholder="6:00 PM - 8:00 PM" /></div>
          <button className="btn" type="submit">Create batch</button>
        </form>
      </div>

      <div className="card">
        <h3>All batches</h3>
        {batches.length === 0 ? (
          <div className="empty-state">No batches yet — create your first one above.</div>
        ) : (
          <table>
            <thead><tr><th>Batch</th><th>Course</th><th>Mode</th><th>Timing</th><th>Attendance</th></tr></thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id}>
                  <td>{b.batch_name}</td><td>{b.course_name}</td>
                  <td><Badge status={b.mode} /></td><td>{b.timing}</td>
                  <td><button className="btn small secondary" onClick={() => openAttendance(b.id)}><CalendarCheck size={13} style={{ marginRight: 4, verticalAlign: -2 }} />Mark attendance</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedBatch && (
        <div className="card">
          <h3>Mark attendance</h3>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Session date</label>
            <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
          </div>
          {roster.length === 0 ? (
            <div className="empty-state">No students enrolled in this batch yet.</div>
          ) : (
            <table>
              <thead><tr><th>Student</th><th>Status</th></tr></thead>
              <tbody>
                {roster.map((s) => (
                  <tr key={s.student_id}>
                    <td>{s.name}</td>
                    <td>
                      <select
                        value={attendanceMap[s.student_id] || 'present'}
                        onChange={(e) => setAttendanceMap({ ...attendanceMap, [s.student_id]: e.target.value })}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {roster.length > 0 && <button className="btn" style={{ marginTop: 14 }} onClick={submitAttendance}>Save attendance</button>}
        </div>
      )}
    </Layout>
  );
}
