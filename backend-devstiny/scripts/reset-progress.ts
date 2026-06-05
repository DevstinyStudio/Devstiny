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

  await prisma.progress.update({
    where: { playerId: player.id },
    data: {
      xp:                0,
      gold:              0,
      currentChapter:    "prologue",
      completedChapters: [],
      completedScenes:   [],
      flags:             {},
      choices:           {},
    },
  });

  console.log("Progress johndoe berhasil direset.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
