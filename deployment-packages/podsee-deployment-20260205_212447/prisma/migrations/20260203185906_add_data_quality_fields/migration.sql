-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TuitionCentre" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "website" TEXT,
    "dataQualityStatus" TEXT NOT NULL DEFAULT 'OK',
    "dataQualityNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_TuitionCentre" ("createdAt", "id", "location", "name", "updatedAt", "website", "whatsappNumber") SELECT "createdAt", "id", "location", "name", "updatedAt", "website", "whatsappNumber" FROM "TuitionCentre";
DROP TABLE "TuitionCentre";
ALTER TABLE "new_TuitionCentre" RENAME TO "TuitionCentre";
CREATE INDEX "TuitionCentre_name_idx" ON "TuitionCentre"("name");
CREATE INDEX "TuitionCentre_location_idx" ON "TuitionCentre"("location");
CREATE INDEX "TuitionCentre_dataQualityStatus_idx" ON "TuitionCentre"("dataQualityStatus");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
