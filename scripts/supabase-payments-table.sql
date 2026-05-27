-- Run in Supabase SQL Editor (once) to add payments tracking.

CREATE TABLE IF NOT EXISTS "Payment" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "plan" TEXT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'ZAR',
  "amountDueCents" INTEGER NOT NULL,
  "amountPaidCents" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "provider" TEXT NOT NULL DEFAULT 'yoco',
  "providerChargeId" TEXT,
  "providerTokenId" TEXT,
  "failureReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Payment_userId_createdAt_idx"
  ON "Payment"("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "Payment_status_idx"
  ON "Payment"("status");

DO $$ BEGIN
  ALTER TABLE "Payment"
    ADD CONSTRAINT "Payment_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

