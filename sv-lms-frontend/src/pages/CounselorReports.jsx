import React, { useEffect, useState } from 'react';
import { BarChart3, Download } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export default function CounselorReports() {
  const { auth } = useAuth();
  const [leads, setLeads] = useState([]);
  const [followUps, setFollowUps] = useState([]);

  useEffect(() => {
    api.listLeads(auth.token).then(setLeads).catch(() => {});
    api.listFollowUps(auth.token).then(setFollowUps).catch(() => {});
  }, []);

  const counts = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});

  const downloadCsv = () => {
    const rows = ['status,count', ...Object.entries(counts).map(([status, count]) => `${status},${count}`)];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'counselor-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <PageHeader title="Counselor Reports" subtitle="Lead status, follow-up activity, and conversion tracking" cta={<button className="btn-cta" type="button" onClick={downloadCsv}><Download size={16} /> Export</button>} />
      <div className="stat-grid">
        <StatCard icon={BarChart3} num={leads.length} label="Assigned Leads" />
        <StatCard icon={BarChart3} num={followUps.length} label="Follow-ups" />
        <StatCard icon={BarChart3} num={counts.Positive || 0} label="Positive" />
        <StatCard icon={BarChart3} num={(counts.Enrolled || 0) + (counts.Converted || 0)} label="Admissions" />
      </div>
      <div className="card">
        <h3>Status report</h3>
        <table>
          <thead><tr><th>Status</th><th>Count</th></tr></thead>
          <tbody>{Object.entries(counts).map(([status, count]) => <tr key={status}><td><Badge status={status} /></td><td className="num-cell">{count}</td></tr>)}</tbody>
        </table>
      </div>
    </Layout>
  );
}
