-- DEV SEED: Job source configurations (board identifiers are placeholders)
-- Replace board_identifier values with real Greenhouse/Lever/Ashby board slugs
INSERT INTO job_sources (company_id, source_type, board_identifier, enabled)
SELECT c.id, 'GREENHOUSE', 'thoughtworks', TRUE
FROM companies c WHERE c.name = 'Thoughtworks'
ON CONFLICT DO NOTHING;

INSERT INTO job_sources (company_id, source_type, board_identifier, enabled)
SELECT c.id, 'LEVER', 'gojek', TRUE
FROM companies c WHERE c.name = 'Gojek'
ON CONFLICT DO NOTHING;

INSERT INTO job_sources (company_id, source_type, board_identifier, enabled)
SELECT c.id, 'GREENHOUSE', 'freshworks', TRUE
FROM companies c WHERE c.name = 'Freshworks'
ON CONFLICT DO NOTHING;
