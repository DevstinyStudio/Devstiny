"use client";

import { useEffect, useState } from "react";
import { getTokenLines, BG_COLOR, type LineTokens } from "@/lib/shiki-highlight";

const LABEL: Record<string, string> = {
  html: "HTML", css: "CSS", javascript: "JS", js: "JS",
  typescript: "TS", ts: "TS", json: "JSON",
  bash: "BASH", shell: "BASH", sh: "BASH",
  python: "PY", text: "TEXT",
};

const INDENT = 2; // spaces per indent level
const PL     = "1.25rem"; // matches pl-5 (Tailwind: 5 * 0.25rem)

function countLeadingSpaces(raw: string): number {
  let n = 0;
  for (const ch of raw) {
    if (ch === " ") n++;
    else if (ch === "\t") n += INDENT;
    else break;
  }
  return n;
}

export default function CodeBlock({
  code,
  lang = "javascript",
  tabLabel,
}: {
  code: string;
  lang?: string;
  tabLabel?: string;
}) {
  const [lines, setLines] = useState<LineTokens[] | null>(null);

  useEffect(() => {
    let active = true;
    getTokenLines(code, lang).then((tl) => {
      if (active) setLines(tl);
    }).catch(() => {});
    return () => { active = false; };
  }, [code, lang]);

  const label    = tabLabel ?? LABEL[lang] ?? lang.toUpperCase();
  const rawLines = code.split("\n");
  const numW     = String(rawLines.length).length;

  return (
    <div className="flex flex-col font-mono text-sm my-1">
      {/* Tab label */}
      <div
        className="self-start px-3 py-1 bg-rpg-panel border-2 border-b-0 border-rpg-gold"
        style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#f0c040", letterSpacing: "0.1em" }}
      >
        {label}
      </div>

      {/* Code body */}
      <div
        className="overflow-x-auto"
        style={{ background: BG_COLOR, border: "3px solid #f0c040", boxShadow: "4px 4px 0 #000" }}
      >
        <table className="border-collapse" style={{ minWidth: "100%" }}>
          <tbody>
            {rawLines.map((raw, i) => {
              const tokLine     = lines?.[i];
              const indentLevel = Math.floor(countLeadingSpaces(raw) / INDENT);

              return (
                <tr key={i} className="group hover:bg-white/3 transition-colors">
                  {/* Line number */}
                  <td
                    className="select-none text-right pr-4 pl-3 align-top border-r border-rpg-border/40"
                    style={{ color: "#3d3d6a", lineHeight: "1.75rem", minWidth: `${numW + 1.5}ch`,
                             fontSize: "0.8125rem", paddingTop: 1, paddingBottom: 1 }}
                  >
                    {i + 1}
                  </td>

                  {/* Tokens + indent guides */}
                  <td
                    className="pl-5 pr-4 align-top"
                    style={{ lineHeight: "1.75rem", paddingTop: 1, paddingBottom: 1,
                             color: "#e8e8f0", position: "relative", whiteSpace: "pre" }}
                  >
                    {/* Indent guide lines — one vertical line per indent level */}
                    {indentLevel > 0 && Array.from({ length: indentLevel }, (_, gi) => (
                      <span
                        key={gi}
                        aria-hidden
                        style={{
                          position:    "absolute",
                          left:        `calc(${PL} + ${gi * INDENT}ch)`,
                          top:         0,
                          bottom:      0,
                          borderLeft:  "1px solid rgba(255,255,255,0.08)",
                          pointerEvents: "none",
                        }}
                      />
                    ))}

                    {tokLine ? (
                      tokLine.tokens.map((tok, j) => (
                        <span
                          key={j}
                          style={{
                            color:      tok.color,
                            fontStyle:  tok.fontStyle && tok.fontStyle & 1 ? "italic"     : undefined,
                            fontWeight: tok.fontStyle && tok.fontStyle & 2 ? "bold"       : undefined,
                            textDecoration: tok.fontStyle && tok.fontStyle & 4 ? "underline" : undefined,
                          }}
                        >
                          {tok.content}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: "#e8e8f0" }}>{raw}</span>
                    )}
                    {raw === "" && <span>&nbsp;</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
