"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiGet } from "@/lib/api";

function fmtNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 < 100 ? 1 : 0)}k`;
  return String(n);
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60)        return "just now";
  if (s < 3600)      return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)     return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

interface ApiCategory {
  id: string; slug: string; title: string;
  description: string; gem: string; color: string;
  threads: number; posts: number;
}

interface ApiThread {
  id: string; title: string; category: string;
  author: { username: string };
  views: number; solved: boolean;
  createdAt: string; updatedAt: string;
  _count: { replies: number };
}

const LIMIT = 15;

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  const [category,    setCategory]    = useState<ApiCategory | null>(null);
  const [threads,     setThreads]     = useState<ApiThread[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [fetching,    setFetching]    = useState(false);
  const [notFound,    setNotFound]    = useState(false);
  const [page,        setPage]        = useState(1);
  const [total,       setTotal]       = useState(0);
  const [sort,        setSort]        = useState("date");
  const [solvedOnly,  setSolvedOnly]  = useState(false);
  const [search,      setSearch]      = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const totalPages = Math.ceil(total / LIMIT);
  const isAll      = slug === "all";

  // Fetch category info once (skip for "all")
  useEffect(() => {
    if (!slug || isAll) return;
    apiGet<ApiCategory>(`/forum/categories/${slug}`)
      .then(setCategory)
      .catch(() => setNotFound(true));
  }, [slug]);

  // Set fake category for "all"
  useEffect(() => {
    if (!isAll) return;
    setCategory({
      id: "all", slug: "all", title: "All Threads",
      description: "Browse all threads across every category.",
      gem: "/gem/gem-6.png", color: "text-rpg-text",
      threads: 0, posts: 0,
    });
  }, [isAll]);

  // Fetch threads when page/filters change
  useEffect(() => {
    if (!slug) return;
    setFetching(true);
    const params = new URLSearchParams({
      limit: String(LIMIT), page: String(page), sort,
      ...(isAll ? {} : { category: slug }),
      ...(solvedOnly ? { solvedOnly: "true" } : {}),
      ...(searchQuery ? { search: searchQuery } : {}),
    });
    apiGet<{ threads: ApiThread[]; total: number }>(`/forum/threads?${params}`)
      .then((d) => {
        setThreads(d?.threads ?? []);
        setTotal(d?.total ?? 0);
      })
      .catch(() => {})
      .finally(() => { setLoading(false); setFetching(false); });
  }, [slug, page, sort, solvedOnly, searchQuery]);

  if (notFound) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-rpg-bg pt-14 flex flex-col items-center justify-center gap-4">
          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>CATEGORY NOT FOUND</span>
          <Link href="/forum" className="pixel-btn text-rpg-dim text-[8px] px-4 py-3 no-underline tracking-widest hover:text-rpg-text">
            ← BACK TO FORUM
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-rpg-bg pt-14 pb-20">

        {/* ── Header ────────────────────────────────────────────────── */}
        <section className="border-b-4 border-rpg-border bg-rpg-panel px-4 py-10">
          <div className="max-w-5xl mx-auto flex flex-col gap-4">
            <Link href="/forum" className="text-rpg-dim hover:text-rpg-text no-underline transition-colors"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
              ← BACK TO FORUM
            </Link>

            {loading || !category ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rpg-border animate-pulse" />
                <div className="flex flex-col gap-2">
                  <div className="h-4 bg-rpg-border rounded w-48 animate-pulse" />
                  <div className="h-3 bg-rpg-border rounded w-72 animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-5">
                <img src={category.gem} alt={category.title}
                  style={{ width: 48, height: 48, imageRendering: "pixelated", objectFit: "contain", flexShrink: 0 }} />
                <div className="flex flex-col gap-1">
                  <h1 className={`text-xl sm:text-2xl tracking-widest text-pixel-shadow ${category.color}`}
                    style={{ fontFamily: "var(--font-pixel)" }}>
                    {category.title.toUpperCase()}
                  </h1>
                  <p className="text-sm text-rpg-dim leading-6 max-w-2xl">{category.description}</p>
                  <div className="flex gap-5 mt-1">
                    <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                      {total} THREADS
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Thread list ───────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-6">

          {/* Toolbar: count + filters + new thread */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-rpg-dim tracking-widest shrink-0"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
              {loading ? "LOADING..." : `${total} THREAD${total !== 1 ? "S" : ""}`}
            </span>
            <div className="flex-1 h-px bg-rpg-border hidden sm:block" />

            {/* Sort */}
            <div className="flex items-center gap-1">
              {[
                { value: "date",    label: "DATE"    },
                { value: "views",   label: "VIEWS"   },
                { value: "replies", label: "REPLIES" },
              ].map((s) => (
                <button key={s.value}
                  onClick={() => { setSort(s.value); setPage(1); }}
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
              <input value={search}
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

            <Link href={`/forum/new?category=${isAll ? "" : slug}`}
              className="pixel-btn-gold text-[9px] px-4 py-2 no-underline tracking-widest">
              + NEW THREAD
            </Link>
          </div>

          {/* Threads */}
          <div className={`pixel-panel p-0 overflow-hidden transition-opacity duration-150 ${fetching ? "opacity-50" : "opacity-100"}`}>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>LOADING...</span>
              </div>
            ) : threads.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>NO THREADS FOUND</span>
                <p className="text-xs text-rpg-dim">
                  {searchQuery ? `No results for "${searchQuery}"` : "Be the first to open a thread."}
                </p>
                {!searchQuery && (
                  <Link href={`/forum/new?category=${isAll ? "" : slug}`}
                    className="pixel-btn-gold text-[9px] px-4 py-2 no-underline tracking-widest mt-1">
                    + OPEN THREAD
                  </Link>
                )}
              </div>
            ) : (
              threads.map((t, i) => (
                <div key={t.id}>
                  <div className="flex items-start gap-4 px-5 py-4 hover:bg-white/3 transition-colors">
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <Link href={`/forum/thread/${t.id}`}
                        className="text-sm text-rpg-text hover:text-rpg-gold transition-colors no-underline leading-5">
                        {t.title}
                      </Link>
                      <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                        by <Link href={`/profile/${t.author.username}`}
                          className="text-rpg-dim hover:text-rpg-gold no-underline transition-colors">
                          {t.author.username}
                        </Link> · {timeAgo(t.createdAt)}
                        {t.solved && <span className="text-rpg-green ml-2">· SOLVED</span>}
                      </span>
                    </div>

                    <div className="hidden sm:flex items-center gap-4 shrink-0">
                      {[
                        { value: fmtNum(t._count.replies), label: "REPLIES" },
                        { value: fmtNum(t.views),          label: "VIEWS"   },
                      ].map((m) => (
                        <div key={m.label} className="flex flex-col items-end gap-0.5 w-14">
                          <span className="text-rpg-text tabular-nums"
                            style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}>{m.value}</span>
                          <span className="text-rpg-dim"
                            style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}>{m.label}</span>
                        </div>
                      ))}
                      <div className="w-14 text-right">
                        <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                          {timeAgo(t.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {i < threads.length - 1 && <div className="h-px bg-rpg-border/40 mx-5" />}
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || fetching}
                className="pixel-btn text-rpg-dim text-[8px] px-4 py-2 tracking-widest disabled:opacity-30">
                ← PREV
              </button>
              <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                {page} / {totalPages}
              </span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || fetching}
                className="pixel-btn text-rpg-dim text-[8px] px-4 py-2 tracking-widest disabled:opacity-30">
                NEXT →
              </button>
            </div>
          )}
        </div>

      </main>
      <Footer />
    </>
  );
}
