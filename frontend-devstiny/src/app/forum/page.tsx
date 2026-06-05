"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiGet } from "@/lib/api";

const CATEGORY_COLOR: Record<string, string> = {
  tavern: "text-rpg-gold",
  oracle: "text-rpg-cyan",
  "hall-of-champions": "text-rpg-green",
  "guild-board": "text-rpg-purple",
};

const CATEGORY_LABEL: Record<string, string> = {
  tavern: "The Tavern",
  oracle: "The Oracle",
  "hall-of-champions": "Hall of Champions",
  "guild-board": "Guild Board",
};

function fmtNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 < 100 ? 1 : 0)}k`;
  return String(n);
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

interface ApiThread {
  id: string;
  title: string;
  category: string;
  author: { username: string };
  views: number;
  solved: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { replies: number };
}

interface ApiCategory {
  id: string;
  slug: string;
  title: string;
  description: string;
  gem: string;
  color: string;
  order: number;
  threads: number;
  posts: number;
}

interface ForumStats {
  threads: number;
  posts: number;
}

const LIMIT = 10;

export default function ForumPage() {
  const [threads,    setThreads]    = useState<ApiThread[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [forumStats, setForumStats] = useState<ForumStats>({ threads: 0, posts: 0 });
  const [loading,    setLoading]    = useState(true);
  const [fetching,   setFetching]   = useState(false);
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [sort,       setSort]       = useState("date");
  const [solvedOnly, setSolvedOnly] = useState(false);
  const [search,     setSearch]     = useState("");
  const [searchQuery,setSearchQuery]= useState("");

  const totalPages = Math.ceil(total / LIMIT);

  // Fetch categories + stats sekali saja
  useEffect(() => {
    Promise.allSettled([
      apiGet<ForumStats>("/forum/stats"),
      apiGet<ApiCategory[]>("/forum/categories"),
    ]).then(([sRes, cRes]) => {
      if (sRes.status === "fulfilled") setForumStats(sRes.value ?? { threads: 0, posts: 0 });
      if (cRes.status === "fulfilled") setCategories(cRes.value ?? []);
    });
  }, []);

  // Fetch threads — re-run ketika page, sort, filter, atau search berubah
  useEffect(() => {
    setFetching(true);
    const params = new URLSearchParams({
      limit: String(LIMIT), page: String(page), sort,
      ...(solvedOnly ? { solvedOnly: "true" } : {}),
      ...(searchQuery ? { search: searchQuery } : {}),
    });
    apiGet<{ threads: ApiThread[]; total: number }>(`/forum/threads?${params}`)
      .then((d) => {
        setThreads(d?.threads ?? []);
        setTotal(d?.total ?? 0);
      }).catch(() => {})
      .finally(() => { setLoading(false); setFetching(false); });
  }, [page, sort, solvedOnly, searchQuery]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-rpg-bg pt-14">
        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="border-b-4 border-rpg-border bg-rpg-panel px-4 py-12">
          <div className="max-w-5xl mx-auto flex items-start gap-6">
            <Image
              src="/NPC/elvar-head.png"
              alt="Elvar"
              width={64}
              height={64}
              style={{ imageRendering: "pixelated" }}
              className="shrink-0 mt-1"
            />
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex items-center gap-3">
                <span
                  className="text-rpg-dim tracking-widest"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
                >
                  THE GUILD HALL
                </span>
                <div className="flex-1 h-px bg-rpg-border" />
                <span
                  className="text-rpg-dim tracking-widest"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
                >
                  COMMUNITY FORUM
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">
                ASK. SHARE. GROW.
              </h1>
              <p className="text-sm text-rpg-dim leading-7 max-w-2xl">
                Every hero gets stuck. Every hero has something to teach. Ask
                your questions, show your work, and find companions for the
                journey.
              </p>

              {/* Stats */}
              <div className="flex items-center gap-6 mt-1 flex-wrap">
                {[
                  {
                    label: "THREADS",
                    value: loading ? "—" : forumStats.threads.toLocaleString(),
                  },
                  {
                    label: "POSTS",
                    value: loading ? "—" : forumStats.posts.toLocaleString(),
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="border-2 border-rpg-border bg-rpg-panel px-3 py-1.5 flex flex-col items-center gap-0.5"
                  >
                    <span
                      className="text-rpg-dim"
                      style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
                    >
                      {s.label}
                    </span>
                    <span
                      className="text-rpg-gold"
                      style={{ fontFamily: "var(--font-pixel)", fontSize: 12 }}
                    >
                      {s.value}
                    </span>
                  </div>
                ))}
                <Link
                  href="/forum/new"
                  className="pixel-btn-gold text-[9px] px-5 py-2.5 no-underline tracking-widest ml-auto"
                >
                  + NEW THREAD
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-10">
          {/* ── What's New banner ───────────────────────────────────── */}
          <Link
            href="/whats-new"
            className="no-underline group flex items-center gap-4 px-5 py-4 border-2 border-rpg-gold/60 hover:border-rpg-gold bg-rpg-panel transition-colors"
          >
            <img
              src="/gem/gem-21.png"
              alt="What's New"
              style={{
                width: 32,
                height: 32,
                imageRendering: "pixelated",
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="text-rpg-gold group-hover:text-glow-gold transition-all"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}
                >
                  WHAT&apos;S NEW — v0.3.0
                </span>
                <span
                  className="text-rpg-dim"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
                >
                  [MAJOR UPDATE]
                </span>
              </div>
              <p className="text-xs text-rpg-dim leading-5 mt-0.5">
                Books, quest completion tracking, story timeline progress, quiz
                gate improvements, and more.
              </p>
            </div>
            <span
              className="shrink-0 text-rpg-gold group-hover:translate-x-1 transition-transform"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}
            >
              →
            </span>
          </Link>

          {/* ── Categories ──────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <span
                className="text-rpg-dim tracking-widest"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
              >
                CATEGORIES
              </span>
              <div className="flex-1 h-px bg-rpg-border" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="pixel-panel flex items-start gap-4 opacity-30 animate-pulse"
                    >
                      <div className="w-10 h-10 bg-rpg-border shrink-0" />
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="h-3 bg-rpg-border rounded w-2/3" />
                        <div className="h-2 bg-rpg-border rounded w-full" />
                      </div>
                    </div>
                  ))
                : categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/forum/category/${cat.slug}`}
                      className="pixel-panel flex items-start gap-4 no-underline group hover:border-rpg-gold transition-colors"
                    >
                      <img
                        src={cat.gem}
                        alt={cat.title}
                        style={{
                          width: 40,
                          height: 40,
                          imageRendering: "pixelated",
                          objectFit: "contain",
                          flexShrink: 0,
                        }}
                      />
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <span
                          className={`text-sm font-medium tracking-wide group-hover:text-rpg-gold transition-colors ${cat.color}`}
                        >
                          {cat.title}
                        </span>
                        <p className="text-xs text-rpg-dim leading-5">
                          {cat.description}
                        </p>
                        <div className="flex gap-4 mt-1">
                          <span
                            className="text-rpg-dim"
                            style={{
                              fontFamily: "var(--font-pixel)",
                              fontSize: 7,
                            }}
                          >
                            {cat.threads} THREADS
                          </span>
                          <span
                            className="text-rpg-dim"
                            style={{
                              fontFamily: "var(--font-pixel)",
                              fontSize: 7,
                            }}
                          >
                            {cat.posts} POSTS
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
            </div>
          </div>

          {/* ── All Threads ──────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            {/* Header + filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-rpg-dim tracking-widest shrink-0"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                ALL THREADS {!loading && total > 0 && `(${total})`}
              </span>
              <div className="flex-1 h-px bg-rpg-border hidden sm:block" />

              {/* Sort buttons */}
              <div className="flex items-center gap-1 flex-wrap">
                {[
                  { value: "date",    label: "DATE"    },
                  { value: "views",   label: "VIEWS"   },
                  { value: "replies", label: "REPLIES" },
                ].map((s) => (
                  <button key={s.value} onClick={() => { setSort(s.value); setPage(1); }}
                    className="px-2 py-1 border transition-colors"
                    style={{
                      fontFamily: "var(--font-pixel)", fontSize: 7,
                      borderColor: sort === s.value ? "#f0c040" : "#3d2d8c",
                      color:       sort === s.value ? "#f0c040" : "#b4b4df",
                      background:  sort === s.value ? "rgba(240,192,64,0.08)" : "transparent",
                    }}>
                    {s.label}
                  </button>
                ))}
                <button onClick={() => { setSolvedOnly((v) => !v); setPage(1); }}
                  className="px-2 py-1 border transition-colors"
                  style={{
                    fontFamily: "var(--font-pixel)", fontSize: 7,
                    borderColor: solvedOnly ? "#40e070" : "#3d2d8c",
                    color:       solvedOnly ? "#40e070" : "#b4b4df",
                    background:  solvedOnly ? "rgba(64,224,112,0.08)" : "transparent",
                  }}>
                  ✓ SOLVED
                </button>
              </div>

              {/* Search */}
              <form onSubmit={(e) => { e.preventDefault(); setSearchQuery(search); setPage(1); }}
                className="flex gap-1">
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); if (!e.target.value) { setSearchQuery(""); setPage(1); } }}
                  placeholder="Search threads..."
                  className="bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-xs px-3 py-1 transition-colors placeholder:text-rpg-border w-36"
                />
                <button type="submit"
                  className="px-3 py-1 border-2 border-rpg-border hover:border-rpg-gold text-rpg-dim hover:text-rpg-text transition-colors"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                  ▶
                </button>
              </form>
            </div>

            <div className={`pixel-panel p-0 overflow-hidden transition-opacity duration-150 ${fetching ? "opacity-50" : "opacity-100"}`}>
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <span
                    className="text-rpg-dim blink-slow"
                    style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}
                  >
                    LOADING...
                  </span>
                </div>
              ) : threads.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16">
                  <span
                    className="text-rpg-dim"
                    style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}
                  >
                    NO THREADS YET
                  </span>
                  <Link
                    href="/forum/new"
                    className="pixel-btn-gold text-[9px] px-4 py-2 no-underline tracking-widest"
                  >
                    + OPEN FIRST THREAD
                  </Link>
                </div>
              ) : (
                threads.map((t, i) => (
                  <div key={t.id}>
                    <div className="flex items-start gap-4 px-5 py-4 hover:bg-white/3 transition-colors">
                      {/* Thread info */}
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <Link
                          href={`/forum/thread/${t.id}`}
                          className="text-sm text-rpg-text hover:text-rpg-gold transition-colors no-underline leading-5 line-clamp-1"
                        >
                          {t.title}
                        </Link>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Link
                            href={`/forum/category/${t.category}`}
                            className={`no-underline hover:underline ${CATEGORY_COLOR[t.category] ?? "text-rpg-dim"}`}
                            style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
                          >
                            {CATEGORY_LABEL[t.category] ?? t.category}
                          </Link>
                          <Link href={`/profile/${t.author.username}`}
                            className="text-rpg-dim hover:text-rpg-gold no-underline transition-colors"
                            style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                            by {t.author.username}
                          </Link>
                          {t.solved && (
                            <span className="text-rpg-green" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                              SOLVED
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="hidden sm:flex items-center gap-4 shrink-0">
                        {[
                          { value: fmtNum(t._count.replies), label: "REPLIES" },
                          { value: fmtNum(t.views),          label: "VIEWS"   },
                        ].map((m) => (
                          <div key={m.label} className="flex flex-col items-end gap-0.5 w-14">
                            <span className="text-rpg-text tabular-nums"
                              style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}>
                              {m.value}
                            </span>
                            <span className="text-rpg-dim"
                              style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}>
                              {m.label}
                            </span>
                          </div>
                        ))}
                        <div className="w-14 text-right">
                          <span className="text-rpg-dim"
                            style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                            {timeAgo(t.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {i < threads.length - 1 && (
                      <div className="h-px bg-rpg-border/40 mx-5" />
                    )}
                  </div>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="pixel-btn text-rpg-dim text-[8px] px-4 py-2 tracking-widest disabled:opacity-30"
                >
                  ← PREV
                </button>
                <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                  className="pixel-btn text-rpg-dim text-[8px] px-4 py-2 tracking-widest disabled:opacity-30"
                >
                  NEXT →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Elvar's note ────────────────────────────────────────────── */}
        <section className="border-t-4 border-rpg-border bg-rpg-panel px-4 py-10">
          <div className="max-w-5xl mx-auto flex items-start gap-4">
            <Image
              src="/NPC/elvar-head.png"
              alt="Elvar"
              width={32}
              height={32}
              style={{ imageRendering: "pixelated" }}
              className="shrink-0 mt-1"
            />
            <div className="flex flex-col gap-1">
              <span
                className="text-rpg-gold"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
              >
                ELVAR
              </span>
              <p className="text-sm text-rpg-dim leading-6 italic max-w-2xl">
                &ldquo;The fastest way to understand something is to explain it
                to someone who is confused. Answer questions here. You will
                learn more than the person asking.&rdquo;
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
