import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type Block = { type: "text"; content: string } | { type: "code"; code: string };

const cssChapters: Record<string, { sections: Block[] }> = {

  "How CSS Works": {
    sections: [
      { type: "text", content: `**CSS** (Cascading Style Sheets) is the language that controls how HTML elements look on screen. Where HTML defines *what* content is, CSS defines *how* it appears — its colour, size, spacing, layout, and animation.

CSS works by selecting HTML elements and applying declarations to them. A declaration is a property–value pair: \`color: red\` means "set the text colour to red". A group of declarations wrapped in curly braces is called a **rule set** or **rule**.

Without CSS, every web page would be plain text in the browser's default font with no visual hierarchy. CSS transforms raw markup into usable, readable, and visually coherent interfaces.` },

      { type: "code", code: `/* A CSS rule set */
selector {
  property: value;
  property: value;
}

/* Example */
h1 {
  color: #f0c040;
  font-size: 2rem;
  margin-bottom: 1rem;
}` },

      { type: "text", content: `**How CSS is applied — three methods:**

1. **External stylesheet** — a separate \`.css\` file linked with \`<link rel="stylesheet" href="styles.css">\` in the \`<head>\`. This is the standard and recommended approach: one file, applied to the entire site, cached by the browser.

2. **Internal style block** — a \`<style>\` element inside \`<head>\`. Useful for page-specific overrides or prototyping, but does not scale across multiple pages.

3. **Inline styles** — the \`style\` attribute on an individual element: \`<p style="color: red">\`. Use sparingly. Inline styles have the highest specificity (short of \`!important\`), making them difficult to override, and they mix presentation with structure.` },

      { type: "code", code: `<!-- 1. External stylesheet (recommended) -->
<head>
  <link rel="stylesheet" href="/css/styles.css" />
</head>

<!-- 2. Internal style block -->
<head>
  <style>
    body { background: #0d0b20; }
  </style>
</head>

<!-- 3. Inline style (avoid for layout/theme) -->
<p style="color: red; font-weight: bold;">Warning text</p>` },

      { type: "text", content: `**The Cascade** is the algorithm CSS uses to resolve conflicts when multiple rules target the same element. It works through three factors, evaluated in order:

1. **Origin** — Browser default styles lose to author styles (your CSS). \`!important\` declarations beat both.

2. **Specificity** — A numeric score calculated from the selector. Higher specificity wins.
   - Inline style: 1000 points
   - ID selector (\`#id\`): 100 points
   - Class, attribute, pseudo-class (\`.class\`, \`[attr]\`, \`:hover\`): 10 points
   - Element, pseudo-element (\`div\`, \`::before\`): 1 point
   - Universal selector (\`*\`): 0 points

3. **Source order** — When specificity is equal, the rule that appears *later* in the stylesheet wins.

**Inheritance** is separate from the cascade. Some properties (like \`color\`, \`font-family\`, \`line-height\`) are inherited by default — child elements get the parent's value unless overridden. Others (like \`margin\`, \`padding\`, \`border\`) are not inherited.` },

      { type: "code", code: `/* Specificity examples */

/* Score: 0,0,0,1 — element */
p { color: blue; }

/* Score: 0,0,1,0 — class */
.intro { color: green; }         /* wins over p */

/* Score: 0,1,0,0 — ID */
#hero { color: red; }            /* wins over .intro */

/* !important overrides specificity (use sparingly) */
p { color: purple !important; }  /* wins over #hero */

/* Inheritance */
body {
  font-family: sans-serif;  /* inherited by all descendants */
  color: #e8e8f0;           /* inherited */
  border: 1px solid red;    /* NOT inherited */
}` },

      { type: "text", content: `**The \`inherit\`, \`initial\`, and \`unset\` keywords** let you explicitly control cascade and inheritance:

- \`inherit\` — force the element to take its parent's computed value, even for non-inherited properties
- \`initial\` — reset to the browser's initial default for that property
- \`unset\` — acts as \`inherit\` for inherited properties, \`initial\` for non-inherited ones
- \`revert\` — rolls back to the browser's built-in stylesheet value

CSS custom properties (variables) are always inherited and provide a powerful way to share values across the stylesheet without repetition.` },

      { type: "code", code: `/* CSS Custom Properties (variables) */
:root {
  --color-bg:      #0d0b20;
  --color-text:    #e8e8f0;
  --color-accent:  #f0c040;
  --font-mono:     "Courier New", monospace;
  --spacing-base:  1rem;
}

body {
  background-color: var(--color-bg);
  color:            var(--color-text);
  font-family:      var(--font-mono);
}

h1 { color: var(--color-accent); }

/* Fallback value if variable is not defined */
.card { padding: var(--spacing-card, 1.5rem); }` },
    ],
  },

  "Selectors": {
    sections: [
      { type: "text", content: `A **selector** is the part of a CSS rule that targets which HTML elements the declarations apply to. Understanding selectors is essential — they are the primary mechanism for applying styles precisely and maintainably.

**Basic selectors:**

- **Universal** \`*\` — matches every element. Use with caution; rarely needed for actual styling. Commonly used in resets: \`*, *::before, *::after { box-sizing: border-box; }\`
- **Type/Element** \`div\`, \`p\`, \`h1\` — matches all elements of that tag. Low specificity (score 1).
- **Class** \`.classname\` — matches all elements with that class attribute. Medium specificity (score 10). The most common selector in practice.
- **ID** \`#idname\` — matches a single element with that ID. High specificity (score 100). Avoid for styling; prefer classes.
- **Attribute** \`[attr]\`, \`[attr="value"]\` — matches elements based on attribute presence or value.` },

      { type: "code", code: `/* Universal */
* { box-sizing: border-box; }

/* Type selectors */
h1 { font-size: 2rem; }
p  { line-height: 1.7; }

/* Class selectors */
.card          { border: 1px solid #3d2d8c; }
.card.featured { border-color: #f0c040; }   /* element with both classes */

/* ID selector */
#main-nav { position: sticky; top: 0; }

/* Attribute selectors */
[disabled]              { opacity: 0.4; }
[type="text"]           { border: 1px solid #ccc; }
[href^="https"]         { color: green; }    /* starts with */
[href$=".pdf"]          { color: red; }      /* ends with */
[class*="btn"]          { cursor: pointer; } /* contains */` },

      { type: "text", content: `**Combinator selectors** express relationships between elements:

- **Descendant** \`A B\` — any \`B\` inside \`A\`, regardless of depth. Most common combinator.
- **Child** \`A > B\` — only direct children of \`A\`.
- **Adjacent sibling** \`A + B\` — the first \`B\` immediately after \`A\` (same parent).
- **General sibling** \`A ~ B\` — all \`B\` elements after \`A\` (same parent).` },

      { type: "code", code: `/* Descendant — any p inside .content */
.content p { color: #ccc; }

/* Child — only direct li children of ul */
ul > li { list-style: disc; }

/* Adjacent sibling — p immediately after h2 */
h2 + p { font-size: 1.125rem; font-weight: 500; }

/* General sibling — all p after .intro */
.intro ~ p { color: #999; }` },

      { type: "text", content: `**Pseudo-classes** select elements based on their state or position in the document tree, not their attributes.

Common pseudo-classes:
- **User interaction**: \`:hover\`, \`:focus\`, \`:active\`, \`:visited\`, \`:focus-visible\`, \`:focus-within\`
- **Structural**: \`:first-child\`, \`:last-child\`, \`:nth-child(n)\`, \`:nth-of-type(n)\`, \`:only-child\`, \`:not(selector)\`
- **Form states**: \`:checked\`, \`:disabled\`, \`:enabled\`, \`:required\`, \`:valid\`, \`:invalid\`, \`:placeholder-shown\`
- **Empty/exists**: \`:empty\`, \`:is()\`, \`:where()\`, \`:has()\`` },

      { type: "code", code: `/* Interaction states */
a:hover        { color: #f0c040; text-decoration: underline; }
button:active  { transform: scale(0.97); }
input:focus    { outline: 2px solid #40d0e0; outline-offset: 2px; }
input:focus-visible { outline: 2px solid #40d0e0; } /* keyboard only */

/* Structural */
li:first-child  { border-top: none; }
li:last-child   { border-bottom: none; }
li:nth-child(2n)    { background: rgba(255,255,255,0.03); } /* even rows */
li:nth-child(3n+1)  { color: gold; }  /* every 3rd, starting at 1st */

/* Negation */
.nav-link:not(.active) { opacity: 0.7; }
p:not(:last-child)     { margin-bottom: 1rem; }

/* :is() — groups selectors, takes highest specificity of the group */
:is(h1, h2, h3) { font-weight: 700; line-height: 1.2; }

/* :has() — parent selector (CSS4) */
.card:has(img)         { padding: 0; }           /* card with an image */
form:has(:invalid)     { border-color: red; }    /* form with invalid input */` },

      { type: "text", content: `**Pseudo-elements** create virtual elements that are not in the HTML. They are written with double colons (\`::\`) to distinguish from pseudo-classes.

- \`::before\` and \`::after\` — insert generated content before or after an element's content. Require the \`content\` property (can be empty string \`""\`).
- \`::first-line\` — style the first rendered line of a block element.
- \`::first-letter\` — style the first letter of a block element (drop caps).
- \`::placeholder\` — style the placeholder text of form inputs.
- \`::selection\` — style the user's text selection highlight.
- \`::marker\` — style the bullet or number of a list item.` },

      { type: "code", code: `/* ::before and ::after */
.card::before {
  content: "";
  display: block;
  height: 4px;
  background: linear-gradient(90deg, #f0c040, #40d0e0);
}

.required-field::after {
  content: " *";
  color: #e05050;
}

/* ::placeholder */
input::placeholder {
  color: rgba(255,255,255,0.3);
  font-style: italic;
}

/* ::selection */
::selection {
  background: rgba(240, 192, 64, 0.3);
  color: #fff;
}

/* ::marker */
li::marker {
  color: #f0c040;
  font-size: 0.75em;
}

/* Drop cap */
article p:first-of-type::first-letter {
  font-size: 3rem;
  font-weight: 700;
  float: left;
  line-height: 1;
  margin-right: 0.1em;
}` },
    ],
  },

  "The Box Model": {
    sections: [
      { type: "text", content: `Every element in CSS is rendered as a rectangular box. The **box model** describes the four concentric layers that make up this box, from inside out:

1. **Content** — the actual content of the element (text, image, child elements). Its size is controlled by \`width\` and \`height\`.
2. **Padding** — transparent space between the content and the border. Background colour fills padding. Set with \`padding\`, \`padding-top\`, \`padding-right\`, \`padding-bottom\`, \`padding-left\`.
3. **Border** — a line drawn around the padding. Has \`width\`, \`style\`, and \`color\`. Set with \`border\` shorthand or individual sides.
4. **Margin** — transparent space outside the border. Separates the element from its neighbours. Margins can collapse — adjacent vertical margins merge into the larger of the two.

Understanding the box model is the foundation of all CSS layout work.` },

      { type: "code", code: `/* Box model anatomy */
.box {
  /* Content area */
  width: 300px;
  height: 200px;

  /* Padding */
  padding: 24px;                  /* all sides */
  padding: 16px 24px;             /* top+bottom, left+right */
  padding: 8px 16px 24px 32px;    /* top, right, bottom, left (clockwise) */

  /* Border */
  border: 2px solid #f0c040;
  border-radius: 4px;             /* rounded corners */

  /* Margin */
  margin: 0 auto;                 /* centre horizontally */
  margin-bottom: 1rem;
}` },

      { type: "text", content: `**\`box-sizing\`** controls how width and height are calculated. This is one of the most important CSS properties to understand.

By default (\`box-sizing: content-box\`), \`width\` and \`height\` apply only to the content area. Padding and border are *added on top*. A \`300px\` wide element with \`20px\` padding on each side actually occupies \`340px\` on screen. This is counter-intuitive.

With \`box-sizing: border-box\`, \`width\` and \`height\` include content, padding, and border. A \`300px\` wide element stays exactly \`300px\` regardless of padding or border. This is almost always what you want.

Apply \`border-box\` globally using the universal selector — this is standard practice in modern CSS.` },

      { type: "code", code: `/* Apply border-box globally — always include this */
*, *::before, *::after {
  box-sizing: border-box;
}

/* With content-box (default): total width = 300 + 40 + 4 = 344px */
.content-box {
  box-sizing: content-box;
  width: 300px;
  padding: 20px;
  border: 2px solid;
}

/* With border-box: total width = 300px exactly */
.border-box {
  box-sizing: border-box;
  width: 300px;
  padding: 20px;
  border: 2px solid;
  /* content area = 300 - 40 - 4 = 256px */
}` },

      { type: "text", content: `**Margin collapse** — vertical margins between block elements collapse into a single margin equal to the larger of the two. This affects:

- Adjacent siblings: \`<p>\` with \`margin-bottom: 1rem\` followed by \`<p>\` with \`margin-top: 2rem\` results in a \`2rem\` gap, not \`3rem\`.
- Parent and first/last child: if no border, padding, or \`overflow\` separates them, the child's margin transfers to the parent.

Margin collapse does **not** happen with horizontal margins, flexbox children, grid children, or elements with \`overflow\` other than \`visible\`.

**Negative margins** are valid and useful — they pull elements towards each other or overlap them. Negative margins on the right or bottom expand the element's effective area.` },

      { type: "code", code: `/* Margin collapse example */
p { margin-bottom: 1rem; margin-top: 1.5rem; }
/* Gap between two <p> elements = 1.5rem (not 2.5rem) */

/* Prevent parent-child collapse by adding padding to parent */
.parent {
  padding-top: 1px;   /* prevents margin transfer */
  /* or: overflow: hidden; */
  /* or: display: flow-root; */
}

/* Negative margin — pull element up */
.overlap {
  margin-top: -2rem;
}

/* Centre a fixed-width element */
.centered {
  width: 800px;
  margin: 0 auto;  /* auto left+right margins split remaining space equally */
}` },

      { type: "text", content: `**Border properties** in detail:

The \`border\` shorthand combines width, style, and colour: \`border: 1px solid #ccc\`. You can target individual sides with \`border-top\`, \`border-right\`, \`border-bottom\`, \`border-left\`. Individual components: \`border-width\`, \`border-style\`, \`border-color\`.

Border styles: \`solid\`, \`dashed\`, \`dotted\`, \`double\`, \`groove\`, \`ridge\`, \`inset\`, \`outset\`, \`none\`, \`hidden\`.

\`border-radius\` rounds corners. You can set each corner independently with \`border-top-left-radius\` etc. A value of \`50%\` makes a square element into a circle.

\`outline\` is separate from border — it does not affect layout (no box model space), always appears outside the border, and does not support individual sides. It is primarily used for focus indication. Never remove \`outline\` without providing an alternative focus style.` },

      { type: "code", code: `/* Border examples */
.card {
  border: 1px solid rgba(255,255,255,0.1);
  border-top: 3px solid #f0c040;        /* accent top border */
  border-radius: 8px;
}

.avatar {
  border-radius: 50%;                   /* circle */
  border: 3px solid #40d0e0;
}

.pill {
  border-radius: 9999px;               /* fully rounded pill */
}

/* Complex border-radius: top-left top-right bottom-right bottom-left */
.badge { border-radius: 4px 4px 0 0; }

/* Outline for focus — never remove without replacement */
:focus-visible {
  outline: 2px solid #40d0e0;
  outline-offset: 3px;
}

/* Decorative shadow instead of border */
.card-shadow {
  border: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2);
}` },
    ],
  },

  "Typography": {
    sections: [
      { type: "text", content: `Typography is the practice of arranging type to make text readable, legible, and visually appropriate. In CSS, typography properties control font selection, sizing, spacing, and weight. Good typography is the foundation of readability on the web.

**Font families** are specified with \`font-family\`. Always provide a font stack — a comma-separated list from most specific to most generic. If the first font is unavailable, the browser tries the next. Always end with a generic family: \`serif\`, \`sans-serif\`, \`monospace\`, \`cursive\`, or \`fantasy\`.

Custom fonts are loaded with \`@font-face\` or via services like Google Fonts. The \`font-display\` descriptor controls how text is shown while the font loads: \`swap\` shows fallback text immediately, then swaps when loaded — best for performance.` },

      { type: "code", code: `/* System font stack (uses OS native fonts — fast, no network) */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
               Roboto, Oxygen, Ubuntu, sans-serif;
}

/* Custom font from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

body { font-family: "Inter", sans-serif; }

/* Self-hosted @font-face */
@font-face {
  font-family: "MyFont";
  src: url("/fonts/myfont.woff2") format("woff2"),
       url("/fonts/myfont.woff")  format("woff");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}` },

      { type: "text", content: `**Font sizing** — CSS provides multiple units for sizing text. Choosing the right unit matters for accessibility and responsive design.

- \`px\` — absolute pixels. Does not scale with user's browser font preference. Avoid for body text.
- \`em\` — relative to the *element's own* \`font-size\`. Compounding: an element with \`font-size: 1.2em\` inside another with \`font-size: 1.2em\` results in \`1.44em\` of the root. Useful for component-relative spacing (padding, margin).
- \`rem\` — relative to the *root element's* \`font-size\` (usually \`16px\`). Does not compound. Best for font sizes and global spacing. If the user changes their browser's default font size, \`rem\` values scale with it.
- \`ch\` — width of the \`0\` character in the current font. Useful for constraining text line length: \`max-width: 65ch\` keeps prose at a comfortable reading width.
- \`vw\`, \`vh\` — percentage of viewport width/height. Useful for fluid type with \`clamp()\`.` },

      { type: "code", code: `/* Root font size — set to 62.5% for easy rem math (10px base) */
:root { font-size: 62.5%; }          /* 1rem = 10px */
body  { font-size: 1.6rem; }         /* 16px */

/* Fluid typography with clamp() */
/* min, preferred (viewport-based), max */
h1 { font-size: clamp(1.75rem, 4vw, 3rem); }
p  { font-size: clamp(1rem, 2vw, 1.25rem); }

/* Type scale — consistent sizing system */
:root {
  --text-xs:   0.75rem;    /* 12px */
  --text-sm:   0.875rem;   /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg:   1.125rem;   /* 18px */
  --text-xl:   1.25rem;    /* 20px */
  --text-2xl:  1.5rem;     /* 24px */
  --text-4xl:  2.25rem;    /* 36px */
}

/* Comfortable reading width */
.prose { max-width: 65ch; }` },

      { type: "text", content: `**Spacing and rhythm** — vertical rhythm creates visual consistency and improves readability.

- \`line-height\` — controls the height of each line. Use unitless values (e.g., \`1.6\`) rather than \`px\` or \`em\` — unitless values scale correctly with the font size. Body text: \`1.5\`–\`1.7\`. Headings: \`1.1\`–\`1.3\`.
- \`letter-spacing\` — adjusts space between characters. Positive values spread letters apart; negative values tighten them. Use \`em\` units so spacing scales with font size.
- \`word-spacing\` — adjusts space between words.
- \`text-indent\` — indents the first line of a block.
- \`text-align\` — horizontal alignment: \`left\`, \`right\`, \`center\`, \`justify\`. Avoid \`justify\` for languages with variable word lengths — it creates uneven spacing.` },

      { type: "code", code: `/* Recommended baseline typography */
body {
  font-size:   1rem;
  line-height: 1.65;          /* comfortable for body copy */
  color:       #e8e8f0;
}

h1, h2, h3, h4 {
  line-height:    1.2;        /* tighter for headings */
  letter-spacing: -0.02em;   /* slightly tighter headings */
  font-weight:    700;
}

/* Uppercase labels need extra letter-spacing */
.label {
  font-size:      0.75rem;
  font-weight:    600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* Font weight — use numbers for precision */
.thin     { font-weight: 100; }
.regular  { font-weight: 400; }
.medium   { font-weight: 500; }
.semibold { font-weight: 600; }
.bold     { font-weight: 700; }
.black    { font-weight: 900; }` },

      { type: "text", content: `**Text decoration and transformation:**

- \`text-decoration\` — underline, overline, line-through, none. Use \`text-decoration-color\`, \`text-decoration-thickness\`, and \`text-underline-offset\` for precise control.
- \`text-transform\` — \`uppercase\`, \`lowercase\`, \`capitalize\`. Use CSS transforms rather than typing in uppercase in HTML so screen readers read the text naturally.
- \`white-space\` — controls how whitespace and line breaks are handled. \`nowrap\` prevents wrapping. \`pre\` preserves whitespace exactly. \`pre-wrap\` preserves whitespace but allows wrapping.
- \`text-overflow\` — controls what happens when text overflows its container. Combine with \`overflow: hidden\` and \`white-space: nowrap\` for the ellipsis effect.
- \`overflow-wrap\` and \`word-break\` — control how long words break across lines.` },

      { type: "code", code: `/* Link underline styling */
a {
  text-decoration: underline;
  text-decoration-color: rgba(240, 192, 64, 0.4);
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  transition: text-decoration-color 0.2s;
}
a:hover { text-decoration-color: #f0c040; }

/* Remove underline safely */
.nav-link {
  text-decoration: none;
}
.nav-link:hover { text-decoration: underline; }

/* Truncate with ellipsis */
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Multi-line clamp (modern) */
.clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Break long URLs or code */
.break-anywhere { overflow-wrap: anywhere; }` },
    ],
  },

  "Layout: Flexbox": {
    sections: [
      { type: "text", content: `**Flexbox** (Flexible Box Layout) is a one-dimensional layout model designed for distributing space and aligning items within a container — either in a row or a column. It excels at aligning navigation bars, centering content, building card grids with equal heights, and distributing items with precise control.

Activate flexbox by setting \`display: flex\` on a **flex container**. Its direct children become **flex items**. Flex items will, by default, lay out in a row, shrink to fit within the container, and stretch to fill the container's cross-axis height.

Flexbox has two axes:
- **Main axis** — the direction of the flex flow (row → horizontal, column → vertical). \`justify-content\` aligns items along this axis.
- **Cross axis** — perpendicular to the main axis. \`align-items\` aligns items along this axis.` },

      { type: "code", code: `/* Flexbox container */
.container {
  display: flex;

  /* Main axis direction */
  flex-direction: row;           /* default: left to right */
  flex-direction: row-reverse;   /* right to left */
  flex-direction: column;        /* top to bottom */
  flex-direction: column-reverse;

  /* Wrapping */
  flex-wrap: nowrap;    /* default: items squish to fit one line */
  flex-wrap: wrap;      /* items wrap onto new lines */

  /* Shorthand: flex-flow = direction + wrap */
  flex-flow: row wrap;
}` },

      { type: "text", content: `**\`justify-content\`** aligns flex items along the **main axis**:

- \`flex-start\` (default) — items pack to the start
- \`flex-end\` — items pack to the end
- \`center\` — items center along the main axis
- \`space-between\` — first item at start, last at end, equal gaps between
- \`space-around\` — equal space on both sides of each item (half-space at edges)
- \`space-evenly\` — equal space between items *and* edges

**\`align-items\`** aligns flex items along the **cross axis** (for a single line):

- \`stretch\` (default) — items stretch to fill the container height
- \`flex-start\` — items align to the top (for row direction)
- \`flex-end\` — items align to the bottom
- \`center\` — items center vertically
- \`baseline\` — items align so their text baselines align` },

      { type: "code", code: `/* Common flexbox patterns */

/* Center anything (horizontal + vertical) */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Navigation bar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  height: 64px;
}

/* Card row — equal height cards */
.card-row {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.card { flex: 1 1 300px; }    /* grow, shrink, min 300px */

/* Push last item to the right */
.toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.toolbar .spacer { flex: 1; } /* takes all remaining space */` },

      { type: "text", content: `**Flex item properties** control how individual items behave within the container:

- \`flex-grow\` — how much the item grows relative to siblings when extra space is available. Default \`0\` (don't grow). \`flex-grow: 1\` shares space equally.
- \`flex-shrink\` — how much the item shrinks when space is insufficient. Default \`1\` (allow shrink). \`0\` prevents shrinking.
- \`flex-basis\` — the initial size before growing or shrinking. \`auto\` uses the item's content size. Can be \`px\`, \`%\`, \`rem\`, etc.
- \`flex\` shorthand — combines the three: \`flex: grow shrink basis\`. Most common values:
  - \`flex: 1\` → \`1 1 0\` (equal sharing from zero base)
  - \`flex: auto\` → \`1 1 auto\` (equal sharing from natural size)
  - \`flex: none\` → \`0 0 auto\` (rigid, does not flex)
- \`align-self\` — overrides \`align-items\` for a single item.
- \`order\` — changes visual order without changing the DOM. Use with caution (accessibility implications).` },

      { type: "code", code: `/* Flex item properties */
.item {
  flex-grow:   0;    /* don't grow (default) */
  flex-shrink: 1;    /* can shrink (default) */
  flex-basis:  auto; /* natural size (default) */

  /* Common shorthand values */
  flex: 1;           /* equal share, start from zero */
  flex: 0 0 200px;   /* fixed 200px — never grow or shrink */
  flex: 1 0 300px;   /* at least 300px, can grow, won't shrink */
}

/* Align one item differently */
.header-logo  { align-self: center; }
.header-badge { align-self: flex-end; }

/* Sidebar + main layout */
.layout {
  display: flex;
  gap: 2rem;
}
.sidebar { flex: 0 0 280px; }  /* fixed width sidebar */
.main    { flex: 1;          }  /* main takes remaining space */` },

      { type: "text", content: `**\`gap\`** (also available as \`row-gap\` and \`column-gap\`) adds consistent spacing between flex items without adding margin to the outer edges. This eliminates the need for margin-based spacing hacks.

**Multi-line alignment** — when \`flex-wrap: wrap\` is set, \`align-content\` controls the spacing of the *lines* on the cross axis (similar to \`justify-content\` but for rows). Only has effect when there are multiple lines.

**Common pitfall:** Flexbox stretches items to the container height by default (\`align-items: stretch\`). If you don't want images or cards to stretch, set \`align-items: flex-start\` or \`align-self: flex-start\` on the item.` },

      { type: "code", code: `/* gap — preferred over margins for flex spacing */
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;           /* equal row and column gap */
  gap: 1rem 2rem;        /* row-gap column-gap */
}

/* align-content for multi-line flex */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-content: flex-start;   /* pack lines to top */
}

/* Prevent image stretch */
.card {
  display: flex;
  align-items: flex-start;   /* or: align-items: center */
}

/* Vertical centering in a known height */
.hero {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  text-align: center;
}` },
    ],
  },

  "Layout: Grid": {
    sections: [
      { type: "text", content: `**CSS Grid** is a two-dimensional layout system — it works on both rows and columns simultaneously. Where Flexbox is best for one-dimensional layouts (a row of buttons, a vertical list), Grid excels at two-dimensional layouts (full page structure, card grids, form layouts).

Grid introduces new concepts: a **grid container** defines the layout, and **grid items** are placed within its tracks. Tracks are the rows and columns defined on the container. The spaces between tracks are called **gutters** (controlled with \`gap\`).

Activate Grid with \`display: grid\` on the container. Define columns with \`grid-template-columns\` and rows with \`grid-template-rows\`.` },

      { type: "code", code: `/* Basic grid container */
.grid {
  display: grid;

  /* 3 equal columns */
  grid-template-columns: 1fr 1fr 1fr;

  /* shorthand: repeat(count, size) */
  grid-template-columns: repeat(3, 1fr);

  /* Mixed: fixed sidebar, flexible content */
  grid-template-columns: 280px 1fr;

  /* Responsive: as many columns as fit, minimum 250px */
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));

  /* Rows */
  grid-template-rows: auto 1fr auto; /* header, main, footer */

  /* Gap between cells */
  gap: 1.5rem;
  gap: 1rem 2rem; /* row-gap column-gap */
}` },

      { type: "text", content: `**The \`fr\` unit** stands for "fraction" and represents a share of the available space in the grid container *after* fixed and content-based sizes are accounted for. \`1fr 2fr 1fr\` creates three columns where the middle is twice as wide as the others. \`fr\` units eliminate the need for percentage calculations and work correctly with \`gap\`.

**\`minmax(min, max)\`** sets a minimum and maximum size for a track. Combined with \`auto-fit\` or \`auto-fill\` and \`repeat\`, it creates responsive grids that adjust column count automatically without media queries:

- \`auto-fit\` — collapses empty tracks, stretches existing items to fill the space
- \`auto-fill\` — keeps empty tracks, does not stretch items` },

      { type: "code", code: `/* Responsive card grid — no media queries needed */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* Classic page layout with named areas */
.page {
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-template-rows: 64px 1fr auto;
  grid-template-areas:
    "header  header"
    "sidebar main"
    "footer  footer";
  min-height: 100vh;
}

.header  { grid-area: header;  }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main;    }
.footer  { grid-area: footer;  }` },

      { type: "text", content: `**Placing items** — grid items can be placed explicitly using line numbers, span keywords, or named areas. Grid lines are numbered from 1. Negative numbers count from the end (-1 is the last line).

- \`grid-column: 1 / 3\` — item spans from column line 1 to line 3 (occupies 2 columns)
- \`grid-column: span 2\` — item spans 2 columns from its auto-placed position
- \`grid-column: 1 / -1\` — item spans the full width

**Auto-placement** — items not explicitly placed are automatically positioned in the next available cell. Control with \`grid-auto-flow\`: \`row\` (default), \`column\`, or \`dense\` (fills gaps by reordering items — use with caution for accessibility).` },

      { type: "code", code: `/* Item placement */
.featured {
  grid-column: 1 / 3;        /* span 2 columns */
  grid-row: 1 / 3;           /* span 2 rows */
}

.hero-image {
  grid-column: span 3;       /* span 3 from auto position */
}

.full-width {
  grid-column: 1 / -1;       /* always spans full width */
}

/* 12-column grid system */
.container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
}

.col-4  { grid-column: span 4;  }  /* 4/12 = 33% */
.col-6  { grid-column: span 6;  }  /* 6/12 = 50% */
.col-8  { grid-column: span 8;  }  /* 8/12 = 66% */
.col-12 { grid-column: span 12; }  /* full width */` },

      { type: "text", content: `**Alignment in Grid** mirrors Flexbox but applies to both axes simultaneously.

- \`justify-items\` — aligns all items along the **row axis** (horizontal). Default: \`stretch\`.
- \`align-items\` — aligns all items along the **column axis** (vertical). Default: \`stretch\`.
- \`place-items\` — shorthand for \`align-items justify-items\`.
- \`justify-content\` — aligns the *grid tracks* within the container when tracks don't fill it.
- \`align-content\` — aligns the rows of tracks.
- \`place-content\` — shorthand for both.
- \`justify-self\` / \`align-self\` — override alignment for a single item.` },

      { type: "code", code: `/* Grid alignment */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 200px);

  /* Center all items within their cells */
  place-items: center;   /* shorthand: align-items justify-items */

  /* Center the tracks within the container */
  place-content: center;
}

/* Center one item */
.logo {
  justify-self: center;
  align-self: center;
}

/* Subgrid — inherit parent grid tracks (modern CSS) */
.card {
  display: grid;
  grid-template-rows: subgrid;  /* aligns card content to parent rows */
  grid-row: span 3;
}` },
    ],
  },

  "Positioning": {
    sections: [
      { type: "text", content: `CSS positioning removes elements from the normal document flow and places them at specific coordinates. The \`position\` property has five values, each with distinct behaviour. Most elements use the default (\`static\`); the other values enable precise placement using \`top\`, \`right\`, \`bottom\`, and \`left\` offset properties.

**\`position: static\`** (default) — the element follows normal document flow. Offset properties (\`top\`, \`left\`, etc.) have no effect. Cannot be a positioning context for absolute children.

**\`position: relative\`** — the element remains in the flow *as if it were static* (its space is preserved). Offsets shift it *visually* from that original position. Its main use is as a **positioning context** for absolutely positioned children — any \`absolute\` descendant will be positioned relative to this element.` },

      { type: "code", code: `/* relative — offset from original position, space preserved */
.badge {
  position: relative;
  top: -2px;            /* shifts 2px up, but layout is unchanged */
}

/* relative as positioning context */
.card {
  position: relative;   /* creates context for the badge inside */
}

.card .new-badge {
  position: absolute;   /* positioned relative to .card */
  top: 12px;
  right: 12px;
}` },

      { type: "text", content: `**\`position: absolute\`** — the element is removed from the normal flow entirely. Other elements act as if it does not exist. It is positioned relative to its **nearest positioned ancestor** (an ancestor with \`position\` other than \`static\`). If no positioned ancestor exists, it falls back to the initial containing block (effectively the viewport).

Offset values position the element's edges from the ancestor's edges. \`top: 0; left: 0\` places the top-left corner at the ancestor's top-left corner (respecting padding). \`top: 0; right: 0\` places it at the top-right.

\`width: 100%\` on an absolute element fills the width of its positioning ancestor.` },

      { type: "code", code: `/* absolute — removed from flow, positioned relative to ancestor */
.tooltip {
  position: absolute;
  top: calc(100% + 8px);    /* 8px below the parent */
  left: 50%;
  transform: translateX(-50%);  /* centre horizontally */
  white-space: nowrap;
  z-index: 10;
}

/* Full overlay */
.overlay {
  position: absolute;
  inset: 0;                 /* shorthand for top:0; right:0; bottom:0; left:0 */
  background: rgba(0,0,0,0.6);
}

/* Corner badge */
.product-card { position: relative; }
.sale-badge {
  position: absolute;
  top: 0;
  left: 0;
  background: #e05050;
  color: white;
  padding: 4px 8px;
}` },

      { type: "text", content: `**\`position: fixed\`** — the element is removed from flow and positioned relative to the **viewport**. It stays in place as the page scrolls. Common uses: fixed navigation bars, cookie banners, "back to top" buttons, floating action buttons.

**\`position: sticky\`** — a hybrid: behaves as \`relative\` until the element would scroll past a specified threshold, at which point it "sticks" as \`fixed\`. When the scroll position moves back past the threshold, it reverts to \`relative\`. The element remains in the flow and occupies space throughout.

Sticky requires a \`top\`, \`bottom\`, \`left\`, or \`right\` value to define the sticking point. It sticks within its **containing block** (the nearest scrolling ancestor or the viewport).` },

      { type: "code", code: `/* fixed — anchored to viewport */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;                   /* or: width: 100% */
  height: 64px;
  background: #0d0b20;
  z-index: 100;
}

/* Add padding to body to compensate for fixed header */
body { padding-top: 64px; }

/* sticky — sticks within its container */
.section-header {
  position: sticky;
  top: 64px;                  /* 64px from top of viewport (below navbar) */
  background: #0d0b20;
  z-index: 10;
  padding: 1rem 0;
}

/* Sticky table header */
thead th {
  position: sticky;
  top: 0;
  background: #1a1a3e;
  z-index: 1;
}` },

      { type: "text", content: `**\`z-index\`** controls the stacking order of positioned elements (non-static). Higher values appear in front of lower values. Only works on elements with \`position\` other than \`static\`, or on flex/grid items.

**Stacking contexts** — certain properties create a new stacking context, making all \`z-index\` values local to that context. Creating a context: \`position\` (non-static) with \`z-index\` not \`auto\`, \`opacity\` less than 1, \`transform\`, \`filter\`, \`isolation: isolate\`, \`will-change\`.

Stacking contexts prevent \`z-index\` values from "leaking" to the parent. An element with \`z-index: 9999\` inside a stacking context with \`z-index: 1\` will still appear behind an element in a stacking context with \`z-index: 2\`.` },

      { type: "code", code: `/* z-index scale — use a defined scale to avoid z-index wars */
:root {
  --z-below:    -1;
  --z-normal:    0;
  --z-raised:   10;
  --z-dropdown: 100;
  --z-sticky:   200;
  --z-overlay:  300;
  --z-modal:    400;
  --z-toast:    500;
}

.dropdown { z-index: var(--z-dropdown); }
.modal    { z-index: var(--z-modal);    }

/* Create isolated stacking context */
.card {
  isolation: isolate;    /* contains z-index to this element */
}

/* transform creates stacking context */
.animated {
  transform: translateZ(0);  /* common "z-index fix" hack */
}` },
    ],
  },

  "Responsive Design": {
    sections: [
      { type: "text", content: `**Responsive design** is the practice of building web interfaces that adapt their layout, typography, and content to work correctly across all screen sizes — from small mobile phones to large desktop monitors. Rather than building separate sites for each device, one codebase serves all.

The three foundations of responsive design:
1. **Fluid grids** — use relative units (\`%\`, \`fr\`, \`vw\`) instead of fixed pixel widths so content scales proportionally.
2. **Flexible images** — images that scale down within their containers.
3. **Media queries** — CSS rules that apply only when specific conditions are met (viewport width, orientation, etc.).

The **viewport meta tag** is required for responsive design to work on mobile devices. Without it, mobile browsers render at desktop width and zoom out, ignoring your CSS.` },

      { type: "code", code: `<!-- Required in <head> for responsive design -->
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

/* Flexible images — always include this */
img, video, iframe {
  max-width: 100%;
  height: auto;
}

/* Fluid container */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}` },

      { type: "text", content: `**Media queries** apply styles conditionally based on device characteristics. The most common condition is viewport width using \`min-width\` (for mobile-first) or \`max-width\` (for desktop-first).

**Mobile-first approach** — write base styles for the smallest screen, then add \`min-width\` media queries to override/extend for larger screens. This is the recommended approach because:
- Mobile styles tend to be simpler (single column, stacked elements)
- Browsers on slow connections don't download desktop-only assets
- Progressive enhancement — start with what works everywhere, add complexity for capable devices

**Breakpoints** — the viewport widths at which your design changes. Common breakpoints (adjust to your content, not specific devices):
- Small (mobile): default (no query)
- Medium (tablet): \`min-width: 640px\` or \`768px\`
- Large (desktop): \`min-width: 1024px\` or \`1280px\`
- X-Large: \`min-width: 1280px\` or \`1536px\`` },

      { type: "code", code: `/* Mobile-first breakpoints */
:root {
  --bp-sm:  640px;
  --bp-md:  768px;
  --bp-lg:  1024px;
  --bp-xl:  1280px;
  --bp-2xl: 1536px;
}

/* Base: mobile */
.card-grid {
  display: grid;
  grid-template-columns: 1fr;   /* single column */
  gap: 1rem;
}

/* Tablet */
@media (min-width: 640px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}

/* Typography scaling */
h1 { font-size: 1.75rem; }

@media (min-width: 768px) {
  h1 { font-size: 2.5rem; }
}

@media (min-width: 1024px) {
  h1 { font-size: 3.5rem; }
}` },

      { type: "text", content: `**Viewport units** — CSS units relative to the viewport dimensions:

- \`vw\` — 1% of viewport width. \`100vw\` = full viewport width.
- \`vh\` — 1% of viewport height. \`100vh\` = full viewport height.
- \`vmin\` — 1% of the smaller viewport dimension (width or height).
- \`vmax\` — 1% of the larger viewport dimension.
- \`dvh\` (dynamic viewport height) — adjusts for mobile browser chrome (address bar). Preferred over \`vh\` for full-screen mobile layouts.
- \`svh\` (small viewport height) — assumes UI chrome is visible (smallest viewport).
- \`lvh\` (large viewport height) — assumes UI chrome is hidden (largest viewport).

\`vw\` is commonly used for fluid typography: \`font-size: 4vw\` scales text with the viewport. Combine with \`clamp()\` to set minimum and maximum bounds.` },

      { type: "code", code: `/* Viewport units */
.hero {
  min-height: 100dvh;           /* full screen, adjusts for mobile chrome */
  display: grid;
  place-items: center;
}

/* Fluid typography with clamp */
h1 {
  font-size: clamp(1.75rem, 5vw, 4rem);
  /* min: 1.75rem, preferred: 5% of viewport, max: 4rem */
}

p {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
}

/* Full-bleed section */
.full-bleed {
  width: 100vw;
  margin-left: calc(50% - 50vw);
}` },

      { type: "text", content: `**Additional media features** beyond width allow targeting specific device capabilities:

- \`orientation\` — \`portrait\` or \`landscape\`
- \`prefers-color-scheme\` — \`light\` or \`dark\` — respect user's OS dark/light mode preference
- \`prefers-reduced-motion\` — user has requested minimal animation
- \`prefers-contrast\` — user needs higher contrast
- \`hover\` — whether the primary input device can hover (\`hover\`, \`none\`)
- \`pointer\` — precision of the primary pointer (\`fine\` for mouse, \`coarse\` for touch)

These media features allow you to adapt not just layout but also colour schemes, motion, and interaction patterns to user preferences — a core part of accessibility.` },

      { type: "code", code: `/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg:   #0d0b20;
    --color-text: #e8e8f0;
  }
}

@media (prefers-color-scheme: light) {
  :root {
    --color-bg:   #ffffff;
    --color-text: #1a1a2e;
  }
}

/* Reduced motion — disable animations for accessibility */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Touch vs mouse: larger tap targets for touch */
@media (hover: none) and (pointer: coarse) {
  .btn {
    min-height: 48px;   /* WCAG 2.5.8: minimum 24x24px target */
    padding: 12px 24px;
  }
}

/* Landscape orientation */
@media (orientation: landscape) and (max-height: 500px) {
  .hero { min-height: auto; padding: 2rem 0; }
}` },
    ],
  },
};

async function main() {
  const book = await prisma.book.findUnique({
    where: { slug: "css" },
    include: { chapters: { orderBy: { order: "asc" } } },
  });

  if (!book) { console.error("CSS book not found."); process.exit(1); }
  console.log(`\nUpdating ${book.chapters.length} chapters for "${book.title}"...\n`);

  let updated = 0;
  for (const ch of book.chapters) {
    const data = cssChapters[ch.title];
    if (!data) { console.log(`  SKIP  "${ch.title}" — no content defined`); continue; }

    await prisma.bookChapter.update({
      where: { id: ch.id },
      data: {
        sections: data.sections as object[],
        content: data.sections.filter((s) => s.type === "text")
          .map((s) => (s as { type: "text"; content: string }).content).join("\n\n"),
        example: data.sections.filter((s) => s.type === "code")
          .map((s) => (s as { type: "code"; code: string }).code).join("\n\n---\n\n") || undefined,
      } as object,
    });

    const t = data.sections.filter((s) => s.type === "text").length;
    const c = data.sections.filter((s) => s.type === "code").length;
    console.log(`  ✅  "${ch.title}" — ${t} text, ${c} code blocks`);
    updated++;
  }

  console.log(`\nDone — updated ${updated} chapters.\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
