import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BLOG_POSTS, getPostBySlug } from "@/lib/blog-posts";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface ApiBlock { type: "p" | "h2" | "h3" | "code" | "ul" | "blockquote" | "table"; text: string }
interface ApiBlogPost {
  id: string; slug: string; title: string; excerpt: string; body: ApiBlock[];
  author: string; tag: string; gem: string; readTime: number;
  isPublished: boolean; order: number; createdAt?: string; updatedAt?: string;
}
interface ApiBlogList {
  id: string; slug: string; title: string; order: number;
}

async function getPost(slug: string): Promise<ApiBlogPost | null> {
  try {
    const res = await fetch(`${API}/blog/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("not found");
    return await res.json() as ApiBlogPost;
  } catch {
    const static_ = getPostBySlug(slug);
    if (!static_) return null;
    return { ...static_, id: static_.slug, isPublished: true, order: 0 };
  }
}

async function getAllPosts(): Promise<ApiBlogList[]> {
  try {
    const res = await fetch(`${API}/blog`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json() as ApiBlogList[];
    if (data.length > 0) return data;
  } catch { /* fall through */ }
  return BLOG_POSTS.map((p, i) => ({ id: p.slug, slug: p.slug, title: p.title, order: i }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article Not Found" };
  const url = `https://www.devstiny.com/blog/${slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type:             "article",
      url,
      title:            `${post.title} | Devstiny`,
      description:      post.excerpt,
      publishedTime:    post.createdAt,
      modifiedTime:     post.updatedAt,
      authors:          ["https://www.devstiny.com"],
      tags:             [post.tag, "web development", "coding"],
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       `${post.title} | Devstiny`,
      description: post.excerpt,
      images:      ["/og-image.png"],
    },
  };
}

const TAG_COLORS: Record<string, string> = {
  HTML:       "text-rpg-green   border-rpg-green/40",
  CSS:        "text-rpg-cyan    border-rpg-cyan/40",
  JAVASCRIPT: "text-rpg-gold    border-rpg-gold/40",
  GUIDE:      "text-rpg-purple  border-rpg-purple/40",
};

function renderBlock(block: ApiBlock, i: number) {
  switch (block.type) {
    case "h2":
      return <h2 key={i} className="text-base sm:text-lg text-rpg-gold tracking-wide pt-4">{block.text}</h2>;
    case "h3":
      return <h3 key={i} className="text-sm text-rpg-cyan tracking-wide pt-2">{block.text}</h3>;
    case "code":
      return (
        <pre key={i} className="bg-rpg-panel border-2 border-rpg-border p-4 overflow-x-auto text-rpg-cyan text-xs leading-6">
          <code>{block.text}</code>
        </pre>
      );
    case "ul":
      return (
        <ul key={i} className="flex flex-col gap-1.5 pl-4">
          {block.text.split("\n").filter(Boolean).map((item, j) => (
            <li key={j} className="text-sm text-rpg-dim leading-6 flex gap-2">
              <span className="text-rpg-border shrink-0 mt-1">▸</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "blockquote":
      return (
        <blockquote key={i} className="border-l-4 border-rpg-gold/40 pl-4 text-sm text-rpg-dim italic leading-6">
          {block.text}
        </blockquote>
      );
    case "table": {
      const rows = block.text.split("\n").filter(Boolean);
      const headers = rows[0]?.split("|") ?? [];
      const body    = rows.slice(1);
      return (
        <div key={i} className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-rpg-border">
                {headers.map((h, j) => (
                  <th key={j} className="px-3 py-2 text-left text-rpg-dim"
                    style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>{h.trim()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri} className="border-b border-rpg-border/30">
                  {row.split("|").map((cell, ci) => (
                    <td key={ci} className={`px-3 py-2 text-rpg-dim ${ci === 0 ? "text-rpg-text font-mono" : ""}`}>
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    default:
      return <p key={i} className="text-sm text-rpg-dim leading-7">{block.text}</p>;
  }
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([getPost(slug), getAllPosts()]);
  if (!post) return notFound();

  const idx  = allPosts.findIndex((p) => p.slug === slug);
  const prev = allPosts[idx + 1];
  const next = allPosts[idx - 1];

  const pageUrl = `https://www.devstiny.com/blog/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url: pageUrl,
    datePublished: post.createdAt,
    dateModified: post.updatedAt ?? post.createdAt,
    author: {
      "@type": "Person",
      name: post.author,
      url: "https://www.devstiny.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Devstiny",
      url: "https://www.devstiny.com",
      logo: { "@type": "ImageObject", url: "https://www.devstiny.com/og-image.png" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    keywords: [post.tag, "web development", "HTML", "CSS", "JavaScript"].join(", "),
    articleSection: post.tag,
    timeRequired: `PT${post.readTime}M`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="min-h-screen bg-rpg-bg pt-14">

        {/* Header */}
        <section className="border-b-4 border-rpg-border bg-rpg-panel px-4 py-10">
          <div className="max-w-3xl mx-auto flex flex-col gap-5">
            <Link href="/blog" className="text-rpg-dim hover:text-rpg-text no-underline transition-colors"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>← THE CODEX</Link>
            <div className="flex items-start gap-5">
              <img src={post.gem} alt=""
                style={{ width: 56, height: 56, imageRendering: "pixelated", objectFit: "contain", flexShrink: 0 }} />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`border px-2 py-0.5 text-[7px] tracking-wider ${TAG_COLORS[post.tag] ?? "text-rpg-dim border-rpg-border"}`}
                    style={{ fontFamily: "var(--font-pixel)" }}>
                    {post.tag}
                  </span>
                  <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>{post.readTime} MIN READ</span>
                </div>
                <h1 className="text-lg sm:text-xl text-rpg-text tracking-wide leading-8">{post.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Image src="/NPC/elvar-head.png" alt="Elvar" width={16} height={16} style={{ imageRendering: "pixelated" }} />
                  <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>BY {post.author.toUpperCase()}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-rpg-dim leading-6 italic">&ldquo;{post.excerpt}&rdquo;</p>
          </div>
        </section>

        {/* Body */}
        <article className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-6">
          {(Array.isArray(post.body) ? post.body : []).map((block, i) => renderBlock(block, i))}
        </article>

        <div className="max-w-3xl mx-auto px-4 pb-4">
          <div className="pixel-divider" />
        </div>

        {/* Navigation */}
        <section className="border-t-4 border-rpg-border bg-rpg-panel px-4 py-8">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            {next ? (
              <Link href={`/blog/${next.slug}`} className="pixel-btn text-rpg-dim text-[8px] px-4 py-3 no-underline tracking-widest hover:text-rpg-text flex-1 max-w-xs">
                ← {next.title}
              </Link>
            ) : (
              <Link href="/blog" className="pixel-btn text-rpg-dim text-[8px] px-4 py-3 no-underline tracking-widest hover:text-rpg-text">
                ← The Codex
              </Link>
            )}
            {prev ? (
              <Link href={`/blog/${prev.slug}`} className="pixel-btn text-rpg-dim text-[8px] px-4 py-3 no-underline tracking-widest hover:text-rpg-text text-right flex-1 max-w-xs">
                {prev.title} →
              </Link>
            ) : (
              <Link href="/blog" className="pixel-btn text-rpg-dim text-[8px] px-4 py-3 no-underline tracking-widest hover:text-rpg-text">
                Back to Codex →
              </Link>
            )}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
