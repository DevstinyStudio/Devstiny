"use client";

import { useState, useEffect } from "react";
import ChapterCard from "./ChapterCard";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Chapter as UIChapter, ChapterStatus } from "@/types/chapter";

// ─── API types ────────────────────────────────────────────────────────────────

interface ApiAct {
  id: string; slug: string; title: string; order: number;
  description: string; isFinalAct: boolean; isLocked: boolean;
}

interface ApiChapter {
  id: string; slug: string; title: string; realm: string; order: number;
  isLocked: boolean; coverImage: string; description: string;
  openingNarrative: string; worldContext: string; archonIntro: string;
  rewardXp: number; rewardGold: number; rewardBadge: string; rewardTitle: string;
  estimatedHours: number; difficulty: string; skills: string[]; tags: string[];
  npcImage: string; type: string; typeColor: string;
  acts: ApiAct[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeStatus(
  all: ApiChapter[],
  c: ApiChapter,
  completedChapters: string[],
): ChapterStatus {
  if (completedChapters.includes(c.slug)) return "completed";
  const sorted = [...all].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((x) => x.slug === c.slug);
  if (idx === 0) return "active";
  const prev = sorted[idx - 1];
  return completedChapters.includes(prev.slug) ? "active" : "locked";
}

function formatDuration(hours: number): string {
  if (hours < 40) return `${hours} HRS`;
  return `${Math.round(hours / 40)} WEEKS`;
}

function btnClassFor(status: ChapterStatus, type: string): string {
  if (status === "locked")    return "pixel-btn";
  if (status === "completed") return "pixel-btn";
  if (type === "FINALE")      return "pixel-btn-gold";
  return "pixel-btn-primary";
}

function resumeAct(c: ApiChapter, completedScenes: string[]): string {
  const regular = c.acts.filter((a) => !a.isFinalAct).sort((a, b) => a.order - b.order);
  const finalAct = c.acts.find((a) => a.isFinalAct);
  const next = regular.find((a) => !completedScenes.includes(`${c.slug}/${a.slug}`));
  if (next) return next.slug;
  return finalAct?.slug ?? regular[regular.length - 1]?.slug ?? "act-1";
}

function toUIChapter(
  all: ApiChapter[],
  c: ApiChapter,
  completedChapters: string[],
  completedScenes: string[],
  isLoggedIn: boolean,
): UIChapter & { id: number } {
  const status = computeStatus(all, c, completedChapters);

  let href: string | undefined;
  if (status !== "locked") {
    href = isLoggedIn ? `/path/${c.slug}/${resumeAct(c, completedScenes)}` : "/login";
  }

  return {
    id:          c.order,
    label:       c.type === "STORY" ? "PROLOGUE"
               : c.type === "FINALE" ? "FINALE"
               : (() => {
                   const m = c.slug.match(/chapter-(\d+)-part-(\d+)/);
                   return m ? `CHAPTER ${m[1]}-${m[2]}` : `CHAPTER ${c.order}`;
                 })(),
    title:       c.title.toUpperCase(),
    type:        c.type,
    typeColor:   c.typeColor,
    typeBg:      c.typeColor.replace("text-", "border-"),
    accentColor: c.typeColor,
    icon:        c.type === "FINALE" ? "◈" : "◉",
    image:       c.npcImage || undefined,
    story:       c.openingNarrative,
    skills:      c.skills,
    xp:          c.rewardXp,
    gold:        c.rewardGold,
    duration:    formatDuration(c.estimatedHours),
    status,
    btnClass:    btnClassFor(status, c.type),
    href,
  };
}

// ─── Overall Progress ─────────────────────────────────────────────────────────

function OverallProgress({ chapters }: { chapters: (UIChapter & { id: number })[] }) {
  const completed = chapters.filter((c) => c.status === "completed").length;
  const total     = chapters.length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="pixel-panel flex flex-col gap-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <span className="text-rpg-text tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
          CHRONICLE PROGRESS
        </span>
        <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
          {completed}/{total} CHAPTERS
        </span>
      </div>

      <div className="h-4 border-2 border-rpg-border bg-rpg-bg overflow-hidden">
        <div className="h-full bg-rpg-green xp-bar-fill"
          style={{ ["--xp-w" as string]: `${pct || 2}%` }} />
      </div>

      <div className="flex items-start justify-between">
        {chapters.map((c) => (
          <div key={c.id} className="flex flex-col items-center gap-1">
            <span className={
              c.status === "completed" ? "text-rpg-green"
              : c.status === "active"  ? "text-rpg-gold blink"
              : "text-rpg-dim"
            }>
              {c.status === "completed" ? "◆" : c.status === "active" ? "▶" : "○"}
            </span>
            <span className="text-rpg-dim text-center leading-4" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
              {c.label.split(" ").map((word, i) => (
                <span key={i} className="block">{word}</span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function PathContent() {
  const { user, ready } = useAuth();
  const isLoggedIn = ready && user !== null;

  const [apiChapters,       setApiChapters]       = useState<ApiChapter[]>([]);
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  const [completedScenes,   setCompletedScenes  ] = useState<string[]>([]);
  const [loading,           setLoading]           = useState(true);

  useEffect(() => {
    apiGet<ApiChapter[]>("/path")
      .then((d) => setApiChapters((d ?? []).sort((a, b) => a.order - b.order)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    apiGet<{ completedChapters: string[]; completedScenes: string[] }>("/players/me")
      .then((data) => {
        setCompletedChapters(data.completedChapters ?? []);
        setCompletedScenes(data.completedScenes ?? []);
      })
      .catch(() => {});
  }, [isLoggedIn]);

  const uiChapters = apiChapters.map((c) =>
    toUIChapter(apiChapters, c, completedChapters, completedScenes, isLoggedIn),
  );

  return (
    <>
      {/* Progress */}
      <section className="py-10 px-4 bg-rpg-panel border-y-4 border-rpg-border">
        {loading ? (
          <div className="max-w-3xl mx-auto text-center py-4">
            <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>LOADING...</span>
          </div>
        ) : (
          <OverallProgress chapters={uiChapters} />
        )}
      </section>

      {/* Chapter list */}
      <section className="py-16 px-4 bg-rpg-bg">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          <div className="text-center mb-4">
            <p className="text-rpg-dim tracking-widest mb-2"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>
              SELECT CHAPTER
            </p>
            <h2 className="text-base sm:text-lg text-rpg-text text-pixel-shadow tracking-widest">
              YOUR JOURNEY SO FAR
            </h2>
            <div className="w-24 pixel-divider mx-auto mt-3" />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>LOADING CHAPTERS...</span>
            </div>
          ) : (
            uiChapters.map(({ id, href, ...props }) => (
              <ChapterCard key={id} href={href} {...props} />
            ))
          )}
        </div>
      </section>
    </>
  );
}
