import type { Highlighter, ThemedToken } from "shiki";

// ─── RPG colour palette ───────────────────────────────────────────────────────

const BG   = "#0d0b20";
const FG   = "#e8e8f0";
const DIM  = "#7a7ab0";
const CYAN = "#40d0e0";
const GOLD = "#f0c040";
const GRN  = "#40e070";
const PURP = "#c060e0";
const RED  = "#e05050";
const MUTE = "#b4b4df";

// ─── TextMate theme ───────────────────────────────────────────────────────────

const RPG_THEME = {
  name: "devstiny-rpg",
  type: "dark" as const,
  colors: {
    "editor.background":              BG,
    "editor.foreground":              FG,
    "editorLineNumber.foreground":    "#3d3d6a",
    "editorLineNumber.activeForeground": MUTE,
  },
  tokenColors: [
    // ── Comments ──────────────────────────────────────────────────────────
    { scope: ["comment", "comment.block", "comment.line", "punctuation.definition.comment"],
      settings: { foreground: DIM, fontStyle: "italic" } },

    // ── Strings ───────────────────────────────────────────────────────────
    { scope: ["string", "string.quoted", "string.template", "string.regexp",
               "punctuation.definition.string"],
      settings: { foreground: GRN } },

    // ── Numbers ───────────────────────────────────────────────────────────
    { scope: ["constant.numeric", "constant.numeric.integer", "constant.numeric.float",
               "constant.numeric.hex", "constant.numeric.binary", "constant.numeric.octal"],
      settings: { foreground: GRN } },

    // ── Constants (true/false/null/undefined) ──────────────────────────────
    { scope: ["constant.language", "constant.language.boolean",
               "constant.language.null", "constant.language.undefined"],
      settings: { foreground: PURP, fontStyle: "italic" } },

    // ── Keywords ──────────────────────────────────────────────────────────
    { scope: ["keyword", "keyword.control", "keyword.control.flow",
               "keyword.control.import", "keyword.control.export",
               "keyword.operator.new", "keyword.operator.typeof",
               "keyword.operator.instanceof", "keyword.operator.void",
               "keyword.operator.delete", "keyword.operator.in", "keyword.operator.of",
               "storage", "storage.type", "storage.modifier"],
      settings: { foreground: PURP } },

    // ── Operators ─────────────────────────────────────────────────────────
    { scope: ["keyword.operator", "keyword.operator.arithmetic",
               "keyword.operator.assignment", "keyword.operator.comparison",
               "keyword.operator.logical", "keyword.operator.bitwise",
               "keyword.operator.ternary", "keyword.operator.spread",
               "keyword.operator.rest", "punctuation.accessor"],
      settings: { foreground: RED } },

    // ── Functions ─────────────────────────────────────────────────────────
    { scope: ["entity.name.function", "meta.function-call", "meta.function-call.generic",
               "support.function", "support.function.builtin"],
      settings: { foreground: CYAN } },

    // ── Class / Type names ────────────────────────────────────────────────
    { scope: ["entity.name.class", "entity.name.type", "entity.name.namespace",
               "entity.name.enum", "entity.name.interface", "entity.name.trait",
               "support.class", "support.type"],
      settings: { foreground: CYAN } },

    // ── Variables ─────────────────────────────────────────────────────────
    { scope: ["variable", "variable.other", "variable.other.readwrite",
               "variable.other.property"],
      settings: { foreground: FG } },
    { scope: ["variable.other.constant"],
      settings: { foreground: GOLD } },
    { scope: ["variable.parameter"],
      settings: { foreground: GOLD, fontStyle: "italic" } },
    { scope: ["variable.language.this", "variable.language.self", "variable.language.super"],
      settings: { foreground: PURP, fontStyle: "italic" } },

    // ── Decorators / Annotations ──────────────────────────────────────────
    { scope: ["meta.decorator", "punctuation.decorator", "entity.name.function.decorator"],
      settings: { foreground: GOLD } },

    // ── Punctuation ───────────────────────────────────────────────────────
    { scope: ["punctuation", "punctuation.separator", "punctuation.terminator",
               "punctuation.section", "meta.brace", "punctuation.brackets"],
      settings: { foreground: MUTE } },

    // ── HTML ──────────────────────────────────────────────────────────────
    { scope: ["entity.name.tag", "entity.name.tag.html",
               "meta.tag punctuation.definition.tag"],
      settings: { foreground: CYAN } },
    { scope: ["entity.other.attribute-name", "entity.other.attribute-name.html"],
      settings: { foreground: GOLD } },
    { scope: ["string.quoted.double.html", "string.quoted.single.html",
               "meta.attribute-with-value string"],
      settings: { foreground: GRN } },
    { scope: ["meta.tag punctuation.definition.tag"],
      settings: { foreground: MUTE } },

    // ── CSS ───────────────────────────────────────────────────────────────
    { scope: ["entity.name.tag.css", "entity.other.attribute-name.class.css",
               "entity.other.attribute-name.id.css", "entity.other.attribute-name.pseudo-class.css",
               "entity.other.attribute-name.pseudo-element.css",
               "entity.other.attribute-name.css"],
      settings: { foreground: CYAN } },
    { scope: ["support.type.property-name.css", "meta.property-name.css",
               "support.type.property-name", "source.css entity.other.attribute-name"],
      settings: { foreground: PURP } },
    { scope: ["meta.property-value.css", "support.constant.property-value.css",
               "support.constant.font-name.css", "support.constant.media.css",
               "support.constant.color.w3c-standard-color-name.css",
               "support.constant.color.w3c-extended-color-name.css",
               "keyword.other.unit.css", "keyword.other.unit",
               "meta.property-value support.constant"],
      settings: { foreground: GOLD } },
    { scope: ["constant.numeric.css", "constant.other.color.rgb-value.css",
               "constant.numeric", "meta.property-value constant.numeric"],
      settings: { foreground: GRN } },
    { scope: ["support.constant.color", "constant.other.color"],
      settings: { foreground: GRN } },
    { scope: ["keyword.other.important.css"],
      settings: { foreground: RED, fontStyle: "bold" } },

    // ── JSON / YAML keys ──────────────────────────────────────────────────
    { scope: ["support.type.property-name.json", "string.quoted.double.json"],
      settings: { foreground: CYAN } },
    { scope: ["constant.language.json"],
      settings: { foreground: PURP, fontStyle: "italic" } },
    { scope: ["constant.numeric.json"],
      settings: { foreground: GRN } },

    // ── Bash / Shell ──────────────────────────────────────────────────────
    { scope: ["support.function.builtin.bash", "entity.name.function.bash"],
      settings: { foreground: CYAN } },
    { scope: ["constant.character.escape", "constant.character.escape.bash"],
      settings: { foreground: RED } },
  ],
};

// ─── Singleton (module-level, shared across all CodeBlock instances) ───────────

let _h: Highlighter | null = null;
let _pending: Promise<Highlighter> | null = null;

const LANGS = [
  "html", "css", "javascript", "typescript",
  "json", "bash", "shell", "python", "text",
];

const LANG_ALIAS: Record<string, string> = {
  js: "javascript", ts: "typescript", sh: "bash", py: "python",
};

export async function getHighlighter(): Promise<Highlighter> {
  if (_h) return _h;
  if (_pending) return _pending;
  _pending = import("shiki").then(async ({ createHighlighter }) => {
    _h = await createHighlighter({ themes: [RPG_THEME], langs: LANGS });
    return _h;
  });
  return _pending;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface LineTokens { tokens: ThemedToken[]; }

export async function getTokenLines(
  code: string,
  lang: string,
): Promise<LineTokens[]> {
  const h   = await getHighlighter();
  const key = LANG_ALIAS[lang] ?? lang;

  try {
    if (!h.getLoadedLanguages().includes(key as never)) {
      await h.loadLanguage(key as never);
    }
  } catch { /* unsupported lang — fall through to text */ }

  const safeKey = h.getLoadedLanguages().includes(key as never) ? key : "text";

  const { tokens } = h.codeToTokens(code, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lang:  safeKey as any,
    theme: "devstiny-rpg",
  });

  return tokens.map((line) => ({ tokens: line }));
}

export const BG_COLOR = BG;
