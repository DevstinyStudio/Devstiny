"use client";

import { useState, useEffect, useRef } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Settings {
  site_title:       string;
  site_subtitle:    string;
  site_description: string;
  site_logo:        string;
  site_favicon:     string;
}

const FIELDS: { key: keyof Settings; label: string; hint: string; type?: "textarea" }[] = [
  { key: "site_title",       label: "SITE TITLE",       hint: "Main title shown in the browser tab and header" },
  { key: "site_subtitle",    label: "SITE SUBTITLE",    hint: "Short tagline shown below the title" },
  { key: "site_description", label: "SITE DESCRIPTION", hint: "Meta description for SEO", type: "textarea" },
  { key: "site_logo",        label: "LOGO PATH",        hint: "Path to logo image, e.g. /ui/logo5.png" },
  { key: "site_favicon",     label: "FAVICON PATH",     hint: "Path to favicon, e.g. /favicon.ico" },
];

// ─── Media picker ─────────────────────────────────────────────────────────────

interface MediaGroup {
  key: string;
  folder: string;
  label: string;
  icon: string;
}

const MEDIA_GROUPS: MediaGroup[] = [
  { key: "ui",        folder: "ui",        label: "UI Assets",        icon: "▣" },
  { key: "npc",       folder: "NPC",       label: "NPC Characters",   icon: "◈" },
  { key: "gem",       folder: "gem",       label: "Achievement Gems", icon: "◆" },
  { key: "scroll",    folder: "scroll",    label: "Title Scrolls",    icon: "▤" },
  { key: "book",      folder: "book",      label: "Book Covers",      icon: "▦" },
  { key: "costume",   folder: "costume",   label: "Costumes",         icon: "◉" },
  { key: "equip",     folder: "equip",     label: "Equipment",        icon: "⚔" },
  { key: "base-char", folder: "base-char", label: "Base Characters",  icon: "♟" },
];

interface MediaPickerProps {
  onSelect: (path: string) => void;
  onClose:  () => void;
}

function MediaPicker({ onSelect, onClose }: MediaPickerProps) {
  const [tab,   setTab]   = useState("ui");
  const [files, setFiles] = useState<{ name: string; path: string }[]>([]);
  const [busy,  setBusy]  = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  const group = MEDIA_GROUPS.find((g) => g.key === tab)!;

  useEffect(() => {
    setBusy(true);
    const token = localStorage.getItem("access_token") ?? "";
    fetch(`${API}/admin/media/files?folder=${group.folder}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: { files: { name: string; path: string }[] }) => setFiles(data.files ?? []))
      .catch(() => setFiles([]))
      .finally(() => setBusy(false));
  }, [tab, group.folder]);

  function handleSelect(path: string) {
    onSelect(path);
    onClose();
  }

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div
        className="bg-rpg-panel border-4 border-rpg-border flex flex-col"
        style={{ width: 720, maxHeight: "80vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b-4 border-rpg-border">
          <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}>
            PICK FROM MEDIA
          </span>
          <button
            onClick={onClose}
            className="text-rpg-dim hover:text-rpg-text transition-colors"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 12 }}
          >
            ✕
          </button>
        </div>

        {/* Folder tabs */}
        <div className="flex gap-1 px-4 pt-3 flex-wrap border-b border-rpg-border pb-3">
          {MEDIA_GROUPS.map((g) => (
            <button
              key={g.key}
              onClick={() => setTab(g.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 transition-colors"
              style={{
                fontFamily:   "var(--font-pixel)",
                fontSize:     8,
                background:   tab === g.key ? "rgba(240,192,64,0.12)" : "transparent",
                borderBottom: tab === g.key ? "2px solid #f0c040" : "2px solid transparent",
                color:        tab === g.key ? "#f0c040" : "#b4b4df",
              }}
            >
              <span style={{ fontSize: 10 }}>{g.icon}</span>
              {g.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="overflow-y-auto flex-1 p-4">
          {busy ? (
            <div className="flex items-center justify-center h-40">
              <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>
                LOADING...
              </span>
            </div>
          ) : files.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>
                NO FILES
              </span>
            </div>
          ) : (
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))" }}>
              {files.map((f) => (
                <button
                  key={f.name}
                  onClick={() => handleSelect(f.path)}
                  className="group flex flex-col items-center gap-1.5 p-2 border border-rpg-border hover:border-rpg-gold transition-colors bg-rpg-bg"
                  title={f.name}
                >
                  <div className="flex items-center justify-center" style={{ width: 64, height: 64 }}>
                    <img
                      src={f.path}
                      alt={f.name}
                      style={{ maxWidth: 64, maxHeight: 64, imageRendering: "pixelated", objectFit: "contain" }}
                    />
                  </div>
                  <span
                    className="text-rpg-dim group-hover:text-rpg-gold transition-colors text-center leading-tight"
                    style={{ fontFamily: "var(--font-pixel)", fontSize: 6, wordBreak: "break-all" }}
                  >
                    {f.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [form,    setForm]    = useState<Settings | null>(null);
  const [saved,   setSaved]   = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState<{ msg: string; ok: boolean } | null>(null);
  const [picker,  setPicker]  = useState<keyof Settings | null>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  }

  useEffect(() => {
    const token = localStorage.getItem("access_token") ?? "";
    fetch(`${API}/admin/settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data: Settings) => { setForm(data); setSaved(data); })
      .catch(() => showToast("Failed to load settings", false))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("access_token") ?? "";
      const res   = await fetch(`${API}/admin/settings`, {
        method:  "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json() as Settings;
        setForm(data); setSaved(data);
        showToast("Settings saved");
      } else {
        showToast("Failed to save settings", false);
      }
    } catch {
      showToast("Failed to save settings", false);
    } finally {
      setSaving(false);
    }
  }

  const isDirty = JSON.stringify(form) !== JSON.stringify(saved);

  if (loading || !form) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>LOADING...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl text-rpg-gold text-glow-gold tracking-widest"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 14 }}>
            SITE SETTINGS
          </h1>
          <p className="text-xs text-rpg-dim">Configure website title, description, and branding.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="text-[8px] px-5 py-2.5 tracking-widest border transition-colors disabled:opacity-40"
          style={{
            fontFamily: "var(--font-pixel)",
            borderColor: isDirty ? "#f0c040" : "#3d3d6a",
            color:       isDirty ? "#f0c040" : "#3d3d6a",
            background:  isDirty ? "rgba(240,192,64,0.08)" : "transparent",
          }}
        >
          {saving ? "SAVING..." : "SAVE CHANGES"}
        </button>
      </div>

      <div className="pixel-divider mb-8" />

      {/* Fields */}
      <div className="flex flex-col gap-6">
        {FIELDS.map(({ key, label, hint, type }) => (
          <div key={key} className="flex flex-col gap-2">
            <div className="flex flex-col gap-0.5">
              <label className="text-rpg-gold text-[8px] tracking-widest"
                style={{ fontFamily: "var(--font-pixel)" }}>
                {label}
              </label>
              <span className="text-rpg-dim text-[9px]">{hint}</span>
            </div>

            {key === "site_logo" || key === "site_favicon" ? (
              <div className="flex gap-3 items-center">
                <input
                  value={form[key]}
                  onChange={(e) => setForm((p) => p ? { ...p, [key]: e.target.value } : p)}
                  className="flex-1 bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-xs px-3 py-2 transition-colors font-mono"
                />
                {/* Browse media button */}
                <button
                  onClick={() => setPicker(key)}
                  className="flex items-center gap-1.5 px-3 py-2 border-2 border-rpg-border hover:border-rpg-gold text-rpg-dim hover:text-rpg-gold transition-colors shrink-0"
                  title="Pick from media"
                >
                  <span style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>▣</span>
                  <span style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>BROWSE</span>
                </button>
                {/* Preview */}
                {form[key] && (
                  <div className="w-10 h-10 border border-rpg-border flex items-center justify-center bg-rpg-bg shrink-0">
                    <img
                      src={form[key]}
                      alt={label}
                      style={{ maxWidth: 32, maxHeight: 32, imageRendering: "pixelated", objectFit: "contain" }}
                    />
                  </div>
                )}
              </div>
            ) : type === "textarea" ? (
              <textarea
                rows={3}
                value={form[key]}
                onChange={(e) => setForm((p) => p ? { ...p, [key]: e.target.value } : p)}
                className="bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-xs px-3 py-2 transition-colors resize-y"
              />
            ) : (
              <input
                value={form[key]}
                onChange={(e) => setForm((p) => p ? { ...p, [key]: e.target.value } : p)}
                className="bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-xs px-3 py-2 transition-colors"
              />
            )}
          </div>
        ))}
      </div>

      {/* Preview card */}
      <div className="mt-10">
        <div className="pixel-divider mb-6" />
        <span className="text-rpg-dim text-[8px] tracking-widest" style={{ fontFamily: "var(--font-pixel)" }}>
          PREVIEW
        </span>
        <div className="mt-3 p-5 border-2 border-rpg-border bg-rpg-panel flex items-center gap-4">
          {form.site_logo && (
            <img src={form.site_logo} alt="logo"
              style={{ width: 40, height: 40, imageRendering: "pixelated", objectFit: "contain" }} />
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}>
              {form.site_title || "—"}
            </span>
            <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
              {form.site_subtitle || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 border text-[9px] tracking-widest ${
          toast.ok ? "border-rpg-green text-rpg-green bg-rpg-bg" : "border-rpg-red text-rpg-red bg-rpg-bg"
        }`} style={{ fontFamily: "var(--font-pixel)" }}>
          {toast.ok ? "✓" : "✗"} {toast.msg.toUpperCase()}
        </div>
      )}

      {/* Media picker modal */}
      {picker && (
        <MediaPicker
          onSelect={(path) => setForm((p) => p ? { ...p, [picker]: path } : p)}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
}
