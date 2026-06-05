"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";
import BookSidebar from "@/components/books/BookSidebar";
import TextBlock from "@/components/books/TextBlock";

const CodeBlock = dynamic(() => import("@/components/books/CodeBlock"), { ssr: false });
import { apiGet } from "@/lib/api";

type ChapterBlock =
  | { type: "text"; content: string }
  | { type: "code"; code: string };

interface ApiChapter {
  id: string; title: string; topics: string[]; content: string;
  example?: string; sections?: ChapterBlock[] | null; order: number;
}

interface ApiBook {
  id: string; slug: string; volume: string; title: string; subtitle: string;
  author: string; description: string; color: string; border: string;
  icon: string; coverImage: string; defaultLang: string; status: string; order: number;
  chapters: ApiChapter[];
}

// We need adjacent books for prev/next — fetch all books list
interface BookListItem { slug: string; volume: string; title: string; order: number }

export default function BookPage() {
  const { slug } = useParams<{ slug: string }>();
  const [book,     setBook]     = useState<ApiBook | null>(null);
  const [allBooks, setAllBooks] = useState<BookListItem[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!slug) return;
    Promise.allSettled([
      apiGet<ApiBook>(`/books/${slug}`),
      apiGet<BookListItem[]>("/books"),
    ]).then(([bRes, allRes]) => {
      if (bRes.status === "fulfilled") setBook(bRes.value);
      if (allRes.status === "fulfilled") setAllBooks(allRes.value ?? []);
    }).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-rpg-bg pt-14 flex items-center justify-center">
          <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>LOADING...</span>
        </main>
      </>
    );
  }

  if (!book) return notFound();

  const idx  = allBooks.findIndex((b) => b.slug === slug);
  const prev = allBooks[idx - 1];
  const next = allBooks[idx + 1];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-rpg-bg pt-14">

        {/* Header */}
        <section className="border-b-4 border-rpg-border bg-rpg-panel px-4 py-10">
          <div className="max-w-5xl mx-auto flex flex-col gap-4">
            <Link href="/books" className="text-rpg-dim hover:text-rpg-text no-underline transition-colors lg:hidden"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>← THE LIBRARY</Link>
            <div className="flex items-start gap-5">
              <div className="w-24 h-24 flex items-center justify-center shrink-0">
                <img
                  src={book.coverImage || "/book/book-1.png"}
                  alt={book.title}
                  style={{ width: 96, height: 96, imageRendering: "pixelated", objectFit: "contain" }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>{book.volume}</span>
                <h1 className={`text-xl sm:text-2xl tracking-widest ${book.color}`} style={{ fontFamily: "var(--font-pixel)" }}>
                  {book.title.toUpperCase()}
                </h1>
                <p className="text-sm text-rpg-dim">{book.subtitle}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Image src="/NPC/elvar-head.png" alt="Elvar" width={16} height={16} style={{ imageRendering: "pixelated" }} />
                  <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>BY {book.author}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-rpg-dim leading-6 max-w-2xl italic">&ldquo;{book.description}&rdquo;</p>
          </div>
        </section>

        {/* Body: sidebar + chapters */}
        <div className="max-w-5xl mx-auto px-4 py-12 flex gap-10 items-start">
          <BookSidebar
            chapters={book.chapters}
            color={book.color}
            volume={book.volume}
            title={book.title}
            prevSlug={prev?.slug}
            prevTitle={prev?.volume}
            nextSlug={next?.slug}
            nextTitle={next?.volume}
          />

          {/* Chapter content */}
          <div className="flex-1 flex flex-col gap-12 min-w-0">
            {book.chapters.map((ch, i) => (
              <div key={ch.id} id={`ch-${i}`} className="flex flex-col gap-5 scroll-mt-24">
                <div className="flex items-center gap-4">
                  <span className={`shrink-0 ${book.color}`} style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-base sm:text-lg text-rpg-text tracking-wide">{ch.title}</h2>
                  <div className="flex-1 h-px bg-rpg-border" />
                </div>

                <div className="flex flex-wrap gap-2">
                  {ch.topics.map((t) => (
                    <span key={t} className={`text-[7px] border px-2 py-0.5 tracking-wider ${book.color} ${book.border}`}
                      style={{ fontFamily: "var(--font-pixel)" }}>{t}</span>
                  ))}
                </div>

                {/* Render sections (blocks) if available, else fall back to content+example */}
                {ch.sections && ch.sections.length > 0 ? (
                  ch.sections.map((block, bi) =>
                    block.type === "text" ? (
                      <TextBlock key={bi} content={block.content} />
                    ) : (
                      <CodeBlock key={bi} code={block.code} lang={book.defaultLang} />
                    )
                  )
                ) : (
                  <>
                    <TextBlock content={ch.content} />
                    {ch.example && <CodeBlock code={ch.example} lang={book.defaultLang} />}
                  </>
                )}

                {i < book.chapters.length - 1 && <div className="pixel-divider mt-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation footer */}
        <section className="border-t-4 border-rpg-border bg-rpg-panel px-4 py-8">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            {prev ? (
              <Link href={`/books/${prev.slug}`} className="pixel-btn text-rpg-dim text-[8px] px-4 py-3 no-underline tracking-widest hover:text-rpg-text">
                ← {prev.volume}: {prev.title}
              </Link>
            ) : (
              <Link href="/books" className="pixel-btn text-rpg-dim text-[8px] px-4 py-3 no-underline tracking-widest hover:text-rpg-text">← The Library</Link>
            )}
            {next ? (
              <Link href={`/books/${next.slug}`} className={`pixel-btn text-[8px] px-4 py-3 no-underline tracking-widest border-2 ${next.color ?? ""} hover:bg-rpg-bg transition-colors`}
                style={{ borderColor: "currentColor" }}>
                {next.volume}: {next.title} →
              </Link>
            ) : (
              <Link href="/books" className="pixel-btn text-rpg-dim text-[8px] px-4 py-3 no-underline tracking-widest hover:text-rpg-text">Back to Library →</Link>
            )}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
