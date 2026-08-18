const API_BASE = '/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (token, newPassword) => request('/auth/reset-password', { method: 'POST', body: { token, new_password: newPassword } }),

  // Users
  createUser: (token, payload) => request('/users', { method: 'POST', body: payload, token }),
  listUsers: (token, role) => request(`/users${role ? `?role=${role}` : ''}`, { token }),

  // Courses
  createCourse: (token, payload) => request('/courses', { method: 'POST', body: payload, token }),
  listCourses: (token) => request('/courses', { token }),

  // Leads
  createLead: (token, payload) => request('/leads', { method: 'POST', body: payload, token }),
  listLeads: (token) => request('/leads', { token }),
  updateLead: (token, id, payload) => request(`/leads/${id}`, { method: 'PATCH', body: payload, token }),
  convertLead: (token, id, payload) => request(`/leads/${id}/convert`, { method: 'POST', body: payload, token }),

  // Batches
  createBatch: (token, payload) => request('/batches', { method: 'POST', body: payload, token }),
  listBatches: (token) => request('/batches', { token }),
  getBatch: (token, id) => request(`/batches/${id}`, { token }),
  enrollStudent: (token, batchId, studentId) =>
    request(`/batches/${batchId}/enroll`, { method: 'POST', body: { student_id: studentId }, token }),

  // Attendance
  markAttendance: (token, payload) => request('/attendance', { method: 'POST', body: payload, token }),
  getBatchAttendance: (token, batchId) => request(`/attendance/batch/${batchId}`, { token }),
  getMyAttendance: (token) => request('/attendance/me', { token }),

  // Fees
  createFee: (token, payload) => request('/fees', { method: 'POST', body: payload, token }),
  payFee: (token, feeId, payload) => request(`/fees/${feeId}/pay`, { method: 'POST', body: payload, token }),
  getStudentFees: (token, studentId) => request(`/fees/student/${studentId}`, { token }),
  getMyFees: (token) => request('/fees/me', { token }),

  // Content
  createContent: (token, payload) => request('/content', { method: 'POST', body: payload, token }),
  getBatchContent: (token, batchId) => request(`/content/batch/${batchId}`, { token }),

  // Students
  listStudents: (token) => request('/students', { token }),
  getOverview: (token) => request('/students/overview', { token }),
  getMySummary: (token) => request('/students/me/summary', { token }),

  // Follow-ups
  listFollowUps: (token) => request('/follow-ups', { token }),
  createFollowUp: (token, payload) => request('/follow-ups', { method: 'POST', body: payload, token }),

  // Support
  listTickets: (token) => request('/tickets', { token }),
  createTicket: (token, payload) => request('/tickets', { method: 'POST', body: payload, token }),

  // Assignments and exams
  listAssignments: (token) => request('/assignments', { token }),
  createAssignment: (token, payload) => request('/assignments', { method: 'POST', body: payload, token }),
  listAssignmentSubmissions: (token) => request('/assignment-submissions', { token }),
  submitAssignment: (token, assignmentId, payload) => request(`/assignments/${assignmentId}/submissions`, { method: 'POST', body: payload, token }),
  listExams: (token) => request('/exams', { token }),
  createExam: (token, payload) => request('/exams', { method: 'POST', body: payload, token }),

  // Certificates, notifications, reports
  listReceipts: (token) => request('/receipts', { token }),
  listCertificates: (token) => request('/certificates', { token }),
  createCertificate: (token, payload) => request('/certificates', { method: 'POST', body: payload, token }),
  listNotifications: (token) => request('/notifications', { token }),
  createNotification: (token, payload) => request('/notifications', { method: 'POST', body: payload, token }),
  getReportSummary: (token) => request('/reports/summary', { token }),
  getAuditLogs: (token) => request('/audit-logs', { token }),

  // SEO
  listSeoKeywords: (token) => request('/seo/keywords', { token }),
  createSeoKeyword: (token, payload) => request('/seo/keywords', { method: 'POST', body: payload, token }),
  listSeoPages: (token) => request('/seo/pages', { token }),
  createSeoPage: (token, payload) => request('/seo/pages', { method: 'POST', body: payload, token }),
  listSeoTasks: (token) => request('/seo/tasks', { token }),
  createSeoTask: (token, payload) => request('/seo/tasks', { method: 'POST', body: payload, token }),
};
