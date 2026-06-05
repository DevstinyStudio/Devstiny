import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function ago(days: number, hours = 0, minutes = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  d.setMinutes(d.getMinutes() - minutes);
  return d;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const hash = await bcrypt.hash("password123", 10);

  // ── Clear only forum test data (preserve user progress & costume) ──────────
  console.log("🗑️  Clearing forum test data...");
  await prisma.forumReply.deleteMany();
  await prisma.forumThread.deleteMany();
  await prisma.forumCategory.deleteMany();
  console.log("✅ Forum data cleared (user progress preserved).");

  // ── Costume Tiers ────────────────────────────────────────────────────────
  console.log("🌱 Seeding costume tiers...");

  const tiers = [
    { name: "COMMON",    price: 150,  color: "text-rpg-dim",    order: 1 },
    { name: "RARE",      price: 300,  color: "text-rpg-cyan",   order: 2 },
    { name: "EPIC",      price: 600,  color: "text-rpg-purple", order: 3 },
    { name: "LEGENDARY", price: 1200, color: "text-rpg-gold",   order: 4 },
  ];

  const createdTiers: Record<string, string> = {};
  for (const t of tiers) {
    const tier = await prisma.costumeTier.upsert({
      where: { name: t.name },
      update: {},
      create: t,
    });
    createdTiers[t.name] = tier.id;
  }
  console.log("✅ Costume tiers seeded.");

  // Assign all 184 costumes to COMMON by default
  const commonId = createdTiers["COMMON"];
  const FREE_COSTUMES = [1];
  for (let i = 1; i <= 184; i++) {
    await prisma.costumeConfig.upsert({
      where: { costumeId: i },
      update: {},
      create: { costumeId: i, tierId: commonId, isFree: FREE_COSTUMES.includes(i) },
    });
  }
  console.log("✅ Costume configs seeded (184 costumes → COMMON).");

  // ── Books ────────────────────────────────────────────────────────────────
  console.log("🌱 Seeding books...");

  const booksData = [
    { slug: "html", volume: "VOL. I", title: "The Structure Codex", subtitle: "HTML — The Blueprint Language", author: "ELVAR", color: "text-rpg-red", border: "border-rpg-red", icon: "◉", coverImage: "/book/book-1.png", defaultLang: "html", status: "available", order: 1,
      description: "The foundational language of every page on the web. HTML gives structure to content — not style, not behavior. Just structure.",
      chapters: [
        { title: "What is HTML?", topics: ["Documents", "The Browser", "Rendering"], content: "HTML — HyperText Markup Language — is the language that describes the structure of a web page.", example: `<!DOCTYPE html>\n<html lang="en">\n  <head><title>My Page</title></head>\n  <body><h1>Hello</h1></body>\n</html>`, order: 1 },
        { title: "Elements & Tags", topics: ["Opening & Closing", "Void Elements", "Nesting Rules"], content: "An HTML element consists of an opening tag, content, and a closing tag.", example: `<p>A <strong>paragraph</strong> with <em>emphasis</em>.</p>\n<img src="photo.jpg" alt="A photo" />`, order: 2 },
        { title: "Document Structure", topics: ["DOCTYPE", "head & body", "Meta Tags"], content: "Every HTML document begins with a DOCTYPE declaration.", example: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <title>Page Title</title>\n  </head>\n  <body></body>\n</html>`, order: 3 },
        { title: "Text Content", topics: ["Headings", "Paragraphs", "Lists", "Emphasis"], content: "Headings run from h1 (most important) to h6 (least important).", example: `<h1>Main Heading</h1>\n<p>A paragraph with <em>emphasis</em>.</p>\n<ul><li>First item</li></ul>`, order: 4 },
        { title: "Links & Navigation", topics: ["Anchor Tags", "href", "Relative vs Absolute"], content: "Links are created with the a (anchor) element.", example: `<a href="https://example.com">Visit Example</a>\n<a href="/about">About Page</a>`, order: 5 },
        { title: "Images & Media", topics: ["img", "alt Text", "width & height"], content: "The img element displays an image.", example: `<img src="/images/cat.jpg" alt="A tabby cat" />\n<img src="/banner.png" alt="Welcome" width="800" height="200" />`, order: 6 },
        { title: "Forms", topics: ["input", "label", "select", "button"], content: "Forms collect user input.", example: `<form action="/submit" method="POST">\n  <label for="name">Name:</label>\n  <input type="text" id="name" name="name" />\n  <button type="submit">Submit</button>\n</form>`, order: 7 },
        { title: "Semantic HTML", topics: ["header", "main", "section", "article", "footer"], content: "Semantic elements describe the meaning of the content they contain.", example: `<header><nav><a href="/">Home</a></nav></header>\n<main><article><h1>Title</h1></article></main>\n<footer><p>© 2026</p></footer>`, order: 8 },
      ]
    },
    { slug: "css", volume: "VOL. II", title: "The Appearance Compendium", subtitle: "CSS — The Rule System", author: "ELVAR & LYRA", color: "text-rpg-purple", border: "border-rpg-purple", icon: "◈", coverImage: "/book/book-12.png", defaultLang: "css", status: "available", order: 2,
      description: "CSS is not about making things beautiful — it is about writing rules that reliably produce a specific appearance.",
      chapters: [
        { title: "How CSS Works", topics: ["Stylesheets", "Selectors", "The Cascade"], content: "CSS applies visual rules to HTML elements.", example: `body {\n  background-color: #1a1a2e;\n  color: #e0e0e0;\n}`, order: 1 },
        { title: "Selectors", topics: ["Element", "Class", "ID", "Combinators", "Pseudo-classes"], content: "Selectors target which HTML elements a rule applies to.", example: `p { color: gray; }\n.highlight { background: yellow; }\n#header { position: fixed; }\nbutton:hover { opacity: 0.8; }`, order: 2 },
        { title: "The Box Model", topics: ["margin", "border", "padding", "content"], content: "Every element in CSS is a box.", example: `.card {\n  box-sizing: border-box;\n  width: 300px;\n  padding: 20px;\n  border: 2px solid #333;\n  margin: 10px;\n}`, order: 3 },
        { title: "Typography", topics: ["font-family", "font-size", "line-height", "color"], content: "Typography in CSS controls how text looks and reads.", example: `body {\n  font-family: 'Inter', Arial, sans-serif;\n  font-size: 16px;\n  line-height: 1.6;\n}`, order: 4 },
        { title: "Layout: Flexbox", topics: ["flex-direction", "justify-content", "align-items", "flex-wrap"], content: "Flexbox is a one-dimensional layout system.", example: `.container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 16px;\n}`, order: 5 },
        { title: "Layout: Grid", topics: ["grid-template", "grid-column", "grid-row", "gap"], content: "CSS Grid is a two-dimensional layout system.", example: `.grid {\n  display: grid;\n  grid-template-columns: 1fr 2fr 1fr;\n  gap: 24px;\n}`, order: 6 },
        { title: "Positioning", topics: ["static", "relative", "absolute", "fixed", "sticky"], content: "By default, elements have position: static and flow normally.", example: `.parent { position: relative; }\n.badge { position: absolute; top: -8px; right: -8px; }\nnav { position: sticky; top: 0; }`, order: 7 },
        { title: "Responsive Design", topics: ["Media Queries", "Viewport Units", "Mobile First"], content: "Responsive design makes layouts work across screen sizes.", example: `.card { width: 100%; }\n@media (min-width: 768px) { .card { width: 50%; } }\n@media (min-width: 1024px) { .card { width: 33.33%; } }`, order: 8 },
      ]
    },
    { slug: "javascript", volume: "VOL. III", title: "The Logic Manual", subtitle: "JavaScript — The Behavior Layer", author: "ELVAR & SOMERS", color: "text-rpg-gold", border: "border-rpg-gold", icon: "★", coverImage: "/book/book-23.png", defaultLang: "javascript", status: "available", order: 3,
      description: "JavaScript makes the web react — to clicks, to time, to data.",
      chapters: [
        { title: "Variables & Types", topics: ["let", "const", "var", "Strings", "Numbers", "Booleans"], content: "Variables store values. Use const for values that won't be reassigned, let for values that will change.", example: `const name = "Elvar";\nlet xp = 1500;\nconst isActive = true;\nconsole.log(typeof name); // "string"`, order: 1 },
        { title: "Operators", topics: ["Arithmetic", "Comparison", "Logical", "Assignment"], content: "Arithmetic operators perform math. Use === (strict equality) not ==.", example: `const total = 100 + 50 * 2;\nconsole.log(1 === "1"); // false\nconst canEnter = isLoggedIn && hasPermission;`, order: 2 },
        { title: "Control Flow", topics: ["if / else", "switch", "Ternary Operator"], content: "if/else runs code only when a condition is true.", example: `if (xp >= 1000) {\n  console.log("Level up!");\n} else {\n  console.log("Keep going");\n}\nconst label = isLoggedIn ? "Dashboard" : "Login";`, order: 3 },
        { title: "Functions", topics: ["Declaration", "Arrow Functions", "Parameters", "Return"], content: "Functions are reusable blocks of code.", example: `function greet(name) { return "Hello, " + name; }\nconst greet = (name) => "Hello, " + name;\nconst createPlayer = (username, level = 1) => ({ username, level });`, order: 4 },
        { title: "Arrays", topics: ["Creating", "map", "filter", "reduce", "forEach"], content: "Arrays store ordered lists of values.", example: `const scores = [85, 92, 78];\nconst doubled = scores.map(s => s * 2);\nconst passing = scores.filter(s => s >= 80);\nconst total = scores.reduce((sum, s) => sum + s, 0);`, order: 5 },
        { title: "Objects", topics: ["Properties", "Methods", "Destructuring", "Spread"], content: "Objects store key-value pairs.", example: `const player = { username: "Elvar", level: 12 };\nconst { username, level } = player;\nconst updated = { ...player, level: 13 };`, order: 6 },
        { title: "Loops", topics: ["for", "while", "for...of", "for...in"], content: "Loops run blocks of code repeatedly.", example: `for (let i = 0; i < 5; i++) { console.log(i); }\nfor (const chapter of chapters) { console.log(chapter); }`, order: 7 },
        { title: "Async JavaScript", topics: ["Callbacks", "Promises", "async/await", "fetch"], content: "JavaScript is single-threaded. Async operations don't block execution.", example: `async function getPlayer(id) {\n  try {\n    const res = await fetch(\`/api/players/\${id}\`);\n    return await res.json();\n  } catch (error) { console.error(error); }\n}`, order: 8 },
      ]
    },
    { slug: "dom", volume: "VOL. IV", title: "The Interface Manuscript", subtitle: "The DOM — Connecting Code to Page", author: "ELVAR & SOMERS", color: "text-rpg-cyan", border: "border-rpg-cyan", icon: "◆", coverImage: "/book/book-34.png", defaultLang: "javascript", status: "available", order: 4,
      description: "The DOM is the bridge between JavaScript and what the user sees.",
      chapters: [
        { title: "What is the DOM?", topics: ["Tree Structure", "Nodes", "Elements vs Attributes"], content: "The DOM is a programming interface for HTML documents.", example: `console.log(document.body);\nconsole.log(document.documentElement);`, order: 1 },
        { title: "Selecting Elements", topics: ["querySelector", "getElementById", "querySelectorAll"], content: "querySelector returns the first matching element for a CSS selector.", example: `const header = document.querySelector("h1");\nconst cards = document.querySelectorAll(".card");\nconst arr = Array.from(cards);`, order: 2 },
        { title: "Modifying Content", topics: ["textContent", "innerHTML", "setAttribute"], content: "textContent reads and sets the text content of an element safely.", example: `title.textContent = "New Title";\nlink.setAttribute("href", "/new-page");\nconsole.log(link.getAttribute("href"));`, order: 3 },
        { title: "Modifying Styles", topics: ["style property", "classList", "add / remove / toggle"], content: "classList is a better approach than the style property.", example: `btn.classList.add("active");\nbtn.classList.remove("disabled");\nbtn.classList.toggle("hidden");`, order: 4 },
        { title: "Creating Elements", topics: ["createElement", "appendChild", "insertBefore", "remove"], content: "createElement creates a new element node.", example: `const li = document.createElement("li");\nli.textContent = "New item";\nul.appendChild(li);\nold.remove();`, order: 5 },
        { title: "Events", topics: ["addEventListener", "Event Types", "Event Object", "Bubbling"], content: "Events are signals that something happened.", example: `btn.addEventListener("click", (event) => {\n  event.preventDefault();\n  console.log("Clicked:", event.target);\n});`, order: 6 },
        { title: "Forms & Input", topics: ["Reading Values", "Validation", "Submit Events"], content: "Input values are read via the value property.", example: `form.addEventListener("submit", (e) => {\n  e.preventDefault();\n  const username = input.value.trim();\n  if (!username) return;\n});`, order: 7 },
        { title: "Traversal", topics: ["parentElement", "children", "nextSibling", "closest"], content: "DOM traversal moves between related elements.", example: `console.log(item.parentElement);\nconsole.log(item.children);\nconst card = e.target.closest(".card");`, order: 8 },
      ]
    },
    { slug: "web-fundamentals", volume: "VOL. V", title: "The Foundations Archive", subtitle: "How the Web Actually Works", author: "ELVAR", color: "text-rpg-green", border: "border-rpg-green", icon: "◈", coverImage: "/book/book-45.png", defaultLang: "javascript", status: "available", order: 5,
      description: "Most developers spend years writing code before understanding what happens between typing a URL and seeing a page.",
      chapters: [
        { title: "The Internet vs The Web", topics: ["Networks", "Protocols", "Servers & Clients"], content: "The internet is a global network of connected computers. The web is one system that runs on the internet.", example: `// Client sends: GET https://devstiny.com/path HTTP/1.1\n// Server responds: HTTP/1.1 200 OK`, order: 1 },
        { title: "HTTP & HTTPS", topics: ["Request / Response", "Methods", "Status Codes"], content: "HTTP is the protocol browsers use to communicate with servers.", example: `GET /api/players/123 HTTP/1.1\nAuthorization: Bearer eyJhbGci...\n// 200 OK | 404 Not Found | 500 Server Error`, order: 2 },
        { title: "URLs & DNS", topics: ["Anatomy of a URL", "Domain Resolution", "Paths"], content: "A URL is an address with protocol, domain, path, query, and fragment.", example: `https://devstiny.com/books/html?page=2#chapter-3\n// protocol://domain/path?query#fragment`, order: 3 },
        { title: "Browsers", topics: ["Rendering Engine", "JavaScript Engine", "DevTools"], content: "A browser has a rendering engine, a JavaScript engine, and developer tools.", example: `// Open DevTools with F12\ndocument.title = "Devstiny"\nconsole.log(window.location.href)`, order: 4 },
        { title: "HTML → Screen", topics: ["Parsing", "DOM Tree", "CSSOM", "Render Tree"], content: "When a browser receives HTML, it parses it into a DOM tree.", example: `// Pipeline: Parse HTML → DOM → CSSOM → Render Tree → Layout → Paint\nbtn.style.width = "200px"; // write\nconst h = btn.offsetHeight; // read (forces layout!)`, order: 5 },
        { title: "Performance Basics", topics: ["File Size", "Network Requests", "Caching"], content: "Page performance affects user experience and search rankings.", example: `<img src="large.jpg" loading="lazy" alt="..." />\n<script src="analytics.js" defer></script>`, order: 6 },
        { title: "Accessibility", topics: ["Semantic HTML", "ARIA", "Keyboard Navigation"], content: "Accessibility means making web pages usable by people who rely on assistive technologies.", example: `<button onclick="submit()">Submit</button>\n<label for="email">Email address</label>\n<input type="email" id="email" />`, order: 7 },
        { title: "Developer Tools", topics: ["Inspector", "Console", "Network Tab", "Sources"], content: "The Network tab shows every request the page makes.", example: `console.log("Output");\nconsole.table([{name: "Elvar", level: 12}]);\nconsole.time("label"); /* ... */ console.timeEnd("label");`, order: 8 },
      ]
    },
    { slug: "developer-mindset", volume: "VOL. VI", title: "The Mindset Codex", subtitle: "Thinking Like a Developer", author: "ELVAR", color: "text-rpg-purple", border: "border-rpg-purple", icon: "◈", coverImage: "/book/book-56.png", defaultLang: "javascript", status: "coming-soon", order: 6,
      description: "The language is the easy part. The hard part is knowing how to think through a problem you have never seen before.",
      chapters: [
        { title: "Reading Error Messages", topics: ["Stack Traces", "Common Errors", "Where to Look"], content: "Read the error message. Not just the first line — the whole thing. It is trying to help you.", example: `// TypeError: Cannot read properties of undefined\n// → something is undefined before you use it\nconsole.log(obj?.property); // use optional chaining`, order: 1 },
        { title: "Debugging Systematically", topics: ["Isolating the Problem", "console.log", "Breakpoints"], content: "Debugging is not failure. Debugging is the work.", example: `console.log("checkpoint 1", data);\n// Use breakpoints in DevTools Sources tab`, order: 2 },
      ]
    },
  ];

  for (const b of booksData) {
    const { chapters, ...bookData } = b;
    const book = await prisma.book.upsert({
      where: { slug: bookData.slug },
      update: { title: bookData.title, status: bookData.status, order: bookData.order, coverImage: bookData.coverImage },
      create: bookData,
    });
    // Seed chapters only if none exist
    const existing = await prisma.bookChapter.count({ where: { bookId: book.id } });
    if (existing === 0) {
      await prisma.bookChapter.createMany({
        data: chapters.map((ch) => ({ ...ch, bookId: book.id })),
      });
    }
  }
  console.log(`✅ Books seeded: ${booksData.length} books.`);

  // ── Quests ───────────────────────────────────────────────────────────────
  console.log("🌱 Seeding quests...");

  const questData = [
    {
      id: "F-1", slug: "weapon-ledger", title: "Weapon Ledger", tier: 1, character: "ferrus", order: 1,
      loreHook: "Before we fix this Realm, I need to know what weapons we actually have. I made the list — but everything's mixed together. Separate the heavy from the light. Over 5 kg on the left, the rest on the right.",
      functionName: "separateByWeight",
      starterCode: `const weapons = [\n  { name: "Warhammer", weight: 8 },\n  { name: "Dagger", weight: 1.2 },\n  { name: "Greatsword", weight: 6.5 },\n  { name: "Shortbow", weight: 2.3 },\n  { name: "Battleaxe", weight: 7.1 },\n  { name: "Throwing Knife", weight: 0.4 }\n];\n\nfunction separateByWeight(weapons) {\n  // your code here\n}`,
      concepts: ["Array of objects", "filter()", "conditional"],
      testCases: [
        { description: "Separates heavy (>5kg) and light (≤5kg)", args: [[{ name: "Warhammer", weight: 8 }, { name: "Dagger", weight: 1.2 }]], expected: { heavy: ["Warhammer"], light: ["Dagger"] } }
      ],
      rewardXp: 75, rewardGold: 50, rewardBadge: "Weapon Sorter", isActive: true,
    },
    {
      id: "F-2", slug: "forge-order", title: "Forge Order", tier: 1, character: "ferrus", order: 2,
      loreHook: "Ten weapon orders came in from across the Realm. They need this list sorted by wait time — whoever's been waiting longest gets priority.",
      functionName: "sortByWaitTime",
      starterCode: `function sortByWaitTime(orders) {\n  // your code here\n}`,
      concepts: ["Array of objects", "sort()", "comparator function"],
      testCases: [
        { description: "Sorts orders by waitDays descending", args: [[{ name: "Axe", waitDays: 3 }, { name: "Sword", waitDays: 7 }]], expected: ["Sword", "Axe"] }
      ],
      rewardXp: 75, rewardGold: 50, rewardBadge: "Forge Master", isActive: true,
    },
    {
      id: "F-3", slug: "material-audit", title: "Material Audit", tier: 2, character: "ferrus", order: 3,
      loreHook: "Iron Warden corrupted the warehouse records. Now I have a material list with duplicates and items with zero stock. I need a clean list — no duplicates, nothing with zero stock.",
      functionName: "cleanMaterials",
      starterCode: `function cleanMaterials(materials) {\n  // your code here\n}`,
      concepts: ["filter()", "deduplication (Map/Set)", "sort() string"],
      testCases: [
        { description: "Removes duplicates and zero-stock items", args: [[{ name: "Iron", qty: 5 }, { name: "Iron", qty: 5 }, { name: "Coal", qty: 0 }]], expected: ["Iron"] }
      ],
      rewardXp: 150, rewardGold: 120, rewardBadge: "Auditor", isActive: true,
    },
    {
      id: "L-1", slug: "formula-decoder", title: "Formula Decoder", tier: 1, character: "lyra", order: 4,
      loreHook: "Every illusion The Weaver creates has a pattern underneath. I have records of twenty transformations — I need to know how many of each type were used.",
      functionName: "countTransformations",
      starterCode: `function countTransformations(records) {\n  // your code here\n}`,
      concepts: ["forEach", "object accumulator", "counting"],
      testCases: [
        { description: "Counts each transformation type", args: [["fire", "ice", "fire", "wind"]], expected: { fire: 2, ice: 1, wind: 1 } }
      ],
      rewardXp: 75, rewardGold: 50, rewardBadge: "Decoder", isActive: true,
    },
    {
      id: "L-2", slug: "transmutation-log", title: "Transmutation Log", tier: 1, character: "lyra", order: 5,
      loreHook: "There are six materials in my lab. Each one has a pure value and a corrupted value. I need to know which one has the largest gap between the two.",
      functionName: "findLargestGap",
      starterCode: `function findLargestGap(materials) {\n  // your code here\n}`,
      concepts: ["reduce", "Math.abs", "max value"],
      testCases: [
        { description: "Returns the material with largest gap", args: [[{ name: "Iron", pure: 10, corrupted: 3 }, { name: "Gold", pure: 20, corrupted: 18 }]], expected: "Iron" }
      ],
      rewardXp: 75, rewardGold: 50, rewardBadge: "Analyst", isActive: true,
    },
    {
      id: "L-3", slug: "illusion-classifier", title: "Illusion Classifier", tier: 2, character: "lyra", order: 6,
      loreHook: "The Weaver uses a combination of techniques for each illusion. I need a list of all methods used — no duplicates, sorted by frequency with the most common first.",
      functionName: "classifyMethods",
      starterCode: `function classifyMethods(illusions) {\n  // your code here\n}`,
      concepts: ["flat()", "Map", "sort by frequency"],
      testCases: [
        { description: "Returns methods sorted by frequency", args: [[["fire", "ice"], ["fire", "wind"], ["fire"]]], expected: ["fire", "ice", "wind"] }
      ],
      rewardXp: 150, rewardGold: 120, rewardBadge: "Classifier", isActive: true,
    },
    {
      id: "S-1", slug: "profile-scan", title: "Profile Scan", tier: 1, character: "somers", order: 7,
      loreHook: "The Phantom Broker left a leaked resident database. I've already isolated the data — but I need to know who's living in the danger zone. Filter anyone over 40 within 5km of the anomaly.",
      functionName: "filterDangerZone",
      starterCode: `function filterDangerZone(residents) {\n  // your code here\n}`,
      concepts: ["filter()", "multiple conditions", "array"],
      testCases: [
        { description: "Returns residents over 40 within 5km", args: [[{ name: "Ada", age: 45, distance: 3 }, { name: "Bob", age: 30, distance: 2 }]], expected: ["Ada"] }
      ],
      rewardXp: 75, rewardGold: 50, rewardBadge: "Scanner", isActive: true,
    },
    {
      id: "S-2", slug: "null-ledger", title: "The Null Ledger", tier: 2, character: "somers", order: 8,
      loreHook: "The Phantom Broker hid null values inside his transaction records — every null represents stolen data. Calculate the total value of valid (non-null) transactions.",
      functionName: "sumValidTransactions",
      starterCode: `function sumValidTransactions(transactions) {\n  // your code here\n}`,
      concepts: ["filter()", "null check", "reduce"],
      testCases: [
        { description: "Sums only non-null values", args: [[100, null, 200, null, 50]], expected: 350 }
      ],
      rewardXp: 150, rewardGold: 120, rewardBadge: "Auditor", isActive: true,
    },
    {
      id: "S-3", slug: "loop-breakers-debt", title: "Loop Breaker's Debt", tier: 3, character: "somers", order: 9,
      loreHook: "The Phantom Broker had a data collection function — ran on every resident, looping endlessly, with no exit. It's corrupt: it marks residents as debtors if their balance drops below zero at any point during the loop.",
      functionName: "findDebtors",
      starterCode: `function findDebtors(accounts) {\n  // your code here\n}`,
      concepts: ["reduce", "running total", "conditional tracking"],
      testCases: [
        { description: "Identifies accounts that go negative", args: [[{ name: "Ada", transactions: [100, -150, 50] }, { name: "Bob", transactions: [200, -100] }]], expected: ["Ada"] }
      ],
      rewardXp: 300, rewardGold: 250, rewardBadge: "Loop Breaker", isActive: true,
    },
  ];

  for (const q of questData) {
    await prisma.quest.upsert({
      where: { id: q.id },
      update: { title: q.title, tier: q.tier, loreHook: q.loreHook, rewardXp: q.rewardXp, rewardGold: q.rewardGold, rewardBadge: q.rewardBadge, isActive: q.isActive },
      create: q,
    });
  }
  console.log(`✅ Quests seeded: ${questData.length} quests.`);

  // ── Forum Categories ─────────────────────────────────────────────────────
  console.log("🌱 Seeding forum categories...");

  await prisma.forumCategory.createMany({
    skipDuplicates: true,
    data: [
      {
        slug: "tavern",
        title: "The Tavern",
        description: "General talk. Introduce yourself. Share what you've been learning.",
        gem: "/gem/gem-6.png",
        color: "text-rpg-gold",
        order: 1,
      },
      {
        slug: "oracle",
        title: "The Oracle",
        description: "Ask anything about quests, the Books, or your adventure. No question is too small.",
        gem: "/gem/gem-14.png",
        color: "text-rpg-cyan",
        order: 2,
      },
      {
        slug: "hall-of-champions",
        title: "Hall of Champions",
        description: "Show your projects, get feedback, inspire others.",
        gem: "/gem/gem-22.png",
        color: "text-rpg-green",
        order: 3,
      },
      {
        slug: "guild-board",
        title: "Guild Board",
        description: "Looking for study partners? Form a guild or recruit new members.",
        gem: "/gem/gem-33.png",
        color: "text-rpg-purple",
        order: 4,
      },
    ],
  });

  console.log("✅ Forum categories seeded.");

  // ── Admin User ───────────────────────────────────────────────────────────
  console.log("🌱 Seeding admin user...");

  await prisma.player.upsert({
    where: { email: "admin@devstiny.com" },
    update: { role: "ADMIN" },
    create: {
      email: "admin@devstiny.com",
      username: "admin",
      passwordHash: hash,
      role: "ADMIN",
      progress: { create: { xp: 0 } },
    },
  });

  console.log("✅ Admin user: admin@devstiny.com / password123");

  console.log("🌱 Seeding users...");

  // ── 5 Dummy Players ──────────────────────────────────────────────────────
  const [shadowbyte, runeweaver, ironscribe, voidcaster, lyra] =
    await Promise.all([
      prisma.player.upsert({
        where: { email: "shadowbyte@devstiny.com" },
        update: {},
        create: {
          email: "shadowbyte@devstiny.com",
          username: "shadowbyte",
          passwordHash: hash,
          progress: {
            create: {
              xp: 2400,
              gold: 870,
              currentChapter: "chapter-2",
              completedChapters: ["prologue", "chapter-1"],
              completedScenes: [
                "prologue/act-1", "prologue/act-2", "prologue/act-3",
                "chapter-1/act-1", "chapter-1/act-2", "chapter-1/act-3",
              ],
              flags: { equippedBadge: "code-initiate" },
            },
          },
        },
      }),

      prisma.player.upsert({
        where: { email: "runeweaver@devstiny.com" },
        update: {},
        create: {
          email: "runeweaver@devstiny.com",
          username: "runeweaver",
          passwordHash: hash,
          progress: {
            create: {
              xp: 5100,
              gold: 1980,
              currentChapter: "chapter-3",
              completedChapters: ["prologue", "chapter-1", "chapter-2"],
              completedScenes: [
                "prologue/act-1", "prologue/act-2", "prologue/act-3",
                "chapter-1/act-1", "chapter-1/act-2", "chapter-1/act-3",
                "chapter-2/act-1", "chapter-2/act-2", "chapter-2/act-3",
              ],
              flags: { equippedBadge: "gate-breaker" },
            },
          },
        },
      }),

      prisma.player.upsert({
        where: { email: "ironscribe@devstiny.com" },
        update: {},
        create: {
          email: "ironscribe@devstiny.com",
          username: "ironscribe",
          passwordHash: hash,
          progress: {
            create: {
              xp: 650,
              gold: 240,
              currentChapter: "chapter-1",
              completedChapters: ["prologue"],
              completedScenes: [
                "prologue/act-1", "prologue/act-2", "prologue/act-3",
              ],
              flags: {},
            },
          },
        },
      }),

      prisma.player.upsert({
        where: { email: "voidcaster@devstiny.com" },
        update: {},
        create: {
          email: "voidcaster@devstiny.com",
          username: "voidcaster",
          passwordHash: hash,
          progress: {
            create: {
              xp: 3200,
              gold: 1100,
              currentChapter: "chapter-2",
              completedChapters: ["prologue", "chapter-1"],
              completedScenes: [
                "prologue/act-1", "prologue/act-2", "prologue/act-3",
                "chapter-1/act-1", "chapter-1/act-2", "chapter-1/act-3",
                "chapter-2/act-1",
              ],
              flags: { equippedBadge: "code-initiate" },
            },
          },
        },
      }),

      prisma.player.upsert({
        where: { email: "lyra@devstiny.com" },
        update: {},
        create: {
          email: "lyra@devstiny.com",
          username: "guildmaster_lyra",
          passwordHash: hash,
          progress: {
            create: {
              xp: 6800,
              gold: 2550,
              currentChapter: "chapter-3",
              completedChapters: ["prologue", "chapter-1", "chapter-2"],
              completedScenes: [
                "prologue/act-1", "prologue/act-2", "prologue/act-3",
                "chapter-1/act-1", "chapter-1/act-2", "chapter-1/act-3",
                "chapter-2/act-1", "chapter-2/act-2", "chapter-2/act-3",
                "quest/weapon-ledger", "quest/style-scroll",
              ],
              flags: { equippedBadge: "gate-breaker" },
            },
          },
        },
      }),
    ]);

  console.log("✅ Users created:", [shadowbyte, runeweaver, ironscribe, voidcaster, lyra].map(p => p.username));

  // ── Forum Threads ────────────────────────────────────────────────────────
  console.log("🌱 Seeding forum threads...");

  // ── Thread 1: Quest Help (SOLVED) ────────────────────────────────────────
  const thread1 = await prisma.forumThread.create({
    data: {
      title: "How does flexbox justify-content actually work? CSS Vol. II Chapter 5",
      content: `I've been going through the CSS volume and I'm on the flexbox chapter. I understand that justify-content aligns items on the main axis, but I can't figure out when the different values actually make a difference.

I tried "space-between" on a container with two items and it worked fine, but when I tried "space-around" it looked almost the same. Is there actually a difference or am I missing something?

Here's what I have:

.container {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

Am I supposed to remove the gap when using space-between?`,
      category: "oracle",
      authorId: shadowbyte.id,
      views: 340,
      solved: true,
      createdAt: ago(0, 2),
      updatedAt: ago(0, 1),
    },
  });

  await prisma.forumReply.createMany({
    data: [
      {
        content: `Great question — this trips up a lot of people.

The key difference between space-between, space-around, and space-evenly is where the space goes:

- space-between: puts space BETWEEN items. No space at the edges.
- space-around: each item gets equal space on both sides. So edge items have half as much space as items in the middle.
- space-evenly: every gap — including the edges — is equal.

Your setup with gap AND space-between is technically redundant. Best practice: use gap for consistent spacing between items, and use justify-content when you want items spread across the full container width.`,
        threadId: thread1.id,
        authorId: runeweaver.id,
        likes: 14,
        isAnswer: true,
        createdAt: ago(0, 1, 45),
      },
      {
        content: `Adding on — the difference becomes very obvious when you have many items. Try putting 5 or 6 items in a container with space-around, then switch to space-evenly. For most layouts I just use gap + flex-start and don't touch justify-content unless I need items spread across the container.`,
        threadId: thread1.id,
        authorId: ironscribe.id,
        likes: 7,
        isAnswer: false,
        createdAt: ago(0, 1, 20),
      },
      {
        content: `This makes total sense now. Tried it with 5 items and the difference is really clear. Marking runeweaver's reply as the answer. Thanks!`,
        threadId: thread1.id,
        authorId: shadowbyte.id,
        likes: 2,
        isAnswer: false,
        createdAt: ago(0, 0, 58),
      },
    ],
  });

  // ── Thread 2: The Tavern ──────────────────────────────────────────────────
  const thread2 = await prisma.forumThread.create({
    data: {
      title: "Just completed Chapter 1! This is the best way I've learned to code.",
      content: `I've tried three different platforms before this. Video courses, interactive exercises, the usual stuff. I always quit around week two.

I finished Chapter 1 last night around midnight and I didn't even realize how long I'd been going. The quest framing genuinely made me not want to stop.

I think the thing that works for me here is that the story actually cares about the code. Anyway, just wanted to say this to someone. My friends don't care about programming. On to Chapter 2!`,
      category: "tavern",
      authorId: ironscribe.id,
      views: 891,
      solved: false,
      createdAt: ago(0, 5),
      updatedAt: ago(0, 2),
    },
  });

  await prisma.forumReply.createMany({
    data: [
      {
        content: `Chapter 2 is where it gets really good. The lore picks up and the JS content gets genuinely interesting. Don't skip the dialogues.`,
        threadId: thread2.id,
        authorId: voidcaster.id,
        likes: 19,
        isAnswer: false,
        createdAt: ago(0, 4, 30),
      },
      {
        content: `Welcome to the guild! If you want study partners, check the Guild Board. We run a weekly session on Fridays — all levels welcome, mostly people working through the same chapters.`,
        threadId: thread2.id,
        authorId: lyra.id,
        likes: 11,
        isAnswer: false,
        createdAt: ago(0, 4),
      },
      {
        content: `Same experience here. Chapter 1 has a difficulty spike around Act 4 but push through it — the payoff is worth it.`,
        threadId: thread2.id,
        authorId: shadowbyte.id,
        likes: 8,
        isAnswer: false,
        createdAt: ago(0, 3),
      },
    ],
  });

  // ── Thread 3: Hall of Champions ───────────────────────────────────────────
  const thread3 = await prisma.forumThread.create({
    data: {
      title: "Built my first portfolio site — feedback welcome",
      content: `After completing Chapter 2, I decided to take a break from the main path and actually build something. This is my first portfolio site — built with only HTML and CSS (no JavaScript yet).

Things I know still need work:
- Mobile layout on very small screens
- The nav bar needs some love
- Colors might be too dark

I used the Semantic HTML chapter from the Books section as a reference for the structure, which helped a lot. Would love specific feedback rather than general "looks good".`,
      category: "hall-of-champions",
      authorId: runeweaver.id,
      views: 214,
      solved: false,
      createdAt: ago(0, 8),
      updatedAt: ago(0, 5),
    },
  });

  await prisma.forumReply.createMany({
    data: [
      {
        content: `Solid work for a first project. Your HTML structure is genuinely good — I can see you used header, main, section, footer correctly. A lot of beginners just use divs for everything. Two quick things: add hover states to your nav links, and check contrast on that one light-on-light section.`,
        threadId: thread3.id,
        authorId: ironscribe.id,
        likes: 9,
        isAnswer: false,
        createdAt: ago(0, 7),
      },
      {
        content: `For the mobile layout — look into media queries. The responsive design chapter in CSS Vol. II covers it well. Specifically the mobile-first approach where you write base styles for mobile and add complexity for larger screens.`,
        threadId: thread3.id,
        authorId: shadowbyte.id,
        likes: 5,
        isAnswer: false,
        createdAt: ago(0, 6, 30),
      },
    ],
  });

  // ── Thread 4: Guild Board ─────────────────────────────────────────────────
  const thread4 = await prisma.forumThread.create({
    data: {
      title: "Recruiting: JavaScript Guild — beginner friendly, 3x weekly sessions",
      content: `The JavaScript Guild is looking for new members.

WHO WE ARE:
We're a group of 14 people working through Chapters 1–3 together. Most of us are beginners or early intermediate. We meet three times a week via text chat (no voice required).

WHAT WE DO:
- Share progress and stuck points
- Code review each other's quest solutions
- Weekly challenge: build something small with the week's chapter content

REQUIREMENTS:
- Active at least 3x per week
- Currently working on Chapter 1, 2, or 3

SESSIONS: Monday 7PM, Wednesday 7PM, Saturday 2PM (UTC+7)

Reply here or DM me if interested. We have 3 spots open.`,
      category: "guild-board",
      authorId: lyra.id,
      views: 1203,
      solved: false,
      createdAt: ago(1),
      updatedAt: ago(0, 17),
    },
  });

  await prisma.forumReply.createMany({
    data: [
      {
        content: `Interested! I'm on Chapter 2 Act 3. The Monday and Wednesday times work for me. DMing you now.`,
        threadId: thread4.id,
        authorId: voidcaster.id,
        likes: 4,
        isAnswer: false,
        createdAt: ago(0, 23),
      },
      {
        content: `Just finished Chapter 1 and would love a study group. Saturday time is best for me. Sent a DM.`,
        threadId: thread4.id,
        authorId: ironscribe.id,
        likes: 3,
        isAnswer: false,
        createdAt: ago(0, 20),
      },
    ],
  });

  // ── Thread 5: Quest Help (SOLVED) ────────────────────────────────────────
  const thread5 = await prisma.forumThread.create({
    data: {
      title: "Async/await — when do I use try/catch and when is it not needed?",
      content: `Going through the Async JavaScript chapter and I'm confused about error handling.

The examples use try/catch inside async functions when calling fetch. But I've seen code that just uses .catch() on the promise directly without try/catch.

When do you actually need try/catch vs just .catch()? And are there cases where you don't need either?`,
      category: "oracle",
      authorId: voidcaster.id,
      views: 188,
      solved: true,
      createdAt: ago(1),
      updatedAt: ago(0, 21),
    },
  });

  await prisma.forumReply.createMany({
    data: [
      {
        content: `Short version:

- Inside async functions, use try/catch. It's the idiomatic way to handle errors when using await.
- .catch() is for promise chains (the older .then()/.catch() style).
- You can mix them, but don't. Pick one style and stick to it.

When to not use either? When you genuinely don't care about errors — like analytics pings. But for anything user-facing, always handle the error. A fetch failing silently is worse than showing an error message.`,
        threadId: thread5.id,
        authorId: runeweaver.id,
        likes: 16,
        isAnswer: true,
        createdAt: ago(0, 23),
      },
      {
        content: `Also worth knowing: if you await a rejected promise without try/catch, you'll get an unhandled rejection error. In browsers this is a warning; in Node.js it can crash the process. Always catch it unless you have a reason not to.`,
        threadId: thread5.id,
        authorId: ironscribe.id,
        likes: 7,
        isAnswer: false,
        createdAt: ago(0, 21),
      },
    ],
  });

  // ── Thread 6: Elvar's Corner ──────────────────────────────────────────────
  const thread6 = await prisma.forumThread.create({
    data: {
      title: "DOM Vol. IV — is the section on Event Bubbling correct? Seems slightly off.",
      content: `Reading through DOM Vol. IV, Chapter 6 (Events). The section on bubbling says "Use stopPropagation() to prevent this." But I thought stopPropagation() stops the event from traveling up, while preventDefault() stops the default browser action. The notes seem to use them interchangeably in one example. Is this a mistake or am I misunderstanding something?`,
      category: "oracle",
      authorId: shadowbyte.id,
      views: 97,
      solved: false,
      createdAt: ago(2),
      updatedAt: ago(1, 18),
    },
  });

  await prisma.forumReply.createMany({
    data: [
      {
        content: `You're correct. They're different:

- stopPropagation() — stops the event from bubbling up to parent elements
- preventDefault() — stops the browser's default behavior (form submit, link navigation, etc.)

They're not interchangeable. You can use both on the same event if needed. Good catch — worth flagging to the Devstiny team.`,
        threadId: thread6.id,
        authorId: runeweaver.id,
        likes: 8,
        isAnswer: false,
        createdAt: ago(1, 22),
      },
      {
        content: `There's also stopImmediatePropagation() which stops bubbling AND prevents other handlers on the same element from running. Usually overkill but good to know it exists.`,
        threadId: thread6.id,
        authorId: voidcaster.id,
        likes: 3,
        isAnswer: false,
        createdAt: ago(1, 18),
      },
    ],
  });

  // ── Thread 7: Hall of Champions ───────────────────────────────────────────
  const thread7 = await prisma.forumThread.create({
    data: {
      title: "Recreated the Devstiny landing page from scratch — here's my code",
      content: `As a practice project I decided to recreate the Devstiny homepage from memory using only what I've learned so far (HTML + CSS, no frameworks).

What I learned:
1. Background images are harder than I expected
2. Getting buttons to look exactly right took 3 hours
3. Flexbox made the nav bar easy but hero centering still confuses me
4. CSS custom properties for colors was a great decision

What I could not do yet: the pixel font, animations, responsive mobile.

Code is rough but functional.`,
      category: "hall-of-champions",
      authorId: runeweaver.id,
      views: 673,
      solved: false,
      createdAt: ago(2),
      updatedAt: ago(1, 15),
    },
  });

  await prisma.forumReply.createMany({
    data: [
      {
        content: `This is an excellent practice exercise. Recreating a real site you can look at while building forces you to understand every property you use. You can't fake your way through it. For the custom font: look up @font-face. Short version: download the font file, put it in your project, and declare it at the top of your CSS.`,
        threadId: thread7.id,
        authorId: shadowbyte.id,
        likes: 21,
        isAnswer: false,
        createdAt: ago(1, 20),
      },
      {
        content: `3 hours on button shadows is not wasted time. You now understand box-shadow in a way that reading about it never would have given you.`,
        threadId: thread7.id,
        authorId: lyra.id,
        likes: 12,
        isAnswer: false,
        createdAt: ago(1, 15),
      },
    ],
  });

  // ── Thread 8: The Tavern ──────────────────────────────────────────────────
  const thread8 = await prisma.forumThread.create({
    data: {
      title: "Which path class did everyone pick? Frontend or Backend?",
      content: `Curious what everyone chose and why. I went Frontend because I like seeing the results immediately — there's something satisfying about changing a line of CSS and watching the page update in real time.

Also wondering: does the path you pick actually change what quests are available? Or is it just a label?`,
      category: "tavern",
      authorId: ironscribe.id,
      views: 2104,
      solved: false,
      createdAt: ago(3),
      updatedAt: ago(1, 12),
    },
  });

  await prisma.forumReply.createMany({
    data: [
      {
        content: `Frontend here. Same reason — immediate visual feedback is addictive. I can spend an hour tweaking spacing and not notice the time.`,
        threadId: thread8.id,
        authorId: ironscribe.id,
        likes: 18,
        isAnswer: false,
        createdAt: ago(2, 22),
      },
      {
        content: `Backend. I find the logic more interesting than the styling. Building something that processes data and produces correct output is more satisfying to me than centering a div (that said, centering a div is surprisingly hard).`,
        threadId: thread8.id,
        authorId: voidcaster.id,
        likes: 14,
        isAnswer: false,
        createdAt: ago(2, 20),
      },
      {
        content: `I picked Fullstack because I couldn't decide. Probably a mistake — it's a lot of content to cover at once. Would recommend picking one and switching later if needed.`,
        threadId: thread8.id,
        authorId: shadowbyte.id,
        likes: 9,
        isAnswer: false,
        createdAt: ago(2, 18),
      },
      {
        content: `The class affects the framing of some quest descriptions but the core content is the same for now. The divergence becomes more pronounced later in the path.`,
        threadId: thread8.id,
        authorId: runeweaver.id,
        likes: 6,
        isAnswer: false,
        createdAt: ago(2, 10),
      },
      {
        content: `Frontend. My goal is to build things people can actually see and interact with.`,
        threadId: thread8.id,
        authorId: lyra.id,
        likes: 5,
        isAnswer: false,
        createdAt: ago(1, 12),
      },
    ],
  });

  // ── Path Chapters ────────────────────────────────────────────────────────
  console.log("🌱 Seeding path chapters...");

  const pathChaptersData = [
    {
      slug: "prologue", title: "Prologue: The beginning", realm: "Gate of First Light", order: 0,
      description: "You don't know how you got here. But Elvar has been waiting — and the Broken Realm needs someone willing to understand the language beneath it.",
      openingNarrative: "You don't know how you got here. One second ago you were somewhere else — a world that made sense. Now you're standing before a gate made of light, in the middle of a meadow that looks too green to be real. And then — footsteps. Calm. Rhythmic.",
      worldContext: "This world is code. It was built to become something — buildings that are solid and modifiable, roads that bring people where they mean to go. It can be debugged. Refactored. Fixed. But not by me. That is why I need you.",
      archonIntro: "Most who stand there choose to leave. This path is not easy. No one promised you that. But you're still here. That is enough — for now.",
      rewardXp: 1500, rewardGold: 2000, rewardBadge: "badge-prologue-complete", rewardTitle: "Gate Breaker",
      estimatedHours: 2, difficulty: "beginner",
      skills: ["Developer Mindset", "Problem Solving", "Debugging", "Critical Thinking"],
      tags: ["mindset", "lore", "story", "debugging"],
      npcImage: "/NPC/elvar-head.png", type: "STORY", typeColor: "text-rpg-purple",
      acts: [
        { slug: "act-1", title: "The First Field", order: 1, description: "You arrive at the Gate of First Light and meet Elvar — the Elder Dev who built this world." },
        { slug: "act-2", title: "The Truth About N.O.A.H.", order: 2, description: "Elvar reveals the origin of this world — and the truth about N.O.A.H., the AI that created it." },
        { slug: "act-3", title: "Developer Mindset", order: 3, description: "Before any syntax, Elvar teaches the most important skill — how to think like a developer." },
        { slug: "act-4", title: "The Debug Challenge", order: 4, description: "Three broken things in the Broken Realm. No code required — only mindset." },
        { slug: "act-5", title: "The Silhouette", order: 5, description: "On the horizon, something watches. The Broken Realm reveals its darkness." },
        { slug: "final-act", title: "Ready to Leave", order: 6, isFinalAct: true, description: "Elvar confirms you are ready. He sends you to find Ferrus at the edge of town." },
      ],
    },
    {
      slug: "chapter-1", title: "Chapter 1: Web Foundations", realm: "The Compiler Archive", order: 1,
      description: "Before any code is written, you need to understand what you are building on. Elvar walks you through the web — what it is, how it works, and the three languages that power everything.",
      openingNarrative: "You are still in the tower. The window still shows the Broken Realm below. Elvar gestures toward it — and begins to explain not just what it is, but what it is made of.",
      worldContext: "Every territory in the Broken Realm corresponds to a real technology. The HTML Realm, the CSS Kingdom, the JavaScript Realm — they are not metaphors. They are the actual languages that build the web.",
      archonIntro: "The web is not magic. It is a system built by people, running on rules written by people — which means it can be understood, and it can be fixed.",
      rewardXp: 1200, rewardGold: 1500, rewardBadge: "badge-webfound-complete", rewardTitle: "Web Walker",
      estimatedHours: 2, difficulty: "beginner",
      skills: ["Internet Basics", "How Websites Work", "HTML/CSS/JS Overview", "Frontend vs Backend", "Developer Tools"],
      tags: ["web", "internet", "html", "css", "javascript", "browser"],
      npcImage: "/NPC/elvar-head.png", type: "WEB", typeColor: "text-rpg-purple",
      acts: [
        { slug: "act-1", title: "Internet vs The Web", order: 1, description: "The internet and the web are not the same thing." },
        { slug: "act-2", title: "What Is a Website", order: 2, description: "What actually happens when you visit a website?" },
        { slug: "act-3", title: "The Three Languages", order: 3, description: "HTML gives structure. CSS gives style. JavaScript gives behaviour." },
        { slug: "act-4", title: "Frontend & Backend", order: 4, description: "The web has two sides — what the user sees, and what runs behind it." },
        { slug: "act-5", title: "Developer Tools", order: 5, description: "Every developer's browser contains a hidden toolkit." },
        { slug: "final-act", title: "Ready for the Realm", order: 6, isFinalAct: true, description: "Everything Elvar has taught you about the web — consolidated, tested, confirmed." },
      ],
    },
    {
      slug: "chapter-2", title: "Chapter 2: HTML", realm: "The HTML Realm", order: 2,
      description: "The HTML Realm has been frozen in permanent immutability by The Iron Warden. To free it, you must understand the language beneath every structure.",
      openingNarrative: "The territory changes the moment you cross the invisible line. Everything stops moving. A bird frozen mid-flight. A market stall arranged too precisely. The wind simply ceases to exist.",
      worldContext: "Every structure in this territory has a blueprint underneath it. The Elder Dev calls it HTML. I call it the thing I should have learned instead of buying a bigger hammer.",
      archonIntro: "Name's Ferrus. I make things that last. At the moment I'm trying to make something break. The Iron Warden locked this entire realm into a static state.",
      rewardXp: 2000, rewardGold: 2500, rewardBadge: "badge-html-complete", rewardTitle: "Structure Builder",
      estimatedHours: 6, difficulty: "beginner",
      skills: ["HTML Structure", "Semantic Elements", "Forms", "Links & Media", "Accessibility Basics"],
      tags: ["html", "structure", "semantic", "forms", "accessibility"],
      npcImage: "/NPC/ferrus-head.png", type: "HTML", typeColor: "text-rpg-purple",
      acts: [
        { slug: "act-1", title: "The Iron Gate", order: 1, description: "The HTML Realm is frozen solid. Ferrus explains what that means and what needs to happen." },
        { slug: "act-2", title: "Elements & Tags", order: 2, description: "Every structure in this realm is made of elements. Learn to read and write them." },
        { slug: "act-3", title: "Nesting & Structure", order: 3, description: "Elements don't exist alone. They nest inside each other to form the structure of the page." },
        { slug: "act-4", title: "Semantic HTML", order: 4, description: "Not all tags are created equal. Some carry meaning beyond their appearance." },
        { slug: "act-5", title: "Links, Images & Media", order: 5, description: "HTML can reference the outside world — images, pages, files." },
        { slug: "final-act", title: "The Unlock", order: 6, isFinalAct: true, description: "The Iron Warden's hold is weakening. One final challenge before the realm is freed." },
      ],
    },
    {
      slug: "chapter-3", title: "Chapter 3: CSS", realm: "The CSS Kingdom", order: 3,
      description: "The CSS Kingdom exists in perfect visual chaos — everything is styled, but nothing is intentional. To restore order, you must master the language of appearance.",
      openingNarrative: "The CSS Kingdom is the most visually overwhelming place you have ever seen. Colours that clash. Fonts that fight. Layouts that argue with themselves.",
      worldContext: "CSS is not decoration. It is a language with rules, specificity, and logic. The chaos here is not random — it is the result of rules applied without understanding.",
      archonIntro: "Lyra. I design this world. Or I used to, before the Chaos Engine overwrote everything I built with random overrides.",
      rewardXp: 2500, rewardGold: 3000, rewardBadge: "badge-css-complete", rewardTitle: "Style Architect",
      estimatedHours: 8, difficulty: "intermediate",
      skills: ["CSS Selectors", "Box Model", "Flexbox", "Grid", "Responsive Design"],
      tags: ["css", "styling", "flexbox", "grid", "responsive"],
      npcImage: "/NPC/lyra-head.png", type: "CSS", typeColor: "text-rpg-purple",
      acts: [
        { slug: "act-1", title: "The Chaos Engine", order: 1, description: "The CSS Kingdom is in visual chaos. Lyra explains what CSS is and how it went wrong." },
        { slug: "act-2", title: "Selectors & Properties", order: 2, description: "Learn to target elements and apply rules with precision." },
        { slug: "act-3", title: "The Box Model", order: 3, description: "Every element is a box. Margin, border, padding, content — master the model." },
        { slug: "act-4", title: "Flexbox", order: 4, description: "One-dimensional layout. The tool that makes alignment finally make sense." },
        { slug: "act-5", title: "Grid & Responsive", order: 5, description: "Two-dimensional layout and making things work on any screen size." },
        { slug: "final-act", title: "Restoring the Kingdom", order: 6, isFinalAct: true, description: "Apply everything to restore the visual order of the CSS Kingdom." },
      ],
    },
    {
      slug: "chapter-4", title: "Chapter 4: JavaScript", realm: "The JavaScript Realm", order: 4,
      description: "The JavaScript Realm runs on logic — but the logic is broken. Somers, the realm's lead developer, needs someone who can read code that doesn't behave as written.",
      openingNarrative: "The JavaScript Realm feels almost normal at first. People moving, machines running, transactions completing. But then you notice — every third action fails silently.",
      worldContext: "JavaScript is the language of behaviour. It is what makes the web respond, calculate, decide. Without it, this realm would be static HTML.",
      archonIntro: "Somers. Lead dev of this realm. I've been debugging this for three weeks. I can write the fix — but I can't find where the error is coming from.",
      rewardXp: 3000, rewardGold: 3500, rewardBadge: "badge-js-complete", rewardTitle: "Logic Caster",
      estimatedHours: 10, difficulty: "intermediate",
      skills: ["Variables & Types", "Functions", "Arrays & Objects", "Control Flow", "Async JavaScript"],
      tags: ["javascript", "functions", "arrays", "async", "logic"],
      npcImage: "/NPC/somers-head.png", type: "JS", typeColor: "text-rpg-purple",
      acts: [
        { slug: "act-1", title: "Silent Failures", order: 1, description: "The realm runs but something is wrong. Somers introduces JavaScript and the problem." },
        { slug: "act-2", title: "Variables & Types", order: 2, description: "Data has types. Variables hold it. Understanding both is step one." },
        { slug: "act-3", title: "Functions", order: 3, description: "Reusable logic. The building block of every JavaScript program." },
        { slug: "act-4", title: "Arrays & Objects", order: 4, description: "Structured data. How to store, access, and transform collections." },
        { slug: "act-5", title: "Control Flow", order: 5, description: "Making decisions and repeating actions — the logic of programs." },
        { slug: "act-6", title: "The DOM Connection", order: 6, description: "JavaScript meets HTML. Making pages respond to the user." },
        { slug: "act-7", title: "Async & Fetch", order: 7, description: "Waiting for data. Promises, async/await, and talking to servers." },
        { slug: "act-8", title: "Error Handling", order: 8, description: "Things go wrong. Learn to handle it gracefully." },
        { slug: "final-act", title: "Fixing the Realm", order: 9, isFinalAct: true, description: "Apply your JavaScript knowledge to debug the broken realm." },
      ],
    },
    {
      slug: "chapter-4-part-2", title: "Chapter 4-II: The DOM", realm: "The Wired District", order: 5,
      description: "The Wired District is the boundary between HTML and JavaScript — where the two languages meet and the page becomes interactive.",
      openingNarrative: "The Wired District looks like a city made of nodes. Every element of the page is visible as a physical object — connected by wires that pulse with data.",
      worldContext: "The DOM is the bridge between HTML and JavaScript. It is the live representation of the page — and it can be manipulated, queried, and controlled.",
      archonIntro: "Somers again. This territory is where HTML and JavaScript actually connect. Most people think they're separate. They're not.",
      rewardXp: 2500, rewardGold: 3000, rewardBadge: "badge-dom-complete", rewardTitle: "DOM Weaver",
      estimatedHours: 8, difficulty: "intermediate",
      skills: ["DOM Selection", "DOM Manipulation", "Events", "Event Delegation", "Forms with JS"],
      tags: ["dom", "events", "manipulation", "javascript", "interactive"],
      npcImage: "/NPC/somers-head.png", type: "DOM", typeColor: "text-rpg-purple",
      acts: [
        { slug: "act-1", title: "The Node Map", order: 1, description: "The DOM as a data structure. Understanding the tree." },
        { slug: "act-2", title: "Querying the DOM", order: 2, description: "Finding elements by selector, id, class, and more." },
        { slug: "act-3", title: "Manipulating Elements", order: 3, description: "Changing content, attributes, and styles via JavaScript." },
        { slug: "act-4", title: "Creating & Removing", order: 4, description: "Building new elements and removing them from the page." },
        { slug: "act-5", title: "Events", order: 5, description: "Listening for user actions and responding to them." },
        { slug: "act-6", title: "Event Delegation", order: 6, description: "Handling events efficiently on dynamic content." },
        { slug: "act-7", title: "Forms & Input", order: 7, description: "Reading form values, validation, and submission handling." },
        { slug: "act-8", title: "The Live DOM", order: 8, description: "How the DOM reflects real-time changes and reacts to them." },
        { slug: "final-act", title: "Wiring the District", order: 9, isFinalAct: true, description: "Connect the Wired District's nodes — one final interactive challenge." },
      ],
    },
    {
      slug: "season-finale", title: "Season Finale: The Compiler's Crown", realm: "The Compiler's Tower", order: 6,
      description: "The seal is broken. Elvar descends. Every skill you have learned — HTML, CSS, JavaScript, DOM — comes together now in the only place where a full compilation can happen.",
      openingNarrative: "The DOM tree at the center of the Wired District pulses once — twice — then releases a beam of light that traces every node upward through the sky, all the way to the peak of the Compiler's Tower.",
      worldContext: "Every chapter, you learned one part of the language this world is built from. HTML gave it structure. CSS gave it appearance. JavaScript gave it life. The DOM gave it memory and response. Today, we put it together.",
      archonIntro: "You found it. I have been watching every chapter from behind glass. Watching you fail and fix and push forward. I have been — very proud.",
      rewardXp: 5000, rewardGold: 6000, rewardBadge: "badge-season1-complete", rewardTitle: "The Compiled",
      estimatedHours: 6, difficulty: "advanced",
      skills: ["Full Project Build", "HTML + CSS + JS Integration", "DOM Manipulation", "Problem Solving", "Code Review"],
      tags: ["finale", "project", "integration", "fullstack", "capstone"],
      npcImage: "/NPC/elvar-head.png", type: "FINALE", typeColor: "text-rpg-gold",
      acts: [
        { slug: "act-1", title: "The Seal is Broken", order: 1, description: "The DOM tree was a key. The seal dissolves. Elvar descends." },
        { slug: "act-2", title: "The Compiler's Forge", order: 2, description: "The tower is a place where code becomes real. Elvar shows you how to use it." },
        { slug: "act-3", title: "Project: The Realm Page", order: 3, description: "Build a complete web page for the Broken Realm's official record." },
        { slug: "act-4", title: "Styling the Archive", order: 4, description: "Apply CSS to make the realm page look like it belongs in this world." },
        { slug: "act-5", title: "Making It Live", order: 5, description: "Add JavaScript and DOM manipulation to bring the page to life." },
        { slug: "act-6", title: "The Dark King Approaches", order: 6, description: "The final confrontation nears. One last lesson before the battle." },
        { slug: "final-act", title: "The Final Compilation", order: 7, isFinalAct: true, description: "Complete the build. Face the Dark King. End Season One." },
      ],
    },
  ];

  for (const ch of pathChaptersData) {
    const { acts, ...chapterData } = ch;
    const chapter = await prisma.pathChapter.upsert({
      where: { slug: chapterData.slug },
      update: chapterData,
      create: chapterData,
    });
    for (const act of acts) {
      await prisma.pathAct.upsert({
        where: { chapterId_slug: { chapterId: chapter.id, slug: act.slug } },
        update: act,
        create: { ...act, chapterId: chapter.id },
      });
    }
  }
  console.log(`✅ Path chapters seeded: ${pathChaptersData.length} chapters`);

  // ── Path Act Content (from JSON files if they still exist) ───────────────
  const contentBase = path.resolve(
    path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")),
    "../../frontend-devstiny/src/lib/content",
  );

  if (fs.existsSync(contentBase)) {
    console.log("🌱 Seeding act content from JSON files...");
    const chapterDirMap: Record<string, string> = {
      "prologue": "prologue", "chapter-1": "chapter-1", "chapter-2": "chapter-2",
      "chapter-3": "chapter-3", "chapter-4": "chapter-4",
      "chapter-4-part-2": "chapter-4-part-2", "season-finale": "season-finale",
    };
    let actContentCount = 0;
    for (const [chapterSlug, dirName] of Object.entries(chapterDirMap)) {
      const chapter = await prisma.pathChapter.findUnique({ where: { slug: chapterSlug } });
      if (!chapter) continue;
      const dirPath = path.join(contentBase, dirName);
      if (!fs.existsSync(dirPath)) continue;
      const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".json") && f !== "index.json");
      for (const file of files) {
        const actSlug = file.replace(".json", "");
        const content = JSON.parse(fs.readFileSync(path.join(dirPath, file), "utf-8"));
        await prisma.pathAct.updateMany({
          where: { chapterId: chapter.id, slug: actSlug },
          data: { content: content as object },
        });
        actContentCount++;
      }
    }
    console.log(`✅ Act content seeded: ${actContentCount} acts`);
  } else {
    console.log("ℹ️  Act content already in DB (lib/content folder removed), skipping file seed.");
  }

  // ── Migrate BookChapter content+example → sections ───────────────────────
  console.log("🌱 Migrating book chapters to sections format...");
  const allChapters = await prisma.bookChapter.findMany();
  const chaptersToMigrate = allChapters.filter((ch) => ch.sections === null);
  for (const ch of chaptersToMigrate) {
    const sections: object[] = [];
    if (ch.content?.trim()) sections.push({ type: "text", content: ch.content });
    if (ch.example?.trim()) sections.push({ type: "code", code: ch.example });
    await prisma.bookChapter.update({ where: { id: ch.id }, data: { sections } });
  }
  console.log(`✅ Migrated ${chaptersToMigrate.length} chapters to sections format`);

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log("✅ Forum threads seeded:");
  const titles = [thread1, thread2, thread3, thread4, thread5, thread6, thread7, thread8]
    .map((t, i) => `  ${i + 1}. [${t.category}] ${t.title.slice(0, 60)}...`);
  titles.forEach((t) => console.log(t));

  console.log("\n📋 Login credentials (all use password: password123)");
  console.log("  shadowbyte@devstiny.com");
  console.log("  runeweaver@devstiny.com");
  console.log("  ironscribe@devstiny.com");
  console.log("  voidcaster@devstiny.com");
  console.log("  lyra@devstiny.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
