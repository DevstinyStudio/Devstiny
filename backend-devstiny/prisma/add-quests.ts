import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const newQuests = [

  // ── TIER 1 — FRAGMENT ───────────────────────────────────────────────────────

  {
    id: "F-4", slug: "damage-report", title: "Damage Report",
    tier: 1, character: "ferrus", order: 4,
    rewardXp: 75, rewardGold: 50, rewardBadge: "",
    loreHook: "The Iron Warden got through half our stock before I could stop it. I need a list of every weapon with a damage value above 50 — those are the ones still worth recovering.",
    functionName: "filterDamaged",
    concepts: ["filter", "comparison", "array methods"],
    starterCode: `const weapons = [
  { name: "Longsword", damage: 85 },
  { name: "Dagger",    damage: 30 },
  { name: "Warhammer", damage: 92 },
  { name: "Shortbow",  damage: 45 },
  { name: "Spear",     damage: 67 },
];

function filterDamaged(weapons) {
  // weapons: array of { name: string, damage: number }
  // Return array of NAMES where damage > 50
}`,
    testCases: [
      { description: "Only Longsword qualifies", args: [[{ name: "Longsword", damage: 85 }, { name: "Dagger", damage: 30 }]], expected: ["Longsword"] },
      { description: "Boundary: exactly 50 does NOT qualify, 51 does", args: [[{ name: "A", damage: 51 }, { name: "B", damage: 50 }, { name: "C", damage: 49 }]], expected: ["A"] },
      { description: "All three qualify", args: [[{ name: "X", damage: 92 }, { name: "Y", damage: 75 }, { name: "Z", damage: 63 }]], expected: ["X", "Y", "Z"] },
      { description: "None qualify — returns empty array", args: [[{ name: "A", damage: 10 }, { name: "B", damage: 20 }]], expected: [] },
      { description: "Empty array returns empty array", args: [[]], expected: [] },
    ],
  },

  {
    id: "L-4", slug: "peak-essence", title: "Peak Essence",
    tier: 1, character: "lyra", order: 4,
    rewardXp: 75, rewardGold: 50, rewardBadge: "",
    loreHook: "I have been cataloguing every essence I extract for three weeks. Now I need to know which type I have the most of — that determines which illusion I can create at scale.",
    functionName: "findMostCommon",
    concepts: ["count occurrences", "find max", "object accumulator"],
    starterCode: `const essences = [
  "fire", "water", "fire", "earth",
  "fire", "water", "shadow", "earth",
  "fire",
];

function findMostCommon(essences) {
  // essences: array of strings
  // Return the string that appears the MOST times
  // If there is a tie, return the one that comes FIRST alphabetically
}`,
    testCases: [
      { description: "Fire appears 3 times — most common", args: [["fire", "water", "fire", "earth", "fire"]], expected: "fire" },
      { description: "Tie between a and b — alphabetically first wins", args: [["a", "b", "a", "b", "c"]], expected: "a" },
      { description: "All same — returns that value", args: [["shadow", "shadow", "shadow"]], expected: "shadow" },
      { description: "Single element returns itself", args: [["water"]], expected: "water" },
      { description: "b appears most — tie-break does not apply", args: [["b", "a", "c", "b", "a", "b"]], expected: "b" },
    ],
  },

  {
    id: "E-1", slug: "archive-sort", title: "Archive Sort",
    tier: 1, character: "elvar", order: 1,
    rewardXp: 75, rewardGold: 50, rewardBadge: "",
    loreHook: "My archive has not been sorted in forty years. Every record has a priority number and a date. Lowest priority number first — and when two records share a priority, the older date comes before the newer one.",
    functionName: "sortByPriority",
    concepts: ["multi-field sort", "string date comparison", "array sort"],
    starterCode: `const records = [
  { title: "The First Light",    priority: 2, date: "2023-03-15" },
  { title: "The Broken Gate",    priority: 1, date: "2023-01-10" },
  { title: "The Dark King Rise", priority: 2, date: "2022-11-01" },
  { title: "The First Compiler", priority: 1, date: "2023-01-05" },
];

function sortByPriority(records) {
  // records: array of { title: string, priority: number, date: string }
  // Sort by priority ASCENDING (1 before 2)
  // If priority is equal, sort by date ASCENDING (older first)
  // Return array of TITLE strings only
}`,
    testCases: [
      { description: "Priority first, then date for ties", args: [[{ title: "The First Light", priority: 2, date: "2023-03-15" }, { title: "The Broken Gate", priority: 1, date: "2023-01-10" }, { title: "The Dark King Rise", priority: 2, date: "2022-11-01" }, { title: "The First Compiler", priority: 1, date: "2023-01-05" }]], expected: ["The First Compiler", "The Broken Gate", "The Dark King Rise", "The First Light"] },
      { description: "All same priority — sort by date", args: [[{ title: "C", priority: 1, date: "2023-03-01" }, { title: "A", priority: 1, date: "2021-01-01" }, { title: "B", priority: 1, date: "2022-06-15" }]], expected: ["A", "B", "C"] },
      { description: "All different priorities — sort by priority only", args: [[{ title: "Third", priority: 3, date: "2020-01-01" }, { title: "First", priority: 1, date: "2023-01-01" }, { title: "Second", priority: 2, date: "2021-01-01" }]], expected: ["First", "Second", "Third"] },
      { description: "Single record", args: [[{ title: "Solo", priority: 1, date: "2023-01-01" }]], expected: ["Solo"] },
      { description: "Empty array", args: [[]], expected: [] },
    ],
  },

  // ── TIER 2 — CIPHER ─────────────────────────────────────────────────────────

  {
    id: "F-5", slug: "forge-totals", title: "Forge Totals",
    tier: 2, character: "ferrus", order: 5,
    rewardXp: 150, rewardGold: 100, rewardBadge: "",
    loreHook: "Three days of forging and I still can't tell you exactly how many of each type we made. I have the order log. I need the totals — how many items per category, summed across all orders.",
    functionName: "totalByCategory",
    concepts: ["reduce", "groupBy", "object accumulator"],
    starterCode: `const orders = [
  { name: "Iron Sword",   category: "weapons", qty: 3 },
  { name: "Steel Shield", category: "shields", qty: 2 },
  { name: "Forge Hammer", category: "tools",   qty: 1 },
  { name: "War Axe",      category: "weapons", qty: 4 },
  { name: "Buckler",      category: "shields", qty: 5 },
];

function totalByCategory(orders) {
  // orders: array of { name: string, category: string, qty: number }
  // Return an object where each key is a category
  // and the value is the TOTAL qty for that category
  // Example: { weapons: 7, shields: 7, tools: 1 }
}`,
    testCases: [
      { description: "Two weapons and one shield", args: [[{ name: "Sword", category: "weapons", qty: 3 }, { name: "Shield", category: "shields", qty: 2 }, { name: "Axe", category: "weapons", qty: 4 }]], expected: { weapons: 7, shields: 2 } },
      { description: "Single category, single item", args: [[{ name: "Hammer", category: "tools", qty: 5 }]], expected: { tools: 5 } },
      { description: "All items in same category — sums to one key", args: [[{ name: "A", category: "x", qty: 1 }, { name: "B", category: "x", qty: 2 }, { name: "C", category: "x", qty: 3 }]], expected: { x: 6 } },
      { description: "Three different categories", args: [[{ name: "A", category: "w", qty: 10 }, { name: "B", category: "s", qty: 5 }, { name: "C", category: "t", qty: 3 }]], expected: { w: 10, s: 5, t: 3 } },
      { description: "Empty array returns empty object", args: [[]], expected: {} },
    ],
  },

  {
    id: "L-5", slug: "reagent-pairs", title: "Reagent Pairs",
    tier: 2, character: "lyra", order: 5,
    rewardXp: 150, rewardGold: 100, rewardBadge: "",
    loreHook: "Every illusion I cast requires exactly two reagents with a combined potency of 100. Find every valid pair from this supply list — I need all my options before the ritual begins.",
    functionName: "findPairs",
    concepts: ["nested loops", "pairs", "avoid duplicates"],
    starterCode: `const reagents = [
  { name: "Moonbloom", potency: 40 },
  { name: "Shadowash", potency: 60 },
  { name: "Starroot",  potency: 30 },
  { name: "Voidpetal", potency: 70 },
];
const target = 100;

function findPairs(reagents, target) {
  // reagents: array of { name: string, potency: number }
  // target: number
  // Return array of [name1, name2] where potency1 + potency2 === target
  // Each pair appears ONCE — not [A,B] and [B,A]
  // Within each pair, sort alphabetically (smaller name first)
}`,
    testCases: [
      { description: "Two valid pairs found", args: [[{ name: "Moonbloom", potency: 40 }, { name: "Shadowash", potency: 60 }, { name: "Starroot", potency: 30 }, { name: "Voidpetal", potency: 70 }], 100], expected: [["Moonbloom", "Shadowash"], ["Starroot", "Voidpetal"]] },
      { description: "One valid pair", args: [[{ name: "X", potency: 50 }, { name: "Y", potency: 50 }, { name: "Z", potency: 30 }], 100], expected: [["X", "Y"]] },
      { description: "No valid pairs — returns empty array", args: [[{ name: "A", potency: 10 }, { name: "B", potency: 20 }], 100], expected: [] },
      { description: "Pair sorted alphabetically — Delta before Gamma", args: [[{ name: "Alpha", potency: 25 }, { name: "Beta", potency: 75 }, { name: "Gamma", potency: 50 }, { name: "Delta", potency: 50 }], 100], expected: [["Alpha", "Beta"], ["Delta", "Gamma"]] },
      { description: "Empty reagents — returns empty array", args: [[], 100], expected: [] },
    ],
  },

  {
    id: "S-4", slug: "running-balance", title: "Running Balance",
    tier: 2, character: "somers", order: 4,
    rewardXp: 150, rewardGold: 100, rewardBadge: "",
    loreHook: "The Phantom Broker's ledger shows only the final balance. I need to see it change entry by entry — a running total after every single transaction. That is where the manipulation is hidden.",
    functionName: "runningBalance",
    concepts: ["running sum", "map with accumulator", "array transformation"],
    starterCode: `const transactions = [100, -30, 50, -20, 80];

function runningBalance(transactions) {
  // transactions: array of numbers (positive = credit, negative = debit)
  // Return array showing the CUMULATIVE balance after each transaction
  // Example: [100, -30, 50] → [100, 70, 120]
}`,
    testCases: [
      { description: "Five transactions with mixed signs", args: [[100, -30, 50, -20, 80]], expected: [100, 70, 120, 100, 180] },
      { description: "All positive — cumulative sum", args: [[10, 20, 30]], expected: [10, 30, 60] },
      { description: "Credit then debit returning to zero", args: [[100, -100, 50, -50]], expected: [100, 0, 50, 0] },
      { description: "All negative — running deficit", args: [[-10, -20, -30]], expected: [-10, -30, -60] },
      { description: "Single transaction", args: [[42]], expected: [42] },
    ],
  },

  {
    id: "S-5", slug: "bracket-check", title: "Bracket Check",
    tier: 2, character: "somers", order: 5,
    rewardXp: 150, rewardGold: 100, rewardBadge: "",
    loreHook: "Every corrupted function call in the Phantom Broker's system has one thing in common — mismatched brackets. I need a tool that tells me instantly whether an expression's brackets are properly balanced.",
    functionName: "isBalanced",
    concepts: ["stack", "string iteration", "bracket matching"],
    starterCode: `const expression = "function((x + y) * [a - b])";

function isBalanced(expression) {
  // expression: a string that may contain (, ), [, ], {, }
  // Return true if every opening bracket has a matching closing bracket
  // in the correct order
  // Return false if any bracket is unmatched or closed in the wrong order
  // Ignore all other characters
}`,
    testCases: [
      { description: "Valid — all brackets properly closed", args: ["(a + b) * (c - d)"], expected: true },
      { description: "Invalid — unclosed parenthesis", args: ["((x + y)"], expected: false },
      { description: "Valid — nested different bracket types", args: ["[{()}]"], expected: true },
      { description: "Invalid — wrong closing order", args: ["([)]"], expected: false },
      { description: "Valid — empty string has no brackets to mismatch", args: [""], expected: true },
    ],
  },

  {
    id: "E-2", slug: "flatten-accounts", title: "Flatten Accounts",
    tier: 2, character: "elvar", order: 2,
    rewardXp: 150, rewardGold: 100, rewardBadge: "",
    loreHook: "The Phantom Broker organized his clients into nested groups. I need a flat list of every individual — their name, their group, and their balance. Sort by who owes the most first.",
    functionName: "flattenAccounts",
    concepts: ["flatMap", "nested data", "multi-field sort"],
    starterCode: `const groups = [
  {
    group: "North District",
    members: [
      { name: "Ada",  balance: -500 },
      { name: "Bob",  balance:  200 },
    ]
  },
  {
    group: "South District",
    members: [
      { name: "Cara", balance: -800 },
      { name: "Dave", balance:  200 },
    ]
  },
];

function flattenAccounts(groups) {
  // groups: array of { group: string, members: { name: string, balance: number }[] }
  // Return a FLAT array of { name, group, balance }
  // Sorted by balance DESCENDING (highest first)
  // If balance is equal, sort by name ASCENDING (alphabetically)
}`,
    testCases: [
      { description: "Four members across two groups — sorted by balance then name", args: [[{ group: "North District", members: [{ name: "Ada", balance: -500 }, { name: "Bob", balance: 200 }] }, { group: "South District", members: [{ name: "Cara", balance: -800 }, { name: "Dave", balance: 200 }] }]], expected: [{ name: "Bob", group: "North District", balance: 200 }, { name: "Dave", group: "South District", balance: 200 }, { name: "Ada", group: "North District", balance: -500 }, { name: "Cara", group: "South District", balance: -800 }] },
      { description: "Single group with single member", args: [[{ group: "G", members: [{ name: "X", balance: 100 }] }]], expected: [{ name: "X", group: "G", balance: 100 }] },
      { description: "Equal balances sorted by name", args: [[{ group: "A", members: [{ name: "Zara", balance: 0 }, { name: "Anna", balance: 0 }] }]], expected: [{ name: "Anna", group: "A", balance: 0 }, { name: "Zara", group: "A", balance: 0 }] },
      { description: "Empty groups array", args: [[]], expected: [] },
      { description: "Group with empty members", args: [[{ group: "Empty", members: [] }]], expected: [] },
    ],
  },

  // ── TIER 3 — RELIC ──────────────────────────────────────────────────────────

  {
    id: "F-6", slug: "inventory-merge", title: "Inventory Merge",
    tier: 3, character: "ferrus", order: 6,
    rewardXp: 250, rewardGold: 200, rewardBadge: "",
    loreHook: "Two forges, two separate inventory lists — the Iron Warden split our records down the middle. Merge them into one clean list. If the same item appears in both, combine the quantities. Sort the result alphabetically.",
    functionName: "mergeInventory",
    concepts: ["merge arrays", "combine duplicates", "sort", "object manipulation"],
    starterCode: `const listA = [
  { name: "Iron",   qty: 10 },
  { name: "Steel",  qty: 5  },
  { name: "Copper", qty: 8  },
];

const listB = [
  { name: "Steel",  qty: 3  },
  { name: "Gold",   qty: 12 },
  { name: "Iron",   qty: 6  },
];

function mergeInventory(listA, listB) {
  // listA, listB: arrays of { name: string, qty: number }
  // Merge into ONE array — if a name appears in both, SUM the quantities
  // Sort the result alphabetically by name
  // Return array of { name, qty }
}`,
    testCases: [
      { description: "Steel and Iron appear in both — quantities summed", args: [[{ name: "Iron", qty: 10 }, { name: "Steel", qty: 5 }], [{ name: "Steel", qty: 3 }, { name: "Gold", qty: 12 }]], expected: [{ name: "Gold", qty: 12 }, { name: "Iron", qty: 10 }, { name: "Steel", qty: 8 }] },
      { description: "Second list is empty — returns first list sorted", args: [[{ name: "A", qty: 1 }], []], expected: [{ name: "A", qty: 1 }] },
      { description: "First list is empty — returns second list sorted", args: [[], [{ name: "B", qty: 5 }]], expected: [{ name: "B", qty: 5 }] },
      { description: "All items overlap — quantities doubled", args: [[{ name: "X", qty: 2 }, { name: "Y", qty: 3 }], [{ name: "X", qty: 2 }, { name: "Y", qty: 3 }]], expected: [{ name: "X", qty: 4 }, { name: "Y", qty: 6 }] },
      { description: "Only one item overlaps", args: [[{ name: "A", qty: 1 }, { name: "B", qty: 2 }, { name: "C", qty: 3 }], [{ name: "A", qty: 9 }]], expected: [{ name: "A", qty: 10 }, { name: "B", qty: 2 }, { name: "C", qty: 3 }] },
    ],
  },

  {
    id: "L-6", slug: "anagram-groups", title: "Anagram Groups",
    tier: 3, character: "lyra", order: 6,
    rewardXp: 250, rewardGold: 200, rewardBadge: "",
    loreHook: "The Weaver hides messages in anagrams — every word is a scrambled version of another. Group these words by their anagram sets. Each group reveals one fragment of the cipher.",
    functionName: "groupAnagrams",
    concepts: ["anagrams", "string sorting", "grouping", "complex object logic"],
    starterCode: `const words = [
  "listen", "silent", "enlist",
  "evil",   "vile",   "live",
  "forge",
];

function groupAnagrams(words) {
  // words: array of strings
  // Two words are anagrams if they use the same letters
  // Group words that are anagrams of each other
  // Sort each group alphabetically
  // Sort the outer array by the first word of each group alphabetically
  // Return array of arrays
}`,
    testCases: [
      { description: "Three words are all anagrams of each other", args: [["listen", "silent", "enlist"]], expected: [["enlist", "listen", "silent"]] },
      { description: "Six words forming two anagram groups plus lone word", args: [["eat", "tea", "ate", "tan", "nat", "bat"]], expected: [["ate", "eat", "tea"], ["bat"], ["nat", "tan"]] },
      { description: "Single word forms its own group", args: [["abc"]], expected: [["abc"]] },
      { description: "Two pairs of anagrams", args: [["ab", "ba", "cd", "dc"]], expected: [["ab", "ba"], ["cd", "dc"]] },
      { description: "Empty array returns empty array", args: [[]], expected: [] },
    ],
  },

];

async function main() {
  console.log(`\nSeeding ${newQuests.length} new quests...\n`);

  for (const q of newQuests) {
    const { testCases, ...rest } = q;
    await prisma.quest.upsert({
      where: { id: q.id },
      update: { ...rest, testCases: testCases as object[] },
      create: { ...rest, testCases: testCases as object[], isActive: true },
    });
    console.log(`  ✅  ${q.id} — ${q.title} (Tier ${q.tier})`);
  }

  const total = await prisma.quest.count();
  console.log(`\nDone. Total quests in DB: ${total}\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
