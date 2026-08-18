-- SV LMS reference schema (PostgreSQL)
--
-- Hibernate creates these tables automatically in development (ddl-auto: update).
-- This file is a plain-SQL reference of that same schema — useful for manual
-- inspection, or as a starting point if you switch to Flyway/Liquibase migrations
-- for production (see ops/migrations/).

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('SUPERADMIN','ADMIN','COUNSELOR','OPERATIONS','SEO','TRAINER','STUDENT')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE,
    description TEXT,
    duration VARCHAR(100),
    fee DOUBLE PRECISION DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    source VARCHAR(50) DEFAULT 'manual',
    status VARCHAR(20) NOT NULL DEFAULT 'New' CHECK (status IN ('New','Contacted','Interested','Enrolled','Lost')),
    assigned_counselor_id BIGINT REFERENCES users(id),
    course_interested_id BIGINT REFERENCES courses(id),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id),
    lead_id BIGINT REFERENCES leads(id),
    enrollment_date TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS batches (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(id),
    trainer_id BIGINT REFERENCES users(id),
    batch_name VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    mode VARCHAR(20) NOT NULL DEFAULT 'online' CHECK (mode IN ('online','offline','hybrid')),
    timing VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','ongoing','completed')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS batch_students (
    id BIGSERIAL PRIMARY KEY,
    batch_id BIGINT NOT NULL REFERENCES batches(id),
    student_id BIGINT NOT NULL REFERENCES students(id),
    enrolled_date TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    UNIQUE (batch_id, student_id)
);

CREATE TABLE IF NOT EXISTS attendance (
    id BIGSERIAL PRIMARY KEY,
    batch_id BIGINT NOT NULL REFERENCES batches(id),
    student_id BIGINT NOT NULL REFERENCES students(id),
    session_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present','absent','late')),
    marked_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (batch_id, student_id, session_date)
);

CREATE TABLE IF NOT EXISTS content (
    id BIGSERIAL PRIMARY KEY,
    batch_id BIGINT NOT NULL REFERENCES batches(id),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'material' CHECK (type IN ('material','video','link','assignment')),
    body TEXT,
    uploaded_by BIGINT REFERENCES users(id),
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fees (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id),
    course_id BIGINT NOT NULL REFERENCES courses(id),
    total_fee DOUBLE PRECISION NOT NULL DEFAULT 0,
    amount_paid DOUBLE PRECISION NOT NULL DEFAULT 0,
    due_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    plan VARCHAR(50) DEFAULT 'full',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fee_transactions (
    id BIGSERIAL PRIMARY KEY,
    fee_id BIGINT NOT NULL REFERENCES fees(id),
    amount DOUBLE PRECISION NOT NULL,
    payment_mode VARCHAR(50) DEFAULT 'cash',
    transaction_date TIMESTAMP NOT NULL DEFAULT NOW(),
    receipt_no VARCHAR(100),
    collected_by BIGINT REFERENCES users(id)
);
