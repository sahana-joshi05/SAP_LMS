import React, { useEffect, useState } from 'react';
import { Bell, Eye, UserCheck, X } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import { playLeadNotificationSound } from '../leadSound.js';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString();
};

export default function SuperAdminLeads() {
  const { auth } = useAuth();
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [msg, setMsg] = useState(null);
  const [knownLeadIds, setKnownLeadIds] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const load = ({ notify = false } = {}) => {
    api.listLeads(auth.token)
      .then((items) => {
        setLeads(items);
        setKnownLeadIds((previous) => {
          const next = new Set(items.map((lead) => lead.id));
          if (notify && previous && soundEnabled && items.some((lead) => !previous.has(lead.id))) {
            playLeadNotificationSound();
            setMsg({ type: 'success', text: 'New lead received.' });
          }
          return next;
        });
      })
      .catch((e) => setMsg({ type: 'error', text: e.message }));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const id = setInterval(() => load({ notify: true }), 12000);
    return () => clearInterval(id);
  }, [auth.token, soundEnabled]);

  return (
    <Layout>
      <PageHeader
        title="All leads"
        subtitle="View every enquiry and check which counselor is handling it"
        cta={<button className="btn-cta" type="button" onClick={() => { setSoundEnabled(true); playLeadNotificationSound(); }}><Bell size={16} /> {soundEnabled ? 'Lead sound on' : 'Enable lead sound'}</button>}
      />
      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      <div className="card">
        <h3><UserCheck /> Lead ownership</h3>
        {leads.length === 0 ? (
          <div className="empty-state">No leads found.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th>Taken by</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.name}</td>
                  <td>{lead.phone || '-'}</td>
                  <td>{lead.email || '-'}</td>
                  <td><Badge status={lead.status} /></td>
                  <td>{lead.assigned_counselor_name || 'Not assigned'}</td>
                  <td>
                    <button
                      type="button"
                      className="icon-view-btn"
                      onClick={() => setSelectedLead(lead)}
                      title="View lead"
                      aria-label={`View ${lead.name}`}
                    >
                      <Eye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedLead && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Lead details">
          <div className="modal-card lead-view-modal">
            <button className="modal-close" type="button" onClick={() => setSelectedLead(null)} aria-label="Close">
              <X size={20} />
            </button>
            <h3><UserCheck /> Lead details</h3>
            <div className="detail-grid">
              <div><span>Name</span><strong>{selectedLead.name}</strong></div>
              <div><span>Phone</span><strong>{selectedLead.phone || '-'}</strong></div>
              <div><span>Email</span><strong>{selectedLead.email || '-'}</strong></div>
              <div><span>Status</span><strong><Badge status={selectedLead.status} /></strong></div>
              <div><span>Source</span><strong>{selectedLead.source || '-'}</strong></div>
              <div><span>Course interested</span><strong>{selectedLead.course_interested_name || '-'}</strong></div>
              <div><span>Taken by</span><strong>{selectedLead.assigned_counselor_name || 'Not assigned'}</strong></div>
              <div><span>Counselor email</span><strong>{selectedLead.assigned_counselor_email || '-'}</strong></div>
              <div><span>Created at</span><strong>{formatDate(selectedLead.created_at)}</strong></div>
              <div className="detail-full"><span>Notes</span><strong>{selectedLead.notes || '-'}</strong></div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
