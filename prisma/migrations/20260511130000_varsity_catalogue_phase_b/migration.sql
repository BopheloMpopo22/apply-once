-- CreateTable
CREATE TABLE "VarsityUniversity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "logoPath" TEXT NOT NULL,
    "calculatorType" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VarsityUniversity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VarsityProgramme" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "faculty" TEXT NOT NULL,
    "campus" TEXT,
    "externalCode" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VarsityProgramme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VarsityProgrammeRuleSet" (
    "id" TEXT NOT NULL,
    "programmeId" TEXT NOT NULL,
    "catalogueYear" INTEGER NOT NULL,
    "minAps" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VarsityProgrammeRuleSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VarsityProgrammeRequirement" (
    "id" TEXT NOT NULL,
    "ruleSetId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "label" TEXT,
    "payloadJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VarsityProgrammeRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VarsityProgramme_universityId_faculty_idx" ON "VarsityProgramme"("universityId", "faculty");

-- CreateIndex
CREATE INDEX "VarsityProgramme_universityId_name_idx" ON "VarsityProgramme"("universityId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "VarsityProgrammeRuleSet_programmeId_catalogueYear_key" ON "VarsityProgrammeRuleSet"("programmeId", "catalogueYear");

-- CreateIndex
CREATE INDEX "VarsityProgrammeRuleSet_catalogueYear_idx" ON "VarsityProgrammeRuleSet"("catalogueYear");

-- CreateIndex
CREATE INDEX "VarsityProgrammeRequirement_ruleSetId_idx" ON "VarsityProgrammeRequirement"("ruleSetId");

-- AddForeignKey
ALTER TABLE "VarsityProgramme" ADD CONSTRAINT "VarsityProgramme_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "VarsityUniversity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarsityProgrammeRuleSet" ADD CONSTRAINT "VarsityProgrammeRuleSet_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "VarsityProgramme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarsityProgrammeRequirement" ADD CONSTRAINT "VarsityProgrammeRequirement_ruleSetId_fkey" FOREIGN KEY ("ruleSetId") REFERENCES "VarsityProgrammeRuleSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

