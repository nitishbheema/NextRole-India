-- DEV SEED DATA: India-focused companies that use supported ATS platforms
-- These use public, unauthenticated API endpoints. Replace board identifiers with real ones before production.
INSERT INTO companies (name, logo_url, careers_url) VALUES
('Thoughtworks', 'https://www.thoughtworks.com/favicon.ico', 'https://www.thoughtworks.com/en-in/careers'),
('Gojek', NULL, 'https://www.gojek.io/careers'),
('Freshworks', 'https://www.freshworks.com/favicon.ico', 'https://www.freshworks.com/company/careers/'),
('PhonePe', NULL, 'https://www.phonepe.com/careers/'),
('Razorpay', NULL, 'https://razorpay.com/jobs/'),
('CRED', NULL, 'https://careers.cred.club/')
ON CONFLICT (name) DO NOTHING;
