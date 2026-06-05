-- CreateTable
CREATE TABLE "PathChapter" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "realm" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "coverImage" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "openingNarrative" TEXT NOT NULL DEFAULT '',
    "worldContext" TEXT NOT NULL DEFAULT '',
    "archonIntro" TEXT NOT NULL DEFAULT '',
    "rewardXp" INTEGER NOT NULL DEFAULT 0,
    "rewardGold" INTEGER NOT NULL DEFAULT 0,
    "rewardBadge" TEXT NOT NULL DEFAULT '',
    "rewardTitle" TEXT NOT NULL DEFAULT '',
    "estimatedHours" INTEGER NOT NULL DEFAULT 0,
    "difficulty" TEXT NOT NULL DEFAULT 'beginner',
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "npcImage" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'CODE',
    "typeColor" TEXT NOT NULL DEFAULT 'text-rpg-purple',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PathChapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PathAct" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL DEFAULT '',
    "isFinalAct" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PathAct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PathChapter_slug_key" ON "PathChapter"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PathAct_chapterId_slug_key" ON "PathAct"("chapterId", "slug");

-- AddForeignKey
ALTER TABLE "PathAct" ADD CONSTRAINT "PathAct_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "PathChapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
