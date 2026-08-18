import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Layers, UserPlus, BookOpen, ArrowRight, ShieldAlert } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import StatCard from '../components/StatCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export default function AdminDashboard() {
  const { auth } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getOverview(auth.token).then(setStats).catch((e) => setError(e.message));
  }, []);

  return (
    <Layout>
      <PageHeader title="Admin Overview" subtitle="Limited administrative access — staff, courses, and oversight" />
      {error && <div className="msg error">{error}</div>}

      <div className="alert-banner warn" style={{ background: 'var(--role-admin-bg)', borderColor: '#B7DEF5', color: '#0369A1' }}>
        <ShieldAlert />
        <div className="alert-banner-text">
          You have limited administrative access. You can manage staff accounts and courses,
          and view batches, students, and fee reports — but can't create Super Admin/Admin
          accounts, configure system settings, or edit financial records directly.
        </div>
      </div>

      {stats && (
        <div className="stat-grid">
          <StatCard icon={UserPlus} num={stats.totalStudents} label="Total Students" />
          <StatCard icon={Layers} num={stats.totalBatches} label="Total Batches" />
          <StatCard icon={Users} num={stats.totalLeads} label="Total Leads" />
          <StatCard icon={BookOpen} num={stats.totalCourses} label="Total Courses" />
        </div>
      )}

      <div className="card">
        <h3>Quick actions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link to="/admin/users" className="list-item-row" style={{ textDecoration: 'none' }}>
            <div className="list-item-icon"><Users /></div>
            <div style={{ flex: 1 }}>
              <div className="list-item-title">Manage staff accounts</div>
              <div className="list-item-sub">Add Counselors, Operations, Trainers</div>
            </div>
            <ArrowRight size={16} color="var(--muted)" />
          </Link>
          <Link to="/admin/courses" className="list-item-row" style={{ textDecoration: 'none' }}>
            <div className="list-item-icon"><BookOpen /></div>
            <div style={{ flex: 1 }}>
              <div className="list-item-title">Add or edit a course</div>
              <div className="list-item-sub">SAP FICO, MM, SD, ABAP, and more</div>
            </div>
            <ArrowRight size={16} color="var(--muted)" />
          </Link>
          <Link to="/admin/batches" className="list-item-row" style={{ textDecoration: 'none' }}>
            <div className="list-item-icon"><Layers /></div>
            <div style={{ flex: 1 }}>
              <div className="list-item-title">Review batches & students</div>
              <div className="list-item-sub">View-only oversight</div>
            </div>
            <ArrowRight size={16} color="var(--muted)" />
          </Link>
        </div>
      </div>
    </Layout>
  );
}
