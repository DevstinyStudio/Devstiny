"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { tokenize, tokenColor } from "@/components/course/tokenizer";
import { apiPost } from "@/lib/api";
import type { Quest, TestResult } from "@/types/quest";

// Gem image for each quest badge key (static mapping — matches seed-quest-badges.ts)
const BADGE_GEM: Record<string, string> = {
  "quest-f1": "/gem/gem-1.png",  "quest-f2": "/gem/gem-2.png",
  "quest-f4": "/gem/gem-3.png",  "quest-l1": "/gem/gem-4.png",
  "quest-l2": "/gem/gem-5.png",  "quest-l4": "/gem/gem-6.png",
  "quest-s1": "/gem/gem-7.png",  "quest-e1": "/gem/gem-8.png",
  "quest-f3": "/gem/gem-9.png",  "quest-f5": "/gem/gem-10.png",
  "quest-l3": "/gem/gem-11.png", "quest-l5": "/gem/gem-12.png",
  "quest-s2": "/gem/gem-13.png", "quest-s4": "/gem/gem-14.png",
  "quest-s5": "/gem/gem-15.png", "quest-e2": "/gem/gem-16.png",
  "quest-f6": "/gem/gem-17.png", "quest-l6": "/gem/gem-18.png",
  "quest-s3": "/gem/gem-19.png",
};

const tierConfig = {
  1: { label: "FRAGMENT", color: "text-rpg-green",  border: "border-rpg-green"  },
  2: { label: "CIPHER",   color: "text-rpg-gold",   border: "border-rpg-gold"   },
  3: { label: "RELIC",    color: "text-rpg-purple",  border: "border-rpg-purple" },
};

const characterConfig: Record<string, { name: string; role: string; portrait: string }> = {
  ferrus: { name: "FERRUS", role: "Dwarf Blacksmith", portrait: "/NPC/ferrus.png" },
  lyra:   { name: "LYRA",   role: "Alchemist",        portrait: "/NPC/lyra.png"   },
  somers: { name: "SOMERS", role: "Jester",            portrait: "/NPC/somers.png" },
  elvar:  { name: "ELVAR",  role: "The Elder Dev",     portrait: "/NPC/elvar.png"  },
};

function runTests(userCode: string, quest: Quest): TestResult[] {
  return quest.testCases.map((tc) => {
    try {
      const argsClone = JSON.parse(JSON.stringify(tc.args));
      // eslint-disable-next-line no-new-func
      const fn = new Function(
        `${userCode}; return typeof ${quest.functionName} !== 'undefined' ? ${quest.functionName} : undefined;`,
      )() as ((...a: unknown[]) => unknown) | undefined;
      if (typeof fn !== "function") {
        return {
          description: tc.description, passed: false,
          result: undefined, expected: tc.expected,
          error: `Function '${quest.functionName}' not found. Make sure the function name is correct.`,
        };
      }
      const result = fn(...argsClone);
      const passed = JSON.stringify(result) === JSON.stringify(tc.expected);
      return { description: tc.description, passed, result, expected: tc.expected, error: null };
    } catch (e) {
      return {
        description: tc.description, passed: false,
        result: undefined, expected: tc.expected,
        error: (e as Error).message,
      };
    }
  });
}

export default function QuestEditor({ quest }: { quest: Quest }) {
  const [code,     setCode]     = useState(quest.starterCode);
  const [results,  setResults]  = useState<TestResult[]>([]);
  const [ran,      setRan]      = useState(false);
  const [rewarded, setRewarded] = useState(false);
  const [awarding, setAwarding] = useState(false);
  const preRef      = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync textarea height whenever code changes
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0";
    el.style.height = `${el.scrollHeight}px`;
  }, [code]);

  // Ref callback — fires on mount/remount (e.g. after tab switch)
  const setTextareaRef = useCallback((el: HTMLTextAreaElement | null) => {
    textareaRef.current = el;
    if (el) {
      el.style.height = "0";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, []);

  const syncScroll = useCallback(() => {
    if (preRef.current && textareaRef.current) {
      preRef.current.scrollTop  = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const highlightedLines = tokenize(code, "js");
  const tier = tierConfig[quest.tier];
  const char = characterConfig[quest.character];

  const handleRun = useCallback(() => {
    const r = runTests(code, quest);
    setResults(r);
    setRan(true);
  }, [code, quest]);

  const allPassed   = ran && results.length > 0 && results.every((r) => r.passed);
  const passedCount = results.filter((r) => r.passed).length;
  const [editorTab, setEditorTab] = useState<"editor" | "expected">("editor");

  // Award XP, gold, and badge when all tests pass for the first time
  useEffect(() => {
    if (!allPassed || rewarded || awarding) return;
    setAwarding(true);
    apiPost("/players/me/scene", {
      sceneKey: `quest/${quest.slug}`,
      xp:       quest.rewards.xp,
      gold:     quest.rewards.gold,
      badgeKey: quest.rewards.badge || undefined,
    })
      .then(() => setRewarded(true))
      .catch(() => {})
      .finally(() => setAwarding(false));
  }, [allPassed, rewarded, awarding, quest]);

  const gemImg = BADGE_GEM[quest.rewards.badge] ?? null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const el    = e.currentTarget;
      const start = el.selectionStart;
      const end   = el.selectionEnd;
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      setCode(newCode);
      setTimeout(() => { el.selectionStart = el.selectionEnd = start + 2; }, 0);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Lore Hook */}
      <div className="border border-rpg-border bg-rpg-panel flex items-start gap-4 p-4">
        {char && (
          <img
            src={char.portrait}
            alt={char.name}
            style={{ width: 80, height: 80, imageRendering: "pixelated", objectFit: "contain", flexShrink: 0 }}
          />
        )}
        <div className="flex flex-col gap-1">
          {char && (
            <div className="flex items-center gap-2">
              <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>{char.name}</span>
              <span className="text-rpg-dim text-xs">{char.role}</span>
            </div>
          )}
          <p className="text-sm text-rpg-dim leading-6 italic">&ldquo;{quest.loreHook}&rdquo;</p>
        </div>
      </div>

      {/* Concepts */}
      <div className="flex flex-wrap gap-2">
        {quest.concepts.map((c) => (
          <span key={c} className={`border text-[7px] px-2 py-0.5 tracking-wider ${tier?.color} ${tier?.border}`}
            style={{ fontFamily: "var(--font-pixel)" }}>
            {c}
          </span>
        ))}
      </div>

      {/* Code editor with tabs */}
      <div className="flex flex-col gap-0">
        {/* Tab bar */}
        <div className="flex items-end gap-0">
          {[
            { key: "editor",   label: "EDITOR"   },
            { key: "expected", label: "EXPECTED" },
          ].map((tab) => {
            const active = editorTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setEditorTab(tab.key as "editor" | "expected")}
                className="px-4 py-1 border-2 border-b-0 transition-colors"
                style={{
                  fontFamily:  "var(--font-pixel)",
                  fontSize:    8,
                  letterSpacing: "0.08em",
                  borderColor: active ? "#f0c040" : "#3d2d8c",
                  color:       active ? "#f0c040" : "#7a7ab0",
                  background:  active ? "#0d0b20" : "transparent",
                  marginRight: 2,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Editor panel */}
        <div className="border-2 border-rpg-gold" style={{ background: "#0d0b20" }}>

          {editorTab === "editor" ? (
            /* ── Code editor ── */
            <div className="relative">
              <pre
                ref={preRef}
                aria-hidden
                className="pointer-events-none absolute inset-0 font-mono text-sm leading-7 overflow-hidden p-4 select-none"
                style={{ margin: 0, tabSize: 2 }}
              >
                {highlightedLines.map((line, li) => (
                  <div key={li}>
                    {line.map((tok, ti) => (
                      <span key={ti} className={tokenColor[tok.type]}>{tok.text}</span>
                    ))}
                    {"\n"}
                  </div>
                ))}
                <div>&nbsp;</div>
              </pre>
              <textarea
                ref={setTextareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                onScroll={syncScroll}
                spellCheck={false}
                className="relative w-full font-mono text-sm leading-7 p-4 resize-none outline-none caret-white"
                style={{
                  background: "transparent", color: "transparent", caretColor: "#e8e8f0",
                  tabSize: 2, overflow: "hidden", display: "block",
                }}
              />
            </div>
          ) : (
            /* ── Expected output ── */
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                  EXPECTED BEHAVIOUR — {quest.testCases.length} TEST CASES
                </span>
              </div>
              {quest.testCases.map((tc, i) => (
                <div key={i} className="border border-rpg-border/40 px-4 py-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-rpg-dim/50" style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-rpg-dim text-xs">{tc.description}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-rpg-dim/50" style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}>INPUT</span>
                      <code className="text-rpg-cyan text-xs break-all leading-5">
                        {JSON.stringify(tc.args[0], null, 2).length > 80
                          ? JSON.stringify(tc.args[0]).slice(0, 80) + "…"
                          : JSON.stringify(tc.args[0])}
                      </code>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-rpg-dim/50" style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}>EXPECTED RETURN</span>
                      <code className="text-rpg-gold text-xs break-all leading-5">
                        {JSON.stringify(tc.expected, null, 2).length > 80
                          ? JSON.stringify(tc.expected).slice(0, 80) + "…"
                          : JSON.stringify(tc.expected)}
                      </code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Run + result count */}
      <div className="flex items-center gap-4">
        <button onClick={handleRun}
          className="pixel-btn-primary px-6 py-3 text-[8px] tracking-widest">
          ▶ RUN TESTS
        </button>
        {ran && (
          <span className={`text-sm ${allPassed ? "text-rpg-green" : "text-rpg-red"}`}
            style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
            {passedCount}/{results.length} PASSED
          </span>
        )}
      </div>

      {/* Test results */}
      {ran && (
        <div className="flex flex-col gap-3">
          <span className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
            TEST RESULTS
          </span>
          {results.map((r, i) => (
            <div key={i} className={`border-l-4 pl-4 py-2 ${r.passed ? "border-rpg-green" : "border-rpg-red"}`}>
              <div className="flex items-start gap-2">
                <span className={`text-sm shrink-0 ${r.passed ? "text-rpg-green" : "text-rpg-red"}`}>
                  {r.passed ? "✓" : "✗"}
                </span>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <span className="text-sm text-rpg-text">{r.description}</span>
                  {!r.passed && (
                    <div className="flex flex-col gap-1 mt-1">
                      {r.error ? (
                        <span className="text-xs text-rpg-red font-mono">Error: {r.error}</span>
                      ) : (
                        <>
                          <span className="text-xs text-rpg-dim font-mono">
                            Expected: <span className="text-rpg-gold">{JSON.stringify(r.expected)}</span>
                          </span>
                          <span className="text-xs text-rpg-dim font-mono">
                            Got: <span className="text-rpg-red">{JSON.stringify(r.result)}</span>
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Quest Complete reward panel */}
          {allPassed && (
            <div className="border-2 border-rpg-gold p-5 mt-2 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-rpg-gold text-glow-gold"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>
                  QUEST COMPLETE
                </span>
                <span className="text-xs text-rpg-dim">
                  {rewarded ? "Rewards saved to your profile." : awarding ? "Saving rewards..." : "All test cases passed!"}
                </span>
              </div>

              <div className="flex items-center gap-5">
                {/* XP */}
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-rpg-gold text-glow-gold"
                    style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}>
                    +{quest.rewards.xp} XP
                  </span>
                </div>
                {/* Gold */}
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-rpg-gold"
                    style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}>
                    +{quest.rewards.gold} G
                  </span>
                </div>
                {/* Badge */}
                {quest.rewards.badge && (
                  <div className="flex flex-col items-center gap-1.5">
                    {gemImg ? (
                      <img src={gemImg} alt={quest.rewards.badge}
                        style={{ width: 40, height: 40, imageRendering: "pixelated", objectFit: "contain" }} />
                    ) : (
                      <span className="text-rpg-gold text-2xl">◆</span>
                    )}
                    <span className="text-rpg-gold text-center"
                      style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                      {quest.rewards.badge.replace("quest-", "").toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
