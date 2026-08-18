import React, { useEffect, useState } from 'react';
import { Edit, Mail, Plus, Printer } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export default function CounselorReceipts() {
  const { auth } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api.listReceipts(auth.token).then(setReceipts).catch((e) => setMsg({ type: 'error', text: e.message }));
  }, []);

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
      <PageHeader title="Receipt Details" subtitle="Admission receipts sent to confirmed applicants" />
      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}
      <div className="card crm-table-card">
        {receipts.length === 0 ? (
          <div className="empty-state">No receipts generated yet.</div>
        ) : (
          <table>
            <thead><tr><th>Admission No</th><th>Receipt No</th><th>Date</th><th>Name</th><th>Course</th><th>Course Fees</th><th>Paid</th><th>Actions</th></tr></thead>
            <tbody>
              {receipts.map((r) => (
                <tr key={r.id}>
                  <td>{r.admission_number}</td>
                  <td>{r.receipt_number}</td>
                  <td>{(r.issued_date || '').slice(0, 10)}</td>
                  <td>{r.student_name}</td>
                  <td>{r.course_name}</td>
                  <td className="num-cell">{r.total_amount}</td>
                  <td className="num-cell">{r.amount_paid}</td>
                  <td>
                    <div className="action-icons">
                      <button title="Print receipt" onClick={() => openReceipt(r.id)}><Printer /></button>
                      <button title="Add payment"><Plus /></button>
                      <button title="Edit receipt"><Edit /></button>
                      <a title="Email applicant" href={r.student_email ? `mailto:${r.student_email}` : undefined}><Mail /></a>
                    </div>
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
