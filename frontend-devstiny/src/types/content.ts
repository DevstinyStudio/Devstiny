// ─── Chapter index (index.json) ───────────────────────────────────────────────

export interface ChapterAct {
  id: string;
  slug: string;
  title: string;
  order: number;
  file: string;
  description: string;
  isLocked: boolean;
}

export interface Chapter {
  id: string;
  slug: string;
  title: string;
  realm: string;
  order: number;
  isLocked: boolean;
  coverImage: string;
  description: string;
  narrative: {
    opening: string;
    archonIntro: string;
    worldContext: string;
  };
  acts: ChapterAct[];
  finalAct?: ChapterAct;
  bossBattle: {
    id: string;
    file: string;
    bossName: string;
    bossTitle: string;
    bossDescription: string;
    bossImage: string;
    bossHp: number;
    heroHp: number;
    totalQuestions: number;
    passingHp: number;
    isLocked: boolean;
    escapeDialogue: string[];
    rewards: {
      xp: number;
      gold: number;
      badge: string;
      title: string;
      unlocksChapter: string;
    };
  };
  epilogue: {
    id: string;
    narrative: string[];
    darkKingReveal: {
      type: string;
      dialogue: string;
      image: string;
    };
  };
  rewards: {
    completion: { xp: number; gold: number; badge: string; title: string };
    perfect:    { xp: number; gold: number; badge: string; title: string };
  };
  meta: {
    totalLessons: number;
    totalActs: number;
    estimatedHours: number;
    difficulty: string;
    skills: string[];
    tags: string[];
  };
}

// ─── Act content (act-N.json) ──────────────────────────────────────────────────

export type CodeLanguage = "html" | "css" | "js";
export type CalloutVariant = "tip" | "warning" | "info";

export type ContentSection =
  | { type: "heading";   text: string; level?: 2 | 3 }
  | { type: "paragraph"; text: string }
  | { type: "code";      filename: string; language: CodeLanguage; code: string }
  | { type: "callout";   variant: CalloutVariant; text: string }
  | { type: "keypoints"; heading?: string; items: { color: string; text: string }[] }
  | { type: "divider";   label: string }
  | { type: "scene";          label: string }
  | { type: "narration";      text: string }
  | { type: "dialogue";       speaker: string; role: string; portrait?: string; lines: string[]; side?: "left" | "right" }
  | { type: "playerDialogue"; lines: string[]; portrait?: string }
  | {
      type: "htmlChallenge";
      title: string;
      description: string;
      requiredTags: { tag: string; hint: string }[];
      starterCode: string;
      successMessage: string;
    };

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface ActContent {
  id: string;
  slug: string;
  title: string;
  lessonNumber: number;
  totalLessons: number;
  module: string;
  type: string;
  typeColor: string;
  duration: string;
  xpReward: number;
  goldReward: number;
  summary: string;
  prevLesson?: { title: string; href: string };
  nextLesson?: { title: string; href: string };
  sections: ContentSection[];
  quiz: {
    questions: QuizQuestion[];
    xpReward: number;
    goldReward: number;
    passingScore: number;
  };
}