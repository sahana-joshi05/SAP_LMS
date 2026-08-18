import React, { useEffect, useState } from 'react';
import { ClipboardCheck, FilePlus2 } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export default function InstructorAssessments() {
  const { auth } = useAuth();
  const [batches, setBatches] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [exams, setExams] = useState([]);
  const [assignmentForm, setAssignmentForm] = useState({ batch_id: '', title: '', instructions: '', deadline: '' });
  const [examForm, setExamForm] = useState({ batch_id: '', title: '', exam_type: 'mcq', scheduled_at: '', total_marks: '' });
  const [msg, setMsg] = useState(null);

  const load = () => {
    api.listBatches(auth.token).then(setBatches).catch(() => {});
    api.listAssignments(auth.token).then(setAssignments).catch((e) => setMsg({ type: 'error', text: e.message }));
    api.listAssignmentSubmissions(auth.token).then(setSubmissions).catch(() => {});
    api.listExams(auth.token).then(setExams).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const createAssignment = async (e) => {
    e.preventDefault();
    await save(() => api.createAssignment(auth.token, assignmentForm), 'Assignment published.');
    setAssignmentForm({ batch_id: '', title: '', instructions: '', deadline: '' });
  };

  const createExam = async (e) => {
    e.preventDefault();
    await save(() => api.createExam(auth.token, examForm), 'Exam scheduled.');
    setExamForm({ batch_id: '', title: '', exam_type: 'mcq', scheduled_at: '', total_marks: '' });
  };

  const save = async (fn, successText) => {
    setMsg(null);
    try {
      await fn();
      setMsg({ type: 'success', text: successText });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <Layout>
      <PageHeader title="Assignments & Exams" subtitle="Publish assignments, schedule tests, and review student submissions" />
      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      <div className="card-grid-2">
        <div className="card">
          <h3><FilePlus2 /> Create assignment</h3>
          <form className="inline-form" onSubmit={createAssignment}>
            <div className="field">
              <label>Batch</label>
              <select value={assignmentForm.batch_id} onChange={(e) => setAssignmentForm({ ...assignmentForm, batch_id: e.target.value })} required>
                <option value="">Select batch</option>
                {batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.batch_name}</option>)}
              </select>
            </div>
            <div className="field"><label>Title</label><input value={assignmentForm.title} onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })} required /></div>
            <div className="field"><label>Deadline</label><input type="datetime-local" value={assignmentForm.deadline} onChange={(e) => setAssignmentForm({ ...assignmentForm, deadline: e.target.value })} /></div>
            <div className="field"><label>Instructions</label><textarea rows={1} value={assignmentForm.instructions} onChange={(e) => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })} /></div>
            <button className="btn" type="submit">Publish</button>
          </form>
        </div>

        <div className="card">
          <h3><ClipboardCheck /> Schedule exam</h3>
          <form className="inline-form" onSubmit={createExam}>
            <div className="field">
              <label>Batch</label>
              <select value={examForm.batch_id} onChange={(e) => setExamForm({ ...examForm, batch_id: e.target.value })} required>
                <option value="">Select batch</option>
                {batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.batch_name}</option>)}
              </select>
            </div>
            <div className="field"><label>Title</label><input value={examForm.title} onChange={(e) => setExamForm({ ...examForm, title: e.target.value })} required /></div>
            <div className="field"><label>When</label><input type="datetime-local" value={examForm.scheduled_at} onChange={(e) => setExamForm({ ...examForm, scheduled_at: e.target.value })} /></div>
            <div className="field"><label>Marks</label><input type="number" value={examForm.total_marks} onChange={(e) => setExamForm({ ...examForm, total_marks: e.target.value })} /></div>
            <button className="btn" type="submit">Schedule</button>
          </form>
        </div>
      </div>

      <div className="card">
        <h3>Published assignments</h3>
        <table>
          <thead><tr><th>Title</th><th>Batch</th><th>Deadline</th><th>Status</th></tr></thead>
          <tbody>{assignments.map((item) => <tr key={item.id}><td>{item.title}</td><td>{item.batch_id}</td><td>{item.deadline || '-'}</td><td><Badge status={item.status} /></td></tr>)}</tbody>
        </table>
      </div>

      <div className="card-grid-2">
        <div className="card">
          <h3>Submissions</h3>
          <table>
            <thead><tr><th>Assignment</th><th>Student</th><th>Status</th><th>Marks</th></tr></thead>
            <tbody>{submissions.map((item) => <tr key={item.id}><td>{item.assignment_id}</td><td>{item.student_id}</td><td><Badge status={item.status} /></td><td>{item.marks || '-'}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="card">
          <h3>Exams</h3>
          <table>
            <thead><tr><th>Title</th><th>When</th><th>Marks</th><th>Status</th></tr></thead>
            <tbody>{exams.map((item) => <tr key={item.id}><td>{item.title}</td><td>{item.scheduled_at || '-'}</td><td>{item.total_marks || '-'}</td><td><Badge status={item.status} /></td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
