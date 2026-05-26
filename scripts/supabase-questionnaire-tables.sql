-- Run once in Supabase: SQL Editor → New query → paste all → Run
-- Creates tables for the career questionnaire + bursary catalogue

CREATE TABLE IF NOT EXISTS "CareerQuestionnaire" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "answers" TEXT NOT NULL DEFAULT '{}',
  "skipped" BOOLEAN NOT NULL DEFAULT false,
  "completedAt" TIMESTAMP(3),
  "bursaryCount" INTEGER,
  "scholarshipCount" INTEGER,
  "matchedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CareerQuestionnaire_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CareerQuestionnaire_userId_key"
  ON "CareerQuestionnaire"("userId");

DO $$ BEGIN
  ALTER TABLE "CareerQuestionnaire"
    ADD CONSTRAINT "CareerQuestionnaire_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "BursaryOpportunity" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "studyFields" TEXT NOT NULL,
  "workSectors" TEXT NOT NULL DEFAULT '["any"]',
  "offersJobAfterGrad" BOOLEAN NOT NULL DEFAULT false,
  "applicationCloses" TIMESTAMP(3) NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BursaryOpportunity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BursaryOpportunity_slug_key"
  ON "BursaryOpportunity"("slug");

CREATE INDEX IF NOT EXISTS "BursaryOpportunity_active_applicationCloses_idx"
  ON "BursaryOpportunity"("active", "applicationCloses");

CREATE INDEX IF NOT EXISTS "BursaryOpportunity_type_idx"
  ON "BursaryOpportunity"("type");
