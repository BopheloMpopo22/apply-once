-- Run in Supabase SQL editor after deploying the newsletter track pages.
ALTER TABLE "NewsletterIssue"
  ADD COLUMN IF NOT EXISTS "coveredIndustries" TEXT NOT NULL DEFAULT '[]';
