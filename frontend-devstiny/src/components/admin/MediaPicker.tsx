"use client";

import { useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface MediaFile {
  name: string;
  path: string;
}

interface Props {
  folder: string;
  value: string;
  onChange: (path: string) => void;
  label?: string;
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function MediaPicker({ folder, value, onChange, label = "IMAGE" }: Props) {
  const [open, setOpen]       = useState(false);
  const [files, setFiles]     = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]     = useState("");
  const fileRef               = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError("");
    fetch(`${API_URL}/admin/media/files?folder=${encodeURIComponent(folder)}`, {
      headers: authHeaders(),
    })
      .then((r) => r.json())
      .then((d: { files?: MediaFile[] }) => setFiles(d.files ?? []))
      .catch(() => setError("Failed to load media."))
      .finally(() => setLoading(false));
  }, [open, folder]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch(`${API_URL}/admin/media/upload`, {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = (await res.json()) as MediaFile;
      setFiles((prev) => [data, ...prev]);
      onChange(data.path);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function select(path: string) {
    onChange(path);
    setOpen(false);
  }

  const INPUT_CLASS = "w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors";

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
        {label}
      </label>

      <div className="flex gap-2 items-start">
        {/* Preview */}
        {value && (
          <div className="shrink-0 border-2 border-rpg-border bg-rpg-panel flex items-center justify-center"
            style={{ width: 40, height: 40 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="preview"
              style={{ width: 32, height: 32, objectFit: "contain", imageRendering: "pixelated" }} />
          </div>
        )}
        <div className="flex-1 flex flex-col gap-1.5">
          <input className={INPUT_CLASS} value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="URL or pick from media" />
          <button type="button" onClick={() => setOpen(true)}
            className="self-start pixel-btn text-[7px] px-3 py-1.5 tracking-widest hover:text-rpg-gold transition-colors"
            style={{ fontFamily: "var(--font-pixel)" }}>
            BROWSE MEDIA
          </button>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setOpen(false)}>
          <div className="relative bg-rpg-panel border-4 border-rpg-border flex flex-col gap-4 p-6 w-full max-w-2xl max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-rpg-gold tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>
                MEDIA LIBRARY — {folder.toUpperCase()}
              </span>
              <button onClick={() => setOpen(false)}
                className="text-rpg-dim hover:text-rpg-text transition-colors"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}>✕</button>
            </div>

            <div className="w-full h-px bg-rpg-border" />

            {/* Upload */}
            <div className="flex items-center gap-3">
              <label className={`pixel-btn text-[8px] px-4 py-2 tracking-widest cursor-pointer transition-colors ${uploading ? "opacity-40 pointer-events-none" : "hover:text-rpg-gold"}`}
                style={{ fontFamily: "var(--font-pixel)" }}>
                {uploading ? "UPLOADING..." : "+ UPLOAD IMAGE"}
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={handleUpload} disabled={uploading} />
              </label>
              {error && (
                <span className="text-rpg-red text-xs">{error}</span>
              )}
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>LOADING...</span>
                </div>
              ) : files.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>NO FILES YET</span>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-3">
                  {files.map((f) => {
                    const selected = value === f.path;
                    return (
                      <button key={f.path} type="button" onClick={() => select(f.path)}
                        className="flex flex-col items-center gap-1.5 p-2 border-2 transition-colors"
                        style={{
                          borderColor: selected ? "#f0c040" : "transparent",
                          background: selected ? "rgba(240,192,64,0.08)" : "rgba(255,255,255,0.03)",
                        }}
                        title={f.name}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={f.path} alt={f.name}
                          style={{ width: 48, height: 48, objectFit: "contain", imageRendering: "pixelated" }} />
                        <span className="text-rpg-dim line-clamp-1 text-center"
                          style={{ fontFamily: "var(--font-pixel)", fontSize: 6, maxWidth: 72 }}>
                          {f.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
