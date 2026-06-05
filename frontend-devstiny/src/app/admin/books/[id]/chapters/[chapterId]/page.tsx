"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPatch } from "@/lib/api";

// ─── Block types ──────────────────────────────────────────────────────────────

type Block =
  | { type: "text"; content: string }
  | { type: "code"; code: string };

interface BookInfo  { id: string; title: string; volume: string; }
interface ChapterData {
  id: string; title: string; order: number;
  topics: string[]; sections: Block[] | null;
  content: string; example?: string;
}

const INPUT = "w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>{label}</label>
      {children}
    </div>
  );
}

// ─── Single block editor ──────────────────────────────────────────────────────

function BlockEditor({
  block, index, total,
  onChange, onDelete, onMoveUp, onMoveDown,
}: {
  block: Block; index: number; total: number;
  onChange: (b: Block) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const isText = block.type === "text";
  const lineCount = isText
    ? (block.content || "").split("\n").length
    : (block.code || "").split("\n").length;

  return (
    <div className={`flex flex-col gap-2 border-2 p-4 transition-colors ${isText ? "border-rpg-border" : "border-rpg-cyan/40"}`}>
      {/* Block header */}
      <div className="flex items-center gap-3">
        <span
          className={`px-2 py-0.5 text-[7px] tracking-widest border ${isText ? "text-rpg-text border-rpg-border" : "text-rpg-cyan border-rpg-cyan"}`}
          style={{ fontFamily: "var(--font-pixel)" }}>
          {isText ? "TEXT" : "CODE"}
        </span>
        <span className="text-rpg-dim text-xs flex-1" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
          BLOCK {index + 1} · {lineCount} LINE{lineCount !== 1 ? "S" : ""}
        </span>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button onClick={onMoveUp} disabled={index === 0}
            className="w-7 h-7 flex items-center justify-center text-rpg-dim hover:text-rpg-gold disabled:opacity-30 disabled:cursor-not-allowed border border-rpg-border/50 hover:border-rpg-gold transition-colors"
            title="Move up">↑</button>
          <button onClick={onMoveDown} disabled={index === total - 1}
            className="w-7 h-7 flex items-center justify-center text-rpg-dim hover:text-rpg-gold disabled:opacity-30 disabled:cursor-not-allowed border border-rpg-border/50 hover:border-rpg-gold transition-colors"
            title="Move down">↓</button>
          <button
            onClick={() => onChange({ ...block, type: isText ? "code" : "text" } as Block)}
            className="px-2 h-7 text-rpg-dim hover:text-rpg-purple border border-rpg-border/50 hover:border-rpg-purple transition-colors"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
            title="Toggle type">⇄</button>
          <button onClick={onDelete}
            className="w-7 h-7 flex items-center justify-center text-rpg-dim hover:text-rpg-red border border-rpg-border/50 hover:border-rpg-red transition-colors"
            title="Delete block">×</button>
        </div>
      </div>

      {/* Content area */}
      {isText ? (
        <>
          <textarea
            value={(block as { type: "text"; content: string }).content}
            onChange={(e) => onChange({ type: "text", content: e.target.value })}
            placeholder="Write explanation, paragraph, or description here..."
            className={`${INPUT} resize-y leading-6`}
            style={{ minHeight: 280 }}
          />
          <div className="flex flex-wrap gap-x-4 gap-y-1 px-1">
            {[
              ["**bold**", "bold"],
              ["*italic*", "italic"],
              ["`code`", "inline code"],
              ["• item", "bullet list"],
              ["1. item", "numbered list"],
              ["> note", "callout"],
              ["### Heading", "heading"],
            ].map(([syntax, label]) => (
              <span key={syntax} className="text-rpg-dim/60 text-[10px] font-mono">
                <span className="text-rpg-dim/80">{syntax}</span>
                <span className="text-rpg-dim/40 ml-1 not-italic">{label}</span>
              </span>
            ))}
          </div>
        </>
      ) : (
        <textarea
          value={(block as { type: "code"; code: string }).code}
          onChange={(e) => onChange({ type: "code", code: e.target.value })}
          placeholder={`// Code example\nfunction example() {\n  return "hello";\n}`}
          className={`${INPUT} font-mono resize-y leading-6 text-rpg-cyan`}
          style={{ minHeight: 280 }}
          spellCheck={false}
        />
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditChapterPage() {
  const { id: bookId, chapterId } = useParams<{ id: string; chapterId: string }>();
  const router = useRouter();

  const [book,    setBook]    = useState<BookInfo | null>(null);
  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [title,   setTitle]   = useState("");
  const [order,   setOrder]   = useState(1);
  const [topics,  setTopics]  = useState("");
  const [blocks,  setBlocks]  = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [saved,   setSaved]   = useState(false);

  const load = useCallback(async () => {
    try {
      const bookData = await apiGet<BookInfo & { chapters: ChapterData[] }>(`/admin/books/${bookId}`);
      setBook(bookData);
      const ch = bookData.chapters.find((c) => c.id === chapterId);
      if (!ch) { setError("Chapter not found."); return; }
      setChapter(ch);
      setTitle(ch.title);
      setOrder(ch.order);
      setTopics(ch.topics.join(", "));
      // Load sections or fall back to content+example
      if (ch.sections && Array.isArray(ch.sections) && ch.sections.length > 0) {
        setBlocks(ch.sections as Block[]);
      } else {
        const fallback: Block[] = [];
        if (ch.content?.trim()) fallback.push({ type: "text", content: ch.content });
        if (ch.example?.trim()) fallback.push({ type: "code", code: ch.example });
        setBlocks(fallback.length > 0 ? fallback : [{ type: "text", content: "" }]);
      }
    } catch {
      setError("Failed to load chapter.");
    } finally {
      setLoading(false);
    }
  }, [bookId, chapterId]);

  useEffect(() => { load(); }, [load]);

  function addBlock(type: "text" | "code") {
    setBlocks((prev) => [...prev, type === "text" ? { type: "text", content: "" } : { type: "code", code: "" }]);
  }

  function updateBlock(i: number, b: Block) {
    setBlocks((prev) => prev.map((x, idx) => idx === i ? b : x));
  }

  function deleteBlock(i: number) {
    setBlocks((prev) => prev.filter((_, idx) => idx !== i));
  }

  function moveBlock(i: number, dir: -1 | 1) {
    setBlocks((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function doSave() {
    setError(""); setSaved(false); setSaving(true);
    try {
      await apiPatch(`/admin/book-chapters/${chapterId}`, {
        title:    title.trim(),
        order,
        topics:   topics.split(",").map((s) => s.trim()).filter(Boolean),
        sections: blocks,
        // keep content/example in sync for backwards compat
        content:  blocks.filter((b) => b.type === "text").map((b) => (b as { type: "text"; content: string }).content).join("\n\n"),
        example:  blocks.filter((b) => b.type === "code").map((b) => (b as { type: "code"; code: string }).code).join("\n\n") || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    }
    setSaving(false);
  }

  async function handleSaveAndBack() {
    await doSave();
    if (!error) router.push(`/admin/books/${bookId}`);
  }

  if (loading) return (
    <div className="p-8 flex justify-center">
      <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>LOADING...</span>
    </div>
  );

  const textCount = blocks.filter((b) => b.type === "text").length;
  const codeCount = blocks.filter((b) => b.type === "code").length;

  return (
    <div className="p-8 flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/admin/books" className="text-rpg-dim hover:text-rpg-gold no-underline transition-colors"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>← BOOKS</Link>
        <span className="text-rpg-border" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>›</span>
        <Link href={`/admin/books/${bookId}`} className="text-rpg-dim hover:text-rpg-gold no-underline transition-colors"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>{book?.volume ?? "..."}</Link>
        <span className="text-rpg-border" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>›</span>
        <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>{chapter?.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">EDIT CHAPTER</h1>
          {book && <p className="text-rpg-dim text-xs">{book.volume} — {book.title}</p>}
          <div className="w-24 pixel-divider-gold mt-1" />
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-rpg-green border border-rpg-green px-3 py-1.5"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>✓ SAVED</span>
          )}
          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
            {blocks.length} BLOCKS · {textCount}T · {codeCount}C
          </span>
        </div>
      </div>

      {/* Meta fields */}
      <div className="flex flex-col gap-4 p-4 border-2 border-rpg-border/50 bg-rpg-panel/30">
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-3">
            <Field label="TITLE">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={INPUT} />
            </Field>
          </div>
          <Field label="ORDER">
            <input type="number" value={order} onChange={(e) => setOrder(parseInt(e.target.value) || 1)} className={INPUT} />
          </Field>
        </div>
        <Field label="TOPICS (comma separated)">
          <input value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder="Variables, Functions, Arrays"
            className={INPUT} />
        </Field>
      </div>

      {/* Block editor */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <span className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
            CONTENT BLOCKS
          </span>
          <div className="flex-1 h-px bg-rpg-border" />
        </div>

        {blocks.length === 0 && (
          <p className="text-rpg-dim text-sm text-center py-8 border-2 border-dashed border-rpg-border/40">
            No blocks yet. Add a text or code block below.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {blocks.map((block, i) => (
            <BlockEditor
              key={i}
              block={block}
              index={i}
              total={blocks.length}
              onChange={(b) => updateBlock(i, b)}
              onDelete={() => deleteBlock(i)}
              onMoveUp={() => moveBlock(i, -1)}
              onMoveDown={() => moveBlock(i, 1)}
            />
          ))}
        </div>

        {/* Add block buttons */}
        <div className="flex gap-3 pt-1">
          <button onClick={() => addBlock("text")}
            className="pixel-btn text-rpg-dim text-[8px] px-4 py-2 tracking-widest hover:text-rpg-text">
            + TEXT BLOCK
          </button>
          <button onClick={() => addBlock("code")}
            className="border border-rpg-cyan/50 text-rpg-cyan px-4 py-2 hover:bg-rpg-cyan/10 transition-colors"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
            + CODE BLOCK
          </button>
        </div>
      </div>

      {error && <p className="text-rpg-red text-sm">{error}</p>}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t-2 border-rpg-border">
        <button onClick={doSave} disabled={saving}
          className="pixel-btn-gold text-[9px] px-6 py-3 tracking-widest disabled:opacity-40">
          {saving ? "SAVING..." : "▶ SAVE"}
        </button>
        <button onClick={handleSaveAndBack} disabled={saving}
          className="pixel-btn text-rpg-dim text-[8px] px-6 py-3 tracking-widest hover:text-rpg-text disabled:opacity-40">
          SAVE & BACK
        </button>
        <Link href={`/admin/books/${bookId}`}
          className="pixel-btn text-rpg-dim text-[8px] px-4 py-3 no-underline tracking-widest hover:text-rpg-text">
          ← BACK
        </Link>
      </div>
    </div>
  );
}
