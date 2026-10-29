-- V6: Ensure verified Greenhouse sources are enabled and inactive placeholders disabled
INSERT INTO companies (name, logo_url, careers_url) VALUES
('InMobi', 'https://www.inmobi.com/favicon.ico', 'https://www.inmobi.com/company/careers'),
('Druva', 'https://www.druva.com/favicon.ico', 'https://www.druva.com/about/careers'),
('Instawork', 'https://www.instawork.com/favicon.ico', 'https://www.instawork.com/careers')
ON CONFLICT (name) DO NOTHING;

INSERT INTO job_sources (company_id, source_type, board_identifier, enabled)
SELECT c.id, 'GREENHOUSE', 'inmobi', TRUE
FROM companies c WHERE c.name = 'InMobi'
ON CONFLICT (company_id, source_type, board_identifier) DO UPDATE SET enabled = TRUE;

INSERT INTO job_sources (company_id, source_type, board_identifier, enabled)
SELECT c.id, 'GREENHOUSE', 'druva', TRUE
FROM companies c WHERE c.name = 'Druva'
ON CONFLICT (company_id, source_type, board_identifier) DO UPDATE SET enabled = TRUE;

INSERT INTO job_sources (company_id, source_type, board_identifier, enabled)
SELECT c.id, 'GREENHOUSE', 'instawork', TRUE
FROM companies c WHERE c.name = 'Instawork'
ON CONFLICT (company_id, source_type, board_identifier) DO UPDATE SET enabled = TRUE;

INSERT INTO job_sources (company_id, source_type, board_identifier, enabled)
SELECT c.id, 'GREENHOUSE', 'thoughtworks', TRUE
FROM companies c WHERE c.name = 'Thoughtworks'
ON CONFLICT (company_id, source_type, board_identifier) DO UPDATE SET enabled = TRUE;

UPDATE job_sources SET enabled = FALSE
WHERE board_identifier IN ('gojek', 'freshworks');
