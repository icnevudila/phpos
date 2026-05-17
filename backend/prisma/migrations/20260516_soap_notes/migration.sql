-- SOAP / progress notes
CREATE TABLE "SoapNote" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "subjective" TEXT NOT NULL DEFAULT '',
    "objective" TEXT NOT NULL DEFAULT '',
    "assessment" TEXT NOT NULL DEFAULT '',
    "plan" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoapNote_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SoapNote_clinicId_idx" ON "SoapNote"("clinicId");
CREATE INDEX "SoapNote_patientId_idx" ON "SoapNote"("patientId");
CREATE INDEX "SoapNote_authorId_idx" ON "SoapNote"("authorId");
CREATE INDEX "SoapNote_createdAt_idx" ON "SoapNote"("createdAt");

ALTER TABLE "SoapNote" ADD CONSTRAINT "SoapNote_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SoapNote" ADD CONSTRAINT "SoapNote_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SoapNote" ADD CONSTRAINT "SoapNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
