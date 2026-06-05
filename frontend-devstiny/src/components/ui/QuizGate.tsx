"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import QuizSection, { type QuizQuestion } from "./QuizSection";
import { apiGet } from "@/lib/api";

interface QuizGateProps {
  questions:    QuizQuestion[];
  xpReward:     number;
  goldReward:   number;
  sceneKey:     string;
  chapterSlug?:  string;
  chapterXp?:    number;
  chapterGold?:  number;
  nextHref?:     string;
  nextTitle?:    string;
  prevHref:      string;
  prevTitle:     string;
}

export default function QuizGate({
  questions, xpReward, goldReward,
  sceneKey, chapterSlug, chapterXp, chapterGold,
  nextHref, nextTitle,
  prevHref, prevTitle,
}: QuizGateProps) {
  const [quizPassed,     setQuizPassed    ] = useState(questions.length === 0);
  const [sceneCompleted, setSceneCompleted] = useState(false);

  useEffect(() => {
    apiGet<{ completedScenes: string[] }>("/players/me")
      .then((d) => {
        if ((d.completedScenes ?? []).includes(sceneKey)) {
          setSceneCompleted(true);
          setQuizPassed(true);
        }
      })
      .catch(() => {});
  }, [sceneKey]);

  return (
    <>
      {/* Quiz */}
      {questions.length > 0 ? (
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-rpg-dim tracking-widest"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>
              LESSON QUIZ
            </p>
            <h2 className="text-base sm:text-lg text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">
              Test Your Knowledge
            </h2>
            <p className="text-sm text-rpg-dim leading-6">
              Answer all {questions.length} questions. You need 70% or higher to earn your XP reward.
            </p>
          </div>

          <QuizSection
            questions={questions}
            xpReward={xpReward}
            goldReward={goldReward}
            sceneKey={sceneKey}
            chapterSlug={chapterSlug}
            chapterXp={chapterXp}
            chapterGold={chapterGold}
            sceneCompleted={sceneCompleted}
            onPass={() => setQuizPassed(true)}
          />
        </section>
      ) : null}

      {/* Prev / Next navigation */}
      <div className="flex items-center justify-between mt-10">
        <Link
          href={prevHref}
          className="pixel-btn text-rpg-dim text-[8px] px-4 py-3 no-underline tracking-widest hover:text-rpg-text"
        >
          ← {prevTitle}
        </Link>

        {nextHref ? (
          quizPassed ? (
            <Link
              href={nextHref}
              className="pixel-btn-primary text-[8px] px-4 py-3 no-underline tracking-widest"
            >
              {nextTitle} →
            </Link>
          ) : (
            <button
              disabled
              className="pixel-btn opacity-40 cursor-not-allowed text-[8px] px-4 py-3 tracking-widest"
              style={{ fontFamily: "var(--font-pixel)" }}
            >
              {nextTitle} →
            </button>
          )
        ) : null}
      </div>
    </>
  );
}
