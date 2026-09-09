-- Live catalogue health fields + apply-pack tasks (run in Supabase SQL editor).
ALTER TABLE "BursaryOpportunity"
  ADD COLUMN IF NOT EXISTS "lastCheckedAt" TIMESTAMP(3);
ALTER TABLE "BursaryOpportunity"
  ADD COLUMN IF NOT EXISTS "lastVerifiedAt" TIMESTAMP(3);
ALTER TABLE "BursaryOpportunity"
  ADD COLUMN IF NOT EXISTS "linkStatus" TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE "BursaryOpportunity"
  ADD COLUMN IF NOT EXISTS "linkStatusDetail" TEXT;
ALTER TABLE "BursaryOpportunity"
  ADD COLUMN IF NOT EXISTS "needsReview" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "BursaryOpportunity_needsReview_idx"
  ON "BursaryOpportunity"("needsReview");

CREATE TABLE IF NOT EXISTS "BursaryApplyTask" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "bursaryId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'queued',
  "blockReasons" TEXT NOT NULL DEFAULT '[]',
  "notes" TEXT,
  "lastOpenedAt" TIMESTAMP(3),
  "submittedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BursaryApplyTask_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BursaryApplyTask_userId_bursaryId_key"
  ON "BursaryApplyTask"("userId", "bursaryId");

CREATE INDEX IF NOT EXISTS "BursaryApplyTask_userId_status_idx"
  ON "BursaryApplyTask"("userId", "status");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'BursaryApplyTask_userId_fkey'
  ) THEN
    ALTER TABLE "BursaryApplyTask"
      ADD CONSTRAINT "BursaryApplyTask_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'BursaryApplyTask_bursaryId_fkey'
  ) THEN
    ALTER TABLE "BursaryApplyTask"
      ADD CONSTRAINT "BursaryApplyTask_bursaryId_fkey"
      FOREIGN KEY ("bursaryId") REFERENCES "BursaryOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
