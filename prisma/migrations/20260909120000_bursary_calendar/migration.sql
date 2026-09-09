-- Bursary calendar fields (opening date optional — never invent it).
ALTER TABLE "BursaryOpportunity"
  ADD COLUMN IF NOT EXISTS "applicationOpens" TIMESTAMP(3);
ALTER TABLE "BursaryOpportunity"
  ADD COLUMN IF NOT EXISTS "nextExpectedOpens" TIMESTAMP(3);
ALTER TABLE "BursaryOpportunity"
  ADD COLUMN IF NOT EXISTS "studyLevels" TEXT NOT NULL DEFAULT '["undergraduate"]';
ALTER TABLE "BursaryOpportunity"
  ADD COLUMN IF NOT EXISTS "coverage" TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE "BursaryOpportunity"
  ADD COLUMN IF NOT EXISTS "region" TEXT NOT NULL DEFAULT 'nationwide';
ALTER TABLE "BursaryOpportunity"
  ADD COLUMN IF NOT EXISTS "eligibility" TEXT;
ALTER TABLE "BursaryOpportunity"
  ADD COLUMN IF NOT EXISTS "requiredDocs" TEXT;

-- Previous daily checks unpublished expired bursaries. Keep them on the calendar as Closed.
UPDATE "BursaryOpportunity"
SET "active" = true
WHERE "active" = false
  AND "applicationCloses" < CURRENT_TIMESTAMP;
