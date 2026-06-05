import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type Block = { type: "text"; content: string } | { type: "code"; lang?: string; code: string };

const htmlChapters: Record<string, { topics: string[]; sections: Block[] }> = {

  // ─── Chapter 1: What is HTML? ─────────────────────────────────────────────

  "What is HTML?": {
    topics: ["Documents", "The Browser", "Rendering", "HTML5", "HTML vs CSS vs JS"],
    sections: [
      {
        type: "text",
        content: `HTML (HyperText Markup Language) is the standard markup language used to create web pages. It defines the structure and semantic meaning of web content by annotating text with elements and tags that tell the browser what each piece of content represents.

HTML is not a programming language — it has no variables, conditions, or loops. It is a markup language: a system for labelling the role and structure of different parts of a document. A heading is a heading because it is wrapped in an <h1> to <h6> tag, not because it is styled differently.

Every web page you visit begins as an HTML document. The browser downloads that document, parses it, and builds a visual and interactive representation called the DOM (Document Object Model). Without HTML there is no structure — only unstyled text.`,
      },
      {
        type: "text",
        content: `**Brief History of HTML**

HTML was created by Tim Berners-Lee in 1991 at CERN, initially to share scientific documents. It has evolved through several major versions:

• **HTML 1.0** (1991) — minimal: headings, paragraphs, links, images
• **HTML 2.0** (1995) — first formal standard, added forms
• **HTML 4.01** (1999) — introduced CSS separation and accessibility features
• **XHTML 1.0** (2000) — stricter XML-based version of HTML 4
• **HTML5** (2014) — current standard, maintained by the WHATWG. Introduced semantic elements like <article>, <section>, <nav>, <aside>, native audio/video support, the <canvas> drawing element, local storage, improved form controls with native validation, and the Web Worker API.

HTML5 is a living standard — it continues to evolve without a version number. The WHATWG publishes updates continuously at html.spec.whatwg.org.`,
      },
      {
        type: "text",
        content: `**The Three Languages of the Web**

HTML, CSS, and JavaScript each have a distinct, separate responsibility:

• **HTML** — structure and meaning (what content is)
• **CSS** — presentation and layout (how content looks)
• **JavaScript** — behaviour and interactivity (how content responds)

These three responsibilities should be kept separate. Mixing them — using inline styles for layout, tables for visual alignment, or deprecated presentational elements like <font> — makes code harder to maintain, less accessible, and more brittle across browsers.

**How Browsers Render HTML**

When a browser receives an HTML document, it follows a rendering pipeline:
1. Parse HTML → build the DOM (Document Object Model)
2. Parse CSS → build the CSSOM (CSS Object Model)
3. Combine DOM + CSSOM → build the Render Tree
4. Calculate sizes and positions (Layout)
5. Draw pixels to the screen (Paint)

The DOM is a live, tree-shaped representation of the HTML. JavaScript can read and modify it in real time, which is how dynamic web pages work.`,
      },
      {
        type: "code",
        lang: "html",
        code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My First Page</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <h1>Hello, World</h1>
    <p>This is a paragraph of text on a web page.</p>
    <a href="/about">Learn more</a>
    <script src="app.js"></script>
  </body>
</html>`,
      },
      {
        type: "text",
        content: `The above is a minimal, valid HTML5 document. Key points:

• The DOCTYPE declaration goes on line 1 — it tells browsers to use modern (standards) rendering mode instead of "quirks mode"
• The <html lang="en"> attribute helps screen readers choose the correct voice and pronunciation
• <meta charset="UTF-8"> must be the first element in <head> — it prevents character encoding errors
• The <head> contains only metadata, never visible content
• All visible content goes inside <body>
• <script> tags typically go at the bottom of <body> so they don't block page rendering

Browsers are forgiving — they can render malformed HTML without crashing. However, writing valid HTML ensures consistent behaviour across all browsers, correct accessibility, and predictable CSS targeting. Use the W3C Markup Validator (validator.w3.org) to check your documents.`,
      },
    ],
  },

  // ─── Chapter 2: Elements & Tags ───────────────────────────────────────────

  "Elements & Tags": {
    topics: ["Opening & Closing Tags", "Void Elements", "Attributes", "Nesting Rules", "Block vs Inline", "Comments"],
    sections: [
      {
        type: "text",
        content: `**Anatomy of an HTML Element**

An HTML element is the basic unit of a web page. Most elements have three parts:
• An opening tag: <tagname>
• Content: text, other elements, or both
• A closing tag: </tagname>

The tag name tells the browser what kind of element it is. Tags are case-insensitive but lowercase is the universal convention.

**Attributes**

Attributes provide additional information about an element. They are written inside the opening tag as name-value pairs: name="value". Some rules:

• Attribute names are lowercase
• Values are quoted (double quotes preferred)
• Multiple attributes are space-separated
• **Boolean attributes** (like disabled, required, checked) need no value — their presence alone activates the feature

Universal attributes that work on every element:
• id — unique identifier on the page (used by CSS and JavaScript)
• class — one or more space-separated class names (used by CSS)
• style — inline CSS (avoid; use external CSS instead)
• lang — language of the element's text content
• title — tooltip text shown on hover
• hidden — hides the element (equivalent to display: none)
• tabindex — controls keyboard focus order`,
      },
      {
        type: "code",
        lang: "html",
        code: `<!-- Basic element structure -->
<p>This is a paragraph element.</p>
<h2>Section Title</h2>
<a href="https://example.com">Visit Example</a>

<!-- Multiple attributes -->
<img
  src="/images/hero.jpg"
  alt="A hero banner image"
  width="800"
  height="400"
  loading="lazy"
/>

<!-- Boolean attributes — presence = enabled -->
<input type="checkbox" checked />
<button type="submit" disabled>Cannot Click</button>
<input type="email" required placeholder="Enter email" />

<!-- id and class -->
<section id="hero" class="full-width dark-bg">
  <p class="lead-text highlight">Welcome</p>
</section>`,
      },
      {
        type: "text",
        content: `**Void Elements (Self-closing)**

Void elements have no content and no closing tag. They cannot contain child elements. In HTML5 the trailing slash is optional: <br> and <br /> are both valid.

Common void elements:
• <br>    — line break within text
• <hr>    — horizontal rule (thematic break between content)
• <img>   — image
• <input> — form control
• <meta>  — metadata
• <link>  — link to external resource (CSS, fonts, icons)
• <area>  — clickable area in an image map
• <base>  — base URL for all relative links in the document

**Nesting Rules**

Elements can contain other elements. The inner element must be fully closed before the outer element closes. Overlapping tags are invalid HTML:`,
      },
      {
        type: "code",
        lang: "html",
        code: `<!-- CORRECT: properly nested -->
<p>This is <strong>bold and <em>italic</em></strong> text.</p>

<!-- WRONG: overlapping tags -->
<p>This is <strong>bold and <em>italic</strong> text.</em></p>

<!-- Void elements — no closing tag needed -->
<p>Line one<br />Line two</p>
<hr />

<!-- Comments are hidden from the user -->
<!-- This is an HTML comment — the browser ignores it -->

<!-- Whitespace in HTML: multiple spaces collapse to one -->
<p>One      two     three</p>  <!-- renders as: "One two three" -->`,
      },
      {
        type: "text",
        content: `**Block-level vs Inline Elements**

Every HTML element has a default display type that controls how it behaves in the page flow:

**Block-level elements** — start on a new line and stretch to fill the full available width. They create a "block" in the layout. Examples: <div>, <p>, <h1>–<h6>, <ul>, <ol>, <li>, <section>, <article>, <header>, <footer>, <form>, <table>, <blockquote>

**Inline elements** — flow within the surrounding text. They only take up as much space as their content needs and do not start on a new line. Examples: <span>, <a>, <strong>, <em>, <img>, <input>, <label>, <code>, <abbr>, <time>

CSS can override these defaults. You can make any element behave as block, inline, or inline-block using the display property. This changes layout behaviour but does not change the element's semantic meaning.`,
      },
      {
        type: "code",
        lang: "html",
        code: `<!-- Block elements stack vertically -->
<div>First block</div>
<div>Second block</div>
<p>Third block — paragraph</p>

<!-- Inline elements flow within text -->
<p>
  You can <strong>bold text</strong>, add
  <a href="#">a link</a>, and use
  <code>inline code</code> inside a paragraph.
</p>

<!-- data-* attributes: custom data attached to elements -->
<button data-product-id="42" data-category="tools">
  Add to Cart
</button>

<script>
  const btn = document.querySelector("button");
  console.log(btn.dataset.productId);  // "42"
  console.log(btn.dataset.category);   // "tools"
</script>`,
      },
    ],
  },

  // ─── Chapter 3: Document Structure ────────────────────────────────────────

  "Document Structure": {
    topics: ["DOCTYPE", "html, head, body", "Meta Tags", "Viewport", "Title", "Link & Script"],
    sections: [
      {
        type: "text",
        content: `Every HTML document follows a required structure. Understanding this structure is fundamental to writing pages that render correctly and consistently across all browsers.

**DOCTYPE**

The DOCTYPE declaration is the first thing in every HTML document. It is not an element — it is an instruction that tells the browser which version of HTML is being used. The HTML5 DOCTYPE is simple and case-insensitive:

\`<!DOCTYPE html>\`

Without DOCTYPE, browsers may switch to "quirks mode" — a legacy rendering mode that applies non-standard rules for backward compatibility with very old sites. Always include DOCTYPE on line 1.

**The <html> Root Element**

The <html> element is the root of the document — every other element is a descendant of it. The lang attribute declares the primary language of the page content. This is used by:
• Screen readers to select the correct voice and pronunciation
• Search engines for language targeting and indexing
• Translation tools for automatic language detection

Use a valid BCP 47 language tag: "en" for English, "id" for Indonesian, "fr" for French, "en-US" for American English.`,
      },
      {
        type: "code",
        lang: "html",
        code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- All metadata goes here — nothing visible -->
  </head>
  <body>
    <!-- All visible content goes here -->
  </body>
</html>`,
      },
      {
        type: "text",
        content: `**Inside <head> — Metadata**

The <head> element contains information about the document. Nothing inside <head> is displayed on the page. Essential elements:

**<meta charset="UTF-8">**
Declares the character encoding. UTF-8 supports every character from every language, including emoji. Must be the very first element inside <head> to prevent character corruption (mojibake).

**<meta name="viewport" content="width=device-width, initial-scale=1.0">**
Controls how the browser scales the page on mobile devices. Without this, phones render the page at a fixed 980px desktop width and scale it down, making text and UI elements tiny and unreadable.

**<title>**
The text shown in the browser tab and in search engine result snippets. Required by the HTML spec. Should be descriptive and unique per page: "About Us — Company Name", not just "About". Optimal length for SEO: 50–60 characters.

**<link rel="stylesheet">**
Links an external CSS file. Multiple stylesheets are allowed. The rel="icon" variant sets the favicon.

**<script>**
Links a JavaScript file or contains inline script. Scripts are typically placed at the end of <body> to avoid blocking HTML parsing. Use defer to load the script asynchronously while maintaining execution order.`,
      },
      {
        type: "code",
        lang: "html",
        code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Page info for browsers and search engines -->
    <title>Devstiny — Learn Web Development</title>
    <meta name="description" content="An RPG-style web development learning platform." />

    <!-- External CSS -->
    <link rel="stylesheet" href="/styles/main.css" />

    <!-- Favicon -->
    <link rel="icon" href="/favicon.ico" type="image/x-icon" />

    <!-- Preconnect to font CDN for performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
  </head>
  <body>
    <h1>Welcome to Devstiny</h1>

    <!-- Scripts at the end of body, or use defer -->
    <script src="/app.js" defer></script>
  </body>
</html>`,
      },
      {
        type: "text",
        content: `**Open Graph Meta Tags**

Open Graph tags control how your page appears when shared on social media platforms (Facebook, Twitter, LinkedIn, Discord, etc.):

\`<meta property="og:title" content="Page Title">\`
\`<meta property="og:description" content="Page description">\`
\`<meta property="og:image" content="https://example.com/preview.png">\`
\`<meta property="og:url" content="https://example.com/page">\`

Twitter/X uses its own variant: <meta name="twitter:card" content="summary_large_image">

**The Complete Valid Document**

A complete, standards-compliant document that will render consistently in all modern browsers:`,
      },
      {
        type: "code",
        lang: "html",
        code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Page Title — Site Name</title>
    <meta name="description" content="Brief description for search engines." />

    <!-- Open Graph -->
    <meta property="og:title" content="Page Title — Site Name" />
    <meta property="og:description" content="Brief description for social sharing." />
    <meta property="og:image" content="https://example.com/og-image.png" />
    <meta property="og:url" content="https://example.com/page" />

    <link rel="icon" href="/favicon.ico" />
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <!-- All visible page content here -->
    <script src="/app.js" defer></script>
  </body>
</html>`,
      },
    ],
  },

  // ─── Chapter 4: Text Content ───────────────────────────────────────────────

  "Text Content": {
    topics: ["Headings h1–h6", "Paragraphs", "Bold & Italic", "Lists", "Blockquote", "Code & Pre", "Subscript & Superscript"],
    sections: [
      {
        type: "text",
        content: `**Headings — h1 to h6**

HTML provides six levels of headings, from <h1> (most important) to <h6> (least important). Headings create a semantic outline of the document — both for users who scan visually and for screen readers and search engines that parse the structure.

Rules for headings:
• There should be only one <h1> per page — it is the main topic/title
• Headings should follow a logical hierarchy: h1 → h2 → h3, not h1 → h3
• Never use headings to make text "bigger" — use CSS for visual sizing
• Screen readers allow users to navigate between headings; a logical heading structure is essential for accessibility

**Paragraphs**

The <p> element wraps a block of text. Browsers automatically add vertical space before and after paragraphs. You should never use <br> tags to create visual space between paragraphs — use CSS margin or padding instead. A <br> is only for intentional line breaks within content (poetry, addresses, lyrics).

**Bold and Italic — Semantic vs Visual**

HTML provides both semantic and presentational alternatives for emphasis:

• <strong> — marks text as **strongly important**. Browsers render it bold by default.
• <b> — makes text bold with **no semantic meaning**. Use only when bold is purely decorative.
• <em> — marks text as *emphasised*. Browsers render it italic by default. Screen readers stress the word.
• <i> — renders text italic with **no semantic meaning**. Use for technical terms, foreign words, or titles of works.`,
      },
      {
        type: "code",
        lang: "html",
        code: `<!-- Heading hierarchy -->
<h1>The Structure Codex</h1>
  <h2>Chapter 1: What is HTML?</h2>
    <h3>A Brief History</h3>
    <h3>The Three Languages</h3>
  <h2>Chapter 2: Elements & Tags</h2>

<!-- Paragraphs -->
<p>HTML is a markup language. It defines the structure and semantic meaning of web content.</p>
<p>CSS handles presentation. JavaScript handles behaviour.</p>

<!-- Semantic emphasis -->
<p>This feature is <strong>required</strong> for all submissions.</p>
<p>This term is <em>technically</em> correct, but imprecise.</p>
<p>The vessel was named the <i>Marie Celeste</i>.</p>

<!-- Line break — only for intentional breaks in text -->
<address>
  123 Pixel Lane<br />
  Code City, 00100
</address>`,
      },
      {
        type: "text",
        content: `**Lists**

HTML has three types of lists:

**Unordered list (<ul>)** — a bullet-point list. Use when the order of items does not matter.

**Ordered list (<ol>)** — a numbered list. Use when order is significant (steps, rankings, instructions). The type attribute changes the counter: "1" (default), "A", "a", "I", "i". The start attribute sets the starting number.

**Definition list (<dl>)** — a term-description pairing. Use for glossaries, FAQs, or metadata. Contains <dt> (definition term) and <dd> (definition description) pairs.

Lists can be nested — an <ul> or <ol> can be placed inside an <li> to create a sub-list. The li element can only appear directly inside ul or ol.

**Blockquote and Inline Quote**

<blockquote> represents a section quoted from another source. It should be used for extended quotations. The cite attribute provides the URL of the source (not displayed by default).

<q> is the inline equivalent — for short quotations within a sentence. Browsers automatically add quotation marks.

**Preformatted Text and Code**

<pre> preserves whitespace and line breaks exactly as written. Used to display code or any text where spacing is meaningful.

<code> marks a fragment of computer code — inline, within a sentence. For multi-line code blocks, wrap <code> inside <pre>.`,
      },
      {
        type: "code",
        lang: "html",
        code: `<!-- Unordered list -->
<ul>
  <li>HTML — structure</li>
  <li>CSS — presentation</li>
  <li>JavaScript — behaviour</li>
</ul>

<!-- Ordered list with custom start -->
<ol start="3">
  <li>Configure the database</li>
  <li>Run migrations</li>
  <li>Start the server</li>
</ol>

<!-- Nested list -->
<ul>
  <li>Frontend
    <ul>
      <li>HTML</li>
      <li>CSS</li>
    </ul>
  </li>
  <li>Backend</li>
</ul>

<!-- Definition list -->
<dl>
  <dt>DOM</dt>
  <dd>Document Object Model — a tree representation of the HTML document.</dd>
  <dt>CSSOM</dt>
  <dd>CSS Object Model — a tree representation of the CSS rules.</dd>
</dl>

<!-- Blockquote -->
<blockquote cite="https://developer.mozilla.org">
  <p>HTML is the standard markup language for creating web pages.</p>
</blockquote>

<!-- Inline code and pre block -->
<p>Use the <code>querySelector()</code> method to select elements.</p>

<pre><code>function greet(name) {
  return "Hello, " + name + "!";
}
console.log(greet("world"));</code></pre>

<!-- Subscript and superscript -->
<p>Water is H<sub>2</sub>O. The area is 5m<sup>2</sup>.</p>`,
      },
    ],
  },

  // ─── Chapter 5: Links & Navigation ────────────────────────────────────────

  "Links & Navigation": {
    topics: ["Anchor Tags", "href", "Absolute vs Relative URLs", "target attribute", "Fragment Links", "mailto & tel"],
    sections: [
      {
        type: "text",
        content: `**The Anchor Element**

Links are created with the <a> (anchor) element. The href attribute specifies the destination. The content of the element — the text or image between the tags — becomes the clickable link.

A link with no href attribute is a placeholder anchor. In older HTML, anchors with name attributes were used as link targets; this is now done with id attributes on any element.

**URL Types**

**Absolute URL** — a complete address including the protocol and domain. Use for links to external websites.
\`https://developer.mozilla.org/en-US/docs/Web/HTML\`

**Relative URL** — a path relative to the current document's location. Use for links within the same site. There are two types:
• **Root-relative** (starts with /): always resolves from the site root, regardless of where the current page is. Preferred for large sites.
• **Document-relative** (no leading /): resolves relative to the current page's folder. Use with caution.

\`/about\` — root-relative, always resolves to example.com/about
\`about.html\` — document-relative, depends on current page location
\`../contact\` — one directory up, then /contact`,
      },
      {
        type: "code",
        lang: "html",
        code: `<!-- Absolute link to external site -->
<a href="https://developer.mozilla.org">MDN Web Docs</a>

<!-- Root-relative link (preferred) -->
<a href="/about">About Us</a>
<a href="/blog/html-basics">HTML Basics Article</a>

<!-- Document-relative link -->
<a href="about.html">About</a>
<a href="../contact.html">Contact</a>

<!-- Link wrapping an image -->
<a href="/products">
  <img src="/ui/products-banner.jpg" alt="Browse Products" />
</a>

<!-- Placeholder anchor (no destination yet) -->
<a href="#">Coming Soon</a>`,
      },
      {
        type: "text",
        content: `**The target Attribute**

The target attribute controls where the linked document opens:

• \`target="_self"\` — default. Opens in the same tab/window.
• \`target="_blank"\` — opens in a new tab or window.
• \`target="_parent"\` — opens in the parent frame (for framesets, rarely used today).
• \`target="_top"\` — opens in the full browser window, breaking out of any frames.

**Security note for target="_blank"**: always add \`rel="noopener noreferrer"\` when linking to external sites with _blank. Without it, the new page can access the original page via the window.opener property — a potential phishing vector.

**Fragment Links (Anchor Links)**

To link to a specific section within the same page, use a # followed by the id of the target element. This is called a fragment link or anchor link. The browser scrolls to the target element and updates the URL hash.

You can also link to a fragment on another page: /about#team

**Email and Phone Links**

The mailto: scheme creates a link that opens the user's default email client.
The tel: scheme creates a link that initiates a phone call on mobile devices.`,
      },
      {
        type: "code",
        lang: "html",
        code: `<!-- External link — opens in new tab safely -->
<a href="https://github.com" target="_blank" rel="noopener noreferrer">
  GitHub
</a>

<!-- Fragment link — scrolls to section with id="pricing" -->
<nav>
  <a href="#features">Features</a>
  <a href="#pricing">Pricing</a>
  <a href="#faq">FAQ</a>
</nav>

<section id="features">
  <h2>Features</h2>
  <!-- content -->
</section>

<section id="pricing">
  <h2>Pricing</h2>
  <!-- content -->
</section>

<!-- Link to fragment on another page -->
<a href="/docs#getting-started">Getting Started</a>

<!-- Email link -->
<a href="mailto:hello@example.com">Email Us</a>

<!-- Email with pre-filled subject -->
<a href="mailto:support@example.com?subject=Bug%20Report">Report a Bug</a>

<!-- Phone link -->
<a href="tel:+6281234567890">Call Us</a>

<!-- Download link — browser downloads instead of navigating -->
<a href="/files/guide.pdf" download>Download PDF Guide</a>

<!-- Download with suggested filename -->
<a href="/api/export" download="user-data.csv">Export Data</a>`,
      },
    ],
  },

  // ─── Chapter 6: Images & Media ────────────────────────────────────────────

  "Images & Media": {
    topics: ["img tag", "alt Text", "Image Formats", "figure & figcaption", "video", "audio", "iframe"],
    sections: [
      {
        type: "text",
        content: `**The <img> Element**

Images are embedded with the <img> element, which is a void element (self-closing). Required attributes:

• **src** — the URL of the image file (absolute or relative)
• **alt** — alternative text describing the image

The alt attribute is essential for accessibility. Screen readers read it aloud instead of the image. Search engines use it to understand image content. If an image fails to load, the alt text is displayed instead.

**Writing good alt text:**
• Describe what the image shows, not just "image of..."
• For images that are links, describe the destination
• For decorative images (pure visual, no information content), use alt="" — this tells screen readers to skip the image entirely
• Keep it concise: under 125 characters
• Do not start with "picture of" or "image of" — screen readers already announce it is an image

**Sizing Images**

Always specify width and height attributes matching the image's intrinsic dimensions. This reserves space in the layout before the image loads, preventing layout shifts (CLS — Cumulative Layout Shift). The values are in pixels and have no unit suffix.

CSS should be used to control the display size: width: 100% with height: auto makes images responsive while preserving the aspect ratio.

**Image Formats**

• **JPEG/JPG** — best for photographs; lossy compression; no transparency
• **PNG** — best for logos, icons, and images with transparency; lossless
• **WebP** — modern format, better compression than JPEG and PNG; supports transparency
• **SVG** — vector format; infinitely scalable; ideal for icons and logos; can be styled with CSS
• **AVIF** — next-generation format; best compression; limited browser support
• **GIF** — supports animation; poor quality; prefer WebP or <video> for animations`,
      },
      {
        type: "code",
        lang: "html",
        code: `<!-- Basic image -->
<img src="/images/hero.jpg" alt="A developer working at a dual-monitor setup" width="1200" height="600" />

<!-- Decorative image — empty alt -->
<img src="/ui/divider-ornament.png" alt="" width="400" height="20" />

<!-- Responsive image with CSS -->
<img
  src="/images/profile.jpg"
  alt="Profile photo of the author"
  width="400"
  height="400"
  style="width: 100%; height: auto;"
/>

<!-- Lazy loading — defers offscreen images -->
<img
  src="/images/product.webp"
  alt="RPG-themed keyboard with mechanical switches"
  width="800"
  height="600"
  loading="lazy"
/>

<!-- srcset — serves different image sizes based on screen resolution -->
<img
  src="/images/hero-800.jpg"
  srcset="/images/hero-400.jpg 400w, /images/hero-800.jpg 800w, /images/hero-1600.jpg 1600w"
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1600px"
  alt="Site hero image"
  width="1600"
  height="800"
/>`,
      },
      {
        type: "text",
        content: `**<figure> and <figcaption>**

<figure> is a semantic container for self-contained content — typically an image, illustration, diagram, or code snippet — that is referenced from the main text but could be moved without breaking the flow.

<figcaption> provides a caption for the figure. It can appear before or after the content inside <figure>. Screen readers associate the caption with the figure.

**Embedding Video**

The <video> element embeds video content. Key attributes:
• **controls** — shows the browser's native playback controls
• **autoplay** — starts playing automatically (browsers block this without muted)
• **muted** — required for autoplay to work in most browsers
• **loop** — repeats the video
• **poster** — image shown before the video plays
• **preload** — "none", "metadata", or "auto"

Multiple <source> elements inside <video> provide fallback formats. The browser uses the first format it supports.

**Embedding Audio**

The <audio> element works identically to <video> but without video display.

**<iframe>**

<iframe> embeds another HTML document inside the current page. Used for embedding YouTube videos, Google Maps, Codepen demos, payment forms, and third-party widgets. Always include a title attribute for accessibility.`,
      },
      {
        type: "code",
        lang: "html",
        code: `<!-- figure with figcaption -->
<figure>
  <img
    src="/images/flexbox-diagram.png"
    alt="Diagram showing flex container and flex items with main axis and cross axis labelled"
    width="800"
    height="400"
  />
  <figcaption>Figure 1: The Flexbox layout model. The main axis runs horizontally by default.</figcaption>
</figure>

<!-- Video with controls -->
<video controls width="720" poster="/thumbnails/intro.jpg">
  <source src="/videos/intro.webm" type="video/webm" />
  <source src="/videos/intro.mp4" type="video/mp4" />
  <p>Your browser does not support HTML video. <a href="/videos/intro.mp4">Download the video</a>.</p>
</video>

<!-- Muted autoplay for background video -->
<video autoplay muted loop playsinline width="1920" height="1080">
  <source src="/videos/background.mp4" type="video/mp4" />
</video>

<!-- Audio -->
<audio controls>
  <source src="/audio/quest-complete.mp3" type="audio/mpeg" />
  <source src="/audio/quest-complete.ogg" type="audio/ogg" />
</audio>

<!-- Embedded YouTube video via iframe -->
<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
  title="Never Gonna Give You Up — Music Video"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
></iframe>`,
      },
    ],
  },

  // ─── Chapter 7: Forms ─────────────────────────────────────────────────────

  "Forms": {
    topics: ["form element", "input types", "label", "textarea", "select & option", "button", "fieldset & legend", "HTML5 validation"],
    sections: [
      {
        type: "text",
        content: `**The <form> Element**

Forms collect user input and submit it to a server. The <form> element wraps all form controls and has two key attributes:

• **action** — the URL where the form data is sent on submission. Omit or use "" to submit to the current page.
• **method** — the HTTP method used: "GET" (data in URL query string, for searches) or "POST" (data in request body, for sensitive or large data)

The name attribute on each input control determines the key in the submitted data. Controls without a name attribute are not submitted.

**The <label> Element**

Labels are essential for accessibility. They associate a text description with a form control in two ways:

• **Explicit association**: <label for="id"> matches the id of the input
• **Implicit association**: wrapping the input inside the <label>

When a label is properly associated, clicking the label focuses the input. Screen readers announce the label text when the input is focused. Never use placeholder text as a substitute for labels — placeholders disappear when the user types.

**Input Types**

The type attribute on <input> controls what data is accepted and how the input is rendered. HTML5 introduced many new types that provide native validation and mobile-optimised keyboards.`,
      },
      {
        type: "code",
        lang: "html",
        code: `<!-- Text input types -->
<label for="username">Username</label>
<input type="text" id="username" name="username" placeholder="e.g. elvar42" />

<label for="email">Email address</label>
<input type="email" id="email" name="email" autocomplete="email" />

<label for="password">Password</label>
<input type="password" id="password" name="password" minlength="8" />

<label for="search">Search</label>
<input type="search" id="search" name="q" />

<!-- Number inputs -->
<label for="age">Age</label>
<input type="number" id="age" name="age" min="1" max="120" />

<label for="price">Price range</label>
<input type="range" id="price" name="price" min="0" max="1000" step="50" value="200" />

<!-- Date and time -->
<label for="dob">Date of birth</label>
<input type="date" id="dob" name="dob" />

<label for="meeting">Meeting time</label>
<input type="datetime-local" id="meeting" name="meeting" />

<!-- Other types -->
<input type="color" id="theme" name="theme" value="#7a4af0" />
<input type="file" id="avatar" name="avatar" accept="image/*" />
<input type="url" id="website" name="website" placeholder="https://" />
<input type="tel" id="phone" name="phone" pattern="[0-9]{10,13}" />`,
      },
      {
        type: "text",
        content: `**Checkbox and Radio**

**Checkboxes (<input type="checkbox">)** allow zero or more options to be selected. Each checkbox is independent. Checkboxes with the same name submit an array of checked values.

**Radio buttons (<input type="radio">)** allow exactly one option from a group. Buttons in the same group share the same name attribute. Only the checked button's value is submitted.

**<textarea>**

For multi-line text input. The cols and rows attributes set the initial visible size (CSS width/height is preferred). The content between the tags (if any) is the default value.

**<select> and <option>**

A dropdown selection. The name is on the <select>; the value on each <option>. The selected attribute marks the default option. The multiple attribute allows multiple selections (use Ctrl/Cmd to select multiple). <optgroup> groups options under a label.

**<button>**

Three types:
• type="submit" — submits the form (default when inside a form)
• type="reset" — resets all form controls to their initial values
• type="button" — does nothing by default; attach JavaScript handlers

Always specify type explicitly to avoid unintended form submission.

**<fieldset> and <legend>**

<fieldset> groups related controls. <legend> provides a caption for the group. Especially important for radio button groups and checkboxes — screen readers announce the legend before each control in the group.`,
      },
      {
        type: "code",
        lang: "html",
        code: `<!-- Checkbox group -->
<fieldset>
  <legend>Skills</legend>
  <label><input type="checkbox" name="skills" value="html" /> HTML</label>
  <label><input type="checkbox" name="skills" value="css" /> CSS</label>
  <label><input type="checkbox" name="skills" value="js" checked /> JavaScript</label>
</fieldset>

<!-- Radio group -->
<fieldset>
  <legend>Experience level</legend>
  <label><input type="radio" name="level" value="beginner" checked /> Beginner</label>
  <label><input type="radio" name="level" value="intermediate" /> Intermediate</label>
  <label><input type="radio" name="level" value="advanced" /> Advanced</label>
</fieldset>

<!-- Textarea -->
<label for="bio">Bio</label>
<textarea id="bio" name="bio" rows="5" placeholder="Tell us about yourself..."></textarea>

<!-- Select dropdown -->
<label for="country">Country</label>
<select id="country" name="country">
  <option value="">-- Select a country --</option>
  <optgroup label="Southeast Asia">
    <option value="id" selected>Indonesia</option>
    <option value="sg">Singapore</option>
    <option value="my">Malaysia</option>
  </optgroup>
</select>

<!-- Full form example -->
<form action="/register" method="POST">
  <fieldset>
    <legend>Create Account</legend>
    <label for="reg-email">Email</label>
    <input type="email" id="reg-email" name="email" required autocomplete="email" />

    <label for="reg-password">Password</label>
    <input type="password" id="reg-password" name="password" required minlength="8" />

    <label>
      <input type="checkbox" name="terms" required />
      I agree to the Terms of Service
    </label>

    <button type="submit">Create Account</button>
    <button type="reset">Clear</button>
  </fieldset>
</form>`,
      },
      {
        type: "text",
        content: `**HTML5 Form Validation**

HTML5 provides built-in validation that runs before the form is submitted. No JavaScript required for basic validation.

Key validation attributes:
• **required** — field must not be empty
• **minlength / maxlength** — minimum/maximum character count (text inputs)
• **min / max** — minimum/maximum value (number, date, range)
• **pattern** — a regular expression the value must match
• **type** — email, url, tel provide type-specific validation

The browser prevents form submission and shows error messages when validation fails. Styling is done with the :valid, :invalid, and :required CSS pseudo-classes.

HTML5 validation is not a substitute for server-side validation. Always validate data on the server — client-side validation can be bypassed by anyone who knows how to use browser DevTools.

The hidden input type is used to send data that is not shown to the user — such as CSRF tokens, tracking IDs, or pre-set values.`,
      },
    ],
  },

  // ─── Chapter 8: Semantic HTML ──────────────────────────────────────────────

  "Semantic HTML": {
    topics: ["What is Semantic HTML", "Structural Elements", "section vs article", "div vs span", "Block vs Inline", "Additional Semantic Tags"],
    sections: [
      {
        type: "text",
        content: `**What is Semantic HTML?**

Semantic HTML means using elements that describe the meaning and role of their content, not just its visual appearance. A <nav> element tells the browser, screen reader, and developer that this is a navigation region. A <div> tells them nothing.

**Why semantics matter:**

• **Accessibility** — screen readers use semantic structure to build a navigable outline of the page. Users can jump between landmarks (header, main, nav, footer) and between headings.
• **SEO** — search engines weight content differently based on its element type. Content in <main>, <article>, and headings is weighted more heavily than content in <div>.
• **Developer experience** — self-documenting code. <article> communicates intent; <div class="article-wrapper"> does not.
• **Browser behaviour** — the browser uses semantics for reader mode, print styles, and focus management.

Semantic HTML does not mean avoiding <div> and <span> entirely. Those elements are indispensable for layout and styling hooks. It means choosing the most appropriate element for each piece of content.

**Structural / Landmark Elements**

HTML5 introduced a set of landmark elements that define the major regions of a page. Assistive technologies expose these as named regions users can navigate to directly.

• **<header>** — introductory content for a page or section. Typically contains the logo, site title, and primary navigation. A page may have multiple <header> elements (one for the page, one per <article>).
• **<nav>** — a block of navigation links. Pages may have multiple nav elements (site navigation, page contents, breadcrumbs).
• **<main>** — the dominant content of the page. There must be only one <main> per page. It should not be nested inside <article>, <aside>, <header>, <footer>, or <nav>.
• **<footer>** — closing content for its nearest ancestor element. Typically contains copyright, links, and contact info.
• **<aside>** — content tangentially related to the surrounding content. Commonly used for sidebars, pull quotes, and related links.`,
      },
      {
        type: "code",
        lang: "html",
        code: `<!-- Semantic page structure -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Devstiny — Learning Platform</title>
  </head>
  <body>

    <header>
      <a href="/">
        <img src="/logo.png" alt="Devstiny" width="120" height="40" />
      </a>
      <nav aria-label="Main navigation">
        <ul>
          <li><a href="/path">Learning Path</a></li>
          <li><a href="/books">Books</a></li>
          <li><a href="/quests">Quests</a></li>
        </ul>
      </nav>
    </header>

    <main>
      <h1>Your Learning Journey</h1>
      <!-- primary content -->
    </main>

    <aside aria-label="Progress summary">
      <h2>Your Stats</h2>
      <p>1,200 XP · Level 5</p>
    </aside>

    <footer>
      <p>&copy; 2026 Devstiny. All rights reserved.</p>
      <nav aria-label="Footer links">
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </nav>
    </footer>

  </body>
</html>`,
      },
      {
        type: "text",
        content: `**<section> vs <article>**

These two elements are commonly confused:

**<article>** — a self-contained piece of content that makes sense on its own and could be syndicated or shared independently. Examples: a blog post, a news article, a forum post, a product card, a comment. Articles typically have a heading.

**<section>** — a thematic grouping of content within a larger document or article. It is not self-contained — it is a part of something. Each section typically has a heading. If you cannot add a heading, it may not be a true section.

**Decision rule**: If the content makes sense outside the context of the surrounding page — if you could put it in an RSS feed or share it as-is — use <article>. Otherwise use <section>.

**<div> and <span>**

When no semantic element fits, use:
• **<div>** — a generic block container. No semantic meaning. Used for grouping elements for CSS layout or JavaScript selection.
• **<span>** — a generic inline container. No semantic meaning. Used for applying styles or JavaScript hooks to a range of inline content.

Avoid overusing these. "Div soup" — a page with deeply nested <div> elements and no semantic structure — is hard to read, maintain, and is inaccessible to screen reader users.`,
      },
      {
        type: "code",
        lang: "html",
        code: `<!-- Article: self-contained content -->
<article>
  <header>
    <h2>Understanding CSS Flexbox</h2>
    <time datetime="2026-01-15">January 15, 2026</time>
  </header>
  <p>Flexbox is a one-dimensional layout model...</p>
  <footer>
    <p>Written by <a href="/authors/elvar">Elvar</a></p>
  </footer>
</article>

<!-- Section: thematic grouping within a page -->
<main>
  <h1>Web Development Courses</h1>
  <section>
    <h2>Beginner Courses</h2>
    <!-- list of beginner courses -->
  </section>
  <section>
    <h2>Advanced Courses</h2>
    <!-- list of advanced courses -->
  </section>
</main>

<!-- Additional semantic elements -->
<p>This offer expires <time datetime="2026-12-31">December 31, 2026</time>.</p>

<p>Search results for <mark>flexbox layout</mark>:</p>

<details>
  <summary>What is the DOM?</summary>
  <p>The Document Object Model is a tree-structured representation of an HTML document.</p>
</details>

<address>
  Contact us at <a href="mailto:hello@devstiny.com">hello@devstiny.com</a>
</address>`,
      },
    ],
  },
};

// ─── NEW chapters to upsert if missing ────────────────────────────────────────

const newChapters: Array<{
  title: string;
  topics: string[];
  order: number;
  sections: Block[];
}> = [
  // ─── Chapter 9: Tables ──────────────────────────────────────────────────

  {
    title: "Tables",
    topics: ["table, tr, th, td", "thead, tbody, tfoot", "colspan & rowspan", "scope", "caption"],
    order: 9,
    sections: [
      {
        type: "text",
        content: `**HTML Tables**

Tables are for displaying tabular data — information that has a natural row and column structure (spreadsheets, schedules, comparison charts, data grids). Tables are not for page layout. Using tables for layout is an outdated practice that breaks accessibility, screen-reader navigation, and responsive design.

**Core Table Elements**

• **<table>** — the table container
• **<tr>** — a table row (Table Row)
• **<th>** — a header cell (Table Header); bold and centred by default; announces itself as a header to screen readers
• **<td>** — a data cell (Table Data)

**Table Sections**

• **<thead>** — groups the header rows; enables browsers to repeat the header when printing multi-page tables
• **<tbody>** — groups the body rows; required if you use <thead> or <tfoot>
• **<tfoot>** — groups footer rows (totals, summaries); displayed at the bottom regardless of where in the HTML it appears

The <caption> element provides a title for the table. It must be the first child of <table>. Screen readers read the caption before the table content, helping users decide whether to navigate the table. It is the table's equivalent of a heading.`,
      },
      {
        type: "code",
        lang: "html",
        code: `<!-- Basic table with sections and caption -->
<table>
  <caption>Monthly Sales Summary — Q1 2026</caption>
  <thead>
    <tr>
      <th scope="col">Month</th>
      <th scope="col">Revenue</th>
      <th scope="col">Orders</th>
      <th scope="col">Avg. Order</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">January</th>
      <td>$12,400</td>
      <td>310</td>
      <td>$40</td>
    </tr>
    <tr>
      <th scope="row">February</th>
      <td>$9,800</td>
      <td>245</td>
      <td>$40</td>
    </tr>
    <tr>
      <th scope="row">March</th>
      <td>$15,600</td>
      <td>390</td>
      <td>$40</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <th scope="row">Total</th>
      <td>$37,800</td>
      <td>945</td>
      <td>$40</td>
    </tr>
  </tfoot>
</table>`,
      },
      {
        type: "text",
        content: `**Spanning Cells**

**colspan** — makes a cell span across multiple columns. A cell with colspan="3" occupies three column positions.
**rowspan** — makes a cell span across multiple rows. A cell with rowspan="2" occupies two row positions.

When using spans, the spanned cells must be removed from the rows they are absorbed into, or the table structure will break.

**The scope Attribute**

The scope attribute on <th> identifies what the header applies to:
• scope="col" — the header applies to all cells in the column below it
• scope="row" — the header applies to all cells in the row it is in
• scope="colgroup" — applies to a group of columns defined by <colgroup>
• scope="rowgroup" — applies to a group of rows (thead, tbody, or tfoot)

Using scope correctly on all <th> elements is the most important accessibility requirement for tables. Without it, screen reader users cannot determine which row or column a cell belongs to in a complex table.

**Styling Tables with CSS**

CSS provides two border-collapse models:
• border-collapse: separate — each cell has its own border with space between (default)
• border-collapse: collapse — borders merge into a single shared border

Always style tables with CSS rather than HTML attributes (border, bgcolor, cellpadding, cellspacing are deprecated).`,
      },
      {
        type: "code",
        lang: "html",
        code: `<!-- colspan example: merged header -->
<table>
  <thead>
    <tr>
      <th scope="col" rowspan="2">Product</th>
      <th scope="colgroup" colspan="2">Q1</th>
      <th scope="colgroup" colspan="2">Q2</th>
    </tr>
    <tr>
      <th scope="col">Jan</th>
      <th scope="col">Feb</th>
      <th scope="col">Mar</th>
      <th scope="col">Apr</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Widget A</th>
      <td>120</td>
      <td>98</td>
      <td>145</td>
      <td>130</td>
    </tr>
  </tbody>
</table>

<!-- CSS: clean table styling -->
<style>
  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 0.95rem;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 0.75rem 1rem;
    text-align: left;
  }
  thead th {
    background-color: #1a1a2e;
    color: #f0c040;
  }
  tbody tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  tfoot {
    font-weight: bold;
    background-color: #f0f0f0;
  }
</style>`,
      },
    ],
  },

  // ─── Chapter 10: Accessibility ────────────────────────────────────────────

  {
    title: "Accessibility",
    topics: ["Why Accessibility Matters", "ARIA Roles & Attributes", "alt Text", "Keyboard Navigation", "Color Contrast", "Screen Readers"],
    order: 10,
    sections: [
      {
        type: "text",
        content: `**Why Accessibility Matters**

Web accessibility means making websites usable by everyone, including people who use assistive technologies such as screen readers, voice control, switch access, and keyboard-only navigation.

Roughly 15% of the world's population has some form of disability. Many of these affect web use:
• Visual impairments — blindness, low vision, colour blindness
• Motor impairments — limited hand control, tremors, paralysis
• Cognitive impairments — dyslexia, attention disorders, memory conditions
• Auditory impairments — deafness, hard of hearing (affects video/audio content)

Beyond the ethical case, accessibility is often a legal requirement. The WCAG (Web Content Accessibility Guidelines) is the international standard, published by the W3C. WCAG 2.1 AA is the most commonly required compliance level.

**Accessibility starts with HTML**

Well-written semantic HTML provides accessibility almost for free. Screen readers are built to understand the meaning of HTML elements — they know that <h2> is a heading, that <button> is interactive, that <nav> is navigation. Using a <div> with a click handler instead of a <button> breaks keyboard access and screen reader announcements by default.

The simplest accessibility rule: use the right element for the job. The second simplest: provide text alternatives for non-text content.`,
      },
      {
        type: "text",
        content: `**ARIA — Accessible Rich Internet Applications**

ARIA (WAI-ARIA) is a set of HTML attributes that add semantic information to elements when native HTML is insufficient. ARIA does not add behaviour — it only communicates information to assistive technologies.

**The first rule of ARIA**: do not use ARIA if a native HTML element exists that already has the required semantics. A <button> is always better than <div role="button">. A <nav> is always better than <div role="navigation">.

Key ARIA attributes:

• **role** — overrides or adds to the element's semantic role. Values include "button", "navigation", "dialog", "alert", "status", "tab", "tabpanel", "menu", "menuitem"
• **aria-label** — provides an accessible name when no visible text label exists. Example: a close button with only an X icon
• **aria-labelledby** — references the id of another element that labels this element
• **aria-describedby** — references the id of an element that provides additional description
• **aria-hidden="true"** — removes an element from the accessibility tree (icons, decorative images, repeated content)
• **aria-live** — announces dynamic content changes to screen readers. Values: "polite" (waits for idle), "assertive" (interrupts immediately)
• **aria-expanded** — indicates whether a collapsible element is open or closed
• **aria-controls** — references the id of an element this control manages`,
      },
      {
        type: "code",
        lang: "html",
        code: `<!-- Icon button: no visible text — needs aria-label -->
<button type="button" aria-label="Close dialog">
  <svg aria-hidden="true" focusable="false"><!-- icon SVG --></svg>
</button>

<!-- Navigation with accessible name -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<!-- Breadcrumb navigation -->
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/books">Books</a></li>
    <li aria-current="page">HTML Realm</li>
  </ol>
</nav>

<!-- Live region: for dynamic status updates -->
<div role="status" aria-live="polite" aria-atomic="true" id="form-status">
  <!-- Updated by JavaScript: "Form saved successfully" -->
</div>

<!-- Collapsible section -->
<button
  type="button"
  aria-expanded="false"
  aria-controls="faq-answer-1"
>
  What is the DOM?
</button>
<div id="faq-answer-1" hidden>
  <p>The Document Object Model is a tree-structured representation of an HTML document.</p>
</div>

<!-- Skip link: allows keyboard users to jump past repeated navigation -->
<a href="#main-content" class="skip-link">Skip to main content</a>
<nav><!-- repeated navigation --></nav>
<main id="main-content">
  <!-- page content -->
</main>`,
      },
      {
        type: "text",
        content: `**Keyboard Navigation**

All interactive elements — links, buttons, form controls, and focusable elements — must be reachable and operable using only a keyboard. Users navigate by pressing:
• **Tab** — move to the next focusable element
• **Shift+Tab** — move to the previous focusable element
• **Enter / Space** — activate the focused element (Enter for links, Space or Enter for buttons)
• **Arrow keys** — navigate within widgets (menus, radio groups, listboxes, sliders)
• **Escape** — close dialogs or menus

Requirements for keyboard accessibility:
• Never remove the visible focus outline unless you replace it with an equally visible custom style. \`:focus-visible\` targets keyboard focus only and is the modern solution.
• Use tabindex="0" to make a non-interactive element focusable. Use tabindex="-1" to make an element programmatically focusable (via JavaScript focus()) but not in the tab order.
• Never use tabindex values greater than 0 — they create unpredictable tab order.
• Trap focus inside modal dialogs — users should not be able to tab outside an open modal.

**Colour Contrast**

WCAG 2.1 requires:
• Normal text (below 18pt): minimum contrast ratio of **4.5:1**
• Large text (18pt / 14pt bold or larger): minimum contrast ratio of **3:1**
• UI components and graphical objects: minimum **3:1**

Use tools like the WebAIM Contrast Checker or browser DevTools (Accessibility panel) to verify contrast ratios. Common failure: light grey text on white background.`,
      },
    ],
  },

  // ─── Chapter 11: Best Practices ───────────────────────────────────────────

  {
    title: "Best Practices",
    topics: ["W3C Validator", "Clean HTML", "Indentation", "Deprecated Tags", "Separation of Concerns", "DOCTYPE & Standards"],
    order: 11,
    sections: [
      {
        type: "text",
        content: `**Validate Your HTML**

The W3C Markup Validation Service (validator.w3.org) checks your HTML for errors and warnings according to the HTML standard. Validation catches:
• Missing required attributes (alt on img, for on label)
• Incorrectly nested elements
• Unclosed tags
• Duplicate id attributes
• Deprecated elements and attributes
• Mismatched quotes and encoding issues

Even browsers that render invalid HTML without crashing may do so inconsistently. Validated HTML behaves predictably across all browsers and is easier for accessibility tools to parse.

**Writing Clean, Readable HTML**

• Use consistent 2-space indentation (the standard for HTML)
• Keep attribute values quoted, even when technically optional
• Write one attribute per line for elements with many attributes
• Close all non-void elements
• Use lowercase for all element and attribute names
• Put the <link> and <meta> tags in a consistent order in <head>
• Add blank lines between major sections
• Prefer semantic element names over generic div/span when a semantic option exists

**Separation of Concerns**

HTML, CSS, and JavaScript each have a distinct responsibility. Mixing them creates brittle, hard-to-maintain code:

• **Do not use inline styles** — move all styles to external CSS files
• **Do not use presentational HTML attributes** — bgcolor, color, align, border, cellpadding, valign, width/height on table cells are all deprecated
• **Do not use JavaScript in HTML attributes** — onclick="doSomething()" is harder to maintain and cannot be protected by a Content Security Policy. Attach event listeners in JavaScript instead.
• **Do not use layout tables** — use CSS Flexbox or Grid
• **Do not use <br> for vertical spacing** — use CSS margin or padding`,
      },
      {
        type: "code",
        lang: "html",
        code: `<!-- BAD: Mixing concerns, using deprecated attributes -->
<table width="100%" bgcolor="#ffffff" cellpadding="10">
  <tr>
    <td align="center">
      <font color="red" size="4"><b>Warning!</b></font>
    </td>
  </tr>
</table>
<br><br><br>
<div onclick="alert('clicked')" style="color: blue; cursor: pointer;">
  Click me
</div>

<!-- GOOD: Semantic HTML, external CSS, unobtrusive JS -->
<section class="warning-banner">
  <p><strong>Warning!</strong> This action cannot be undone.</p>
</section>

<button type="button" id="action-btn" class="btn-primary">
  Click me
</button>

<script>
  document.getElementById("action-btn").addEventListener("click", () => {
    console.log("Clicked");
  });
</script>

<!-- External stylesheet (in <head>) -->
<link rel="stylesheet" href="/styles/main.css" />`,
      },
      {
        type: "text",
        content: `**Deprecated and Obsolete Elements**

The following elements were deprecated in HTML5 and should not be used. They may still render in some browsers, but their use is a standards violation and signals poor code quality:

• **<center>** — use CSS text-align: center or margin: 0 auto
• **<font>** — use CSS font-family, color, font-size
• **<b>** as bold-for-style — use CSS font-weight: bold; use <strong> for importance
• **<i>** as italic-for-style — use CSS font-style: italic; use <em> for emphasis
• **<u>** — visual underline; avoid (users mistake it for links); use CSS text-decoration
• **<strike> / <s>** — use <s> for struck-through text that is no longer accurate; use CSS text-decoration: line-through for visual decoration
• **<marquee>** — scrolling text; never use
• **<blink>** — blinking text; never use
• **<frame>, <frameset>, <noframes>** — frame-based layouts; completely obsolete
• **<applet>** — Java applets; obsolete
• **<acronym>** — use <abbr> instead

**Performance Best Practices**

• Load CSS in <head> (render-blocking, so the page has styles before painting)
• Load scripts at the end of <body> or use defer / async attributes
• Add loading="lazy" to below-the-fold images
• Specify width and height on all images to prevent layout shift
• Use WebP for photographs where browser support allows
• Minify HTML (remove whitespace, comments) in production builds`,
      },
      {
        type: "code",
        lang: "html",
        code: `<!-- Script loading strategies -->

<!-- 1. Default: blocks HTML parsing until downloaded + executed -->
<script src="app.js"></script>

<!-- 2. defer: downloads in parallel; executes after HTML is parsed; order preserved -->
<script src="app.js" defer></script>

<!-- 3. async: downloads in parallel; executes immediately when ready; order not guaranteed -->
<script src="analytics.js" async></script>

<!-- Image performance -->
<img
  src="/images/hero.webp"
  alt="Hero image"
  width="1200"
  height="600"
  loading="eager"
  fetchpriority="high"
/>

<img
  src="/images/article-thumbnail.webp"
  alt="Article thumbnail"
  width="400"
  height="300"
  loading="lazy"
/>

<!-- Preload critical resources (fonts, hero images, key CSS) -->
<link rel="preload" as="image" href="/images/hero.webp" />
<link rel="preload" as="font" href="/fonts/pixel.woff2" crossorigin />

<!-- Complete document checklist in comments -->
<!--
  ✓ DOCTYPE declared
  ✓ <html lang="..."> set
  ✓ charset meta tag first in <head>
  ✓ viewport meta tag present
  ✓ <title> unique and descriptive
  ✓ All images have alt attributes
  ✓ All form inputs have associated <label>
  ✓ Heading hierarchy is logical (h1 → h2 → h3)
  ✓ No inline styles
  ✓ No deprecated elements
  ✓ Validated with W3C validator
-->`,
      },
    ],
  },
];

// ─── Run update ────────────────────────────────────────────────────────────────

async function main() {
  const book = await prisma.book.findUnique({
    where: { slug: "html" },
    include: { chapters: { orderBy: { order: "asc" } } },
  });

  if (!book) {
    console.error("HTML book not found — check slug 'html'.");
    process.exit(1);
  }

  console.log(`\nUpdating "${book.title}" — ${book.chapters.length} existing chapters...\n`);

  // ── Update existing chapters ──────────────────────────────────────────────
  let updated = 0;
  for (const ch of book.chapters) {
    const data = htmlChapters[ch.title];
    if (!data) {
      console.log(`  SKIP  "${ch.title}" — no content defined`);
      continue;
    }

    await prisma.bookChapter.update({
      where: { id: ch.id },
      data: {
        topics: data.topics,
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

    console.log(`  ✓  Updated "${ch.title}"`);
    updated++;
  }

  // ── Create or skip new chapters ───────────────────────────────────────────
  const existingTitles = new Set(book.chapters.map((c) => c.title));

  for (const ch of newChapters) {
    if (existingTitles.has(ch.title)) {
      console.log(`  SKIP  "${ch.title}" — already exists (update it above if needed)`);
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
  }

  console.log(`\nDone — ${updated} chapters updated, ${newChapters.filter((c) => !existingTitles.has(c.title)).length} created.\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
