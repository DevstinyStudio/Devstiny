"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReplyForm from "@/components/forum/ReplyForm";
import { apiGet, apiPost, apiPatch, getUser } from "@/lib/api";
import { getUserCostume } from "@/lib/costume";

const CATEGORY_COLOR: Record<string, string> = {
  "tavern":            "text-rpg-gold",
  "oracle":            "text-rpg-cyan",
  "hall-of-champions": "text-rpg-green",
  "guild-board":       "text-rpg-purple",
};

const CATEGORY_LABEL: Record<string, string> = {
  "tavern":            "The Tavern",
  "oracle":            "The Oracle",
  "hall-of-champions": "Hall of Champions",
  "guild-board":       "Guild Board",
};


function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60)        return "just now";
  if (s < 3600)      return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)     return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

interface Reply {
  id: string;
  content: string;
  author: { username: string; progress?: { costume: string } | null };
  likes: number;
  isAnswer: boolean;
  createdAt: string;
}

interface Thread {
  id: string;
  title: string;
  content: string;
  category: string;
  author: { id: string; username: string; progress?: { costume: string } | null };
  replies: Reply[];
  views: number;
  solved: boolean;
  createdAt: string;
  updatedAt: string;
}

function Avatar({ username, costume, size = 40 }: { username: string; costume?: string | null; size?: number }) {
  const src = getUserCostume(username, costume);
  return (
    <div
      className="shrink-0 overflow-hidden border-2 border-rpg-border bg-rpg-panel"
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt={username}
        style={{
          width: size,
          height: size * 2,
          objectFit: "cover",
          objectPosition: "top center",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}

export default function ThreadPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [thread,   setThread]   = useState<Thread | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [likedIds,   setLikedIds]   = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [solving,    setSolving]    = useState(false);

  const currentUser = getUser();

  useEffect(() => {
    if (!id) return;
    apiGet<Thread>(`/forum/threads/${id}`)
      .then((data) => {
        setThread(data);
        const counts: Record<string, number> = {};
        data.replies.forEach((r) => { counts[r.id] = r.likes; });
        setLikeCounts(counts);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleLike(replyId: string) {
    if (!currentUser) { router.push("/login"); return; }
    if (likedIds.has(replyId)) return;
    try {
      const res = await apiPost<{ id: string; likes: number }>(`/forum/replies/${replyId}/like`, {});
      setLikeCounts((prev) => ({ ...prev, [replyId]: res.likes }));
      setLikedIds((prev) => new Set([...prev, replyId]));
    } catch { /* ignore */ }
  }

  async function handleToggleSolved() {
    if (!thread) return;
    setSolving(true);
    try {
      const res = await apiPatch<{ id: string; solved: boolean }>(
        `/forum/threads/${thread.id}/solve`, {}
      );
      setThread((prev) => prev ? { ...prev, solved: res.solved } : prev);
    } catch { /* ignore */ }
    setSolving(false);
  }

  async function handlePinReply(replyId: string) {
    if (!thread) return;
    try {
      const res = await apiPatch<{ replyId: string; pinned: boolean }>(
        `/forum/threads/${thread.id}/pin`, { replyId }
      );
      setThread((prev) =>
        prev ? {
          ...prev,
          replies: prev.replies.map((r) => ({
            ...r,
            isAnswer: r.id === res.replyId ? res.pinned : false,
          })),
        } : prev
      );
    } catch { /* ignore */ }
  }

  function onReplyPosted(reply: Reply) {
    setThread((prev) =>
      prev ? { ...prev, replies: [...prev.replies, reply] } : prev
    );
    setLikeCounts((prev) => ({ ...prev, [reply.id]: 0 }));
  }

  // ── Render states ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-rpg-bg pt-14 flex items-center justify-center">
          <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>
            LOADING...
          </span>
        </main>
      </>
    );
  }

  if (notFound || !thread) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-rpg-bg pt-14 flex flex-col items-center justify-center gap-4">
          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>THREAD NOT FOUND</span>
          <Link href="/forum" className="pixel-btn text-rpg-dim text-[8px] px-4 py-3 no-underline tracking-widest hover:text-rpg-text">
            ← BACK TO FORUM
          </Link>
        </main>
      </>
    );
  }

  const catColor = CATEGORY_COLOR[thread.category] ?? "text-rpg-dim";
  const catLabel = CATEGORY_LABEL[thread.category] ?? thread.category;
  const isAuthor = currentUser?.id === thread.author.id;

  const canSolve = thread.category === "oracle";
  const canPin   = ["oracle", "hall-of-champions"].includes(thread.category);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-rpg-bg pt-14 pb-20">
        <div className="max-w-3xl mx-auto px-4 pt-10 flex flex-col gap-8">

          {/* ── Breadcrumb ─────────────────────────────────────────── */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/forum" className="text-rpg-dim hover:text-rpg-text no-underline transition-colors"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
              FORUM
            </Link>
            <span className="text-rpg-border" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>›</span>
            <Link href={`/forum/category/${thread.category}`}
              className={`no-underline hover:text-rpg-gold transition-colors ${catColor}`}
              style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
              {catLabel.toUpperCase()}
            </Link>
          </div>

          {/* ── Title block ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                {thread.solved && (
                  <span className="shrink-0 px-2 py-0.5 border border-rpg-green text-rpg-green"
                    style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                    ✓ SOLVED
                  </span>
                )}
                <span className={`shrink-0 px-2 py-0.5 border ${catColor}`}
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 7, borderColor: "currentColor" }}>
                  {catLabel.toUpperCase()}
                </span>
              </div>

              {/* Solve toggle — only thread author + allowed categories */}
              {isAuthor && canSolve && (
                <button
                  onClick={handleToggleSolved}
                  disabled={solving}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 border-2 transition-colors disabled:opacity-40"
                  style={{
                    fontFamily: "var(--font-pixel)",
                    fontSize: 7,
                    borderColor: thread.solved ? "#40e070" : "#3d2d8c",
                    color:       thread.solved ? "#40e070" : "#b4b4df",
                    background:  thread.solved ? "rgba(64,224,112,0.08)" : "transparent",
                  }}
                >
                  {solving ? "..." : thread.solved ? "✓ MARK UNSOLVED" : "◻ MARK AS SOLVED"}
                </button>
              )}
            </div>

            <h1 className="text-lg sm:text-xl text-rpg-text leading-7">{thread.title}</h1>
            <div className="flex items-center gap-4 text-rpg-dim flex-wrap"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
              <span>by {thread.author.username}</span>
              <span>{timeAgo(thread.createdAt)}</span>
              <span>{thread.views} views</span>
              <span>{thread.replies.length} {thread.replies.length === 1 ? "reply" : "replies"}</span>
            </div>
          </div>

          <div className="pixel-divider" />

          {/* ── Original post ───────────────────────────────────────── */}
          <div className="flex gap-4">
            <Avatar username={thread.author.username} costume={thread.author.progress?.costume} size={40} />
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              <div className="flex items-center gap-3">
                <Link href={`/profile/${thread.author.username}`}
                  className="text-rpg-text hover:text-rpg-gold text-sm font-medium no-underline transition-colors">
                  {thread.author.username}
                </Link>
                <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                  {timeAgo(thread.createdAt)}
                </span>
              </div>
              <div className="text-sm text-rpg-dim leading-7 whitespace-pre-line">{thread.content}</div>
            </div>
          </div>

          {/* ── Replies ─────────────────────────────────────────────── */}
          {thread.replies.length > 0 && (
            <div className="flex flex-col gap-0">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-rpg-dim tracking-widest"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                  {thread.replies.length} {thread.replies.length === 1 ? "REPLY" : "REPLIES"}
                </span>
                <div className="flex-1 h-px bg-rpg-border" />
              </div>

              <div className="flex flex-col gap-6">
                {/* Pinned reply always first */}
                {[...thread.replies].sort((a, b) => (b.isAnswer ? 1 : 0) - (a.isAnswer ? 1 : 0)).map((r) => (
                  <div key={r.id} className="flex gap-4">
                    <Avatar username={r.author.username} costume={r.author.progress?.costume} size={36} />
                    <div
                      className="flex-1 flex flex-col gap-3 min-w-0 p-4 border-l-2"
                      style={{
                        borderColor: r.isAnswer ? "#f0c040" : "#3d2d8c",
                        background:  r.isAnswer ? "rgba(240,192,64,0.05)" : "transparent",
                      }}
                    >
                      {/* Reply header */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Link href={`/profile/${r.author.username}`}
                            className="text-rpg-text hover:text-rpg-gold text-sm font-medium no-underline transition-colors">
                            {r.author.username}
                          </Link>
                          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                            {timeAgo(r.createdAt)}
                          </span>
                          {r.isAnswer && (
                            <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                              📌 PINNED
                            </span>
                          )}
                        </div>

                        {/* Pin toggle — top right, only thread author + allowed categories */}
                        {isAuthor && canPin && (
                          <button
                            onClick={() => handlePinReply(r.id)}
                            className="shrink-0 transition-colors hover:opacity-80"
                            style={{
                              fontFamily: "var(--font-pixel)",
                              fontSize: 7,
                              color: r.isAnswer ? "#f0c040" : "#3d2d8c",
                            }}
                          >
                            {r.isAnswer ? "📌 UNPIN" : "📌 PIN"}
                          </button>
                        )}
                      </div>

                      {/* Reply body */}
                      <div className="text-sm text-rpg-dim leading-7 whitespace-pre-line">{r.content}</div>

                      {/* Actions */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLike(r.id)}
                          disabled={likedIds.has(r.id)}
                          className="flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          style={{
                            fontFamily: "var(--font-pixel)",
                            fontSize: 7,
                            color: likedIds.has(r.id) ? "#f0c040" : "#b4b4df",
                          }}
                        >
                          <span>▲</span>
                          <span>{likeCounts[r.id] ?? r.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Reply form ──────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="text-rpg-dim tracking-widest"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                LEAVE A REPLY
              </span>
              <div className="flex-1 h-px bg-rpg-border" />
            </div>
            <ReplyForm threadId={thread.id} onReplyPosted={onReplyPosted} />
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
