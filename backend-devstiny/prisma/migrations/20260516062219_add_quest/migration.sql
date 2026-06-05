-- CreateTable
CREATE TABLE "Quest" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tier" INTEGER NOT NULL DEFAULT 1,
    "character" TEXT NOT NULL DEFAULT 'ferrus',
    "loreHook" TEXT NOT NULL,
    "functionName" TEXT NOT NULL,
    "starterCode" TEXT NOT NULL,
    "concepts" TEXT[],
    "testCases" JSONB NOT NULL,
    "rewardXp" INTEGER NOT NULL DEFAULT 75,
    "rewardGold" INTEGER NOT NULL DEFAULT 50,
    "rewardBadge" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quest_slug_key" ON "Quest"("slug");
