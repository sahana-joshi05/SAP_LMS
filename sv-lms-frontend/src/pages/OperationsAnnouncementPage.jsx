import React, { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, CalendarClock, ClipboardList, GraduationCap, Layers, Send } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

const TYPES = {
  exam: {
    title: 'Exam Announcements',
    subtitle: 'Publish structured exam notices to students',
    icon: CalendarClock,
    templateKey: 'exam_announcement',
    subject: 'Exam Announcement',
    audience: 'STUDENT',
    success: 'Exam announcement sent to students.',
    fields: [
      { name: 'examTitle', label: 'Exam title', required: true },
      { name: 'batchId', label: 'Batch', type: 'batch', required: true },
      { name: 'examType', label: 'Exam type', type: 'select', options: ['Mock Test', 'Internal Assessment', 'Final Exam', 'Certification Test'] },
      { name: 'scheduledAt', label: 'Date & time', type: 'datetime-local', required: true },
      { name: 'duration', label: 'Duration', placeholder: 'Example: 90 minutes' },
      { name: 'syllabus', label: 'Syllabus / topics', type: 'textarea', required: true },
      { name: 'instructions', label: 'Instructions', type: 'textarea', placeholder: 'ID card, laptop, reporting time, rules' },
    ],
    buildSubject: (f) => `Exam Announcement: ${f.examTitle}`,
    buildMessage: (f, batchName) => [
      `Exam: ${f.examTitle}`,
      `Batch: ${batchName}`,
      `Type: ${f.examType}`,
      `Schedule: ${formatDateTime(f.scheduledAt)}`,
      f.duration && `Duration: ${f.duration}`,
      `Syllabus: ${f.syllabus}`,
      f.instructions && `Instructions: ${f.instructions}`,
    ],
  },
  batch: {
    title: 'Batch Updates',
    subtitle: 'Inform students about timing, venue, trainer, or batch changes',
    icon: Layers,
    templateKey: 'batch_update',
    subject: 'Batch Update',
    audience: 'STUDENT',
    success: 'Batch update sent to students.',
    fields: [
      { name: 'batchId', label: 'Batch', type: 'batch', required: true },
      { name: 'updateType', label: 'Update type', type: 'select', options: ['Timing Change', 'Class Rescheduled', 'Venue / Link Update', 'Trainer Change', 'Material Update'] },
      { name: 'effectiveDate', label: 'Effective date', type: 'date', required: true },
      { name: 'newTiming', label: 'New timing / schedule', placeholder: 'Example: 7 PM to 8:30 PM' },
      { name: 'location', label: 'Classroom / meeting link' },
      { name: 'actionNeeded', label: 'Student action needed', type: 'textarea', placeholder: 'Example: Join 10 minutes early, bring laptop' },
      { name: 'details', label: 'Extra details', type: 'textarea' },
    ],
    buildSubject: (f, batchName) => `Batch Update: ${batchName}`,
    buildMessage: (f, batchName) => [
      `Batch: ${batchName}`,
      `Update: ${f.updateType}`,
      `Effective from: ${formatDate(f.effectiveDate)}`,
      f.newTiming && `Timing: ${f.newTiming}`,
      f.location && `Location / link: ${f.location}`,
      f.actionNeeded && `Action needed: ${f.actionNeeded}`,
      f.details && `Details: ${f.details}`,
    ],
  },
  placement: {
    title: 'Placement Updates',
    subtitle: 'Share placement drives, role details, eligibility, and registration dates',
    icon: BriefcaseBusiness,
    templateKey: 'placement_update',
    subject: 'Placement Update',
    audience: 'STUDENT',
    success: 'Placement update sent to students.',
    fields: [
      { name: 'company', label: 'Company', required: true },
      { name: 'role', label: 'Role / designation', required: true },
      { name: 'packageInfo', label: 'Package / stipend', placeholder: 'Example: 4.5 LPA' },
      { name: 'eligibility', label: 'Eligibility', type: 'textarea', required: true },
      { name: 'registrationDeadline', label: 'Registration deadline', type: 'datetime-local', required: true },
      { name: 'driveDate', label: 'Drive date', type: 'datetime-local', required: true },
      { name: 'location', label: 'Venue / online link' },
      { name: 'documents', label: 'Documents to carry', type: 'textarea', placeholder: 'Resume, ID proof, certificates' },
      { name: 'applyLink', label: 'Apply / registration link' },
    ],
    buildSubject: (f) => `Placement Drive: ${f.company} - ${f.role}`,
    buildMessage: (f) => [
      `Company: ${f.company}`,
      `Role: ${f.role}`,
      f.packageInfo && `Package / stipend: ${f.packageInfo}`,
      `Eligibility: ${f.eligibility}`,
      `Register by: ${formatDateTime(f.registrationDeadline)}`,
      `Drive date: ${formatDateTime(f.driveDate)}`,
      f.location && `Venue / link: ${f.location}`,
      f.documents && `Documents: ${f.documents}`,
      f.applyLink && `Apply here: ${f.applyLink}`,
    ],
  },
  trainer: {
    title: 'Trainer Updates',
    subtitle: 'Send operational instructions and deadlines to trainers',
    icon: ClipboardList,
    templateKey: 'trainer_update',
    subject: 'Trainer Update',
    audience: 'TRAINER',
    success: 'Trainer update sent to trainers.',
    fields: [
      { name: 'category', label: 'Update type', type: 'select', options: ['Attendance Reminder', 'Material Upload', 'Exam Coordination', 'Schedule Confirmation', 'Student Concern'] },
      { name: 'batchId', label: 'Batch', type: 'batch' },
      { name: 'priority', label: 'Priority', type: 'select', options: ['Normal', 'High', 'Urgent'] },
      { name: 'dueAt', label: 'Due date / time', type: 'datetime-local' },
      { name: 'actionRequired', label: 'Action required', type: 'textarea', required: true },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    buildSubject: (f) => `Trainer Update: ${f.category}`,
    buildMessage: (f, batchName) => [
      `Type: ${f.category}`,
      batchName && `Batch: ${batchName}`,
      `Priority: ${f.priority}`,
      f.dueAt && `Due by: ${formatDateTime(f.dueAt)}`,
      `Action required: ${f.actionRequired}`,
      f.notes && `Notes: ${f.notes}`,
    ],
  },
};

const DEFAULTS = {
  exam: { examType: 'Mock Test' },
  batch: { updateType: 'Timing Change' },
  placement: {},
  trainer: { category: 'Attendance Reminder', priority: 'Normal' },
};

function formatDate(value) {
  if (!value) return '';
  return new Date(`${value}T00:00:00`).toLocaleDateString();
}

function formatDateTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString();
}

function cleanLines(lines) {
  return lines.filter(Boolean).join('\n');
}

export default function OperationsAnnouncementPage({ type }) {
  const { auth } = useAuth();
  const config = TYPES[type] || TYPES.exam;
  const Icon = config.icon;
  const [batches, setBatches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState(DEFAULTS[type] || {});
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    setForm(DEFAULTS[type] || {});
    setMsg(null);
  }, [type]);

  const load = () => {
    api.listBatches(auth.token).then(setBatches).catch(() => {});
    api.listNotifications(auth.token).then(setNotifications).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const batchName = useMemo(() => {
    const batch = batches.find((item) => String(item.id) === String(form.batchId));
    return batch ? `${batch.course_name} - ${batch.batch_name}` : '';
  }, [batches, form.batchId]);

  const relevantUpdates = notifications.filter((item) => item.template_key === config.templateKey);

  const updateField = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  const sendUpdate = async (e) => {
    e.preventDefault();
    setMsg(null);

    const subject = config.buildSubject(form, batchName);
    const message = cleanLines(config.buildMessage(form, batchName));

    try {
      const result = await api.createNotification(auth.token, {
        recipient_role: config.audience,
        channel: 'in_app',
        template_key: config.templateKey,
        subject,
        message,
        status: 'sent',
        sent_at: new Date().toISOString().slice(0, 19),
      });
      setMsg({ type: 'success', text: result.message || config.success });
      setForm(DEFAULTS[type] || {});
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <Layout>
      <PageHeader title={config.title} subtitle={config.subtitle} />
      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      <div className="card-grid-2">
        <div className="card">
          <h3><Icon /> Create update</h3>
          <form className="inline-form announcement-form" onSubmit={sendUpdate}>
            {config.fields.map((field) => (
              <div className={`field${field.type === 'textarea' ? ' wide-field' : ''}`} key={field.name}>
                <label>{field.label}</label>
                {field.type === 'select' ? (
                  <select value={form[field.name] || field.options[0]} onChange={(e) => updateField(field.name, e.target.value)} required={field.required}>
                    {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : field.type === 'batch' ? (
                  <select value={form[field.name] || ''} onChange={(e) => updateField(field.name, e.target.value)} required={field.required}>
                    <option value="">Select batch</option>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>{batch.course_name} - {batch.batch_name}</option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea rows={3} value={form[field.name] || ''} placeholder={field.placeholder || ''} onChange={(e) => updateField(field.name, e.target.value)} required={field.required} />
                ) : (
                  <input type={field.type || 'text'} value={form[field.name] || ''} placeholder={field.placeholder || ''} onChange={(e) => updateField(field.name, e.target.value)} required={field.required} />
                )}
              </div>
            ))}
            <div className="announcement-audience">
              <GraduationCap />
              <span>Goes to {config.audience === 'TRAINER' ? 'Trainer Dashboard' : 'Student Dashboard'}</span>
            </div>
            <div className="form-actions">
              <button className="btn" type="submit"><Send /> Publish update</button>
            </div>
          </form>
        </div>

        <div className="card">
          <h3>Recent {config.title.toLowerCase()}</h3>
          {relevantUpdates.length === 0 ? (
            <div className="empty-state">No updates published yet.</div>
          ) : (
            relevantUpdates.slice(0, 6).map((item) => (
              <div className="list-item-row" key={item.id}>
                <div style={{ flex: 1 }}>
                  <div className="list-item-title">{item.subject || config.subject}</div>
                  <div className="list-item-sub update-message">{item.message}</div>
                </div>
                <Badge status={item.status || 'sent'} />
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
