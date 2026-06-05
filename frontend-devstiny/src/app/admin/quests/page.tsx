"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { apiGet, apiPatch } from "@/lib/api";

const TIER_CONFIG = {
  1: { label: "FRAGMENT", color: "#40e070" },
  2: { label: "CIPHER",   color: "#f0c040" },
  3: { label: "RELIC",    color: "#c060e0" },
} as Record<number, { label: string; color: string }>;

const CHAR_CONFIG: Record<string, { label: string; color: string }> = {
  ferrus: { label: "FERRUS",  color: "#e05050" },
  lyra:   { label: "LYRA",    color: "#c060e0" },
  somers: { label: "SOMERS",  color: "#40d0e0" },
  elvar:  { label: "ELVAR",   color: "#f0c040" },
};

interface AdminQuest {
  id: string; slug: string; title: string; tier: number;
  character: string; loreHook: string;
  rewardXp: number; rewardGold: number; rewardBadge: string;
  isActive: boolean; order: number;
}

interface BadgeRecord { key: string; name: string; }

export default function AdminQuestsPage() {
  const [quests,    setQuests]    = useState<AdminQuest[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [filterTier, setFilterTier] = useState<number | "all">("all");
  const [badgeMap,  setBadgeMap]  = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    apiGet<AdminQuest[]>("/admin/quests")
      .then((d) => setQuests(d ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    apiGet<BadgeRecord[]>("/badges")
      .then((badges) => {
        const map: Record<string, string> = {};
        badges.forEach((b) => { map[b.key] = b.name; });
        setBadgeMap(map);
      })
      .catch(() => {});
  }, []);

  async function toggleActive(quest: AdminQuest) {
    try {
      const updated = await apiPatch<AdminQuest>(`/admin/quests/${quest.id}`, { isActive: !quest.isActive });
      setQuests((prev) => prev.map((q) => q.id === updated.id ? updated : q));
    } catch { /* ignore */ }
  }


  const filtered = quests.filter((q) => filterTier === "all" || q.tier === filterTier);

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>ADMIN PANEL</p>
          <h1 className="text-2xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">QUESTS</h1>
          <div className="w-16 pixel-divider-gold mt-1" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
            {quests.filter((q) => q.isActive).length} ACTIVE / {quests.length} TOTAL
          </span>
          <Link href="/admin/quests/new"
            className="pixel-btn-gold text-[9px] px-4 py-2 no-underline tracking-widest">
            + NEW QUEST
          </Link>
        </div>
      </div>

      {/* Tier filter */}
      <div className="flex items-center gap-2">
        {([["all", "ALL", "#b4b4df"], [1, "FRAGMENT", "#40e070"], [2, "CIPHER", "#f0c040"], [3, "RELIC", "#c060e0"]] as const).map(([val, label, color]) => (
          <button key={String(val)} onClick={() => setFilterTier(val as number | "all")}
            className="px-3 py-1.5 border-2 text-[8px] tracking-wider transition-colors"
            style={{
              fontFamily: "var(--font-pixel)",
              borderColor: filterTier === val ? color : "#3d2d8c",
              color:       filterTier === val ? color : "#b4b4df",
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Quest table */}
      <div className="pixel-panel p-0 overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-rpg-border">
              {["ID", "TITLE", "TIER", "CHARACTER", "XP", "GOLD", "BADGE", "STATUS", "ACTION"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-rpg-dim"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="text-center py-12">
                <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>LOADING...</span>
              </td></tr>
            ) : filtered.map((q) => {
              const tier = TIER_CONFIG[q.tier];
              const char = CHAR_CONFIG[q.character];
              return (
                <tr key={q.id} className="border-b border-rpg-border/30 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>{q.id}</span>
                  </td>
                  <td className="px-4 py-3 text-rpg-text text-sm font-medium max-w-48">{q.title}</td>
                  <td className="px-4 py-3">
                    <span style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: tier?.color ?? "#b4b4df" }}>
                      {tier?.label ?? q.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: char?.color ?? "#b4b4df" }}>
                      {char?.label ?? q.character}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-rpg-gold text-xs">{q.rewardXp}</td>
                  <td className="px-4 py-3 text-rpg-gold text-xs">{q.rewardGold}</td>
                  <td className="px-4 py-3 text-xs">
                    {q.rewardBadge ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-rpg-gold">{badgeMap[q.rewardBadge] ?? q.rewardBadge}</span>
                        <span className="text-rpg-dim/60 font-mono text-[10px]">{q.rewardBadge}</span>
                      </div>
                    ) : (
                      <span className="text-rpg-dim">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(q)}
                      className="border px-2 py-0.5 transition-colors"
                      style={{
                        fontFamily: "var(--font-pixel)", fontSize: 7,
                        borderColor: q.isActive ? "#40e070" : "#3d2d8c",
                        color:       q.isActive ? "#40e070" : "#b4b4df",
                      }}>
                      {q.isActive ? "ACTIVE" : "HIDDEN"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/quests/${q.id}`}
                      className="text-rpg-dim hover:text-rpg-gold no-underline transition-colors"
                      style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                      EDIT
                    </Link>
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
