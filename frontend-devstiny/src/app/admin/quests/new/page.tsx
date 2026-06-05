"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost, apiGet } from "@/lib/api";

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

const DEFAULT_TEST_CASES = JSON.stringify([
  { description: "Test case description", args: [[]], expected: [] }
], null, 2);

const DEFAULT_STARTER = `function myFunction(input) {\n  // your code here\n}`;

interface BadgeRecord { id: string; key: string; name: string; description: string; }

export default function NewQuestPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    id: "", slug: "", title: "", tier: 1, character: "ferrus",
    loreHook: "", functionName: "", starterCode: DEFAULT_STARTER,
    rewardXp: 75, rewardGold: 50, rewardBadge: "",
    isActive: true, order: 0,
  });
  const [testCasesJson, setTestCasesJson] = useState(DEFAULT_TEST_CASES);
  const [conceptsStr,   setConceptsStr]   = useState("");
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState("");
  const [jsonError,     setJsonError]     = useState("");

  // Badge
  const [badges,      setBadges]      = useState<BadgeRecord[]>([]);
  const [badgeMode,   setBadgeMode]   = useState<"select" | "create">("select");
  const [badgeName,   setBadgeName]   = useState("");
  const [badgeDesc,   setBadgeDesc]   = useState("");
  const [newBadgeKey, setNewBadgeKey] = useState("");

  useEffect(() => {
    apiGet<BadgeRecord[]>("/badges").then((bs) => setBadges(bs ?? [])).catch(() => {});
  }, []);

  // Auto-generate badge key from quest ID
  function handleIdChange(value: string) {
    const upper = value.toUpperCase();
    setForm((f) => ({ ...f, id: upper }));
    const autoKey = `quest-${upper.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    setNewBadgeKey(autoKey);
    if (badgeMode === "create" && !form.rewardBadge) {
      setForm((f) => ({ ...f, rewardBadge: autoKey }));
    }
  }

  async function handleCreate() {
    setError(""); setJsonError("");
    if (!form.id || !form.slug || !form.title) {
      setError("ID, slug, and title are required.");
      return;
    }
    let parsedTestCases: unknown;
    try {
      parsedTestCases = JSON.parse(testCasesJson);
    } catch {
      setJsonError("Invalid JSON in Test Cases.");
      return;
    }

    setSaving(true);
    try {
      // If creating a new badge, create it first
      if (badgeMode === "create" && form.rewardBadge && badgeName) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/admin/badges`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("access_token")}` },
            body: JSON.stringify({ key: form.rewardBadge, name: badgeName, description: badgeDesc }),
          }
        );
      }

      await apiPost("/admin/quests", {
        ...form,
        concepts:  conceptsStr.split(",").map((s) => s.trim()).filter(Boolean),
        testCases: parsedTestCases,
      });
      router.push("/admin/quests");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create quest.");
    }
    setSaving(false);
  }

  const selectedBadge = badges.find((b) => b.key === form.rewardBadge);
  const gemImg = BADGE_GEM[form.rewardBadge];

  return (
    <div className="p-8 flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/quests" className="text-rpg-dim hover:text-rpg-gold no-underline transition-colors"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>← QUESTS</Link>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">NEW QUEST</h1>
        <div className="w-24 pixel-divider-gold mt-1" />
      </div>

      <div className="flex flex-col gap-5">
        {/* Row 1: ID, Slug, Order */}
        <div className="grid grid-cols-3 gap-4">
          <Field label="ID (e.g. F-1)">
            <input value={form.id}
              onChange={(e) => handleIdChange(e.target.value)}
              placeholder="F-7"
              className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors" />
          </Field>
          <Field label="SLUG (e.g. weapon-ledger)">
            <input value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
              placeholder="my-quest"
              className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors" />
          </Field>
          <Field label="ORDER">
            <input type="number" value={form.order}
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
              className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors" />
          </Field>
        </div>

        {/* Row 2: Title, Tier, Character */}
        <div className="grid grid-cols-3 gap-4">
          <Field label="TITLE">
            <input value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors" />
          </Field>
          <Field label="TIER">
            <select value={form.tier} onChange={(e) => setForm({ ...form, tier: parseInt(e.target.value) })}
              className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2">
              <option value={1}>1 — FRAGMENT</option>
              <option value={2}>2 — CIPHER</option>
              <option value={3}>3 — RELIC</option>
            </select>
          </Field>
          <Field label="CHARACTER">
            <select value={form.character} onChange={(e) => setForm({ ...form, character: e.target.value })}
              className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2">
              <option value="ferrus">Ferrus</option>
              <option value="lyra">Lyra</option>
              <option value="somers">Somers</option>
              <option value="elvar">Elvar</option>
            </select>
          </Field>
        </div>

        {/* Lore Hook */}
        <Field label="LORE HOOK">
          <textarea value={form.loreHook} rows={3}
            onChange={(e) => setForm({ ...form, loreHook: e.target.value })}
            className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors resize-y" />
        </Field>

        {/* Function Name + Concepts */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="FUNCTION NAME">
            <input value={form.functionName}
              onChange={(e) => setForm({ ...form, functionName: e.target.value })}
              placeholder="separateByWeight"
              className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 font-mono transition-colors" />
          </Field>
          <Field label="CONCEPTS (comma separated)">
            <input value={conceptsStr} onChange={(e) => setConceptsStr(e.target.value)}
              placeholder="filter(), Array, conditional"
              className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors" />
          </Field>
        </div>

        {/* Starter Code */}
        <Field label="STARTER CODE">
          <textarea value={form.starterCode} rows={10}
            onChange={(e) => setForm({ ...form, starterCode: e.target.value })}
            className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 font-mono transition-colors resize-y"
            style={{ minHeight: 180 }} />
        </Field>

        {/* Test Cases */}
        <Field label={`TEST CASES (JSON)${jsonError ? ` — ${jsonError}` : ""}`} error={!!jsonError}>
          <textarea value={testCasesJson} rows={12}
            onChange={(e) => { setTestCasesJson(e.target.value); setJsonError(""); }}
            className="w-full bg-rpg-bg border-2 focus:border-rpg-gold outline-none text-rpg-text text-xs px-3 py-2 font-mono transition-colors resize-y"
            style={{ borderColor: jsonError ? "#e05050" : "#3d2d8c", minHeight: 200 }} />
          <p className="text-rpg-dim text-xs mt-1">Format: array of &#123; description, args, expected &#125;</p>
        </Field>

        {/* Rewards */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="XP REWARD">
            <input type="number" value={form.rewardXp}
              onChange={(e) => setForm({ ...form, rewardXp: parseInt(e.target.value) || 0 })}
              className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors" />
          </Field>
          <Field label="GOLD REWARD">
            <input type="number" value={form.rewardGold}
              onChange={(e) => setForm({ ...form, rewardGold: parseInt(e.target.value) || 0 })}
              className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors" />
          </Field>
        </div>

        {/* Badge Reward */}
        <div className="flex flex-col gap-3 p-4 border-2 border-rpg-border/50 bg-rpg-panel/30">
          <div className="flex items-center justify-between">
            <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>BADGE REWARD</span>
            {/* Toggle select / create */}
            <div className="flex gap-1">
              {(["select", "create"] as const).map((m) => (
                <button key={m} onClick={() => { setBadgeMode(m); setForm((f) => ({ ...f, rewardBadge: "" })); setBadgeName(""); setBadgeDesc(""); }}
                  className="px-3 py-1 text-[7px] tracking-wider border transition-colors"
                  style={{
                    fontFamily: "var(--font-pixel)",
                    borderColor: badgeMode === m ? "#f0c040" : "#3d2d8c",
                    color:       badgeMode === m ? "#f0c040" : "#b4b4df",
                    background:  badgeMode === m ? "rgba(240,192,64,0.08)" : "transparent",
                  }}>
                  {m === "select" ? "SELECT EXISTING" : "CREATE NEW"}
                </button>
              ))}
            </div>
          </div>

          {badgeMode === "select" ? (
            /* ── Select existing badge ── */
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="SELECT BADGE">
                  <select value={form.rewardBadge}
                    onChange={(e) => {
                      const key = e.target.value;
                      setForm((f) => ({ ...f, rewardBadge: key }));
                      const b = badges.find((b) => b.key === key);
                      setBadgeName(b?.name ?? "");
                      setBadgeDesc(b?.description.replace(/\|gem:\d+$/, "") ?? "");
                    }}
                    className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2">
                    <option value="">— No badge —</option>
                    {badges.map((b) => (
                      <option key={b.key} value={b.key}>{b.name} ({b.key})</option>
                    ))}
                  </select>
                </Field>
                {gemImg && (
                  <div className="flex items-end gap-3 pb-1">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>GEM</span>
                      <img src={gemImg} alt="gem" style={{ width: 40, height: 40, imageRendering: "pixelated", objectFit: "contain" }} />
                    </div>
                    {selectedBadge && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-rpg-gold text-sm">{selectedBadge.name}</span>
                        <span className="text-rpg-dim text-xs">{selectedBadge.description.replace(/\|gem:\d+$/, "")}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ── Create new badge ── */
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="BADGE KEY (auto-generated)">
                  <input value={form.rewardBadge || newBadgeKey}
                    onChange={(e) => {
                      const key = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                      setForm((f) => ({ ...f, rewardBadge: key }));
                      setNewBadgeKey(key);
                    }}
                    placeholder="quest-f7"
                    className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-dim text-sm px-3 py-2 font-mono transition-colors" />
                </Field>
                <Field label="BADGE NAME">
                  <input value={badgeName} onChange={(e) => setBadgeName(e.target.value)}
                    placeholder="Weapon Sorter"
                    className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors" />
                </Field>
              </div>
              <Field label="BADGE DESCRIPTION">
                <textarea value={badgeDesc} rows={2}
                  onChange={(e) => setBadgeDesc(e.target.value)}
                  placeholder="What did the player do to earn this badge?"
                  className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors resize-y" />
              </Field>
              <p className="text-rpg-dim/60 text-xs" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                Badge will be created automatically when quest is saved.
              </p>
            </div>
          )}
        </div>

        {/* Active toggle */}
        <div className="flex items-center gap-3">
          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>STATUS</span>
          <button onClick={() => setForm({ ...form, isActive: !form.isActive })}
            className="border-2 px-4 py-2 transition-colors"
            style={{
              fontFamily: "var(--font-pixel)", fontSize: 8,
              borderColor: form.isActive ? "#40e070" : "#3d2d8c",
              color:       form.isActive ? "#40e070" : "#b4b4df",
            }}>
            {form.isActive ? "✓ ACTIVE" : "HIDDEN"}
          </button>
        </div>
      </div>

      {error && <p className="text-rpg-red text-sm">{error}</p>}

      {/* Actions */}
      <div className="flex gap-4 pt-2">
        <button onClick={handleCreate} disabled={saving}
          className="pixel-btn-gold text-[9px] px-6 py-3 tracking-widest disabled:opacity-40">
          {saving ? "CREATING..." : "▶ CREATE QUEST"}
        </button>
        <Link href="/admin/quests" className="pixel-btn text-rpg-dim text-[8px] px-4 py-3 no-underline tracking-widest hover:text-rpg-text">
          CANCEL
        </Link>
      </div>
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={error ? "text-rpg-red" : "text-rpg-dim"} style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
