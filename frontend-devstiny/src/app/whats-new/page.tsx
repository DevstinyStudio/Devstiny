import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "What's New",
  description:
    "Latest updates, new features, and improvements to Devstiny — the RPG coding platform.",
  alternates: {
    canonical: "https://www.devstiny.com/whats-new",
  },
  openGraph: {
    url:         "https://www.devstiny.com/whats-new",
    title:       "What's New | Devstiny",
    description: "Latest updates, new features, and improvements to Devstiny — the RPG coding platform.",
  },
};

const updates = [
  {
    version: "v0.4.0",
    date: "JUN 2026",
    gem: "/gem/gem-9.png",
    tag: "CONTENT UPDATE",
    tagColor: "text-rpg-purple",
    entries: [
      { type: "NEW",    text: "Chapter 4 acts 9–17 — full technical content with code examples and keypoints" },
      { type: "NEW",    text: "Somers opening dialogue added to all Chapter 4 acts 9–17" },
      { type: "NEW",    text: "Quiz added to acts 9–17 — 4 questions each covering Operators, Scope, Strings, Classes, Modules, Generators, Advanced JS, Browser, and Debugging" },
      { type: "CHANGE", text: "Backend port changed to 4000, frontend to 4001" },
      { type: "FIX",    text: "Backend PATCH now merges content fields instead of replacing the entire content object" },
      { type: "FIX",    text: "Act page no longer crashes when quiz or sections data is missing" },
      { type: "FIX",    text: "Chapter 4 zone label unified — all acts now show CHAPTER 4 — THE JAVASCRIPT REALM" },
    ],
  },
  {
    version: "v0.3.0",
    date: "MAY 2026",
    gem: "/gem/gem-33.png",
    tag: "MAJOR UPDATE",
    tagColor: "text-rpg-gold",
    entries: [
      { type: "NEW",  text: "Books — comprehensive technical reference volumes added" },
      { type: "NEW",  text: "Quest completion tracking — quests now mark as DONE after completion" },
      { type: "NEW",  text: "Story timeline follows your actual path progress" },
      { type: "FIX",  text: "Quiz gate locks next button until quiz is passed" },
      { type: "FIX",  text: "Pre-filled answers for completed acts in quiz" },
    ],
  },
  {
    version: "v0.2.0",
    date: "APR 2026",
    gem: "/gem/gem-16.png",
    tag: "UPDATE",
    tagColor: "text-rpg-cyan",
    entries: [
      { type: "NEW",  text: "Badge equip system — equip and display your earned badges" },
      { type: "NEW",  text: "Gold economy — earn gold by completing acts, chapters, and quests" },
      { type: "NEW",  text: "Settings tab — update your username and password from profile" },
      { type: "NEW",  text: "Final act locking — must complete all regular acts first" },
      { type: "FIX",  text: "Auth state no longer glitches on page navigation" },
    ],
  },
  {
    version: "v0.1.0",
    date: "MAR 2026",
    gem: "/gem/gem-4.png",
    tag: "LAUNCH",
    tagColor: "text-rpg-text",
    entries: [
      { type: "NEW",  text: "Player registration and login with JWT authentication" },
      { type: "NEW",  text: "Path system — chapters and acts with XP rewards" },
      { type: "NEW",  text: "Quests board — side missions for bonus XP and gold" },
      { type: "NEW",  text: "Profile dashboard — achievements, inventory, and stats" },
      { type: "NEW",  text: "RPG-themed UI with pixel art style" },
    ],
  },
];

const typeColor: Record<string, string> = {
  NEW: "text-rpg-cyan",
  FIX: "text-rpg-gold",
  CHANGE: "text-rpg-text",
};

export default function WhatsNewPage() {
  return (
    <>
    <Navbar />
    <main className="min-h-screen bg-rpg-bg pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p
            className="text-rpg-dim tracking-widest mb-3"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}
          >
            CHANGELOG
          </p>
          <h1 className="text-xl sm:text-2xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">
            WHAT&apos;S NEW
          </h1>
          <div className="w-32 pixel-divider-gold mx-auto mt-4" />
          <p className="text-sm text-rpg-dim leading-7 mt-4 max-w-md mx-auto">
            Track every update, fix, and new feature added to the realm of Devstiny.
          </p>
        </div>

        {/* Update cards */}
        <div className="flex flex-col gap-8">
          {updates.map((update) => (
            <div key={update.version} className="pixel-panel p-6">
              {/* Card header */}
              <div className="flex items-center gap-4 mb-5">
                <img
                  src={update.gem}
                  alt={update.version}
                  style={{ width: 40, height: 40, imageRendering: "pixelated", objectFit: "contain" }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className="text-rpg-text text-pixel-shadow"
                      style={{ fontFamily: "var(--font-pixel)", fontSize: 14 }}
                    >
                      {update.version}
                    </span>
                    <span
                      className={`${update.tagColor} tracking-widest`}
                      style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
                    >
                      [{update.tag}]
                    </span>
                  </div>
                  <span
                    className="text-rpg-dim tracking-widest"
                    style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
                  >
                    {update.date}
                  </span>
                </div>
              </div>

              <div className="w-full pixel-divider-gold mb-5" />

              {/* Entries */}
              <ul className="flex flex-col gap-3">
                {update.entries.map((entry, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className={`${typeColor[entry.type] ?? "text-rpg-dim"} shrink-0 mt-0.5`}
                      style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
                    >
                      [{entry.type}]
                    </span>
                    <span className="text-sm text-rpg-dim leading-6">{entry.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p
          className="text-center text-rpg-dim tracking-widest mt-10"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
        >
          ▲ MORE UPDATES COMING SOON ▲
        </p>
      </div>
    </main>
    </>
  );
}
