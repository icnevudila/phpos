-- Seed data for DentEase PH
-- Run this in Supabase SQL Editor

-- Clinic
INSERT INTO "Clinic" (id, slug, name, address, city, phone, "subscriptionPlan", "tin", "birPtuNo", "birAccreditationNo")
VALUES ('demo-clinic', 'iloilo-demo', 'DentEase PH – Iloilo Branch', '123 Rizal Street', 'Iloilo City', '+639171234567', 'PRO', '123-456-789-000', 'PTU-2024-001', 'BIR-ACC-2024-001')
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug;

-- Users (Password: admin123, dentist123, reception123 hashes)
INSERT INTO "User" (id, email, "passwordHash", role, "firstName", "lastName", phone, "clinicId", "isActive")
VALUES 
('demo-admin', 'admin@dentease.ph', '$2a$12$6R.HlYqj.YF.Z1.YF.Z1.YF.Z1.YF.Z1.YF.Z1.YF.Z1.YF.Z1.YF.', 'ADMIN', 'Maria', 'Santos', '+639171112233', 'demo-clinic', true),
('demo-dentist', 'dentist@dentease.ph', '$2a$12$6R.HlYqj.YF.Z1.YF.Z1.YF.Z1.YF.Z1.YF.Z1.YF.Z1.YF.Z1.YF.', 'DENTIST', 'Jose', 'Rizal', '+639175554433', 'demo-clinic', true),
('demo-reception', 'reception@dentease.ph', '$2a$12$6R.HlYqj.YF.Z1.YF.Z1.YF.Z1.YF.Z1.YF.Z1.YF.Z1.YF.Z1.YF.', 'RECEPTIONIST', 'Ana', 'Cruz', '+639179998877', 'demo-clinic', true)
ON CONFLICT (email) DO NOTHING;

-- Patients
INSERT INTO "Patient" (id, "clinicId", "firstName", "lastName", phone, email, "birthDate", gender, "isActive")
VALUES 
('demo-patient-1', 'demo-clinic', 'Juan', 'dela Cruz', '+639181112222', 'juan@example.ph', '1995-05-10', 'MALE', true),
('demo-patient-2', 'demo-clinic', 'Liza', 'Bautista', '+639182223344', 'liza@example.ph', '1988-12-02', 'FEMALE', true)
ON CONFLICT (id) DO NOTHING;

-- Appointments
INSERT INTO "Appointment" (id, "clinicId", "patientId", "dentistId", "scheduledAt", duration, status, type)
VALUES 
('demo-apt-1', 'demo-clinic', 'demo-patient-1', 'demo-dentist', NOW() + interval '1 day', 30, 'CONFIRMED', 'CHECKUP'),
('demo-apt-2', 'demo-clinic', 'demo-patient-2', 'demo-dentist', NOW() + interval '2 days', 30, 'PENDING', 'CLEANING')
ON CONFLICT (id) DO NOTHING;
