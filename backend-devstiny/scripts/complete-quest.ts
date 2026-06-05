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
    console.log("Player tidak ditemukan.");
    return;
  }

  const sceneKey = "quest/weapon-ledger";
  const xp   = 75;
  const gold = 50;

  if (player.progress.completedScenes.includes(sceneKey)) {
    console.log("Quest sudah selesai sebelumnya.");
    return;
  }

  await prisma.progress.update({
    where: { playerId: player.id },
    data: {
      completedScenes: [...player.progress.completedScenes, sceneKey],
      xp:   { increment: xp },
      gold: { increment: gold },
    },
  });

  console.log(`Quest weapon-ledger selesai untuk johndoe.`);
  console.log(`+${xp} XP | +${gold} Gold`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
