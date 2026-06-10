import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BLOG_POSTS } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "The Codex",
  description:
    "Developer insights, web fundamentals, and notes from the Elder Dev. Practical articles on HTML, CSS, and JavaScript.",
  alternates: { canonical: "https://www.devstiny.com/blog" },
  openGraph: {
    url:         "https://www.devstiny.com/blog",
    title:       "The Codex | Devstiny",
    description: "Developer insights and web fundamentals from the Elder Dev.",
  },
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface ApiBlogPost {
  id: string; slug: string; title: string; excerpt: string;
  author: string; tag: string; gem: string; readTime: number;
  isPublished: boolean; order: number;
}

const TAG_COLORS: Record<string, string> = {
  HTML:       "text-rpg-green   border-rpg-green/40",
  CSS:        "text-rpg-cyan    border-rpg-cyan/40",
  JAVASCRIPT: "text-rpg-gold    border-rpg-gold/40",
  GUIDE:      "text-rpg-purple  border-rpg-purple/40",
};

async function getPosts(): Promise<ApiBlogPost[]> {
  try {
    const res = await fetch(`${API}/blog`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json() as ApiBlogPost[];
    if (data.length > 0) return data;
  } catch { /* fall through to static */ }
  return BLOG_POSTS.map((p, i) => ({
    id: p.slug, slug: p.slug, title: p.title, excerpt: p.excerpt,
    author: p.author, tag: p.tag, gem: p.gem, readTime: p.readTime,
    isPublished: true, order: i,
  }));
}

export default async function BlogPage() {
  const posts = await getPosts();

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
                <span className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                  THE CODEX
                </span>
                <div className="flex-1 h-px bg-rpg-border" />
                <span className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                  ELVAR&apos;S WRITINGS
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">
                DEVELOPER INSIGHTS
              </h1>
              <p className="text-sm text-rpg-dim leading-7 max-w-2xl">
                Practical articles on web fundamentals. No fluff, no framework wars — just the things that actually matter when you sit down to write code.
              </p>
              <div className="flex items-center gap-6 mt-1">
                {[
                  { label: "ARTICLES", value: String(posts.length) },
                  { label: "AUTHORS",  value: "1" },
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

        {/* Posts grid */}
        <section className="px-4 py-12">
          <div className="max-w-5xl mx-auto flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <span className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                ALL ARTICLES
              </span>
              <div className="flex-1 h-px bg-rpg-border" />
              <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                {posts.length} ENTRIES
              </span>
            </div>

            {posts.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>NO ARTICLES YET</span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {posts.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`}
                    className="pixel-panel flex flex-col gap-3 no-underline group hover:border-rpg-gold transition-colors">
                    <div className="flex items-start gap-4">
                      <img src={post.gem} alt=""
                        style={{ width: 40, height: 40, imageRendering: "pixelated", objectFit: "contain", flexShrink: 0 }} />
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span
                            className={`border px-2 py-0.5 text-[7px] tracking-wider ${TAG_COLORS[post.tag] ?? "text-rpg-dim border-rpg-border"}`}
                            style={{ fontFamily: "var(--font-pixel)" }}>
                            {post.tag}
                          </span>
                          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                            BY {post.author.toUpperCase()}
                          </span>
                          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                            {post.readTime} MIN READ
                          </span>
                        </div>
                        <h2 className="text-sm sm:text-base text-rpg-text group-hover:text-rpg-gold transition-colors leading-6">
                          {post.title}
                        </h2>
                        <p className="text-xs text-rpg-dim leading-5 line-clamp-2">{post.excerpt}</p>
                      </div>
                      <span className="shrink-0 text-rpg-dim group-hover:text-rpg-gold group-hover:translate-x-1 transition-all"
                        style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>→</span>
                    </div>
                  </Link>
                ))}
              </div>
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
                &ldquo;Reading about code is half the journey. The other half is typing it yourself and breaking it. Do both.&rdquo;
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
