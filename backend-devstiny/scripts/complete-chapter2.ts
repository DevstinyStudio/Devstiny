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

  if (!player?.progress) { console.log("Player tidak ditemukan."); return; }

  const newScenes = ["chapter-2/act-1","chapter-2/act-2","chapter-2/act-3","chapter-2/act-4","chapter-2/act-5","chapter-2/final-act"];
  const gainXp = 750 + 1800;
  const gainGold = 750 + 2000;

  await prisma.progress.update({
    where: { playerId: player.id },
    data: {
      xp:                { increment: gainXp },
      gold:              { increment: gainGold },
      currentChapter:    "chapter-3",
      completedChapters: [...player.progress.completedChapters, "chapter-2"],
      completedScenes:   [...player.progress.completedScenes, ...newScenes],
    },
  });

  console.log(`Chapter 2 selesai untuk johndoe.`);
  console.log(`+${gainXp} XP | +${gainGold} Gold`);
  console.log(`Total XP: ${player.progress.xp + gainXp} | Total Gold: ${player.progress.gold + gainGold}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
