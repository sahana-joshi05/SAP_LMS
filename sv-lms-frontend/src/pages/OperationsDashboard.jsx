import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Layers, Plus, Wallet, ArrowRight, Bell, CalendarClock, BriefcaseBusiness, ClipboardList } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import StatCard from '../components/StatCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

const UPDATE_MODULES = [
  { to: '/operations/exams', title: 'Exam announcements', description: 'Schedule, syllabus, duration, and instructions', icon: CalendarClock },
  { to: '/operations/batch-updates', title: 'Batch updates', description: 'Timing, venue, trainer, or material changes', icon: Layers },
  { to: '/operations/placements', title: 'Placement updates', description: 'Company, role, eligibility, deadline, and drive details', icon: BriefcaseBusiness },
  { to: '/operations/trainer-updates', title: 'Trainer updates', description: 'Priority instructions and action deadlines', icon: ClipboardList },
];

export default function OperationsDashboard() {
  const { auth } = useAuth();
  const [stats, setStats] = useState(null);
  const [batches, setBatches] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const load = () => {
    api.getOverview(auth.token).then(setStats).catch(() => {});
    api.listBatches(auth.token).then(setBatches).catch(() => {});
    api.listNotifications(auth.token).then(setNotifications).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  // Feature: at-a-glance breakdown of batches by lifecycle status
  const statusCounts = batches.reduce((acc, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc; }, {});

  return (
    <Layout>
      <PageHeader
        title="Operations Overview"
        subtitle="Batch, enrollment, attendance, and fee operations"
        cta={<Link to="/operations/batches" className="btn-cta"><Plus size={16} /> New batch</Link>}
      />
      {stats && (
        <div className="stat-grid">
          <StatCard icon={Users} num={stats.totalStudents} label="Total Students" />
          <StatCard icon={Layers} num={stats.totalBatches} label="Total Batches" />
          <StatCard icon={Layers} num={statusCounts.ongoing || 0} label="Ongoing Batches" />
          <StatCard icon={Layers} num={statusCounts.upcoming || 0} label="Upcoming Batches" />
        </div>
      )}

      <div className="card-grid-2">
        <div className="card">
          <h3><Bell /> Operations updates</h3>
          <div className="module-link-grid">
            {UPDATE_MODULES.map((item) => {
              const Icon = item.icon;
              return (
                <Link to={item.to} className="module-link" key={item.to}>
                  <div className="list-item-icon"><Icon /></div>
                  <div style={{ flex: 1 }}>
                    <div className="list-item-title">{item.title}</div>
                    <div className="list-item-sub">{item.description}</div>
                  </div>
                  <ArrowRight size={16} color="var(--muted)" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3>Recent updates</h3>
          {notifications.length === 0 ? (
            <div className="empty-state">No announcements sent yet.</div>
          ) : (
            notifications.slice(0, 5).map((item) => (
              <div className="list-item-row" key={item.id}>
                <div style={{ flex: 1 }}>
                  <div className="list-item-title">{item.subject || 'Update'}</div>
                  <div className="list-item-sub update-message">{item.message}</div>
                </div>
                <Badge status={item.template_key || item.status} />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card-grid-2">
        <div className="card">
          <h3>Recent batches</h3>
          {batches.length === 0 ? (
            <div className="empty-state">No batches yet — create one to get started.</div>
          ) : (
            <table>
              <thead><tr><th>Batch</th><th>Course</th><th>Status</th></tr></thead>
              <tbody>
                {batches.slice(0, 6).map((b) => (
                  <tr key={b.id}>
                    <td>{b.batch_name}</td>
                    <td>{b.course_name}</td>
                    <td><Badge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3>Quick actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link to="/operations/batches" className="list-item-row" style={{ textDecoration: 'none' }}>
              <div className="list-item-icon"><Layers /></div>
              <div style={{ flex: 1 }}>
                <div className="list-item-title">Create a batch</div>
                <div className="list-item-sub">Assign a trainer and schedule</div>
              </div>
              <ArrowRight size={16} color="var(--muted)" />
            </Link>
            <Link to="/operations/students" className="list-item-row" style={{ textDecoration: 'none' }}>
              <div className="list-item-icon"><Wallet /></div>
              <div style={{ flex: 1 }}>
                <div className="list-item-title">Enroll & collect fees</div>
                <div className="list-item-sub">Assign students, record payments</div>
              </div>
              <ArrowRight size={16} color="var(--muted)" />
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
