import type { CodeLanguage } from "@/types/content";

export type TokenType =
  | "tag" | "attr" | "value" | "comment" | "plain" | "selector" | "prop"
  | "keyword" | "string" | "number" | "operator" | "fn";

export interface Token { type: TokenType; text: string }

export const tokenColor: Record<TokenType, string> = {
  // HTML / CSS
  tag:      "text-rpg-red",
  attr:     "text-rpg-cyan",
  value:    "text-rpg-gold",
  comment:  "text-rpg-dim",
  plain:    "text-rpg-text",
  selector: "text-rpg-cyan",
  prop:     "text-rpg-purple",
  // JavaScript
  keyword:  "text-rpg-purple",
  string:   "text-rpg-gold",
  number:   "text-rpg-green",
  operator: "text-rpg-cyan",
  fn:       "text-rpg-red",
};

// ─── HTML ─────────────────────────────────────────────────────────────────────

function tokenizeHTMLLine(line: string): Token[] {
  const trimmed = line.trimStart();
  if (trimmed.startsWith("<!--")) return [{ type: "comment", text: line }];

  const tokens: Token[] = [];
  const tagRe = /(<\/?\w[\w.-]*)([^>]*)(\/?>)/g;
  let last = 0;

  for (const m of line.matchAll(tagRe)) {
    const idx = m.index ?? 0;
    if (idx > last) tokens.push({ type: "plain", text: line.slice(last, idx) });
    tokens.push({ type: "tag", text: m[1] });

    const attrStr = m[2];
    const attrRe = /(\s+[\w:-]+)(=)("(?:[^"]*)")/g;
    let ai = 0;
    for (const am of attrStr.matchAll(attrRe)) {
      const ai2 = am.index ?? 0;
      if (ai2 > ai) tokens.push({ type: "tag", text: attrStr.slice(ai, ai2) });
      tokens.push({ type: "attr",  text: am[1] });
      tokens.push({ type: "plain", text: am[2] });
      tokens.push({ type: "value", text: am[3] });
      ai = ai2 + am[0].length;
    }
    if (ai < attrStr.length) tokens.push({ type: "tag", text: attrStr.slice(ai) });
    tokens.push({ type: "tag", text: m[3] });
    last = idx + m[0].length;
  }

  if (last < line.length) tokens.push({ type: "plain", text: line.slice(last) });
  return tokens.length ? tokens : [{ type: "plain", text: line }];
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

function tokenizeCSSLine(line: string): Token[] {
  const trimmed = line.trimStart();
  if (trimmed.startsWith("/*")) return [{ type: "comment", text: line }];

  const propMatch = line.match(/^(\s*)([\w-]+)(\s*:\s*)([^;{]+)(;?.*)$/);
  if (propMatch && !line.includes("{")) {
    return [
      { type: "plain",    text: propMatch[1] },
      { type: "prop",     text: propMatch[2] },
      { type: "plain",    text: propMatch[3] },
      { type: "value",    text: propMatch[4] },
      { type: "plain",    text: propMatch[5] },
    ];
  }

  if (line.includes("{")) {
    const [sel, rest] = line.split("{");
    return [{ type: "selector", text: sel }, { type: "plain", text: `{${rest ?? ""}` }];
  }

  return [{ type: "plain", text: line }];
}

// ─── JavaScript ───────────────────────────────────────────────────────────────

const JS_KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "do", "break", "continue", "new", "class", "import", "export", "default",
  "typeof", "instanceof", "in", "of", "true", "false", "null", "undefined",
  "this", "throw", "try", "catch", "finally", "switch", "case", "from",
  "async", "await", "static", "extends", "delete", "void", "yield",
]);

function tokenizeJSLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    // Line comment
    if (line[i] === "/" && line[i + 1] === "/") {
      tokens.push({ type: "comment", text: line.slice(i) });
      break;
    }

    // Template literal, single-quote, double-quote string
    if (line[i] === '"' || line[i] === "'" || line[i] === "`") {
      const quote = line[i];
      let j = i + 1;
      while (j < line.length && line[j] !== quote) {
        if (line[j] === "\\") j++;
        j++;
      }
      j++;
      tokens.push({ type: "string", text: line.slice(i, j) });
      i = j;
      continue;
    }

    // Numbers
    if (/\d/.test(line[i]) || (line[i] === "." && /\d/.test(line[i + 1] ?? ""))) {
      let j = i;
      while (j < line.length && /[\d.xXa-fA-FoObBnN_]/.test(line[j])) j++;
      tokens.push({ type: "number", text: line.slice(i, j) });
      i = j;
      continue;
    }

    // Identifiers, keywords, function names
    if (/[A-Za-z_$]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[A-Za-z0-9_$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      const isCall = /^\s*\(/.test(line.slice(j));

      if (JS_KEYWORDS.has(word)) {
        tokens.push({ type: "keyword", text: word });
      } else if (isCall) {
        tokens.push({ type: "fn", text: word });
      } else {
        tokens.push({ type: "plain", text: word });
      }
      i = j;
      continue;
    }

    // Operators (multi-char aware)
    if (/[=+\-*/%&|!<>?:.^~]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[=+\-*/%&|!<>?:.^~]/.test(line[j])) j++;
      tokens.push({ type: "operator", text: line.slice(i, j) });
      i = j;
      continue;
    }

    // Everything else (brackets, spaces, punctuation)
    tokens.push({ type: "plain", text: line[i] });
    i++;
  }

  return tokens.length ? tokens : [{ type: "plain", text: line }];
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function tokenize(code: string, lang: CodeLanguage): Token[][] {
  return code.split("\n").map(line => {
    if (lang === "css") return tokenizeCSSLine(line);
    if (lang === "js")  return tokenizeJSLine(line);
    return tokenizeHTMLLine(line);
  });
}
