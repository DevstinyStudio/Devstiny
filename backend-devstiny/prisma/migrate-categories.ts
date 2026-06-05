import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  // 1. Create new merged category
  await prisma.forumCategory.upsert({
    where: { slug: "quest-log" },
    update: {},
    create: {
      slug:        "quest-log",
      title:       "The Quest Log",
      description: "Ask anything about quests, the Books, or your adventure. No question is too small.",
      gem:         "/gem/gem-14.png",
      color:       "text-rpg-cyan",
      order:       2,
    },
  });
  console.log("✅ Created category: quest-log");

  // 2. Move all threads from quest-help and elvars-corner → quest-log
  const [r1, r2] = await Promise.all([
    prisma.forumThread.updateMany({
      where: { category: "quest-help" },
      data:  { category: "quest-log" },
    }),
    prisma.forumThread.updateMany({
      where: { category: "elvars-corner" },
      data:  { category: "quest-log" },
    }),
  ]);
  console.log(`✅ Moved ${r1.count} quest-help threads`);
  console.log(`✅ Moved ${r2.count} elvars-corner threads`);

  // 3. Delete old categories
  await prisma.forumCategory.deleteMany({
    where: { slug: { in: ["quest-help", "elvars-corner"] } },
  });
  console.log("✅ Deleted old categories: quest-help, elvars-corner");

  // 4. Re-order remaining categories
  const order = ["tavern", "quest-log", "hall-of-champions", "guild-board"];
  await Promise.all(
    order.map((slug, i) =>
      prisma.forumCategory.updateMany({ where: { slug }, data: { order: i + 1 } })
    )
  );
  console.log("✅ Re-ordered categories");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
