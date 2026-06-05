"use client";

import { useState } from "react";

interface RequiredTag {
  tag: string;
  hint: string;
}

interface HtmlChallengeSectionProps {
  title: string;
  description: string;
  requiredTags: RequiredTag[];
  starterCode: string;
  successMessage: string;
}

export default function HtmlChallengeSection({
  title,
  description,
  requiredTags,
  starterCode,
  successMessage,
}: HtmlChallengeSectionProps) {
  const [code, setCode]     = useState(starterCode);
  const [result, setResult] = useState<"idle" | "pass" | "fail">("idle");
  const [missing, setMissing] = useState<RequiredTag[]>([]);

  function validate() {
    const lower = code.toLowerCase();
    const missingTags = requiredTags.filter(
      ({ tag }) => !lower.includes(`<${tag.toLowerCase()}`)
    );
    if (missingTags.length === 0) {
      setResult("pass");
      setMissing([]);
    } else {
      setResult("fail");
      setMissing(missingTags);
    }
  }

  function reset() {
    setCode(starterCode);
    setResult("idle");
    setMissing([]);
  }

  return (
    <div className="pixel-panel pixel-panel-labeled flex flex-col gap-4 my-6"
      style={{ borderColor: "#f0c040" }}>
      <span className="pixel-panel-label"
        style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#f0c040", borderColor: "#f0c040" }}>
        CHALLENGE
      </span>

      {/* Title + description */}
      <div className="flex flex-col gap-2">
        <h3 className="text-base text-rpg-gold tracking-widest text-pixel-shadow">
          {title}
        </h3>
        <p className="text-sm text-rpg-dim leading-6">{description}</p>
      </div>

      {/* Required tags checklist */}
      <div className="flex flex-col gap-1.5">
        <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
          REQUIRED ELEMENTS
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {requiredTags.map(({ tag, hint }) => {
            const done    = result !== "idle" && !missing.find((m) => m.tag === tag);
            const failed  = result === "fail"  &&  missing.find((m) => m.tag === tag);
            return (
              <div key={tag}
                className="flex items-center gap-2 px-2 py-1 border"
                style={{
                  borderColor: done ? "#40e070" : failed ? "#e05050" : "#3d2d8c",
                  background:  done ? "rgba(64,224,112,0.05)" : failed ? "rgba(224,80,80,0.05)" : "transparent",
                }}>
                <span style={{ fontFamily: "var(--font-pixel)", fontSize: 9,
                  color: done ? "#40e070" : failed ? "#e05050" : "#b4b4df" }}>
                  {done ? "◆" : failed ? "✕" : "○"}
                </span>
                <div className="flex flex-col">
                  <code className="text-xs font-mono" style={{ color: done ? "#40e070" : failed ? "#e05050" : "#f0c040" }}>
                    &lt;{tag}&gt;
                  </code>
                  <span className="text-rpg-dim" style={{ fontSize: 10 }}>{hint}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Code editor */}
      <div className="flex flex-col gap-1">
        <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
          YOUR FORGE
        </span>
        <textarea
          value={code}
          onChange={(e) => { setCode(e.target.value); setResult("idle"); }}
          spellCheck={false}
          rows={14}
          className="w-full font-mono text-sm bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text px-4 py-3 transition-colors resize-y"
          style={{ fontFamily: "monospace", minHeight: "200px", lineHeight: "1.6" }}
        />
      </div>

      {/* Feedback */}
      {result === "fail" && (
        <div className="border-2 border-rpg-red p-3 flex flex-col gap-2">
          <span className="text-rpg-red" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
            ✕ MISSING ELEMENTS
          </span>
          <p className="text-sm text-rpg-dim leading-5">
            Your blueprint is missing: {missing.map((m) => `<${m.tag}>`).join(", ")}.
            Check the required elements above and try again.
          </p>
        </div>
      )}

      {result === "pass" && (
        <div className="border-2 border-rpg-green p-3 flex flex-col gap-2">
          <span className="text-rpg-green" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
            ◆ BLUEPRINT COMPLETE
          </span>
          <p className="text-sm text-rpg-dim leading-5">{successMessage}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={reset}
          className="pixel-btn text-rpg-dim text-[8px] px-4 py-2 tracking-widest hover:text-rpg-text"
        >
          ↩ RESET
        </button>
        <button
          onClick={validate}
          disabled={!code.trim()}
          className="pixel-btn-gold text-[9px] px-5 py-2.5 tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ▶ FORGE IT
        </button>
      </div>
    </div>
  );
}
