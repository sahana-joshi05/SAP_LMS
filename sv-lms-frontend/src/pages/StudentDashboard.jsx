import React, { useEffect, useState } from 'react';
import { AlertTriangle, FileText, Video, Link2, ClipboardList, CalendarCheck } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

const CONTENT_ICONS = { material: FileText, video: Video, link: Link2, assignment: ClipboardList };

export default function StudentDashboard() {
  const { auth } = useAuth();
  const [summary, setSummary] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [fees, setFees] = useState([]);
  const [contentByBatch, setContentByBatch] = useState({});
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api.getMySummary(auth.token).then(async (s) => {
      setSummary(s);
      const contentMap = {};
      for (const b of s.batches) {
        contentMap[b.id] = await api.getBatchContent(auth.token, b.id);
      }
      setContentByBatch(contentMap);
    }).catch((e) => setMsg({ type: 'error', text: e.message }));

    api.getMyAttendance(auth.token).then(setAttendance).catch(() => {});
    // Feature: fee due summary, previously fetched but never shown in the UI
    api.getMyFees(auth.token).then(setFees).catch(() => {});
  }, []);

  // Feature: attendance percentage, computed from present/late vs total sessions
  const presentCount = attendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const attendancePct = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : null;

  const totalDue = fees.reduce((sum, f) => sum + (f.due_amount || 0), 0);

  return (
    <Layout>
      <PageHeader title="My Learning Dashboard" subtitle={`Welcome, ${auth.user.name}`} />
      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      {totalDue > 0 && (
        <div className="alert-banner warn">
          <AlertTriangle />
          <div className="alert-banner-text">
            You have a pending fee balance of <strong>&#8377;{totalDue}</strong>. Please contact the Operations team to clear it.
          </div>
        </div>
      )}

      <div className="card-grid-2">
        <div className="card">
          <h3>My courses & batches</h3>
          {!summary || summary.batches.length === 0 ? (
            <div className="empty-state">You are not yet enrolled in a batch. Contact your counselor or operations team.</div>
          ) : (
            summary.batches.map((b) => (
              <div className="entity-card" key={b.id}>
                <div className="entity-card-title">{b.course_name} &mdash; {b.batch_name}</div>
                <div className="entity-card-meta" style={{ marginBottom: 10 }}>{b.mode} &middot; {b.timing}</div>
                {(contentByBatch[b.id] || []).length === 0 ? (
                  <div className="empty-state" style={{ padding: '12px 0' }}>No material uploaded yet.</div>
                ) : (
                  (contentByBatch[b.id] || []).map((c) => {
                    const Icon = CONTENT_ICONS[c.type] || FileText;
                    return (
                      <div className="list-item-row" key={c.id}>
                        <div className="list-item-icon"><Icon /></div>
                        <div style={{ flex: 1 }}>
                          <div className="list-item-title">{c.title}</div>
                          <div className="list-item-sub">{c.body || c.type}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ))
          )}
        </div>

        <div className="card">
          <h3><CalendarCheck /> My attendance</h3>
          {attendancePct !== null && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>Overall attendance</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ink)' }}>{attendancePct}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${attendancePct}%`,
                    background: attendancePct >= 75 ? 'var(--success)' : attendancePct >= 50 ? 'var(--amber)' : 'var(--danger)',
                  }}
                />
              </div>
            </div>
          )}
          {attendance.length === 0 ? (
            <div className="empty-state">No attendance records yet.</div>
          ) : (
            <table>
              <thead><tr><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {attendance.slice(0, 8).map((a) => (
                  <tr key={a.id}><td>{a.session_date}</td><td><Badge status={a.status} /></td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
