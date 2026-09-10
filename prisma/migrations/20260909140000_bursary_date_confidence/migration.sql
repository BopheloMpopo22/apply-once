-- How sure we are of the dates: official | typical | unknown
ALTER TABLE "BursaryOpportunity"
  ADD COLUMN IF NOT EXISTS "dateConfidence" TEXT NOT NULL DEFAULT 'unknown';
