-- Industries ticked on a main weekly brief (JSON string array).
ALTER TABLE "NewsletterIssue"
  ADD COLUMN IF NOT EXISTS "coveredIndustries" TEXT NOT NULL DEFAULT '[]';
