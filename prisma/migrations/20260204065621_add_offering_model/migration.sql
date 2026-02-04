-- CreateTable
CREATE TABLE "Offering" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tuitionCentreId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Offering_tuitionCentreId_fkey" FOREIGN KEY ("tuitionCentreId") REFERENCES "TuitionCentre" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Offering_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Offering_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Offering_tuitionCentreId_idx" ON "Offering"("tuitionCentreId");

-- CreateIndex
CREATE INDEX "Offering_levelId_idx" ON "Offering"("levelId");

-- CreateIndex
CREATE INDEX "Offering_subjectId_idx" ON "Offering"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Offering_tuitionCentreId_levelId_subjectId_key" ON "Offering"("tuitionCentreId", "levelId", "subjectId");

-- Data Migration: Populate Offering table from existing TuitionCentreLevel and TuitionCentreSubject
-- This creates a Cartesian product of all level-subject combinations for each centre
-- (This assumes centres offer all combinations of their levels and subjects)
INSERT INTO "Offering" ("id", "tuitionCentreId", "levelId", "subjectId", "createdAt")
SELECT 
    lower(hex(randomblob(16))) as id,
    tcl.tuitionCentreId,
    tcl.levelId,
    tcs.subjectId,
    CURRENT_TIMESTAMP as createdAt
FROM "TuitionCentreLevel" tcl
CROSS JOIN "TuitionCentreSubject" tcs
WHERE tcl.tuitionCentreId = tcs.tuitionCentreId;
