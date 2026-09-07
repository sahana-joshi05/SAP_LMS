import React, { useEffect, useState } from 'react';
import { Bell, UserPlus, CheckCircle2, KeyRound } from 'lucide-react';
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
    personal_details: '',
    date_of_birth: '',
    gender: '',
    state: '',
    country: 'India',
    educational_details: '',
    degree: '',
    passed_year: '',
    marks: '',
    university: '',
    fee_details: '',
    fee_due_date: '',
    document_details: '',
  });
  const [msg, setMsg] = useState(null);
  const [convertResult, setConvertResult] = useState(null);
  const [knownLeadIds, setKnownLeadIds] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

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
        personal_details: receiptForm.personal_details,
        date_of_birth: receiptForm.date_of_birth,
        gender: receiptForm.gender,
        state: receiptForm.state,
        country: receiptForm.country,
        educational_details: receiptForm.educational_details,
        degree: receiptForm.degree,
        passed_year: receiptForm.passed_year,
        marks: receiptForm.marks,
        university: receiptForm.university,
        fee_details: receiptForm.fee_details,
        remaining_payment_amount: Math.max(
          (Number(receiptForm.total_amount) || 0) - (Number(receiptForm.amount_paid) || 0),
          0,
        ),
        fee_due_date: receiptForm.fee_due_date,
        document_details: receiptForm.document_details,
      });
      setConvertResult(result);
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const pickLead = async (id) => {
    setMsg(null);
    try {
      await api.assignLeadToMe(auth.token, id);
      setMsg({ type: 'success', text: 'Lead picked and assigned to you.' });
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
      <PageHeader
        title="Leads"
        subtitle="Add enquiries, track follow-ups, pick website leads, and convert leads into enrolled students"
        cta={<button className="btn-cta" type="button" onClick={() => { setSoundEnabled(true); playLeadNotificationSound(); }}><Bell size={16} /> {soundEnabled ? 'Lead sound on' : 'Enable lead sound'}</button>}
      />
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
        <h3>Admission details</h3>
        <form className="inline-form admission-form">
          <div className="form-section-title">Personal details</div>
          <div className="field"><label>Address</label><textarea rows={2} value={receiptForm.applicant_address} onChange={(e) => setReceiptForm({ ...receiptForm, applicant_address: e.target.value })} /></div>
          <div className="field"><label>City</label><input value={receiptForm.applicant_city} onChange={(e) => setReceiptForm({ ...receiptForm, applicant_city: e.target.value })} /></div>
          <div className="field"><label>State</label><input value={receiptForm.state} onChange={(e) => setReceiptForm({ ...receiptForm, state: e.target.value })} /></div>
          <div className="field"><label>Country</label><input value={receiptForm.country} onChange={(e) => setReceiptForm({ ...receiptForm, country: e.target.value })} /></div>
          <div className="field"><label>Date of birth</label><input type="date" value={receiptForm.date_of_birth} onChange={(e) => setReceiptForm({ ...receiptForm, date_of_birth: e.target.value })} /></div>
          <div className="field">
            <label>Gender</label>
            <select value={receiptForm.gender} onChange={(e) => setReceiptForm({ ...receiptForm, gender: e.target.value })}>
              <option value="">-- select --</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="field wide-field"><label>Personal notes</label><textarea rows={2} value={receiptForm.personal_details} onChange={(e) => setReceiptForm({ ...receiptForm, personal_details: e.target.value })} placeholder="Guardian name, alternate contact, address proof details" /></div>

          <div className="form-section-title">Educational details</div>
          <div className="field"><label>Degree</label><input value={receiptForm.degree} onChange={(e) => setReceiptForm({ ...receiptForm, degree: e.target.value })} placeholder="B.Com" /></div>
          <div className="field"><label>Passed year</label><input value={receiptForm.passed_year} onChange={(e) => setReceiptForm({ ...receiptForm, passed_year: e.target.value })} placeholder="2024" /></div>
          <div className="field"><label>Marks</label><input value={receiptForm.marks} onChange={(e) => setReceiptForm({ ...receiptForm, marks: e.target.value })} placeholder="80%" /></div>
          <div className="field"><label>University</label><input value={receiptForm.university} onChange={(e) => setReceiptForm({ ...receiptForm, university: e.target.value })} /></div>
          <div className="field wide-field"><label>Education notes</label><textarea rows={2} value={receiptForm.educational_details} onChange={(e) => setReceiptForm({ ...receiptForm, educational_details: e.target.value })} placeholder="College, specialization, certification, gap details" /></div>

          <div className="form-section-title">Fee details</div>
          <div className="field"><label>Course Fees</label><input type="number" value={receiptForm.total_amount} onChange={(e) => setReceiptForm({ ...receiptForm, total_amount: e.target.value })} placeholder="defaults to course fee" /></div>
          <div className="field"><label>Paid Fees</label><input type="number" value={receiptForm.amount_paid} onChange={(e) => setReceiptForm({ ...receiptForm, amount_paid: e.target.value })} /></div>
          <div className="field"><label>Remaining amount</label><input type="number" value={Math.max((Number(receiptForm.total_amount) || 0) - (Number(receiptForm.amount_paid) || 0), 0)} readOnly /></div>
          <div className="field"><label>Due date</label><input type="date" value={receiptForm.fee_due_date} onChange={(e) => setReceiptForm({ ...receiptForm, fee_due_date: e.target.value })} /></div>
          <div className="field wide-field"><label>Fee notes</label><textarea rows={2} value={receiptForm.fee_details} onChange={(e) => setReceiptForm({ ...receiptForm, fee_details: e.target.value })} placeholder="Installment plan, discounts, due date, scholarship notes" /></div>

          <div className="form-section-title">Transaction details</div>
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

          <div className="form-section-title">Document details</div>
          <div className="field wide-field"><label>Documents</label><textarea rows={2} value={receiptForm.document_details} onChange={(e) => setReceiptForm({ ...receiptForm, document_details: e.target.value })} placeholder="Aadhaar, marks cards, degree certificate, photo, pending documents" /></div>
        </form>
      </div>

      <div className="card">
        <h3>My leads</h3>
        {leads.length === 0 ? (
          <div className="empty-state">No leads yet — add your first enquiry above.</div>
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Status</th><th>Taken by</th><th>Update status</th><th>Convert</th></tr></thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td>{l.name}</td>
                  <td>{l.phone}</td>
                  <td>{l.email}</td>
                  <td><Badge status={l.status} /></td>
                  <td>{l.assigned_counselor_name || <button className="btn small secondary" type="button" onClick={() => pickLead(l.id)}>Pick lead</button>}</td>
                  <td>
                    <select value={l.status} onChange={(e) => updateStatus(l.id, e.target.value)} disabled={!l.assigned_counselor_id}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    {l.status !== 'Enrolled' && l.assigned_counselor_id && (
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
