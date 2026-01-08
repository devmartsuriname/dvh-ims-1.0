-- ============================================================
-- PHASE 7: CONTROLLED TEST DATA SEEDING
-- ============================================================
-- Purpose: Seed realistic test data for QA validation
-- All test data is clearly marked with TEST- prefix
-- Distribution: Multi-month (Jan-Dec 2025), Multi-district
-- Edge cases: Sipaliwini (0), Marowijne (1), Paramaribo (high)
-- ============================================================

-- ============================================================
-- 1. INSERT TEST PERSONS (25 records)
-- ============================================================
INSERT INTO person (national_id, first_name, last_name, gender, date_of_birth, nationality, created_by)
VALUES
  ('TEST-PM-001', 'Johan', 'Verwey', 'male', '1985-03-15', 'Surinaams', NULL),
  ('TEST-PM-002', 'Maria', 'Jansen', 'female', '1990-07-22', 'Surinaams', NULL),
  ('TEST-PM-003', 'Ricardo', 'Chin', 'male', '1978-11-08', 'Surinaams', NULL),
  ('TEST-PM-004', 'Amina', 'Soekhlal', 'female', '1992-04-30', 'Surinaams', NULL),
  ('TEST-PM-005', 'Bryan', 'Monsanto', 'male', '1988-09-12', 'Surinaams', NULL),
  ('TEST-PM-006', 'Priya', 'Ramdas', 'female', '1995-01-25', 'Surinaams', NULL),
  ('TEST-PM-007', 'Kevin', 'Boldewijn', 'male', '1983-06-18', 'Surinaams', NULL),
  ('TEST-PM-008', 'Sharmila', 'Tewari', 'female', '1991-12-03', 'Surinaams', NULL),
  ('TEST-WA-001', 'Andre', 'Pengel', 'male', '1987-02-14', 'Surinaams', NULL),
  ('TEST-WA-002', 'Radha', 'Doerga', 'female', '1993-08-27', 'Surinaams', NULL),
  ('TEST-WA-003', 'Clifton', 'Afonsoewa', 'male', '1980-05-09', 'Surinaams', NULL),
  ('TEST-WA-004', 'Anita', 'Ramautar', 'female', '1989-10-21', 'Surinaams', NULL),
  ('TEST-WA-005', 'Deryck', 'Vrede', 'male', '1994-03-06', 'Surinaams', NULL),
  ('TEST-NI-001', 'Radjesh', 'Narain', 'male', '1986-07-11', 'Surinaams', NULL),
  ('TEST-NI-002', 'Kavita', 'Bhagwandas', 'female', '1991-11-28', 'Surinaams', NULL),
  ('TEST-NI-003', 'Winston', 'Faerber', 'male', '1982-04-16', 'Surinaams', NULL),
  ('TEST-SA-001', 'Henk', 'Julen', 'male', '1984-09-23', 'Surinaams', NULL),
  ('TEST-SA-002', 'Mireille', 'Kenswil', 'female', '1996-02-07', 'Surinaams', NULL),
  ('TEST-SA-003', 'Ruben', 'Graanoogst', 'male', '1979-12-19', 'Surinaams', NULL),
  ('TEST-CM-001', 'Franklin', 'Wolff', 'male', '1988-06-04', 'Surinaams', NULL),
  ('TEST-CM-002', 'Reshma', 'Haripersad', 'female', '1993-01-31', 'Surinaams', NULL),
  ('TEST-PA-001', 'Stanley', 'Emanuels', 'male', '1981-08-15', 'Surinaams', NULL),
  ('TEST-PA-002', 'Linda', 'Kasanpawiro', 'female', '1990-05-22', 'Surinaams', NULL),
  ('TEST-CO-001', 'Gerald', 'Schmeltz', 'male', '1976-03-28', 'Surinaams', NULL),
  ('TEST-MA-001', 'Marciano', 'Belfor', 'male', '1985-10-14', 'Surinaams', NULL);

-- ============================================================
-- 2. INSERT TEST HOUSEHOLDS (25 records)
-- ============================================================
INSERT INTO household (primary_person_id, district_code, household_size)
SELECT id, 'PM', 4 FROM person WHERE national_id = 'TEST-PM-001'
UNION ALL SELECT id, 'PM', 2 FROM person WHERE national_id = 'TEST-PM-002'
UNION ALL SELECT id, 'PM', 5 FROM person WHERE national_id = 'TEST-PM-003'
UNION ALL SELECT id, 'PM', 3 FROM person WHERE national_id = 'TEST-PM-004'
UNION ALL SELECT id, 'PM', 1 FROM person WHERE national_id = 'TEST-PM-005'
UNION ALL SELECT id, 'PM', 6 FROM person WHERE national_id = 'TEST-PM-006'
UNION ALL SELECT id, 'PM', 2 FROM person WHERE national_id = 'TEST-PM-007'
UNION ALL SELECT id, 'PM', 4 FROM person WHERE national_id = 'TEST-PM-008'
UNION ALL SELECT id, 'WA', 3 FROM person WHERE national_id = 'TEST-WA-001'
UNION ALL SELECT id, 'WA', 5 FROM person WHERE national_id = 'TEST-WA-002'
UNION ALL SELECT id, 'WA', 2 FROM person WHERE national_id = 'TEST-WA-003'
UNION ALL SELECT id, 'WA', 4 FROM person WHERE national_id = 'TEST-WA-004'
UNION ALL SELECT id, 'WA', 1 FROM person WHERE national_id = 'TEST-WA-005'
UNION ALL SELECT id, 'NI', 3 FROM person WHERE national_id = 'TEST-NI-001'
UNION ALL SELECT id, 'NI', 4 FROM person WHERE national_id = 'TEST-NI-002'
UNION ALL SELECT id, 'NI', 2 FROM person WHERE national_id = 'TEST-NI-003'
UNION ALL SELECT id, 'SA', 5 FROM person WHERE national_id = 'TEST-SA-001'
UNION ALL SELECT id, 'SA', 3 FROM person WHERE national_id = 'TEST-SA-002'
UNION ALL SELECT id, 'SA', 2 FROM person WHERE national_id = 'TEST-SA-003'
UNION ALL SELECT id, 'CM', 4 FROM person WHERE national_id = 'TEST-CM-001'
UNION ALL SELECT id, 'CM', 3 FROM person WHERE national_id = 'TEST-CM-002'
UNION ALL SELECT id, 'PA', 2 FROM person WHERE national_id = 'TEST-PA-001'
UNION ALL SELECT id, 'PA', 5 FROM person WHERE national_id = 'TEST-PA-002'
UNION ALL SELECT id, 'CO', 3 FROM person WHERE national_id = 'TEST-CO-001'
UNION ALL SELECT id, 'MA', 4 FROM person WHERE national_id = 'TEST-MA-001';

-- ============================================================
-- 3. INSERT TEST HOUSING REGISTRATIONS (40 records)
-- ============================================================
INSERT INTO housing_registration (
  applicant_person_id, 
  household_id, 
  district_code, 
  reference_number, 
  current_status, 
  registration_date,
  housing_type_preference,
  urgency_score,
  waiting_list_position
)
SELECT p.id, h.id, 'PM', 'HR-PM-2025-001', 'received', '2025-01-15 10:00:00+00'::timestamptz, 'apartment', 45, 1
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-001'
UNION ALL
SELECT p.id, h.id, 'PM', 'HR-PM-2025-002', 'approved', '2025-02-10 11:30:00+00'::timestamptz, 'house', 72, 2
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-002'
UNION ALL
SELECT p.id, h.id, 'PM', 'HR-PM-2025-003', 'rejected', '2025-02-22 09:15:00+00'::timestamptz, 'apartment', 25, NULL
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-003'
UNION ALL
SELECT p.id, h.id, 'PM', 'HR-PM-2025-004', 'allocated', '2025-03-05 14:00:00+00'::timestamptz, 'house', 88, NULL
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-004'
UNION ALL
SELECT p.id, h.id, 'PM', 'HR-PM-2025-005', 'received', '2025-04-18 08:45:00+00'::timestamptz, 'apartment', 55, 3
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-005'
UNION ALL
SELECT p.id, h.id, 'PM', 'HR-PM-2025-006', 'approved', '2025-05-02 16:20:00+00'::timestamptz, 'house', 67, 4
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-006'
UNION ALL
SELECT p.id, h.id, 'PM', 'HR-PM-2025-007', 'received', '2025-06-14 10:30:00+00'::timestamptz, 'apartment', 38, 5
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-007'
UNION ALL
SELECT p.id, h.id, 'PM', 'HR-PM-2025-008', 'rejected', '2025-07-21 13:00:00+00'::timestamptz, 'house', 22, NULL
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-008'
UNION ALL
SELECT p.id, h.id, 'PM', 'HR-PM-2025-009', 'approved', '2025-08-08 09:00:00+00'::timestamptz, 'apartment', 78, 6
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-001'
UNION ALL
SELECT p.id, h.id, 'PM', 'HR-PM-2025-010', 'allocated', '2025-09-12 11:45:00+00'::timestamptz, 'house', 92, NULL
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-002'
UNION ALL
SELECT p.id, h.id, 'PM', 'HR-PM-2025-011', 'received', '2025-10-25 14:30:00+00'::timestamptz, 'apartment', 42, 7
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-003'
UNION ALL
SELECT p.id, h.id, 'PM', 'HR-PM-2025-012', 'approved', '2025-11-30 10:15:00+00'::timestamptz, 'house', 65, 8
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-004'
UNION ALL
SELECT p.id, h.id, 'WA', 'HR-WA-2025-001', 'received', '2025-01-22 09:00:00+00'::timestamptz, 'house', 48, 9
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-WA-001'
UNION ALL
SELECT p.id, h.id, 'WA', 'HR-WA-2025-002', 'approved', '2025-03-15 11:00:00+00'::timestamptz, 'apartment', 71, 10
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-WA-002'
UNION ALL
SELECT p.id, h.id, 'WA', 'HR-WA-2025-003', 'rejected', '2025-04-28 14:30:00+00'::timestamptz, 'house', 28, NULL
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-WA-003'
UNION ALL
SELECT p.id, h.id, 'WA', 'HR-WA-2025-004', 'received', '2025-05-19 10:00:00+00'::timestamptz, 'apartment', 52, 11
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-WA-004'
UNION ALL
SELECT p.id, h.id, 'WA', 'HR-WA-2025-005', 'allocated', '2025-06-30 15:00:00+00'::timestamptz, 'house', 85, NULL
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-WA-005'
UNION ALL
SELECT p.id, h.id, 'WA', 'HR-WA-2025-006', 'approved', '2025-08-14 09:30:00+00'::timestamptz, 'apartment', 63, 12
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-WA-001'
UNION ALL
SELECT p.id, h.id, 'WA', 'HR-WA-2025-007', 'received', '2025-10-05 11:15:00+00'::timestamptz, 'house', 44, 13
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-WA-002'
UNION ALL
SELECT p.id, h.id, 'WA', 'HR-WA-2025-008', 'rejected', '2025-12-01 13:00:00+00'::timestamptz, 'apartment', 31, NULL
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-WA-003'
UNION ALL
SELECT p.id, h.id, 'NI', 'HR-NI-2025-001', 'received', '2025-02-05 10:00:00+00'::timestamptz, 'house', 56, 14
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-NI-001'
UNION ALL
SELECT p.id, h.id, 'NI', 'HR-NI-2025-002', 'approved', '2025-04-12 14:00:00+00'::timestamptz, 'apartment', 74, 15
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-NI-002'
UNION ALL
SELECT p.id, h.id, 'NI', 'HR-NI-2025-003', 'rejected', '2025-06-22 09:30:00+00'::timestamptz, 'house', 19, NULL
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-NI-003'
UNION ALL
SELECT p.id, h.id, 'NI', 'HR-NI-2025-004', 'received', '2025-09-08 11:00:00+00'::timestamptz, 'apartment', 61, 16
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-NI-001'
UNION ALL
SELECT p.id, h.id, 'NI', 'HR-NI-2025-005', 'allocated', '2025-11-15 15:30:00+00'::timestamptz, 'house', 89, NULL
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-NI-002'
UNION ALL
SELECT p.id, h.id, 'SA', 'HR-SA-2025-001', 'received', '2025-01-28 09:00:00+00'::timestamptz, 'house', 47, 17
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-SA-001'
UNION ALL
SELECT p.id, h.id, 'SA', 'HR-SA-2025-002', 'approved', '2025-03-22 13:00:00+00'::timestamptz, 'apartment', 69, 18
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-SA-002'
UNION ALL
SELECT p.id, h.id, 'SA', 'HR-SA-2025-003', 'rejected', '2025-05-30 10:30:00+00'::timestamptz, 'house', 24, NULL
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-SA-003'
UNION ALL
SELECT p.id, h.id, 'SA', 'HR-SA-2025-004', 'received', '2025-08-18 14:00:00+00'::timestamptz, 'apartment', 58, 19
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-SA-001'
UNION ALL
SELECT p.id, h.id, 'SA', 'HR-SA-2025-005', 'approved', '2025-10-28 11:30:00+00'::timestamptz, 'house', 76, 20
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-SA-002'
UNION ALL
SELECT p.id, h.id, 'CM', 'HR-CM-2025-001', 'received', '2025-02-18 10:00:00+00'::timestamptz, 'house', 51, 21
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-CM-001'
UNION ALL
SELECT p.id, h.id, 'CM', 'HR-CM-2025-002', 'rejected', '2025-07-05 14:30:00+00'::timestamptz, 'apartment', 27, NULL
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-CM-002'
UNION ALL
SELECT p.id, h.id, 'CM', 'HR-CM-2025-003', 'allocated', '2025-11-22 09:00:00+00'::timestamptz, 'house', 83, NULL
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-CM-001'
UNION ALL
SELECT p.id, h.id, 'PA', 'HR-PA-2025-001', 'received', '2025-03-10 11:00:00+00'::timestamptz, 'apartment', 49, 22
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PA-001'
UNION ALL
SELECT p.id, h.id, 'PA', 'HR-PA-2025-002', 'approved', '2025-06-25 15:00:00+00'::timestamptz, 'house', 70, 23
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PA-002'
UNION ALL
SELECT p.id, h.id, 'PA', 'HR-PA-2025-003', 'rejected', '2025-09-30 10:30:00+00'::timestamptz, 'apartment', 33, NULL
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PA-001'
UNION ALL
SELECT p.id, h.id, 'CO', 'HR-CO-2025-001', 'received', '2025-04-05 09:00:00+00'::timestamptz, 'house', 54, 24
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-CO-001'
UNION ALL
SELECT p.id, h.id, 'CO', 'HR-CO-2025-002', 'approved', '2025-08-28 13:30:00+00'::timestamptz, 'apartment', 66, 25
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-CO-001'
UNION ALL
SELECT p.id, h.id, 'MA', 'HR-MA-2025-001', 'received', '2025-05-12 10:00:00+00'::timestamptz, 'house', 59, 26
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-MA-001';

-- ============================================================
-- 4. INSERT TEST SUBSIDY CASES (50 records)
-- ============================================================
INSERT INTO subsidy_case (
  applicant_person_id,
  household_id,
  district_code,
  case_number,
  status,
  requested_amount,
  approved_amount,
  rejection_reason,
  created_at
)
SELECT p.id, h.id, 'PM', 'BS-PM-2025-001', 'received', 25000.00, NULL, NULL, '2025-01-10 09:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-001'
UNION ALL
SELECT p.id, h.id, 'PM', 'BS-PM-2025-002', 'approved', 35000.00, 32000.00, NULL, '2025-01-25 11:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-002'
UNION ALL
SELECT p.id, h.id, 'PM', 'BS-PM-2025-003', 'rejected', 50000.00, NULL, 'Income exceeds threshold', '2025-02-08 14:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-003'
UNION ALL
SELECT p.id, h.id, 'PM', 'BS-PM-2025-004', 'approved', 28000.00, 28000.00, NULL, '2025-02-20 10:30:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-004'
UNION ALL
SELECT p.id, h.id, 'PM', 'BS-PM-2025-005', 'received', 42000.00, NULL, NULL, '2025-03-12 09:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-005'
UNION ALL
SELECT p.id, h.id, 'PM', 'BS-PM-2025-006', 'pending_documents', 31000.00, NULL, NULL, '2025-03-28 15:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-006'
UNION ALL
SELECT p.id, h.id, 'PM', 'BS-PM-2025-007', 'approved', 45000.00, 40000.00, NULL, '2025-04-15 11:30:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-007'
UNION ALL
SELECT p.id, h.id, 'PM', 'BS-PM-2025-008', 'rejected', 55000.00, NULL, 'Incomplete documentation', '2025-05-02 09:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-008'
UNION ALL
SELECT p.id, h.id, 'PM', 'BS-PM-2025-009', 'received', 38000.00, NULL, NULL, '2025-06-18 14:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-001'
UNION ALL
SELECT p.id, h.id, 'PM', 'BS-PM-2025-010', 'approved', 29000.00, 29000.00, NULL, '2025-07-08 10:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-002'
UNION ALL
SELECT p.id, h.id, 'PM', 'BS-PM-2025-011', 'received', 47000.00, NULL, NULL, '2025-08-22 11:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-003'
UNION ALL
SELECT p.id, h.id, 'PM', 'BS-PM-2025-012', 'rejected', 33000.00, NULL, 'Property not eligible', '2025-09-15 09:30:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-004'
UNION ALL
SELECT p.id, h.id, 'PM', 'BS-PM-2025-013', 'approved', 26000.00, 26000.00, NULL, '2025-10-05 14:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-005'
UNION ALL
SELECT p.id, h.id, 'PM', 'BS-PM-2025-014', 'received', 41000.00, NULL, NULL, '2025-11-12 10:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-006'
UNION ALL
SELECT p.id, h.id, 'PM', 'BS-PM-2025-015', 'approved', 36000.00, 34000.00, NULL, '2025-12-01 11:30:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PM-007'
UNION ALL
SELECT p.id, h.id, 'WA', 'BS-WA-2025-001', 'received', 27000.00, NULL, NULL, '2025-01-18 09:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-WA-001'
UNION ALL
SELECT p.id, h.id, 'WA', 'BS-WA-2025-002', 'approved', 39000.00, 37000.00, NULL, '2025-02-28 11:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-WA-002'
UNION ALL
SELECT p.id, h.id, 'WA', 'BS-WA-2025-003', 'rejected', 48000.00, NULL, 'Previous subsidy received', '2025-04-08 14:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-WA-003'
UNION ALL
SELECT p.id, h.id, 'WA', 'BS-WA-2025-004', 'received', 32000.00, NULL, NULL, '2025-05-22 10:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-WA-004'
UNION ALL
SELECT p.id, h.id, 'WA', 'BS-WA-2025-005', 'pending_documents', 44000.00, NULL, NULL, '2025-06-12 09:30:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-WA-005'
UNION ALL
SELECT p.id, h.id, 'WA', 'BS-WA-2025-006', 'approved', 30000.00, 30000.00, NULL, '2025-07-25 11:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-WA-001'
UNION ALL
SELECT p.id, h.id, 'WA', 'BS-WA-2025-007', 'received', 37000.00, NULL, NULL, '2025-08-30 14:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-WA-002'
UNION ALL
SELECT p.id, h.id, 'WA', 'BS-WA-2025-008', 'rejected', 52000.00, NULL, 'Fraudulent application', '2025-10-15 10:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-WA-003'
UNION ALL
SELECT p.id, h.id, 'WA', 'BS-WA-2025-009', 'approved', 34000.00, 32000.00, NULL, '2025-11-08 09:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-WA-004'
UNION ALL
SELECT p.id, h.id, 'WA', 'BS-WA-2025-010', 'received', 40000.00, NULL, NULL, '2025-12-18 11:30:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-WA-005'
UNION ALL
SELECT p.id, h.id, 'NI', 'BS-NI-2025-001', 'received', 28000.00, NULL, NULL, '2025-01-30 09:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-NI-001'
UNION ALL
SELECT p.id, h.id, 'NI', 'BS-NI-2025-002', 'approved', 43000.00, 41000.00, NULL, '2025-03-18 11:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-NI-002'
UNION ALL
SELECT p.id, h.id, 'NI', 'BS-NI-2025-003', 'received', 35000.00, NULL, NULL, '2025-05-05 14:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-NI-003'
UNION ALL
SELECT p.id, h.id, 'NI', 'BS-NI-2025-004', 'rejected', 46000.00, NULL, 'Non-resident applicant', '2025-06-28 10:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-NI-001'
UNION ALL
SELECT p.id, h.id, 'NI', 'BS-NI-2025-005', 'approved', 31000.00, 31000.00, NULL, '2025-08-12 09:30:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-NI-002'
UNION ALL
SELECT p.id, h.id, 'NI', 'BS-NI-2025-006', 'pending_documents', 49000.00, NULL, NULL, '2025-09-25 11:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-NI-003'
UNION ALL
SELECT p.id, h.id, 'NI', 'BS-NI-2025-007', 'received', 33000.00, NULL, NULL, '2025-11-02 14:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-NI-001'
UNION ALL
SELECT p.id, h.id, 'NI', 'BS-NI-2025-008', 'approved', 38000.00, 36000.00, NULL, '2025-12-10 10:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-NI-002'
UNION ALL
SELECT p.id, h.id, 'SA', 'BS-SA-2025-001', 'received', 26000.00, NULL, NULL, '2025-02-12 09:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-SA-001'
UNION ALL
SELECT p.id, h.id, 'SA', 'BS-SA-2025-002', 'approved', 42000.00, 40000.00, NULL, '2025-04-22 11:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-SA-002'
UNION ALL
SELECT p.id, h.id, 'SA', 'BS-SA-2025-003', 'received', 36000.00, NULL, NULL, '2025-06-08 14:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-SA-003'
UNION ALL
SELECT p.id, h.id, 'SA', 'BS-SA-2025-004', 'rejected', 51000.00, NULL, 'Age requirement not met', '2025-08-02 10:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-SA-001'
UNION ALL
SELECT p.id, h.id, 'SA', 'BS-SA-2025-005', 'approved', 29000.00, 29000.00, NULL, '2025-10-18 09:30:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-SA-002'
UNION ALL
SELECT p.id, h.id, 'SA', 'BS-SA-2025-006', 'received', 44000.00, NULL, NULL, '2025-12-05 11:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-SA-003'
UNION ALL
SELECT p.id, h.id, 'CM', 'BS-CM-2025-001', 'received', 30000.00, NULL, NULL, '2025-03-05 09:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-CM-001'
UNION ALL
SELECT p.id, h.id, 'CM', 'BS-CM-2025-002', 'approved', 47000.00, 45000.00, NULL, '2025-05-28 11:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-CM-002'
UNION ALL
SELECT p.id, h.id, 'CM', 'BS-CM-2025-003', 'pending_documents', 34000.00, NULL, NULL, '2025-08-20 14:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-CM-001'
UNION ALL
SELECT p.id, h.id, 'CM', 'BS-CM-2025-004', 'received', 39000.00, NULL, NULL, '2025-11-28 10:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-CM-002'
UNION ALL
SELECT p.id, h.id, 'PA', 'BS-PA-2025-001', 'received', 32000.00, NULL, NULL, '2025-04-02 09:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PA-001'
UNION ALL
SELECT p.id, h.id, 'PA', 'BS-PA-2025-002', 'approved', 46000.00, 44000.00, NULL, '2025-07-15 11:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PA-002'
UNION ALL
SELECT p.id, h.id, 'PA', 'BS-PA-2025-003', 'rejected', 53000.00, NULL, 'Duplicate application', '2025-10-30 14:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-PA-001'
UNION ALL
SELECT p.id, h.id, 'CO', 'BS-CO-2025-001', 'received', 27000.00, NULL, NULL, '2025-05-15 09:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-CO-001'
UNION ALL
SELECT p.id, h.id, 'CO', 'BS-CO-2025-002', 'approved', 41000.00, 39000.00, NULL, '2025-09-08 11:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-CO-001'
UNION ALL
SELECT p.id, h.id, 'MA', 'BS-MA-2025-001', 'pending_documents', 35000.00, NULL, NULL, '2025-06-22 14:00:00+00'::timestamptz
FROM person p JOIN household h ON h.primary_person_id = p.id WHERE p.national_id = 'TEST-MA-001';