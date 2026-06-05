"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";
import ActSectionEditor, { type SectionBlock, blocksToJson } from "@/components/admin/ActSectionEditor";
import QuizEditor, { type QuizData, quizToJson, EMPTY_QUIZ } from "@/components/admin/QuizEditor";

interface ChapterInfo { id: string; title: string; slug: string; acts: { id: string }[] }

const INPUT = "w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>{label}</label>
      {children}
    </div>
  );
}

export default function NewActPage() {
  const { id: chapterId } = useParams<{ id: string }>();
  const router = useRouter();

  const [chapter,   setChapter]  = useState<ChapterInfo | null>(null);
  const [saving,    setSaving]   = useState(false);
  const [error,     setError]    = useState("");

  // Basic meta
  const [title,       setTitle]       = useState("");
  const [slug,        setSlug]        = useState("");
  const [order,       setOrder]       = useState(1);
  const [description, setDesc]        = useState("");
  const [isFinalAct,  setIsFinalAct]  = useState(false);
  const [isLocked,    setIsLocked]    = useState(false);

  // Content metadata
  const [summary,      setSummary]      = useState("");
  const [duration,     setDuration]     = useState("10 min");
  const [xpReward,     setXpReward]     = useState(100);
  const [goldReward,   setGoldReward]   = useState(50);
  const [module,       setModule]       = useState("");
  const [lessonNumber, setLessonNum]    = useState(1);
  const [totalLessons, setTotalLessons] = useState(5);
  const [contentType,  setContentType]  = useState("STORY");

  // Sections + quiz
  const [blocks, setBlocks] = useState<SectionBlock[]>([]);
  const [quiz,   setQuiz]   = useState<QuizData>({ ...EMPTY_QUIZ });

  useEffect(() => {
    apiGet<ChapterInfo>(`/admin/path/${chapterId}`)
      .then((c) => {
        setChapter(c);
        setOrder((c.acts?.length ?? 0) + 1);
        setLessonNum((c.acts?.length ?? 0) + 1);
      })
      .catch(() => setError("Chapter not found."));
  }, [chapterId]);

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!slug || slug === title.toLowerCase().replace(/\s+/g, "-")) {
      setSlug(v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    }
  }

  async function handleSave() {
    setError("");
    if (!title.trim()) { setError("Title is required."); return; }
    if (!slug.trim())  { setError("Slug is required."); return; }
    setSaving(true);
    try {
      await apiPost(`/admin/path/${chapterId}/acts`, {
        title, slug, order, description, isFinalAct, isLocked,
        content: {
          slug, title, lessonNumber, totalLessons, module,
          type: contentType, typeColor: "text-rpg-purple",
          duration, xpReward, goldReward, summary,
          sections: blocksToJson(blocks),
          quiz: quizToJson(quiz),
        },
      });
      router.push(`/admin/path/${chapterId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create act.");
    }
    setSaving(false);
  }

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
        <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>NEW ACT</span>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">NEW ACT</h1>
        {chapter && <p className="text-rpg-dim text-xs">{chapter.title}</p>}
        <div className="w-20 pixel-divider-gold mt-1" />
      </div>

      {/* Basic meta */}
      <div className="flex flex-col gap-4 p-4 border-2 border-rpg-border/50 bg-rpg-panel/30">
        <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>ACT METADATA</span>
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-2">
            <Field label="TITLE">
              <input value={title} placeholder="Act title" autoFocus
                onChange={(e) => handleTitleChange(e.target.value)} className={INPUT} />
            </Field>
          </div>
          <Field label="SLUG">
            <input value={slug} placeholder="act-1"
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              className={INPUT} />
          </Field>
          <Field label="ORDER">
            <input type="number" value={order} onChange={(e) => setOrder(parseInt(e.target.value) || 1)} className={INPUT} />
          </Field>
        </div>
        <Field label="DESCRIPTION">
          <textarea value={description} rows={2} onChange={(e) => setDesc(e.target.value)}
            placeholder="Brief description..." className={`${INPUT} resize-y`} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="FINAL ACT">
            <select value={isFinalAct ? "true" : "false"} onChange={(e) => setIsFinalAct(e.target.value === "true")} className={INPUT}>
              <option value="false">No — Regular Act</option>
              <option value="true">Yes — Final Act</option>
            </select>
          </Field>
          <Field label="LOCKED">
            <select value={isLocked ? "true" : "false"} onChange={(e) => setIsLocked(e.target.value === "true")} className={INPUT}>
              <option value="false">Unlocked</option>
              <option value="true">Locked</option>
            </select>
          </Field>
        </div>
      </div>

      {/* Content metadata */}
      <div className="flex flex-col gap-4 p-4 border-2 border-rpg-border/50 bg-rpg-panel/30">
        <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>CONTENT METADATA</span>
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-2">
            <Field label="MODULE"><input value={module} onChange={(e) => setModule(e.target.value)} placeholder="CHAPTER — REALM NAME" className={INPUT} /></Field>
          </div>
          <Field label="TYPE"><input value={contentType} onChange={(e) => setContentType(e.target.value)} placeholder="STORY" className={INPUT} /></Field>
          <Field label="DURATION"><input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="10 min" className={INPUT} /></Field>
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

      {/* Sections block editor */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <span className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
            SECTIONS ({blocks.length})
          </span>
          <div className="flex-1 h-px bg-rpg-border" />
        </div>
        <ActSectionEditor blocks={blocks} onChange={setBlocks} />
      </div>

      {/* Quiz editor */}
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

      <div className="flex items-center gap-4 pt-2 border-t-2 border-rpg-border">
        <button onClick={handleSave} disabled={saving}
          className="pixel-btn-gold text-[9px] px-8 py-3 tracking-widest disabled:opacity-40">
          {saving ? "CREATING..." : "▶ CREATE ACT"}
        </button>
        <Link href={`/admin/path/${chapterId}`}
          className="pixel-btn text-rpg-dim text-[8px] px-6 py-3 no-underline tracking-widest hover:text-rpg-text">
          CANCEL
        </Link>
      </div>
    </div>
  );
}
