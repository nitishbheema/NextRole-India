CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    logo_url VARCHAR(1024),
    careers_url VARCHAR(1024) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE job_sources (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id),
    source_type VARCHAR(50) NOT NULL,
    board_identifier VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    last_attempted_at TIMESTAMP,
    last_successful_at TIMESTAMP,
    last_error TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_company_source_board UNIQUE (company_id, source_type, board_identifier)
);

CREATE TABLE jobs (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id),
    source_id BIGINT NOT NULL REFERENCES job_sources(id),
    source_job_id VARCHAR(512) NOT NULL,
    title VARCHAR(512) NOT NULL,
    description TEXT,
    location VARCHAR(512),
    country VARCHAR(100) DEFAULT 'India',
    job_type VARCHAR(50),
    experience_level VARCHAR(50),
    work_mode VARCHAR(50),
    salary_min NUMERIC(15,2),
    salary_max NUMERIC(15,2),
    salary_currency VARCHAR(10),
    published_at TIMESTAMP,
    application_deadline TIMESTAMP,
    apply_url VARCHAR(2048) NOT NULL,
    source_url VARCHAR(2048),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    first_seen_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_verified_at TIMESTAMP NOT NULL DEFAULT NOW(),
    missing_from_source_count INT NOT NULL DEFAULT 0,
    expired_at TIMESTAMP,
    expired_reason VARCHAR(512),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_source_job UNIQUE (source_id, source_job_id)
);

CREATE TABLE sync_runs (
    id BIGSERIAL PRIMARY KEY,
    source_id BIGINT NOT NULL REFERENCES job_sources(id),
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'RUNNING',
    jobs_found INT NOT NULL DEFAULT 0,
    jobs_created INT NOT NULL DEFAULT 0,
    jobs_updated INT NOT NULL DEFAULT 0,
    jobs_expired INT NOT NULL DEFAULT 0,
    error_message TEXT
);

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_source ON jobs(source_id);
CREATE INDEX idx_jobs_published ON jobs(published_at DESC);
CREATE INDEX idx_jobs_last_verified ON jobs(last_verified_at DESC);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX idx_jobs_country ON jobs(country);
CREATE INDEX idx_sync_runs_source ON sync_runs(source_id);
CREATE INDEX idx_sync_runs_started ON sync_runs(started_at DESC);
