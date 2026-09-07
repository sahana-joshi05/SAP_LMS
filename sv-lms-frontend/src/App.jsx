import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

import Login from './pages/Login.jsx';
import PublicEnquiry from './pages/PublicEnquiry.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx';
import SuperAdminUsers from './pages/SuperAdminUsers.jsx';
import SuperAdminCourses from './pages/SuperAdminCourses.jsx';
import SuperAdminBatches from './pages/SuperAdminBatches.jsx';
import SuperAdminLeads from './pages/SuperAdminLeads.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import CounselorDashboard from './pages/CounselorDashboard.jsx';
import CounselorLeads from './pages/CounselorLeads.jsx';
import CounselorFollowUps from './pages/CounselorFollowUps.jsx';
import CounselorAdmissions from './pages/CounselorAdmissions.jsx';
import CounselorReceipts from './pages/CounselorReceipts.jsx';
import CounselorReports from './pages/CounselorReports.jsx';
import CounselorRequestMessages from './pages/CounselorRequestMessages.jsx';
import OperationsDashboard from './pages/OperationsDashboard.jsx';
import OperationsBatches from './pages/OperationsBatches.jsx';
import OperationsStudents from './pages/OperationsStudents.jsx';
import SeoDashboard from './pages/SeoDashboard.jsx';
import TrainerDashboard from './pages/TrainerDashboard.jsx';
import InstructorAssessments from './pages/InstructorAssessments.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import StudentWorkspace from './pages/StudentWorkspace.jsx';
import SupportTickets from './pages/SupportTickets.jsx';
import AdminReports from './pages/AdminReports.jsx';

function ProtectedRoute({ allowedRoles, children }) {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(auth.user.role)) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { auth } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/enquiry" element={<PublicEnquiry />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Super Admin */}
      <Route path="/superadmin" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminDashboard /></ProtectedRoute>} />
      <Route path="/superadmin/users" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminUsers /></ProtectedRoute>} />
      <Route path="/superadmin/leads" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminLeads /></ProtectedRoute>} />
      <Route path="/superadmin/courses" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminCourses /></ProtectedRoute>} />
      <Route path="/superadmin/batches" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminBatches /></ProtectedRoute>} />
      <Route path="/superadmin/reports" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminReports /></ProtectedRoute>} />

      {/* Admin - limited administrative access, reuses the same page components as
          Super Admin since the UI is identical; the backend enforces what Admin can
          and can't actually do (see UserService.create / controller @PreAuthorize rules) */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminUsers /></ProtectedRoute>} />
      <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminCourses /></ProtectedRoute>} />
      <Route path="/admin/batches" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminBatches /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />

      {/* Counselor */}
      <Route path="/counselor" element={<ProtectedRoute allowedRoles={['counselor']}><CounselorDashboard /></ProtectedRoute>} />
      <Route path="/counselor/leads" element={<ProtectedRoute allowedRoles={['counselor']}><CounselorLeads /></ProtectedRoute>} />
      <Route path="/counselor/follow-ups" element={<ProtectedRoute allowedRoles={['counselor']}><CounselorFollowUps /></ProtectedRoute>} />
      <Route path="/counselor/admission" element={<ProtectedRoute allowedRoles={['counselor']}><CounselorAdmissions /></ProtectedRoute>} />
      <Route path="/counselor/link-admission" element={<ProtectedRoute allowedRoles={['counselor']}><CounselorAdmissions linked /></ProtectedRoute>} />
      <Route path="/counselor/receipts" element={<ProtectedRoute allowedRoles={['counselor']}><CounselorReceipts /></ProtectedRoute>} />
      <Route path="/counselor/reports" element={<ProtectedRoute allowedRoles={['counselor']}><CounselorReports /></ProtectedRoute>} />
      <Route path="/counselor/request-message" element={<ProtectedRoute allowedRoles={['counselor']}><CounselorRequestMessages /></ProtectedRoute>} />

      {/* Operations */}
      <Route path="/operations" element={<ProtectedRoute allowedRoles={['operations']}><OperationsDashboard /></ProtectedRoute>} />
      <Route path="/operations/batches" element={<ProtectedRoute allowedRoles={['operations']}><OperationsBatches /></ProtectedRoute>} />
      <Route path="/operations/students" element={<ProtectedRoute allowedRoles={['operations']}><OperationsStudents /></ProtectedRoute>} />
      <Route path="/operations/support" element={<ProtectedRoute allowedRoles={['operations']}><SupportTickets /></ProtectedRoute>} />

      {/* SEO */}
      <Route path="/seo" element={<ProtectedRoute allowedRoles={['seo']}><SeoDashboard /></ProtectedRoute>} />

      {/* Instructor - backend role is still named trainer for compatibility */}
      <Route path="/trainer" element={<ProtectedRoute allowedRoles={['trainer']}><TrainerDashboard /></ProtectedRoute>} />
      <Route path="/trainer/assessments" element={<ProtectedRoute allowedRoles={['trainer']}><InstructorAssessments /></ProtectedRoute>} />

      {/* Student */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/workspace" element={<ProtectedRoute allowedRoles={['student']}><StudentWorkspace /></ProtectedRoute>} />
      <Route path="/student/support" element={<ProtectedRoute allowedRoles={['student']}><SupportTickets /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to={auth ? `/${auth.user.role}` : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
