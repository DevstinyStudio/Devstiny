import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const player = await prisma.player.findUnique({
    where: { username: "johndoe" },
  });

  if (!player) {
    console.log("Player 'johndoe' tidak ditemukan.");
    return;
  }

  const completedScenes = [
    "prologue/act-1",
    "prologue/act-2",
    "prologue/act-3",
    "prologue/act-4",
    "prologue/act-5",
    "prologue/final-act",
  ];

  // XP per act + chapter completion reward
  const totalXp   = 100 + 100 + 150 + 150 + 100 + 200 + 1500; // 2300
  const totalGold = 100 + 100 + 150 + 150 + 100 + 200 + 2000; // 2800

  await prisma.progress.update({
    where: { playerId: player.id },
    data: {
      xp:                totalXp,
      gold:              totalGold,
      currentChapter:    "chapter-1",
      completedChapters: ["prologue"],
      completedScenes,
    },
  });

  console.log(`Prologue selesai untuk johndoe.`);
  console.log(`XP: ${totalXp} | Gold: ${totalGold}`);
  console.log(`Completed scenes: ${completedScenes.join(", ")}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
