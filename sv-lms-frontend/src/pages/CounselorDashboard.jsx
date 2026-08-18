import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, Heart, GraduationCap, Plus, PhoneCall } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import StatCard from '../components/StatCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

const FUNNEL_STAGES = [
  { key: 'New', color: 'var(--role-superadmin)' },
  { key: 'Contacted', color: 'var(--amber)' },
  { key: 'Interested', color: 'var(--blue)' },
  { key: 'Enrolled', color: 'var(--success)' },
  { key: 'Lost', color: 'var(--danger)' },
];

export default function CounselorDashboard() {
  const { auth } = useAuth();
  const [leads, setLeads] = useState([]);

  useEffect(() => { api.listLeads(auth.token).then(setLeads).catch(() => {}); }, []);

  const counts = leads.reduce((acc, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {});
  const maxCount = Math.max(1, ...FUNNEL_STAGES.map((s) => counts[s.key] || 0));

  // Feature: leads that still need a follow-up call (New or Contacted), most recent first
  const needsFollowUp = leads
    .filter((l) => l.status === 'New' || l.status === 'Contacted')
    .slice(0, 5);

  return (
    <Layout>
      <PageHeader
        title="My Leads Overview"
        subtitle={`Welcome back, ${auth.user.name}`}
        cta={<Link to="/counselor/leads" className="btn-cta"><Plus size={16} /> Add lead</Link>}
      />

      <div className="stat-grid">
        <StatCard icon={Users} num={leads.length} label="Total Leads" />
        <StatCard icon={UserCheck} num={counts.New || 0} label="New" />
        <StatCard icon={Heart} num={counts.Interested || 0} label="Interested" />
        <StatCard icon={GraduationCap} num={counts.Enrolled || 0} label="Enrolled" />
      </div>

      <div className="card-grid-2">
        <div className="card">
          <h3>Pipeline funnel</h3>
          {FUNNEL_STAGES.map((stage) => {
            const count = counts[stage.key] || 0;
            const pct = Math.max(6, Math.round((count / maxCount) * 100));
            return (
              <div className="funnel-row" key={stage.key}>
                <div className="funnel-label">{stage.key}</div>
                <div className="funnel-bar-track">
                  <div className="funnel-bar-fill" style={{ width: `${pct}%`, background: stage.color }}>
                    <span>{count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <h3><PhoneCall /> Needs follow-up</h3>
          {needsFollowUp.length === 0 ? (
            <div className="empty-state">You're all caught up — no leads waiting on a follow-up call.</div>
          ) : (
            needsFollowUp.map((l) => (
              <div className="list-item-row" key={l.id}>
                <div className="list-item-icon"><Users /></div>
                <div style={{ flex: 1 }}>
                  <div className="list-item-title">{l.name}</div>
                  <div className="list-item-sub">{l.phone || l.email || 'No contact info'}</div>
                </div>
                <Badge status={l.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
