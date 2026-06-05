import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseSidebar from "@/components/course/CourseSidebar";
import { RenderSection } from "@/components/course/SectionRenderer";
import QuizGate from "@/components/ui/QuizGate";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const NEXT_CHAPTER: Record<string, { href: string; title: string }> = {
  "prologue":           { href: "/path/chapter-1/act-1",        title: "Chapter 1: Web Foundations"          },
  "chapter-1":          { href: "/path/chapter-2/act-1",        title: "Chapter 2: HTML"                     },
  "chapter-2":          { href: "/path/chapter-3/act-1",        title: "Chapter 3: CSS"                      },
  "chapter-3":          { href: "/path/chapter-4/act-1",        title: "Chapter 4: JavaScript"               },
  "chapter-4":          { href: "/path/chapter-4-part-2/act-1", title: "Chapter 4-II: The DOM"               },
  "chapter-4-part-2":   { href: "/path/season-finale/act-1",    title: "Season Finale: The Compiler's Crown" },
  "season-finale":      { href: "/path",                         title: "Back to Chronicles"                  },
};

interface ApiAct {
  id: string; slug: string; title: string; order: number;
  description: string; isFinalAct: boolean; isLocked: boolean;
  content: {
    title: string; lessonNumber: number; totalLessons: number; module: string;
    type: string; typeColor: string; duration: string; xpReward: number;
    goldReward: number; summary: string;
    sections: unknown[];
    quiz: { xpReward: number; goldReward: number; passingScore: number; questions: unknown[] };
  } | null;
}

interface ApiChapter {
  id: string; slug: string; title: string; realm: string; description: string;
  rewardXp: number; rewardGold: number;
  acts: ApiAct[];
}

async function fetchChapter(slug: string): Promise<ApiChapter | null> {
  try {
    const res = await fetch(`${API}/path/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function fetchAct(chapterSlug: string, actSlug: string): Promise<ApiAct | null> {
  try {
    const res = await fetch(`${API}/path/${chapterSlug}/${actSlug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

// ─── Dynamic metadata ─────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ chapter: string; act: string }> }
): Promise<Metadata> {
  const { chapter: chapterSlug, act: actSlug } = await params;
  const [chapter, act] = await Promise.all([
    fetchChapter(chapterSlug),
    fetchAct(chapterSlug, actSlug),
  ]);
  if (!chapter || !act || !act.content) return { title: "Not Found | Devstiny" };
  return {
    title: `${act.content.title} — ${chapter.title} | Devstiny`,
    description: act.content.summary,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ActPage(
  { params }: { params: Promise<{ chapter: string; act: string }> }
) {
  const { chapter: chapterSlug, act: actSlug } = await params;

  const [chapter, act] = await Promise.all([
    fetchChapter(chapterSlug),
    fetchAct(chapterSlug, actSlug),
  ]);

  if (!chapter || !act || !act.content) notFound();

  const content = act.content;

  // Sorted acts for prev/next navigation
  const allActs    = [...chapter.acts].sort((a, b) => a.order - b.order);
  const actIndex   = allActs.findIndex((a) => a.slug === actSlug);
  const prevAct    = allActs[actIndex - 1];
  const nextAct    = allActs[actIndex + 1];
  const isFinalAct = act.isFinalAct;

  // After final-act, navigate to the next chapter
  const nextChapter = isFinalAct && !nextAct ? NEXT_CHAPTER[chapterSlug] ?? null : null;

  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-3.5rem)] bg-rpg-bg">

        {/* Sidebar */}
        <div className="hidden md:block">
          <CourseSidebar
            chapter={{ title: chapter.title, realm: chapter.realm, description: chapter.description, acts: chapter.acts }}
            actSlug={actSlug}
            chapterSlug={chapterSlug}
            actXpReward={content.xpReward}
          />
        </div>

        {/* Main content */}
        <div className="mt-10 flex-1 min-w-0 overflow-y-auto">
          <article className="max-w-3xl mx-auto px-6 py-12">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-rpg-dim mb-8">
              <Link href="/path" className="hover:text-rpg-text no-underline transition-colors">
                Chronicles
              </Link>
              <span>›</span>
              <span className="text-rpg-dim">{chapter.title}</span>
              <span>›</span>
              <span className="text-rpg-text">{content.title}</span>
            </nav>

            {/* Lesson header */}
            <header className="flex flex-col gap-4 mb-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`border px-2 py-1 tracking-wider ${content.typeColor} border-current`}
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                  {content.type}
                </span>
                <span className="border text-rpg-gold border-rpg-gold px-2 py-1 tracking-wider"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                  ▶ ACTIVE
                </span>
                <span className="text-rpg-dim text-xs ml-auto">
                  {content.duration} · +{content.xpReward} XP
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-wide leading-snug">
                {content.title}
              </h1>

              <p className="text-base text-rpg-dim leading-7">{content.summary}</p>

              <div className="flex items-center gap-3 text-sm text-rpg-dim">
                <span className="text-rpg-green">◆</span>
                <span>Act {content.lessonNumber} of {content.totalLessons}</span>
                <span>·</span>
                <span className="text-rpg-green">◆</span>
                <span>{content.module}</span>
              </div>
            </header>

            <div className="pixel-divider-gold mb-10" />

            {/* Content sections */}
            {((content.sections ?? []) as Parameters<typeof RenderSection>[0]["section"][]).map((section, i) => (
              <RenderSection key={i} section={section} />
            ))}

            <div className="pixel-divider-gold mb-10" />

            {/* Quiz + navigation */}
            <QuizGate
              questions={((content.quiz?.questions ?? []) as Array<{
                id?: number; question: string; options: string[];
                correct?: number; answer?: string; explanation: string;
              }>).map((q, i) => ({
                id: q.id ?? i,
                question: q.question,
                options: q.options,
                correct: typeof q.correct === "number" ? q.correct : q.options.indexOf(q.answer ?? ""),
                explanation: q.explanation,
              }))}
              xpReward={content.quiz?.xpReward ?? 0}
              goldReward={content.quiz?.goldReward ?? 0}
              sceneKey={`${chapterSlug}/${actSlug}`}
              chapterSlug={isFinalAct ? chapterSlug : undefined}
              chapterXp={isFinalAct ? chapter.rewardXp : undefined}
              chapterGold={isFinalAct ? chapter.rewardGold : undefined}
              prevHref={prevAct ? `/path/${chapterSlug}/${prevAct.slug}` : "/path"}
              prevTitle={prevAct ? prevAct.title : "Chronicles"}
              nextHref={nextAct ? `/path/${chapterSlug}/${nextAct.slug}` : nextChapter?.href}
              nextTitle={nextAct ? nextAct.title : nextChapter?.title}
            />

          </article>
          <Footer />
        </div>
      </div>
    </>
  );
}
