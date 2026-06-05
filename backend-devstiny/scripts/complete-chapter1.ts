import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const player = await prisma.player.findUnique({
    where: { username: "johndoe" },
    include: { progress: true },
  });

  if (!player?.progress) {
    console.log("Player atau progress tidak ditemukan.");
    return;
  }

  const newScenes = [
    "chapter-1/act-1",
    "chapter-1/act-2",
    "chapter-1/act-3",
    "chapter-1/act-4",
    "chapter-1/act-5",
    "chapter-1/final-act",
  ];

  const actXp   = 120 * 5 + 150; // 750
  const actGold = 120 * 5 + 150; // 750
  const chapterXp   = 1200;
  const chapterGold = 1500;
  const gainXp   = actXp   + chapterXp;   // 1950
  const gainGold = actGold + chapterGold; // 2250

  const existing = player.progress;

  await prisma.progress.update({
    where: { playerId: player.id },
    data: {
      xp:                existing.xp   + gainXp,
      gold:              existing.gold + gainGold,
      currentChapter:    "chapter-2",
      completedChapters: [...existing.completedChapters, "chapter-1"],
      completedScenes:   [...existing.completedScenes, ...newScenes],
    },
  });

  console.log(`Chapter 1 selesai untuk johndoe.`);
  console.log(`XP gained: +${gainXp} | Gold gained: +${gainGold}`);
  console.log(`Total XP: ${existing.xp + gainXp} | Total Gold: ${existing.gold + gainGold}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
