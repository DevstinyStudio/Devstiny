import React from "react";

// ─── Inline formatting ────────────────────────────────────────────────────────
// Supports: **bold**, *italic*, `code`, and plain text

function parseInline(text: string): React.ReactNode[] {
  const tokens = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`)/);
  return tokens.map((token, i) => {
    if (token.startsWith("**") && token.endsWith("**"))
      return <strong key={i} className="text-rpg-text font-semibold">{token.slice(2, -2)}</strong>;
    if (token.startsWith("*") && token.endsWith("*"))
      return <em key={i} className="italic text-rpg-text/90">{token.slice(1, -1)}</em>;
    if (token.startsWith("`") && token.endsWith("`"))
      return (
        <code key={i} className="font-mono text-rpg-cyan bg-rpg-bg/60 px-1 py-0.5 rounded-sm text-[0.8em]">
          {token.slice(1, -1)}
        </code>
      );
    return token;
  });
}

// ─── Block-level grouping ─────────────────────────────────────────────────────

type LineGroup =
  | { kind: "paragraph"; lines: string[] }
  | { kind: "ul";        items: string[] }
  | { kind: "ol";        items: string[] }
  | { kind: "note";      line: string }
  | { kind: "heading";   text: string; level: 3 | 4 };

function groupLines(content: string): LineGroup[] {
  const raw = content.split("\n");
  const groups: LineGroup[] = [];
  let i = 0;

  while (i < raw.length) {
    const line = raw[i];

    // blank line — close current group by continuing
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Note / callout: lines starting with "> " or "NOTE:"
    if (line.startsWith("> ") || /^NOTE:|^TIP:|^WARNING:/i.test(line)) {
      groups.push({ kind: "note", line: line.replace(/^> |^NOTE:\s*|^TIP:\s*|^WARNING:\s*/i, "") });
      i++;
      continue;
    }

    // Heading: ### or ####
    if (line.startsWith("#### ")) {
      groups.push({ kind: "heading", text: line.slice(5), level: 4 });
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      groups.push({ kind: "heading", text: line.slice(4), level: 3 });
      i++;
      continue;
    }

    // Unordered list: lines starting with • - *
    if (/^[•\-\*]\s/.test(line)) {
      const items: string[] = [];
      while (i < raw.length && /^[•\-\*]\s/.test(raw[i])) {
        items.push(raw[i].replace(/^[•\-\*]\s/, ""));
        i++;
      }
      groups.push({ kind: "ul", items });
      continue;
    }

    // Ordered list: lines starting with "1. " "2. " etc.
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < raw.length && /^\d+\.\s/.test(raw[i])) {
        items.push(raw[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      groups.push({ kind: "ol", items });
      continue;
    }

    // Paragraph: collect consecutive non-special lines
    const lines: string[] = [];
    while (
      i < raw.length &&
      raw[i].trim() !== "" &&
      !/^[•\-\*]\s/.test(raw[i]) &&
      !/^\d+\.\s/.test(raw[i]) &&
      !raw[i].startsWith("> ") &&
      !/^NOTE:|^TIP:|^WARNING:/i.test(raw[i]) &&
      !raw[i].startsWith("### ") &&
      !raw[i].startsWith("#### ")
    ) {
      lines.push(raw[i]);
      i++;
    }
    if (lines.length > 0) groups.push({ kind: "paragraph", lines });
  }

  return groups;
}

// ─── Renderer ─────────────────────────────────────────────────────────────────

export default function TextBlock({ content }: { content: string }) {
  const groups = groupLines(content);

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group, gi) => {
        switch (group.kind) {
          case "heading":
            return group.level === 3 ? (
              <h3 key={gi} className="text-base font-semibold text-rpg-text tracking-wide mt-2">
                {parseInline(group.text)}
              </h3>
            ) : (
              <h4 key={gi} className="text-sm font-semibold text-rpg-text tracking-wide mt-1">
                {parseInline(group.text)}
              </h4>
            );

          case "note":
            return (
              <div key={gi} className="border-l-2 border-rpg-gold/60 pl-4 py-1 bg-rpg-gold/5">
                <p className="text-sm text-rpg-dim leading-6 italic">
                  {parseInline(group.line)}
                </p>
              </div>
            );

          case "ul":
            return (
              <ul key={gi} className="flex flex-col gap-1 pl-1">
                {group.items.map((item, ii) => (
                  <li key={ii} className="flex items-start gap-2.5 text-sm text-rpg-dim leading-6">
                    <span className="text-rpg-gold mt-0.5 shrink-0 text-[10px]" style={{ fontFamily: "var(--font-pixel)" }}>◆</span>
                    <span>{parseInline(item)}</span>
                  </li>
                ))}
              </ul>
            );

          case "ol":
            return (
              <ol key={gi} className="flex flex-col gap-1 pl-1">
                {group.items.map((item, ii) => (
                  <li key={ii} className="flex items-start gap-2.5 text-sm text-rpg-dim leading-6">
                    <span className="text-rpg-gold shrink-0 tabular-nums" style={{ fontFamily: "var(--font-pixel)", fontSize: 8, marginTop: 4 }}>
                      {String(ii + 1).padStart(2, "0")}.
                    </span>
                    <span>{parseInline(item)}</span>
                  </li>
                ))}
              </ol>
            );

          case "paragraph":
          default:
            return (
              <p key={gi} className="text-sm text-rpg-dim leading-7">
                {parseInline(group.lines.join(" "))}
              </p>
            );
        }
      })}
    </div>
  );
}
