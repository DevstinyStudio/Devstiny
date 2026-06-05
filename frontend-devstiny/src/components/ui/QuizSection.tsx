"use client";

import { useState, useEffect, useRef } from "react";
import { apiPost } from "@/lib/api";

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizSectionProps {
  questions:      QuizQuestion[];
  xpReward:       number;
  goldReward?:    number;
  sceneKey?:      string;
  chapterSlug?:   string;
  chapterXp?:     number;
  chapterGold?:   number;
  sceneCompleted?: boolean;
  onPass?:        () => void;
}

type QuizState = "idle" | "submitted" | "passed" | "failed";

export default function QuizSection({
  questions, xpReward, goldReward = 0,
  sceneKey, chapterSlug, chapterXp, chapterGold, sceneCompleted, onPass,
}: QuizSectionProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [state, setState] = useState<QuizState>("idle");
  const savedRef = useRef(false);

  useEffect(() => {
    if (sceneCompleted) {
      setAnswers(Object.fromEntries(questions.map((q) => [q.id, q.correct])));
      setState("passed");
      savedRef.current = true;
    }
  }, [sceneCompleted]);

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  const score = questions.filter((q) => answers[q.id] === q.correct).length;
  const passed = score >= Math.ceil(questions.length * 0.7); // 70% to pass

  function handleSubmit() {
    if (!allAnswered) return;
    const nextState = passed ? "passed" : "failed";
    setState(nextState);
    if (nextState === "passed") {
      onPass?.();
    }
    if (nextState === "passed" && sceneKey && !savedRef.current) {
      savedRef.current = true;
      apiPost("/players/me/scene", {
        sceneKey,
        xp:   xpReward,
        gold: goldReward,
        ...(chapterSlug ? { chapterSlug, chapterXp: chapterXp ?? 0, chapterGold: chapterGold ?? 0 } : {}),
      }).catch(() => {});
    }
  }

  function handleReset() {
    setAnswers({});
    setState("idle");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Questions */}
      {questions.map((q, qi) => {
        const chosen = answers[q.id];
        const revealed = state === "passed" || state === "failed";
        const isCorrect = chosen === q.correct;

        return (
          <div key={q.id} className="pixel-panel pixel-panel-labeled flex flex-col gap-4">
            <span className="pixel-panel-label" style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}>
              Q{qi + 1}
            </span>

            {/* Question */}
            <p className="text-sm text-rpg-text leading-6 mt-2 font-medium">{q.question}</p>

            {/* Options */}
            <ul className="flex flex-col gap-2 list-none p-0 m-0">
              {q.options.map((opt, oi) => {
                const isChosen = chosen === oi;
                const isAnswer = q.correct === oi;

                let borderColor = "border-rpg-border";
                let textColor = "text-rpg-dim";
                let icon = "○";
                let iconColor = "text-rpg-dim";

                if (isChosen && !revealed) {
                  borderColor = "border-rpg-gold";
                  textColor = "text-rpg-text";
                  icon = "◉";
                  iconColor = "text-rpg-gold";
                }

                if (revealed) {
                  if (isAnswer) {
                    borderColor = "border-rpg-green";
                    textColor = "text-rpg-text";
                    icon = "◆";
                    iconColor = "text-rpg-green";
                  } else if (isChosen && !isCorrect) {
                    borderColor = "border-rpg-red";
                    textColor = "text-rpg-dim line-through";
                    icon = "✕";
                    iconColor = "text-rpg-red";
                  }
                }

                return (
                  <li key={oi}>
                    <button
                      disabled={revealed}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                      className={`w-full flex items-center gap-3 px-4 py-3 border-2 ${borderColor} bg-rpg-bg text-left transition-colors duration-100 ${!revealed ? "hover:border-rpg-gold cursor-pointer" : "cursor-default"}`}
                    >
                      <span className={`text-base shrink-0 ${iconColor}`} style={{ fontFamily: "var(--font-pixel)" }}>
                        {icon}
                      </span>
                      <span className={`text-sm ${textColor} leading-5`}>{opt}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Explanation (shown after submit) */}
            {revealed && (
              <div className={`flex gap-3 p-3 border-2 ${isCorrect ? "border-rpg-green" : "border-rpg-red"}`}>
                <span className={isCorrect ? "text-rpg-green" : "text-rpg-red"}>
                  {isCorrect ? "✓" : "✕"}
                </span>
                <p className="text-sm text-rpg-dim leading-5">{q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}

      {/* Submit / Result */}
      {state === "idle" && (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className={`${allAnswered ? "pixel-btn-gold" : "pixel-btn opacity-40 cursor-not-allowed"} w-full py-4 text-[9px] tracking-widest`}
        >
          {allAnswered ? "▶ SUBMIT ANSWERS" : `ANSWER ALL QUESTIONS (${Object.keys(answers).length}/${questions.length})`}
        </button>
      )}

      {(state === "passed" || state === "failed") && (
        <div className={`pixel-panel-${state === "passed" ? "gold" : ""} ${state === "failed" ? "pixel-panel" : ""} pixel-panel-labeled flex flex-col items-center gap-4 py-6`}>
          <span className="pixel-panel-label" style={{ background: "#0a0818" }}>
            {state === "passed" ? "VICTORY" : "DEFEATED"}
          </span>

          <span className="text-4xl">{state === "passed" ? "★" : "✕"}</span>

          <h3 className={`text-sm tracking-widest text-center ${state === "passed" ? "text-rpg-gold text-glow-gold" : "text-rpg-red"}`}>
            {state === "passed" ? "QUEST COMPLETE!" : "TRY AGAIN"}
          </h3>

          <p className="text-sm text-rpg-dim text-center leading-6">
            {state === "passed"
              ? `You answered ${score}/${questions.length} correctly. The knowledge is yours.`
              : `You answered ${score}/${questions.length} correctly. You need 70% to pass.`}
          </p>

          {state === "passed" && (
            <span className="text-rpg-gold text-glow-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 12 }}>
              +{xpReward} XP
            </span>
          )}

          {state === "failed" && (
            <button
              onClick={handleReset}
              className="pixel-btn text-rpg-dim text-[8px] px-6 py-3 tracking-widest hover:text-rpg-text"
            >
              ↩ RETRY QUIZ
            </button>
          )}
        </div>
      )}
    </div>
  );
}
