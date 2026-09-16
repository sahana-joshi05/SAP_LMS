CREATE TABLE IF NOT EXISTS follow_ups (
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

CREATE INDEX IF NOT EXISTS idx_follow_ups_lead ON follow_ups(lead_id);
