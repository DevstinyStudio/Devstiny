import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type Block = { type: "text"; content: string } | { type: "code"; code: string };

// ─── HTML Book ────────────────────────────────────────────────────────────────

const htmlChapters: Record<string, { title?: string; topics?: string[]; sections: Block[] }> = {

  "What is HTML?": {
    sections: [
      { type: "text", content: `HTML (HyperText Markup Language) is the standard markup language used to create web pages. It defines the structure and semantic meaning of web content by annotating text with elements and tags that tell the browser what each piece of content represents.

HTML is not a programming language — it has no variables, conditions, or loops. It is a markup language: a system for labelling the role and structure of different parts of a document. A heading is a heading because it is wrapped in an <h1> to <h6> tag, not because it is styled differently.

Every web page you visit begins as an HTML document. The browser downloads that document, parses it, and builds a visual and interactive representation called the DOM (Document Object Model). Without HTML, there is no structure — only unstyled text.` },

      { type: "text", content: `HTML was created by Tim Berners-Lee in 1991. The current specification is HTML5, maintained by the WHATWG (Web Hypertext Application Technology Working Group). HTML5 introduced semantic elements like <article>, <section>, <nav>, and <aside>, as well as native audio/video support, the <canvas> element, and improved form controls.

The three languages of the web work together, each with a distinct role:
• HTML — structure and meaning (what content is)
• CSS — presentation and layout (how content looks)
• JavaScript — behaviour and interactivity (how content responds)

These three responsibilities should be kept separate. Mixing them — for example, using inline styles for layout or HTML tables for non-tabular data — makes code harder to maintain, less accessible, and more brittle.` },

      { type: "code", code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My First Page</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <h1>Hello, World</h1>
    <p>This is a paragraph of text.</p>
    <script src="app.js"></script>
  </body>
</html>` },

      { type: "text", content: `The above is a minimal, valid HTML5 document. Every page should start with the DOCTYPE declaration, which tells the browser which version of HTML is being used. The <html> element is the root of the document. The <head> contains metadata — information about the page that is not displayed. The <body> contains all visible content.

Browsers are forgiving — they can render malformed HTML without crashing. But writing well-formed, valid HTML is important for predictable rendering across browsers, accessibility for screen readers, and correct CSS targeting. Use the W3C Markup Validator to check your HTML.` },
    ],
  },

  "Elements & Tags": {
    sections: [
      { type: "text", content: `An HTML element is the basic unit of a web page. An element consists of:
• An opening tag: <tagname>
• Content: text, other elements, or both
• A closing tag: </tagname>

The tag name tells the browser what kind of element it is. Tags are case-insensitive, but lowercase is the standard convention.` },

      { type: "code", code: `<!-- A paragraph element -->
<p>This is the content of a paragraph element.</p>

<!-- A heading element -->
<h2>Section Title</h2>

<!-- An anchor element with an attribute -->
<a href="https://example.com">Visit Example</a>` },

      { type: "text", content: `Attributes provide additional information about an element. They are written inside the opening tag as name-value pairs: name="value". Boolean attributes (like disabled, required, checked) require no value — their presence alone activates them.

Common attributes that apply to almost every element:
• id — a unique identifier within the page (used by CSS and JavaScript)
• class — one or more space-separated class names (used by CSS)
• style — inline CSS styles (avoid where possible; use external CSS instead)
• title — a tooltip shown on hover
• lang — the language of the element's content
• tabindex — controls keyboard tab order
• hidden — hides the element (equivalent to display: none)` },

      { type: "code", code: `<!-- Attributes: id, class, and a data attribute -->
<section id="about" class="content-section" data-visible="true">
  <p class="lead-text">Content here.</p>
</section>

<!-- Boolean attributes need no value -->
<input type="checkbox" checked />
<button disabled>Cannot Click</button>
<input type="email" required />` },

      { type: "text", content: `Void elements have no content and no closing tag. They cannot contain child elements. The most common void elements are:

<br>    — line break
<hr>    — horizontal rule (thematic break)
<img>   — image
<input> — form input
<meta>  — metadata
<link>  — external resource (stylesheet, icon)
<area>  — image map area
<base>  — base URL for relative links

Elements are categorised as block-level or inline. Block-level elements (like <div>, <p>, <h1>–<h6>, <ul>, <li>) start on a new line and stretch to fill the available width. Inline elements (like <span>, <a>, <strong>, <em>, <img>) flow within the surrounding text and take only as much space as needed.

Note: CSS can override these defaults. Setting display: inline-block or display: flex on a block element changes its behaviour without changing its semantic meaning.` },

      { type: "code", code: `<!-- Block elements stack vertically -->
<div>First block</div>
<div>Second block</div>
<p>Third block — a paragraph</p>

<!-- Inline elements flow within text -->
<p>
  This is <strong>bold text</strong> and this is
  <a href="#">a link</a> inside a paragraph.
</p>

<!-- Nesting rules: block elements should not be inside inline elements -->
<!-- WRONG: -->
<a href="#"><div>A div inside a link</div></a>

<!-- CORRECT: anchor can be a block in HTML5 if it wraps flow content -->
<a href="#" style="display: block;">
  <div>This is valid in HTML5</div>
</a>` },
    ],
  },

  "Document Structure": {
    sections: [
      { type: "text", content: `Every HTML document follows a defined structure. Understanding this structure is fundamental to writing valid pages that render consistently across all browsers and devices.

The DOCTYPE declaration is not an HTML element — it is an instruction to the browser about which version of HTML to use. Without it, browsers may switch to "quirks mode", where they apply non-standard rendering rules for backward compatibility with very old pages.` },

      { type: "code", code: `<!DOCTYPE html>` },

      { type: "text", content: `The <html> element is the root element — every other element in the document is a descendant of it. The lang attribute declares the primary language of the document's content. This is used by screen readers to select the correct voice and pronunciation, and by search engines for language targeting. Use a valid BCP 47 language tag: "en" for English, "id" for Indonesian, "en-US" for American English.` },

      { type: "code", code: `<html lang="en">
  <!-- Everything goes here -->
</html>` },

      { type: "text", content: `The <head> element contains metadata — information about the document that is not displayed on the page. Required head elements for a complete, standards-compliant document:

<meta charset="UTF-8"> — declares the character encoding. UTF-8 supports every character from every language. Always include this as the very first element inside <head> to prevent mojibake (character encoding errors).

<meta name="viewport" content="width=device-width, initial-scale=1.0"> — controls how the browser scales the page on mobile devices. Without this, mobile browsers render the page at desktop width and scale it down, making text unreadably small.

<title> — the text shown in the browser tab and in search engine results. Required by HTML specification and important for SEO. Should be descriptive and unique per page: "About Us — Company Name", not just "About".

<link rel="stylesheet"> — links an external CSS file. The rel attribute specifies the relationship; "stylesheet" is the most common value.` },

      { type: "code", code: `<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="A concise page description for search engines — 150-160 characters." />
  <meta name="author" content="Your Name" />

  <title>Page Title — Site Name</title>

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="/favicon.png" />

  <!-- Stylesheets -->
  <link rel="stylesheet" href="/css/styles.css" />

  <!-- Preconnect to external domains for performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
</head>` },

      { type: "text", content: `The <body> element contains all content that is rendered in the browser window. Scripts should generally be placed at the end of the body (just before </body>) rather than in the <head>. This allows the browser to parse and render the HTML before downloading and executing JavaScript, improving perceived load speed.

The defer and async attributes on <script> tags allow scripts in <head> to load without blocking rendering. defer downloads the script in the background and executes it after parsing is complete. async downloads and executes immediately without waiting for parsing — useful for independent scripts like analytics.` },

      { type: "code", code: `<body>
  <header>
    <nav>Navigation here</nav>
  </header>

  <main>
    <h1>Main Content</h1>
    <p>Page content here.</p>
  </main>

  <footer>Footer here</footer>

  <!-- Scripts at the end of body -->
  <script src="/js/app.js"></script>
</body>` },
    ],
  },

  "Text Content": {
    sections: [
      { type: "text", content: `HTML provides a rich set of elements for marking up text. Choosing the correct element communicates not just visual appearance but semantic meaning — what the text represents, not just how it looks. Screen readers, search engines, and developer tools all use this semantic information.` },

      { type: "text", content: `Headings (<h1> through <h6>) define a hierarchical outline of the document. There should be exactly one <h1> per page, representing the main topic. Headings should not be skipped — do not jump from <h1> to <h3>. Use headings for document structure, not for visual styling. If you want large bold text that is not a heading, use CSS on a <p> or <span> instead.

<p> is the standard element for paragraphs of text. Browsers add default margin above and below paragraphs. Do not use empty <p> tags or <br> tags for spacing — use CSS margin and padding instead.` },

      { type: "code", code: `<h1>Introduction to CSS</h1>

<h2>The Box Model</h2>
<p>
  Every element in CSS is a rectangular box with four layers: content,
  padding, border, and margin. Understanding the box model is essential
  for controlling layout and spacing.
</p>

<h3>Content Area</h3>
<p>The content area contains the element's actual content — text, images, etc.</p>

<h3>Padding</h3>
<p>Padding is transparent space between the content and the border.</p>` },

      { type: "text", content: `Text-level semantics — use these to convey meaning, not style:

<strong> — important text (browsers render bold by default)
<em>     — emphasised text (browsers render italic by default)
<b>      — text that should be bold for stylistic reasons, without implying importance
<i>      — text in an alternate voice, technical terms, foreign phrases (not just italic)
<mark>   — highlighted/relevant text (like a search result highlight)
<small>  — side comments, disclaimers, copyright notices
<s>      — text that is no longer accurate (strikethrough)
<del>    — deleted text (used in changelogs or tracked changes)
<ins>    — inserted text
<code>   — inline code fragments
<kbd>    — keyboard input (e.g., Press <kbd>Ctrl</kbd>+<kbd>S</kbd>)
<samp>   — sample output from a computer program
<var>    — a variable in a mathematical or programming context
<abbr>   — abbreviation with a full expansion in the title attribute
<time>   — machine-readable date/time` },

      { type: "code", code: `<p>
  Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>I</kbd> to open DevTools.
</p>

<p>
  The <code>Array.prototype.map()</code> method creates a new array by
  calling a function on every element of the original array.
</p>

<p>
  <abbr title="HyperText Markup Language">HTML</abbr> was created by
  <strong>Tim Berners-Lee</strong> in <time datetime="1991">1991</time>.
</p>

<p>
  <mark>This result matches your search</mark> and this part does not.
</p>` },

      { type: "text", content: `Lists represent a collection of items. HTML provides three types:

<ul> (unordered list) — a list where order does not matter; rendered with bullet points by default. Use for navigation menus, feature lists, and collections without a meaningful sequence.

<ol> (ordered list) — a list where order matters; rendered with numbers by default. Use for steps in a process, rankings, or any sequence where position is significant. The type attribute changes the marker style (1, A, a, I, i). The start attribute sets the starting number. The reversed attribute counts down.

<li> — a list item; must be a direct child of <ul> or <ol>.

<dl> (description list) — a list of term-definition pairs. Use for glossaries, dictionaries, metadata displays, and Q&A content. <dt> is the term; <dd> is the definition.` },

      { type: "code", code: `<!-- Unordered list -->
<ul>
  <li>HTML — structure</li>
  <li>CSS — presentation</li>
  <li>JavaScript — behaviour</li>
</ul>

<!-- Ordered list with custom start -->
<ol start="3">
  <li>Third step: save the file</li>
  <li>Fourth step: open in browser</li>
</ol>

<!-- Description list -->
<dl>
  <dt>DOM</dt>
  <dd>Document Object Model — the browser's in-memory representation of the HTML document.</dd>

  <dt>CSSOM</dt>
  <dd>CSS Object Model — the browser's in-memory representation of CSS rules.</dd>
</dl>` },

      { type: "text", content: `For preformatted text and code blocks, use <pre> combined with <code>. The <pre> element preserves whitespace (spaces, tabs, and line breaks) exactly as written in the source. This is essential for displaying code where indentation is significant (Python, YAML) or for ASCII art.

Blockquotes (<blockquote>) mark a section quoted from another source. The cite attribute provides the URL of the source. For inline quotations, use <q>, which browsers automatically wrap in quotation marks appropriate for the document's language. Use <cite> for the title of a referenced work.` },

      { type: "code", code: `<!-- Code block -->
<pre><code>function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World")); // Hello, World!
</code></pre>

<!-- Blockquote with attribution -->
<figure>
  <blockquote cite="https://www.w3.org/standards/">
    <p>The mission of the W3C is to lead the Web to its full potential.</p>
  </blockquote>
  <figcaption>— <cite>W3C Mission Statement</cite></figcaption>
</figure>` },
    ],
  },

  "Links & Navigation": {
    sections: [
      { type: "text", content: `The anchor element <a> creates a hyperlink. The href (Hypertext Reference) attribute specifies the destination. The content of the anchor — text, image, or other elements — becomes the clickable area.

URL types:
• Absolute URLs include the full path: https://example.com/about
• Relative URLs are resolved relative to the current page: ../about, /contact, images/photo.jpg
• Fragment identifiers link to an element by ID on the same page: #section-2
• mailto: links open the user's email client: mailto:user@example.com
• tel: links on mobile devices initiate a phone call: tel:+1234567890
• javascript:void(0) — avoid this; use a <button> instead` },

      { type: "code", code: `<!-- Absolute URL -->
<a href="https://developer.mozilla.org/en-US/">MDN Web Docs</a>

<!-- Relative URL — goes up one directory then into /about -->
<a href="../about">About Us</a>

<!-- Fragment identifier — jumps to element with id="features" -->
<a href="#features">Jump to Features</a>

<!-- Email link -->
<a href="mailto:contact@example.com?subject=Hello">Send Email</a>

<!-- Phone link -->
<a href="tel:+628123456789">Call Us</a>

<!-- Download attribute — prompts download instead of navigation -->
<a href="/files/report.pdf" download="annual-report.pdf">
  Download Report (PDF)
</a>` },

      { type: "text", content: `The target attribute controls where the linked document opens:
• target="_self" (default) — same frame/tab
• target="_blank" — new tab or window
• target="_parent" — parent frame
• target="_top" — full body of the window (exits frames)

When using target="_blank", always add rel="noopener noreferrer". Without rel="noopener", the opened page can access the opener's window object via window.opener, which is a security vulnerability (reverse tabnapping). rel="noreferrer" additionally prevents passing the HTTP Referer header.` },

      { type: "code", code: `<!-- Secure external link opening in new tab -->
<a
  href="https://example.com"
  target="_blank"
  rel="noopener noreferrer"
>
  External Site
</a>` },

      { type: "text", content: `Use the <nav> element to wrap the primary navigation of the page. A page can have multiple <nav> elements (main navigation, breadcrumbs, pagination). Screen readers identify <nav> elements and allow users to jump directly to navigation landmarks.

Navigation links are typically implemented as an unordered list inside <nav>. The active/current page link should be marked with aria-current="page" for screen reader users.` },

      { type: "code", code: `<nav aria-label="Main navigation">
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/services">Services</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>

<!-- Breadcrumb navigation -->
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li><span aria-current="page">Product Name</span></li>
  </ol>
</nav>` },

      { type: "text", content: `Skip links are anchor links that allow keyboard users to jump past repeated navigation content (menus, headers) directly to the main content. They are typically the first focusable element on the page and are visually hidden until focused. They are required for WCAG 2.1 Level A accessibility compliance.` },

      { type: "code", code: `<!-- First element in <body> — visually hidden, visible on focus -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<header>
  <nav><!-- Long navigation menu --></nav>
</header>

<main id="main-content">
  <h1>Page Content</h1>
</main>

<!-- CSS for skip link -->
<style>
.skip-link {
  position: absolute;
  transform: translateY(-100%);
  background: #000;
  color: #fff;
  padding: 8px 16px;
}
.skip-link:focus {
  transform: translateY(0);
}
</style>` },
    ],
  },

  "Images & Media": {
    sections: [
      { type: "text", content: `The <img> element embeds an image. It is a void element — it has no closing tag and no content. The two required attributes are src (the image URL) and alt (alternative text).

The alt attribute serves multiple purposes: it is displayed if the image fails to load, read aloud by screen readers, indexed by search engines, and shown in browsers with images disabled. Write descriptive alt text that conveys the purpose or content of the image. If an image is purely decorative and adds no information, use alt="" (empty alt attribute) so screen readers skip it — do not omit the attribute entirely.` },

      { type: "code", code: `<!-- Informative image — describe what it shows -->
<img
  src="/images/diagram.png"
  alt="Diagram showing the three layers of the web: HTML, CSS, and JavaScript"
  width="800"
  height="450"
/>

<!-- Decorative image — empty alt so screen readers skip it -->
<img src="/images/divider.png" alt="" width="100" height="4" />

<!-- Image with dimensions prevents layout shift (CLS) -->
<img
  src="/images/hero.jpg"
  alt="A developer working at a standing desk"
  width="1200"
  height="630"
  loading="lazy"
/>` },

      { type: "text", content: `Always specify width and height attributes on images. This allows the browser to reserve the correct space before the image loads, preventing layout shift (Cumulative Layout Shift — a Core Web Vital metric). The values should match the intrinsic dimensions of the image in pixels.

The loading="lazy" attribute defers loading of off-screen images until the user scrolls near them, improving initial page load performance. Use loading="eager" (or omit the attribute) for images that are immediately visible on page load (above the fold).

The decoding="async" attribute hints to the browser that the image can be decoded asynchronously, freeing the main thread for other tasks.` },

      { type: "text", content: `The <picture> element enables art direction and responsive images — serving different images based on screen size, resolution, or other conditions. It contains one or more <source> elements and exactly one <img> element as a fallback.

The srcset attribute on <img> provides a list of image candidates at different sizes. The browser selects the most appropriate one based on the device's screen density and width. The sizes attribute tells the browser how wide the image will be displayed at different viewport widths, helping it calculate which source to download.` },

      { type: "code", code: `<!-- Responsive image with srcset -->
<img
  src="/images/photo-800.jpg"
  srcset="
    /images/photo-400.jpg  400w,
    /images/photo-800.jpg  800w,
    /images/photo-1600.jpg 1600w
  "
  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 800px"
  alt="Mountain landscape at sunrise"
  width="800"
  height="533"
/>

<!-- Art direction with <picture> — different image for mobile vs desktop -->
<picture>
  <source
    media="(max-width: 600px)"
    srcset="/images/hero-mobile.jpg"
  />
  <source
    media="(max-width: 1200px)"
    srcset="/images/hero-tablet.jpg"
  />
  <img
    src="/images/hero-desktop.jpg"
    alt="Office team collaborating"
    width="1200"
    height="600"
  />
</picture>` },

      { type: "text", content: `Use <figure> and <figcaption> to associate a caption with an image, diagram, code listing, or other self-contained content. <figure> represents self-contained content that can be moved elsewhere in the document without affecting the flow. <figcaption> provides a caption for the figure and must be the first or last child of <figure>.` },

      { type: "code", code: `<figure>
  <img
    src="/images/box-model.svg"
    alt="The CSS box model: content, padding, border, and margin layers"
    width="600"
    height="400"
  />
  <figcaption>
    Figure 1: The CSS Box Model — every element is composed of four
    concentric rectangular areas.
  </figcaption>
</figure>` },

      { type: "text", content: `HTML5 introduced native <video> and <audio> elements, eliminating the need for Flash or other plugins. Both support multiple source formats for cross-browser compatibility. Important attributes:

controls — displays the browser's built-in player controls
autoplay — starts playing immediately (use with caution; autoplay with sound is blocked by most browsers)
muted — mutes audio (required for autoplay in most browsers)
loop — plays continuously
preload — "none", "metadata", or "auto" — controls how much data the browser loads before the user initiates playback` },

      { type: "code", code: `<!-- Video with multiple formats and a poster image -->
<video
  controls
  width="1280"
  height="720"
  poster="/images/video-thumbnail.jpg"
  preload="metadata"
>
  <source src="/video/intro.webm" type="video/webm" />
  <source src="/video/intro.mp4" type="video/mp4" />
  <p>
    Your browser does not support the video element.
    <a href="/video/intro.mp4">Download the video</a> instead.
  </p>
</video>

<!-- Audio with multiple formats -->
<audio controls preload="none">
  <source src="/audio/podcast.ogg" type="audio/ogg" />
  <source src="/audio/podcast.mp3" type="audio/mpeg" />
  Your browser does not support the audio element.
</audio>` },
    ],
  },

  "Forms": {
    sections: [
      { type: "text", content: `HTML forms are the primary mechanism for collecting user input on the web. A form submits data to a server (or processes it with JavaScript) when the user triggers a submission.

The <form> element wraps all form controls. Key attributes:
• action — the URL to which the form data is submitted. If omitted, the form submits to the current page's URL.
• method — the HTTP method: "get" (data appended to URL, suitable for searches and filters) or "post" (data sent in request body, required for sensitive data or file uploads).
• enctype — encoding type for form data. Use "multipart/form-data" when the form includes file uploads.
• novalidate — disables browser's built-in validation (useful when implementing custom validation).` },

      { type: "code", code: `<form action="/api/subscribe" method="post">
  <!-- Form controls go here -->
  <button type="submit">Subscribe</button>
</form>

<!-- Search form using GET (submits to /search?q=...) -->
<form action="/search" method="get" role="search">
  <label for="search-input">Search</label>
  <input
    type="search"
    id="search-input"
    name="q"
    placeholder="Search articles..."
    autocomplete="off"
  />
  <button type="submit">Search</button>
</form>` },

      { type: "text", content: `The <label> element is critical for accessibility. It provides a text description for a form control and increases the clickable area (clicking the label focuses the input). Always associate a label with its control using one of two methods:

1. Explicit association — the label's for attribute matches the control's id attribute.
2. Implicit association — wrap the control inside the label element.

Never use placeholder text as a replacement for labels. Placeholder text disappears when the user starts typing, making it impossible to recall the field's purpose mid-form.` },

      { type: "code", code: `<!-- Explicit label association (recommended) -->
<label for="email">Email address</label>
<input type="email" id="email" name="email" required />

<!-- Implicit label association -->
<label>
  Password
  <input type="password" name="password" minlength="8" required />
</label>

<!-- WRONG: placeholder as substitute for label -->
<input type="text" placeholder="Enter your name" />

<!-- CORRECT: label plus optional placeholder hint -->
<label for="name">Full name</label>
<input
  type="text"
  id="name"
  name="name"
  placeholder="e.g. John Smith"
  autocomplete="name"
  required
/>` },

      { type: "text", content: `The <input> element is the most versatile form control. Its type attribute determines the interface and built-in validation:

text        — single-line text (default)
email       — email address (validates format)
password    — masked text input
number      — numeric input with up/down controls; use min, max, step attributes
range       — slider control
checkbox    — boolean toggle (checked/unchecked)
radio       — one selection from a group (all radios with the same name form a group)
date        — date picker
datetime-local — date and time picker
file        — file upload control
search      — search field
tel         — telephone number (no validation, but enables phone keyboard on mobile)
url         — URL input (validates format)
color       — color picker
hidden      — hidden data submitted with the form (not visible to user)
submit      — submits the form
reset       — resets all fields to default values
button      — generic button (use <button> element instead for better flexibility)` },

      { type: "code", code: `<!-- Text inputs -->
<input type="text" name="username" minlength="3" maxlength="20" pattern="[a-z0-9_]+" />
<input type="email" name="email" autocomplete="email" />
<input type="password" name="password" minlength="8" autocomplete="new-password" />

<!-- Number with constraints -->
<input type="number" name="quantity" min="1" max="100" step="1" value="1" />

<!-- Checkbox group -->
<fieldset>
  <legend>Interests</legend>
  <label><input type="checkbox" name="interests" value="css" /> CSS</label>
  <label><input type="checkbox" name="interests" value="js" /> JavaScript</label>
  <label><input type="checkbox" name="interests" value="html" checked /> HTML</label>
</fieldset>

<!-- Radio group — same name attribute groups them -->
<fieldset>
  <legend>Experience level</legend>
  <label><input type="radio" name="level" value="beginner" /> Beginner</label>
  <label><input type="radio" name="level" value="intermediate" /> Intermediate</label>
  <label><input type="radio" name="level" value="advanced" /> Advanced</label>
</fieldset>

<!-- File upload -->
<input type="file" name="avatar" accept="image/png, image/jpeg" multiple />` },

      { type: "text", content: `The <textarea> element creates a multi-line text input. Unlike <input>, it has a closing tag and its default value is placed between the tags (not in a value attribute). The rows and cols attributes set its initial dimensions, but CSS should be used for precise sizing. Set resize: none or resize: vertical in CSS to control whether users can resize it.

The <select> element creates a dropdown menu. Each option is an <option> element. The value attribute on each option is what gets submitted; the text content is what the user sees. Group related options with <optgroup>. The multiple attribute allows multi-selection (hold Ctrl/Cmd to select multiple). The size attribute shows multiple options as a list box.

The <button> element should be preferred over <input type="submit"> and <input type="button"> because it can contain HTML content (icons, formatting). Its type attribute defaults to "submit" inside a form — always specify type="button" for buttons that should not submit the form.` },

      { type: "code", code: `<!-- Textarea -->
<label for="message">Message</label>
<textarea
  id="message"
  name="message"
  rows="5"
  maxlength="500"
  placeholder="Describe your question in detail..."
></textarea>

<!-- Select with option groups -->
<label for="country">Country</label>
<select id="country" name="country" required>
  <option value="">Select your country...</option>
  <optgroup label="Southeast Asia">
    <option value="ID">Indonesia</option>
    <option value="MY">Malaysia</option>
    <option value="SG">Singapore</option>
  </optgroup>
  <optgroup label="East Asia">
    <option value="JP">Japan</option>
    <option value="KR">South Korea</option>
  </optgroup>
</select>

<!-- Buttons inside a form -->
<button type="submit">Create Account</button>
<button type="reset">Clear Form</button>
<button type="button" onclick="saveDraft()">Save Draft</button>` },

      { type: "text", content: `HTML5 provides built-in form validation without JavaScript. Validation attributes:
• required — the field must not be empty before submission
• minlength / maxlength — minimum/maximum character count for text inputs
• min / max — minimum/maximum value for numeric, date, and range inputs
• pattern — a regular expression the value must match
• type — the correct type attribute provides format validation (email, url, number)

The browser prevents form submission if any field fails validation and displays error messages (styled differently per browser/OS). Use the :valid, :invalid, and :required CSS pseudo-classes to style inputs based on their validation state.

Use <fieldset> to group related controls and <legend> to label the group. This is especially important for radio button and checkbox groups where individual labels may not be sufficient context.` },

      { type: "code", code: `<form action="/register" method="post" novalidate>
  <fieldset>
    <legend>Account Details</legend>

    <div class="field">
      <label for="reg-email">Email <span aria-hidden="true">*</span></label>
      <input
        type="email"
        id="reg-email"
        name="email"
        autocomplete="email"
        required
      />
    </div>

    <div class="field">
      <label for="reg-password">Password <span aria-hidden="true">*</span></label>
      <input
        type="password"
        id="reg-password"
        name="password"
        minlength="8"
        autocomplete="new-password"
        required
      />
      <p class="hint">Minimum 8 characters.</p>
    </div>

    <div class="field">
      <label for="reg-username">Username</label>
      <input
        type="text"
        id="reg-username"
        name="username"
        pattern="[a-z0-9_]{3,20}"
        title="3–20 characters: lowercase letters, numbers, and underscores only"
        autocomplete="username"
      />
    </div>
  </fieldset>

  <button type="submit">Create Account</button>
</form>` },
    ],
  },

  "Semantic HTML": {
    sections: [
      { type: "text", content: `Semantic HTML means using elements that accurately describe the meaning of the content they contain, rather than using generic containers like <div> and <span> for everything. The choice of element communicates intent — to browsers, search engines, assistive technologies, and other developers.

Before HTML5, page structure was almost entirely built with <div> elements given class names like "header", "nav", "footer". HTML5 introduced landmark elements that bake this structural meaning directly into the markup. The browser's accessibility tree, search engine crawlers, and reader-mode parsers all understand these elements without relying on class names or ARIA roles.

Semantic HTML provides three concrete benefits:
1. Accessibility — screen readers announce landmark regions and allow users to navigate between them directly.
2. SEO — search engines weight content based on its context. Content inside <article> or <main> is weighted more heavily than content inside an anonymous <div>.
3. Maintainability — semantic markup is self-documenting. A new developer reading the code immediately understands the page's structure without reading CSS class names.` },

      { type: "text", content: `The primary HTML5 landmark elements and their correct usage:

<header> — introductory content for its parent element. As a direct child of <body>, it is the page header (logo, site name, primary navigation). As a child of <article> or <section>, it is the header for that section. A page can have multiple <header> elements.

<nav> — a set of navigation links. Not every group of links needs to be in <nav> — only major navigation blocks (primary navigation, table of contents, pagination). Label multiple <nav> elements with aria-label to distinguish them.

<main> — the dominant content of the page, directly related to the page's central topic. There must be exactly one <main> per page, and it should not be nested inside <article>, <aside>, <header>, <footer>, or <nav>. Screen readers can jump directly to <main>.

<article> — a self-contained, independently distributable unit of content. Ask: "Would this make sense if syndicated via RSS or extracted from this page?" If yes, use <article>. Examples: blog post, news article, forum post, product card, comment.

<section> — a thematic grouping of content with a heading. Use <section> when content represents a distinct chapter or theme of the page. Unlike <article>, a <section> is not independently meaningful outside its parent. Always include a heading inside <section>.

<aside> — content tangentially related to the main content. Examples: pull quotes, sidebars, author bios, related articles, advertising blocks.

<footer> — closing content for its parent. As a body child, it is the site footer (copyright, links, contact info). As an article/section child, it is the footer for that piece of content (author info, tags, publication date).` },

      { type: "code", code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Article Title — Blog Name</title>
</head>
<body>
  <header>
    <a href="/" aria-label="Blog Name — Home">
      <img src="/logo.svg" alt="Blog Name" width="120" height="40" />
    </a>
    <nav aria-label="Primary navigation">
      <ul>
        <li><a href="/" aria-current="page">Home</a></li>
        <li><a href="/articles">Articles</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <article>
      <header>
        <h1>Understanding the CSS Box Model</h1>
        <p>
          Published by <a href="/authors/jane">Jane Smith</a> on
          <time datetime="2024-03-15">March 15, 2024</time>
        </p>
      </header>

      <section>
        <h2>What is the Box Model?</h2>
        <p>Every element in CSS is represented as a rectangular box...</p>
      </section>

      <section>
        <h2>The Four Layers</h2>
        <p>Content, padding, border, and margin...</p>
      </section>

      <footer>
        <p>Tags: <a href="/tags/css">CSS</a>, <a href="/tags/layout">Layout</a></p>
      </footer>
    </article>

    <aside aria-label="Related articles">
      <h2>Related</h2>
      <ul>
        <li><a href="/flexbox">Mastering Flexbox</a></li>
        <li><a href="/grid">CSS Grid Reference</a></li>
      </ul>
    </aside>
  </main>

  <footer>
    <p>&copy; 2024 Blog Name. All rights reserved.</p>
    <nav aria-label="Footer navigation">
      <a href="/privacy">Privacy Policy</a>
      <a href="/terms">Terms of Service</a>
    </nav>
  </footer>
</body>
</html>` },

      { type: "text", content: `When to use <div> and <span>: Use <div> when no other element is semantically appropriate and you need a block container purely for styling or JavaScript purposes. Use <span> for the inline equivalent. They carry no meaning — they are generic containers. The rule of thumb: if a semantic element fits the content, use it. If you cannot find an appropriate semantic element, use <div> or <span>.

Headings inside semantic elements: every <section> and <article> should have a heading. This creates a logical document outline that screen readers and search engines can navigate.

ARIA roles as a fallback: WAI-ARIA (Web Accessibility Initiative — Accessible Rich Internet Applications) provides attributes like role, aria-label, aria-labelledby, and aria-describedby. For landmark elements, the browser automatically maps semantic HTML to ARIA roles (<nav> → role="navigation", <main> → role="main"). Only add explicit ARIA roles when no semantic HTML equivalent exists — HTML semantics are always preferred.` },

      { type: "code", code: `<!-- The <div> fallback when no semantic element fits -->
<div class="card-grid">
  <article class="card">
    <h2>Card Title</h2>
    <p>Card content.</p>
  </article>
</div>

<!-- ARIA only when needed — this tab panel has no HTML5 equivalent -->
<div role="tabpanel" aria-labelledby="tab-1" id="panel-1">
  <p>Tab panel content.</p>
</div>

<!-- Correct heading hierarchy in a document -->
<main>
  <h1>Main Page Topic</h1>           <!-- One h1 per page -->

  <section>
    <h2>First Major Section</h2>
    <section>
      <h3>Subsection of First</h3>
    </section>
  </section>

  <section>
    <h2>Second Major Section</h2>
    <h3>Subsection of Second</h3>
  </section>
</main>` },
    ],
  },
};

// ─── Run update ───────────────────────────────────────────────────────────────

async function main() {
  const book = await prisma.book.findUnique({
    where: { slug: "html" },
    include: { chapters: { orderBy: { order: "asc" } } },
  });

  if (!book) {
    console.error("HTML book not found — check slug.");
    process.exit(1);
  }

  console.log(`\nUpdating ${book.chapters.length} chapters for "${book.title}"...`);

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
        sections: data.sections as object[],
        // keep content field as concatenated text for any legacy fallback
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

    const textBlocks = data.sections.filter((s) => s.type === "text").length;
    const codeBlocks = data.sections.filter((s) => s.type === "code").length;
    console.log(`  ✅  "${ch.title}" — ${textBlocks} text, ${codeBlocks} code blocks`);
    updated++;
  }

  console.log(`\nDone — updated ${updated} chapters.\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
