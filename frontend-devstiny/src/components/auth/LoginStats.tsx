"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface SiteStats { adventurers: number; questsDone: number; items: number; guilds: number }

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K+`;
  return n > 0 ? String(n) : "—";
}

export default function LoginStats() {
  const [stats, setStats] = useState<SiteStats | null>(null);

  useEffect(() => {
    apiGet<SiteStats>("/stats").then(setStats).catch(() => {});
  }, []);

  const items = [
    { icon: "★", label: stats ? fmt(stats.adventurers) : "—", sub: "ADVENTURERS" },
    { icon: "⚔", label: stats ? fmt(stats.questsDone)  : "—", sub: "QUESTS DONE" },
    { icon: "◆", label: stats ? fmt(stats.items)       : "—", sub: "ITEMS"       },
  ];

  return (
    <div className="pixel-panel grid grid-cols-3 gap-px bg-rpg-border">
      {items.map((s) => (
        <div key={s.sub} className="bg-rpg-panel flex flex-col items-center gap-1 py-3">
          <span className="text-rpg-gold text-base">{s.icon}</span>
          <span className="text-rpg-text text-pixel-shadow"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>
            {s.label}
          </span>
          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}>
            {s.sub}
          </span>
        </div>
      ))}
    </div>
  );
}
