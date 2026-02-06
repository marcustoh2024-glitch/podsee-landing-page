-- CreateTable
CREATE TABLE "TuitionCentre" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "website" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Level" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TuitionCentreLevel" (
    "tuitionCentreId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,

    PRIMARY KEY ("tuitionCentreId", "levelId"),
    CONSTRAINT "TuitionCentreLevel_tuitionCentreId_fkey" FOREIGN KEY ("tuitionCentreId") REFERENCES "TuitionCentre" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TuitionCentreLevel_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TuitionCentreSubject" (
    "tuitionCentreId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,

    PRIMARY KEY ("tuitionCentreId", "subjectId"),
    CONSTRAINT "TuitionCentreSubject_tuitionCentreId_fkey" FOREIGN KEY ("tuitionCentreId") REFERENCES "TuitionCentre" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TuitionCentreSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TuitionCentre_name_idx" ON "TuitionCentre"("name");

-- CreateIndex
CREATE INDEX "TuitionCentre_location_idx" ON "TuitionCentre"("location");

-- CreateIndex
CREATE UNIQUE INDEX "Level_name_key" ON "Level"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");
