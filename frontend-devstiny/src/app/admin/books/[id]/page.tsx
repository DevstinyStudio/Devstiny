"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPatch } from "@/lib/api";

const COLORS = [
  { label: "Red",    color: "text-rpg-red",    border: "border-rpg-red",    hex: "#e05050" },
  { label: "Purple", color: "text-rpg-purple",  border: "border-rpg-purple", hex: "#c060e0" },
  { label: "Gold",   color: "text-rpg-gold",    border: "border-rpg-gold",   hex: "#f0c040" },
  { label: "Cyan",   color: "text-rpg-cyan",    border: "border-rpg-cyan",   hex: "#40d0e0" },
  { label: "Green",  color: "text-rpg-green",   border: "border-rpg-green",  hex: "#40e070" },
];
const BOOK_IMAGES = Array.from({ length: 64 }, (_, i) => `/book/book-${i + 1}.png`);
const LANGS = ["html", "css", "javascript", "text"];

interface BookChapter {
  id: string; title: string; topics: string[]; order: number;
}
interface FullBook {
  id: string; slug: string; volume: string; title: string; subtitle: string;
  author: string; description: string; color: string; border: string;
  icon: string; coverImage: string; defaultLang: string; status: string; order: number;
  chapters: BookChapter[];
}

export default function EditBookPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();

  const [book,    setBook]    = useState<FullBook | null>(null);
  const [form,    setForm]    = useState<Partial<FullBook>>({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    apiGet<FullBook>(`/admin/books/${id}`)
      .then((b) => { setBook(b); setForm(b); })
      .catch(() => setError("Book not found."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    setSaving(true); setError("");
    try {
      await apiPatch(`/admin/books/${id}`, {
        volume: form.volume, title: form.title, subtitle: form.subtitle,
        author: form.author, description: form.description,
        color: form.color, border: form.border, icon: form.icon,
        coverImage: form.coverImage,
        defaultLang: form.defaultLang, status: form.status, order: form.order,
      });
      router.push("/admin/books");
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Save failed."); }
    setSaving(false);
  }

  async function deleteChapter(chId: string) {
    if (!confirm("Delete this chapter? This cannot be undone.")) return;
    setDeleting(chId);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/admin/book-chapters/${chId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } },
      );
      await load();
    } catch { /* ignore */ }
    setDeleting(null);
  }

  const selectedColor = COLORS.find((c) => c.color === form.color);

  if (loading) return (
    <div className="p-8 flex justify-center">
      <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>LOADING...</span>
    </div>
  );

  return (
    <div className="p-8 flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/admin/books" className="text-rpg-dim hover:text-rpg-gold no-underline transition-colors"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>← BOOKS</Link>
        <span className="text-rpg-border" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>›</span>
        <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>{book?.volume}</span>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">EDIT BOOK</h1>
        <div className="w-20 pixel-divider-gold mt-1" />
      </div>

      {/* ── Book metadata form ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-4">
          <Field label="VOLUME"><input value={form.volume ?? ""} onChange={(e) => setForm({ ...form, volume: e.target.value })} className={INPUT} /></Field>
          <Field label="SLUG (read-only)"><input value={form.slug ?? ""} disabled className={`${INPUT} opacity-50`} /></Field>
          <Field label="ORDER"><input type="number" value={form.order ?? 0} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className={INPUT} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="TITLE"><input value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} className={INPUT} /></Field>
          <Field label="SUBTITLE"><input value={form.subtitle ?? ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className={INPUT} /></Field>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field label="AUTHOR"><input value={form.author ?? ""} onChange={(e) => setForm({ ...form, author: e.target.value })} className={INPUT} /></Field>
          <Field label="DEFAULT LANG">
            <select value={form.defaultLang ?? "javascript"} onChange={(e) => setForm({ ...form, defaultLang: e.target.value })} className={INPUT}>
              {LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="STATUS">
            <select value={form.status ?? "available"} onChange={(e) => setForm({ ...form, status: e.target.value })} className={INPUT}>
              <option value="available">Available</option>
              <option value="coming-soon">Coming Soon</option>
            </select>
          </Field>
        </div>
        <Field label="DESCRIPTION">
          <textarea value={form.description ?? ""} rows={2} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${INPUT} resize-y`} />
        </Field>

        {/* Color */}
        <Field label="COLOR">
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button key={c.color} onClick={() => setForm({ ...form, color: c.color, border: c.border })}
                className="w-8 h-8 border-2 transition-colors rounded-sm"
                style={{ background: c.hex, borderColor: form.color === c.color ? "#f0c040" : "#3d2d8c" }}
                title={c.label} />
            ))}
          </div>
          {selectedColor && <span className="text-xs mt-1" style={{ color: selectedColor.hex, fontFamily: "var(--font-pixel)", fontSize: 7 }}>{selectedColor.label.toUpperCase()}</span>}
        </Field>

        {/* Cover Image + Preview */}
        <div className="flex gap-4 items-start">
          <div className="flex flex-col gap-2 shrink-0">
            <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>PREVIEW</span>
            <div className={`w-24 h-24 flex items-center justify-center border ${form.border ?? "border-rpg-border"} bg-rpg-bg`}>
              <img src={form.coverImage || "/book/book-1.png"} alt="preview" style={{ width: 80, height: 80, imageRendering: "pixelated", objectFit: "contain" }} />
            </div>
            <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
              {form.coverImage?.split("/").pop()}
            </span>
          </div>
          <Field label="COVER IMAGE">
            <div className="grid grid-cols-8 gap-1 max-h-52 overflow-y-auto p-1.5 bg-rpg-bg border border-rpg-border">
              {BOOK_IMAGES.map((img) => (
                <button key={img} onClick={() => setForm({ ...form, coverImage: img })}
                  className="w-10 h-10 flex items-center justify-center border transition-colors p-0.5"
                  style={{ borderColor: form.coverImage === img ? "#f0c040" : "transparent", background: form.coverImage === img ? "rgba(240,192,64,0.08)" : "transparent" }}>
                  <img src={img} alt={img} style={{ width: 32, height: 32, imageRendering: "pixelated", objectFit: "contain" }} />
                </button>
              ))}
            </div>
          </Field>
        </div>
      </div>

      {error && <p className="text-rpg-red text-sm">{error}</p>}
      <div className="flex gap-4">
        <button onClick={handleSave} disabled={saving} className="pixel-btn-gold text-[9px] px-6 py-3 tracking-widest disabled:opacity-40">
          {saving ? "SAVING..." : "▶ SAVE CHANGES"}
        </button>
        <Link href="/admin/books" className="pixel-btn text-rpg-dim text-[8px] px-4 py-3 no-underline tracking-widest hover:text-rpg-text">CANCEL</Link>
      </div>

      {/* ── Chapters ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
            CHAPTERS ({book?.chapters.length ?? 0})
          </span>
          <div className="flex-1 h-px bg-rpg-border" />
          <Link href={`/admin/books/${id}/chapters/new`}
            className="pixel-btn-gold text-[8px] px-3 py-2 tracking-widest no-underline">
            + ADD CHAPTER
          </Link>
        </div>

        <div className="pixel-panel p-0 overflow-hidden">
          {(book?.chapters ?? []).length === 0 ? (
            <p className="text-center py-8 text-rpg-dim text-sm">No chapters yet.</p>
          ) : (
            [...(book?.chapters ?? [])].sort((a, b) => a.order - b.order).map((ch, i) => (
              <div key={ch.id} className="flex items-center gap-4 px-4 py-3 border-b border-rpg-border/30 hover:bg-white/3 transition-colors last:border-b-0">
                <span className="text-rpg-dim w-6 text-center shrink-0" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-rpg-text text-sm truncate">{ch.title}</p>
                  <p className="text-rpg-dim text-xs truncate">{ch.topics.join(", ")}</p>
                </div>
                <div className="flex gap-4 shrink-0">
                  <Link href={`/admin/books/${id}/chapters/${ch.id}`}
                    className="text-rpg-dim hover:text-rpg-gold no-underline transition-colors"
                    style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                    EDIT
                  </Link>
                  <button
                    onClick={() => deleteChapter(ch.id)}
                    disabled={deleting === ch.id}
                    className="text-rpg-dim hover:text-rpg-red transition-colors disabled:opacity-40"
                    style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                    {deleting === ch.id ? "..." : "DELETE"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
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
