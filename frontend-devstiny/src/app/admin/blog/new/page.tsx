"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import MediaPicker from "@/components/admin/MediaPicker";

const INPUT_CLASS = "w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors";

type BlockType = "p" | "h2" | "h3" | "code" | "ul" | "blockquote" | "table";
interface Block { type: BlockType; text: string }

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={error ? "text-rpg-red" : "text-rpg-dim"} style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
        {label}{error && <span className="ml-2 text-rpg-red">{error}</span>}
      </label>
      {children}
    </div>
  );
}

const BLOCK_LABELS: Record<BlockType, string> = {
  p: "PARAGRAPH", h2: "HEADING 2", h3: "HEADING 3",
  code: "CODE", ul: "LIST", blockquote: "QUOTE", table: "TABLE",
};
const BLOCK_COLORS: Record<BlockType, string> = {
  p: "#b4b4df", h2: "#f0c040", h3: "#40d0e0",
  code: "#40d0e0", ul: "#b4b4df", blockquote: "#c060e0", table: "#40e070",
};

export default function NewBlogPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const [form, setForm] = useState({
    slug: "", title: "", excerpt: "", author: "Elvar",
    tag: "JAVASCRIPT", gem: "/gem/gem-9.png",
    readTime: 5, isPublished: false, order: 0,
  });
  const [blocks, setBlocks] = useState<Block[]>([
    { type: "p", text: "" },
  ]);

  function slugify(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function setField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({
      ...f,
      [key]: value,
      ...(key === "title" && !f.slug ? { slug: slugify(value as string) } : {}),
    }));
  }

  function addBlock(type: BlockType) {
    setBlocks((b) => [...b, { type, text: "" }]);
  }

  function updateBlock(i: number, text: string) {
    setBlocks((b) => b.map((bl, idx) => idx === i ? { ...bl, text } : bl));
  }

  function changeBlockType(i: number, type: BlockType) {
    setBlocks((b) => b.map((bl, idx) => idx === i ? { ...bl, type } : bl));
  }

  function moveBlock(i: number, dir: -1 | 1) {
    setBlocks((b) => {
      const arr = [...b];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
  }

  function removeBlock(i: number) {
    setBlocks((b) => b.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    if (!form.slug || !form.title) { setError("Slug and title are required."); return; }
    setSaving(true); setError("");
    try {
      await apiPost("/admin/blog", { ...form, body: blocks });
      router.push("/admin/blog");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">NEW POST</h1>
        <div className="w-10 pixel-divider-gold mt-1" />
      </div>

      {error && (
        <div className="border-2 border-rpg-red bg-rpg-red/10 px-4 py-3 text-rpg-red text-xs">{error}</div>
      )}

      {/* Meta */}
      <div className="pixel-panel flex flex-col gap-5">
        <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>METADATA</span>
        <div className="grid grid-cols-2 gap-4">
          <Field label="TITLE">
            <input className={INPUT_CLASS} value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder="Post title" />
          </Field>
          <Field label="SLUG">
            <input className={INPUT_CLASS} value={form.slug} onChange={(e) => setField("slug", slugify(e.target.value))} placeholder="auto-generated" />
          </Field>
        </div>
        <Field label="EXCERPT">
          <textarea className={INPUT_CLASS} rows={2} value={form.excerpt}
            onChange={(e) => setField("excerpt", e.target.value)} placeholder="Short description shown in listings" />
        </Field>
        <div className="grid grid-cols-3 gap-4">
          <Field label="TAG">
            <select className={INPUT_CLASS} value={form.tag} onChange={(e) => setField("tag", e.target.value)}>
              {["HTML", "CSS", "JAVASCRIPT", "GUIDE"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="AUTHOR">
            <input className={INPUT_CLASS} value={form.author} onChange={(e) => setField("author", e.target.value)} />
          </Field>
          <Field label="READ TIME (MIN)">
            <input className={INPUT_CLASS} type="number" min={1} max={60} value={form.readTime}
              onChange={(e) => setField("readTime", parseInt(e.target.value) || 1)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <MediaPicker folder="gem" value={form.gem} onChange={(v) => setField("gem", v)} label="GEM IMAGE" />
          <Field label="ORDER">
            <input className={INPUT_CLASS} type="number" min={0} value={form.order}
              onChange={(e) => setField("order", parseInt(e.target.value) || 0)} />
          </Field>
        </div>
      </div>

      {/* Body blocks */}
      <div className="pixel-panel flex flex-col gap-4">
        <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>BODY BLOCKS</span>

        {blocks.map((block, i) => (
          <div key={i} className="border-2 border-rpg-border/50 bg-rpg-bg p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <select
                className="bg-rpg-bg border border-rpg-border text-xs px-2 py-1 outline-none focus:border-rpg-gold transition-colors"
                value={block.type}
                onChange={(e) => changeBlockType(i, e.target.value as BlockType)}
                style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: BLOCK_COLORS[block.type] }}
              >
                {(Object.keys(BLOCK_LABELS) as BlockType[]).map((t) => (
                  <option key={t} value={t}>{BLOCK_LABELS[t]}</option>
                ))}
              </select>
              <div className="flex-1" />
              <button onClick={() => moveBlock(i, -1)} disabled={i === 0}
                className="text-rpg-dim hover:text-rpg-text disabled:opacity-30 px-1"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>↑</button>
              <button onClick={() => moveBlock(i, 1)} disabled={i === blocks.length - 1}
                className="text-rpg-dim hover:text-rpg-text disabled:opacity-30 px-1"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>↓</button>
              <button onClick={() => removeBlock(i)}
                className="text-rpg-dim hover:text-rpg-red transition-colors px-1"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>✕</button>
            </div>
            <textarea
              className={`${INPUT_CLASS} resize-y`}
              rows={block.type === "code" || block.type === "table" ? 6 : block.type === "ul" ? 5 : 3}
              value={block.text}
              onChange={(e) => updateBlock(i, e.target.value)}
              placeholder={
                block.type === "code" ? "code snippet..." :
                block.type === "h2"   ? "Section heading..." :
                block.type === "h3"   ? "Sub-heading..." :
                block.type === "ul"   ? "Item 1\nItem 2\nItem 3 (one per line)" :
                block.type === "table" ? "Col1|Col2|Col3\nRow1Val1|Row1Val2|Row1Val3" :
                block.type === "blockquote" ? "Quote text..." :
                "Paragraph text..."
              }
              style={{ fontFamily: block.type === "code" ? "monospace" : undefined }}
            />
          </div>
        ))}

        <div className="flex items-center gap-2">
          {(Object.keys(BLOCK_LABELS) as BlockType[]).map((t) => (
            <button key={t} onClick={() => addBlock(t)}
              className="pixel-btn text-[8px] px-3 py-1.5 tracking-widest hover:text-rpg-gold transition-colors"
              style={{ color: BLOCK_COLORS[t] }}>
              + {BLOCK_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => { setField("isPublished", false); handleSave(); }}
          disabled={saving}
          className="pixel-btn text-[9px] px-5 py-2.5 tracking-widest hover:text-rpg-gold transition-colors disabled:opacity-40"
        >
          SAVE AS DRAFT
        </button>
        <button
          onClick={() => { setField("isPublished", true); handleSave(); }}
          disabled={saving}
          className="pixel-btn-gold text-[9px] px-5 py-2.5 tracking-widest disabled:opacity-40"
        >
          {saving ? "SAVING..." : "PUBLISH"}
        </button>
        <button onClick={() => router.push("/admin/blog")}
          className="text-rpg-dim hover:text-rpg-text transition-colors text-xs ml-2">
          CANCEL
        </button>
      </div>
    </div>
  );
}
