import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  // 1. Create new category with new slug
  await prisma.forumCategory.upsert({
    where: { slug: "oracle" },
    update: {},
    create: {
      slug:        "oracle",
      title:       "The Oracle",
      description: "Ask anything about quests, the Books, or your adventure. No question is too small.",
      gem:         "/gem/gem-14.png",
      color:       "text-rpg-cyan",
      order:       2,
    },
  });
  console.log("✅ Created category: oracle");

  // 2. Move all threads from quest-log → oracle
  const { count } = await prisma.forumThread.updateMany({
    where: { category: "quest-log" },
    data:  { category: "oracle" },
  });
  console.log(`✅ Moved ${count} threads to oracle`);

  // 3. Delete old category
  await prisma.forumCategory.deleteMany({ where: { slug: "quest-log" } });
  console.log("✅ Deleted old category: quest-log");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
