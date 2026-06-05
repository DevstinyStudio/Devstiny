import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuestEditor from "@/components/quests/QuestEditor";
import type { Quest } from "@/types/quest";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface ApiQuestDetail {
  id: string; slug: string; title: string; tier: number; character: string;
  loreHook: string; functionName: string; starterCode: string;
  concepts: string[]; testCases: { description: string; args: unknown[]; expected: unknown }[];
  rewardXp: number; rewardGold: number; rewardBadge: string;
}

async function fetchQuest(slug: string): Promise<ApiQuestDetail | null> {
  try {
    const res = await fetch(`${API}/quests/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

function toQuestType(q: ApiQuestDetail): Quest {
  return {
    id:           q.id,
    slug:         q.slug,
    title:        q.title,
    tier:         q.tier as Quest["tier"],
    character:    q.character as Quest["character"],
    loreHook:     q.loreHook,
    functionName: q.functionName,
    starterCode:  q.starterCode,
    concepts:     q.concepts,
    testCases:    q.testCases,
    rewards: { xp: q.rewardXp, gold: q.rewardGold, badge: q.rewardBadge },
  };
}

const tierConfig = {
  1: { label: "FRAGMENT", color: "text-rpg-green",  border: "border-rpg-green"  },
  2: { label: "CIPHER",   color: "text-rpg-gold",   border: "border-rpg-gold"   },
  3: { label: "RELIC",    color: "text-rpg-purple",  border: "border-rpg-purple" },
};

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: slug } = await params;
  const q = await fetchQuest(slug);
  if (!q) return { title: "Quest Not Found" };
  return {
    title: `${q.title} — Coding Quests — Devstiny`,
    description: q.loreHook.slice(0, 120),
  };
}

export default async function QuestDetailPage({ params }: Props) {
  const { id: slug } = await params;
  const apiQuest = await fetchQuest(slug);
  if (!apiQuest) notFound();

  const quest = toQuestType(apiQuest);
  const tier  = tierConfig[quest.tier];

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-16 px-4 bg-rpg-bg min-h-screen">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
            <Link href="/quests" className="hover:text-rpg-gold transition-colors no-underline">
              ← CODING QUESTS
            </Link>
            <span>/</span>
            <span className="text-rpg-text">{quest.slug}</span>
          </div>

          {/* Title row */}
          <div className="flex flex-wrap items-start gap-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className={`border text-[7px] px-2 py-0.5 tracking-widest ${tier.color} ${tier.border}`}
                  style={{ fontFamily: "var(--font-pixel)" }}>
                  TIER {quest.tier} — {tier.label}
                </span>
                <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                  {quest.id}
                </span>
              </div>
              <h1 className="mt-3 text-lg sm:text-xl text-rpg-gold text-glow-gold tracking-widest">
                {quest.title.toUpperCase()}
              </h1>
            </div>
          </div>

          {/* Editor + test runner */}
          <QuestEditor quest={quest} />
        </div>
      </main>
      <Footer />
    </>
  );
}
