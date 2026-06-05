"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch } from "@/lib/api";

interface Category {
  id: string;
  slug: string;
  title: string;
  description: string;
  gem: string;
  color: string;
  order: number;
}

const COLORS = [
  { value: "text-rpg-gold",   label: "Gold"   },
  { value: "text-rpg-cyan",   label: "Cyan"   },
  { value: "text-rpg-green",  label: "Green"  },
  { value: "text-rpg-purple", label: "Purple" },
  { value: "text-rpg-red",    label: "Red"    },
];

const COLOR_HEX: Record<string, string> = {
  "text-rpg-gold":   "#f0c040",
  "text-rpg-cyan":   "#40d0e0",
  "text-rpg-green":  "#40e070",
  "text-rpg-purple": "#c060e0",
  "text-rpg-red":    "#e05050",
};

const BLANK: Omit<Category, "id"> = {
  slug: "", title: "", description: "", gem: "/gem/gem-6.png", color: "text-rpg-gold", order: 0,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");

  // Modal state
  const [modal,     setModal]     = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [form,      setForm]      = useState<Omit<Category, "id">>(BLANK);

  useEffect(() => {
    apiGet<Category[]>("/admin/categories")
      .then((d) => setCategories(d ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setForm({ ...BLANK, order: categories.length + 1 });
    setEditTarget(null);
    setError("");
    setModal("create");
  }

  function openEdit(cat: Category) {
    setForm({ slug: cat.slug, title: cat.title, description: cat.description, gem: cat.gem, color: cat.color, order: cat.order });
    setEditTarget(cat);
    setError("");
    setModal("edit");
  }

  async function handleSave() {
    if (!form.slug || !form.title) { setError("Slug and title are required."); return; }
    setSaving(true); setError("");
    try {
      if (modal === "create") {
        const created = await apiPost<Category>("/admin/categories", form);
        setCategories((prev) => [...prev, created].sort((a, b) => a.order - b.order));
      } else if (editTarget) {
        const updated = await apiPatch<Category>(`/admin/categories/${editTarget.id}`, form);
        setCategories((prev) => prev.map((c) => c.id === updated.id ? updated : c).sort((a, b) => a.order - b.order));
      }
      setModal(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    }
    setSaving(false);
  }

  async function moveOrder(cat: Category, dir: -1 | 1) {
    const newOrder = cat.order + dir;
    if (newOrder < 1) return;
    try {
      const updated = await apiPatch<Category>(`/admin/categories/${cat.id}`, { order: newOrder });
      setCategories((prev) =>
        prev.map((c) => {
          if (c.id === updated.id) return updated;
          if (c.order === newOrder) return { ...c, order: cat.order };
          return c;
        }).sort((a, b) => a.order - b.order)
      );
    } catch { /* ignore */ }
  }

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
            ADMIN PANEL
          </p>
          <h1 className="text-2xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">
            CATEGORIES
          </h1>
          <div className="w-24 pixel-divider-gold mt-1" />
        </div>
        <button onClick={openCreate}
          className="pixel-btn-gold text-[9px] px-4 py-2.5 tracking-widest">
          + NEW CATEGORY
        </button>
      </div>

      {/* Categories list */}
      <div className="pixel-panel p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>LOADING...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex justify-center py-12 text-rpg-dim text-sm">No categories yet.</div>
        ) : (
          categories.map((cat, i) => (
            <div key={cat.id} className="flex items-center gap-4 px-5 py-4 border-b border-rpg-border/30 hover:bg-white/3 transition-colors last:border-b-0">
              {/* Order controls */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button onClick={() => moveOrder(cat, -1)} disabled={i === 0}
                  className="text-rpg-dim hover:text-rpg-gold disabled:opacity-20 transition-colors leading-none"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>▲</button>
                <span className="text-rpg-border text-center" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                  {cat.order}
                </span>
                <button onClick={() => moveOrder(cat, 1)} disabled={i === categories.length - 1}
                  className="text-rpg-dim hover:text-rpg-gold disabled:opacity-20 transition-colors leading-none"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>▼</button>
              </div>

              {/* Gem */}
              <img src={cat.gem} alt={cat.title}
                style={{ width: 36, height: 36, imageRendering: "pixelated", objectFit: "contain", flexShrink: 0 }} />

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${cat.color}`}>{cat.title}</span>
                  <span className="text-rpg-dim text-xs">/{cat.slug}</span>
                </div>
                <p className="text-xs text-rpg-dim leading-5 truncate">{cat.description}</p>
              </div>

              {/* Color swatch */}
              <div className="w-4 h-4 rounded-full shrink-0 border border-rpg-border"
                style={{ background: COLOR_HEX[cat.color] ?? "#b4b4df" }} />

              {/* Edit */}
              <button onClick={() => openEdit(cat)}
                className="pixel-btn text-rpg-dim text-[8px] px-3 py-1.5 tracking-widest hover:text-rpg-text shrink-0">
                EDIT
              </button>
            </div>
          ))
        )}
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="pixel-panel w-full max-w-lg flex flex-col gap-5">
            {/* Modal header */}
            <div className="flex items-center justify-between">
              <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}>
                {modal === "create" ? "NEW CATEGORY" : "EDIT CATEGORY"}
              </span>
              <button onClick={() => setModal(null)} className="text-rpg-dim hover:text-rpg-text transition-colors text-xl">×</button>
            </div>

            <div className="pixel-divider" />

            {/* Fields */}
            <div className="flex flex-col gap-4">
              {/* Slug */}
              <div className="flex flex-col gap-1.5">
                <label className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>SLUG</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  placeholder="e.g. general-chat"
                  disabled={modal === "edit"}
                  className="bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors disabled:opacity-50" />
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>TITLE</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. General Chat"
                  className="bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors" />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>DESCRIPTION</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2} placeholder="Short description of this category..."
                  className="bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors resize-none" />
              </div>

              {/* Gem + Color + Order */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>GEM IMAGE</label>
                  <input value={form.gem} onChange={(e) => setForm({ ...form, gem: e.target.value })}
                    placeholder="/gem/gem-6.png"
                    className="bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-xs px-3 py-2 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>COLOR</label>
                  <select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-sm px-3 py-2 transition-colors"
                    style={{ color: COLOR_HEX[form.color] ?? "#b4b4df" }}>
                    {COLORS.map((c) => (
                      <option key={c.value} value={c.value} style={{ color: COLOR_HEX[c.value] }}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>ORDER</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                    min={1}
                    className="bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors" />
                </div>
              </div>
            </div>

            {error && <p className="text-rpg-red text-xs">{error}</p>}

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setModal(null)}
                className="pixel-btn text-rpg-dim text-[8px] px-4 py-2.5 tracking-widest hover:text-rpg-text">
                CANCEL
              </button>
              <button onClick={handleSave} disabled={saving}
                className="pixel-btn-gold text-[9px] px-5 py-2.5 tracking-widest disabled:opacity-40">
                {saving ? "SAVING..." : "SAVE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
