"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost } from "@/lib/api";

const COLORS = [
  { label: "Red",    color: "text-rpg-red",    border: "border-rpg-red",    hex: "#e05050" },
  { label: "Purple", color: "text-rpg-purple",  border: "border-rpg-purple", hex: "#c060e0" },
  { label: "Gold",   color: "text-rpg-gold",    border: "border-rpg-gold",   hex: "#f0c040" },
  { label: "Cyan",   color: "text-rpg-cyan",    border: "border-rpg-cyan",   hex: "#40d0e0" },
  { label: "Green",  color: "text-rpg-green",   border: "border-rpg-green",  hex: "#40e070" },
];

const BOOK_IMAGES = Array.from({ length: 64 }, (_, i) => `/book/book-${i + 1}.png`);
const LANGS = ["html", "css", "javascript", "text"];

export default function NewBookPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    slug: "", volume: "", title: "", subtitle: "", author: "ELVAR",
    description: "", color: "text-rpg-gold", border: "border-rpg-gold",
    coverImage: "/book/book-1.png", defaultLang: "javascript", status: "available", order: 0,
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  async function handleCreate() {
    setError("");
    if (!form.slug || !form.title || !form.volume) {
      setError("Slug, volume, and title are required.");
      return;
    }
    setSaving(true);
    try {
      await apiPost("/admin/books", form);
      router.push("/admin/books");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create book.");
    }
    setSaving(false);
  }

  const selectedColor = COLORS.find((c) => c.color === form.color);

  return (
    <div className="p-8 flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/books" className="text-rpg-dim hover:text-rpg-gold no-underline transition-colors"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>← BOOKS</Link>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">NEW BOOK</h1>
        <div className="w-24 pixel-divider-gold mt-1" />
      </div>

      <div className="flex flex-col gap-5">
        {/* Identifiers */}
        <div className="grid grid-cols-3 gap-4">
          <Field label="VOLUME (e.g. VOL. I)">
            <input value={form.volume} placeholder="VOL. VII"
              onChange={(e) => setForm({ ...form, volume: e.target.value })}
              className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors" />
          </Field>
          <Field label="SLUG (URL)">
            <input value={form.slug} placeholder="my-book"
              onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
              className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors" />
          </Field>
          <Field label="ORDER">
            <input type="number" value={form.order}
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
              className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors" />
          </Field>
        </div>

        {/* Titles */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="TITLE">
            <input value={form.title} placeholder="The Structure Codex"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors" />
          </Field>
          <Field label="SUBTITLE">
            <input value={form.subtitle} placeholder="HTML — The Blueprint Language"
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors" />
          </Field>
        </div>

        {/* Author + Lang + Status */}
        <div className="grid grid-cols-3 gap-4">
          <Field label="AUTHOR">
            <input value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors" />
          </Field>
          <Field label="DEFAULT LANG">
            <select value={form.defaultLang} onChange={(e) => setForm({ ...form, defaultLang: e.target.value })}
              className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2">
              {LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="STATUS">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2">
              <option value="available">Available</option>
              <option value="coming-soon">Coming Soon</option>
            </select>
          </Field>
        </div>

        {/* Description */}
        <Field label="DESCRIPTION">
          <textarea value={form.description} rows={3}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors resize-y" />
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
          {selectedColor && (
            <span className="text-xs mt-1" style={{ color: selectedColor.hex, fontFamily: "var(--font-pixel)", fontSize: 7 }}>
              {selectedColor.label.toUpperCase()}
            </span>
          )}
        </Field>

        {/* Cover Image + Preview side by side */}
        <div className="flex gap-4 items-start">
          {/* Preview */}
          <div className="flex flex-col gap-2 shrink-0">
            <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>PREVIEW</span>
            <div className={`w-24 h-24 flex items-center justify-center border ${form.border} bg-rpg-bg`}>
              <img src={form.coverImage} alt="preview" style={{ width: 80, height: 80, imageRendering: "pixelated", objectFit: "contain" }} />
            </div>
            <span className={`text-xs font-medium ${form.color}`} style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
              {form.volume || "VOL. ?"}<br />{form.title || "Title"}
            </span>
          </div>

          {/* Image grid */}
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

      <div className="flex gap-4 pt-2">
        <button onClick={handleCreate} disabled={saving}
          className="pixel-btn-gold text-[9px] px-6 py-3 tracking-widest disabled:opacity-40">
          {saving ? "CREATING..." : "▶ CREATE BOOK"}
        </button>
        <Link href="/admin/books" className="pixel-btn text-rpg-dim text-[8px] px-4 py-3 no-underline tracking-widest hover:text-rpg-text">
          CANCEL
        </Link>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>{label}</label>
      {children}
    </div>
  );
}
