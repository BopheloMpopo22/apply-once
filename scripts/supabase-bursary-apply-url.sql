-- Run in Supabase SQL Editor if BursaryOpportunity already exists without applyUrl
ALTER TABLE "BursaryOpportunity" ADD COLUMN IF NOT EXISTS "applyUrl" TEXT;
