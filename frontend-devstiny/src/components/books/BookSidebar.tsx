"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Chapter {
  title: string;
}

interface BookSidebarProps {
  chapters: Chapter[];
  color: string;
  volume: string;
  title: string;
  prevSlug?: string;
  prevTitle?: string;
  nextSlug?: string;
  nextTitle?: string;
}

export default function BookSidebar({
  chapters,
  color,
  volume,
  title,
  prevSlug,
  prevTitle,
  nextSlug,
  nextTitle,
}: BookSidebarProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const observers = chapters.map((_, i) => {
      const el = document.getElementById(`ch-${i}`);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIdx(i);
        },
        { rootMargin: "-10% 0px -75% 0px" }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((obs) => obs?.disconnect());
  }, [chapters]);

  return (
    <aside className="hidden lg:flex flex-col gap-4 sticky top-20 h-fit w-52 shrink-0">
      <Link
        href="/books"
        className="text-rpg-dim hover:text-rpg-text no-underline transition-colors"
        style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
      >
        ← THE LIBRARY
      </Link>

      <div className="pixel-panel p-4 flex flex-col gap-3">
        {/* Volume label */}
        <div className="flex flex-col gap-1 pb-1">
          <span
            className="text-rpg-dim tracking-widest"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
          >
            {volume}
          </span>
          <span className={`text-xs font-medium leading-5 tracking-wide ${color}`}>
            {title}
          </span>
        </div>

        <div className="pixel-divider" />

        {/* Chapter list */}
        <nav className="flex flex-col">
          {chapters.map((ch, i) => (
            <a
              key={i}
              href={`#ch-${i}`}
              className={`flex items-start gap-2 no-underline py-1.5 px-2 rounded transition-colors ${
                activeIdx === i
                  ? `${color} bg-rpg-bg`
                  : "text-rpg-dim hover:text-rpg-text"
              }`}
            >
              <span
                className="shrink-0 mt-0.5"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-xs leading-5">{ch.title}</span>
            </a>
          ))}
        </nav>

        {/* Prev / Next volume */}
        {(prevSlug || nextSlug) && (
          <>
            <div className="pixel-divider" />
            <div className="flex flex-col gap-1.5">
              {prevSlug && (
                <Link
                  href={`/books/${prevSlug}`}
                  className="text-rpg-dim hover:text-rpg-text no-underline transition-colors flex items-center gap-1"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
                >
                  <span>←</span>
                  <span className="truncate">{prevTitle}</span>
                </Link>
              )}
              {nextSlug && (
                <Link
                  href={`/books/${nextSlug}`}
                  className="text-rpg-dim hover:text-rpg-text no-underline transition-colors flex items-center gap-1"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
                >
                  <span className="truncate">{nextTitle}</span>
                  <span>→</span>
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
