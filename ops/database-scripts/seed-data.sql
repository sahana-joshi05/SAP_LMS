-- Optional manual seed data, matching what DataSeeder.java creates automatically.
-- Only needed if you're populating the database by hand instead of running the backend
-- (e.g. testing against a shared/staging Postgres instance directly).
--
-- Password hash below is bcrypt for "Password@123" — same demo password used everywhere else.

INSERT INTO users (name, email, password_hash, role)
VALUES ('Institute Super Admin', 'superadmin@sapinstitute.com', '$2a$10$replace_with_real_bcrypt_hash', 'SUPERADMIN')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password_hash, role)
VALUES ('Meera Admin', 'admin@sapinstitute.com', '$2a$10$replace_with_real_bcrypt_hash', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password_hash, role)
VALUES ('Priya Counselor', 'counselor@sapinstitute.com', '$2a$10$replace_with_real_bcrypt_hash', 'COUNSELOR')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password_hash, role)
VALUES ('Ravi Operations', 'operations@sapinstitute.com', '$2a$10$replace_with_real_bcrypt_hash', 'OPERATIONS')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password_hash, role)
VALUES ('Neha SEO', 'seo@sapinstitute.com', '$2a$10$replace_with_real_bcrypt_hash', 'SEO')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password_hash, role)
VALUES ('Anand Instructor', 'trainer@sapinstitute.com', '$2a$10$replace_with_real_bcrypt_hash', 'TRAINER')
ON CONFLICT (email) DO NOTHING;

INSERT INTO courses (name, code, description, duration, fee)
VALUES ('SAP FICO', 'SAP-FICO', 'SAP Financial Accounting and Controlling', '3 months', 45000)
ON CONFLICT (code) DO NOTHING;

-- NOTE: replace the password_hash placeholders with a real bcrypt hash before running
-- this manually — DataSeeder.java (recommended path) generates these correctly for you.
