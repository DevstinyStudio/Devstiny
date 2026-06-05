"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuestGrid from "@/components/ui/QuestGrid";
import { apiGet } from "@/lib/api";

const tierConfig = {
  1: { label: "FRAGMENT", color: "text-rpg-green",  border: "border-rpg-green"  },
  2: { label: "CIPHER",   color: "text-rpg-gold",   border: "border-rpg-gold"   },
  3: { label: "RELIC",    color: "text-rpg-purple",  border: "border-rpg-purple" },
};

interface QuestSummary { rewardXp: number; rewardGold: number; tier: number; }

export default function QuestsPage() {
  const [totalXP,    setTotalXP]    = useState(0);
  const [totalGold,  setTotalGold]  = useState(0);
  const [tierCounts, setTierCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    apiGet<{ quests: QuestSummary[] }>("/quests?limit=999")
      .then(({ quests: qs }) => {
        setTotalXP(qs.reduce((s, q) => s + q.rewardXp, 0));
        setTotalGold(qs.reduce((s, q) => s + q.rewardGold, 0));
        const counts: Record<number, number> = {};
        qs.forEach((q) => { counts[q.tier] = (counts[q.tier] ?? 0) + 1; });
        setTierCounts(counts);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-rpg-bg pt-14">
        {/* Hero */}
        <section className="border-b-4 border-rpg-border bg-rpg-panel px-4 py-12">
          <div className="max-w-5xl mx-auto flex items-start gap-6">
            <Image src="/NPC/elvar-head.png" alt="Ferrus" width={64} height={64}
              style={{ imageRendering: "pixelated" }} className="shrink-0 mt-1" />
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex items-center gap-3">
                <span className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                  SIDE QUESTS
                </span>
                <div className="flex-1 h-px bg-rpg-border" />
                <span className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                  THE BROKEN REALM
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">
                CODING QUESTS
              </h1>

              <p className="text-sm text-rpg-dim leading-7 max-w-2xl">
                The companions of The Broken Realm have problems. Real ones.
                Each quest is a request — from someone you already know — that only code can solve.
              </p>

              {/* Tier legend + stats */}
              <div className="flex flex-wrap items-center gap-3 mt-1">
                {([1, 2, 3] as const).map((tier) => {
                  const t = tierConfig[tier];
                  const count = tierCounts[tier];
                  return (
                    <div key={tier} className={`flex items-center gap-2 border px-3 py-1.5 ${t.border}`}>
                      <span className={t.color} style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                        TIER {tier} — {t.label}
                      </span>
                      {count !== undefined && (
                        <span className={`${t.color} opacity-60`} style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                          ({count})
                        </span>
                      )}
                    </div>
                  );
                })}
                {totalXP > 0 && (
                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                      {totalXP} XP AVAILABLE
                    </span>
                    <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                      {totalGold} G
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Quest Grid */}
        <section className="py-16 px-4 bg-rpg-panel border-y-4 border-rpg-border">
          <QuestGrid />
        </section>
      </main>
      <Footer />
    </>
  );
}
