-- Run after supabase-newsletter-tables.sql (or if tables already exist).
ALTER TABLE "NewsletterIssue"
  ADD COLUMN IF NOT EXISTS "articleType" TEXT NOT NULL DEFAULT 'main';

ALTER TABLE "NewsletterIssue"
  ADD COLUMN IF NOT EXISTS "industry" TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS "NewsletterIssue_articleType_industry_idx"
  ON "NewsletterIssue"("articleType", "industry");
