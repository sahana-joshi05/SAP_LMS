# LMS Portal Requirements Coverage

Source: `LMS_Portal_Developer_Requirements.pdf`

This file records the functional baseline that the project must contain. The PDF is treated as product requirements, not as executable instructions.

## Required Portals

| Portal | Current project coverage |
| --- | --- |
| Super Admin | Dashboard, users, courses, batches, students, finance visibility, reports/export, notifications, audit log, seeded demo login. |
| Admin | Dashboard, management screens, reports/export, notifications, audit log, and restricted admin creation rules. |
| Counselor | CRM dashboard, lead creation, expanded statuses, follow-up history, conversion to student, admission receipt flow. |
| Operations | Dashboard, batches, enrollment, student/fee operations, attendance visibility, support tickets, certificates, notifications. |
| SEO | Dedicated SEO dashboard, seeded login, lead-source visibility, keyword CRUD, landing-page CRUD, SEO task/content calendar CRUD. |
| Instructor | Assigned batches, roster, materials, attendance marking, assignments, submissions, exams. Backend role remains `TRAINER` for compatibility; UI labels it as Instructor. |
| Student | Own dashboard, courses, attendance, materials, payments, receipts/summary, assignment submission, exams, support tickets, certificates, notifications. |

Demo password for seeded staff accounts is `Password@123`.

## Core Workflow Coverage

1. Lead is created or imported and assigned to a counselor.
2. Counselor updates lead status, notes, and follow-up state.
3. Positive/interested lead can be converted to a student.
4. Conversion creates the student user and admission receipt when course data exists.
5. Operations can enroll the student into a batch and support fees.
6. Instructor can open assigned batches, upload class materials, and mark attendance.
7. Student can log in to view learning records, attendance, payments, assignments, exams, notifications, support, certificates, and course summary.
8. Admin/Super Admin can inspect lifecycle data through dashboards, reports, authorized CSV export, notifications, and audit logs.

## Permission Baseline

| Module | Super Admin | Admin | Counselor | Operations | SEO | Instructor | Student |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Users/Roles | Full | Staff only | No | No | No | No | Own login |
| Leads/CRM | Full | Full | Assigned | View | Source view | No | No |
| Admissions | Full | Manage | Create/process | Process | No | No | Own |
| Courses | Full | Manage | View | View | SEO planning | View | View |
| Batches | Full | Manage | View | Manage | View | Assigned | Own |
| Attendance | Full | Manage | View | Manage | No | Manage assigned | View |
| Materials | Full | Manage | No | View | No | Manage assigned | View/download |
| Assignments/Exams | Full | Manage | No | View | No | Manage assigned | Submit/attempt |
| Payments | Full | Manage | View | Support | No | No | Own |
| Reports | Full | Full | Assigned | Department | SEO | Batch | Own |
| Settings/Audit | Full | Limited | No | No | No | No | No |

## Database / Domain Coverage

Implemented core entities:

- Users, roles, status, password hash.
- Leads and lead assignment.
- Students and lead-to-student conversion.
- Courses.
- Batches and batch enrollment.
- Attendance.
- Content/materials.
- Fees, fee transactions, receipts.
- Password reset tokens.
- Audit log table and audit writes for newly added operational modules.
- Follow-up history records.
- Assignments, submissions, exams, marks, feedback, certificates.
- Tickets and notification logs.
- SEO keywords, landing pages, content calendar, ranking fields, SEO tasks, campaigns.

Remaining architecture expansion:

- Dynamic role/permission groups for button/action/export/approval level control.
- Dedicated provider-specific message history once WhatsApp/SMS/email vendors are selected.

## Non-Functional Requirements

Covered:

- React responsive frontend structure.
- Spring Boot REST/JSON backend.
- Server-side authorization with role checks.
- Password hashing and JWT authentication.
- Forgot/reset password.
- Login rate limiting.
- PostgreSQL/Flyway migrations.
- Docker Compose local database.
- Nginx production proxy starter.
- Backup/restore scripts and production readiness notes.
- End-to-end workflow integration test.
- Reports summary API and authorized CSV/JSON export.
- Persistent support, follow-up, assignment, exam, certificate, notification, SEO, and audit module APIs.

Required before production completion:

- Provider-backed WhatsApp/SMS/email delivery beyond queued notification records.
- Payment gateway webhook verification beyond manual payment/receipt support.
- Secure file storage service for uploaded files.
- Excel/PDF report export in addition to current CSV/JSON.
- Full audit writes from older pre-existing mutations.
- Branch/department/settings screens.
- Real SEO integrations such as Google Analytics/Search Console, if approved.
- Monitoring, staging/prod environment setup, and final role-access QA.

## Development Phases

| Phase | Scope |
| --- | --- |
| Phase 1 - Foundation | Authentication, users, roles, permissions, dashboard framework, settings, database. |
| Phase 2 - CRM | Leads, counselor assignment, follow-ups, statuses, communication, lead reports. |
| Phase 3 - Admission & Operations | Admission, payments/receipts, students, courses, batches, schedules, operations. |
| Phase 4 - LMS | Instructor, student, classes, attendance, materials, assignments, exams, progress. |
| Phase 5 - SEO & Marketing | SEO dashboard, keywords, landing pages, content tasks, lead attribution. |
| Phase 6 - Reports & Integrations | Reports, exports, notifications, payment gateway, WhatsApp/email, analytics. |
| Phase 7 - QA & Production | Security, role, performance testing, deployment, monitoring, handover. |

## Acceptance Checklist

- Every required role has a login path and dashboard.
- Unauthorized routes and APIs are role-protected.
- A lead can be traced from enquiry through conversion.
- A student can be traced through admission, batch, attendance, learning content, fees, and receipts.
- New operational module changes write audit entries; older MVP actions should be progressively wired to audit.
- Reports support authorized CSV/JSON export; per-list search/filter/pagination can be deepened as volume grows.
- UI must remain responsive on desktop and mobile.
