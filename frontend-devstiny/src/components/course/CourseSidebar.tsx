"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";

export interface SidebarAct {
  id: string; slug: string; title: string; order: number;
  description: string; isFinalAct: boolean;
}

export interface SidebarChapter {
  title: string; realm: string; description: string;
  acts: SidebarAct[];
}

interface CourseSidebarProps {
  chapter: SidebarChapter;
  actSlug: string;
  chapterSlug: string;
  actXpReward: number;
}

// Module-level cache — survives remounts within the same browser session.
// completedScenes is player-level data, same regardless of which act/chapter.
let _cachedScenes: string[] | null = null;

export default function CourseSidebar({ chapter, actSlug, chapterSlug, actXpReward }: CourseSidebarProps) {
  const [completedScenes, setCompletedScenes] = useState<string[]>(_cachedScenes ?? []);
  const [loading, setLoading] = useState(_cachedScenes === null);
  const activeRef = useRef<HTMLAnchorElement | null>(null);

  // Scroll active act into view after render
  useEffect(() => {
    if (!loading && activeRef.current) {
      activeRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [loading, actSlug]);

  useEffect(() => {
    const fetchScenes = () =>
      apiGet<{ completedScenes: string[] }>("/players/me")
        .then((d) => {
          const scenes = d?.completedScenes ?? [];
          _cachedScenes = scenes;
          setCompletedScenes(scenes);
        })
        .catch(() => {
          if (_cachedScenes === null) setCompletedScenes([]);
        });

    if (_cachedScenes !== null) {
      // Cache hit: show immediately, revalidate silently in background
      setCompletedScenes(_cachedScenes);
      setLoading(false);
      fetchScenes();
    } else {
      // First visit: show skeleton until data arrives
      setLoading(true);
      fetchScenes().finally(() => setLoading(false));
    }
  }, [chapterSlug]);

  const key = (slug: string) => `${chapterSlug}/${slug}`;
  const isDone = (slug: string) => completedScenes.includes(key(slug));

  const regularActs = chapter.acts.filter((a) => !a.isFinalAct).sort((a, b) => a.order - b.order);
  const finalAct    = chapter.acts.find((a) => a.isFinalAct);

  const completedOrders = regularActs.filter((a) => isDone(a.slug)).map((a) => a.order);
  const maxCompleted    = completedOrders.length > 0 ? Math.max(...completedOrders) : 0;
  const canAccess       = (order: number) => order <= maxCompleted + 1;
  const allRegularDone  = regularActs.every((a) => isDone(a.slug));

  const completedCount = chapter.acts.filter((a) => isDone(a.slug)).length;
  const pct            = chapter.acts.length > 0 ? Math.round((completedCount / chapter.acts.length) * 100) : 0;
  const xpEarned       = completedCount * actXpReward;
  const xpTotal        = chapter.acts.length * actXpReward;

  function ActRow({ a, locked = false }: { a: SidebarAct; locked?: boolean }) {
    const isActive = a.slug === actSlug;
    const done     = isDone(a.slug);
    const href     = `/path/${chapterSlug}/${a.slug}`;

    if (locked) return (
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-2 border-transparent opacity-40 cursor-not-allowed">
        <span className="text-rpg-dim text-xs" style={{ fontFamily: "var(--font-pixel)" }}>○</span>
        <span className="flex-1 min-w-0">
          <span className="block text-xs text-rpg-dim leading-4 truncate">{a.isFinalAct ? a.title : `${String(a.order).padStart(2, "0")}. ${a.title}`}</span>
          <span className="block text-rpg-dim mt-0.5 truncate text-xs">{a.description.slice(0, 40)}…</span>
        </span>
      </div>
    );

    return (
      <Link href={href}
        ref={isActive ? activeRef : null}
        className={`flex items-center gap-2.5 px-3 py-2.5 border-2 transition-colors no-underline
          ${isActive ? "border-rpg-gold bg-rpg-bg" : "border-transparent hover:border-rpg-border"}`}>
        <span className={`text-xs shrink-0 ${isActive ? "text-rpg-gold" : done ? "text-rpg-green" : "text-rpg-dim"}`}
          style={{ fontFamily: "var(--font-pixel)" }}>
          {done ? "◆" : isActive ? "▶" : "○"}
        </span>
        <span className="flex-1 min-w-0">
          <span className={`block text-xs leading-4 truncate ${isActive ? "text-rpg-gold" : "text-rpg-text"}`}>
            {a.isFinalAct ? a.title : `${String(a.order).padStart(2, "0")}. ${a.title}`}
          </span>
          <span className="block text-rpg-dim mt-0.5 truncate text-xs">{a.description.slice(0, 40)}…</span>
        </span>
      </Link>
    );
  }

  return (
    <aside className="w-72 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto border-r-4 border-rpg-border bg-rpg-panel flex flex-col">
      {/* Header */}
      <div className="p-4 border-b-4 border-rpg-border flex flex-col gap-3">
        <Link href="/path"
          className="text-rpg-dim hover:text-rpg-text no-underline transition-colors"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
          ← {chapter.title.toUpperCase()}
        </Link>
        <h2 className="text-rpg-gold leading-5" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>
          {chapter.realm.toUpperCase()}
        </h2>
        <p className="text-xs text-rpg-dim leading-5">{chapter.description}</p>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>PROGRESS</span>
            <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
              {loading ? (
                <span className="opacity-40">…/{chapter.acts.length} ACTS</span>
              ) : (
                `${completedCount}/${chapter.acts.length} ACTS`
              )}
            </span>
          </div>
          <div className="h-2 border border-rpg-border bg-rpg-bg overflow-hidden">
            <div
              className={`h-full bg-rpg-green xp-bar-fill transition-opacity ${loading ? "opacity-0" : "opacity-100"}`}
              style={{ ["--xp-w" as string]: `${pct || 2}%` }}
            />
          </div>
        </div>
      </div>

      {/* Act list */}
      <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
        <span className="text-rpg-dim px-1 py-2 tracking-widest"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>ACTS</span>

        {loading ? (
          // Skeleton while loading
          Array.from({ length: chapter.acts.length }, (_, i) => (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 opacity-30 animate-pulse">
              <span className="text-rpg-dim text-xs" style={{ fontFamily: "var(--font-pixel)" }}>○</span>
              <div className="flex-1 flex flex-col gap-1">
                <div className="h-2.5 bg-rpg-border rounded w-3/4" />
                <div className="h-2 bg-rpg-border rounded w-1/2" />
              </div>
            </div>
          ))
        ) : (
          <>
            {regularActs.map((a) => {
              const accessible = a.slug === actSlug || isDone(a.slug) || canAccess(a.order);
              return <ActRow key={a.id} a={a} locked={!accessible} />;
            })}

            {finalAct && (
              <div className="mt-2 border-t-2 border-rpg-border pt-2">
                <span className="text-rpg-dim px-1 py-1 tracking-widest block"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>FINAL ACT</span>
                <ActRow a={finalAct} locked={!allRegularDone && finalAct.slug !== actSlug && !isDone(finalAct.slug)} />
              </div>
            )}
          </>
        )}
      </nav>

      {/* XP footer */}
      <div className="p-4 border-t-4 border-rpg-border">
        <div className="pixel-panel-gold p-2 flex items-center justify-between">
          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>XP EARNED</span>
          <span className="text-rpg-gold text-glow-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}>
            {loading ? "…" : `${xpEarned} / ${xpTotal}`}
          </span>
        </div>
      </div>
    </aside>
  );
}
