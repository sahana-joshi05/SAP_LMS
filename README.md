# SV LMS — Full-Stack Project

Java Spring Boot + React + PostgreSQL, structured as a standard layered full-stack project.

## Project structure

```
sv-lms-fullstack/
├── docker-compose.yml          # spins up PostgreSQL locally
├── nginx/                       # reverse proxy config, for production deployment only
├── ops/                         # DB schema reference, backups, migration placeholder
├── docs/                        # production readiness checklist
├── sv-lms-backend/
│   └── src/main/java/com/svlms/
│       ├── SvLmsApplication.java
│       ├── config/              # SecurityConfig, DataSeeder
│       ├── controller/          # thin REST endpoints — no business logic
│       ├── service/              # ALL business logic lives here
│       ├── repository/          # Spring Data JPA
│       ├── entity/              # JPA entities
│       ├── dto/
│       │   ├── request/          # what the frontend sends in
│       │   ├── response/         # what the API sends back
│       │   ├── settings/         # reserved, not used yet (see its README)
│       │   ├── report/           # reserved, not used yet
│       │   └── internalsupport/  # reserved, not used yet
│       ├── exception/            # custom exceptions + centralized error handling
│       ├── security/             # JwtUtil, JwtAuthFilter, AuthPrincipal
│       ├── multitenancy/         # reserved, not used yet
│       └── util/                 # small helpers (e.g. password generation)
└── sv-lms-frontend/               # React app (unchanged from before)
```

Every reserved/placeholder folder (`dto/settings`, `dto/report`, `dto/internalsupport`,
`multitenancy`, `service/email`, `service/sms`, `service/esign`, `service/whatsapp`) has
its own short `README.md` explaining what it's for. None of them are used by the current
MVP — they exist so the structure has room to grow without another reshuffle later.

## Why this structure

This follows the standard Spring Boot layering:

**Controller → Service → Repository**, with **DTOs** at the boundary (never expose JPA
entities directly over the API) and a single **GlobalExceptionHandler** turning custom
exceptions into consistent JSON error responses.

Concretely, compared to the previous version I gave you:
- Controllers used to contain all the logic (validation, database calls, business rules)
  directly. Now they're thin — a controller method is usually one line that calls a
  service and returns its result.
- All that logic moved into `service/` classes, one per domain (`LeadService`,
  `BatchService`, etc.) — this is where you'll make most future changes.
- Raw `Map<String, Object>` request/response bodies were replaced with real typed classes
  in `dto/request/` and `dto/response/` — better autocomplete, compile-time safety, and
  self-documenting API contracts.
- Ad-hoc `RuntimeException`s were replaced with specific exception types
  (`ResourceNotFoundException`, `BadRequestException`, `ConflictException`,
  `ForbiddenException`, `UnauthorizedException`), each mapped to the right HTTP status by
  `GlobalExceptionHandler`.

## One important technical detail

The React frontend expects JSON fields in `snake_case` (`batch_name`, `login_email`,
`total_fee`, etc.) — that's what it was originally built against. Rather than rewrite the
whole frontend, `application.yml` sets:

```yaml
spring:
  jackson:
    property-naming-strategy: SNAKE_CASE
```

This means every DTO is written with normal Java camelCase fields (`batchName`,
`loginEmail`) and Jackson automatically converts them to `snake_case` in the JSON — both
for responses going out and for parsing incoming request bodies. You don't need to think
about this day-to-day; just write normal Java field names.

One deliberate exception: `GET /api/students/overview` still returns a plain
`Map<String, Object>` with camelCase keys (`totalStudents`, `totalBatches`...), because
that's what the dashboard UI already expects and Map keys aren't affected by the global
naming strategy (it only applies to typed DTO fields). This is called out in
`StudentService.overview()`.

## ⚠️ Same caveat as before — please read

I wrote and carefully reviewed all 73 Java files, and ran automated checks for balanced
braces, correct package-to-folder mapping, matching class names, and that every
controller-to-service method call has a real matching method with the right name. All of
that passed cleanly.

What I could **not** do is actually compile it — this sandbox only reaches
npm/PyPI/GitHub, not Maven Central, so `mvn` can't download Spring Boot's dependencies
here. Treat your first `mvn spring-boot:run` as the real first test. If it doesn't
compile, paste me the error and I'll fix it immediately.

## How to run it

### 1. Run the backend
```bash
cd sv-lms-backend
mvn spring-boot:run
```
By default, local development uses a lightweight in-memory H2 database, so
Docker/PostgreSQL is not required. The demo data is recreated whenever the backend starts.

If you want to use PostgreSQL instead, start it with Docker:

```bash
docker compose up -d
```

Then run the backend with a PostgreSQL profile or matching `DB_URL`, `DB_USERNAME`,
and `DB_PASSWORD` environment variables.

Creates all tables automatically, seeds demo accounts (Super Admin, Admin, Counselor,
Operations, SEO, Instructor — password `Password@123` for all), plus a demo SAP FICO course and
batch. API runs on `http://localhost:8080`.

### 2. Run the frontend
```bash
cd sv-lms-frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

Create a student the same way as always: Counselor → Leads → add lead → Convert to
Student.

## Running the automated test suite

```bash
cd sv-lms-backend
mvn test
```

`LmsWorkflowIntegrationTest.java` runs the entire pipeline end-to-end against an
in-memory H2 database (no PostgreSQL needed for tests) — Counselor adds a lead, converts
it to a student, Operations enrolls them and collects a fee, Instructor uploads material and
marks attendance, and the new student logs in and sees all of it. It also checks that a
student can't create a course (role-based access control) and that the login rate
limiter actually blocks a 6th attempt after 5 failures.

This is the fastest way to catch a regression without manually clicking through the UI
every time you change something — run it after any backend change.

## Security hardening already in place

- **JWT secret, DB credentials, and CORS origin** are all environment-variable-driven
  (see `sv-lms-backend/.env.example`), with safe local-dev defaults so nothing extra is
  required to run locally
- **`SecurityStartupCheck`** prints a loud warning on backend startup if the insecure
  default JWT secret is still active — you can't accidentally deploy with it unnoticed
- **Login rate limiting** at two layers: a per-email in-app limiter
  (`LoginRateLimiter.java`, 5 failed attempts / 15 minutes by default) and a
  complementary per-IP limiter at the nginx layer (`nginx/nginx.conf` +
  `nginx/conf.d/default.conf`) — the two cover different attack patterns, see the
  class-level comment in `LoginRateLimiter.java` for the reasoning and its limitations at
  multi-instance scale

See `docs/PRODUCTION_READINESS.md` for what's done vs. still outstanding before a real
launch.

## Deploying to production

`nginx/` has a starting reverse-proxy config (serves the built React app as static files,
proxies `/api/` to the backend) and `ops/` has backup scripts and a migrations placeholder
for when you move off Hibernate's auto-DDL. `docs/PRODUCTION_READINESS.md` is a checklist
of what to tighten up before a real launch — none of this is required for local
development or testing.
