-- ============================================================================
-- FAIRSHIFT: Realistic Postgres Seed Script
-- 3 Organizations, 25 Workers, 12 Hazards, 40 Anonymous Feedbacks, Passports
-- ============================================================================

-- 1. Insert 3 Demo Organizations
INSERT INTO organizations (id, name, sector, location, geofence_lat, geofence_lng, geofence_radius_meters, qr_code_secret)
VALUES
('org-sai-constructions', 'Sai Constructions (Guntur site)', 'construction', 'Plot 42, Amaravati Ring Road, Guntur, AP', 16.3067, 80.4365, 400, 'FAIRSHIFT_QR_SAI_GUNTUR_SITE_2026'),
('org-city-care-hospital', 'City Care Hospital', 'hospital', 'Banjara Hills Road No. 12, Hyderabad, TS', 17.4156, 78.4357, 300, 'FAIRSHIFT_QR_CITY_CARE_HOSP_HYD_2026'),
('org-srm-campus-facilities', 'SRM Campus Facilities', 'college', 'Kattankulathur Campus, Chengalpattu Dist, TN', 12.8231, 80.0442, 500, 'FAIRSHIFT_QR_SRM_CAMPUS_KTR_2026')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert 25 Workers
INSERT INTO profiles (id, org_id, full_name, phone, role, trade, daily_wage, preferred_language)
VALUES
('w-ramesh', 'org-sai-constructions', 'Ramesh Kumar', '+91 98480 11221', 'worker', 'Senior Mason', 750.00, 'te'),
('w-suresh', 'org-sai-constructions', 'Suresh Reddy', '+91 98480 22332', 'worker', 'Bar Bending Lead', 800.00, 'te'),
('w-venkat', 'org-sai-constructions', 'Venkat Rao', '+91 98480 33443', 'worker', 'Scaffolding Erector', 700.00, 'te'),
('w-manju', 'org-sai-constructions', 'Manju Devi', '+91 98480 44554', 'worker', 'Civil Construction Helper', 600.00, 'hi'),
('w-rajesh', 'org-sai-constructions', 'Rajesh Varma', '+91 98480 55665', 'worker', 'Heavy Excavator Operator', 950.00, 'hi'),
('w-lakshmi', 'org-sai-constructions', 'Lakshmi Narayana', '+91 98480 66776', 'worker', 'AAC Block Plasterer', 720.00, 'te'),
('w-anil', 'org-sai-constructions', 'Anil Kumar', '+91 98480 77887', 'worker', 'Structural Welder', 850.00, 'hi'),
('w-sunita', 'org-sai-constructions', 'Sunita Kumari', '+91 98480 88998', 'worker', 'Concrete Curing Technician', 650.00, 'hi'),
('w-priya', 'org-city-care-hospital', 'Priya Sharma', '+91 98490 12345', 'worker', 'ICU Ward Attendant', 780.00, 'hi'),
('w-farooq', 'org-city-care-hospital', 'Mohammad Farooq', '+91 98490 23456', 'worker', 'Sanitation & Sterilization Tech', 720.00, 'te'),
('w-deepa', 'org-city-care-hospital', 'Deepa Ananth', '+91 98490 34567', 'worker', 'CSSD Sterile Processing Tech', 820.00, 'en'),
('w-arumugam', 'org-city-care-hospital', 'K. Arumugam', '+91 98490 45678', 'worker', 'Emergency Patient Transport', 680.00, 'ta'),
('w-ananya', 'org-city-care-hospital', 'Ananya Roy', '+91 98490 56789', 'worker', 'Biomedical Waste Specialist', 750.00, 'en'),
('w-vijay', 'org-city-care-hospital', 'Vijay Anand', '+91 98490 67890', 'worker', 'Dialysis Unit Support Attendant', 800.00, 'te'),
('w-meena', 'org-city-care-hospital', 'Meena Bai', '+91 98490 78901', 'worker', 'Isolation Ward Housekeeping', 650.00, 'hi'),
('w-murugan', 'org-srm-campus-facilities', 'R. Murugan', '+91 94440 11111', 'worker', 'Senior Campus Electrician', 850.00, 'ta'),
('w-senthil', 'org-srm-campus-facilities', 'Senthil Kumar', '+91 94440 22222', 'worker', 'Plumbing & RO Plant Tech', 760.00, 'ta'),
('w-kavitha', 'org-srm-campus-facilities', 'Kavitha Sundaram', '+91 94440 33333', 'worker', 'Science Lab Safety Assistant', 780.00, 'ta'),
('w-karthik', 'org-srm-campus-facilities', 'Karthik Selvan', '+91 94440 44444', 'worker', 'Hostel Facilities Maintenance', 690.00, 'ta'),
('w-selvi', 'org-srm-campus-facilities', 'Selvi Natarajan', '+91 94440 55555', 'worker', 'Campus Horticulture & Greenery', 620.00, 'ta'),
('w-thangavel', 'org-srm-campus-facilities', 'Thangavel P.', '+91 94440 66666', 'worker', 'Substation & High-Voltage Panel Tech', 900.00, 'ta'),
('w-vignesh', 'org-srm-campus-facilities', 'Vigneshwaran M.', '+91 94440 77777', 'worker', 'Campus Estate Support Staff', 650.00, 'ta'),
('w-balaji', 'org-srm-campus-facilities', 'Balaji S.', '+91 94440 88888', 'worker', 'Auditorium HVAC & Acoustics Tech', 820.00, 'en'),
('w-parthiban', 'org-srm-campus-facilities', 'G. Parthiban', '+91 94440 99999', 'worker', 'Hostel Central Kitchen Pipeline Tech', 740.00, 'ta'),
('w-revathi', 'org-srm-campus-facilities', 'Revathi K.', '+91 94440 00000', 'worker', 'Sewage & Water Treatment Operator', 750.00, 'ta')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Skill Passports
INSERT INTO skill_passports (id, worker_id, passport_code, total_verified_hours)
VALUES
('pass-ramesh', 'w-ramesh', 'FS-PASS-RAMESH-8842', 1420),
('pass-priya', 'w-priya', 'FS-PASS-PRIYA-7319', 1120),
('pass-murugan', 'w-murugan', 'FS-PASS-MURUGAN-5501', 2150)
ON CONFLICT (id) DO NOTHING;

INSERT INTO skill_entries (id, passport_id, skill_name, sector, issuing_org_name, hours_logged, certification_name, verified)
VALUES
('se-1', 'pass-ramesh', 'Masonry & Plastering (Grade A)', 'construction', 'Sai Constructions (Guntur site)', 980, 'NSDC Level-3 Mason', true),
('se-2', 'pass-ramesh', 'Scaffolding Safety & Fall Protection', 'construction', 'L&T Infrastructure Training Institute', 440, 'OSHA Construction Safety Certified', true),
('se-3', 'pass-priya', 'Biomedical Waste & Infection Control', 'hospital', 'City Care Hospital', 760, 'NABH Hospital Attendant Infection Protocol', true),
('se-4', 'pass-priya', 'Patient Transfer & Stretcher Ergonomics', 'hospital', 'City Care Hospital', 360, 'Basic Life Support (BLS) Allied Assistant', true),
('se-5', 'pass-murugan', 'Industrial 3-Phase Electrical Panels & DG Sets', 'college', 'SRM Campus Facilities', 1650, 'Tamil Nadu Electrical Licensing Board C License', true),
('se-6', 'pass-murugan', 'Transformer Yard & Switchgear Maintenance', 'factory', 'TVS Motor Plant (Hosur)', 500, 'High-Voltage Substation Safety Pass', true)
ON CONFLICT (id) DO NOTHING;
