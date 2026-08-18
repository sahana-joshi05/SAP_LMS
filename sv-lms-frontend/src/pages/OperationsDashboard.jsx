import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Layers, Plus, Wallet, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import StatCard from '../components/StatCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export default function OperationsDashboard() {
  const { auth } = useAuth();
  const [stats, setStats] = useState(null);
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    api.getOverview(auth.token).then(setStats).catch(() => {});
    api.listBatches(auth.token).then(setBatches).catch(() => {});
  }, []);

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
