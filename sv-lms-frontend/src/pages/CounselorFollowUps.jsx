import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Eye, Mail, Pencil, PhoneCall } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

const STATUSES = ['Positive', 'Call_Not_Received', 'Interested', 'Not_Interested', 'Follow_up', 'Demo_Workshop', 'Negotiation', 'Lost'];

export default function CounselorFollowUps() {
  const { auth } = useAuth();
  const [leads, setLeads] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [fromDate, setFromDate] = useState(new Date().toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({});
  const [activeLead, setActiveLead] = useState(null);
  const [modalForm, setModalForm] = useState({ notes: '', status: 'Follow_up', next_follow_up_at: '' });
  const [msg, setMsg] = useState(null);

  const load = () => {
    api.listLeads(auth.token).then(setLeads).catch((e) => setMsg({ type: 'error', text: e.message }));
    api.listFollowUps(auth.token).then(setFollowUps).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const historyByLead = useMemo(() => followUps.reduce((acc, item) => {
    const key = String(item.lead_id);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {}), [followUps]);

  const rows = leads.filter((lead) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [lead.name, lead.phone, lead.email, lead.status, `AT${lead.id}`].some((v) => (v || '').toLowerCase().includes(q));
    const matchesType = !typeFilter || lead.status === typeFilter;
    const date = (lead.created_at || '').slice(0, 10);
    const matchesFrom = !fromDate || !date || date >= fromDate;
    const matchesTo = !toDate || !date || date <= toDate;
    return matchesSearch && matchesType && matchesFrom && matchesTo;
  });

  const expandAll = () => setExpanded(Object.fromEntries(rows.map((lead) => [lead.id, true])));
  const collapseAll = () => setExpanded({});

  const openModal = (lead) => {
    setActiveLead(lead);
    setModalForm({ notes: '', status: lead.status || 'Follow_up', next_follow_up_at: '' });
  };

  const submitFollowUp = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.createFollowUp(auth.token, {
        lead_id: activeLead.id,
        follow_up_at: new Date().toISOString().slice(0, 16),
        type: 'call',
        outcome: modalForm.status,
        notes: modalForm.notes,
        next_follow_up_at: modalForm.next_follow_up_at || null,
      });
      await api.updateLead(auth.token, activeLead.id, { status: modalForm.status, notes: modalForm.notes });
      setActiveLead(null);
      setMsg({ type: 'success', text: 'Follow-up saved and lead status updated.' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <Layout>
      <PageHeader title="Followup Management" subtitle="Filter leads, take follow-ups, update status, and review history" />
      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      <div className="crm-filter-panel">
        <div className="field">
          <label>Rows</label>
          <select defaultValue="10"><option>10 per page</option><option>25 per page</option><option>50 per page</option></select>
        </div>
        <div className="field">
          <label>Type</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">Select Type</option>
            {STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
          </select>
        </div>
        <div className="field"><label>From</label><input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></div>
        <div className="field"><label>To</label><input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} /></div>
        <div className="field"><label>Search</label><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search followups" /></div>
        <button className="btn small" type="button" onClick={expandAll}>Expand All</button>
        <button className="btn small secondary" type="button" onClick={collapseAll}>Collapse All</button>
      </div>

      <div className="card crm-table-card">
        <table>
          <thead><tr><th>Lead ID</th><th>Status</th><th>Name</th><th>Contact/Email</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.map((lead) => {
              const isOpen = !!expanded[lead.id];
              const history = historyByLead[String(lead.id)] || [];
              return (
                <React.Fragment key={lead.id}>
                  <tr>
                    <td className="num-cell">AT{String(lead.id).padStart(5, '0')}</td>
                    <td><Badge status={lead.status} /></td>
                    <td>{lead.name}</td>
                    <td>{lead.phone || lead.email}</td>
                    <td>{(lead.created_at || '').slice(0, 10)}</td>
                    <td>
                      <div className="action-icons">
                        <button title="Expand" onClick={() => setExpanded({ ...expanded, [lead.id]: !isOpen })}>{isOpen ? <ChevronUp /> : <ChevronDown />}</button>
                        <button title="Take follow-up" onClick={() => openModal(lead)}><Pencil /></button>
                        <button title="View details" onClick={() => setExpanded({ ...expanded, [lead.id]: true })}><Eye /></button>
                        <a title="Email applicant" href={lead.email ? `mailto:${lead.email}` : undefined}><Mail /></a>
                      </div>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="expanded-row">
                      <td colSpan="6">
                        <div className="expanded-content">
                          <div><strong>Notes:</strong> {lead.notes || 'No notes yet.'}</div>
                          <div><strong>History:</strong> {history.length === 0 ? 'No follow-up history.' : history.map((h) => `${h.outcome || h.type} on ${(h.follow_up_at || '').slice(0, 10)}`).join(' | ')}</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <div className="empty-state">No follow-ups found.</div>}
      </div>

      {activeLead && (
        <div className="modal-backdrop">
          <form className="modal-card" onSubmit={submitFollowUp}>
            <button className="modal-close" type="button" onClick={() => setActiveLead(null)}>x</button>
            <h3><PhoneCall /> Take Followup</h3>
            <div className="field"><label>Lead ID</label><input value={activeLead.id} disabled /></div>
            <div className="field"><label>Remark</label><textarea rows={3} value={modalForm.notes} onChange={(e) => setModalForm({ ...modalForm, notes: e.target.value })} placeholder="Enter followup remark" /></div>
            <div className="field">
              <label>Status</label>
              <select value={modalForm.status} onChange={(e) => setModalForm({ ...modalForm, status: e.target.value })}>
                {STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
              </select>
            </div>
            <div className="field"><label>Next Followup Date</label><input type="datetime-local" value={modalForm.next_follow_up_at} onChange={(e) => setModalForm({ ...modalForm, next_follow_up_at: e.target.value })} /></div>
            <div className="modal-actions">
              <button className="btn" type="submit">Submit</button>
              <button className="btn secondary" type="button" onClick={() => setActiveLead(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
}
