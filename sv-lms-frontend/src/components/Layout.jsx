import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Layers, UserPlus, ClipboardList,
  Wallet, GraduationCap, LogOut, Search, Clock, LifeBuoy, BarChart3, ClipboardCheck,
  Link as LinkIcon, ReceiptText, MessageSquare, Pencil
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import logo from '../assets/logo-icon-square.png';

const MENUS = {
  superadmin: [
    { to: '/superadmin', label: 'Dashboard', end: true, icon: LayoutDashboard },
    { to: '/superadmin/users', label: 'Users', icon: Users },
    { to: '/superadmin/leads', label: 'All Leads', icon: UserPlus },
    { to: '/superadmin/courses', label: 'Courses', icon: BookOpen },
    { to: '/superadmin/batches', label: 'Batches & Students', icon: Layers },
    { to: '/superadmin/reports', label: 'Reports & Audit', icon: BarChart3 },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', end: true, icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/courses', label: 'Courses', icon: BookOpen },
    { to: '/admin/batches', label: 'Batches & Students', icon: Layers },
    { to: '/admin/reports', label: 'Reports & Audit', icon: BarChart3 },
  ],
  counselor: [
    { to: '/counselor', label: 'Dashboard', end: true, icon: LayoutDashboard },
    { to: '/counselor/leads', label: 'Leads', icon: UserPlus },
    { to: '/counselor/follow-ups', label: 'Follow-ups', icon: Clock },
    { to: '/counselor/admission', label: 'Admission', icon: Pencil },
    { to: '/counselor/link-admission', label: 'Link - Admission', icon: LinkIcon },
    { to: '/counselor/receipts', label: 'Receipt Details', icon: ReceiptText },
    { to: '/counselor/reports', label: 'Reports', icon: BarChart3 },
    { to: '/counselor/request-message', label: 'Request Message', icon: MessageSquare },
  ],
  operations: [
    { to: '/operations', label: 'Dashboard', end: true, icon: LayoutDashboard },
    { to: '/operations/batches', label: 'Batches', icon: Layers },
    { to: '/operations/students', label: 'Students & Fees', icon: Wallet },
    { to: '/operations/support', label: 'Support', icon: LifeBuoy },
  ],
  seo: [
    { to: '/seo', label: 'SEO Dashboard', end: true, icon: Search },
  ],
  trainer: [
    { to: '/trainer', label: 'Instructor Batches', end: true, icon: ClipboardList },
    { to: '/trainer/assessments', label: 'Assignments & Exams', icon: ClipboardCheck },
  ],
  student: [
    { to: '/student', label: 'My Dashboard', end: true, icon: GraduationCap },
    { to: '/student/workspace', label: 'Learning Work', icon: ClipboardCheck },
    { to: '/student/support', label: 'Support', icon: LifeBuoy },
  ],
};

const ROLE_LABELS = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  counselor: 'Counselor',
  operations: 'Operations',
  seo: 'SEO',
  trainer: 'Instructor',
  student: 'Student',
};

export default function Layout({ children }) {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const role = auth?.user?.role;
  const items = MENUS[role] || [];

  // Apply this role's accent color across the whole app (stat cards, buttons, links)
  useEffect(() => {
    if (!role) return;
    document.documentElement.style.setProperty('--accent', `var(--role-${role})`);
    document.documentElement.style.setProperty('--accent-bg', `var(--role-${role}-bg)`);
  }, [role]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src={logo} alt="SV Curiotech" className="sidebar-brand-mark" />
          <div>
            <div className="sidebar-brand-text">SV LMS</div>
            <div className="sidebar-role-chip">{ROLE_LABELS[role]}</div>
          </div>
        </div>
        <div className="sidebar-user">{auth?.user?.name}</div>
        <nav>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                <Icon /> {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout}><LogOut size={15} /> Log out</button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
