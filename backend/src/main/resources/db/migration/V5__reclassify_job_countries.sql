-- V5: Reclassify job countries and seed verified active Indian ATS feeds

-- 1. Reclassify existing foreign jobs in the database
UPDATE jobs
SET country = 'Germany'
WHERE location ILIKE '%Germany%' OR location ILIKE '%Hamburg%' OR location ILIKE '%Munich%' OR location ILIKE '%Stuttgart%' OR location ILIKE '%Cologne%' OR location ILIKE '%Berlin%';

UPDATE jobs
SET country = 'United Kingdom'
WHERE location ILIKE '%United Kingdom%' OR location ILIKE '%London%' OR location ILIKE '%Manchester%' OR location ILIKE '%Newcastle%';

UPDATE jobs
SET country = 'Singapore'
WHERE location ILIKE '%Singapore%';

UPDATE jobs
SET country = 'Netherlands'
WHERE location ILIKE '%Netherlands%' OR location ILIKE '%Amsterdam%';

UPDATE jobs
SET country = 'United States'
WHERE location ILIKE '%United States%' OR location ILIKE '%, USA%' OR location ILIKE '%, US%' OR location ILIKE '%Atlanta%' OR location ILIKE '%Chicago%' OR location ILIKE '%Dallas%' OR location ILIKE '%New York%';

UPDATE jobs
SET country = 'Romania'
WHERE location ILIKE '%Romania%' OR location ILIKE '%Bucharest%' OR location ILIKE '%Cluj%' OR location ILIKE '%Iasi%';

UPDATE jobs
SET country = 'Chile'
WHERE location ILIKE '%Chile%' OR location ILIKE '%Santiago%';

UPDATE jobs
SET country = 'Ecuador'
WHERE location ILIKE '%Ecuador%' OR location ILIKE '%Quito%';

UPDATE jobs
SET country = 'Thailand'
WHERE location ILIKE '%Thailand%' OR location ILIKE '%Bangkok%';

UPDATE jobs
SET country = 'Brazil'
WHERE location ILIKE '%Brazil%' OR location ILIKE '%Porto Alegre%';

UPDATE jobs
SET country = 'Vietnam'
WHERE location ILIKE '%Vietnam%' OR location ILIKE '%Ho Chi Minh%';

UPDATE jobs
SET country = 'Spain'
WHERE location ILIKE '%Spain%' OR location ILIKE '%Barcelona%' OR location ILIKE '%Madrid%';

UPDATE jobs
SET country = 'China'
WHERE location ILIKE '%China%' OR location ILIKE '%Xi''an%';

-- 2. Blank, null or unanchored Remote locations classified as Unknown
UPDATE jobs
SET country = 'Unknown'
WHERE (location IS NULL OR TRIM(location) = '' OR TRIM(location) ILIKE 'Remote' OR TRIM(location) ILIKE 'Global')
  AND (country = 'India' OR country IS NULL);

-- 3. Confirm genuine India locations
UPDATE jobs
SET country = 'India'
WHERE (location ILIKE '%India%' OR location ILIKE '%Bengaluru%' OR location ILIKE '%Bangalore%'
    OR location ILIKE '%Hyderabad%' OR location ILIKE '%Secunderabad%'
    OR location ILIKE '%Pune%' OR location ILIKE '%Chennai%' OR location ILIKE '%Mumbai%'
    OR location ILIKE '%Delhi%' OR location ILIKE '%Noida%' OR location ILIKE '%Gurgaon%'
    OR location ILIKE '%Gurugram%' OR location ILIKE '%Kolkata%' OR location ILIKE '%Ahmedabad%'
    OR location ILIKE '%Kochi%' OR location ILIKE '%Coimbatore%' OR location ILIKE '%Chandigarh%');

-- 4. Seed verified active Indian company ATS feeds
INSERT INTO companies (name, logo_url, careers_url) VALUES
('InMobi', 'https://www.inmobi.com/favicon.ico', 'https://www.inmobi.com/company/careers'),
('Druva', 'https://www.druva.com/favicon.ico', 'https://www.druva.com/about/careers'),
('Instawork', 'https://www.instawork.com/favicon.ico', 'https://www.instawork.com/careers')
ON CONFLICT (name) DO NOTHING;

INSERT INTO job_sources (company_id, source_type, board_identifier, enabled)
SELECT c.id, 'GREENHOUSE', 'inmobi', TRUE
FROM companies c WHERE c.name = 'InMobi'
ON CONFLICT DO NOTHING;

INSERT INTO job_sources (company_id, source_type, board_identifier, enabled)
SELECT c.id, 'GREENHOUSE', 'druva', TRUE
FROM companies c WHERE c.name = 'Druva'
ON CONFLICT DO NOTHING;

INSERT INTO job_sources (company_id, source_type, board_identifier, enabled)
SELECT c.id, 'GREENHOUSE', 'instawork', TRUE
FROM companies c WHERE c.name = 'Instawork'
ON CONFLICT DO NOTHING;
