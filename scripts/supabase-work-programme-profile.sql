CREATE TABLE IF NOT EXISTS "WorkProgrammeProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "stage" TEXT NOT NULL,
  "province" TEXT NOT NULL,
  "locationDetail" TEXT NOT NULL DEFAULT '',
  "interests" TEXT NOT NULL DEFAULT '',
  "fieldOfStudy" TEXT NOT NULL DEFAULT '',
  "stillInHighSchool" BOOLEAN NOT NULL DEFAULT false,
  "jobInterests" TEXT NOT NULL DEFAULT '',
  "displayName" TEXT NOT NULL DEFAULT '',
  "completedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WorkProgrammeProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WorkProgrammeProfile_userId_key"
  ON "WorkProgrammeProfile"("userId");

DO $$ BEGIN
  ALTER TABLE "WorkProgrammeProfile"
    ADD CONSTRAINT "WorkProgrammeProfile_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
