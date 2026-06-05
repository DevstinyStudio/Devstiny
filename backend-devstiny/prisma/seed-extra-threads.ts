import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  // Ambil user yang sudah ada
  const [shadowbyte, runeweaver, ironscribe, voidcaster, lyra] = await Promise.all([
    prisma.player.findUnique({ where: { username: "shadowbyte" } }),
    prisma.player.findUnique({ where: { username: "runeweaver" } }),
    prisma.player.findUnique({ where: { username: "ironscribe" } }),
    prisma.player.findUnique({ where: { username: "voidcaster" } }),
    prisma.player.findUnique({ where: { username: "guildmaster_lyra" } }),
  ]);

  if (!shadowbyte || !runeweaver || !ironscribe || !voidcaster || !lyra) {
    console.error("❌ Users not found. Run seed first.");
    process.exit(1);
  }

  const users = [shadowbyte, runeweaver, ironscribe, voidcaster, lyra];
  const categories = ["tavern", "oracle", "hall-of-champions", "guild-board"];

  const extraThreads = [
    { title: "What's the best way to learn CSS Grid?", category: "oracle", authorId: ironscribe.id },
    { title: "Just hit Level 5 — here's what I learned", category: "tavern", authorId: voidcaster.id },
    { title: "My first JavaScript project — a simple calculator", category: "hall-of-champions", authorId: ironscribe.id },
    { title: "How do I center a div vertically? I've tried everything", category: "oracle", authorId: shadowbyte.id },
    { title: "Looking for accountability partner — Chapter 2", category: "guild-board", authorId: runeweaver.id },
    { title: "The DOM chapter finally clicked for me", category: "tavern", authorId: voidcaster.id },
    { title: "Built a todo app — feedback on my HTML structure?", category: "hall-of-champions", authorId: shadowbyte.id },
    { title: "What does 'async' actually mean in plain English?", category: "oracle", authorId: ironscribe.id },
    { title: "Does anyone else find CSS selectors confusing at first?", category: "tavern", authorId: lyra.id },
    { title: "Weekend guild session recap — Chapter 3 highlights", category: "guild-board", authorId: lyra.id },
    { title: "My portfolio after completing Chapter 2", category: "hall-of-champions", authorId: runeweaver.id },
    { title: "How does event delegation work exactly?", category: "oracle", authorId: voidcaster.id },
    { title: "Tip: use browser DevTools to debug CSS faster", category: "tavern", authorId: shadowbyte.id },
    { title: "Recruiting: CSS & HTML study group — 2 spots open", category: "guild-board", authorId: ironscribe.id },
    { title: "Rebuilt a landing page from memory — Day 3 of practice", category: "hall-of-champions", authorId: lyra.id },
  ];

  const now = new Date();
  let created = 0;

  for (const t of extraThreads) {
    const createdAt = new Date(now.getTime() - Math.random() * 7 * 86400000);
    await prisma.forumThread.create({
      data: {
        title:     t.title,
        content:   `This is a test thread for pagination testing. Content for: "${t.title}"`,
        category:  t.category,
        authorId:  t.authorId,
        views:     Math.floor(Math.random() * 500),
        createdAt,
        updatedAt: createdAt,
      },
    });
    created++;
  }

  console.log(`✅ Created ${created} extra threads for pagination testing.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
