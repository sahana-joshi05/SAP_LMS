import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Layers, UserPlus, BookOpen, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Layout from '../components/Layout.jsx';
import StatCard from '../components/StatCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export default function SuperAdminDashboard() {
  const { auth } = useAuth();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getOverview(auth.token).then(setStats).catch((e) => setError(e.message));
    api.listCourses(auth.token).then(setCourses).catch(() => {});
  }, []);

  const chartData = stats
    ? [
        { name: 'Students', value: stats.totalStudents },
        { name: 'Batches', value: stats.totalBatches },
        { name: 'Leads', value: stats.totalLeads },
        { name: 'Courses', value: stats.totalCourses },
      ]
    : [];

  return (
    <Layout>
      <PageHeader title="Institute Overview" subtitle="Complete access — all users, courses, batches, and students" />
      {error && <div className="msg error">{error}</div>}

      {stats && (
        <div className="stat-grid">
          <StatCard icon={UserPlus} num={stats.totalStudents} label="Total Students" />
          <StatCard icon={Layers} num={stats.totalBatches} label="Total Batches" />
          <StatCard icon={Users} num={stats.totalLeads} label="Total Leads" />
          <StatCard icon={BookOpen} num={stats.totalCourses} label="Total Courses" />
        </div>
      )}

      <div className="card-grid-2">
        <div className="card">
          <h3>Institute snapshot</h3>
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EE" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E4E7EE', fontSize: 13 }} />
                <Bar dataKey="value" fill="var(--role-superadmin)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3>Quick actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link to="/superadmin/users" className="list-item-row" style={{ textDecoration: 'none' }}>
              <div className="list-item-icon"><Users /></div>
              <div style={{ flex: 1 }}>
                <div className="list-item-title">Manage staff accounts</div>
                <div className="list-item-sub">Add Counselors, Operations, Trainers</div>
              </div>
              <ArrowRight size={16} color="var(--muted)" />
            </Link>
            <Link to="/superadmin/courses" className="list-item-row" style={{ textDecoration: 'none' }}>
              <div className="list-item-icon"><BookOpen /></div>
              <div style={{ flex: 1 }}>
                <div className="list-item-title">Add a new course</div>
                <div className="list-item-sub">SAP FICO, MM, SD, ABAP, and more</div>
              </div>
              <ArrowRight size={16} color="var(--muted)" />
            </Link>
            <Link to="/superadmin/batches" className="list-item-row" style={{ textDecoration: 'none' }}>
              <div className="list-item-icon"><Layers /></div>
              <div style={{ flex: 1 }}>
                <div className="list-item-title">Review batches & students</div>
                <div className="list-item-sub">Institute-wide oversight</div>
              </div>
              <ArrowRight size={16} color="var(--muted)" />
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Course catalog</h3>
        {courses.length === 0 ? (
          <div className="empty-state">No courses added yet. Head to Courses to add your first one.</div>
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Code</th><th>Duration</th><th>Fee</th></tr></thead>
            <tbody>
              {courses.slice(0, 5).map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td><td>{c.code}</td><td>{c.duration}</td>
                  <td className="num-cell">&#8377;{c.fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
