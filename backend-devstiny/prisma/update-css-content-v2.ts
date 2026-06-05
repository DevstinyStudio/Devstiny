import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type Block = { type: "text"; content: string } | { type: "code"; lang?: string; code: string };

// ─── Updated existing chapters ────────────────────────────────────────────────

const existingChapters: Record<string, { newOrder: number; topics: string[]; sections: Block[] }> = {

  // 1 ── Introduction to CSS ──────────────────────────────────────────────────
  "How CSS Works": {
    newOrder: 1,
    topics: ["What is CSS", "Three Ways to Apply CSS", "The Cascade", "Browser Parsing", "CSS History"],
    sections: [
      {
        type: "text",
        content: `CSS (Cascading Style Sheets) is the language used to describe the visual presentation of HTML documents. While HTML defines what content is, CSS defines how it looks — colours, fonts, spacing, layout, animations, and more.

CSS is a rule-based language. Each rule consists of a selector (which elements to target) and a declaration block (the styles to apply). The browser reads HTML and CSS separately, then combines them to render the final page.

**Brief History of CSS**

• **CSS1** (1996) — basic text formatting: fonts, colours, alignment
• **CSS2** (1998) — positioning, z-index, media types
• **CSS2.1** (2011) — corrected inconsistencies; became the stable baseline
• **CSS3** (2012+) — not a single version but a collection of modules developed independently: Flexbox, Grid, Animations, Custom Properties, etc. CSS3 modules are released and updated independently, so there is no "CSS4" — individual modules version separately

CSS is maintained by the W3C (World Wide Web Consortium) and is a living standard.`,
      },
      {
        type: "text",
        content: `**Three Ways to Apply CSS**

CSS can be applied to HTML in three ways, with different trade-offs:

**1. External Stylesheet (recommended)**
A separate .css file linked in <head>. This is the standard approach — styles are reusable across all pages, cached by the browser, and completely separate from HTML structure.

**2. Internal Stylesheet (use sparingly)**
CSS written inside a <style> element in <head>. Useful for per-page styles or single-page demos where an external file would be overkill. Not cached separately.

**3. Inline Styles (avoid)**
CSS written directly on an element's style attribute. Inline styles have the highest specificity (overriding all other CSS), making them hard to override later. Avoid for anything beyond dynamic styles set by JavaScript.

**How Browsers Parse and Apply CSS**

The browser's rendering pipeline for CSS:
1. Download the HTML and CSS files
2. Parse HTML → build the DOM tree
3. Parse CSS → build the CSSOM (CSS Object Model)
4. Combine DOM + CSSOM → build the Render Tree (only visible elements)
5. Calculate positions and sizes (Layout / Reflow)
6. Draw pixels (Paint)
7. Composite layers (Composite)

CSS blocks rendering — the browser must finish parsing all CSS before it can paint. This is why <link rel="stylesheet"> should be in <head>, and why minimising CSS file size matters for performance.`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* ── External stylesheet (styles.css) ── */
body {
  font-family: 'Inter', Arial, sans-serif;
  background-color: #1a1a2e;
  color: #e0e0e0;
  margin: 0;
  padding: 0;
}

h1 {
  font-size: 2rem;
  color: #f0c040;
}`,
      },
      {
        type: "code",
        lang: "html",
        code: `<!-- External stylesheet — in <head> -->
<link rel="stylesheet" href="/styles/main.css" />

<!-- Internal stylesheet — in <head> -->
<style>
  .hero {
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    padding: 4rem 2rem;
  }
</style>

<!-- Inline style — avoid where possible -->
<p style="color: red; font-size: 14px;">Urgent notice</p>`,
      },
      {
        type: "text",
        content: `**A Basic CSS Rule**

Every CSS rule has the same structure:

\`selector { property: value; }\`

• **Selector** — identifies which HTML elements the rule applies to
• **Declaration block** — wrapped in curly braces, contains one or more declarations
• **Declaration** — a property-value pair separated by a colon, terminated with a semicolon
• **Property** — the aspect to change (color, font-size, margin, etc.)
• **Value** — the setting for that property

Comments in CSS are written with /* comment */. They are ignored by the browser and do not affect rendering.

**Inheritance**

Some CSS properties inherit — child elements automatically receive the parent's value unless overridden. Inherited properties are mostly text-related: color, font-family, font-size, line-height, letter-spacing, text-align, visibility.

Non-inherited properties (like margin, padding, border, background, width) must be explicitly set on each element.

The inherit keyword forces a property to inherit its value from the parent. The initial keyword resets it to the browser default. The unset keyword uses inherit for inherited properties and initial for non-inherited ones.`,
      },
    ],
  },

  // 2 ── Selectors ────────────────────────────────────────────────────────────
  "Selectors": {
    newOrder: 2,
    topics: ["Basic Selectors", "Attribute Selectors", "Combinators", "Pseudo-classes", "Pseudo-elements", "Specificity", "The Cascade"],
    sections: [
      {
        type: "text",
        content: `**Basic Selectors**

CSS selectors define which HTML elements a rule applies to. The three basic selector types:

• **Type selector** — matches all elements of a given tag: \`p\`, \`h1\`, \`button\`
• **Class selector** — matches elements with a given class attribute: \`.card\`, \`.btn-primary\`. A dot prefix is required. An element can have multiple classes.
• **ID selector** — matches the element with a given id attribute: \`#main-nav\`. A hash prefix is required. IDs must be unique per page.

**Grouping**

Multiple selectors sharing the same declaration block are separated by commas: \`h1, h2, h3 { margin: 0; }\`

**Attribute Selectors**

Attribute selectors match elements based on their attributes or attribute values:

• \`[attr]\` — has the attribute, any value
• \`[attr="value"]\` — exact match
• \`[attr^="value"]\` — value starts with "value"
• \`[attr$="value"]\` — value ends with "value"
• \`[attr*="value"]\` — value contains "value"
• \`[attr~="value"]\` — value is a whitespace-separated list containing "value"
• \`[attr|="value"]\` — value is exactly "value" or starts with "value-"

Add i before the closing bracket for case-insensitive matching: \`[type="text" i]\`

**Combinators**

Combinators define relationships between selectors:

• **Descendant** (space): \`.card p\` — any <p> anywhere inside .card
• **Child** (>): \`.nav > li\` — only direct <li> children of .nav
• **Adjacent sibling** (+): \`h2 + p\` — the first <p> immediately after an <h2>
• **General sibling** (~): \`h2 ~ p\` — all <p> elements that are siblings after an <h2>`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* Type, class, ID selectors */
p { color: #ccc; }
.card { border-radius: 8px; }
#hero { height: 100vh; }

/* Grouping */
h1, h2, h3 { font-family: 'Press Start 2P', monospace; }

/* Attribute selectors */
input[type="email"] { border-color: #7a4af0; }
a[href^="https"] { color: green; }     /* external links */
a[href$=".pdf"] { color: red; }        /* PDF links */
img[alt=""] { outline: 2px solid red; } /* missing alt text */

/* Combinators */
.nav > li { display: inline-block; }   /* direct children */
.card p { font-size: 0.9rem; }         /* descendants */
label + input { margin-top: 4px; }    /* adjacent sibling */
h2 ~ p { color: #aaa; }               /* all following siblings */

/* Universal selector — use sparingly (matches everything) */
*, *::before, *::after {
  box-sizing: border-box;
}`,
      },
      {
        type: "text",
        content: `**Pseudo-classes**

Pseudo-classes match elements in a specific state or position:

**User-state pseudo-classes** (change as user interacts):
• \`:hover\` — pointer is over the element
• \`:focus\` — element has keyboard/pointer focus
• \`:focus-visible\` — focused via keyboard (not pointer); prefer this over :focus for outlines
• \`:active\` — element is being clicked/activated
• \`:visited\` — link that has been visited
• \`:checked\` — checked checkbox or radio
• \`:disabled\` / \`:enabled\` — form controls
• \`:valid\` / \`:invalid\` — form validation state

**Structural pseudo-classes** (based on position in DOM):
• \`:first-child\` / \`:last-child\` — first or last child of its parent
• \`:nth-child(n)\` — every nth child; n can be a number, "odd", "even", or formula like \`2n+1\`
• \`:nth-of-type(n)\` — nth element of that tag type among siblings
• \`:only-child\` — only child of its parent
• \`:not(selector)\` — elements not matching the selector; accepts a complex selector list in modern CSS

**Pseudo-elements**

Pseudo-elements match a part of an element rather than the element itself:
• \`::before\` — inserts content before the element's content (requires content property)
• \`::after\` — inserts content after the element's content
• \`::first-line\` — the first rendered line of a block
• \`::first-letter\` — the first letter of a block
• \`::placeholder\` — the placeholder text of an input
• \`::selection\` — text currently selected by the user
• \`::marker\` — the bullet or number of a list item`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* Pseudo-classes */
button:hover { opacity: 0.85; }
button:active { transform: scale(0.97); }
input:focus-visible { outline: 2px solid #7a4af0; outline-offset: 2px; }
a:visited { color: #a0a0d0; }

/* nth-child */
li:nth-child(odd) { background: rgba(255,255,255,0.03); }
li:first-child { border-top: none; }
li:last-child { border-bottom: none; }

/* :not() */
.btn:not(.btn-primary) { background: transparent; }
p:not(:last-child) { margin-bottom: 1rem; }

/* Pseudo-elements */
.section-title::before {
  content: "◆ ";
  color: #f0c040;
}

.card::after {
  content: "";
  display: block;
  height: 2px;
  background: linear-gradient(90deg, #7a4af0, transparent);
}

input::placeholder {
  color: #666;
  font-style: italic;
}

p::first-letter {
  font-size: 2em;
  float: left;
  line-height: 1;
  margin-right: 0.1em;
}`,
      },
      {
        type: "text",
        content: `**Specificity**

When multiple rules target the same element and set the same property, specificity determines which rule wins. Specificity is calculated as a three-part score: (A, B, C)

• **A** — number of ID selectors in the rule
• **B** — number of class selectors, attribute selectors, and pseudo-classes
• **C** — number of type selectors and pseudo-elements

Higher A beats lower A; then B; then C. Inline styles beat all, with a virtual score of (1,0,0,0). Specificity is not a decimal — (0,1,0) beats (0,0,10).

**The Cascade**

When specificity is equal, the cascade determines the winner by origin and order:

1. **Browser default styles** (user agent stylesheet) — lowest priority
2. **Author styles** (your CSS) — normal priority
3. **User styles** (reader's browser overrides) — high priority
4. **!important declarations** — highest priority (avoid unless necessary)

When origin is the same, the rule that appears **later in the stylesheet** wins. This is why you import third-party resets/bases first, and your custom styles last.

**Best practice**: Keep specificity as low as possible. Use class selectors for almost everything. Avoid ID selectors in CSS. Avoid !important.`,
      },
    ],
  },

  // 3 ── The Box Model ────────────────────────────────────────────────────────
  "The Box Model": {
    newOrder: 3,
    topics: ["Content, Padding, Border, Margin", "box-sizing", "Width & Height", "Margin Collapsing", "Shorthand", "overflow", "display"],
    sections: [
      {
        type: "text",
        content: `**The Box Model**

Every element in CSS is represented as a rectangular box composed of four nested layers, from inside to outside:

1. **Content box** — the area where text and child elements are rendered. Width and height control this by default.
2. **Padding box** — transparent space between the content and the border. Padding is part of the clickable/visible area of the element and inherits the background.
3. **Border box** — a line around the padding (can be solid, dashed, dotted, or none). The border has width, style, and colour.
4. **Margin box** — transparent space outside the border that pushes other elements away. Margins are always transparent — they never show the background.

**box-sizing: the most important CSS property for layouts**

By default (content-box), width and height only apply to the content box. Padding and border are added on top:

\`width: 300px + padding: 20px + border: 2px = 344px total\`

With border-box, width and height include padding and border. The content shrinks to fit:

\`width: 300px = content + padding + border\` (always 300px total)

This is almost always what you want. Apply it globally to every project.`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* Apply border-box globally — do this on every project */
*, *::before, *::after {
  box-sizing: border-box;
}

/* content-box (default): actual rendered width = 300 + 40 + 4 = 344px */
.content-box {
  box-sizing: content-box;
  width: 300px;
  padding: 20px;
  border: 2px solid #333;
}

/* border-box: actual rendered width = 300px exactly */
.border-box {
  box-sizing: border-box;
  width: 300px;
  padding: 20px;
  border: 2px solid #333;
}

/* Width and height */
.fixed-size { width: 400px; height: 200px; }
.responsive  { width: 100%; max-width: 800px; }
.viewport    { width: 100vw; height: 100vh; }`,
      },
      {
        type: "text",
        content: `**Shorthand Notation**

Margin and padding accept 1 to 4 values using clock-wise order (top → right → bottom → left):

• 1 value: all four sides — \`margin: 16px\`
• 2 values: top+bottom, left+right — \`margin: 16px 24px\`
• 3 values: top, left+right, bottom — \`margin: 16px 24px 8px\`
• 4 values: top, right, bottom, left — \`margin: 8px 16px 24px 32px\`

**Margin Collapsing**

Adjacent vertical margins between block elements collapse into a single margin — the larger of the two values, not their sum. This happens between:
• Adjacent sibling elements (bottom margin of first + top margin of second → single margin)
• Parent and first/last child (when no padding or border separates them)

Margin collapsing does NOT happen:
• For horizontal margins
• For flex or grid items
• For absolutely or fixed positioned elements
• When padding or border separates parent and child

**overflow**

When content is larger than its container, overflow controls what happens:
• \`visible\` (default) — content spills outside the box, not clipped
• \`hidden\` — content is clipped, no scrollbar
• \`scroll\` — content is clipped, scrollbar always shown
• \`auto\` — scrollbar shown only when content overflows (usually preferred)
• \`clip\` — like hidden but also prevents programmatic scrolling`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* Shorthand margin and padding */
.card {
  margin: 0 auto;        /* top/bottom: 0, left/right: auto (centres block) */
  padding: 24px 32px;    /* top/bottom: 24px, left/right: 32px */
}

/* Longhand equivalents */
.card {
  margin-top: 0;
  margin-right: auto;
  margin-bottom: 0;
  margin-left: auto;
  padding-top: 24px;
  padding-right: 32px;
  padding-bottom: 24px;
  padding-left: 32px;
}

/* overflow */
.scroll-container {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Truncate text to one line */
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* display values */
.block { display: block; }         /* starts new line, full width */
.inline { display: inline; }       /* flows in text, no width/height */
.inline-block { display: inline-block; } /* flows in text, width/height respected */
.hidden { display: none; }         /* removed from layout entirely */`,
      },
    ],
  },

  // 4 ── Typography ───────────────────────────────────────────────────────────
  "Typography": {
    newOrder: 4,
    topics: ["Font Properties", "Text Properties", "Web Fonts", "Color Values", "opacity vs rgba", "text-shadow", "Text Overflow"],
    sections: [
      {
        type: "text",
        content: `**Font Properties**

• \`font-family\` — specifies a prioritised list of fonts. The browser uses the first font in the list that is available. Always end with a generic family: serif, sans-serif, monospace, cursive, fantasy.
• \`font-size\` — the size of text. Can be px (absolute), rem (relative to root), em (relative to parent), %, vw, or named keywords (small, medium, large).
• \`font-weight\` — thickness of the font: 100–900 in multiples of 100, or keywords (normal = 400, bold = 700). Only works if the font file includes that weight.
• \`font-style\` — normal, italic, or oblique.
• \`font-variant\` — normal or small-caps (renders lowercase as small uppercase letters).
• \`font-stretch\` — condensed, normal, expanded (requires variable font support).
• \`font\` shorthand: \`font: [style] [variant] [weight] [size/line-height] family\`

**Units for font-size**

• \`px\` — fixed pixels; does not scale with browser zoom preferences in older browsers
• \`rem\` — relative to the root element's font-size (usually 16px). Scales correctly with user preferences. **Preferred for font sizes.**
• \`em\` — relative to the element's own font-size (or parent's if setting font-size). Useful for padding/margin that should scale with the text.
• \`%\` — same as em when used on font-size`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* Font properties */
body {
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 1rem;       /* 16px by default */
  font-weight: 400;
  line-height: 1.6;      /* unitless: 1.6 × font-size */
}

h1 {
  font-size: 2.5rem;     /* 40px */
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.2;
}

code, pre {
  font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
  font-size: 0.875rem;   /* 14px */
}

/* font shorthand: style variant weight size/line-height family */
.display-text {
  font: italic small-caps 700 2rem/1.2 'Merriweather', serif;
}`,
      },
      {
        type: "text",
        content: `**Text Properties**

• \`line-height\` — space between lines. A unitless number (e.g. 1.6) is recommended — it scales proportionally with font-size. Pixel or em values do not scale.
• \`letter-spacing\` — additional space between characters (tracking). Positive opens up text; negative tightens it.
• \`word-spacing\` — additional space between words.
• \`text-align\` — horizontal alignment of inline content: left, right, center, justify, start, end.
• \`text-decoration\` — underline, overline, line-through, none. Can also set color and style.
• \`text-transform\` — uppercase, lowercase, capitalize, none.
• \`text-indent\` — indents the first line of a text block.

**Web Fonts**

Web-safe fonts (Arial, Georgia, Times New Roman, Courier New, Verdana) are pre-installed on most operating systems. For custom fonts, use:

• **Google Fonts** — load via a <link> in HTML or @import in CSS
• **@font-face** — load custom font files you self-host

**Color Values**

CSS supports multiple colour notations:
• Named: \`red\`, \`gold\`, \`transparent\`
• Hex: \`#RRGGBB\` or shorthand \`#RGB\` (e.g. \`#f0c\` = \`#ff00cc\`)
• With alpha: \`#RRGGBBAA\` (e.g. \`#f0c040aa\`)
• RGB: \`rgb(240, 192, 64)\`
• RGBA: \`rgba(240, 192, 64, 0.5)\` — fourth value 0 (transparent) to 1 (opaque)
• HSL: \`hsl(hue, saturation%, lightness%)\` — more intuitive for adjusting colours
• HSLA: \`hsla(45, 85%, 60%, 0.8)\`
• Modern: \`oklch()\`, \`lab()\`, \`color()\` — wider gamut colour spaces`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* Text properties */
p {
  text-align: left;
  text-indent: 2em;
  word-spacing: 0.05em;
  letter-spacing: 0.01em;
}

.badge {
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 0.75rem;
}

a {
  text-decoration: underline;
  text-decoration-color: currentColor;
  text-underline-offset: 3px;
}

/* Google Fonts (in <head> HTML) */
/* <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet"> */

/* Self-hosted font */
@font-face {
  font-family: 'PixelFont';
  src: url('/fonts/press-start.woff2') format('woff2'),
       url('/fonts/press-start.woff') format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap;  /* show fallback font while custom font loads */
}

/* Color values */
.gold { color: #f0c040; }
.gold { color: rgb(240, 192, 64); }
.gold { color: hsl(45, 85%, 60%); }

/* opacity vs rgba */
.opacity { opacity: 0.5; }         /* affects element AND all its children */
.rgba    { background: rgba(0, 0, 0, 0.5); }  /* only this property */

/* text-shadow: offset-x offset-y blur-radius color */
.glow {
  text-shadow:
    0 0 10px #f0c040,
    0 0 20px #f0c040,
    0 0 40px rgba(240, 192, 64, 0.5);
}

/* Text overflow */
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.break-long-words {
  overflow-wrap: break-word;  /* or word-break: break-all */
}`,
      },
    ],
  },

  // 6 ── Layout: Flexbox ───────────────────────────────────────────────────────
  "Layout: Flexbox": {
    newOrder: 6,
    topics: ["display: flex", "flex-direction", "flex-wrap", "justify-content", "align-items", "flex-grow/shrink/basis", "gap", "order"],
    sections: [
      {
        type: "text",
        content: `**Flexbox — One-Dimensional Layout**

Flexbox (Flexible Box Layout) is designed for distributing space and aligning items in one dimension — either a row (horizontal) or a column (vertical). It is the ideal tool for navigation bars, card rows, button groups, centering, and any layout where items need to flex and fill available space.

When you set \`display: flex\` on an element, it becomes a **flex container**. Its direct children become **flex items**. Items are placed along the **main axis** (controlled by flex-direction) and can be aligned along the **cross axis** (perpendicular to the main axis).

**flex-direction**

Controls which axis items are placed on:
• \`row\` (default) — left to right (main axis = horizontal)
• \`row-reverse\` — right to left
• \`column\` — top to bottom (main axis = vertical)
• \`column-reverse\` — bottom to top

**flex-wrap**

By default, flex items shrink to fit in one line. flex-wrap changes this:
• \`nowrap\` (default) — all items on one line, shrinking if needed
• \`wrap\` — items wrap to new lines when they run out of space
• \`wrap-reverse\` — wraps in reverse order

\`flex-flow\` is the shorthand for flex-direction + flex-wrap: \`flex-flow: row wrap\``,
      },
      {
        type: "code",
        lang: "css",
        code: `/* Container properties */
.flex-container {
  display: flex;
  flex-direction: row;       /* row | row-reverse | column | column-reverse */
  flex-wrap: wrap;           /* nowrap | wrap | wrap-reverse */
  gap: 16px;                 /* space between items (row-gap column-gap) */
}

/* Alignment on the main axis */
.justify {
  justify-content: flex-start;    /* pack items to start */
  justify-content: flex-end;      /* pack items to end */
  justify-content: center;        /* center items */
  justify-content: space-between; /* equal space between items */
  justify-content: space-around;  /* equal space around items */
  justify-content: space-evenly;  /* equal space everywhere */
}

/* Alignment on the cross axis */
.align {
  align-items: stretch;    /* default: fill cross axis */
  align-items: flex-start; /* align to start of cross axis */
  align-items: flex-end;   /* align to end of cross axis */
  align-items: center;     /* center on cross axis */
  align-items: baseline;   /* align text baselines */
}

/* Multi-line alignment (flex-wrap: wrap only) */
.multi {
  align-content: flex-start;
  align-content: center;
  align-content: space-between;
}`,
      },
      {
        type: "text",
        content: `**Flex Item Properties**

Applied to individual flex items, not the container:

• **flex-grow** — how much the item grows relative to others when there is extra space. Default 0 (no growth). Value of 1 means the item takes an equal share of remaining space.
• **flex-shrink** — how much the item shrinks relative to others when there is not enough space. Default 1 (equal shrinking). Value 0 means the item will not shrink.
• **flex-basis** — the initial main-size of the item before free space is distributed. Values: auto (use the item's width/height), 0, or a length like 200px. auto is the default.
• **flex shorthand** — \`flex: grow shrink basis\`

Common flex shorthand values:
• \`flex: 1\` — equal flexible item (grow: 1, shrink: 1, basis: 0)
• \`flex: auto\` — grow: 1, shrink: 1, basis: auto (item's natural size first)
• \`flex: none\` — grow: 0, shrink: 0, basis: auto (completely rigid)
• \`flex: 0 1 200px\` — won't grow, can shrink, starts at 200px

• **align-self** — overrides align-items for one specific item
• **order** — changes visual order without changing DOM order. Default 0; lower values appear first. Negative values allowed.`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* Flex item properties */
.item { flex: 1; }          /* equal flexible items */
.item-rigid { flex: none; } /* rigid, no grow or shrink */
.item-grow { flex: 2; }     /* grows at twice the rate */

/* Centering trick — the classic use case */
.center-child {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Navigation bar */
.navbar {
  display: flex;
  align-items: center;
  gap: 8px;
}
.navbar .logo { margin-right: auto; } /* pushes other items to the right */

/* Card grid with flex */
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}
.card-grid .card {
  flex: 1 1 280px; /* grow, shrink, min 280px */
  max-width: 400px;
}

/* align-self on individual item */
.tall-item { align-self: stretch; }
.top-item { align-self: flex-start; }

/* Sidebar + main layout */
.layout {
  display: flex;
  gap: 24px;
}
.sidebar { flex: 0 0 260px; }  /* rigid 260px sidebar */
.main    { flex: 1; }           /* main takes the rest */`,
      },
    ],
  },

  // 7 ── Layout: Grid ─────────────────────────────────────────────────────────
  "Layout: Grid": {
    newOrder: 7,
    topics: ["display: grid", "grid-template-columns/rows", "fr unit", "repeat() & minmax()", "grid-template-areas", "Placing Items", "gap", "Implicit Grid", "Alignment"],
    sections: [
      {
        type: "text",
        content: `**CSS Grid — Two-Dimensional Layout**

CSS Grid is designed for two-dimensional layouts — placing items across both rows and columns simultaneously. It is the ideal tool for page-level layouts, image galleries, dashboard grids, and any layout requiring precise placement in both axes.

Setting \`display: grid\` on an element makes it a **grid container**. Its direct children become **grid items**. Grid items are placed into the grid either automatically or explicitly.

**Defining the Grid Structure**

• \`grid-template-columns\` — defines the number and size of columns
• \`grid-template-rows\` — defines the number and size of rows

Values can be fixed lengths (px, rem), percentages, the special \`fr\` unit, or keywords.

**The fr Unit**

\`fr\` (fraction) represents a share of the remaining free space in the grid container. After fixed-size tracks are calculated, the remaining space is divided among fr tracks proportionally:

\`grid-template-columns: 1fr 2fr 1fr\` — three columns where the middle is twice the width of the others.

**repeat()**

The \`repeat()\` function avoids repetition: \`repeat(3, 1fr)\` is the same as \`1fr 1fr 1fr\`.

With \`auto-fill\` or \`auto-fit\`, the browser calculates how many tracks fit:
• \`auto-fill\` — creates as many tracks as fit, even if empty
• \`auto-fit\` — collapses empty tracks to zero width`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* Basic grid */
.grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;    /* 3 columns */
  grid-template-rows: auto 1fr auto;     /* 3 rows */
  gap: 24px;                             /* gap between all cells */
}

/* repeat() shorthand */
.equal-cols { grid-template-columns: repeat(4, 1fr); }

/* Auto-responsive grid — no media queries needed */
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

/* minmax(min, max) — track is at least min, at most max */
.flexible {
  grid-template-columns: repeat(3, minmax(200px, 1fr));
}

/* Named areas — describes the layout visually */
.page-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-template-rows: 64px 1fr 48px;
  grid-template-areas:
    "header  header"
    "sidebar main  "
    "footer  footer";
  min-height: 100vh;
  gap: 0;
}

.page-header  { grid-area: header; }
.page-sidebar { grid-area: sidebar; }
.page-main    { grid-area: main; }
.page-footer  { grid-area: footer; }`,
      },
      {
        type: "text",
        content: `**Placing Items**

Grid items can be explicitly placed using line numbers:
• \`grid-column: 1 / 3\` — starts at column line 1, ends at line 3 (spans 2 columns)
• \`grid-row: 2 / 4\` — starts at row line 2, ends at line 4 (spans 2 rows)
• \`span\` keyword: \`grid-column: span 2\` — spans 2 columns from current position
• \`grid-area\` — shorthand for row-start / column-start / row-end / column-end

**Implicit vs Explicit Grid**

The explicit grid is defined by grid-template-columns and grid-template-rows. When items fall outside the explicit grid, they are placed in the **implicit grid** — tracks created automatically by the browser.

• \`grid-auto-rows\` — size of implicitly created rows
• \`grid-auto-columns\` — size of implicitly created columns
• \`grid-auto-flow\` — controls how auto-placed items fill the grid: row (default), column, or dense (fills gaps by allowing items to appear out of order)

**Aligning Grid Items**

Works like Flexbox but for both axes independently:
• \`justify-items\` / \`align-items\` — aligns all items within their cells
• \`justify-content\` / \`align-content\` — distributes the grid within the container
• \`justify-self\` / \`align-self\` — overrides alignment for a single item
• \`place-items\` — shorthand for align-items + justify-items
• \`place-content\` — shorthand for align-content + justify-content`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* Explicit placement with line numbers */
.featured {
  grid-column: 1 / 3;  /* cols 1–2 */
  grid-row: 1 / 3;     /* rows 1–2 */
}

/* Using span */
.wide { grid-column: span 2; }
.tall { grid-row: span 3; }

/* Implicit grid rows */
.auto-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(200px, auto);  /* rows auto-created at min 200px */
  gap: 16px;
}

/* Dense packing — fills visual gaps */
.masonry-like {
  grid-auto-flow: dense;
}

/* Centering content inside cells */
.grid-center {
  display: grid;
  place-items: center;  /* = align-items: center + justify-items: center */
}

/* Full-bleed item in a content grid */
.content-grid {
  display: grid;
  grid-template-columns:
    [full-start] minmax(1rem, 1fr)
    [content-start] min(60ch, 100%) [content-end]
    minmax(1rem, 1fr) [full-end];
}
.full-bleed { grid-column: full-start / full-end; }
.content    { grid-column: content-start / content-end; }`,
      },
    ],
  },

  // 8 ── Positioning ──────────────────────────────────────────────────────────
  "Positioning": {
    newOrder: 8,
    topics: ["position: static/relative/absolute/fixed/sticky", "Offset Properties", "Containing Block", "z-index & Stacking Contexts", "float & clear"],
    sections: [
      {
        type: "text",
        content: `**CSS Positioning**

The \`position\` property controls how an element is placed in the document. Values:

• **static** (default) — element follows normal document flow. Offset properties (top/right/bottom/left) have no effect. Not "positioned".
• **relative** — element stays in normal flow, but offset properties move it relative to its natural position. The space it occupied is preserved. Creates a new positioning context for absolutely positioned descendants.
• **absolute** — element is removed from normal flow (takes up no space). Positioned relative to its nearest **positioned ancestor** (any ancestor with position other than static). If no positioned ancestor exists, it is positioned relative to the initial containing block (the viewport).
• **fixed** — removed from normal flow. Always positioned relative to the viewport. Does not scroll with the page. Used for sticky headers, sidebars, and modals.
• **sticky** — a hybrid: acts like relative until the element hits a scroll threshold, then acts like fixed. Must have at least one offset property set (usually top). Stays within its parent element.

**Offset Properties**

top, right, bottom, left specify how far to offset the element from the reference point. Positive values push inward; negative values pull outward. For absolute/fixed, these are distances from the edge of the containing block.`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* Relative positioning */
.badge {
  position: relative;
  top: -2px;   /* nudges up 2px, preserving original space */
}

/* Absolute positioning — inside a relative parent */
.card { position: relative; }
.card .notification-dot {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: red;
}

/* Stretching an absolute element to fill its container */
.overlay {
  position: absolute;
  inset: 0;  /* shorthand for top: 0; right: 0; bottom: 0; left: 0 */
  background: rgba(0, 0, 0, 0.6);
}

/* Fixed navbar */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  z-index: 1000;
}
body { padding-top: 64px; } /* offset body so content isn't hidden */

/* Sticky sidebar */
.sidebar {
  position: sticky;
  top: 80px;  /* sticks 80px from top of viewport */
  max-height: calc(100vh - 80px);
  overflow-y: auto;
}`,
      },
      {
        type: "text",
        content: `**z-index and Stacking Contexts**

z-index controls the visual stacking order of positioned elements (those with position other than static). Higher values appear in front of lower values. Default z-index is auto (treated as 0 for stacking purposes).

**Stacking context** — a self-contained stacking environment. Elements inside a stacking context are stacked among themselves; their z-index values only have meaning within that context. A new stacking context is created by:
• position: relative/absolute/fixed/sticky with a z-index other than auto
• opacity less than 1
• transform, filter, clip-path, perspective with a non-none value
• isolation: isolate
• will-change with certain values
• position: fixed or sticky (always, even without z-index)

Understanding stacking contexts explains why a z-index: 9999 sometimes has no effect — it may be inside a stacking context whose parent has a lower z-index.

**float and clear**

Float was the original CSS layout technique. Today it is mainly used for text wrapping around images. Setting \`float: left\` or \`float: right\` removes the element from normal flow and positions it to the side, allowing text to wrap around it.

\`clear: both\` forces an element below any preceding floated elements. \`overflow: hidden\` or modern clearfix techniques contain floats within their parent.

Do not use float for page layout — use Flexbox or Grid instead.`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* z-index: only works on positioned elements */
.modal-backdrop { position: fixed; z-index: 100; }
.modal          { position: fixed; z-index: 101; }
.tooltip        { position: absolute; z-index: 200; }

/* isolation: isolate — creates stacking context without z-index */
.card {
  isolation: isolate; /* z-index of children are scoped here */
}

/* float for text wrap */
.article-image {
  float: left;
  margin: 0 1.5rem 1rem 0;
  width: 250px;
}

/* Clear floats — modern: use overflow */
.float-container { overflow: hidden; }

/* Clearfix — classic technique (still useful) */
.clearfix::after {
  content: "";
  display: table;
  clear: both;
}

/* Containing block for absolute positioning */
.parent {
  position: relative; /* children with position: absolute will reference this */
}
.child {
  position: absolute;
  bottom: 0;
  right: 0;
}`,
      },
    ],
  },

  // 9 ── Responsive Design ────────────────────────────────────────────────────
  "Responsive Design": {
    newOrder: 9,
    topics: ["Viewport Meta Tag", "Media Queries", "Mobile-first", "Responsive Units", "clamp()", "Responsive Images", "Container Queries"],
    sections: [
      {
        type: "text",
        content: `**Responsive Design**

Responsive web design means building pages that adapt to any screen size — from a 320px mobile phone to a 4K desktop monitor. The goal is one codebase, many viewports.

**The Viewport Meta Tag**

Without this, mobile browsers render the page at a fixed ~980px desktop width and scale it down, making everything tiny. This tag must be in <head> of every responsive page:

\`<meta name="viewport" content="width=device-width, initial-scale=1.0">\`

**Media Queries**

Media queries apply CSS rules only when specified conditions are true. The most common condition is viewport width:

• \`min-width\` — "at least this wide" (used in mobile-first)
• \`max-width\` — "at most this wide" (used in desktop-first)

**Mobile-first vs Desktop-first**

• **Mobile-first**: write base styles for small screens. Add complexity with \`min-width\` queries as the screen gets larger. **Recommended** — smaller screens get the minimal, fast styles; larger screens get enhancements.
• **Desktop-first**: write base styles for large screens. Use \`max-width\` to simplify for small screens. Often results in more overrides and heavier mobile pages.

**Common Breakpoints** (not rules — adjust to your content):
• 480px — small phones
• 640px — large phones
• 768px — tablets
• 1024px — small laptops
• 1280px — desktops
• 1536px — large screens`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* Mobile-first media queries */
.card {
  width: 100%;       /* mobile: full width */
  padding: 1rem;
}

@media (min-width: 640px) {
  .card { width: 50%; }   /* tablet: 2 columns */
}

@media (min-width: 1024px) {
  .card { width: 33.33%; } /* desktop: 3 columns */
}

/* Media query conditions */
@media (prefers-color-scheme: dark) { /* user OS dark mode */ }
@media (prefers-reduced-motion: reduce) { /* user prefers less motion */ }
@media (orientation: landscape) { /* device is landscape */ }
@media print { /* print styles */ }

/* Combining conditions */
@media (min-width: 768px) and (max-width: 1023px) {
  /* tablet-only styles */
}

/* Range syntax (modern CSS) */
@media (768px <= width < 1024px) {
  /* tablet only */
}`,
      },
      {
        type: "text",
        content: `**Responsive Units**

Using flexible units instead of fixed pixels is the foundation of responsive design:

• \`%\` — relative to the parent's size. 100% = full parent width.
• \`vw\` / \`vh\` — 1vw = 1% of viewport width; 1vh = 1% of viewport height
• \`vmin\` / \`vmax\` — 1% of the smaller / larger viewport dimension
• \`em\` — relative to the element's own font-size. For non-font properties, this means padding and margin scale with text size.
• \`rem\` — relative to the root (<html>) font-size. More predictable than em because it doesn't compound.

**CSS clamp() for Fluid Sizing**

\`clamp(min, preferred, max)\` constrains a value between a minimum and maximum, with a fluid preferred value between them. Perfect for fluid typography and spacing that grows smoothly with the viewport:

\`font-size: clamp(1rem, 2vw + 0.5rem, 2rem)\`
— minimum 16px, fluid scaling with viewport, maximum 32px.

**Responsive Images**

• \`max-width: 100%\` — prevents images from overflowing their container
• \`object-fit\` — controls how the image fills its box: cover (crop), contain (letterbox), fill (stretch, default)
• \`object-position\` — controls the crop alignment for object-fit: cover

**Container Queries**

Container queries allow elements to respond to their container's size rather than the viewport's size. This enables truly component-level responsiveness — a card component can have its own breakpoints regardless of where it is placed on the page.`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* Responsive units */
.hero {
  height: 100vh;
  padding: 5vw;
}

.sidebar {
  width: clamp(200px, 25vw, 320px); /* fluid but bounded */
}

/* Fluid typography — scales from 16px to 24px */
body {
  font-size: clamp(1rem, 0.5rem + 1vw, 1.5rem);
}

/* Fluid heading */
h1 {
  font-size: clamp(1.75rem, 3vw + 1rem, 3.5rem);
}

/* Responsive images */
img {
  max-width: 100%;
  height: auto;
  display: block;
}

.hero-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  object-position: center top;
}

/* Container queries */
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card-body {
    display: flex;
    gap: 1rem;
  }
}

/* Responsive gap using clamp */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: clamp(1rem, 3vw, 2rem);
}`,
      },
    ],
  },
};

// ─── New chapters ──────────────────────────────────────────────────────────────

const newChapters: Array<{
  title: string;
  topics: string[];
  order: number;
  sections: Block[];
}> = [
  // 5 ── Backgrounds & Borders ────────────────────────────────────────────────
  {
    title: "Backgrounds & Borders",
    topics: ["background properties", "background-size & attachment", "Multiple Backgrounds", "Gradients", "border & border-radius", "box-shadow", "outline"],
    order: 5,
    sections: [
      {
        type: "text",
        content: `**Background Properties**

• \`background-color\` — solid background colour. Appears behind background-image.
• \`background-image\` — one or more images or gradients. Value: \`url('/img.jpg')\` or a gradient function.
• \`background-repeat\` — how the image tiles: \`repeat\` (both), \`repeat-x\`, \`repeat-y\`, \`no-repeat\`, \`space\`, \`round\`.
• \`background-position\` — where the image starts. Keywords: \`top left\`, \`center\`, \`bottom right\`. Or percentages/lengths: \`50% 50%\`, \`20px 40px\`.
• \`background-size\` — controls image size:
  - \`cover\` — scales the image to cover the entire element (cropping if needed). The image is never stretched.
  - \`contain\` — scales to fit inside the element without cropping. May leave empty space.
  - Custom: \`400px 200px\` or \`100% auto\`
• \`background-attachment\`:
  - \`scroll\` (default) — background scrolls with the element
  - \`fixed\` — background is fixed relative to the viewport (parallax effect)
  - \`local\` — background scrolls with the element's own scroll container

**Multiple Backgrounds**

Multiple background layers are separated by commas. The first value in the list is on top, the last is at the bottom. Only the last layer can have a background-color.`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* Background basics */
.hero {
  background-color: #1a1a2e;
  background-image: url('/images/texture.png');
  background-repeat: no-repeat;
  background-position: center top;
  background-size: cover;
}

/* Shorthand: color image repeat position / size attachment */
.hero {
  background: #1a1a2e url('/images/texture.png') no-repeat center top / cover fixed;
}

/* Multiple backgrounds (first is on top) */
.layered {
  background:
    url('/images/dots.png') repeat,                    /* top layer */
    linear-gradient(180deg, #1a1a2e, #0d0b20) no-repeat center / cover; /* bottom */
}

/* Gradients */
.gradient-linear {
  background: linear-gradient(135deg, #7a4af0, #1a1a2e);
}

.gradient-radial {
  background: radial-gradient(circle at 30% 50%, #7a4af0, #1a1a2e 70%);
}

.gradient-conic {
  background: conic-gradient(from 0deg, #f0c040, #7a4af0, #f0c040);
}

/* Repeating gradients */
.striped {
  background: repeating-linear-gradient(
    45deg,
    transparent 0px,
    transparent 10px,
    rgba(255,255,255,0.05) 10px,
    rgba(255,255,255,0.05) 20px
  );
}`,
      },
      {
        type: "text",
        content: `**Border Properties**

The border shorthand: \`border: width style color\`

• \`border-width\` — pixel value or keyword (thin, medium, thick)
• \`border-style\` — solid, dashed, dotted, double, groove, ridge, inset, outset, none, hidden
• \`border-color\` — any colour value; use transparent for invisible border that still reserves space

Individual sides: \`border-top\`, \`border-right\`, \`border-bottom\`, \`border-left\`

**border-radius**

Creates rounded corners. A single value applies to all corners; four values apply to top-left, top-right, bottom-right, bottom-left (clockwise). \`50%\` on a square element creates a perfect circle.

**box-shadow**

\`box-shadow: offset-x offset-y blur-radius spread-radius color\`
• Positive offset-x → shadow to the right; positive offset-y → shadow below
• blur-radius — how blurry the shadow is (0 = sharp)
• spread-radius — how much the shadow expands (positive) or contracts (negative)
• \`inset\` keyword — makes it an inner shadow
• Multiple shadows: comma-separated

**outline vs border**

Outline looks similar to border but has key differences:
• Outline does not take up space in the layout (does not affect box model)
• Outline cannot be rounded individually per corner (outline-radius is not standard)
• Outline is commonly used for focus indicators — remove it only if you provide an equally visible custom focus style
• \`outline-offset\` — controls the gap between the element and its outline`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* Border */
.card {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 3px solid #7a4af0;
}

/* border-radius */
.pill     { border-radius: 999px; }
.circle   { border-radius: 50%; }
.rounded  { border-radius: 8px; }
.custom   { border-radius: 16px 4px 16px 4px; }

/* Elliptical corners: horizontal/vertical radius */
.egg { border-radius: 50% / 30%; }

/* box-shadow */
.elevated {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.glow-purple {
  box-shadow:
    0 0 0 1px rgba(122, 74, 240, 0.3),
    0 0 20px rgba(122, 74, 240, 0.2),
    0 4px 16px rgba(0, 0, 0, 0.5);
}

.inset-shadow {
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4);
}

/* outline — for focus states */
:focus-visible {
  outline: 2px solid #7a4af0;
  outline-offset: 3px;
}

/* Remove default outline only when providing a custom one */
button:focus {
  outline: none;
}
button:focus-visible {
  outline: 2px solid #f0c040;
  outline-offset: 2px;
}`,
      },
    ],
  },

  // 10 ── Transitions & Animations ────────────────────────────────────────────
  {
    title: "Transitions & Animations",
    topics: ["transition shorthand", "Timing Functions", "Animatable Properties", "@keyframes", "animation shorthand", "fill-mode", "will-change", "prefers-reduced-motion"],
    order: 10,
    sections: [
      {
        type: "text",
        content: `**CSS Transitions**

Transitions smoothly animate the change between two CSS states (e.g., normal and :hover). They require a start state, an end state, and the transition property to define how the change occurs.

The \`transition\` shorthand: \`transition: property duration timing-function delay\`

• **property** — which CSS property to animate. Use \`all\` to animate everything (not recommended — it animates properties you may not intend, and is less performant than specifying exact properties).
• **duration** — how long the transition takes: \`0.3s\`, \`300ms\`
• **timing-function** — the acceleration curve:
  - \`ease\` (default) — slow start, fast middle, slow end
  - \`linear\` — constant speed
  - \`ease-in\` — starts slow, ends fast
  - \`ease-out\` — starts fast, ends slow (most natural for UI elements appearing)
  - \`ease-in-out\` — slow at both ends
  - \`cubic-bezier(x1, y1, x2, y2)\` — custom curve
  - \`steps(n)\` — discrete steps (useful for sprite animations)
• **delay** — how long to wait before starting: \`0.1s\`

Multiple transitions are comma-separated.

**Animatable Properties**

Only properties with a clear numeric midpoint can be transitioned: color, background-color, opacity, width, height, transform, box-shadow, border-radius, margin, padding, font-size, etc.

Properties that cannot be animated: display, visibility (can be transitioned but not interpolated), position type.`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* Basic transition */
.btn {
  background-color: #7a4af0;
  transition: background-color 0.2s ease, transform 0.15s ease;
}
.btn:hover {
  background-color: #5e35c7;
  transform: translateY(-2px);
}

/* Multiple transitions */
.card {
  transition:
    box-shadow 0.3s ease,
    transform 0.3s ease;
}
.card:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  transform: translateY(-4px);
}

/* Timing functions */
.fast-in  { transition-timing-function: ease-in; }
.fast-out { transition-timing-function: ease-out; }
.bounce   { transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); }

/* Transition with delay */
.menu-item {
  opacity: 0;
  transition: opacity 0.2s ease 0.1s; /* 0.1s delay */
}
.menu:hover .menu-item {
  opacity: 1;
}

/* Staggered transitions using nth-child */
.menu-item:nth-child(1) { transition-delay: 0ms; }
.menu-item:nth-child(2) { transition-delay: 50ms; }
.menu-item:nth-child(3) { transition-delay: 100ms; }
.menu-item:nth-child(4) { transition-delay: 150ms; }`,
      },
      {
        type: "text",
        content: `**CSS Animations with @keyframes**

While transitions animate between two states, \`@keyframes\` animations can define multiple states and run independently (no user interaction required).

Define an animation with \`@keyframes\`, then apply it with the \`animation\` property:

**animation shorthand**: \`animation: name duration timing-function delay iteration-count direction fill-mode play-state\`

• **name** — the @keyframes name
• **iteration-count** — how many times to run: a number, or \`infinite\`
• **direction** — \`normal\`, \`reverse\`, \`alternate\` (bounces back and forth), \`alternate-reverse\`
• **fill-mode** — what styles apply before/after the animation:
  - \`none\` — no styles applied outside the animation duration
  - \`forwards\` — element retains the last keyframe's styles after ending
  - \`backwards\` — element applies the first keyframe's styles during delay
  - \`both\` — combines forwards and backwards
• **play-state** — \`running\` or \`paused\` (toggle with JavaScript)

**will-change**

\`will-change: transform\` tells the browser to promote the element to its own GPU layer before the animation starts, enabling smoother animations. Use sparingly — too many promoted layers consume memory.

**prefers-reduced-motion**

Always respect users who prefer reduced motion (people with vestibular disorders, epilepsy, or simply distraction sensitivity). Wrap animations in a media query and remove or reduce them for these users.`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* @keyframes definition */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.05); }
}

@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

/* Applying animations */
.fade-in {
  animation: fadeInUp 0.4s ease-out forwards;
}

.spinner {
  animation: spin 1s linear infinite;
}

.badge {
  animation: pulse 2s ease-in-out infinite;
}

/* Skeleton loading shimmer */
.skeleton {
  background: linear-gradient(90deg, #2a2a3e 25%, #3a3a5e 50%, #2a2a3e 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* animation-fill-mode */
.slide-in {
  animation: fadeInUp 0.5s ease-out 0.3s both;
  /* 'both': applies from-state during delay, to-state after end */
}

/* Pause animation via JavaScript class */
.paused { animation-play-state: paused; }

/* GPU acceleration hint */
.animated-element {
  will-change: transform, opacity;
}

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`,
      },
    ],
  },

  // 11 ── Transforms ────────────────────────────────────────────────────────────
  {
    title: "Transforms",
    topics: ["2D transform functions", "transform-origin", "Multiple Transforms", "3D Transforms", "perspective", "backface-visibility", "transform-style"],
    order: 11,
    sections: [
      {
        type: "text",
        content: `**CSS Transforms**

The \`transform\` property applies geometric transformations to elements — moving, rotating, scaling, or skewing them — without affecting the document flow. Other elements behave as if the transformed element is still in its original position.

Transforms are composited separately from the layout, which is why they are the most performant way to animate position and size changes. Moving an element with \`transform: translateX()\` is faster than changing \`left\` or \`margin\`, because it can run on the GPU without triggering a layout recalculation.

**2D Transform Functions**

• \`translate(x, y)\` — moves the element. Can use \`translateX()\` and \`translateY()\` individually. Values can be lengths or percentages (% is relative to the element's own size).
• \`rotate(angle)\` — rotates clockwise. Positive values rotate clockwise; negative counter-clockwise. Units: deg, rad, turn.
• \`scale(x, y)\` — scales the element. A value of 2 doubles the size; 0.5 halves it. \`scaleX()\` and \`scaleY()\` for individual axes.
• \`skew(x-angle, y-angle)\` — skews along the X and Y axes. Values in deg.

**Multiple Transforms**

Multiple transform functions are space-separated in a single \`transform\` declaration. They are applied right to left (last function first):

\`transform: translateX(100px) rotate(45deg) scale(1.2)\`

The order matters — \`translate then rotate\` produces a different result than \`rotate then translate\`.

**transform-origin**

Sets the anchor point for the transformation. Default is \`50% 50%\` (centre of the element). Can be set with keywords (top, right, bottom, left, centre) or length/percentage values.`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* 2D transforms */
.move    { transform: translate(50px, 20px); }
.move-x  { transform: translateX(100%); }  /* 100% of element width */
.rotate  { transform: rotate(45deg); }
.scale   { transform: scale(1.5); }
.scale-x { transform: scaleX(0.5); }
.skew    { transform: skew(10deg, 5deg); }

/* Multiple transforms (applied right-to-left) */
.complex {
  transform: translateY(-10px) scale(1.05) rotate(-2deg);
}

/* transform-origin */
.flip-card {
  transform-origin: left center;  /* rotates from left edge */
  transform: rotateY(90deg);
}

.corner-badge {
  transform-origin: top right;
  transform: rotate(45deg) translateX(30%);
}

/* Hover effects using transform */
.btn {
  transition: transform 0.2s ease;
}
.btn:hover { transform: translateY(-3px); }
.btn:active { transform: translateY(0); }

.card:hover { transform: scale(1.02); }

/* Centering trick with translate */
.centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}`,
      },
      {
        type: "text",
        content: `**3D Transforms**

CSS can transform elements in three-dimensional space. 3D transforms require a perspective context to appear correctly.

**3D transform functions:**
• \`rotateX(angle)\` — rotates around the X axis (horizontal axis; top-to-bottom rotation)
• \`rotateY(angle)\` — rotates around the Y axis (vertical axis; left-to-right rotation)
• \`rotateZ(angle)\` — rotates around the Z axis (same as 2D rotate())
• \`rotate3d(x, y, z, angle)\` — rotates around an arbitrary 3D axis
• \`translateZ(z)\` / \`translate3d(x, y, z)\` — moves along the Z axis (towards/away from viewer)
• \`scaleZ(z)\` / \`scale3d(x, y, z)\`
• \`perspective(distance)\` — sets perspective for a single element

**perspective**

Perspective controls the apparent depth of 3D transforms. A smaller value creates a more exaggerated perspective. It can be set on the container with the \`perspective\` property, or on individual elements with \`transform: perspective()\`.

\`perspective-origin\` controls the viewer's eye position (default \`50% 50%\`, i.e. centre).

**transform-style: preserve-3d**

By default (\`flat\`), child elements are flattened into the parent's plane. \`transform-style: preserve-3d\` allows children to participate in the parent's 3D space — essential for flip card effects.

**backface-visibility**

Controls whether the back face of an element is visible when it is rotated past 90 degrees. Set to \`hidden\` to hide the back of a card in a flip animation.`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* 3D card flip effect */
.card-scene {
  perspective: 800px;         /* sets 3D perspective for children */
  width: 300px;
  height: 200px;
}

.card-3d {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;  /* children exist in 3D space */
  transition: transform 0.6s ease;
}

.card-scene:hover .card-3d {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;   /* hide when facing away */
  border-radius: 12px;
}

.card-front {
  background: #1a1a2e;
}

.card-back {
  background: #7a4af0;
  transform: rotateY(180deg);   /* starts flipped, shows when card is flipped */
}

/* perspective-origin — changes the viewer's position */
.stage {
  perspective: 600px;
  perspective-origin: 30% 60%;
}

/* Layered depth effect */
.layer-1 { transform: translateZ(10px); }
.layer-2 { transform: translateZ(20px); }
.layer-3 { transform: translateZ(40px); }`,
      },
    ],
  },

  // 12 ── Custom Properties ────────────────────────────────────────────────────
  {
    title: "Custom Properties",
    topics: ["--custom-property syntax", "var()", "Scope & Inheritance", "Component-level Overrides", "Dark Mode Theming", "calc() integration", "Limitations"],
    order: 12,
    sections: [
      {
        type: "text",
        content: `**CSS Custom Properties (Variables)**

CSS custom properties (also called CSS variables) store reusable values in the cascade. They enable theming, dynamic changes via JavaScript, and DRY (Don't Repeat Yourself) stylesheets without a preprocessor.

**Declaration**

Custom properties are defined with a double-dash prefix: \`--property-name: value\`

They are typically declared on the \`:root\` pseudo-class (equivalent to the <html> element) to make them available everywhere. The value can be any valid CSS value — a colour, number, length, string, or even a partial value.

**Referencing with var()**

\`var(--property-name, fallback)\` — reads the value of a custom property. The optional second argument is the fallback, used if the custom property is not defined or is invalid. Fallbacks can themselves be var() references.

**Scope and Inheritance**

Custom properties follow the cascade and inherit through the DOM like regular CSS properties. A custom property declared on a parent element is available to all its descendants. Declaring the same property on a child overrides the inherited value only within that child's subtree.

This inheritance model enables component-level theming: define defaults at :root, override them on a specific component.`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* Define custom properties at :root (global scope) */
:root {
  --color-primary:    #7a4af0;
  --color-accent:     #f0c040;
  --color-bg:         #1a1a2e;
  --color-surface:    #0d0b20;
  --color-text:       #e0e0e0;
  --color-text-muted: #9090b0;

  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --spacing-xl: 4rem;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;

  --font-body: 'Inter', Arial, sans-serif;
  --font-mono: 'Fira Code', Consolas, monospace;

  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
}

/* Reference with var() */
body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
}

.btn-primary {
  background-color: var(--color-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: opacity var(--transition-fast);
}

/* var() with fallback */
.component {
  color: var(--component-color, var(--color-text));
}`,
      },
      {
        type: "text",
        content: `**Component-level Overrides**

Because custom properties inherit, you can override a variable for an entire subtree of the DOM without changing global styles. This is the primary mechanism for building themeable component systems.

**Dynamic Theming — Dark Mode**

Custom properties are the ideal tool for dark mode. Define light mode values at :root, then override them inside a media query or a class. Only the variable values change — all the rules using those variables automatically update.

**Using Custom Properties in calc()**

\`calc()\` can use custom properties as operands, enabling dynamic size calculations:
\`padding: calc(var(--spacing-base) * 2)\`

Note: if a custom property is used in calc(), it must resolve to a number with appropriate units. \`calc(var(--size) + 10px)\` only works if --size is a length.

**Limitations vs Preprocessor Variables**

CSS custom properties differ from Sass/Less variables in important ways:
• CSS variables are live in the browser; Sass variables are compile-time only
• CSS variables inherit through the DOM; Sass variables do not
• CSS variables can be read and modified with JavaScript; Sass variables cannot
• CSS variables cannot be used in media query conditions: \`@media (min-width: var(--breakpoint))\` is not valid
• CSS variables in property names are not possible: \`var(--prop): value\` is invalid`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* Component-level override */
.card {
  --card-bg: var(--color-surface);
  --card-border: rgba(255, 255, 255, 0.08);
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
}

.card.card-featured {
  --card-bg: var(--color-primary);    /* override only within this card */
  --card-border: transparent;
}

/* Dark mode with prefers-color-scheme */
:root {
  --color-bg:   #ffffff;
  --color-text: #1a1a1a;
}
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg:   #1a1a2e;
    --color-text: #e0e0e0;
  }
}

/* Class-based dark mode (toggle with JavaScript) */
:root { --color-bg: #fff; }
[data-theme="dark"] { --color-bg: #1a1a2e; }

/* Custom properties in calc() */
:root { --spacing: 1rem; }
.container {
  padding: calc(var(--spacing) * 2);            /* 2rem */
  max-width: calc(65ch + var(--spacing) * 4);   /* content width + side padding */
}

/* Dynamic with JavaScript */
/* document.documentElement.style.setProperty('--color-primary', '#ff0000'); */

/* Reading via JS */
/* getComputedStyle(el).getPropertyValue('--color-primary').trim(); */`,
      },
    ],
  },

  // 13 ── CSS Functions ────────────────────────────────────────────────────────
  {
    title: "CSS Functions",
    topics: ["calc()", "clamp()", "min() & max()", "var()", "env()", "counter() & counters()", "attr()"],
    order: 13,
    sections: [
      {
        type: "text",
        content: `**CSS Functions Overview**

CSS has a growing library of built-in functions that compute values at render time. Unlike preprocessor functions, CSS functions are evaluated by the browser dynamically and can use real viewport and container measurements.

**calc() — Arithmetic with Mixed Units**

\`calc()\` performs arithmetic with mixed units, which is impossible with plain CSS values:
\`width: calc(100% - 2rem)\` — combines percentage and rem

Supported operators: \`+\`, \`-\`, \`*\`, \`/\`. Spaces are required around \`+\` and \`-\` operators. Nested \`calc()\` is valid. Custom properties work inside calc().

**min() and max()**

\`min(value1, value2, ...)\` — evaluates to the smallest of the provided values
\`max(value1, value2, ...)\` — evaluates to the largest

These are like \`min-width\` / \`max-width\` but can be used as values for any property:
\`width: min(100%, 600px)\` — takes up 100% of the parent but never more than 600px
\`font-size: max(1rem, 2vw)\` — at least 1rem, grows with viewport

**clamp(min, preferred, max)**

\`clamp()\` constrains a value between a minimum and maximum. It is equivalent to \`max(min, min(preferred, max))\` but more readable. Ideal for fluid typography and spacing.

The preferred value is usually a viewport-relative unit so it scales with the screen.`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* calc() — mixed units */
.sidebar {
  width: calc(100% - 320px);        /* percentage minus fixed width */
  padding: calc(1rem + 2vw);        /* rem plus viewport-relative */
  height: calc(100vh - 64px);       /* full viewport minus header height */
}

/* Nested calc (valid) */
.element {
  margin: calc(calc(100% - 40px) / 2);
}

/* min() and max() */
.container {
  width: min(100%, 1200px);         /* responsive but capped at 1200px */
}

.readable {
  width: min(65ch, 100%);           /* ideal reading width, never overflow */
}

.cta-text {
  font-size: max(1.5rem, 3vw);      /* at least 24px, grows with viewport */
}

/* clamp(min, preferred, max) */
.fluid-heading {
  font-size: clamp(1.5rem, 3vw + 1rem, 3rem);
}

.fluid-container {
  padding: clamp(1rem, 5%, 4rem);
}

.fluid-grid {
  gap: clamp(1rem, 3vw, 2rem);
  grid-template-columns: repeat(auto-fit, minmax(clamp(200px, 30%, 400px), 1fr));
}`,
      },
      {
        type: "text",
        content: `**env() — Environment Variables**

\`env()\` accesses environment variables provided by the browser or device. The most common use case is safe area insets on iOS devices with notches and home indicators.

\`safe-area-inset-top\`, \`safe-area-inset-right\`, \`safe-area-inset-bottom\`, \`safe-area-inset-left\` — the insets around the notch and home indicator on iPhone X and later.

Requires \`viewport-fit=cover\` in the viewport meta tag to actually extend into safe areas.

**counter() and counters() — CSS-Driven Numbering**

CSS can maintain and display counters without JavaScript or HTML ordered lists:
• \`counter-reset: name\` — initialises a counter on an element
• \`counter-increment: name\` — increments the counter on each matching element
• \`counter(name)\` — inserts the counter value (used in the content property)
• \`counters(name, separator)\` — for nested counters

**attr() — Reading HTML Attribute Values**

\`attr(attribute-name)\` reads the value of an HTML attribute and inserts it as content in a pseudo-element. Currently only works reliably in the \`content\` property. A future CSS specification would allow it in any property.`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* env() — safe area insets */
/* In HTML: <meta name="viewport" content="..., viewport-fit=cover"> */
.navbar {
  padding-top: env(safe-area-inset-top);
  padding-left: env(safe-area-inset-left, 0px);  /* 0px fallback */
}
.bottom-bar {
  padding-bottom: env(safe-area-inset-bottom, 16px);
}

/* counter() — auto-numbering */
.chapter-list {
  counter-reset: chapter;
}
.chapter-list li {
  counter-increment: chapter;
}
.chapter-list li::before {
  content: "Chapter " counter(chapter) " — ";
  font-weight: bold;
  color: var(--color-accent);
}

/* Nested counters for an outline */
ol {
  counter-reset: section;
  list-style: none;
}
li {
  counter-increment: section;
}
li::before {
  content: counters(section, ".") ". ";
}

/* attr() — reading HTML attributes */
[data-tooltip]::after {
  content: attr(data-tooltip);  /* reads data-tooltip="Click me" from HTML */
  position: absolute;
  /* ... tooltip styles ... */
}

a[href]::after {
  content: " (" attr(href) ")";  /* show URL in print styles */
}`,
      },
    ],
  },

  // 14 ── Filters & Blend Modes ────────────────────────────────────────────────
  {
    title: "Filters & Blend Modes",
    topics: ["filter property", "backdrop-filter", "mix-blend-mode", "background-blend-mode", "Performance"],
    order: 14,
    sections: [
      {
        type: "text",
        content: `**CSS Filters**

The \`filter\` property applies graphical effects to an element and all its descendants. It works like Photoshop filters — applied to the rendered result of the element.

Available filter functions:
• \`blur(radius)\` — Gaussian blur. Value in px. \`blur(4px)\`
• \`brightness(amount)\` — 0 = black, 1 = original, 2 = twice as bright
• \`contrast(amount)\` — 0 = grey, 1 = original, 2 = twice the contrast
• \`grayscale(amount)\` — 0 = original, 1 = fully greyscale
• \`saturate(amount)\` — 0 = greyscale, 1 = original, 2+ = oversaturated
• \`hue-rotate(angle)\` — rotates the hue by the given angle (0–360deg)
• \`invert(amount)\` — 0 = original, 1 = fully inverted colours
• \`sepia(amount)\` — 0 = original, 1 = fully sepia
• \`opacity(amount)\` — same as the opacity property but composited differently
• \`drop-shadow(offset-x offset-y blur-radius color)\` — like box-shadow but follows the element's actual shape (respects transparency). Different from box-shadow: it applies to the alpha channel.

Multiple filter functions are space-separated and applied in order.

**backdrop-filter**

\`backdrop-filter\` applies filter effects to the area **behind** the element (the content below it), not the element itself. This creates the frosted glass / glassmorphism effect. The element must have a non-opaque background (usually rgba or transparent) for the effect to show through.`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* filter functions */
img:hover { filter: brightness(1.1) saturate(1.2); }
.disabled  { filter: grayscale(1) opacity(0.5); }
.vintage   { filter: sepia(0.5) hue-rotate(-15deg) contrast(1.1); }
.blurred   { filter: blur(4px); }

/* drop-shadow — follows element shape */
.icon {
  filter: drop-shadow(2px 4px 8px rgba(0, 0, 0, 0.5));
}

/* Hover reveal effect */
.card-image {
  filter: grayscale(1) brightness(0.8);
  transition: filter 0.4s ease;
}
.card:hover .card-image {
  filter: grayscale(0) brightness(1);
}

/* backdrop-filter — frosted glass */
.glass-panel {
  background: rgba(13, 11, 32, 0.6);
  backdrop-filter: blur(12px) saturate(1.5);
  -webkit-backdrop-filter: blur(12px) saturate(1.5); /* Safari */
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Glass navbar */
.navbar {
  background: rgba(10, 10, 20, 0.7);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}`,
      },
      {
        type: "text",
        content: `**Blend Modes**

Blend modes control how an element's pixels combine with the pixels beneath it, producing different visual mixing effects — the same concept as Photoshop layer blend modes.

**mix-blend-mode**

Applies to the element and blends it with everything below it in the stacking context:

Common values:
• \`normal\` (default) — no blending
• \`multiply\` — dark areas become darker; white is transparent. Useful for overlaying dark images.
• \`screen\` — light areas become lighter; black is transparent. Opposite of multiply.
• \`overlay\` — combines multiply and screen. Dark areas darken, light areas lighten.
• \`darken\` / \`lighten\` — keeps the darker/lighter of the two pixels
• \`color-dodge\` / \`color-burn\` — lightens/darkens based on the blend layer
• \`hard-light\` / \`soft-light\` — similar to overlay with different contrast
• \`difference\` / \`exclusion\` — subtracts colours; creates psychedelic effects
• \`hue\` / \`saturation\` / \`color\` / \`luminosity\` — applies only one aspect of the blend colour

**background-blend-mode**

Blends the background layers of a single element (background-image + background-color, or multiple background images) with each other. Does not blend with elements behind the box.

**Performance Considerations**

Filters and blend modes trigger compositing. Every element with filter, backdrop-filter, or mix-blend-mode gets promoted to its own GPU layer. Too many of these can cause high memory usage and frame drops.

Avoid animating filter functions other than opacity — use transform and opacity for smooth 60fps animations. Use will-change: filter only when genuinely needed.`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* mix-blend-mode */
.text-on-image {
  color: white;
  mix-blend-mode: overlay;  /* blends text with image below */
}

/* Duotone effect: colour over greyscale image */
.duotone-container {
  position: relative;
  background-color: #7a4af0;
}
.duotone-container img {
  mix-blend-mode: luminosity;  /* image contributes only luminosity */
  filter: grayscale(1);
  opacity: 0.8;
}

/* Multiply blend — dark on dark makes lighter areas pop */
.overlay-badge {
  mix-blend-mode: multiply;
}

/* Screen blend — light graphic on dark bg */
.glow-overlay {
  mix-blend-mode: screen;
  opacity: 0.8;
}

/* background-blend-mode */
.texture-over-gradient {
  background:
    url('/textures/grain.png') repeat,
    linear-gradient(135deg, #7a4af0, #1a1a2e);
  background-blend-mode: overlay;
}

/* isolation: isolate — prevents elements from blending with background */
.no-bleed {
  isolation: isolate;
}`,
      },
    ],
  },

  // 15 ── CSS Architecture ──────────────────────────────────────────────────────
  {
    title: "CSS Architecture",
    topics: ["BEM Naming", "Utility-first CSS", "Avoiding Specificity Wars", "CSS Reset vs Normalize", "Organising Stylesheets", "!important", "CSS Modules", "Performance"],
    order: 15,
    sections: [
      {
        type: "text",
        content: `**CSS Architecture**

As a project grows, CSS can become hard to maintain — cascading side effects, specificity conflicts, and global namespace collisions are common problems. CSS architecture provides conventions and structures to keep styles manageable.

**BEM — Block Element Modifier**

BEM is a naming convention that creates a predictable, low-specificity class structure:

• **Block** — a standalone, reusable component: \`.card\`, \`.btn\`, \`.nav\`
• **Element** — a part of a block, inseparable from it: \`.card__title\`, \`.card__body\`, \`.btn__icon\`. Double underscore separator.
• **Modifier** — a variant or state of a block or element: \`.card--featured\`, \`.btn--primary\`, \`.btn--large\`. Double hyphen separator.

Benefits: all class selectors have the same specificity (0,1,0); no nesting required; class names self-document their relationship and context.

**Utility-first CSS**

The utility-first approach (popularised by Tailwind CSS) uses small, single-purpose classes directly in HTML:

\`<div class="flex items-center gap-4 p-6 rounded-lg bg-surface">\`

Benefits: no naming required; no context switching between files; CSS stops growing linearly with the project.

Drawback: HTML can become verbose; harder to read the semantic structure.

**Avoiding Specificity Wars**

The most common CSS maintenance problem is an escalating war of specificity — adding more specific selectors or !important to override earlier rules.

Prevention:
• Use class selectors for almost everything (specificity 0,1,0)
• Avoid ID selectors in CSS (specificity 0,1,0,0 — 100x a class)
• Avoid nesting more than two levels deep
• Avoid qualifying selectors unnecessarily: \`.card h2\` when \`.card__title\` would do
• Never use \`!important\` to fix cascade problems — fix the specificity instead`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* BEM naming */
/* Block */
.card { }

/* Elements */
.card__header { }
.card__body   { }
.card__footer { }
.card__title  { }
.card__image  { }

/* Modifiers */
.card--featured  { }
.card--compact   { }
.card--dark      { }
.card__btn--primary   { }
.card__btn--secondary { }

/* CORRECT: BEM class on HTML */
/* <article class="card card--featured">
     <img class="card__image" ... />
     <div class="card__body">
       <h2 class="card__title">...</h2>
     </div>
   </article> */

/* Selector specificity comparison */
p           { }   /* 0,0,1   — 1 type */
.text       { }   /* 0,1,0   — 1 class */
#header     { }   /* 1,0,0   — 1 ID */
div p       { }   /* 0,0,2   — 2 types */
.nav a      { }   /* 0,1,1   — 1 class + 1 type */
.nav .link  { }   /* 0,2,0   — 2 classes */
/* inline style         1,0,0,0 — beats all above */
/* !important           even beats inline styles */`,
      },
      {
        type: "text",
        content: `**CSS Reset vs Normalize.css**

Different browsers have different default styles. There are two approaches to handling this:

**CSS Reset** (Eric Meyer's reset, modern-normalize) — removes all browser defaults. Every element has zero margin, padding, and no font styling. You build everything from scratch. Consistent across browsers but requires more work.

**Normalize.css** — preserves useful browser defaults, corrects inconsistencies, and makes common elements render identically. Less aggressive than a full reset.

**Modern approach** — use a minimal opinionated reset that:
• Applies box-sizing: border-box globally
• Removes margin from headings and body
• Sets line-height on body
• Makes images/media responsive by default
• Respects user motion preferences by default

**Organising Stylesheets**

Common logical ordering (inside a single stylesheet):
1. Variables and :root (custom properties)
2. CSS Reset / Base
3. Typography (body, headings, paragraphs)
4. Layout (grid, flex containers)
5. Components (cards, buttons, forms)
6. Utilities (helper classes)
7. Overrides and media queries

**CSS Modules and Scoped Styles**

CSS Modules (used in React, Vue, Webpack) scope class names to the component file by transforming them into unique identifiers at build time. \`.card\` in Card.module.css becomes something like \`_card_x7k2j_1\` in the final CSS — no global name collisions.

Vue's \`<style scoped>\` adds a unique data attribute to all rules in the component, achieving similar scoping without name transformation.`,
      },
      {
        type: "code",
        lang: "css",
        code: `/* Modern CSS reset */
*, *::before, *::after { box-sizing: border-box; }

* {
  margin: 0;
  padding: 0;
}

html {
  color-scheme: dark light;
}

body {
  min-height: 100vh;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

input, button, textarea, select {
  font: inherit;
}

p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Logical stylesheet order example */
/* 1. Variables */
:root { --color-bg: #1a1a2e; }

/* 2. Base / Reset (above) */

/* 3. Typography */
body { font-family: var(--font-body); }
h1   { font-size: 2rem; }

/* 4. Layout */
.page { display: grid; grid-template-rows: auto 1fr auto; }

/* 5. Components */
.btn { }
.card { }

/* 6. Utilities */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

/* 7. Media queries (or at end of each component) */
@media (min-width: 1024px) { }`,
      },
    ],
  },
];

// ─── Run ───────────────────────────────────────────────────────────────────────

async function main() {
  const book = await prisma.book.findUnique({
    where: { slug: "css" },
    include: { chapters: { orderBy: { order: "asc" } } },
  });

  if (!book) {
    console.error("CSS book not found — check slug 'css'.");
    process.exit(1);
  }

  console.log(`\nUpdating "${book.title}" — ${book.chapters.length} existing chapters...\n`);

  // ── Update existing chapters ──────────────────────────────────────────────
  let updated = 0;
  for (const ch of book.chapters) {
    const data = existingChapters[ch.title];
    if (!data) {
      console.log(`  SKIP  "${ch.title}" — no update defined`);
      continue;
    }

    await prisma.bookChapter.update({
      where: { id: ch.id },
      data: {
        order:   data.newOrder,
        topics:  data.topics,
        sections: data.sections as object[],
        content: data.sections
          .filter((s) => s.type === "text")
          .map((s) => (s as { type: "text"; content: string }).content)
          .join("\n\n"),
        example: data.sections
          .filter((s) => s.type === "code")
          .map((s) => (s as { type: "code"; code: string }).code)
          .join("\n\n---\n\n") || undefined,
      } as object,
    });

    console.log(`  ✓  Updated "${ch.title}" (order → ${data.newOrder})`);
    updated++;
  }

  // ── Create missing chapters ────────────────────────────────────────────────
  const existingTitles = new Set(book.chapters.map((c) => c.title));
  let created = 0;

  for (const ch of newChapters) {
    if (existingTitles.has(ch.title)) {
      console.log(`  SKIP  "${ch.title}" — already exists`);
      continue;
    }

    await prisma.bookChapter.create({
      data: {
        bookId:  book.id,
        title:   ch.title,
        topics:  ch.topics,
        order:   ch.order,
        content: ch.sections
          .filter((s) => s.type === "text")
          .map((s) => (s as { type: "text"; content: string }).content)
          .join("\n\n"),
        example: ch.sections
          .filter((s) => s.type === "code")
          .map((s) => (s as { type: "code"; code: string }).code)
          .join("\n\n---\n\n") || undefined,
        sections: ch.sections as object[],
      } as object,
    });

    console.log(`  ✓  Created "${ch.title}" (order ${ch.order})`);
    created++;
  }

  console.log(`\nDone — ${updated} chapters updated, ${created} new chapters created.\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
