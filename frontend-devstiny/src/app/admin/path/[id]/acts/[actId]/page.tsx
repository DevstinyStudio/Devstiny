"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPatch } from "@/lib/api";
import ActSectionEditor, { type SectionBlock, blocksFromJson, blocksToJson } from "@/components/admin/ActSectionEditor";
import QuizEditor, { type QuizData, quizFromJson, quizToJson } from "@/components/admin/QuizEditor";

interface ChapterInfo { id: string; title: string; slug: string; }
interface ActData {
  id: string; slug: string; title: string; order: number;
  description: string; isFinalAct: boolean; isLocked: boolean;
  content: Record<string, unknown> | null;
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

export default function EditActPage() {
  const { id: chapterId, actId } = useParams<{ id: string; actId: string }>();
  const router = useRouter();

  const [chapter,  setChapter]  = useState<ChapterInfo | null>(null);
  const [act,      setAct]      = useState<ActData | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const [saved,    setSaved]    = useState(false);

  // Meta fields
  const [title,       setTitle]       = useState("");
  const [slug,        setSlug]        = useState("");
  const [order,       setOrder]       = useState(1);
  const [description, setDesc]        = useState("");
  const [isFinalAct,  setIsFinalAct]  = useState(false);
  const [isLocked,    setIsLocked]    = useState(false);

  // Content metadata fields
  const [summary,      setSummary]     = useState("");
  const [duration,     setDuration]    = useState("");
  const [xpReward,     setXpReward]    = useState(0);
  const [goldReward,   setGoldReward]  = useState(0);
  const [module,       setModule]      = useState("");
  const [lessonNumber, setLessonNum]   = useState(1);
  const [totalLessons, setTotalLessons] = useState(5);
  const [contentType,  setContentType] = useState("STORY");
  const [typeColor,    setTypeColor]   = useState("text-rpg-purple");

  // Sections blocks
  const [blocks, setBlocks] = useState<SectionBlock[]>([]);

  // Quiz
  const [quiz, setQuiz] = useState<QuizData>({ xpReward: 100, goldReward: 50, passingScore: 0.7, questions: [] });

  const load = useCallback(async () => {
    try {
      const [ch, detail] = await Promise.all([
        apiGet<ChapterInfo>(`/admin/path/${chapterId}`),
        apiGet<ChapterInfo & { acts: ActData[] }>(`/admin/path/${chapterId}`),
      ]);
      setChapter(ch);
      const found = detail.acts?.find((a) => a.id === actId);
      if (!found) { setError("Act not found."); return; }
      setAct(found);

      // Basic fields
      setTitle(found.title);
      setSlug(found.slug);
      setOrder(found.order);
      setDesc(found.description ?? "");
      setIsFinalAct(found.isFinalAct);
      setIsLocked(found.isLocked);

      // Parse content
      const c = found.content ?? {};
      setSummary((c.summary as string) ?? "");
      setDuration((c.duration as string) ?? "");
      setXpReward((c.xpReward as number) ?? 0);
      setGoldReward((c.goldReward as number) ?? 0);
      setModule((c.module as string) ?? "");
      setLessonNum((c.lessonNumber as number) ?? 1);
      setTotalLessons((c.totalLessons as number) ?? 5);
      setContentType((c.type as string) ?? "STORY");
      setTypeColor((c.typeColor as string) ?? "text-rpg-purple");
      setBlocks(blocksFromJson((c.sections as unknown[]) ?? []));
      setQuiz(quizFromJson(c.quiz));
    } catch {
      setError("Failed to load act.");
    } finally {
      setLoading(false);
    }
  }, [chapterId, actId]);

  useEffect(() => { load(); }, [load]);

  function buildContent() {
    return {
      id:           act?.content?.id ?? `act-${actId.slice(0, 8)}`,
      slug,
      title,
      lessonNumber,
      totalLessons,
      module,
      type:         contentType,
      typeColor,
      duration,
      xpReward,
      goldReward,
      summary,
      sections:     blocksToJson(blocks),
      quiz:         quizToJson(quiz),
    };
  }

  async function doSave() {
    setError(""); setSaved(false); setSaving(true);
    try {
      await apiPatch(`/admin/path-acts/${actId}`, {
        title, slug, order, description, isFinalAct, isLocked,
        content: buildContent(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    }
    setSaving(false);
  }

  async function handleSaveAndBack() {
    await doSave();
    router.push(`/admin/path/${chapterId}`);
  }

  if (loading) return (
    <div className="p-8 flex justify-center">
      <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>LOADING...</span>
    </div>
  );

  return (
    <div className="p-8 flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/admin/path" className="text-rpg-dim hover:text-rpg-gold no-underline transition-colors"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>← PATH</Link>
        <span className="text-rpg-border" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>›</span>
        <Link href={`/admin/path/${chapterId}`} className="text-rpg-dim hover:text-rpg-gold no-underline transition-colors"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>{chapter?.title ?? "..."}</Link>
        <span className="text-rpg-border" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>›</span>
        <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>{act?.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">EDIT ACT</h1>
          {chapter && <p className="text-rpg-dim text-xs">{chapter.title}</p>}
          <div className="w-20 pixel-divider-gold mt-1" />
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-rpg-green border border-rpg-green px-3 py-1.5"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>✓ SAVED</span>
          )}
          {act?.isFinalAct && (
            <span className="text-rpg-gold border border-rpg-gold px-3 py-1.5"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>FINAL ACT</span>
          )}
        </div>
      </div>

      {/* ── Basic meta ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 p-4 border-2 border-rpg-border/50 bg-rpg-panel/30">
        <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>ACT METADATA</span>
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-2">
            <Field label="TITLE">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={INPUT} />
            </Field>
          </div>
          <Field label="SLUG">
            <input value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              className={INPUT} />
          </Field>
          <Field label="ORDER">
            <input type="number" value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 1)} className={INPUT} />
          </Field>
        </div>

        <Field label="DESCRIPTION">
          <textarea value={description} rows={2} onChange={(e) => setDesc(e.target.value)} className={`${INPUT} resize-y`} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="FINAL ACT">
            <select value={isFinalAct ? "true" : "false"}
              onChange={(e) => setIsFinalAct(e.target.value === "true")} className={INPUT}>
              <option value="false">No — Regular Act</option>
              <option value="true">Yes — Final Act</option>
            </select>
          </Field>
          <Field label="LOCKED">
            <select value={isLocked ? "true" : "false"}
              onChange={(e) => setIsLocked(e.target.value === "true")} className={INPUT}>
              <option value="false">Unlocked</option>
              <option value="true">Locked</option>
            </select>
          </Field>
        </div>
      </div>

      {/* ── Content metadata ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 p-4 border-2 border-rpg-border/50 bg-rpg-panel/30">
        <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>CONTENT METADATA</span>
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-2">
            <Field label="MODULE"><input value={module} onChange={(e) => setModule(e.target.value)} placeholder="PROLOGUE — GATE OF FIRST LIGHT" className={INPUT} /></Field>
          </div>
          <Field label="TYPE"><input value={contentType} onChange={(e) => setContentType(e.target.value)} placeholder="STORY" className={INPUT} /></Field>
          <Field label="DURATION"><input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="8 min" className={INPUT} /></Field>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <Field label="LESSON #"><input type="number" value={lessonNumber} onChange={(e) => setLessonNum(parseInt(e.target.value) || 1)} className={INPUT} /></Field>
          <Field label="TOTAL LESSONS"><input type="number" value={totalLessons} onChange={(e) => setTotalLessons(parseInt(e.target.value) || 1)} className={INPUT} /></Field>
          <Field label="XP REWARD"><input type="number" value={xpReward} onChange={(e) => setXpReward(parseInt(e.target.value) || 0)} className={INPUT} /></Field>
          <Field label="GOLD REWARD"><input type="number" value={goldReward} onChange={(e) => setGoldReward(parseInt(e.target.value) || 0)} className={INPUT} /></Field>
        </div>
        <Field label="SUMMARY">
          <textarea value={summary} rows={2} onChange={(e) => setSummary(e.target.value)} className={`${INPUT} resize-y`} />
        </Field>
      </div>

      {/* ── Sections block editor ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <span className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
            SECTIONS ({blocks.length})
          </span>
          <div className="flex-1 h-px bg-rpg-border" />
        </div>
        <ActSectionEditor blocks={blocks} onChange={setBlocks} />
      </div>

      {/* ── Quiz editor ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <span className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
            QUIZ ({quiz.questions.length} QUESTIONS)
          </span>
          <div className="flex-1 h-px bg-rpg-border" />
          <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
            PASS: {Math.round(quiz.passingScore * 100)}% · {quiz.xpReward} XP · {quiz.goldReward} G
          </span>
        </div>
        <QuizEditor quiz={quiz} onChange={setQuiz} />
      </div>

      {error && <p className="text-rpg-red text-sm">{error}</p>}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t-2 border-rpg-border">
        <button onClick={doSave} disabled={saving}
          className="pixel-btn-gold text-[9px] px-6 py-3 tracking-widest disabled:opacity-40">
          {saving ? "SAVING..." : "▶ SAVE"}
        </button>
        <button onClick={handleSaveAndBack} disabled={saving}
          className="pixel-btn text-rpg-dim text-[8px] px-6 py-3 tracking-widest hover:text-rpg-text disabled:opacity-40">
          SAVE & BACK
        </button>
        <Link href={`/admin/path/${chapterId}`}
          className="pixel-btn text-rpg-dim text-[8px] px-4 py-3 no-underline tracking-widest hover:text-rpg-text">
          ← BACK
        </Link>
      </div>
    </div>
  );
}
