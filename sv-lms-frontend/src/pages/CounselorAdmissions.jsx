import React, { useEffect, useState } from 'react';
import { CheckCircle2, Link as LinkIcon } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export default function CounselorAdmissions({ linked = false }) {
  const { auth } = useAuth();
  const [leads, setLeads] = useState([]);

  useEffect(() => { api.listLeads(auth.token).then(setLeads).catch(() => {}); }, []);

  const admissionRows = leads.filter((lead) => linked
    ? ['Converted', 'Enrolled'].includes(lead.status)
    : ['Positive', 'Interested', 'Negotiation', 'Demo_Workshop'].includes(lead.status));

  return (
    <Layout>
      <PageHeader
        title={linked ? 'Link - Admission' : 'Admission'}
        subtitle={linked ? 'Converted applicants linked to admission records' : 'Applicants ready for admission confirmation'}
      />
      <div className="card">
        <h3>{linked ? <LinkIcon /> : <CheckCircle2 />} {linked ? 'Linked admissions' : 'Admission pipeline'}</h3>
        {admissionRows.length === 0 ? (
          <div className="empty-state">No matching applicants yet.</div>
        ) : (
          <table>
            <thead><tr><th>Lead ID</th><th>Name</th><th>Contact</th><th>Status</th><th>Course / Notes</th></tr></thead>
            <tbody>
              {admissionRows.map((lead) => (
                <tr key={lead.id}>
                  <td className="num-cell">AT{String(lead.id).padStart(5, '0')}</td>
                  <td>{lead.name}</td>
                  <td>{lead.phone || lead.email}</td>
                  <td><Badge status={lead.status} /></td>
                  <td>{lead.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
