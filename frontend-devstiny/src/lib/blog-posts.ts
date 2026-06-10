export interface BlogPost {
  slug:      string;
  title:     string;
  excerpt:   string;
  body:      { type: "p" | "h2" | "code"; text: string }[];
  author:    string;
  date:      string;
  tag:       string;
  tagColor:  string;
  gem:       string;
  readTime:  number;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug:     "understanding-the-box-model",
    title:    "The Box Model: Every Element Is a Rectangle",
    excerpt:  "Before you can position anything in CSS, you need to understand one truth: every element on the page is a box. Here's what that actually means.",
    author:   "Elvar",
    date:     "JUN 2026",
    tag:      "CSS",
    tagColor: "text-rpg-cyan",
    gem:      "/gem/gem-9.png",
    readTime: 5,
    body: [
      { type: "p",    text: "Every element you put on a page — a paragraph, a button, an image — is rendered as a rectangular box. CSS calls this the box model. Understanding it is the single most important concept in layout." },
      { type: "h2",   text: "The Four Layers" },
      { type: "p",    text: "A box has four regions: content (the actual text or image), padding (space inside the border), border (the visible edge), and margin (space outside the border). They stack outward from the center." },
      { type: "code", text: ".box {\n  width: 200px;       /* content */\n  padding: 16px;     /* inside */\n  border: 2px solid; /* edge */\n  margin: 24px;      /* outside */\n}" },
      { type: "h2",   text: "box-sizing: border-box" },
      { type: "p",    text: "By default, width only controls the content area. Adding padding or border makes the element larger than you set. This is surprising and annoying. Fix it globally:" },
      { type: "code", text: "*, *::before, *::after {\n  box-sizing: border-box;\n}" },
      { type: "p",    text: "Now width includes padding and border. The element stays exactly the size you declared. Put this reset at the top of every stylesheet you write." },
    ],
  },
  {
    slug:     "javascript-scope-explained",
    title:    "Scope: Where Variables Live and Die",
    excerpt:  "A variable declared inside a function cannot be seen outside it. A variable declared in a block lives only in that block. This is scope — and getting it wrong causes the most common JS bugs.",
    author:   "Elvar",
    date:     "MAY 2026",
    tag:      "JAVASCRIPT",
    tagColor: "text-rpg-gold",
    gem:      "/gem/gem-16.png",
    readTime: 6,
    body: [
      { type: "p",    text: "Scope is the set of variables a piece of code can see. Get this wrong and you'll spend hours debugging reference errors that seem to make no sense." },
      { type: "h2",   text: "Three Kinds of Scope" },
      { type: "p",    text: "Global scope: the entire program can see it. Function scope: only code inside that function. Block scope: only code inside that { } block." },
      { type: "code", text: "let globalVar = 'everywhere';\n\nfunction quest() {\n  let insideFunc = 'only here';\n\n  if (true) {\n    let insideBlock = 'only in this if';\n    console.log(insideFunc);  // ✓ works\n  }\n\n  console.log(insideBlock); // ✗ ReferenceError\n}" },
      { type: "h2",   text: "var vs let vs const" },
      { type: "p",    text: "var is function-scoped and hoisted to the top — it exists before its line runs, just with the value undefined. let and const are block-scoped and not accessible before their declaration. Always use const by default, let when you need to reassign, and forget var exists." },
      { type: "code", text: "console.log(x); // undefined (hoisted)\nvar x = 5;\n\nconsole.log(y); // ReferenceError (not hoisted)\nlet y = 5;" },
    ],
  },
  {
    slug:     "semantic-html-matters",
    title:    "Semantic HTML: Write Code Machines Can Read",
    excerpt:  "You can build an entire page with nothing but divs. It will work. It will also be invisible to screen readers, hard for search engines to understand, and painful to maintain. Here's how to do it right.",
    author:   "Elvar",
    date:     "APR 2026",
    tag:      "HTML",
    tagColor: "text-rpg-green",
    gem:      "/gem/gem-4.png",
    readTime: 4,
    body: [
      { type: "p",    text: "HTML has over 100 elements. Most developers use about 10 of them. The rest exist because different content has different meaning, and meaning is what semantic HTML is about." },
      { type: "h2",   text: "Structure Tells a Story" },
      { type: "p",    text: "A screen reader announcing a page full of divs gives the user nothing to navigate by. A page built with header, nav, main, article, aside, and footer gives them a map of the content before they read a single word." },
      { type: "code", text: "<header>\n  <nav>...</nav>\n</header>\n<main>\n  <article>\n    <h1>Post Title</h1>\n    <p>Content...</p>\n  </article>\n  <aside>Related posts</aside>\n</main>\n<footer>...</footer>" },
      { type: "h2",   text: "Elements That Carry Meaning" },
      { type: "p",    text: "Use <strong> not <b> for important text (screen readers emphasize it). Use <button> not <div> for clickable things (keyboard navigation, click events, ARIA role — all free). Use <time datetime='2026-04-01'> for dates. The right element does the right job automatically." },
    ],
  },
  {
    slug:     "css-flexbox-in-practice",
    title:    "Flexbox: One Line to Rule Them All",
    excerpt:  "Before flexbox, centering something vertically required hacks. Now it's one line. Here's what flexbox actually does and when to reach for it.",
    author:   "Elvar",
    date:     "MAR 2026",
    tag:      "CSS",
    tagColor: "text-rpg-cyan",
    gem:      "/gem/gem-21.png",
    readTime: 7,
    body: [
      { type: "p",    text: "Flexbox is a layout model designed for one dimension at a time — either a row or a column. It solves the two most common layout problems: distributing space between items and aligning them." },
      { type: "h2",   text: "The Container Controls Everything" },
      { type: "p",    text: "You apply flex to the parent. The children become flex items and respond to the parent's rules. The most important properties live on the container." },
      { type: "code", text: ".container {\n  display: flex;\n  flex-direction: row;       /* or column */\n  justify-content: center;   /* main axis */\n  align-items: center;       /* cross axis */\n  gap: 16px;                 /* space between items */\n}" },
      { type: "h2",   text: "Centering Anything" },
      { type: "p",    text: "The pattern you will use in literally every project:" },
      { type: "code", text: ".centered {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}" },
      { type: "p",    text: "That's it. Vertical centering — solved. Use Grid when you need two dimensions. Use Flex when you have a row or column of things to distribute." },
    ],
  },
  {
    slug:     "fetch-and-async-await",
    title:    "Fetching Data: From Callbacks to async/await",
    excerpt:  "JavaScript is single-threaded. Everything asynchronous — API calls, timers, file reads — runs outside the main thread. Understanding how this works is the key to writing JavaScript that doesn't freeze.",
    author:   "Elvar",
    date:     "FEB 2026",
    tag:      "JAVASCRIPT",
    tagColor: "text-rpg-gold",
    gem:      "/gem/gem-33.png",
    readTime: 8,
    body: [
      { type: "p",    text: "When you call fetch(), the browser sends the request and immediately returns control to your code. Your code keeps running. When the response arrives, a callback fires. This is how async JavaScript works." },
      { type: "h2",   text: "The Modern Way: async/await" },
      { type: "p",    text: "async/await is syntactic sugar over Promises. It lets you write async code that reads like synchronous code, without the indentation hell of callbacks." },
      { type: "code", text: "async function getUser(id) {\n  try {\n    const res = await fetch(`/api/users/${id}`);\n    if (!res.ok) throw new Error('Not found');\n    const user = await res.json();\n    return user;\n  } catch (err) {\n    console.error(err);\n    return null;\n  }\n}" },
      { type: "h2",   text: "Always Handle Errors" },
      { type: "p",    text: "A fetch can fail because of network issues, a 404, a 500, or invalid JSON. If you don't catch these, they become silent failures or unhandled promise rejections that crash your app. Always wrap async calls in try/catch." },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
