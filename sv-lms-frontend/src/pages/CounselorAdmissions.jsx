import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Link as LinkIcon, PlusCircle, KeyRound } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

const EMPTY_ADMISSION = {
  lead_id: '',
  course_interested: '',
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
};

export default function CounselorAdmissions({ linked = false }) {
  const { auth } = useAuth();
  const location = useLocation();
  const [leads, setLeads] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_ADMISSION);
  const [msg, setMsg] = useState(null);
  const [convertResult, setConvertResult] = useState(null);

  const load = () => {
    api.listLeads(auth.token).then(setLeads).catch((e) => setMsg({ type: 'error', text: e.message }));
    api.listCourses(auth.token).then(setCourses).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (linked || showForm || leads.length === 0) return;
    const leadId = new URLSearchParams(location.search).get('leadId');
    if (!leadId) return;
    const lead = leads.find((item) => String(item.id) === String(leadId));
    if (lead) openForm(lead);
  }, [linked, location.search, leads, courses, showForm]);

  const admissionRows = leads.filter((lead) => linked
    ? ['Converted', 'Enrolled'].includes(lead.status)
    : ['Positive', 'Interested', 'Negotiation', 'Demo_Workshop'].includes(lead.status));

  const selectedLead = useMemo(
    () => leads.find((lead) => String(lead.id) === String(form.lead_id)),
    [leads, form.lead_id],
  );

  const selectedCourse = useMemo(
    () => courses.find((course) => String(course.id) === String(form.course_interested)),
    [courses, form.course_interested],
  );

  const remainingAmount = Math.max((Number(form.total_amount) || 0) - (Number(form.amount_paid) || 0), 0);

  const openReceipt = async (receiptId) => {
    const res = await fetch(`/api/receipts/${receiptId}/print`, { headers: { Authorization: `Bearer ${auth.token}` } });
    const html = await res.text();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  const openForm = (lead = null) => {
    const courseId = lead?.course_interested_id ? String(lead.course_interested_id) : '';
    const course = courses.find((item) => String(item.id) === courseId);
    setConvertResult(null);
    setMsg(null);
    setForm({
      ...EMPTY_ADMISSION,
      lead_id: lead ? String(lead.id) : '',
      course_interested: courseId,
      total_amount: course?.fee ? String(course.fee) : '',
    });
    setShowForm(true);
  };

  const handleChange = (name, value) => {
    if (name === 'lead_id') {
      const lead = leads.find((item) => String(item.id) === String(value));
      const courseId = lead?.course_interested_id ? String(lead.course_interested_id) : '';
      const course = courses.find((item) => String(item.id) === courseId);
      setForm({
        ...form,
        lead_id: value,
        course_interested: courseId,
        total_amount: course?.fee ? String(course.fee) : form.total_amount,
      });
      return;
    }
    if (name === 'course_interested') {
      const course = courses.find((item) => String(item.id) === String(value));
      setForm({
        ...form,
        course_interested: value,
        total_amount: course?.fee ? String(course.fee) : form.total_amount,
      });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const submitAdmission = async (e) => {
    e.preventDefault();
    setMsg(null);
    setConvertResult(null);

    if (!form.lead_id) {
      setMsg({ type: 'error', text: 'Please select a lead.' });
      return;
    }
    if (!form.course_interested) {
      setMsg({ type: 'error', text: 'Please select the course the applicant is opting for.' });
      return;
    }

    try {
      const result = await api.convertLead(auth.token, form.lead_id, {
        course_interested: Number(form.course_interested),
        total_amount: form.total_amount ? Number(form.total_amount) : null,
        amount_paid: form.amount_paid ? Number(form.amount_paid) : 0,
        payment_mode: form.payment_mode,
        transaction_id: form.transaction_id,
        bank_name: form.bank_name,
        applicant_address: form.applicant_address,
        applicant_city: form.applicant_city,
        personal_details: form.personal_details,
        date_of_birth: form.date_of_birth,
        gender: form.gender,
        state: form.state,
        country: form.country,
        educational_details: form.educational_details,
        degree: form.degree,
        passed_year: form.passed_year,
        marks: form.marks,
        university: form.university,
        fee_details: form.fee_details,
        remaining_payment_amount: remainingAmount,
        fee_due_date: form.fee_due_date,
        document_details: form.document_details,
      });
      setConvertResult(result);
      setMsg({ type: 'success', text: 'Admission created and student login generated.' });
      setForm(EMPTY_ADMISSION);
      setShowForm(false);
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <Layout>
      <PageHeader
        title={linked ? 'Link - Admission' : 'Admission'}
        subtitle={linked ? 'Converted applicants linked to admission records' : 'Create student admissions from qualified leads'}
        cta={!linked && <button className="btn-cta" type="button" onClick={() => openForm()}><PlusCircle size={16} /> Add admission</button>}
      />
      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}
      {convertResult && (
        <div className="msg success">
          <KeyRound size={16} />
          Student login: <strong>{convertResult.login_email}</strong> &middot; Temp password: <strong>{convertResult.temp_password}</strong>
          {convertResult.receipt_id && (
            <button className="btn small secondary" type="button" onClick={() => openReceipt(convertResult.receipt_id)}>
              Open receipt {convertResult.receipt_number}
            </button>
          )}
        </div>
      )}

      {!linked && showForm && (
        <div className="card">
          <h3><PlusCircle /> Admission details</h3>
          <form className="inline-form admission-form" onSubmit={submitAdmission}>
            <div className="form-section-title">Applicant details</div>
            <div className="field wide-field">
              <label>Select lead</label>
              <select value={form.lead_id} onChange={(e) => handleChange('lead_id', e.target.value)} required>
                <option value="">-- select lead --</option>
                {admissionRows.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} - {lead.phone || lead.email || `AT${String(lead.id).padStart(5, '0')}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="field"><label>Name</label><input value={selectedLead?.name || ''} readOnly /></div>
            <div className="field"><label>Phone</label><input value={selectedLead?.phone || ''} readOnly /></div>
            <div className="field"><label>Email</label><input value={selectedLead?.email || ''} readOnly /></div>
            <div className="field">
              <label>Course opting for</label>
              <select value={form.course_interested} onChange={(e) => handleChange('course_interested', e.target.value)} required>
                <option value="">-- select course --</option>
                {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
              </select>
            </div>

            <div className="form-section-title">Personal details</div>
            <div className="field"><label>Address</label><textarea rows={2} value={form.applicant_address} onChange={(e) => handleChange('applicant_address', e.target.value)} /></div>
            <div className="field"><label>City</label><input value={form.applicant_city} onChange={(e) => handleChange('applicant_city', e.target.value)} /></div>
            <div className="field"><label>State</label><input value={form.state} onChange={(e) => handleChange('state', e.target.value)} /></div>
            <div className="field"><label>Country</label><input value={form.country} onChange={(e) => handleChange('country', e.target.value)} /></div>
            <div className="field"><label>Date of birth</label><input type="date" value={form.date_of_birth} onChange={(e) => handleChange('date_of_birth', e.target.value)} /></div>
            <div className="field">
              <label>Gender</label>
              <select value={form.gender} onChange={(e) => handleChange('gender', e.target.value)}>
                <option value="">-- select --</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="field wide-field"><label>Personal notes</label><textarea rows={2} value={form.personal_details} onChange={(e) => handleChange('personal_details', e.target.value)} placeholder="Guardian name, alternate contact, address proof details" /></div>

            <div className="form-section-title">Educational details</div>
            <div className="field"><label>Degree</label><input value={form.degree} onChange={(e) => handleChange('degree', e.target.value)} placeholder="B.Com" /></div>
            <div className="field"><label>Passed year</label><input value={form.passed_year} onChange={(e) => handleChange('passed_year', e.target.value)} placeholder="2024" /></div>
            <div className="field"><label>Marks</label><input value={form.marks} onChange={(e) => handleChange('marks', e.target.value)} placeholder="80%" /></div>
            <div className="field"><label>University</label><input value={form.university} onChange={(e) => handleChange('university', e.target.value)} /></div>
            <div className="field wide-field"><label>Education notes</label><textarea rows={2} value={form.educational_details} onChange={(e) => handleChange('educational_details', e.target.value)} placeholder="College, specialization, certification, gap details" /></div>

            <div className="form-section-title">Fee details</div>
            <div className="field"><label>Course fees</label><input type="number" value={form.total_amount} onChange={(e) => handleChange('total_amount', e.target.value)} placeholder={selectedCourse?.fee ? String(selectedCourse.fee) : ''} /></div>
            <div className="field"><label>Paid fees</label><input type="number" value={form.amount_paid} onChange={(e) => handleChange('amount_paid', e.target.value)} /></div>
            <div className="field"><label>Remaining amount</label><input type="number" value={remainingAmount} readOnly /></div>
            <div className="field"><label>Due date</label><input type="date" value={form.fee_due_date} onChange={(e) => handleChange('fee_due_date', e.target.value)} /></div>
            <div className="field wide-field"><label>Fee notes</label><textarea rows={2} value={form.fee_details} onChange={(e) => handleChange('fee_details', e.target.value)} placeholder="Installment plan, discounts, due date, scholarship notes" /></div>

            <div className="form-section-title">Transaction details</div>
            <div className="field">
              <label>Payment mode</label>
              <select value={form.payment_mode} onChange={(e) => handleChange('payment_mode', e.target.value)}>
                <option value="Online">Online</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div className="field"><label>Transaction ID</label><input value={form.transaction_id} onChange={(e) => handleChange('transaction_id', e.target.value)} /></div>
            <div className="field"><label>Bank name</label><input value={form.bank_name} onChange={(e) => handleChange('bank_name', e.target.value)} /></div>

            <div className="form-section-title">Document details</div>
            <div className="field wide-field"><label>Documents</label><textarea rows={2} value={form.document_details} onChange={(e) => handleChange('document_details', e.target.value)} placeholder="Aadhaar, marks cards, degree certificate, photo, pending documents" /></div>

            <div className="form-actions">
              <button className="btn secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn" type="submit">Create admission</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3>{linked ? <LinkIcon /> : <CheckCircle2 />} {linked ? 'Linked admissions' : 'Admission pipeline'}</h3>
        {admissionRows.length === 0 ? (
          <div className="empty-state">No matching applicants yet.</div>
        ) : (
          <table>
            <thead><tr><th>Lead ID</th><th>Name</th><th>Contact</th><th>Status</th><th>Course</th><th>Notes</th>{!linked && <th>Action</th>}</tr></thead>
            <tbody>
              {admissionRows.map((lead) => (
                <tr key={lead.id}>
                  <td className="num-cell">AT{String(lead.id).padStart(5, '0')}</td>
                  <td>{lead.name}</td>
                  <td>{lead.phone || lead.email}</td>
                  <td><Badge status={lead.status} /></td>
                  <td>{lead.course_interested_name || '-'}</td>
                  <td>{lead.notes || '-'}</td>
                  {!linked && (
                    <td>
                      <button className="btn small secondary" type="button" onClick={() => openForm(lead)} disabled={!lead.email}>
                        Add admission
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
