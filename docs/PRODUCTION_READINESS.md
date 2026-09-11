# SV LMS — Production Readiness Checklist

Quick reference of items to complete before a real launch.

## Done
- [x] `app.jwt.secret` moved to an environment variable (`JWT_SECRET`), with a loud
      startup warning (`SecurityStartupCheck.java`) if the insecure default is still
      active — see `.env.example` in `sv-lms-backend/`
- [x] Login rate limiting added at two layers: per-email in-app limiter
      (`LoginRateLimiter.java`, 5 attempts / 15 min by default) plus per-IP limiting at
      the nginx reverse-proxy layer (`nginx/nginx.conf` + `nginx/conf.d/default.conf`)
- [x] `cors.allowed-origin` moved to an environment variable (`CORS_ALLOWED_ORIGIN`)
- [x] Database credentials moved to environment variables (`DB_URL`, `DB_USERNAME`,
      `DB_PASSWORD`)
- [x] Automated end-to-end test suite added (`LmsWorkflowIntegrationTest.java`) covering
      the full lead → student → batch → attendance → fee → content pipeline, role-based
      access control, and the rate limiter — runs via `mvn test`, no external services
      needed (uses an in-memory H2 database)
- [x] Flyway migrations replace `ddl-auto: update` — schema is now version-controlled
      (`sv-lms-backend/src/main/resources/db/migration/V1__init.sql`), with `ddl-auto`
      defaulting to `validate` so Hibernate double-checks the mapping instead of
      silently altering tables
- [x] Password reset flow — `/api/auth/forgot-password` and `/api/auth/reset-password`,
      time-limited single-use tokens, generic response to avoid email enumeration, wired
      into the frontend (`ForgotPassword.jsx`, `ResetPassword.jsx`, linked from Login)
- [x] Real `EmailService` abstraction added (`service/email/`) — local development logs
      emails unless SMTP is enabled; production must set `MAIL_ENABLED=true`,
      `MAIL_USERNAME`, `MAIL_PASSWORD`, and `MAIL_FROM` so credentials and password reset
      messages are actually delivered
- [x] Admin role added — limited administrative access (staff account management minus
      Super Admin/Admin creation, course management, view-only oversight of batches,
      students, and fee reports) — see `UserService.create()` for the specific
      restriction and `AdminDashboard.jsx` for the UI

## Still to do before going live
- [ ] Put the backend behind real HTTPS — drop TLS certs into `nginx/ssl/` and add a
      `listen 443 ssl;` server block to `nginx/conf.d/default.conf`
- [ ] Move `LoginRateLimiter`'s in-memory state to Redis (or similar) if you ever run
      more than one backend instance behind a load balancer — see the class-level comment
      in `LoginRateLimiter.java` for why
- [ ] Set up automated Postgres backups on a schedule (scripts exist in
      `ops/postgres-backup/`, just need a cron job or platform scheduler)
- [ ] Decide on real file storage (S3 or similar) if you move beyond pasted-link content
- [ ] Consider 2FA for the Super Admin role
- [ ] Add audit logging (table already exists in the migration - `audit_logs` - not yet
      written to by the application code)
- [ ] Add pagination to list endpoints (leads, students, batches, users) before data
      volume grows
- [ ] Fix the Trainer dashboard's N+1 batch-roster-count pattern
- [ ] Set up a CI/CD pipeline to run `mvn test` and `npm run build` automatically
- [ ] Add structured logging / error tracking (e.g. Sentry)
- [ ] Build the Placement Officer and SEO Executive modules
- [ ] Real SMS/WhatsApp notifications beyond SMTP email

## Phase 2 feature ideas

See the main README's "What's next" section for the full list (Placement Officer,
SEO Executive, assignments/quizzes, certificates, notifications, audit logs).
