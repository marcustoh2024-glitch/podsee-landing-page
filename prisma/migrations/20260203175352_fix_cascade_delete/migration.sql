-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DiscussionThread" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tuitionCentreId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DiscussionThread_tuitionCentreId_fkey" FOREIGN KEY ("tuitionCentreId") REFERENCES "TuitionCentre" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DiscussionThread" ("createdAt", "id", "tuitionCentreId") SELECT "createdAt", "id", "tuitionCentreId" FROM "DiscussionThread";
DROP TABLE "DiscussionThread";
ALTER TABLE "new_DiscussionThread" RENAME TO "DiscussionThread";
CREATE UNIQUE INDEX "DiscussionThread_tuitionCentreId_key" ON "DiscussionThread"("tuitionCentreId");
CREATE INDEX "DiscussionThread_tuitionCentreId_idx" ON "DiscussionThread"("tuitionCentreId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
