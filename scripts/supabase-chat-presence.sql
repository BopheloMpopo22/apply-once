-- Presence + chat read receipts (run in Supabase SQL editor).
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "lastSeenAt" TIMESTAMP(3);

ALTER TABLE "ChatMessage"
  ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "ChatMessage_userId_sender_readAt_idx"
  ON "ChatMessage"("userId", "sender", "readAt");
