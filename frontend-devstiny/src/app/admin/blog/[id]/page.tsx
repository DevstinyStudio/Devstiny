"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet, apiPatch, apiDelete } from "@/lib/api";
import MediaPicker from "@/components/admin/MediaPicker";

const INPUT_CLASS = "w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors";

type BlockType = "p" | "h2" | "h3" | "code" | "ul" | "blockquote" | "table";
interface Block { type: BlockType; text: string }

interface AdminBlogPost {
  id: string; slug: string; title: string; excerpt: string;
  body: Block[]; author: string; tag: string; gem: string;
  readTime: number; isPublished: boolean; order: number;
}

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

export default function EditBlogPostPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const [form, setForm] = useState({
    slug: "", title: "", excerpt: "", author: "Elvar",
    tag: "JAVASCRIPT", gem: "/gem/gem-9.png",
    readTime: 5, isPublished: false, order: 0,
  });
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    apiGet<AdminBlogPost>(`/admin/blog/${id}`)
      .then((post) => {
        if (!post) return;
        setForm({
          slug: post.slug, title: post.title, excerpt: post.excerpt,
          author: post.author, tag: post.tag, gem: post.gem,
          readTime: post.readTime, isPublished: post.isPublished, order: post.order,
        });
        setBlocks(Array.isArray(post.body) ? post.body : []);
      })
      .catch(() => setError("Failed to load post."))
      .finally(() => setLoading(false));
  }, [id]);

  function setField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
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
      await apiPatch(`/admin/blog/${id}`, { ...form, body: blocks });
      router.push("/admin/blog");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      await apiDelete(`/admin/blog/${id}`);
      router.push("/admin/blog");
    } catch { setError("Delete failed."); }
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center h-64">
      <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>LOADING...</span>
    </div>
  );

  return (
    <div className="p-8 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">EDIT POST</h1>
          <div className="w-10 pixel-divider-gold mt-1" />
        </div>
        <button onClick={handleDelete}
          className="border-2 border-rpg-red/60 text-rpg-red hover:bg-rpg-red/10 transition-colors px-3 py-1.5"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
          DELETE POST
        </button>
      </div>

      {error && (
        <div className="border-2 border-rpg-red bg-rpg-red/10 px-4 py-3 text-rpg-red text-xs">{error}</div>
      )}

      {/* Meta */}
      <div className="pixel-panel flex flex-col gap-5">
        <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>METADATA</span>
        <div className="grid grid-cols-2 gap-4">
          <Field label="TITLE">
            <input className={INPUT_CLASS} value={form.title} onChange={(e) => setField("title", e.target.value)} />
          </Field>
          <Field label="SLUG">
            <input className={INPUT_CLASS} value={form.slug} onChange={(e) => setField("slug", e.target.value)} />
          </Field>
        </div>
        <Field label="EXCERPT">
          <textarea className={INPUT_CLASS} rows={2} value={form.excerpt} onChange={(e) => setField("excerpt", e.target.value)} />
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
        <div className="flex items-center gap-3">
          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>STATUS</span>
          <button
            onClick={() => setField("isPublished", !form.isPublished)}
            className="border px-3 py-1 transition-colors"
            style={{
              fontFamily: "var(--font-pixel)", fontSize: 7,
              borderColor: form.isPublished ? "#40e070" : "#3d2d8c",
              color:       form.isPublished ? "#40e070" : "#b4b4df",
              background:  form.isPublished ? "rgba(64,224,112,0.08)" : "transparent",
            }}
          >
            {form.isPublished ? "PUBLISHED" : "DRAFT"}
          </button>
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
                block.type === "code"  ? "code snippet..." :
                block.type === "h2"    ? "Section heading..." :
                block.type === "h3"    ? "Sub-heading..." :
                block.type === "ul"    ? "Item 1\nItem 2\nItem 3 (one per line)" :
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
            <button key={t} onClick={() => addBlock(t as BlockType)}
              className="pixel-btn text-[8px] px-3 py-1.5 tracking-widest hover:text-rpg-gold transition-colors"
              style={{ color: BLOCK_COLORS[t as BlockType] }}>
              + {BLOCK_LABELS[t as BlockType]}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button onClick={handleSave} disabled={saving}
          className="pixel-btn-gold text-[9px] px-5 py-2.5 tracking-widest disabled:opacity-40">
          {saving ? "SAVING..." : "SAVE CHANGES"}
        </button>
        <button onClick={() => router.push("/admin/blog")}
          className="text-rpg-dim hover:text-rpg-text transition-colors text-xs">
          CANCEL
        </button>
      </div>
    </div>
  );
}
