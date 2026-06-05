"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Book {
  id: string;
  slug: string;
  volume: string;
  title: string;
  subtitle: string;
  author: string;
  description: string;
  color: string;
  border: string;
  icon: string;
  coverImage: string;
  status: string;
  chapters: { id: string; title: string; topics: string[] }[];
}

export default function BooksSection() {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    fetch(`${API}/books`)
      .then((r) => r.json())
      .then((d: Book[]) =>
        setBooks((d ?? []).filter((b) => b.status === "available").slice(0, 3))
      )
      .catch(() => {});
  }, []);

  return (
    <section className="py-20 px-4 bg-rpg-bg border-y-4 border-rpg-border">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-rpg-dim tracking-widest mb-3"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>
            THE LIBRARY
          </p>
          <h2 className="text-lg sm:text-xl md:text-2xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">
            EXPLORE THE VOLUMES
          </h2>
          <div className="w-32 pixel-divider-gold mx-auto mt-4" />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => {
            const topics = book.chapters.flatMap((ch) => ch.topics).slice(0, 3);
            return (
              <Link
                key={book.id}
                href={`/books/${book.slug}`}
                className="border-2 border-rpg-border bg-rpg-panel p-5 flex flex-col gap-4 hover:border-rpg-gold transition-colors no-underline group cursor-pointer"
              >
                {/* Top row: volume badge + author */}
                <div className="flex items-center justify-between">
                  <span
                    className={`border text-[7px] px-2 py-0.5 tracking-widest ${book.color} ${book.border}`}
                    style={{ fontFamily: "var(--font-pixel)" }}
                  >
                    {book.volume}
                  </span>
                  <span
                    className={`text-[7px] tracking-widest ${book.color}`}
                    style={{ fontFamily: "var(--font-pixel)" }}
                  >
                    {book.author.toUpperCase()}
                  </span>
                </div>

                {/* Cover + Title */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 flex items-center justify-center shrink-0">
                    <img
                      src={book.coverImage || "/book/book-1.png"}
                      alt={book.title}
                      style={{ width: 56, height: 56, imageRendering: "pixelated", objectFit: "contain" }}
                    />
                  </div>
                  <h3 className="text-sm text-rpg-text tracking-wide group-hover:text-rpg-gold transition-colors leading-5">
                    {book.title.toUpperCase()}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-xs text-rpg-dim leading-5 line-clamp-3 flex-1">
                  {book.description}
                </p>

                {/* Topic tags */}
                <div className="flex flex-wrap gap-1">
                  {topics.map((t) => (
                    <span
                      key={t}
                      className="border border-rpg-border text-rpg-dim px-2 py-0.5"
                      style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="pixel-divider" />

                {/* Bottom row: chapter count + read button */}
                <div className="flex items-center justify-between">
                  <span className="text-rpg-gold"
                    style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                    {book.chapters.length} CHAPTERS
                  </span>
                  <span
                    className="text-rpg-dim group-hover:text-rpg-gold transition-colors"
                    style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
                  >
                    ▶ READ
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/books"
            className="pixel-btn bg-transparent text-rpg-dim text-[8px] px-6 py-3 no-underline tracking-widest hover:text-rpg-text"
          >
            VIEW ALL BOOKS →
          </Link>
        </div>
      </div>
    </section>
  );
}
