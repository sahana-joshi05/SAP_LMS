import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpenCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../api.js';
import logo from '../assets/logo-full.png';

export default function PublicEnquiry() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', course_interested: '', notes: '' });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.listCourses().then(setCourses).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      await api.createPublicLead({
        ...form,
        source: 'website',
        course_interested: form.course_interested || null,
      });
      setMsg({ type: 'success', text: 'Thank you. Our counselor will contact you shortly.' });
      setForm({ name: '', phone: '', email: '', course_interested: '', notes: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="public-lead-page">
      <section className="public-lead-panel">
        <img src={logo} alt="SV Curiotech" className="public-lead-logo" />
        <div>
          <p className="public-lead-kicker">SAP career training</p>
          <h1>Start your SAP learning journey with SV Curiotech.</h1>
          <p className="public-lead-copy">
            Share your details and our counselor team will help you choose the right SAP module, batch, and fee plan.
          </p>
        </div>
      </section>

      <section className="public-lead-card" aria-label="Enquiry form">
        <h2><BookOpenCheck /> Enquiry form</h2>
        {msg && <div className={`msg ${msg.type}`}><CheckCircle2 size={16} />{msg.text}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Course interested</label>
            <select name="course_interested" value={form.course_interested} onChange={handleChange}>
              <option value="">Select course</option>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Message</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} />
          </div>
          <button className="btn public-lead-submit" type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit enquiry'} <ArrowRight size={16} />
          </button>
        </form>
      </section>
    </main>
  );
}
