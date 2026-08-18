import React, { useEffect, useState } from 'react';
import { UserCheck, Wallet, Receipt } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export default function OperationsStudents() {
  const { auth } = useAuth();
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [msg, setMsg] = useState(null);

  const [enrollForm, setEnrollForm] = useState({ student_id: '', batch_id: '' });
  const [feeForm, setFeeForm] = useState({ student_id: '', course_id: '', total_fee: '', plan: 'full' });
  const [payForm, setPayForm] = useState({ fee_id: '', amount: '', payment_mode: 'cash', receipt_no: '' });
  const [studentFees, setStudentFees] = useState([]);
  const [lookupStudentId, setLookupStudentId] = useState('');

  const load = () => {
    api.listStudents(auth.token).then(setStudents).catch((e) => setMsg({ type: 'error', text: e.message }));
    api.listBatches(auth.token).then(setBatches).catch(() => {});
    api.listCourses(auth.token).then(setCourses).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleEnroll = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.enrollStudent(auth.token, enrollForm.batch_id, enrollForm.student_id);
      setMsg({ type: 'success', text: 'Student enrolled into batch.' });
      setEnrollForm({ student_id: '', batch_id: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleFeeSetup = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.createFee(auth.token, { ...feeForm, total_fee: Number(feeForm.total_fee) });
      setMsg({ type: 'success', text: 'Fee plan created.' });
      setFeeForm({ student_id: '', course_id: '', total_fee: '', plan: 'full' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.payFee(auth.token, payForm.fee_id, { ...payForm, amount: Number(payForm.amount) });
      setMsg({ type: 'success', text: 'Payment recorded.' });
      setPayForm({ fee_id: '', amount: '', payment_mode: 'cash', receipt_no: '' });
      if (lookupStudentId) loadFees(lookupStudentId);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const loadFees = async (studentId) => {
    setLookupStudentId(studentId);
    if (!studentId) { setStudentFees([]); return; }
    try {
      const fees = await api.getStudentFees(auth.token, studentId);
      setStudentFees(fees);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <Layout>
      <PageHeader title="Students & Fees" subtitle="Enroll students into batches and manage fee collection" />
      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      <div className="card">
        <h3><UserCheck /> Enroll student into a batch</h3>
        <form className="inline-form" onSubmit={handleEnroll}>
          <div className="field">
            <label>Student</label>
            <select value={enrollForm.student_id} onChange={(e) => setEnrollForm({ ...enrollForm, student_id: e.target.value })} required>
              <option value="">-- select --</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
            </select>
          </div>
          <div className="field">
            <label>Batch</label>
            <select value={enrollForm.batch_id} onChange={(e) => setEnrollForm({ ...enrollForm, batch_id: e.target.value })} required>
              <option value="">-- select --</option>
              {batches.map((b) => <option key={b.id} value={b.id}>{b.batch_name}</option>)}
            </select>
          </div>
          <button className="btn" type="submit">Enroll</button>
        </form>
      </div>

      <div className="card">
        <h3><Wallet /> Set up a fee plan</h3>
        <form className="inline-form" onSubmit={handleFeeSetup}>
          <div className="field">
            <label>Student</label>
            <select value={feeForm.student_id} onChange={(e) => setFeeForm({ ...feeForm, student_id: e.target.value })} required>
              <option value="">-- select --</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Course</label>
            <select value={feeForm.course_id} onChange={(e) => setFeeForm({ ...feeForm, course_id: e.target.value })} required>
              <option value="">-- select --</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field"><label>Total fee (INR)</label><input type="number" value={feeForm.total_fee} onChange={(e) => setFeeForm({ ...feeForm, total_fee: e.target.value })} required /></div>
          <button className="btn" type="submit">Create fee plan</button>
        </form>
      </div>

      <div className="card">
        <h3><Receipt /> Look up student fees & record payment</h3>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Student</label>
          <select value={lookupStudentId} onChange={(e) => loadFees(e.target.value)}>
            <option value="">-- select --</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        {studentFees.length > 0 && (
          <table style={{ marginBottom: 16 }}>
            <thead><tr><th>Fee ID</th><th>Total</th><th>Paid</th><th>Due</th></tr></thead>
            <tbody>
              {studentFees.map((f) => (
                <tr key={f.id}>
                  <td className="num-cell">{f.id}</td>
                  <td className="num-cell">&#8377;{f.total_fee}</td>
                  <td className="num-cell">&#8377;{f.amount_paid}</td>
                  <td className="num-cell">&#8377;{f.due_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <form className="inline-form" onSubmit={handlePayment}>
          <div className="field">
            <label>Fee ID</label>
            <select value={payForm.fee_id} onChange={(e) => setPayForm({ ...payForm, fee_id: e.target.value })} required>
              <option value="">-- select --</option>
              {studentFees.map((f) => <option key={f.id} value={f.id}>#{f.id} (due &#8377;{f.due_amount})</option>)}
            </select>
          </div>
          <div className="field"><label>Amount</label><input type="number" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} required /></div>
          <div className="field">
            <label>Payment mode</label>
            <select value={payForm.payment_mode} onChange={(e) => setPayForm({ ...payForm, payment_mode: e.target.value })}>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
          <div className="field"><label>Receipt No.</label><input value={payForm.receipt_no} onChange={(e) => setPayForm({ ...payForm, receipt_no: e.target.value })} /></div>
          <button className="btn" type="submit">Record payment</button>
        </form>
      </div>
    </Layout>
  );
}
