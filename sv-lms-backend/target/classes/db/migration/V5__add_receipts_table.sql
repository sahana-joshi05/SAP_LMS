-- Create receipts table for admission receipt generation
CREATE TABLE IF NOT EXISTS receipts (
    id SERIAL PRIMARY KEY,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    student_id BIGINT NOT NULL,
    lead_id BIGINT,
    course_id BIGINT NOT NULL,
    issued_by BIGINT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    amount_paid DECIMAL(10, 2) DEFAULT 0.0,
    balance_amount DECIMAL(10, 2),
    payment_mode VARCHAR(50),
    transaction_id VARCHAR(100),
    bank_name VARCHAR(100),
    purpose VARCHAR(255) DEFAULT 'Admission Fee',
    issued_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    received_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_receipts_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_receipts_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
    CONSTRAINT fk_receipts_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
    CONSTRAINT fk_receipts_issued_by FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Create index on receipt_number for quick lookups
CREATE INDEX idx_receipts_number ON receipts(receipt_number);

-- Create index on student_id for fetching receipts by student
CREATE INDEX idx_receipts_student ON receipts(student_id);

-- Create index on issued_date for sorting
CREATE INDEX idx_receipts_issued_date ON receipts(issued_date DESC);
