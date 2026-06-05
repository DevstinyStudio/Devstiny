import type { ContentSection, CodeLanguage } from "@/types/content";
import PlayerDialogue from "@/components/course/PlayerDialogue";
import ShikiCodeBlock from "@/components/books/CodeBlock";
import HtmlChallengeSection from "@/components/course/HtmlChallengeSection";

// ─── CodeBlock ────────────────────────────────────────────────────────────────

export function CodeBlock({ filename, language, code }: {
  filename: string;
  language: CodeLanguage;
  code: string;
}) {
  return (
    <div className="my-6">
      <ShikiCodeBlock code={code} lang={language} tabLabel={filename} />
    </div>
  );
}

// ─── Callout ──────────────────────────────────────────────────────────────────

export function Callout({ variant, text }: { variant: "tip" | "warning" | "info"; text: string }) {
  const cfg = {
    tip:     { icon: "★", label: "TIP",     border: "border-rpg-green", color: "text-rpg-green" },
    warning: { icon: "⚠", label: "WARNING", border: "border-rpg-gold",  color: "text-rpg-gold"  },
    info:    { icon: "◈", label: "NOTE",    border: "border-rpg-cyan",  color: "text-rpg-cyan"  },
  }[variant];

  return (
    <div className={`border-l-4 ${cfg.border} pl-4 py-2 my-6 flex gap-3`}>
      <span className={`${cfg.color} text-base shrink-0 mt-0.5`}>{cfg.icon}</span>
      <div className="flex flex-col gap-1">
        <span className={cfg.color} style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>{cfg.label}</span>
        <p className="text-sm text-rpg-dim leading-6">{text}</p>
      </div>
    </div>
  );
}

// ─── Section divider ──────────────────────────────────────────────────────────

export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 my-8">
      <div className="flex-1 pixel-divider" />
      <span className="text-rpg-dim shrink-0" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>{label}</span>
      <div className="flex-1 pixel-divider" />
    </div>
  );
}

// ─── Section renderer ─────────────────────────────────────────────────────────

export function RenderSection({ section }: { section: ContentSection }) {
  switch (section.type) {
    case "heading":
      return section.level === 3
        ? <h3 className="text-sm text-rpg-cyan tracking-wide mt-4 mb-1">{section.text}</h3>
        : <h2 className="text-base sm:text-lg text-rpg-text text-pixel-shadow tracking-widest mt-2">{section.text}</h2>;

    case "paragraph":
      return (
        <p className="text-base text-rpg-dim leading-7 mb-2"
          dangerouslySetInnerHTML={{
            __html: section.text
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/`([^`]+)`/g, '<code class="text-rpg-red font-mono bg-rpg-panel px-1">$1</code>'),
          }}
        />
      );

    case "code":
      return <CodeBlock filename={section.filename} language={section.language} code={section.code} />;

    case "callout":
      return <Callout variant={section.variant} text={section.text} />;

    case "keypoints":
      return (
        <div className="pixel-panel flex flex-col gap-3 my-4">
          {section.heading && (
            <h2 className="text-base text-rpg-text text-pixel-shadow tracking-widest">{section.heading}</h2>
          )}
          {(section.items ?? []).map((item) => (
            <div key={item.text} className="flex items-start gap-3">
              <span className={`${item.color} text-sm shrink-0 mt-0.5`}>◆</span>
              <p className="text-sm text-rpg-dim leading-6">{item.text}</p>
            </div>
          ))}
        </div>
      );

    case "divider":
      return <SectionDivider label={section.label} />;

    case "scene":
      return (
        <div className="flex items-center justify-center my-6">
          <span
            className="text-rpg-dim tracking-[0.25em]"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
          >
            [ {section.label} ]
          </span>
        </div>
      );

    case "narration":
      return (
        <p className="text-sm text-rpg-dim leading-7 italic my-4 px-2 border-l-2 border-rpg-border">
          {section.text}
        </p>
      );

    case "dialogue": {
      const isRight = section.side === "right";
      return (
        <div className={`pixel-panel pixel-panel-labeled flex gap-4 my-6 ${isRight ? "flex-row-reverse" : ""}`}>
          <span className="pixel-panel-label" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
            {section.speaker}
          </span>

          {section.portrait && (
            <div className="shrink-0 mt-2">
              <img
                src={section.portrait}
                alt={section.speaker}
                style={{
                  imageRendering: "pixelated",
                  width: isRight ? 140 : 100,
                  height: isRight ? 140 : 100,
                  objectFit: "contain",
                  transform: isRight ? "scaleX(-1)" : undefined,
                }}
              />
            </div>
          )}

          <div className={`flex flex-col gap-2 flex-1 mt-2 ${isRight ? "items-end text-right" : ""}`}>
            <div className={`flex flex-row items-center gap-1 ${isRight ? "flex-row-reverse" : ""}`}>
              <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 12 }}>
                {section.speaker}
              </span>
              <span className="font-bold">|</span>
              <span className="text-xs text-rpg-dim">{section.role}</span>
            </div>
            <div className="pixel-divider w-full" />
            <div className="flex flex-col gap-2">
              {(section.lines ?? []).map((line, i) => (
                <p key={i} className="text-sm text-rpg-text leading-6">&ldquo;{line}&rdquo;</p>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case "playerDialogue":
      return <PlayerDialogue lines={section.lines} />;

    case "htmlChallenge":
      return (
        <HtmlChallengeSection
          title={section.title}
          description={section.description}
          requiredTags={section.requiredTags}
          starterCode={section.starterCode}
          successMessage={section.successMessage}
        />
      );
  }
}