ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;

ALTER TABLE leads ADD CONSTRAINT leads_status_check
CHECK (status IN (
    'New',
    'Contacted',
    'Interested',
    'Positive',
    'Call_Not_Received',
    'Follow_up',
    'Demo_Workshop',
    'Negotiation',
    'Enrolled',
    'Converted',
    'Not_Interested',
    'Lost'
));

CREATE TABLE follow_ups (
    id BIGSERIAL PRIMARY KEY,
    lead_id BIGINT NOT NULL REFERENCES leads(id),
    follow_up_at TIMESTAMP NOT NULL,
    type VARCHAR(80),
    outcome VARCHAR(120),
    notes TEXT,
    next_follow_up_at TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE support_tickets (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT REFERENCES students(id),
    category VARCHAR(120),
    priority VARCHAR(40) NOT NULL DEFAULT 'medium',
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(40) NOT NULL DEFAULT 'open',
    assigned_to BIGINT REFERENCES users(id),
    created_by BIGINT REFERENCES users(id),
    resolution_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE assignments (
    id BIGSERIAL PRIMARY KEY,
    batch_id BIGINT NOT NULL REFERENCES batches(id),
    title VARCHAR(255) NOT NULL,
    instructions TEXT,
    attachment_url TEXT,
    deadline TIMESTAMP,
    status VARCHAR(40) NOT NULL DEFAULT 'published',
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE assignment_submissions (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL REFERENCES assignments(id),
    student_id BIGINT NOT NULL REFERENCES students(id),
    submission_text TEXT,
    submission_url TEXT,
    marks DOUBLE PRECISION,
    feedback TEXT,
    status VARCHAR(40) NOT NULL DEFAULT 'submitted',
    submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    evaluated_by BIGINT REFERENCES users(id),
    evaluated_at TIMESTAMP,
    UNIQUE (assignment_id, student_id)
);

CREATE TABLE exams (
    id BIGSERIAL PRIMARY KEY,
    batch_id BIGINT NOT NULL REFERENCES batches(id),
    title VARCHAR(255) NOT NULL,
    instructions TEXT,
    exam_type VARCHAR(80) NOT NULL DEFAULT 'mcq',
    scheduled_at TIMESTAMP,
    total_marks DOUBLE PRECISION,
    status VARCHAR(40) NOT NULL DEFAULT 'scheduled',
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE exam_results (
    id BIGSERIAL PRIMARY KEY,
    exam_id BIGINT NOT NULL REFERENCES exams(id),
    student_id BIGINT NOT NULL REFERENCES students(id),
    score DOUBLE PRECISION,
    feedback TEXT,
    status VARCHAR(40) NOT NULL DEFAULT 'published',
    evaluated_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (exam_id, student_id)
);

CREATE TABLE certificates (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id),
    course_id BIGINT REFERENCES courses(id),
    certificate_number VARCHAR(120) UNIQUE NOT NULL,
    eligibility_status VARCHAR(60) NOT NULL DEFAULT 'pending',
    issued_at TIMESTAMP,
    download_url TEXT,
    verification_id VARCHAR(120) UNIQUE,
    issued_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient_user_id BIGINT REFERENCES users(id),
    channel VARCHAR(40) NOT NULL DEFAULT 'in_app',
    template_key VARCHAR(120),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'queued',
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMP
);

CREATE TABLE seo_keywords (
    id BIGSERIAL PRIMARY KEY,
    keyword VARCHAR(255) NOT NULL,
    location VARCHAR(120),
    search_intent VARCHAR(120),
    target_page VARCHAR(255),
    current_rank INTEGER,
    target_rank INTEGER,
    status VARCHAR(60) NOT NULL DEFAULT 'tracking',
    notes TEXT,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE seo_landing_pages (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    meta_description TEXT,
    url_slug VARCHAR(255) UNIQUE NOT NULL,
    h1 VARCHAR(255),
    content TEXT,
    faq TEXT,
    schema_fields TEXT,
    cta VARCHAR(255),
    status VARCHAR(60) NOT NULL DEFAULT 'draft',
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE seo_tasks (
    id BIGSERIAL PRIMARY KEY,
    task_type VARCHAR(120),
    topic VARCHAR(255) NOT NULL,
    keyword VARCHAR(255),
    assignee_id BIGINT REFERENCES users(id),
    status VARCHAR(60) NOT NULL DEFAULT 'todo',
    publishing_date DATE,
    target_location VARCHAR(120),
    notes TEXT,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_follow_ups_lead ON follow_ups(lead_id);
CREATE INDEX idx_support_tickets_student ON support_tickets(student_id);
CREATE INDEX idx_assignments_batch ON assignments(batch_id);
CREATE INDEX idx_assignment_submissions_student ON assignment_submissions(student_id);
CREATE INDEX idx_exams_batch ON exams(batch_id);
CREATE INDEX idx_exam_results_student ON exam_results(student_id);
CREATE INDEX idx_certificates_student ON certificates(student_id);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_user_id);
CREATE INDEX idx_seo_keywords_keyword ON seo_keywords(keyword);
