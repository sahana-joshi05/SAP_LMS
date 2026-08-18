import React, { useEffect, useState } from 'react';
import { Layers, Users, Upload, CalendarCheck, FileText, Video, Link2, ClipboardList } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import StatCard from '../components/StatCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

const CONTENT_ICONS = { material: FileText, video: Video, link: Link2, assignment: ClipboardList };

export default function TrainerDashboard() {
  const { auth } = useAuth();
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [roster, setRoster] = useState([]);
  const [content, setContent] = useState([]);
  const [msg, setMsg] = useState(null);
  const [totalStudents, setTotalStudents] = useState(0);

  const [contentForm, setContentForm] = useState({ title: '', type: 'material', body: '' });
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceMap, setAttendanceMap] = useState({});

  useEffect(() => {
    api.listBatches(auth.token).then(async (list) => {
      setBatches(list);
      // Feature: total students across all my batches, for the stat card
      const details = await Promise.all(list.map((b) => api.getBatch(auth.token, b.id).catch(() => ({ roster: [] }))));
      setTotalStudents(details.reduce((sum, d) => sum + (d.roster?.length || 0), 0));
    }).catch((e) => setMsg({ type: 'error', text: e.message }));
  }, []);

  const openBatch = async (batchId) => {
    setSelectedBatch(batchId);
    setMsg(null);
    try {
      const detail = await api.getBatch(auth.token, batchId);
      setRoster(detail.roster);
      const initMap = {};
      detail.roster.forEach((s) => { initMap[s.student_id] = 'present'; });
      setAttendanceMap(initMap);
      const c = await api.getBatchContent(auth.token, batchId);
      setContent(c);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const uploadContent = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.createContent(auth.token, { batch_id: selectedBatch, ...contentForm });
      setMsg({ type: 'success', text: 'Material uploaded.' });
      setContentForm({ title: '', type: 'material', body: '' });
      const c = await api.getBatchContent(auth.token, selectedBatch);
      setContent(c);
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
      <PageHeader title="My Batches" subtitle="Batches assigned to you — upload material and mark attendance" />
      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      <div className="stat-grid">
        <StatCard icon={Layers} num={batches.length} label="Assigned Batches" />
        <StatCard icon={Users} num={totalStudents} label="Total Students" />
      </div>

      <div className="card">
        <h3><Layers /> Assigned batches</h3>
        {batches.length === 0 ? (
          <div className="empty-state">No batches assigned to you yet.</div>
        ) : (
          batches.map((b) => (
            <div className="entity-card" key={b.id}>
              <div className="entity-card-header">
                <div>
                  <div className="entity-card-title">{b.course_name} &mdash; {b.batch_name}</div>
                  <div className="entity-card-meta">{b.mode} &middot; {b.timing || 'No timing set'}</div>
                </div>
                <button className="btn small secondary" onClick={() => openBatch(b.id)}>Open</button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedBatch && (
        <>
          <div className="card">
            <h3><Upload /> Upload course material</h3>
            <form className="inline-form" onSubmit={uploadContent}>
              <div className="field"><label>Title</label><input value={contentForm.title} onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })} required /></div>
              <div className="field">
                <label>Type</label>
                <select value={contentForm.type} onChange={(e) => setContentForm({ ...contentForm, type: e.target.value })}>
                  <option value="material">Material (PDF/PPT link)</option>
                  <option value="video">Recorded Video</option>
                  <option value="link">Live Class Link</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>
              <div className="field"><label>Link / Notes</label><textarea value={contentForm.body} onChange={(e) => setContentForm({ ...contentForm, body: e.target.value })} rows={1} /></div>
              <button className="btn" type="submit">Upload</button>
            </form>
            {content.length > 0 && (
              <div style={{ marginTop: 14 }}>
                {content.map((c) => {
                  const Icon = CONTENT_ICONS[c.type] || FileText;
                  return (
                    <div className="list-item-row" key={c.id}>
                      <div className="list-item-icon"><Icon /></div>
                      <div style={{ flex: 1 }}>
                        <div className="list-item-title">{c.title}</div>
                        <div className="list-item-sub">{c.type} &middot; {c.uploaded_at}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card">
            <h3><CalendarCheck /> Mark attendance</h3>
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
        </>
      )}
    </Layout>
  );
}
