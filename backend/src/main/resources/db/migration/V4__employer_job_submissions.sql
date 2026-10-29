-- Add employer-submitted flag to existing jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_employer_submitted BOOLEAN NOT NULL DEFAULT FALSE;

-- Employer job submissions table
CREATE TABLE IF NOT EXISTS employer_job_submissions (
    id BIGSERIAL PRIMARY KEY,
    reference_id VARCHAR(64) NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    company_website VARCHAR(1024) NOT NULL,
    recruiter_name VARCHAR(255) NOT NULL,
    recruiter_email VARCHAR(255) NOT NULL,
    job_title VARCHAR(512) NOT NULL,
    job_description TEXT NOT NULL,
    location VARCHAR(512),
    country VARCHAR(100) DEFAULT 'India',
    job_type VARCHAR(50),
    experience_level VARCHAR(50),
    work_mode VARCHAR(50),
    salary_range VARCHAR(100),
    apply_url VARCHAR(2048) NOT NULL,
    official_job_url VARCHAR(2048),
    deadline TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_VERIFICATION',
    risk_label VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN',
    threat_score INT NOT NULL DEFAULT 0,
    risk_details TEXT,
    reviewer_notes TEXT,
    reviewer_username VARCHAR(100),
    published_job_id BIGINT REFERENCES jobs(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMP
);

-- Submission status audit trail
CREATE TABLE IF NOT EXISTS submission_status_history (
    id BIGSERIAL PRIMARY KEY,
    submission_id BIGINT NOT NULL REFERENCES employer_job_submissions(id) ON DELETE CASCADE,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    notes TEXT,
    changed_by VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_ref_id ON employer_job_submissions(reference_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON employer_job_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON employer_job_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sub_history_sub_id ON submission_status_history(submission_id);
