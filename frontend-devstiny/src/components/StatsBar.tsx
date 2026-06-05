"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

const STATIC = [
  { gem: "/gem/gem-6.png",  label: "ADVENTURERS", key: "adventurers" },
  { gem: "/gem/gem-14.png", label: "QUESTS DONE", key: "questsDone"  },
  { gem: "/gem/gem-33.png", label: "ITEMS",        key: "items"       },
  { gem: "/gem/gem-28.png", label: "GUILDS",       key: "guilds"      },
] as const;

interface SiteStats {
  adventurers: number;
  questsDone:  number;
  items:       number;
  guilds:      number;
}

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K+`;
  return n.toLocaleString();
}

export default function StatsBar() {
  const [stats, setStats] = useState<SiteStats | null>(null);

  useEffect(() => {
    apiGet<SiteStats>("/stats")
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <section className="border-y-4 border-rpg-border bg-rpg-panel">
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-px bg-rpg-border">
        {STATIC.map((s) => (
          <div
            key={s.label}
            className="bg-rpg-panel flex flex-col items-center gap-2 py-6 px-4"
          >
            <img
              src={s.gem}
              alt={s.label}
              style={{ width: 30, height: 30, imageRendering: "pixelated", objectFit: "contain" }}
            />
            <span
              className="text-rpg-text text-pixel-shadow"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 20 }}
            >
              {stats ? fmt(stats[s.key]) : "—"}
            </span>
            <span
              className="text-rpg-dim tracking-widest"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
