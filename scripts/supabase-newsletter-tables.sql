CREATE TABLE IF NOT EXISTS "NewsletterSubscriber" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "accessToken" TEXT NOT NULL,
  "unsubscribedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscriber_email_key"
  ON "NewsletterSubscriber"("email");

CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscriber_accessToken_key"
  ON "NewsletterSubscriber"("accessToken");

CREATE INDEX IF NOT EXISTS "NewsletterSubscriber_createdAt_idx"
  ON "NewsletterSubscriber"("createdAt");

CREATE TABLE IF NOT EXISTS "NewsletterIssue" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "kicker" TEXT NOT NULL DEFAULT '',
  "summary" TEXT NOT NULL DEFAULT '',
  "body" TEXT NOT NULL DEFAULT '',
  "issueNumber" INTEGER NOT NULL,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "publishedAt" TIMESTAMP(3),
  "emailSentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "NewsletterIssue_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterIssue_slug_key"
  ON "NewsletterIssue"("slug");

CREATE INDEX IF NOT EXISTS "NewsletterIssue_published_publishedAt_idx"
  ON "NewsletterIssue"("published", "publishedAt");

CREATE INDEX IF NOT EXISTS "NewsletterIssue_issueNumber_idx"
  ON "NewsletterIssue"("issueNumber");
