import React, { useEffect, useState } from 'react';
import { UserPlus, CheckCircle2, KeyRound } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import Badge from '../components/Badge.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

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

export default function CounselorLeads() {
  const { auth } = useAuth();
  const [leads, setLeads] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', source: 'manual', course_interested: '', notes: '' });
  const [receiptForm, setReceiptForm] = useState({
    total_amount: '',
    amount_paid: '',
    payment_mode: 'Online',
    transaction_id: '',
    bank_name: '',
    applicant_address: '',
    applicant_city: '',
  });
  const [msg, setMsg] = useState(null);
  const [convertResult, setConvertResult] = useState(null);

  const load = () => api.listLeads(auth.token).then(setLeads).catch((e) => setMsg({ type: 'error', text: e.message }));

  useEffect(() => {
    load();
    api.listCourses(auth.token).then(setCourses).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.createLead(auth.token, { ...form, course_interested: form.course_interested || null });
      setMsg({ type: 'success', text: `Lead "${form.name}" added.` });
      setForm({ name: '', phone: '', email: '', source: 'manual', course_interested: '', notes: '' });
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

  const convert = async (id) => {
    setMsg(null);
    setConvertResult(null);
    try {
      const result = await api.convertLead(auth.token, id, {
        total_amount: receiptForm.total_amount ? Number(receiptForm.total_amount) : null,
        amount_paid: receiptForm.amount_paid ? Number(receiptForm.amount_paid) : 0,
        payment_mode: receiptForm.payment_mode,
        transaction_id: receiptForm.transaction_id,
        bank_name: receiptForm.bank_name,
        applicant_address: receiptForm.applicant_address,
        applicant_city: receiptForm.applicant_city,
      });
      setConvertResult(result);
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const openReceipt = async (receiptId) => {
    const res = await fetch(`/api/receipts/${receiptId}/print`, { headers: { Authorization: `Bearer ${auth.token}` } });
    const html = await res.text();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  return (
    <Layout>
      <PageHeader title="Leads" subtitle="Add enquiries, track follow-ups, and convert leads into enrolled students" />
      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}
      {convertResult && (
        <div className="msg success">
          <KeyRound size={16} />
          Converted! Student login: <strong>{convertResult.login_email}</strong> &middot; Temp password: <strong>{convertResult.temp_password}</strong>
          {convertResult.receipt_id && (
            <button className="btn small secondary" type="button" onClick={() => openReceipt(convertResult.receipt_id)}>
              Open receipt {convertResult.receipt_number}
            </button>
          )}
        </div>
      )}

      <div className="card">
        <h3><UserPlus /> Add a new lead</h3>
        <form className="inline-form" onSubmit={handleSubmit}>
          <div className="field"><label>Name</label><input name="name" value={form.name} onChange={handleChange} required /></div>
          <div className="field"><label>Phone</label><input name="phone" value={form.phone} onChange={handleChange} /></div>
          <div className="field"><label>Email</label><input name="email" type="email" value={form.email} onChange={handleChange} placeholder="required to convert later" /></div>
          <div className="field">
            <label>Source</label>
            <select name="source" value={form.source} onChange={handleChange}>
              <option value="manual">Manual</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="walk-in">Walk-in</option>
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
          <button className="btn" type="submit">Add lead</button>
        </form>
      </div>

      <div className="card">
        <h3>Admission receipt details</h3>
        <form className="inline-form">
          <div className="field"><label>Course Fees</label><input type="number" value={receiptForm.total_amount} onChange={(e) => setReceiptForm({ ...receiptForm, total_amount: e.target.value })} placeholder="defaults to course fee" /></div>
          <div className="field"><label>Paid Fees</label><input type="number" value={receiptForm.amount_paid} onChange={(e) => setReceiptForm({ ...receiptForm, amount_paid: e.target.value })} /></div>
          <div className="field">
            <label>Payment Mode</label>
            <select value={receiptForm.payment_mode} onChange={(e) => setReceiptForm({ ...receiptForm, payment_mode: e.target.value })}>
              <option value="Online">Online</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
          <div className="field"><label>Transaction ID</label><input value={receiptForm.transaction_id} onChange={(e) => setReceiptForm({ ...receiptForm, transaction_id: e.target.value })} /></div>
          <div className="field"><label>Bank Name</label><input value={receiptForm.bank_name} onChange={(e) => setReceiptForm({ ...receiptForm, bank_name: e.target.value })} /></div>
          <div className="field"><label>Address</label><textarea rows={1} value={receiptForm.applicant_address} onChange={(e) => setReceiptForm({ ...receiptForm, applicant_address: e.target.value })} /></div>
          <div className="field"><label>City</label><input value={receiptForm.applicant_city} onChange={(e) => setReceiptForm({ ...receiptForm, applicant_city: e.target.value })} /></div>
        </form>
      </div>

      <div className="card">
        <h3>My leads</h3>
        {leads.length === 0 ? (
          <div className="empty-state">No leads yet — add your first enquiry above.</div>
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Status</th><th>Update status</th><th>Convert</th></tr></thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td>{l.name}</td>
                  <td>{l.phone}</td>
                  <td>{l.email}</td>
                  <td><Badge status={l.status} /></td>
                  <td>
                    <select value={l.status} onChange={(e) => updateStatus(l.id, e.target.value)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    {l.status !== 'Enrolled' && (
                      <button className="btn small secondary" onClick={() => convert(l.id)} disabled={!l.email}>
                        <CheckCircle2 size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
                        Convert to Student
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
