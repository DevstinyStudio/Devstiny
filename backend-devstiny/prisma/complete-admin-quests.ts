import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  // Find admin user
  const admin = await prisma.player.findUnique({
    where: { email: "admin@devstiny.com" },
    include: { progress: true },
  });

  if (!admin) { console.error("Admin user not found."); process.exit(1); }
  console.log(`\nAdmin: ${admin.username} (${admin.id})`);

  // Ensure progress record exists
  if (!admin.progress) {
    await prisma.progress.create({
      data: { playerId: admin.id, xp: 0, currentChapter: "prologue" },
    });
    console.log("  ✅  Created progress record for admin");
  }

  // Get all active quests
  const quests = await prisma.quest.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, rewardXp: true, rewardGold: true, rewardBadge: true },
  });
  console.log(`\nMarking ${quests.length} quests as complete...\n`);

  const currentScenes = admin.progress?.completedScenes ?? [];
  const newScenes     = [...currentScenes];
  let totalXp   = admin.progress?.xp   ?? 0;
  let totalGold = admin.progress?.gold ?? 0;

  for (const q of quests) {
    const sceneKey = `quest/${q.slug}`;
    if (!newScenes.includes(sceneKey)) {
      newScenes.push(sceneKey);
      totalXp   += q.rewardXp;
      totalGold += q.rewardGold;
    }
    console.log(`  ◆  ${q.id} — quest/${q.slug}`);
  }

  // Update progress with all quest scenes + XP/Gold
  await prisma.progress.update({
    where: { playerId: admin.id },
    data: {
      completedScenes: newScenes,
      xp:   totalXp,
      gold: totalGold,
    },
  });
  console.log(`\n  ✅  Progress updated: ${newScenes.length} scenes, ${totalXp} XP, ${totalGold} G`);

  // Award all quest badges
  const questBadges = await prisma.badge.findMany({
    where: { key: { startsWith: "quest-" } },
  });
  console.log(`\nAwarding ${questBadges.length} quest badges...\n`);

  let awarded = 0;
  for (const badge of questBadges) {
    const existing = await prisma.playerBadge.findUnique({
      where: { playerId_badgeId: { playerId: admin.id, badgeId: badge.id } },
    });
    if (!existing) {
      await prisma.playerBadge.create({ data: { playerId: admin.id, badgeId: badge.id } });
      awarded++;
      console.log(`  ✅  ${badge.key} — "${badge.name}"`);
    } else {
      console.log(`  ○   ${badge.key} — already awarded`);
    }
  }

  console.log(`\nDone. Awarded ${awarded} new badges to admin.\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
