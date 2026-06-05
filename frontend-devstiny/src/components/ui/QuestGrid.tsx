"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const tierConfig = {
  1: { label: "FRAGMENT", color: "text-rpg-green",  border: "border-rpg-green",  hex: "#40e070" },
  2: { label: "CIPHER",   color: "text-rpg-gold",   border: "border-rpg-gold",   hex: "#f0c040" },
  3: { label: "RELIC",    color: "text-rpg-purple",  border: "border-rpg-purple", hex: "#c060e0" },
} as Record<number, { label: string; color: string; border: string; hex: string }>;

const TIER_FILTERS = [
  { value: 0, label: "ALL"      },
  { value: 1, label: "FRAGMENT" },
  { value: 2, label: "CIPHER"   },
  { value: 3, label: "RELIC"    },
];

const LIMIT = 9;

interface ApiQuest {
  id: string; slug: string; title: string; tier: number;
  character: string; loreHook: string; concepts: string[];
  rewardXp: number; rewardGold: number; rewardBadge: string;
  isActive: boolean;
}

export default function QuestGrid() {
  const { user, ready } = useAuth();
  const isLoggedIn = ready && !!user;

  const [quests,          setQuests]          = useState<ApiQuest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [fetching,        setFetching]        = useState(false);
  const [tierFilter,      setTierFilter]      = useState(0);
  const [page,            setPage]            = useState(1);
  const [total,           setTotal]           = useState(0);

  const totalPages = Math.ceil(total / LIMIT);

  // Fetch completed quests once
  useEffect(() => {
    apiGet<{ completedScenes: string[] }>("/players/me")
      .then((d) => {
        const done = (d?.completedScenes ?? [])
          .filter((s) => s.startsWith("quest/"))
          .map((s) => s.replace("quest/", ""));
        setCompletedQuests(done);
      })
      .catch(() => {});
  }, []);

  // Fetch quests on page / tier change
  useEffect(() => {
    setFetching(true);
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (tierFilter !== 0) params.set("tier", String(tierFilter));

    apiGet<{ quests: ApiQuest[]; total: number }>(`/quests?${params}`)
      .then((d) => {
        setQuests(d?.quests ?? []);
        setTotal(d?.total ?? 0);
      })
      .catch(() => {})
      .finally(() => { setLoading(false); setFetching(false); });
  }, [page, tierFilter]);

  function handleTierChange(tier: number) {
    setTierFilter(tier);
    setPage(1);
  }

  const isDone = (slug: string) => completedQuests.includes(slug);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>
          LOADING...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      {/* Tier filter + count */}
      <div className="flex items-center gap-2 flex-wrap">
        {TIER_FILTERS.map((f) => {
          const tc = tierConfig[f.value];
          const isActive = tierFilter === f.value;
          return (
            <button key={f.value} onClick={() => handleTierChange(f.value)}
              className="px-3 py-1.5 border text-[8px] tracking-wider transition-colors"
              style={{
                fontFamily:  "var(--font-pixel)",
                borderColor: isActive ? (tc?.hex ?? "#f0c040") : "#3d2d8c",
                color:       isActive ? (tc?.hex ?? "#f0c040") : "#b4b4df",
                background:  isActive ? `${tc?.hex ?? "#f0c040"}15` : "transparent",
              }}>
              {f.label}
            </button>
          );
        })}
        <span className="ml-auto text-rpg-dim text-xs" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
          {total} QUESTS
        </span>
      </div>

      {/* Grid */}
      <div className={`transition-opacity duration-150 ${fetching ? "opacity-50" : "opacity-100"}`}>
        {quests.length === 0 ? (
          <div className="flex justify-center py-16">
            <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>NO QUESTS</span>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quests.map((quest) => {
              const tier      = tierConfig[quest.tier] ?? tierConfig[1];
              const completed = isDone(quest.slug);

              return (
                <Link
                  key={quest.id}
                  href={isLoggedIn ? `/quests/${quest.slug}` : `/login?redirect=/quests/${quest.slug}`}
                  className={`border-2 bg-rpg-panel flex flex-col gap-3 transition-colors no-underline group cursor-pointer p-5
                    ${completed ? "border-rpg-green hover:border-rpg-gold" : "border-rpg-border hover:border-rpg-gold"}`}
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <span className={`border text-[7px] px-2 py-0.5 tracking-widest ${tier.color} ${tier.border}`}
                      style={{ fontFamily: "var(--font-pixel)" }}>
                      {tier.label}
                    </span>
                    <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                      {quest.id}
                    </span>
                  </div>

                  <h3 className="text-sm text-rpg-text tracking-wide group-hover:text-rpg-gold transition-colors leading-5">
                    {quest.title.toUpperCase()}
                  </h3>

                  <p className="text-xs text-rpg-dim leading-5 line-clamp-3">{quest.loreHook}</p>

                  <div className="pixel-divider mt-auto" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                        +{quest.rewardXp} XP
                      </span>
                      <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                        +{quest.rewardGold} G
                      </span>
                    </div>
                    {completed ? (
                      <span className="text-rpg-green border border-rpg-green px-2 py-0.5 tracking-widest"
                        style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                        ✓ DONE
                      </span>
                    ) : (
                      <span className="text-rpg-dim group-hover:text-rpg-gold transition-colors"
                        style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                        ▶ START
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || fetching}
            className="pixel-btn text-rpg-dim text-[8px] px-4 py-2 tracking-widest disabled:opacity-30"
          >
            ← PREV
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                disabled={fetching}
                className="px-3 py-1.5 border transition-colors disabled:opacity-50"
                style={{
                  fontFamily:  "var(--font-pixel)",
                  fontSize:    8,
                  borderColor: page === p ? "#f0c040" : "#3d2d8c",
                  color:       page === p ? "#f0c040" : "#b4b4df",
                  background:  page === p ? "rgba(240,192,64,0.08)" : "transparent",
                }}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || fetching}
            className="pixel-btn text-rpg-dim text-[8px] px-4 py-2 tracking-widest disabled:opacity-30"
          >
            NEXT →
          </button>
        </div>
      )}
    </div>
  );
}
