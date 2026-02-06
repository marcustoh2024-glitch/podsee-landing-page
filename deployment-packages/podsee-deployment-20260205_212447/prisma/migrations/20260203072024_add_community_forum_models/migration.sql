-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PARENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DiscussionThread" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tuitionCentreId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DiscussionThread_tuitionCentreId_fkey" FOREIGN KEY ("tuitionCentreId") REFERENCES "TuitionCentre" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discussionThreadId" TEXT NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Comment_discussionThreadId_fkey" FOREIGN KEY ("discussionThreadId") REFERENCES "DiscussionThread" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DiscussionThread_tuitionCentreId_key" ON "DiscussionThread"("tuitionCentreId");

-- CreateIndex
CREATE INDEX "DiscussionThread_tuitionCentreId_idx" ON "DiscussionThread"("tuitionCentreId");

-- CreateIndex
CREATE INDEX "Comment_discussionThreadId_createdAt_idx" ON "Comment"("discussionThreadId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_isHidden_idx" ON "Comment"("isHidden");
