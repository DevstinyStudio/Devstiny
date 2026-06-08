"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiGet } from "@/lib/api";

interface ApiBook {
  id: string; slug: string; volume: string; title: string; subtitle: string;
  author: string; description: string; color: string; border: string;
  icon: string; coverImage: string; defaultLang: string; status: string; order: number;
  chapters: { id: string; title: string; topics: string[] }[];
}

export default function BooksContent() {
  const [books,   setBooks]   = useState<ApiBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<ApiBook[]>("/books")
      .then((d) => setBooks(d ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const available  = books.filter((v) => v.status === "available");
  const comingSoon = books.filter((v) => v.status === "coming-soon");

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-rpg-bg pt-14">

        {/* Hero */}
        <section className="border-b-4 border-rpg-border bg-rpg-panel px-4 py-12">
          <div className="max-w-5xl mx-auto flex items-start gap-6">
            <Image src="/NPC/elvar-head.png" alt="Elvar" width={64} height={64}
              style={{ imageRendering: "pixelated" }} className="shrink-0 mt-1" />
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>THE LIBRARY</span>
                <div className="flex-1 h-px bg-rpg-border" />
                <span className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>ELVAR&apos;S NOTES</span>
              </div>
              <h1 className="text-xl sm:text-2xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">TECHNICAL REFERENCE</h1>
              <p className="text-sm text-rpg-dim leading-7 max-w-2xl">
                These are my actual notes. Not the story version — the real one. Everything I know about how the web works, written down without the metaphors.
              </p>
              <div className="flex items-center gap-6 mt-1">
                {[
                  { label: "VOLUMES",   value: loading ? "—" : String(books.length) },
                  { label: "CHAPTERS",  value: loading ? "—" : String(books.reduce((s, v) => s + v.chapters.length, 0)) },
                  { label: "AVAILABLE", value: loading ? "—" : String(available.length) },
                ].map((s) => (
                  <div key={s.label} className="border-2 border-rpg-border bg-rpg-panel px-3 py-1.5 flex flex-col items-center gap-0.5">
                    <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>{s.label}</span>
                    <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 12 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Volume grid */}
        <section className="px-4 py-12">
          <div className="max-w-5xl mx-auto flex flex-col gap-10">

            {loading ? (
              <div className="flex justify-center py-16">
                <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>LOADING...</span>
              </div>
            ) : (
              <>
                {/* Available */}
                {available.length > 0 && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <span className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>AVAILABLE NOW</span>
                      <div className="flex-1 h-px bg-rpg-border" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {available.map((vol) => (
                        <Link key={vol.id} href={`/books/${vol.slug}`}
                          className="pixel-panel pixel-panel-labeled flex flex-col gap-4 no-underline group hover:border-rpg-gold transition-colors">
                          <span className="pixel-panel-label" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>{vol.volume}</span>
                          <div className="flex items-start gap-4 mt-2">
                            <div className="w-14 h-14 flex items-center justify-center shrink-0">
                              <img src={vol.coverImage || "/book/book-1.png"} alt={vol.title}
                                style={{ width: 56, height: 56, imageRendering: "pixelated", objectFit: "contain" }} />
                            </div>
                            <div className="flex flex-col gap-1 flex-1">
                              <h2 className={`text-sm font-medium tracking-wide group-hover:text-rpg-gold transition-colors ${vol.color}`}>{vol.title}</h2>
                              <p className="text-xs text-rpg-dim">{vol.subtitle}</p>
                              <span className="text-rpg-dim mt-1" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>BY {vol.author}</span>
                            </div>
                          </div>
                          <p className="text-xs text-rpg-dim leading-5 line-clamp-2">{vol.description}</p>
                          <div className="pixel-divider" />
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {vol.chapters.slice(0, 4).map((ch) => (
                                <span key={ch.id} className="text-rpg-dim border border-rpg-border px-2 py-0.5 text-[8px] tracking-wide">{ch.title}</span>
                              ))}
                              {vol.chapters.length > 4 && (
                                <span className="text-rpg-dim px-1 py-0.5 text-[8px]">+{vol.chapters.length - 4} more</span>
                              )}
                            </div>
                            <span className={`shrink-0 group-hover:text-rpg-gold transition-colors ${vol.color}`} style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>READ →</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Coming soon */}
                {comingSoon.length > 0 && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <span className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>IN PROGRESS</span>
                      <div className="flex-1 h-px bg-rpg-border" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {comingSoon.map((vol) => (
                        <div key={vol.id} className="pixel-panel pixel-panel-labeled flex flex-col gap-4 opacity-50 cursor-not-allowed">
                          <span className="pixel-panel-label" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>{vol.volume}</span>
                          <div className="flex items-start gap-4 mt-2">
                            <div className="w-14 h-14 flex items-center justify-center shrink-0">
                              <img src={vol.coverImage || "/book/book-1.png"} alt={vol.title}
                                style={{ width: 56, height: 56, imageRendering: "pixelated", objectFit: "contain" }} />
                            </div>
                            <div className="flex flex-col gap-1 flex-1">
                              <h2 className={`text-sm font-medium tracking-wide ${vol.color}`}>{vol.title}</h2>
                              <p className="text-xs text-rpg-dim">{vol.subtitle}</p>
                              <span className="text-rpg-dim mt-1" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>BY {vol.author}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-end">
                            <span className="text-rpg-dim border border-rpg-dim px-2 py-0.5 tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>COMING SOON</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Elvar's note */}
        <section className="border-t-4 border-rpg-border bg-rpg-panel px-4 py-10">
          <div className="max-w-5xl mx-auto flex items-start gap-4">
            <Image src="/NPC/elvar-head.png" alt="Elvar" width={32} height={32} style={{ imageRendering: "pixelated" }} className="shrink-0 mt-1" />
            <div className="flex flex-col gap-1">
              <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>ELVAR</span>
              <p className="text-sm text-rpg-dim leading-6 italic max-w-2xl">
                &ldquo;The story teaches you to feel it. The library teaches you to understand it. You need both. Most people stop at one.&rdquo;
              </p>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
