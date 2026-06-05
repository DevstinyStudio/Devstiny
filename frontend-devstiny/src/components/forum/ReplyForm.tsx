"use client";

import { useState } from "react";
import Link from "next/link";
import { apiPost, getUser } from "@/lib/api";

interface Reply {
  id: string;
  content: string;
  author: { username: string; progress?: { costume: string } | null };
  likes: number;
  isAnswer: boolean;
  createdAt: string;
}

interface ReplyFormProps {
  threadId: string;
  onReplyPosted?: (reply: Reply) => void;
}

export default function ReplyForm({ threadId, onReplyPosted }: ReplyFormProps) {
  const [content,    setContent]    = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  const user      = getUser();
  const canSubmit = content.trim().length >= 10;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !user) return;
    setSubmitting(true);
    setError("");
    try {
      const reply = await apiPost<Reply>(`/forum/threads/${threadId}/replies`, {
        content: content.trim(),
      });
      setContent("");
      onReplyPosted?.(reply);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to post reply.");
    } finally {
      setSubmitting(false);
    }
  }

  // Not logged in
  if (!user) {
    return (
      <div className="pixel-panel flex flex-col items-center gap-3 py-8">
        <span className="text-rpg-dim text-sm">You must be logged in to reply.</span>
        <Link href="/login" className="pixel-btn-gold text-[9px] px-5 py-2.5 no-underline tracking-widest">
          LOG IN TO REPLY
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="pixel-panel flex flex-col gap-4">
      <span className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
        YOUR REPLY
      </span>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
        placeholder="Share your knowledge, experience, or question..."
        className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-4 py-3 transition-colors placeholder:text-rpg-border resize-y"
        style={{ fontFamily: "inherit", minHeight: "120px" }}
      />

      {error && (
        <p className="text-rpg-red text-xs">{error}</p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
          {content.length} chars {content.length > 0 && content.length < 10 && "— at least 10"}
        </span>
        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="pixel-btn-gold text-[9px] px-5 py-2.5 tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? "POSTING..." : "▶ SEND REPLY"}
        </button>
      </div>
    </form>
  );
}
