"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getUser } from "@/lib/api";

const NAV = [
  { label: "DASHBOARD",  href: "/admin",             icon: "◈" },
  { label: "USERS",      href: "/admin/users",        icon: "♟" },
  { label: "CATEGORIES", href: "/admin/categories",  icon: "▦" },
  { label: "COSTUMES",   href: "/admin/costumes",    icon: "◉" },
  { label: "QUESTS",     href: "/admin/quests",      icon: "⚔" },
  { label: "BOOKS",      href: "/admin/books",       icon: "▤" },
  { label: "PATH",       href: "/admin/path",        icon: "◆" },
  { label: "MEDIA",      href: "/admin/media",       icon: "▣" },
  { label: "SETTINGS",  href: "/admin/settings",    icon: "⚙" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "ADMIN") {
      router.replace("/");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-rpg-bg flex items-center justify-center">
        <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>
          LOADING...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rpg-bg flex">
      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <aside className="w-52 shrink-0 bg-rpg-panel border-r-4 border-rpg-border flex flex-col sticky top-0 h-screen overflow-y-auto">
        {/* Brand */}
        <div className="px-5 py-5 border-b-4 border-rpg-border">
          <Link href="/" className="no-underline flex flex-col gap-1">
            <span className="text-rpg-gold text-pixel-shadow"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}>
              DEVSTINY
            </span>
            <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
              ADMIN PANEL
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="no-underline flex items-center gap-3 px-3 py-2.5 transition-colors"
                style={{
                  background: active ? "rgba(240,192,64,0.08)" : "transparent",
                  borderLeft: active ? "3px solid #f0c040" : "3px solid transparent",
                  color: active ? "#f0c040" : "#b4b4df",
                }}
              >
                <span style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}>{item.icon}</span>
                <span style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Back to site */}
        <div className="p-3 border-t-4 border-rpg-border">
          <Link
            href="/"
            className="no-underline flex items-center gap-2 px-3 py-2 text-rpg-dim hover:text-rpg-text transition-colors"
          >
            <span style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>←</span>
            <span style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>BACK TO SITE</span>
          </Link>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
