"use client";

import { useState, useEffect, useRef } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ─── Asset group definitions ──────────────────────────────────────────────────

interface AssetGroup {
  key: string;
  folder: string;
  label: string;
  description: string;
  icon: string;
  color: string;
}

const GROUPS: AssetGroup[] = [
  {
    key: "npc",
    folder: "NPC",
    label: "NPC Characters",
    description:
      "Character portraits and head sprites used in dialogues and UI",
    icon: "◈",
    color: "text-rpg-cyan",
  },
  {
    key: "gem",
    folder: "gem",
    label: "Achievement Gems",
    description: "Gem icons used as achievement badges in the profile page",
    icon: "◆",
    color: "text-rpg-gold",
  },
  {
    key: "scroll",
    folder: "scroll",
    label: "Title Scrolls",
    description: "Scroll icons used for player titles and earned rewards",
    icon: "▤",
    color: "text-rpg-purple",
  },
  {
    key: "book",
    folder: "book",
    label: "Book Covers",
    description: "Cover images for the Library books",
    icon: "▦",
    color: "text-rpg-gold",
  },
  {
    key: "costume",
    folder: "costume",
    label: "Costumes",
    description: "Player character sprites — full-body costume assets",
    icon: "◉",
    color: "text-rpg-green",
  },
  {
    key: "equip",
    folder: "equip",
    label: "Equipment",
    description: "Wearable gear and equipment item sprites",
    icon: "⚔",
    color: "text-rpg-red",
  },
  {
    key: "base-char",
    folder: "base-char",
    label: "Base Characters",
    description:
      "Base character body components used for layered sprite composition",
    icon: "♟",
    color: "text-rpg-dim",
  },
  {
    key: "ui",
    folder: "ui",
    label: "UI Assets",
    description: "Logos and branding assets",
    icon: "▣",
    color: "text-rpg-cyan",
  },
];

const THUMB_SIZE: Record<string, number> = {
  costume: 96,
  npc: 80,
  "base-char": 80,
  equip: 80,
  gem: 48,
  scroll: 48,
  book: 56,
  ui: 64,
};

// ─── Asset card ───────────────────────────────────────────────────────────────

function AssetCard({
  file,
  size,
  onClick,
  onDelete,
}: {
  file: { name: string; path: string };
  size: number;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className="flex flex-col items-center gap-1.5 p-2 border border-rpg-border/40 hover:border-rpg-gold transition-colors bg-rpg-bg w-full"
        title={file.path}
      >
        <div
          className="flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <img
            src={file.path}
            alt={file.name}
            style={{
              maxWidth: size,
              maxHeight: size,
              imageRendering: "pixelated",
              objectFit: "contain",
            }}
          />
        </div>
        <span
          className="text-rpg-dim text-[8px] truncate w-full text-center group-hover:text-rpg-text transition-colors"
          style={{ maxWidth: size + 8 }}
        >
          {file.name.replace(/\.(png|jpg|jpeg|gif|svg|webp)$/i, "")}
        </span>
      </button>

      {/* Delete button — shown on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-1 right-1 w-5 h-5 bg-rpg-red/80 hover:bg-rpg-red text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete file"
      >
        ×
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MediaPage() {
  const [activeGroup, setActiveGroup] = useState(
    () => (typeof window !== "undefined" ? (localStorage.getItem("media_tab") ?? "npc") : "npc"),
  );
  const [files, setFiles] = useState<{ name: string; path: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ name: string; path: string } | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [confirmDel, setConfirmDel] = useState<{
    name: string;
    path: string;
  } | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const group = GROUPS.find((g) => g.key === activeGroup)!;
  const thumbSize = THUMB_SIZE[activeGroup] ?? 64;
  const filtered = search.trim()
    ? files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : files;

  // ── Fetch files from API ───────────────────────────────────────────────────

  async function fetchFiles(folder: string) {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token") ?? "";
      const res = await fetch(
        `${API}/admin/media/files?folder=${encodeURIComponent(folder)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const data = (await res.json()) as { files: { name: string; path: string }[] };
        setFiles(data.files);
        setCounts((prev) => ({ ...prev, [folder]: data.files.length }));
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchAllCounts() {
    const token = localStorage.getItem("access_token") ?? "";
    const results = await Promise.all(
      GROUPS.map(async (g) => {
        const res = await fetch(
          `${API}/admin/media/files?folder=${encodeURIComponent(g.folder)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        ).catch(() => null);
        if (!res?.ok) return [g.folder, 0] as const;
        const data = (await res.json()) as { files: { name: string; path: string }[] };
        return [g.folder, data.files.length] as const;
      }),
    );
    setCounts(Object.fromEntries(results));
  }

  useEffect(() => {
    fetchAllCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchFiles(group.folder);
    setSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroup]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  }

  function handleCopy(path: string) {
    navigator.clipboard.writeText(path).catch(() => {});
    setCopied(path);
    setTimeout(() => setCopied(null), 1500);
  }

  // ── Upload ─────────────────────────────────────────────────────────────────

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setUploading(true);
    try {
      const token = localStorage.getItem("access_token") ?? "";
      const form = new FormData();
      form.append("folder", group.folder);
      form.append("file", file);

      const res = await fetch(`${API}/admin/media/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (res.ok) {
        showToast(`${file.name} uploaded`);
        fetchFiles(group.folder);
      } else {
        const err = (await res
          .json()
          .catch(() => ({ message: "Upload failed" }))) as { message?: string };
        showToast(err.message ?? "Upload failed", false);
      }
    } catch {
      showToast("Upload failed", false);
    } finally {
      setUploading(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  async function handleDelete(file: { name: string; path: string }) {
    try {
      const token = localStorage.getItem("access_token") ?? "";
      const res = await fetch(
        `${API}/admin/media/files?folder=${encodeURIComponent(group.folder)}&name=${encodeURIComponent(file.name)}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.ok) {
        showToast(`${file.name} deleted`);
        setFiles((prev) => prev.filter((f) => f.name !== file.name));
        if (preview?.name === file.name) setPreview(null);
      } else {
        const err = (await res
          .json()
          .catch(() => ({ message: "Delete failed" }))) as { message?: string };
        showToast(err.message ?? "Delete failed", false);
      }
    } catch {
      showToast("Delete failed", false);
    } finally {
      setConfirmDel(null);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  const previewIndex = preview ? filtered.findIndex((f) => f.name === preview.name) : -1;
  const hasPrev = previewIndex > 0;
  const hasNext = previewIndex < filtered.length - 1;

  return (
    <div className="flex h-full">
      {/* ── Group sidebar ────────────────────────────────────────────── */}
      <aside className="w-52 shrink-0 border-r-2 border-rpg-border bg-rpg-panel/50 flex flex-col gap-1 p-2 sticky top-0 h-screen overflow-y-auto">
        {GROUPS.map((g) => (
          <button
            key={g.key}
            onClick={() => {
              setActiveGroup(g.key); localStorage.setItem("media_tab", g.key);
              setSearch("");
            }}
            className={`flex items-center gap-3 px-3 py-2.5 text-left transition-colors w-full ${
              activeGroup === g.key
                ? "bg-rpg-gold/10 border-l-2 border-rpg-gold"
                : "border-l-2 border-transparent hover:bg-white/3"
            }`}
          >
            <span
              className={activeGroup === g.key ? "text-rpg-gold" : g.color}
              style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}
            >
              {g.icon}
            </span>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span
                className={`text-[8px] tracking-wide ${activeGroup === g.key ? "text-rpg-gold" : "text-rpg-dim"}`}
                style={{ fontFamily: "var(--font-pixel)" }}
              >
                {g.label.toUpperCase()}
              </span>
              <span
                className="text-rpg-dim/60 text-[7px]"
                style={{ fontFamily: "var(--font-pixel)" }}
              >
                {counts[g.folder] !== undefined ? `${counts[g.folder]} FILES` : "..."}
              </span>
            </div>
          </button>
        ))}
      </aside>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-6 py-5 border-b-2 border-rpg-border flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span
                className={group.color}
                style={{ fontFamily: "var(--font-pixel)", fontSize: 12 }}
              >
                {group.icon}
              </span>
              <h1 className="text-xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">
                {group.label.toUpperCase()}
              </h1>
            </div>
            <p className="text-xs text-rpg-dim">{group.description}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span
              className="text-rpg-dim"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
            >
              {filtered.length}/{files.length} FILES
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-xs px-3 py-1.5 transition-colors placeholder:text-rpg-dim/50 w-36"
            />
            {/* Upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-[8px] px-4 py-2 border border-rpg-gold text-rpg-gold hover:bg-rpg-gold/10 transition-colors disabled:opacity-50 tracking-widest"
              style={{ fontFamily: "var(--font-pixel)" }}
            >
              {uploading ? "UPLOADING..." : "+ UPLOAD"}
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <span
                className="text-rpg-dim"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}
              >
                LOADING...
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex justify-center py-16">
              <span
                className="text-rpg-dim"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}
              >
                NO FILES FOUND
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filtered.map((file) => (
                <AssetCard
                  key={file.path}
                  file={file}
                  size={thumbSize}
                  onClick={() => setPreview(file)}
                  onDelete={() => setConfirmDel(file)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Preview panel ─────────────────────────────────────────────── */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="pixel-panel w-full max-w-lg flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-rpg-gold"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}
              >
                ASSET PREVIEW
              </span>
              <div className="flex items-center gap-3">
                <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                  {previewIndex + 1} / {filtered.length}
                </span>
                <button
                  onClick={() => setPreview(null)}
                  className="text-rpg-dim hover:text-rpg-text text-xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="pixel-divider" />

            <div className="relative flex justify-center items-center bg-rpg-bg border border-rpg-border p-4" style={{ height: 300 }}>
              {/* Prev */}
              <button
                onClick={() => hasPrev && setPreview(filtered[previewIndex - 1])}
                disabled={!hasPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center border border-rpg-border text-rpg-dim hover:border-rpg-gold hover:text-rpg-gold transition-colors disabled:opacity-20 disabled:cursor-not-allowed bg-rpg-bg"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}
              >
                ‹
              </button>

              <img
                src={preview.path}
                alt={preview.name}
                style={{
                  maxWidth: "calc(100% - 80px)",
                  maxHeight: "100%",
                  width: "auto",
                  height: "100%",
                  imageRendering: "pixelated",
                  objectFit: "contain",
                }}
              />

              {/* Next */}
              <button
                onClick={() => hasNext && setPreview(filtered[previewIndex + 1])}
                disabled={!hasNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center border border-rpg-border text-rpg-dim hover:border-rpg-gold hover:text-rpg-gold transition-colors disabled:opacity-20 disabled:cursor-not-allowed bg-rpg-bg"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}
              >
                ›
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex flex-col gap-0.5">
                <span
                  className="text-rpg-dim"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
                >
                  FILE NAME
                </span>
                <span className="text-rpg-text text-sm font-mono">
                  {preview.name}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span
                  className="text-rpg-dim"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
                >
                  PATH
                </span>
                <span className="text-rpg-dim text-xs font-mono">
                  {preview.path}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleCopy(preview.path)}
                className={`flex-1 text-[8px] px-4 py-2.5 tracking-widest border transition-colors ${
                  copied === preview.path
                    ? "border-rpg-green text-rpg-green"
                    : "border-rpg-gold text-rpg-gold hover:bg-rpg-gold/10"
                }`}
                style={{ fontFamily: "var(--font-pixel)" }}
              >
                {copied === preview.path ? "✓ COPIED!" : "COPY PATH"}
              </button>
              <a
                href={preview.path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-[8px] px-4 py-2.5 tracking-widest border border-rpg-border text-rpg-dim hover:border-rpg-gold hover:text-rpg-gold transition-colors no-underline"
                style={{ fontFamily: "var(--font-pixel)" }}
              >
                OPEN FILE
              </a>
              <button
                onClick={() => {
                  setPreview(null);
                  setConfirmDel(preview);
                }}
                className="text-[8px] px-4 py-2.5 tracking-widest border border-rpg-red/50 text-rpg-red hover:bg-rpg-red/10 transition-colors"
                style={{ fontFamily: "var(--font-pixel)" }}
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete dialog ──────────────────────────────────────── */}
      {confirmDel && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
          onClick={() => setConfirmDel(null)}
        >
          <div
            className="pixel-panel w-full max-w-xs flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="text-rpg-red"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}
            >
              CONFIRM DELETE
            </span>
            <div className="pixel-divider" />
            <p className="text-rpg-text text-xs">
              Delete{" "}
              <span className="text-rpg-gold font-mono">{confirmDel.name}</span>
              ? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(confirmDel)}
                className="flex-1 text-[8px] px-4 py-2.5 tracking-widest border border-rpg-red text-rpg-red hover:bg-rpg-red/10 transition-colors"
                style={{ fontFamily: "var(--font-pixel)" }}
              >
                DELETE
              </button>
              <button
                onClick={() => setConfirmDel(null)}
                className="flex-1 text-[8px] px-4 py-2.5 tracking-widest border border-rpg-border text-rpg-dim hover:border-rpg-gold hover:text-rpg-gold transition-colors"
                style={{ fontFamily: "var(--font-pixel)" }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast notification ─────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 border text-[9px] tracking-widest ${
            toast.ok
              ? "border-rpg-green text-rpg-green bg-rpg-bg"
              : "border-rpg-red text-rpg-red bg-rpg-bg"
          }`}
          style={{ fontFamily: "var(--font-pixel)" }}
        >
          {toast.ok ? "✓" : "✗"} {toast.msg.toUpperCase()}
        </div>
      )}
    </div>
  );
}
