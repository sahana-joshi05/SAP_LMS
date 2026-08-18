import React, { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export default function SuperAdminCourses() {
  const { auth } = useAuth();
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ name: '', code: '', description: '', duration: '', fee: '' });
  const [msg, setMsg] = useState(null);

  const load = () => api.listCourses(auth.token).then(setCourses).catch((e) => setMsg({ type: 'error', text: e.message }));
  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.createCourse(auth.token, { ...form, fee: Number(form.fee) || 0 });
      setMsg({ type: 'success', text: `Course "${form.name}" created.` });
      setForm({ name: '', code: '', description: '', duration: '', fee: '' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <Layout>
      <PageHeader title="Courses" subtitle="SAP training programs offered by the institute" />
      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      <div className="card">
        <h3><BookOpen /> Add a new course</h3>
        <form className="inline-form" onSubmit={handleSubmit}>
          <div className="field"><label>Name</label><input name="name" value={form.name} onChange={handleChange} placeholder="SAP MM" required /></div>
          <div className="field"><label>Code</label><input name="code" value={form.code} onChange={handleChange} placeholder="SAP-MM" /></div>
          <div className="field"><label>Duration</label><input name="duration" value={form.duration} onChange={handleChange} placeholder="3 months" /></div>
          <div className="field"><label>Fee (INR)</label><input name="fee" type="number" value={form.fee} onChange={handleChange} placeholder="45000" /></div>
          <div className="field"><label>Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={1} /></div>
          <button className="btn" type="submit">Add course</button>
        </form>
      </div>

      <div className="card">
        <h3>All courses</h3>
        {courses.length === 0 ? (
          <div className="empty-state">No courses yet — add your first one above.</div>
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Code</th><th>Duration</th><th>Fee</th></tr></thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td><td>{c.code}</td><td>{c.duration}</td>
                  <td className="num-cell">&#8377;{c.fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
