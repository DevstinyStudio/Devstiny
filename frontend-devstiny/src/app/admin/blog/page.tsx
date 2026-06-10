"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPatch, apiDelete } from "@/lib/api";

interface AdminBlogPost {
  id: string; slug: string; title: string; tag: string; author: string;
  readTime: number; isPublished: boolean; order: number; createdAt: string;
}

const TAG_COLOR: Record<string, string> = {
  HTML: "#40e070", CSS: "#40d0e0", JAVASCRIPT: "#f0c040", GUIDE: "#c060e0",
};

export default function AdminBlogPage() {
  const [posts,   setPosts]   = useState<AdminBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    apiGet<AdminBlogPost[]>("/admin/blog")
      .then((d) => setPosts(d ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function togglePublished(post: AdminBlogPost) {
    const updated = await apiPatch<AdminBlogPost>(`/admin/blog/${post.id}`, { isPublished: !post.isPublished });
    if (updated) setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, isPublished: !p.isPublished } : p));
  }

  async function handleDelete(post: AdminBlogPost) {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setDeleting(post.id);
    try {
      await apiDelete(`/admin/blog/${post.id}`);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch { /* noop */ }
    setDeleting(null);
  }

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">
            BLOG
          </h1>
          <div className="w-10 pixel-divider-gold" />
          {!loading && (
            <span className="text-rpg-dim mt-1" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
              {posts.length} POSTS · {posts.filter((p) => p.isPublished).length} PUBLISHED
            </span>
          )}
        </div>
        <Link href="/admin/blog/new" className="pixel-btn-gold text-[9px] px-5 py-2.5 no-underline tracking-widest">
          + NEW POST
        </Link>
      </div>

      {/* Table */}
      <div className="pixel-panel p-0 overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>LOADING...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>NO POSTS YET</span>
            <Link href="/admin/blog/new" className="pixel-btn-gold text-[9px] px-4 py-2 no-underline tracking-widest">+ NEW POST</Link>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-rpg-border">
                {["ORDER", "TITLE", "TAG", "AUTHOR", "READ TIME", "STATUS", "ACTIONS"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-rpg-dim whitespace-nowrap"
                    style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-rpg-border/30 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>{post.order}</span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <span className="text-sm text-rpg-text line-clamp-1">{post.title}</span>
                    <span className="text-rpg-dim/60 text-xs">{post.slug}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: TAG_COLOR[post.tag] ?? "#b4b4df" }}>
                      {post.tag}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-rpg-dim text-xs">{post.author}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>{post.readTime}m</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublished(post)}
                      className="border px-2 py-0.5 transition-colors"
                      style={{
                        fontFamily: "var(--font-pixel)", fontSize: 7,
                        borderColor: post.isPublished ? "#40e070" : "#3d2d8c",
                        color:       post.isPublished ? "#40e070" : "#b4b4df",
                      }}
                    >
                      {post.isPublished ? "PUBLISHED" : "DRAFT"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/blog/${post.id}`}
                        className="text-rpg-dim hover:text-rpg-gold transition-colors no-underline"
                        style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                        EDIT
                      </Link>
                      <button
                        onClick={() => handleDelete(post)}
                        disabled={deleting === post.id}
                        className="text-rpg-dim hover:text-rpg-red transition-colors disabled:opacity-40"
                        style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                        {deleting === post.id ? "..." : "DELETE"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
