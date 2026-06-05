"use client";

import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";

// ─── Media Picker ─────────────────────────────────────────────────────────────

const MEDIA_FOLDERS = ["NPC", "gem", "book", "costume"];

function MediaPickerModal({ onSelect, onClose }: { onSelect: (path: string) => void; onClose: () => void }) {
  const [folder,  setFolder]  = useState("NPC");
  const [files,   setFiles]   = useState<{ name: string; path: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setFiles([]);
    setPreview(null);
    apiGet<{ files: { name: string; path: string }[] }>(`/admin/media/files?folder=${folder}`)
      .then((d) => setFiles(d?.files ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [folder]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="bg-rpg-panel border-4 border-rpg-gold w-160 max-h-130 flex flex-col"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-rpg-border">
          <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>
            SELECT MEDIA
          </span>
          <button onClick={onClose} className="text-rpg-dim hover:text-rpg-red text-lg leading-none">×</button>
        </div>

        {/* Folder tabs */}
        <div className="flex gap-1 px-4 pt-3">
          {MEDIA_FOLDERS.map((f) => (
            <button key={f} onClick={() => setFolder(f)}
              className="px-3 py-1 border transition-colors text-[8px] tracking-widest"
              style={{
                fontFamily: "var(--font-pixel)",
                borderColor: folder === f ? "#f0c040" : "#3d2d8c",
                color:       folder === f ? "#f0c040" : "#b4b4df",
                background:  folder === f ? "rgba(240,192,64,0.08)" : "transparent",
              }}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* File grid + preview */}
        <div className="flex flex-1 min-h-0 gap-0 mt-3 mx-4 mb-4">
          {/* File list */}
          <div className="flex-1 overflow-y-auto border-2 border-rpg-border">
            {loading ? (
              <div className="flex items-center justify-center h-full py-8">
                <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>LOADING...</span>
              </div>
            ) : files.length === 0 ? (
              <div className="flex items-center justify-center h-full py-8">
                <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>NO FILES</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-0">
                {files.map((f) => (
                  <button key={f.path}
                    onClick={() => setPreview(f.path)}
                    onDoubleClick={() => { onSelect(f.path); onClose(); }}
                    className="flex flex-col items-center gap-1 p-2 border border-rpg-border/20 hover:bg-white/5 transition-colors group"
                    style={{ background: preview === f.path ? "rgba(240,192,64,0.08)" : undefined }}>
                    <img src={f.path} alt={f.name}
                      style={{ width: 48, height: 48, imageRendering: "pixelated", objectFit: "contain" }} />
                    <span className="text-rpg-dim text-center truncate w-full"
                      style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: preview === f.path ? "#f0c040" : undefined }}>
                      {f.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Preview panel */}
          {preview && (
            <div className="w-40 border-2 border-l-0 border-rpg-gold flex flex-col items-center justify-between p-3 gap-3">
              <img src={preview} alt="preview"
                style={{ width: 96, height: 96, imageRendering: "pixelated", objectFit: "contain" }} />
              <span className="text-rpg-dim text-center break-all leading-4"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}>
                {preview}
              </span>
              <button onClick={() => { onSelect(preview); onClose(); }}
                className="pixel-btn-gold w-full text-[8px] py-2 tracking-widest">
                USE THIS
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Block types ──────────────────────────────────────────────────────────────

export type SectionBlock =
  | { type: "scene";        label: string }
  | { type: "narration";    text: string }
  | { type: "dialogue";     speaker: string; role: string; portrait: string; lines: string[] }
  | { type: "playerDialogue"; lines: string[] }
  | { type: "keypoints";    heading: string; items: { text: string; color: string }[] }
  | { type: "callout";      variant: "tip" | "warning" | "info"; text: string }
  | { type: "code";         filename: string; language: string; code: string }
  | { type: "instruction";  content: string }
  | { type: "divider" }
  | { type: "choice";       prompt: string; options: { text: string; value: string }[] };

const TYPE_LABELS: Record<string, string> = {
  scene: "SCENE", narration: "NARRATION", dialogue: "DIALOGUE",
  playerDialogue: "PLAYER", keypoints: "KEYPOINTS", callout: "CALLOUT",
  code: "CODE", instruction: "TEXT", divider: "DIVIDER", choice: "CHOICE",
};

const TYPE_COLORS: Record<string, string> = {
  scene: "#40d0e0", narration: "#e8e8f0", dialogue: "#f0c040",
  playerDialogue: "#40e070", keypoints: "#c060e0", callout: "#f0c040",
  code: "#40d0e0", instruction: "#e8e8f0", divider: "#7a7ab0", choice: "#e05050",
};

const DEFAULT_BLOCK: Record<string, SectionBlock> = {
  scene:          { type: "scene", label: "OPENING" },
  narration:      { type: "narration", text: "" },
  dialogue:       { type: "dialogue", speaker: "ELVAR", role: "The Elder Dev", portrait: "/NPC/elvar.png", lines: [""] },
  playerDialogue: { type: "playerDialogue", lines: [""] },
  keypoints:      { type: "keypoints", heading: "KEY POINTS", items: [{ text: "", color: "text-rpg-gold" }] },
  callout:        { type: "callout", variant: "info", text: "" },
  code:           { type: "code", filename: "example.html", language: "html", code: "" },
  instruction:    { type: "instruction", content: "" },
  divider:        { type: "divider" },
  choice:         { type: "choice", prompt: "", options: [{ text: "", value: "a" }, { text: "", value: "b" }] },
};

const INPUT  = "w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors";
const INPUT_SM = "bg-rpg-bg border border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-xs px-2 py-1 transition-colors";

// ─── Individual block editors ─────────────────────────────────────────────────

function SceneEditor({ block, onChange }: { block: Extract<SectionBlock, { type: "scene" }>; onChange: (b: SectionBlock) => void }) {
  return (
    <input value={block.label} onChange={(e) => onChange({ ...block, label: e.target.value })}
      placeholder="Scene label e.g. OPENING" className={INPUT} />
  );
}

function NarrationEditor({ block, onChange }: { block: Extract<SectionBlock, { type: "narration" }>; onChange: (b: SectionBlock) => void }) {
  return (
    <textarea value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })}
      placeholder="Narration text..." className={`${INPUT} resize-y leading-6`} style={{ minHeight: 120 }} />
  );
}

function InstructionEditor({ block, onChange }: { block: Extract<SectionBlock, { type: "instruction" }>; onChange: (b: SectionBlock) => void }) {
  return (
    <textarea value={block.content} onChange={(e) => onChange({ ...block, content: e.target.value })}
      placeholder="Teaching content... Supports **bold**, *italic*, `code`, bullet lists" className={`${INPUT} resize-y leading-6`} style={{ minHeight: 120 }} />
  );
}

function DialogueEditor({ block, onChange }: { block: Extract<SectionBlock, { type: "dialogue" }>; onChange: (b: SectionBlock) => void }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <>
      {pickerOpen && (
        <MediaPickerModal
          onSelect={(path) => onChange({ ...block, portrait: path })}
          onClose={() => setPickerOpen(false)}
        />
      )}
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}>SPEAKER</span>
            <input value={block.speaker} onChange={(e) => onChange({ ...block, speaker: e.target.value })} placeholder="ELVAR" className={INPUT_SM} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}>ROLE</span>
            <input value={block.role} onChange={(e) => onChange({ ...block, role: e.target.value })} placeholder="The Elder Dev" className={INPUT_SM} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}>PORTRAIT</span>
            <div className="flex gap-1 items-center">
              <input value={block.portrait} onChange={(e) => onChange({ ...block, portrait: e.target.value })}
                placeholder="/NPC/elvar.png" className={`${INPUT_SM} flex-1 min-w-0`} />
              {block.portrait && (
                <img src={block.portrait} alt="preview"
                  style={{ width: 28, height: 28, imageRendering: "pixelated", objectFit: "contain", flexShrink: 0 }} />
              )}
              <button onClick={() => setPickerOpen(true)} title="Browse media"
                className="shrink-0 px-2 py-1 border border-rpg-border hover:border-rpg-gold text-rpg-dim hover:text-rpg-gold transition-colors"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                ▤
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}>LINES (one per line)</span>
          <textarea
            value={block.lines.join("\n")}
            onChange={(e) => onChange({ ...block, lines: e.target.value.split("\n") })}
            placeholder="Line 1&#10;Line 2&#10;Line 3"
            className={`${INPUT} resize-y leading-6`} style={{ minHeight: 100 }} />
        </div>
      </div>
    </>
  );
}

function PlayerDialogueEditor({ block, onChange }: { block: Extract<SectionBlock, { type: "playerDialogue" }>; onChange: (b: SectionBlock) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}>PLAYER LINES (one per line)</span>
      <textarea
        value={block.lines.join("\n")}
        onChange={(e) => onChange({ ...block, lines: e.target.value.split("\n") })}
        placeholder="What the player says..." className={`${INPUT} resize-y leading-6`} style={{ minHeight: 80 }} />
    </div>
  );
}

function KeypointsEditor({ block, onChange }: { block: Extract<SectionBlock, { type: "keypoints" }>; onChange: (b: SectionBlock) => void }) {
  const COLOR_OPTIONS = ["text-rpg-gold", "text-rpg-cyan", "text-rpg-green", "text-rpg-red", "text-rpg-purple", "text-rpg-dim"];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}>HEADING</span>
        <input value={block.heading} onChange={(e) => onChange({ ...block, heading: e.target.value })} className={INPUT} />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}>ITEMS</span>
        {block.items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input value={item.text} onChange={(e) => { const items = [...block.items]; items[i] = { ...item, text: e.target.value }; onChange({ ...block, items }); }}
              placeholder={`Item ${i + 1}`} className={`${INPUT_SM} flex-1`} />
            <select value={item.color} onChange={(e) => { const items = [...block.items]; items[i] = { ...item, color: e.target.value }; onChange({ ...block, items }); }}
              className={`${INPUT_SM} w-36`}>
              {COLOR_OPTIONS.map((c) => <option key={c} value={c}>{c.replace("text-rpg-", "")}</option>)}
            </select>
            <button onClick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })}
              className="text-rpg-dim hover:text-rpg-red text-lg leading-none px-1">×</button>
          </div>
        ))}
        <button onClick={() => onChange({ ...block, items: [...block.items, { text: "", color: "text-rpg-gold" }] })}
          className="text-rpg-dim hover:text-rpg-text text-xs self-start px-2 py-1 border border-rpg-border/50"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>+ ITEM</button>
      </div>
    </div>
  );
}

function CalloutEditor({ block, onChange }: { block: Extract<SectionBlock, { type: "callout" }>; onChange: (b: SectionBlock) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <select value={block.variant} onChange={(e) => onChange({ ...block, variant: e.target.value as "tip" | "warning" | "info" })}
          className={`${INPUT_SM} w-32`}>
          <option value="info">INFO</option>
          <option value="tip">TIP</option>
          <option value="warning">WARNING</option>
        </select>
      </div>
      <textarea value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })}
        placeholder="Callout content..." className={`${INPUT} resize-y leading-6`} style={{ minHeight: 80 }} />
    </div>
  );
}

function CodeEditor({ block, onChange }: { block: Extract<SectionBlock, { type: "code" }>; onChange: (b: SectionBlock) => void }) {
  const LANGS = ["html", "css", "javascript", "typescript", "json", "bash", "text"];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input value={block.filename} onChange={(e) => onChange({ ...block, filename: e.target.value })}
          placeholder="example.html" className={`${INPUT_SM} flex-1`} />
        <select value={block.language} onChange={(e) => onChange({ ...block, language: e.target.value })}
          className={`${INPUT_SM} w-36`}>
          {LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <textarea value={block.code} onChange={(e) => onChange({ ...block, code: e.target.value })}
        spellCheck={false} placeholder="Code here..."
        className={`${INPUT} font-mono resize-y leading-6 text-rpg-cyan`} style={{ minHeight: 140 }} />
    </div>
  );
}

function ChoiceEditor({ block, onChange }: { block: Extract<SectionBlock, { type: "choice" }>; onChange: (b: SectionBlock) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}>PROMPT</span>
        <textarea value={block.prompt} onChange={(e) => onChange({ ...block, prompt: e.target.value })}
          placeholder="What do you do?" className={`${INPUT} resize-y`} style={{ minHeight: 60 }} />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}>OPTIONS</span>
        {block.options.map((opt, i) => (
          <div key={i} className="flex gap-2">
            <input value={opt.value} onChange={(e) => { const opts = [...block.options]; opts[i] = { ...opt, value: e.target.value }; onChange({ ...block, options: opts }); }}
              placeholder="value" className={`${INPUT_SM} w-20`} />
            <input value={opt.text} onChange={(e) => { const opts = [...block.options]; opts[i] = { ...opt, text: e.target.value }; onChange({ ...block, options: opts }); }}
              placeholder="Option text" className={`${INPUT_SM} flex-1`} />
            <button onClick={() => onChange({ ...block, options: block.options.filter((_, j) => j !== i) })}
              className="text-rpg-dim hover:text-rpg-red text-lg leading-none px-1">×</button>
          </div>
        ))}
        <button onClick={() => onChange({ ...block, options: [...block.options, { text: "", value: String.fromCharCode(97 + block.options.length) }] })}
          className="text-rpg-dim hover:text-rpg-text text-xs self-start px-2 py-1 border border-rpg-border/50"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>+ OPTION</button>
      </div>
    </div>
  );
}

// ─── Block wrapper ────────────────────────────────────────────────────────────

function BlockWrapper({ block, index, total, onChange, onDelete, onMoveUp, onMoveDown }: {
  block: SectionBlock; index: number; total: number;
  onChange: (b: SectionBlock) => void;
  onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void;
}) {
  const label = TYPE_LABELS[block.type] ?? block.type.toUpperCase();
  const color = TYPE_COLORS[block.type] ?? "#e8e8f0";

  function renderEditor() {
    switch (block.type) {
      case "scene":          return <SceneEditor block={block} onChange={onChange} />;
      case "narration":      return <NarrationEditor block={block} onChange={onChange} />;
      case "instruction":    return <InstructionEditor block={block} onChange={onChange} />;
      case "dialogue":       return <DialogueEditor block={block} onChange={onChange} />;
      case "playerDialogue": return <PlayerDialogueEditor block={block} onChange={onChange} />;
      case "keypoints":      return <KeypointsEditor block={block} onChange={onChange} />;
      case "callout":        return <CalloutEditor block={block} onChange={onChange} />;
      case "code":           return <CodeEditor block={block} onChange={onChange} />;
      case "choice":         return <ChoiceEditor block={block} onChange={onChange} />;
      case "divider":        return <div className="h-px bg-rpg-border/40 my-1" />;
      default:               return <p className="text-rpg-dim text-xs">Unsupported block type: {(block as { type: string }).type}</p>;
    }
  }

  return (
    <div className="flex flex-col gap-2 border-2 p-4 transition-colors"
      style={{ borderColor: `${color}30` }}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="px-2 py-0.5 text-[7px] tracking-widest border"
          style={{ fontFamily: "var(--font-pixel)", color, borderColor: color }}>
          {label}
        </span>
        <span className="text-rpg-dim/50 text-xs flex-1" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
          BLOCK {index + 1}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={onMoveUp} disabled={index === 0}
            className="w-7 h-7 flex items-center justify-center text-rpg-dim hover:text-rpg-gold disabled:opacity-30 border border-rpg-border/50 hover:border-rpg-gold transition-colors">↑</button>
          <button onClick={onMoveDown} disabled={index === total - 1}
            className="w-7 h-7 flex items-center justify-center text-rpg-dim hover:text-rpg-gold disabled:opacity-30 border border-rpg-border/50 hover:border-rpg-gold transition-colors">↓</button>
          <button onClick={onDelete}
            className="w-7 h-7 flex items-center justify-center text-rpg-dim hover:text-rpg-red border border-rpg-border/50 hover:border-rpg-red transition-colors">×</button>
        </div>
      </div>
      {renderEditor()}
    </div>
  );
}

// ─── Add block button ─────────────────────────────────────────────────────────

function AddBlockMenu({ onAdd }: { onAdd: (type: string) => void }) {
  const [open, setOpen] = useState(false);
  const types = Object.keys(DEFAULT_BLOCK);

  return (
    <div className="relative self-start">
      <button onClick={() => setOpen(!open)}
        className="pixel-btn text-rpg-dim text-[8px] px-4 py-2 tracking-widest hover:text-rpg-text">
        + ADD BLOCK ▾
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 bg-rpg-panel border-2 border-rpg-border flex flex-col min-w-40">
          {types.map((t) => (
            <button key={t} onClick={() => { onAdd(t); setOpen(false); }}
              className="text-left px-4 py-2 hover:bg-white/5 transition-colors flex items-center gap-2">
              <span style={{ color: TYPE_COLORS[t], fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                {TYPE_LABELS[t]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function blocksFromJson(sections: unknown[]): SectionBlock[] {
  if (!Array.isArray(sections)) return [];
  return sections as SectionBlock[];
}

export function blocksToJson(blocks: SectionBlock[]): unknown[] {
  return blocks;
}

export default function ActSectionEditor({
  blocks,
  onChange,
}: {
  blocks: SectionBlock[];
  onChange: (blocks: SectionBlock[]) => void;
}) {
  function updateBlock(i: number, b: SectionBlock) {
    onChange(blocks.map((x, idx) => idx === i ? b : x));
  }

  function deleteBlock(i: number) {
    onChange(blocks.filter((_, idx) => idx !== i));
  }

  function moveBlock(i: number, dir: -1 | 1) {
    const next = [...blocks];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  function addBlock(type: string) {
    const def = DEFAULT_BLOCK[type];
    if (def) onChange([...blocks, { ...def }]);
  }

  return (
    <div className="flex flex-col gap-3">
      {blocks.length === 0 && (
        <p className="text-rpg-dim text-sm text-center py-6 border-2 border-dashed border-rpg-border/30">
          No sections yet — add a block below.
        </p>
      )}

      {blocks.map((block, i) => (
        <BlockWrapper
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

      <AddBlockMenu onAdd={addBlock} />
    </div>
  );
}
