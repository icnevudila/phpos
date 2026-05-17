-- Patient: loyalty points + family link (schema sync)

ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "loyaltyPoints" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "familyId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Patient_familyId_fkey'
  ) THEN
    ALTER TABLE "Patient"
      ADD CONSTRAINT "Patient_familyId_fkey"
      FOREIGN KEY ("familyId") REFERENCES "Family"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Patient_familyId_idx" ON "Patient"("familyId");
