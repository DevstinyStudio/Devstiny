"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPatch } from "@/lib/api";

interface ApiAct { id: string; slug: string; title: string; order: number; description: string; isFinalAct: boolean; isLocked: boolean; }
interface FullChapter {
  id: string; slug: string; title: string; realm: string; order: number;
  isLocked: boolean; coverImage: string; description: string;
  openingNarrative: string; worldContext: string; archonIntro: string;
  rewardXp: number; rewardGold: number; rewardBadge: string; rewardTitle: string;
  estimatedHours: number; difficulty: string; skills: string[]; tags: string[];
  npcImage: string; type: string; typeColor: string;
  acts: ApiAct[];
}

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const INPUT = "w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors";
const TYPE_OPTIONS = [
  { value: "STORY",  color: "text-rpg-purple" },
  { value: "WEB",    color: "text-rpg-purple" },
  { value: "HTML",   color: "text-rpg-purple" },
  { value: "CSS",    color: "text-rpg-purple" },
  { value: "JS",     color: "text-rpg-purple" },
  { value: "DOM",    color: "text-rpg-purple" },
  { value: "FINALE", color: "text-rpg-gold"   },
];

export default function EditPathChapterPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [chapter, setChapter] = useState<FullChapter | null>(null);
  const [form,    setForm]    = useState<Partial<FullChapter>>({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [deleting, setDeleting] = useState<ApiAct | null>(null);

  const load = useCallback(async () => {
    apiGet<FullChapter>(`/admin/path/${id}`)
      .then((c) => { setChapter(c); setForm(c); })
      .catch(() => setError("Chapter not found."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    setSaving(true); setError("");
    try {
      await apiPatch(`/admin/path/${id}`, {
        title: form.title, realm: form.realm, order: form.order,
        isLocked: form.isLocked, description: form.description,
        openingNarrative: form.openingNarrative, worldContext: form.worldContext,
        archonIntro: form.archonIntro, rewardXp: form.rewardXp,
        rewardGold: form.rewardGold, rewardBadge: form.rewardBadge,
        rewardTitle: form.rewardTitle, estimatedHours: form.estimatedHours,
        difficulty: form.difficulty, npcImage: form.npcImage,
        type: form.type, typeColor: form.typeColor,
        skills: typeof form.skills === "string"
          ? (form.skills as string).split(",").map((s) => s.trim()).filter(Boolean)
          : form.skills,
        tags: typeof form.tags === "string"
          ? (form.tags as string).split(",").map((s) => s.trim()).filter(Boolean)
          : form.tags,
      });
      router.push("/admin/path");
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Save failed."); }
    setSaving(false);
  }

  async function deleteAct(act: ApiAct) {
    if (!confirm(`Delete act "${act.title}"? This cannot be undone.`)) return;
    setDeleting(act);
    try {
      const token = localStorage.getItem("access_token");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/admin/path-acts/${act.id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      await load();
    } catch { /* ignore */ }
    setDeleting(null);
  }

  if (loading) return (
    <div className="p-8 flex justify-center">
      <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>LOADING...</span>
    </div>
  );

  const regularActs = [...(chapter?.acts ?? [])].filter((a) => !a.isFinalAct).sort((a, b) => a.order - b.order);
  const finalActs   = [...(chapter?.acts ?? [])].filter((a) =>  a.isFinalAct).sort((a, b) => a.order - b.order);

  return (
    <div className="p-8 flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/admin/path" className="text-rpg-dim hover:text-rpg-gold no-underline transition-colors"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>← PATH</Link>
        <span className="text-rpg-border" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>›</span>
        <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>{chapter?.title}</span>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">EDIT CHAPTER</h1>
        <div className="w-24 pixel-divider-gold mt-1" />
      </div>

      {/* Chapter form — single column, grouped by section */}
      <div className="flex flex-col gap-6">

        {/* ── Identity ── */}
        <div className="flex flex-col gap-4 p-4 border-2 border-rpg-border/40">
          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>IDENTITY</span>
          <Field label="TITLE">
            <input value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} className={INPUT} />
          </Field>
          <Field label="REALM">
            <input value={form.realm ?? ""} onChange={(e) => setForm({ ...form, realm: e.target.value })} className={INPUT} />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="ORDER">
              <input type="number" value={form.order ?? 0} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className={INPUT} />
            </Field>
            <Field label="TYPE">
              <select value={form.type ?? "CODE"} onChange={(e) => setForm({ ...form, type: e.target.value, typeColor: TYPE_OPTIONS.find((t) => t.value === e.target.value)?.color ?? "text-rpg-purple" })} className={INPUT}>
                {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.value}</option>)}
              </select>
            </Field>
            <Field label="DIFFICULTY">
              <select value={form.difficulty ?? "beginner"} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className={INPUT}>
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="LOCKED">
              <select value={form.isLocked ? "true" : "false"} onChange={(e) => setForm({ ...form, isLocked: e.target.value === "true" })} className={INPUT}>
                <option value="false">Unlocked</option>
                <option value="true">Locked</option>
              </select>
            </Field>
            <Field label="ESTIMATED HOURS">
              <input type="number" value={form.estimatedHours ?? 0} onChange={(e) => setForm({ ...form, estimatedHours: parseInt(e.target.value) || 0 })} className={INPUT} />
            </Field>
            <Field label="NPC IMAGE">
              <input value={form.npcImage ?? ""} placeholder="/NPC/elvar-head.png" onChange={(e) => setForm({ ...form, npcImage: e.target.value })} className={INPUT} />
            </Field>
          </div>
          <Field label="DESCRIPTION">
            <textarea value={form.description ?? ""} rows={2} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${INPUT} resize-y`} />
          </Field>
        </div>

        {/* ── Narrative ── */}
        <div className="flex flex-col gap-4 p-4 border-2 border-rpg-border/40">
          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>NARRATIVE</span>
          <Field label="OPENING NARRATIVE">
            <textarea value={form.openingNarrative ?? ""} rows={4} onChange={(e) => setForm({ ...form, openingNarrative: e.target.value })} className={`${INPUT} resize-y`} />
          </Field>
          <Field label="WORLD CONTEXT">
            <textarea value={form.worldContext ?? ""} rows={4} onChange={(e) => setForm({ ...form, worldContext: e.target.value })} className={`${INPUT} resize-y`} />
          </Field>
          <Field label="ARCHON INTRO">
            <textarea value={form.archonIntro ?? ""} rows={3} onChange={(e) => setForm({ ...form, archonIntro: e.target.value })} className={`${INPUT} resize-y`} />
          </Field>
        </div>

        {/* ── Rewards ── */}
        <div className="flex flex-col gap-4 p-4 border-2 border-rpg-border/40">
          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>REWARDS</span>
          <div className="grid grid-cols-2 gap-4">
            <Field label="XP"><input type="number" value={form.rewardXp ?? 0} onChange={(e) => setForm({ ...form, rewardXp: parseInt(e.target.value) || 0 })} className={INPUT} /></Field>
            <Field label="GOLD"><input type="number" value={form.rewardGold ?? 0} onChange={(e) => setForm({ ...form, rewardGold: parseInt(e.target.value) || 0 })} className={INPUT} /></Field>
          </div>
          <Field label="BADGE KEY">
            <input value={form.rewardBadge ?? ""} placeholder="badge-prologue-complete" onChange={(e) => setForm({ ...form, rewardBadge: e.target.value })} className={INPUT} />
          </Field>
          <Field label="TITLE (display name)">
            <input value={form.rewardTitle ?? ""} placeholder="Gate Breaker" onChange={(e) => setForm({ ...form, rewardTitle: e.target.value })} className={INPUT} />
          </Field>
        </div>

        {/* ── Meta ── */}
        <div className="flex flex-col gap-4 p-4 border-2 border-rpg-border/40">
          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>META</span>
          <Field label="SKILLS (comma separated)">
            <input value={Array.isArray(form.skills) ? form.skills.join(", ") : form.skills ?? ""}
              onChange={(e) => setForm({ ...form, skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              className={INPUT} />
          </Field>
          <Field label="TAGS (comma separated)">
            <input value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags ?? ""}
              onChange={(e) => setForm({ ...form, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              className={INPUT} />
          </Field>
        </div>

      </div>

      {error && <p className="text-rpg-red text-sm">{error}</p>}
      <div className="flex gap-4">
        <button onClick={handleSave} disabled={saving} className="pixel-btn-gold text-[9px] px-6 py-3 tracking-widest disabled:opacity-40">
          {saving ? "SAVING..." : "▶ SAVE CHANGES"}
        </button>
        <Link href="/admin/path" className="pixel-btn text-rpg-dim text-[8px] px-4 py-3 no-underline tracking-widest hover:text-rpg-text">CANCEL</Link>
      </div>

      {/* ── Acts ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
            ACTS ({chapter?.acts.length ?? 0})
          </span>
          <div className="flex-1 h-px bg-rpg-border" />
          <Link href={`/admin/path/${id}/acts/new`}
            className="pixel-btn-gold text-[8px] px-3 py-2 tracking-widest no-underline">
            + ADD ACT
          </Link>
        </div>

        <div className="pixel-panel p-0 overflow-hidden">
          {(chapter?.acts ?? []).length === 0 ? (
            <p className="text-center py-8 text-rpg-dim text-sm">No acts yet.</p>
          ) : (
            <>
              {regularActs.map((act, i) => (
                <ActRow key={act.id} act={act} index={i} chapterId={id}
                  deleting={deleting?.id === act.id}
                  onDelete={() => deleteAct(act)} />
              ))}
              {finalActs.length > 0 && (
                <>
                  <div className="px-4 py-2 border-t border-rpg-border/30 bg-rpg-panel/50">
                    <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>FINAL ACT</span>
                  </div>
                  {finalActs.map((act, i) => (
                    <ActRow key={act.id} act={act} index={regularActs.length + i} chapterId={id}
                      deleting={deleting?.id === act.id}
                      onDelete={() => deleteAct(act)} />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ActRow({ act, index, chapterId, deleting, onDelete }: {
  act: ApiAct; index: number; chapterId: string; deleting: boolean; onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-rpg-border/30 hover:bg-white/3 transition-colors last:border-b-0">
      <span className="text-rpg-dim w-6 text-center shrink-0" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-rpg-text text-sm truncate">{act.title}</p>
          {act.isFinalAct && <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>FINAL</span>}
          {act.isLocked  && <span className="text-rpg-dim"  style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>LOCKED</span>}
        </div>
        <p className="text-rpg-dim text-xs">{act.slug} · {act.description?.slice(0, 50)}{act.description?.length > 50 ? "…" : ""}</p>
      </div>
      <div className="flex gap-4 shrink-0">
        <Link href={`/admin/path/${chapterId}/acts/${act.id}`}
          className="text-rpg-dim hover:text-rpg-gold no-underline transition-colors"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>EDIT</Link>
        <button onClick={onDelete} disabled={deleting}
          className="text-rpg-dim hover:text-rpg-red transition-colors disabled:opacity-40"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
          {deleting ? "..." : "DELETE"}
        </button>
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
