import React, { useEffect, useState } from 'react';
import { Mail, Printer } from 'lucide-react';
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

  const loadReceipts = () => api.listReceipts(auth.token)
    .then(setReceipts)
    .catch((e) => setMsg({ type: 'error', text: e.message }));

  const openReceipt = async (receiptId) => {
    const res = await fetch(`/api/receipts/${receiptId}/print`, { headers: { Authorization: `Bearer ${auth.token}` } });
    const html = await res.text();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  const emailReceipt = async (receiptId) => {
    setMsg(null);
    try {
      const receipt = await api.emailReceipt(auth.token, receiptId);
      await loadReceipts();
      if (receipt.email_sent) {
        setMsg({ type: 'success', text: `Receipt emailed to ${receipt.student_email}.` });
      } else {
        setMsg({ type: 'error', text: `Receipt email not sent: ${receipt.email_send_error || 'Please check SMTP configuration.'}` });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <Layout>
      <PageHeader title="Receipt Details" subtitle="Admission receipts sent to confirmed applicants" />
      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}
      <div className="card crm-table-card receipt-table-card">
        {receipts.length === 0 ? (
          <div className="empty-state">No receipts generated yet.</div>
        ) : (
          <table>
            <thead><tr><th>Admission / Receipt</th><th>Date</th><th>Student Information</th><th>Course</th><th>Payment</th><th>Email Status</th><th>Counselor</th><th>Actions</th></tr></thead>
            <tbody>
              {receipts.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="list-item-title">{r.admission_number || '-'}</div>
                    <div className="list-item-sub">{r.receipt_number || '-'}</div>
                  </td>
                  <td>{(r.issued_date || '').slice(0, 10)}</td>
                  <td>
                    <div className="list-item-title">{r.student_name || '-'}</div>
                    <div className="list-item-sub">{r.student_email || '-'}</div>
                  </td>
                  <td>{r.course_name || '-'}</td>
                  <td>
                    <div className="receipt-money-row"><span>Total</span><strong>{r.total_amount || 0}</strong></div>
                    <div className="receipt-money-row"><span>Paid</span><strong>{r.amount_paid || 0}</strong></div>
                    <div className="receipt-money-row"><span>Remaining</span><strong>{r.balance_amount || 0}</strong></div>
                    {r.transaction_id && <div className="list-item-sub">Txn: {r.transaction_id}</div>}
                  </td>
                  <td>
                    <span className={`receipt-mail-status ${r.sent_to_applicant_at ? 'sent' : 'pending'}`}>
                      {r.sent_to_applicant_at ? 'Sent' : 'Pending'}
                    </span>
                  </td>
                  <td>{r.issued_by_name || '-'}</td>
                  <td>
                    <div className="action-icons">
                      <button title="Print receipt" type="button" onClick={() => openReceipt(r.id)}><Printer /></button>
                      <button title="Email receipt" type="button" onClick={() => emailReceipt(r.id)} disabled={!r.student_email}><Mail /></button>
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
