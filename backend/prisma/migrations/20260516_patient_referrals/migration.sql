-- Patient outbound referrals
CREATE TABLE "PatientReferral" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "referredTo" TEXT NOT NULL DEFAULT '',
    "specialty" TEXT NOT NULL DEFAULT '',
    "reason" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientReferral_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PatientReferral_clinicId_idx" ON "PatientReferral"("clinicId");
CREATE INDEX "PatientReferral_patientId_idx" ON "PatientReferral"("patientId");
CREATE INDEX "PatientReferral_authorId_idx" ON "PatientReferral"("authorId");
CREATE INDEX "PatientReferral_createdAt_idx" ON "PatientReferral"("createdAt");

ALTER TABLE "PatientReferral" ADD CONSTRAINT "PatientReferral_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PatientReferral" ADD CONSTRAINT "PatientReferral_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PatientReferral" ADD CONSTRAINT "PatientReferral_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
