"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPatch, apiPost } from "@/lib/api";

interface BadgeRecord { id: string; key: string; name: string; description: string; }

interface FullQuest {
  id: string; slug: string; title: string; tier: number; character: string;
  loreHook: string; functionName: string; starterCode: string;
  concepts: string[]; testCases: unknown;
  rewardXp: number; rewardGold: number; rewardBadge: string;
  isActive: boolean; order: number;
}

export default function EditQuestPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [quest,   setQuest]   = useState<FullQuest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  // Editable fields
  const [form, setForm] = useState<Partial<FullQuest>>({});
  const [testCasesJson, setTestCasesJson] = useState("");
  const [conceptsStr,   setConceptsStr]   = useState("");
  const [jsonError,     setJsonError]     = useState("");

  // Badge
  const [badges,      setBadges]      = useState<BadgeRecord[]>([]);
  const [badgeSaving, setBadgeSaving] = useState(false);
  const [badgeName,   setBadgeName]   = useState("");
  const [badgeDesc,   setBadgeDesc]   = useState("");

  useEffect(() => {
    Promise.all([
      apiGet<FullQuest>(`/admin/quests/${id}`),
      apiGet<BadgeRecord[]>("/badges"),
    ]).then(([q, bs]) => {
      setQuest(q);
      setForm(q);
      setTestCasesJson(JSON.stringify(q.testCases, null, 2));
      setConceptsStr((q.concepts ?? []).join(", "));
      setBadges(bs ?? []);
      const existing = bs?.find((b) => b.key === q.rewardBadge);
      if (existing) {
        setBadgeName(existing.name);
        setBadgeDesc(existing.description.replace(/\|gem:\d+$/, ""));
      }
    })
      .catch(() => setError("Quest not found."))
      .finally(() => setLoading(false));
  }, [id]);

  async function saveBadge() {
    if (!form.rewardBadge) return;
    setBadgeSaving(true);
    try {
      const existing = badges.find((b) => b.key === form.rewardBadge);
      if (existing) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/admin/badges/${existing.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("access_token")}` },
            body: JSON.stringify({ name: badgeName, description: badgeDesc }),
          }
        );
        setBadges((prev) => prev.map((b) => b.id === existing.id ? { ...b, name: badgeName, description: badgeDesc } : b));
      }
    } catch { /* ignore */ }
    setBadgeSaving(false);
  }

  async function handleSave() {
    setJsonError("");
    let parsedTestCases: unknown;
    try {
      parsedTestCases = JSON.parse(testCasesJson);
    } catch {
      setJsonError("Invalid JSON in Test Cases.");
      return;
    }

    setSaving(true);
    try {
      await apiPatch(`/admin/quests/${id}`, {
        ...form,
        concepts:  conceptsStr.split(",").map((s) => s.trim()).filter(Boolean),
        testCases: parsedTestCases,
      });
      router.push("/admin/quests");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed.");
    }
    setSaving(false);
  }

  if (loading) return (
    <div className="p-8 flex justify-center">
      <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>LOADING...</span>
    </div>
  );

  if (error && !quest) return (
    <div className="p-8 flex flex-col gap-4">
      <p className="text-rpg-red text-sm">{error}</p>
      <Link href="/admin/quests" className="text-rpg-dim hover:text-rpg-gold no-underline" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>← BACK</Link>
    </div>
  );

  return (
    <div className="p-8 flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/quests" className="text-rpg-dim hover:text-rpg-gold no-underline transition-colors"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>← QUESTS</Link>
        <div className="flex-1" />
        <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>{id}</span>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">EDIT QUEST</h1>
        <div className="w-24 pixel-divider-gold mt-1" />
      </div>

      <div className="flex flex-col gap-5">
        {/* Row 1: ID, Slug, Order */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "ID", key: "id", disabled: true },
            { label: "SLUG", key: "slug", disabled: true },
            { label: "ORDER", key: "order", type: "number" },
          ].map(({ label, key, disabled, type }) => (
            <Field key={key} label={label}>
              <input value={String((form as Record<string, unknown>)[key] ?? "")} disabled={disabled}
                type={type ?? "text"}
                onChange={(e) => setForm({ ...form, [key]: type === "number" ? parseInt(e.target.value) || 0 : e.target.value })}
                className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors disabled:opacity-50" />
            </Field>
          ))}
        </div>

        {/* Row 2: Title, Tier, Character */}
        <div className="grid grid-cols-3 gap-4">
          <Field label="TITLE">
            <input value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors" />
          </Field>
          <Field label="TIER">
            <select value={form.tier ?? 1} onChange={(e) => setForm({ ...form, tier: parseInt(e.target.value) })}
              className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2">
              <option value={1}>1 — FRAGMENT</option>
              <option value={2}>2 — CIPHER</option>
              <option value={3}>3 — RELIC</option>
            </select>
          </Field>
          <Field label="CHARACTER">
            <select value={form.character ?? "ferrus"} onChange={(e) => setForm({ ...form, character: e.target.value })}
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
          <textarea value={form.loreHook ?? ""} rows={3}
            onChange={(e) => setForm({ ...form, loreHook: e.target.value })}
            className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors resize-y" />
        </Field>

        {/* Function Name + Concepts */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="FUNCTION NAME">
            <input value={form.functionName ?? ""} onChange={(e) => setForm({ ...form, functionName: e.target.value })}
              className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 font-mono transition-colors" />
          </Field>
          <Field label="CONCEPTS (comma separated)">
            <input value={conceptsStr} onChange={(e) => setConceptsStr(e.target.value)}
              className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors" />
          </Field>
        </div>

        {/* Starter Code */}
        <Field label="STARTER CODE">
          <textarea value={form.starterCode ?? ""} rows={10}
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
        </Field>

        {/* Rewards */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="XP REWARD">
            <input type="number" value={form.rewardXp ?? 0} onChange={(e) => setForm({ ...form, rewardXp: parseInt(e.target.value) || 0 })}
              className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors" />
          </Field>
          <Field label="GOLD REWARD">
            <input type="number" value={form.rewardGold ?? 0} onChange={(e) => setForm({ ...form, rewardGold: parseInt(e.target.value) || 0 })}
              className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors" />
          </Field>
        </div>

        {/* Badge Reward */}
        <div className="flex flex-col gap-3 p-4 border-2 border-rpg-border/50 bg-rpg-panel/30">
          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>BADGE REWARD</span>

          {/* Select badge */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="SELECT BADGE">
              <select
                value={form.rewardBadge ?? ""}
                onChange={(e) => {
                  const key = e.target.value;
                  setForm({ ...form, rewardBadge: key });
                  const b = badges.find((b) => b.key === key);
                  setBadgeName(b?.name ?? "");
                  setBadgeDesc(b?.description.replace(/\|gem:\d+$/, "") ?? "");
                }}
                className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2"
              >
                <option value="">— No badge —</option>
                {badges.map((b) => (
                  <option key={b.key} value={b.key}>{b.name} ({b.key})</option>
                ))}
              </select>
            </Field>
            <Field label="KEY (read-only)">
              <input value={form.rewardBadge ?? ""} disabled
                className="w-full bg-rpg-bg border-2 border-rpg-border outline-none text-rpg-dim text-sm px-3 py-2 opacity-60 font-mono" />
            </Field>
          </div>

          {/* Edit badge name + description (only when badge is selected) */}
          {form.rewardBadge && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="BADGE NAME">
                  <input value={badgeName}
                    onChange={(e) => setBadgeName(e.target.value)}
                    placeholder="Weapon Sorter"
                    className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors" />
                </Field>
                {/* Gem preview */}
                <div className="flex items-end gap-3">
                  {(() => {
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
                    const gem = BADGE_GEM[form.rewardBadge ?? ""];
                    return gem ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>GEM PREVIEW</span>
                        <img src={gem} alt="gem"
                          style={{ width: 40, height: 40, imageRendering: "pixelated", objectFit: "contain" }} />
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
              <Field label="BADGE DESCRIPTION">
                <textarea value={badgeDesc} rows={2}
                  onChange={(e) => setBadgeDesc(e.target.value)}
                  placeholder="What did the player do to earn this?"
                  className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors resize-y" />
              </Field>
              <div className="flex justify-end">
                <button onClick={saveBadge} disabled={badgeSaving}
                  className="pixel-btn text-rpg-dim text-[8px] px-4 py-2 tracking-widest hover:text-rpg-gold disabled:opacity-40">
                  {badgeSaving ? "SAVING..." : "SAVE BADGE INFO"}
                </button>
              </div>
            </>
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
        <button onClick={handleSave} disabled={saving}
          className="pixel-btn-gold text-[9px] px-6 py-3 tracking-widest disabled:opacity-40">
          {saving ? "SAVING..." : "▶ SAVE QUEST"}
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
