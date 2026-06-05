-- CreateTable
CREATE TABLE "CostumeTier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 150,
    "color" TEXT NOT NULL DEFAULT 'text-rpg-dim',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CostumeTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostumeConfig" (
    "costumeId" INTEGER NOT NULL,
    "tierId" TEXT NOT NULL,
    "isFree" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CostumeConfig_pkey" PRIMARY KEY ("costumeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CostumeTier_name_key" ON "CostumeTier"("name");

-- AddForeignKey
ALTER TABLE "CostumeConfig" ADD CONSTRAINT "CostumeConfig_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "CostumeTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
