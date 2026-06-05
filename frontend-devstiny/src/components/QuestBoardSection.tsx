"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";

interface ApiQuest {
  id: string; slug: string; title: string; tier: number; character: string;
  loreHook: string; concepts: string[]; rewardXp: number; rewardGold: number;
}

const tierConfig = {
  1: { label: "FRAGMENT", color: "text-rpg-green",  border: "border-rpg-green"  },
  2: { label: "CIPHER",   color: "text-rpg-gold",   border: "border-rpg-gold"   },
  3: { label: "RELIC",    color: "text-rpg-purple",  border: "border-rpg-purple" },
} as const;

const characterConfig: Record<string, { label: string; color: string }> = {
  ferrus: { label: "FERRUS", color: "text-rpg-red"    },
  lyra:   { label: "LYRA",   color: "text-rpg-purple" },
  somers: { label: "SOMERS", color: "text-rpg-gold"   },
};

export default function QuestBoardSection() {
  const [featured, setFeatured] = useState<ApiQuest[]>([]);

  useEffect(() => {
    apiGet<ApiQuest[]>("/quests")
      .then((qs) => setFeatured((qs ?? []).slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <section className="py-20 px-4 bg-rpg-panel border-y-4 border-rpg-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-rpg-dim tracking-widest mb-3" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>
            QUEST BOARD
          </p>
          <h2 className="text-lg sm:text-xl md:text-2xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">
            CHOOSE YOUR QUEST
          </h2>
          <div className="w-32 pixel-divider-gold mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((quest) => {
            const tier = tierConfig[quest.tier as 1 | 2 | 3];
            const char = characterConfig[quest.character] ?? { label: quest.character.toUpperCase(), color: "text-rpg-dim" };
            return (
              <Link key={quest.id} href={`/quests/${quest.slug}`}
                className="border-2 border-rpg-border bg-rpg-panel p-5 flex flex-col gap-4 hover:border-rpg-gold transition-colors no-underline group cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className={`border text-[7px] px-2 py-0.5 tracking-widest ${tier.color} ${tier.border}`}
                    style={{ fontFamily: "var(--font-pixel)" }}>
                    {tier.label}
                  </span>
                  <span className={`text-[7px] tracking-widest ${char.color}`} style={{ fontFamily: "var(--font-pixel)" }}>
                    {char.label}
                  </span>
                </div>

                <h3 className="text-sm text-rpg-text tracking-wide group-hover:text-rpg-gold transition-colors leading-5">
                  {quest.title.toUpperCase()}
                </h3>

                <p className="text-xs text-rpg-dim leading-5 line-clamp-3 flex-1">{quest.loreHook}</p>

                <div className="flex flex-wrap gap-1">
                  {quest.concepts.slice(0, 3).map((c) => (
                    <span key={c} className="border border-rpg-border text-rpg-dim px-2 py-0.5"
                      style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}>
                      {c}
                    </span>
                  ))}
                </div>

                <div className="pixel-divider" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                      +{quest.rewardXp} XP
                    </span>
                    <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                      +{quest.rewardGold} G
                    </span>
                  </div>
                  <span className="text-rpg-dim group-hover:text-rpg-gold transition-colors"
                    style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                    ▶ START
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link href="/quests"
            className="pixel-btn bg-transparent text-rpg-dim text-[8px] px-6 py-3 no-underline tracking-widest hover:text-rpg-text">
            VIEW ALL QUESTS →
          </Link>
        </div>
      </div>
    </section>
  );
}
