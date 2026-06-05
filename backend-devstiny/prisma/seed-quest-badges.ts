import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const QUEST_BADGES: {
  id: string; slug: string;
  badgeKey: string; name: string; description: string; gem: number;
}[] = [
  // Tier 1
  { id: "F-1", slug: "weapon-ledger",     badgeKey: "quest-f1", name: "Weapon Sorter",    description: "Separated Ferrus's weapon inventory by weight class.",      gem: 1  },
  { id: "F-2", slug: "forge-order",       badgeKey: "quest-f2", name: "Forge Master",     description: "Sorted the forge's order queue by wait time.",              gem: 2  },
  { id: "F-4", slug: "damage-report",     badgeKey: "quest-f4", name: "Damage Assessor",  description: "Identified every weapon worth recovering from the Warden.",   gem: 3  },
  { id: "L-1", slug: "formula-decoder",   badgeKey: "quest-l1", name: "Decoder",          description: "Counted Lyra's transformation patterns with precision.",     gem: 4  },
  { id: "L-2", slug: "transmutation-log", badgeKey: "quest-l2", name: "Lab Analyst",      description: "Found the most corrupted material in Lyra's laboratory.",    gem: 5  },
  { id: "L-4", slug: "peak-essence",      badgeKey: "quest-l4", name: "Essence Reader",   description: "Identified the most common essence in Lyra's catalogue.",    gem: 6  },
  { id: "S-1", slug: "profile-scan",      badgeKey: "quest-s1", name: "Scanner",          description: "Located the danger-zone residents in the Broker's database.", gem: 7  },
  { id: "E-1", slug: "archive-sort",      badgeKey: "quest-e1", name: "Archivist",        description: "Organised Elvar's archive by priority and date.",            gem: 8  },
  // Tier 2
  { id: "F-3", slug: "material-audit",    badgeKey: "quest-f3", name: "Auditor",          description: "Cleaned duplicate and zero-stock entries from the records.", gem: 9  },
  { id: "F-5", slug: "forge-totals",      badgeKey: "quest-f5", name: "Quartermaster",    description: "Calculated forge output totals by production category.",     gem: 10 },
  { id: "L-3", slug: "illusion-classifier",badgeKey: "quest-l3", name: "Classifier",     description: "Mapped all of The Weaver's illusion methods by frequency.",  gem: 11 },
  { id: "L-5", slug: "reagent-pairs",     badgeKey: "quest-l5", name: "Alchemist",        description: "Found every valid reagent combination for Lyra's ritual.",   gem: 12 },
  { id: "S-2", slug: "null-ledger",       badgeKey: "quest-s2", name: "Ledger Keeper",    description: "Summed only the valid transactions in the Broker's ledger.", gem: 13 },
  { id: "S-4", slug: "running-balance",   badgeKey: "quest-s4", name: "Accountant",       description: "Traced the Broker's ledger entry by entry.",                gem: 14 },
  { id: "S-5", slug: "bracket-check",     badgeKey: "quest-s5", name: "Debugger",         description: "Validated bracket balance in the Broker's corrupt code.",    gem: 15 },
  { id: "E-2", slug: "flatten-accounts",  badgeKey: "quest-e2", name: "Data Miner",       description: "Flattened the Broker's nested account groups.",             gem: 16 },
  // Tier 3
  { id: "F-6", slug: "inventory-merge",   badgeKey: "quest-f6", name: "Merger",           description: "Unified two forge inventories into one clean record.",       gem: 17 },
  { id: "L-6", slug: "anagram-groups",    badgeKey: "quest-l6", name: "Cipher Breaker",   description: "Decoded The Weaver's hidden anagram messages.",             gem: 18 },
  { id: "S-3", slug: "loop-breakers-debt",badgeKey: "quest-s3", name: "Loop Breaker",     description: "Identified every account driven into debt by the Broker.",   gem: 19 },
];

async function main() {
  console.log("\nSeeding quest Badge records...\n");

  for (const q of QUEST_BADGES) {
    // Upsert the Badge record
    await prisma.badge.upsert({
      where: { key: q.badgeKey },
      update: { name: q.name, description: q.description },
      create: { key: q.badgeKey, name: q.name, description: q.description },
    });

    // Update quest rewardBadge to use the badge key
    await prisma.quest.update({
      where: { id: q.id },
      data: { rewardBadge: q.badgeKey },
    });

    console.log(`  ✅  ${q.id} — "${q.name}" (${q.badgeKey}) gem-${q.gem}`);
  }

  // Store gem mapping in badge description for frontend to use
  // We'll use a convention: description ends with |gem:N
  console.log("\nUpdating gem assignments in badge descriptions...");
  for (const q of QUEST_BADGES) {
    await prisma.badge.update({
      where: { key: q.badgeKey },
      data: { description: `${q.description}|gem:${q.gem}` },
    });
  }

  const total = await prisma.badge.count();
  console.log(`\nDone. Total badges in DB: ${total}\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
