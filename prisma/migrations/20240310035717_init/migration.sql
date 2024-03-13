-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "comments" TEXT,
    "assets" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Choice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "choice" TEXT NOT NULL,
    "isTrue" BOOLEAN NOT NULL,
    "belongsToId" TEXT NOT NULL,
    CONSTRAINT "Choice_belongsToId_fkey" FOREIGN KEY ("belongsToId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tag" TEXT NOT NULL,
    "belongsToId" TEXT NOT NULL,
    CONSTRAINT "Tag_belongsToId_fkey" FOREIGN KEY ("belongsToId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserChoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userChoiceId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "timeTaken" INTEGER NOT NULL,
    CONSTRAINT "UserChoice_userChoiceId_fkey" FOREIGN KEY ("userChoiceId") REFERENCES "Choice" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserChoice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
