-- Performance indexes (appointment, payment, treatment, HMO)

CREATE INDEX IF NOT EXISTS "idx_appointment_clinic_scheduled"
  ON "Appointment"("clinicId", "scheduledAt");

CREATE INDEX IF NOT EXISTS "idx_appointment_dentist_status"
  ON "Appointment"("dentistId", "status");

CREATE INDEX IF NOT EXISTS "idx_payment_paidat"
  ON "Payment"("paidAt");

CREATE INDEX IF NOT EXISTS "idx_payment_invoice_paidat"
  ON "Payment"("invoiceId", "paidAt");

CREATE INDEX IF NOT EXISTS "idx_treatment_patient_procedure"
  ON "Treatment"("patientId", "procedure");

CREATE INDEX IF NOT EXISTS "idx_hmoclaim_clinic_status"
  ON "HmoClaim"("clinicId", "status");
