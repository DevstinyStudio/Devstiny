"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface Stats { players: number; threads: number; replies: number; categories: number }

const STAT_CARDS = [
  { key: "players",    label: "TOTAL USERS",       icon: "♟", color: "#40d0e0" },
  { key: "threads",    label: "FORUM THREADS",     icon: "▤", color: "#f0c040" },
  { key: "replies",    label: "FORUM REPLIES",     icon: "▥", color: "#40e070" },
  { key: "categories", label: "CATEGORIES",        icon: "▦", color: "#c060e0" },
] as const;

export default function AdminDashboard() {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Stats>("/admin/stats")
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
          ADMIN PANEL
        </p>
        <h1 className="text-2xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">
          DASHBOARD
        </h1>
        <div className="w-24 pixel-divider-gold mt-1" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className="pixel-panel flex flex-col gap-3">
            <span
              className="text-pixel-shadow"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 28, color: card.color }}
            >
              {loading ? "—" : (stats?.[card.key] ?? 0).toLocaleString()}
            </span>
            <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
              {card.label}
            </span>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="flex flex-col gap-4">
        <span className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
          QUICK ACTIONS
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { href: "/admin/users",      label: "Manage Users",            desc: "View, promote, or remove players",          color: "#40d0e0" },
            { href: "/admin/categories", label: "Manage Forum Categories", desc: "Add, edit, reorder or delete categories",    color: "#c060e0" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="pixel-panel no-underline group hover:border-rpg-gold transition-colors flex flex-col gap-2"
            >
              <span className="text-sm font-medium group-hover:text-rpg-gold transition-colors"
                style={{ color: item.color }}>
                {item.label}
              </span>
              <span className="text-xs text-rpg-dim leading-5">{item.desc}</span>
              <span className="text-rpg-dim group-hover:text-rpg-gold transition-colors self-end"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                OPEN →
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
