import React, { useEffect, useMemo, useState } from 'react';
import { Bell, ChevronDown, ChevronUp, Download, Eye, Mail, Pencil, PlusCircle, Trash2, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import Badge from '../components/Badge.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import { playLeadNotificationSound } from '../leadSound.js';

const STATUSES = [
  'New',
  'Contacted',
  'Interested',
  'Positive',
  'Call_Not_Received',
  'Follow_up',
  'Demo_Workshop',
  'Negotiation',
  'Enrolled',
  'Converted',
  'Not_Interested',
  'Lost',
];

const SOURCES = ['manual', 'website', 'referral', 'walk-in', 'webchat', 'whatsapp', 'WEB'];

export default function CounselorLeads() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const [leads, setLeads] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', source: 'manual', course_interested: '', notes: '' });
  const [rowsPerPage, setRowsPerPage] = useState('10');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(today);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState(null);
  const [knownLeadIds, setKnownLeadIds] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [expanded, setExpanded] = useState({});

  const load = ({ notify = false } = {}) => api.listLeads(auth.token).then((items) => {
    setLeads(items);
    setKnownLeadIds((previous) => {
      const next = new Set(items.map((lead) => lead.id));
      if (notify && previous && soundEnabled && items.some((lead) => !previous.has(lead.id))) {
        playLeadNotificationSound();
        setMsg({ type: 'success', text: 'New lead received. Pick it before someone else does.' });
      }
      return next;
    });
  }).catch((e) => setMsg({ type: 'error', text: e.message }));

  useEffect(() => {
    load();
    api.listCourses(auth.token).then(setCourses).catch(() => {});
  }, []);

  useEffect(() => {
    const id = setInterval(() => load({ notify: true }), 12000);
    return () => clearInterval(id);
  }, [auth.token, soundEnabled]);

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const createdDate = (lead.created_at || '').slice(0, 10);
      const matchesSearch = !q || [
        `AT${lead.id}`,
        lead.name,
        lead.phone,
        lead.email,
        lead.status,
        lead.source,
        lead.course_interested_name,
        lead.notes,
      ].some((value) => (value || '').toLowerCase().includes(q));
      const matchesStatus = statusFilter ? lead.status === statusFilter : lead.status !== 'Lost';
      const matchesCourse = !courseFilter || String(lead.course_interested_id || '') === String(courseFilter);
      const matchesSource = !sourceFilter || (lead.source || '').toLowerCase() === sourceFilter.toLowerCase();
      const matchesFrom = !fromDate || !createdDate || createdDate >= fromDate;
      const matchesTo = !toDate || !createdDate || createdDate <= toDate;
      return matchesSearch && matchesStatus && matchesCourse && matchesSource && matchesFrom && matchesTo;
    }).slice(0, Number(rowsPerPage));
  }, [leads, search, statusFilter, courseFilter, sourceFilter, fromDate, toDate, rowsPerPage]);

  const expandAll = () => setExpanded(Object.fromEntries(filteredLeads.map((lead) => [lead.id, true])));
  const collapseAll = () => setExpanded({});

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.createLead(auth.token, { ...form, course_interested: form.course_interested || null });
      setMsg({ type: 'success', text: `Lead "${form.name}" added.` });
      setForm({ name: '', phone: '', email: '', source: 'manual', course_interested: '', notes: '' });
      setShowAddForm(false);
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.updateLead(auth.token, id, { status });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const pickLead = async (id) => {
    setMsg(null);
    try {
      await api.assignLeadToMe(auth.token, id);
      setMsg({ type: 'success', text: 'Lead transferred to your follow-up list.' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const removeLead = async (id) => {
    await updateStatus(id, 'Lost');
    setMsg({ type: 'success', text: 'Lead removed from the active list.' });
  };

  const exportCsv = () => {
    const headers = ['Lead ID', 'Date', 'Course', 'Student Information', 'Email', 'Source', 'Status', 'Notes'];
    const rows = filteredLeads.map((lead) => [
      `AT${String(lead.id).padStart(5, '0')}`,
      (lead.created_at || '').slice(0, 10),
      lead.course_interested_name || '',
      lead.name || '',
      lead.email || '',
      lead.source || '',
      lead.status || '',
      lead.notes || '',
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sv-lms-leads.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <PageHeader
        title="Leads Management"
        subtitle="Add enquiries, filter leads, transfer follow-ups, and start admissions"
        cta={<button className="btn-cta" type="button" onClick={() => { setSoundEnabled(true); playLeadNotificationSound(); }}><Bell size={16} /> {soundEnabled ? 'Lead sound on' : 'Enable lead sound'}</button>}
      />
      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      <div className="crm-filter-panel">
        <div className="field">
          <label>Rows</label>
          <select value={rowsPerPage} onChange={(e) => setRowsPerPage(e.target.value)}>
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
        <div className="field">
          <label>Select mode</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Select course</label>
          <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
            <option value="">All courses</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Select source</label>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
            <option value="">All sources</option>
            {SOURCES.map((source) => <option key={source} value={source}>{source}</option>)}
          </select>
        </div>
        <div className="field"><label>From</label><input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></div>
        <div className="field"><label>To</label><input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} /></div>
        <div className="field"><label>Search</label><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leads..." /></div>
        <button className="btn small secondary" type="button" onClick={exportCsv}><Download size={14} /> Export</button>
        <button className="btn small" type="button" onClick={() => setShowAddForm(true)}><PlusCircle size={14} /> Add Lead</button>
        <button className="btn small secondary" type="button" onClick={expandAll}>Expand All</button>
        <button className="btn small secondary" type="button" onClick={collapseAll}>Collapse All</button>
      </div>

      {showAddForm && (
        <div className="card">
          <h3><UserPlus /> Add a new lead</h3>
          <form className="inline-form" onSubmit={handleSubmit}>
            <div className="field"><label>Name</label><input name="name" value={form.name} onChange={handleChange} required /></div>
            <div className="field"><label>Phone</label><input name="phone" value={form.phone} onChange={handleChange} /></div>
            <div className="field"><label>Email</label><input name="email" type="email" value={form.email} onChange={handleChange} placeholder="required for admission" /></div>
            <div className="field">
              <label>Source</label>
              <select name="source" value={form.source} onChange={handleChange}>
                {SOURCES.map((source) => <option key={source} value={source}>{source}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Course interested</label>
              <select name="course_interested" value={form.course_interested} onChange={handleChange}>
                <option value="">-- select --</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="field"><label>Notes</label><textarea name="notes" value={form.notes} onChange={handleChange} rows={1} /></div>
            <div className="form-actions">
              <button className="btn secondary" type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button className="btn" type="submit">Add lead</button>
            </div>
          </form>
        </div>
      )}

      <div className="card crm-table-card">
        <table>
          <thead><tr><th>Desk no</th><th>Date/Time</th><th>Course</th><th>Student Information</th><th>Email</th><th>Source</th><th>Actions</th></tr></thead>
          <tbody>
            {filteredLeads.map((lead) => {
              const isOpen = !!expanded[lead.id];
              return (
                <React.Fragment key={lead.id}>
                  <tr>
                    <td>{lead.assigned_counselor_name || 'Unassigned'}</td>
                    <td>{(lead.created_at || '').slice(0, 10)}</td>
                    <td>{lead.course_interested_name || '-'}</td>
                    <td>
                      <div className="list-item-title">{lead.name}</div>
                      <div className="list-item-sub">AT{String(lead.id).padStart(5, '0')} {lead.phone ? `- ${lead.phone}` : ''}</div>
                    </td>
                    <td>{lead.email || '-'}</td>
                    <td>{lead.source || '-'}</td>
                    <td>
                      <div className="lead-action-row">
                        <div className="action-icons">
                          <button title={isOpen ? 'Collapse' : 'Expand'} type="button" onClick={() => setExpanded({ ...expanded, [lead.id]: !isOpen })}>{isOpen ? <ChevronUp /> : <ChevronDown />}</button>
                          <button title="Update status" type="button" onClick={() => setExpanded({ ...expanded, [lead.id]: true })}><Pencil /></button>
                          <button title="View details" type="button" onClick={() => setExpanded({ ...expanded, [lead.id]: true })}><Eye /></button>
                          <a title="Email applicant" href={lead.email ? `mailto:${lead.email}` : undefined}><Mail /></a>
                        </div>
                        <button className="btn small secondary" type="button" onClick={() => pickLead(lead.id)}>Transfer</button>
                        <button className="btn small danger" type="button" onClick={() => removeLead(lead.id)}><Trash2 size={13} /> Remove</button>
                      </div>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="expanded-row">
                      <td colSpan="7">
                        <div className="expanded-content">
                          <div><strong>Status:</strong> <Badge status={lead.status} /></div>
                          <div><strong>Phone:</strong> {lead.phone || '-'} &nbsp; <strong>Email:</strong> {lead.email || '-'}</div>
                          <div><strong>Notes:</strong> {lead.notes || 'No notes yet.'}</div>
                          <div className="expanded-actions">
                            <select value={lead.status} onChange={(e) => updateStatus(lead.id, e.target.value)} disabled={!lead.assigned_counselor_id}>
                              {STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
                            </select>
                            <button className="btn small secondary" type="button" onClick={() => updateStatus(lead.id, 'New')}>Fresh Entry</button>
                            <a className="btn small secondary" href={lead.email ? `mailto:${lead.email}?subject=SV LMS Course Brochure` : undefined}>Brochure</a>
                            <button className="btn small" type="button" onClick={() => navigate(`/counselor/admission?leadId=${lead.id}`)} disabled={!lead.email}>Admission</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        {filteredLeads.length === 0 && <div className="empty-state">No leads found.</div>}
      </div>
    </Layout>
  );
}
