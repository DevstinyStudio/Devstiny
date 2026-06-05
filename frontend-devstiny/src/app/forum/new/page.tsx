"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CATEGORIES = [
  {
    value: "tavern",
    label: "The Tavern",
    color: "#f0c040",
    desc: "General talk, introductions, and sharing progress. For anything that doesn't fit the other categories.",
    use: "I finished a chapter · I have a general question · Let me introduce myself",
  },
  {
    value: "oracle",
    label: "The Oracle",
    color: "#40d0e0",
    desc: "Ask anything about quests, Books, or your learning journey. No question is too small.",
    use: "I'm stuck on a quest · I don't understand a concept · A Book chapter seems wrong",
  },
  {
    value: "hall-of-champions",
    label: "Hall of Champions",
    color: "#40e070",
    desc: "Show projects you've built, get feedback, and inspire others with your work.",
    use: "I built something · Here's my portfolio · Feedback welcome",
  },
  {
    value: "guild-board",
    label: "Guild Board",
    color: "#c060e0",
    desc: "Find study partners, form a guild, or recruit members for your learning group.",
    use: "Looking for a study group · Recruiting for my guild · Weekly sessions open",
  },
];

export default function NewThreadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && CATEGORIES.some((c) => c.value === cat)) {
      setCategory(cat);
    }
  }, [searchParams]);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    title.trim().length >= 5 && category && content.trim().length >= 20;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const { apiPost } = await import("@/lib/api");
      const thread = await apiPost<{ id: string }>("/forum/threads", {
        title: title.trim(),
        content: content.trim(),
        category,
      });
      router.push(`/forum/thread/${thread.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to post thread.";
      if (
        msg.toLowerCase().includes("unauthorized") ||
        msg.toLowerCase().includes("401")
      ) {
        router.push("/login");
      }
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-rpg-bg pt-14 pb-20">
        <div className="max-w-7xl mx-auto px-4 pt-10">
          {/* Back */}
          <Link
            href="/forum"
            className="text-rpg-dim hover:text-rpg-text no-underline transition-colors mb-6 inline-block"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
          >
            ← BACK TO FORUM
          </Link>

          {/* Header */}
          <div className="flex flex-col gap-3 mb-8">
            <p
              className="text-rpg-dim tracking-widest"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
            >
              NEW THREAD
            </p>
            <h1 className="text-xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">
              OPEN YOUR SCROLL
            </h1>
            <div className="w-32 pixel-divider-gold" />
          </div>

          {/* Two-column layout */}
          <div className="flex gap-8 items-stretch">
            {/* ── Main form ──────────────────────────────────────── */}
            <div className="flex-1 min-w-0 flex flex-col">
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1">
                {/* Title */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="title"
                    className="text-rpg-dim tracking-widest"
                    style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
                  >
                    THREAD TITLE
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={120}
                    placeholder="Write a clear, specific title..."
                    className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-4 py-3 transition-colors placeholder:text-rpg-border"
                    style={{ fontFamily: "inherit" }}
                  />
                  <div className="flex justify-between">
                    <span className="text-rpg-dim text-xs">
                      {title.length < 5 &&
                        title.length > 0 &&
                        "At least 5 characters"}
                    </span>
                    <span
                      className="text-rpg-dim"
                      style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
                    >
                      {title.length}/120
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="category"
                    className="text-rpg-dim tracking-widest"
                    style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
                  >
                    CATEGORY
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className="flex items-center gap-3 px-4 py-3 border-2 transition-colors text-left"
                        style={{
                          borderColor:
                            category === cat.value ? cat.color : "#3d2d8c",
                          background:
                            category === cat.value
                              ? "rgba(255,255,255,0.04)"
                              : "transparent",
                          color: category === cat.value ? cat.color : "#b4b4df",
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: cat.color }}
                        />
                        <span className="text-sm">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2 flex-1">
                  <label
                    htmlFor="content"
                    className="text-rpg-dim tracking-widest"
                    style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
                  >
                    CONTENT
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Describe your question, project, or topic in detail. The more specific you are, the better replies you'll get."
                    className="w-full flex-1 bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-4 py-3 transition-colors placeholder:text-rpg-border resize-none"
                    style={{ fontFamily: "inherit", minHeight: "200px" }}
                  />
                  <div className="flex justify-between">
                    <span className="text-rpg-dim text-xs">
                      {content.length > 0 &&
                        content.length < 20 &&
                        "At least 20 characters"}
                    </span>
                    <span
                      className="text-rpg-dim"
                      style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
                    >
                      {content.length} chars
                    </span>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={!canSubmit || submitting}
                    className="pixel-btn-gold text-[9px] px-6 py-3 tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? "POSTING..." : "▶ POST THREAD"}
                  </button>
                  <Link
                    href="/forum"
                    className="text-rpg-dim hover:text-rpg-text no-underline transition-colors text-sm"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>

            {/* ── Sticky sidebar ─────────────────────────────────── */}
            <aside className="hidden lg:flex flex-col gap-4 sticky top-20 w-96 shrink-0">
              {/* Tips from Elvar */}
              <div className="pixel-panel p-4 flex flex-col gap-2">
                <span
                  className="text-rpg-gold"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
                >
                  TIPS FROM ELVAR
                </span>
                <ul className="flex flex-col gap-1.5">
                  {[
                    `Use a specific title — "How does flexbox justify-content work?" not "CSS not working".`,
                    "Include what you've already tried.",
                    "Paste your code when relevant.",
                    "Pick The Oracle if you're stuck on a quest or lesson.",
                  ].map((tip, i) => (
                    <li
                      key={i}
                      className="text-xs text-rpg-dim leading-5 flex gap-2"
                    >
                      <span className="text-rpg-border shrink-0">▸</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Category guide */}
              <div className="flex flex-col gap-2">
                <span
                  className="text-rpg-dim tracking-widest"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
                >
                  CATEGORY GUIDE
                </span>
                <div className="flex flex-col border-2 border-rpg-border overflow-hidden">
                  {CATEGORIES.map((cat, i) => (
                    <div
                      key={cat.value}
                      className="flex gap-3 px-3 py-3 cursor-pointer transition-colors"
                      onClick={() => setCategory(cat.value)}
                      style={{
                        background:
                          category === cat.value
                            ? `${cat.color}12`
                            : "transparent",
                        borderBottom:
                          i < CATEGORIES.length - 1
                            ? "1px solid #3d2d8c"
                            : "none",
                      }}
                    >
                      <span
                        className="shrink-0 mt-0.5"
                        style={{
                          color: cat.color,
                          fontFamily: "var(--font-pixel)",
                          fontSize: 8,
                        }}
                      >
                        {category === cat.value ? "▶" : "▸"}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <span
                          className="text-xs font-medium"
                          style={{ color: cat.color }}
                        >
                          {cat.label}
                        </span>
                        <span className="text-xs text-rpg-dim leading-5">
                          {cat.desc}
                        </span>
                        <span
                          className="text-xs leading-4 mt-0.5"
                          style={{
                            color: `${cat.color}88`,
                            fontFamily: "var(--font-pixel)",
                            fontSize: 6,
                          }}
                        >
                          e.g. {cat.use}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
