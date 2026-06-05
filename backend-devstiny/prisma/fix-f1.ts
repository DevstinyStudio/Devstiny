import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const starterCode = `const weapons = [
  { name: "Warhammer",      weight: 8.0 },
  { name: "Dagger",         weight: 1.2 },
  { name: "Greatsword",     weight: 6.5 },
  { name: "Shortbow",       weight: 2.3 },
  { name: "Battleaxe",      weight: 7.1 },
  { name: "Throwing Knife", weight: 0.4 },
];

function separateByWeight(weapons) {
  // weapons: array of { name: string, weight: number }
  // Return { heavy: [...names], light: [...names] }
  // heavy = weight > 5, light = weight <= 5
}`;

async function main() {
  await prisma.quest.update({ where: { id: "F-1" }, data: { starterCode } });
  console.log("✅ F-1 starter code updated");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
