import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const updates: { id: string; starterCode: string }[] = [

  // F-1 already has variables — no change needed

  // ── F-2: Forge Order ────────────────────────────────────────────────────────
  {
    id: "F-2",
    starterCode:
`const orders = [
  { name: "Longsword", waitDays: 5 },
  { name: "Axe",       waitDays: 3 },
  { name: "Spear",     waitDays: 7 },
  { name: "Shield",    waitDays: 1 },
];

function sortByWaitTime(orders) {
  // orders: array of { name: string, waitDays: number }
  // Return array of NAMES sorted by waitDays DESCENDING
  // Whoever has waited longest goes first
}`,
  },

  // ── F-3: Material Audit ─────────────────────────────────────────────────────
  {
    id: "F-3",
    starterCode:
`const materials = [
  { name: "Iron",  qty: 5 },
  { name: "Iron",  qty: 3 },
  { name: "Coal",  qty: 0 },
  { name: "Steel", qty: 2 },
  { name: "Coal",  qty: 0 },
];

function cleanMaterials(materials) {
  // materials: array of { name: string, qty: number }
  // Return array of unique names where qty > 0
  // If a name appears more than once, include it only once
}`,
  },

  // ── L-1: Formula Decoder ───────────────────────────────────────────────────
  {
    id: "L-1",
    starterCode:
`const records = ["fire", "ice", "fire", "wind", "ice", "fire", "shadow"];

function countTransformations(records) {
  // records: array of strings (transformation type names)
  // Return an object counting how many times each type appears
  // Example result: { fire: 3, ice: 2, wind: 1, shadow: 1 }
}`,
  },

  // ── L-2: Transmutation Log ──────────────────────────────────────────────────
  {
    id: "L-2",
    starterCode:
`const materials = [
  { name: "Iron",   pure: 10, corrupted: 3  },
  { name: "Gold",   pure: 20, corrupted: 18 },
  { name: "Silver", pure: 15, corrupted: 5  },
  { name: "Copper", pure: 8,  corrupted: 6  },
];

function findLargestGap(materials) {
  // materials: array of { name: string, pure: number, corrupted: number }
  // Return the NAME of the material with the largest (pure - corrupted) gap
}`,
  },

  // ── L-3: Illusion Classifier ────────────────────────────────────────────────
  {
    id: "L-3",
    starterCode:
`const illusions = [
  ["fire", "ice"],
  ["fire", "wind"],
  ["fire"],
  ["ice", "shadow"],
  ["wind", "fire"],
];

function classifyMethods(illusions) {
  // illusions: array of arrays of method name strings
  // Return a sorted array of UNIQUE method names
  // Sorted by frequency DESCENDING — most used method first
}`,
  },

  // ── S-1: Profile Scan ──────────────────────────────────────────────────────
  {
    id: "S-1",
    starterCode:
`const residents = [
  { name: "Ada",   age: 45, distance: 3.2 },
  { name: "Bob",   age: 30, distance: 1.5 },
  { name: "Carol", age: 52, distance: 6.0 },
  { name: "Dave",  age: 41, distance: 4.8 },
  { name: "Eve",   age: 39, distance: 2.0 },
];

function filterDangerZone(residents) {
  // residents: array of { name: string, age: number, distance: number }
  // Return array of NAMES where:
  //   age > 40  (strictly greater — 40 itself does NOT qualify)
  //   distance < 5  (strictly less — 5 itself does NOT qualify)
}`,
  },

  // ── S-2: The Null Ledger ───────────────────────────────────────────────────
  {
    id: "S-2",
    starterCode:
`const transactions = [100, null, 250, null, null, 75, null, 30];

function sumValidTransactions(transactions) {
  // transactions: array of numbers and null values
  // null represents a stolen / corrupted entry — skip it
  // Return the SUM of all non-null values
  // Return 0 if there are no valid transactions
}`,
  },

  // ── S-3: Loop Breaker's Debt ───────────────────────────────────────────────
  {
    id: "S-3",
    starterCode:
`const accounts = [
  { name: "Ada",  transactions: "100 -150 50"  },
  { name: "Bob",  transactions: "200 -100"      },
  { name: "Cara", transactions: "-10 500 -200"  },
  { name: "Dan",  transactions: "50 30 -20 10"  },
];

function findDebtors(accounts) {
  // accounts: array of { name: string, transactions: string }
  // transactions is a space-separated list of numbers, e.g. "100 -150 50"
  // Starting balance is 0. Apply each number in order.
  // Return array of NAMES whose balance goes BELOW ZERO at any point
  // (even if it recovers afterward)
}`,
  },
];

async function main() {
  console.log(`\nUpdating starter code for ${updates.length} quests...\n`);

  for (const u of updates) {
    await prisma.quest.update({
      where: { id: u.id },
      data: { starterCode: u.starterCode },
    });
    console.log(`  ✅  ${u.id} — starter code updated`);
  }

  console.log(`\nDone.\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
