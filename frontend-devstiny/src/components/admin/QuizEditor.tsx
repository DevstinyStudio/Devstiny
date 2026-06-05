"use client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];   // always 4 options
  correct: number;     // 0-indexed
  explanation: string;
}

export interface QuizData {
  xpReward: number;
  goldReward: number;
  passingScore: number; // 0–1, e.g. 0.7 = 70 %
  questions: QuizQuestion[];
}

export const EMPTY_QUIZ: QuizData = {
  xpReward: 100, goldReward: 50, passingScore: 0.7, questions: [],
};

export function quizFromJson(raw: unknown): QuizData {
  if (!raw || typeof raw !== "object") return { ...EMPTY_QUIZ };
  const r = raw as Record<string, unknown>;
  const rawScore = typeof r.passingScore === "number" ? r.passingScore : 0.7;
  return {
    xpReward:    typeof r.xpReward   === "number" ? r.xpReward   : 100,
    goldReward:  typeof r.goldReward  === "number" ? r.goldReward  : 50,
    // Normalise: if stored as percentage (e.g. 70) convert to decimal (0.7)
    passingScore: rawScore > 1 ? rawScore / 100 : rawScore,
    questions:   Array.isArray(r.questions) ? (r.questions as QuizQuestion[]) : [],
  };
}

export function quizToJson(q: QuizData): unknown {
  return q;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const INPUT    = "w-full bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors";
const INPUT_SM = "bg-rpg-bg border border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-xs px-2 py-1.5 transition-colors";

function makeQuestion(id: number): QuizQuestion {
  return { id, question: "", options: ["", "", "", ""], correct: 0, explanation: "" };
}

// ─── Question editor ──────────────────────────────────────────────────────────

function QuestionEditor({
  q, index, total,
  onChange, onDelete, onMoveUp, onMoveDown,
}: {
  q: QuizQuestion; index: number; total: number;
  onChange: (q: QuizQuestion) => void;
  onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void;
}) {
  function setOption(i: number, value: string) {
    const opts = [...q.options];
    opts[i] = value;
    onChange({ ...q, options: opts });
  }

  const OPTION_LABELS = ["A", "B", "C", "D"];

  return (
    <div className="flex flex-col gap-3 border-2 border-rpg-border/50 p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
          Q{index + 1}
        </span>
        <div className="flex-1 h-px bg-rpg-border/30" />
        <div className="flex items-center gap-1">
          <button onClick={onMoveUp} disabled={index === 0}
            className="w-7 h-7 flex items-center justify-center text-rpg-dim hover:text-rpg-gold disabled:opacity-30 border border-rpg-border/50 hover:border-rpg-gold transition-colors">↑</button>
          <button onClick={onMoveDown} disabled={index === total - 1}
            className="w-7 h-7 flex items-center justify-center text-rpg-dim hover:text-rpg-gold disabled:opacity-30 border border-rpg-border/50 hover:border-rpg-gold transition-colors">↓</button>
          <button onClick={onDelete}
            className="w-7 h-7 flex items-center justify-center text-rpg-dim hover:text-rpg-red border border-rpg-border/50 hover:border-rpg-red transition-colors">×</button>
        </div>
      </div>

      {/* Question text */}
      <div className="flex flex-col gap-1.5">
        <label className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>QUESTION</label>
        <textarea value={q.question}
          onChange={(e) => onChange({ ...q, question: e.target.value })}
          placeholder="Write the question here..."
          className={`${INPUT} resize-y leading-6`}
          style={{ minHeight: 72 }} />
      </div>

      {/* Options */}
      <div className="flex flex-col gap-1.5">
        <label className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
          OPTIONS <span className="text-rpg-dim/60 normal-case" style={{ fontFamily: "inherit", fontSize: "11px" }}>(click ◆ to mark correct)</span>
        </label>
        <div className="flex flex-col gap-2">
          {q.options.map((opt, oi) => {
            const isCorrect = q.correct === oi;
            return (
              <div key={oi} className="flex items-center gap-2">
                {/* Correct indicator */}
                <button
                  onClick={() => onChange({ ...q, correct: oi })}
                  className="shrink-0 w-7 h-7 flex items-center justify-center border transition-colors"
                  style={{
                    borderColor: isCorrect ? "#40e070" : "#3d2d8c",
                    background:  isCorrect ? "rgba(64,224,112,0.1)" : "transparent",
                    color:       isCorrect ? "#40e070" : "#7a7ab0",
                  }}
                  title="Mark as correct answer">
                  {isCorrect ? "◆" : "○"}
                </button>
                {/* Option label */}
                <span className="shrink-0 text-rpg-dim text-xs w-5 text-center"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                  {OPTION_LABELS[oi]}
                </span>
                {/* Option text */}
                <input
                  value={opt}
                  onChange={(e) => setOption(oi, e.target.value)}
                  placeholder={`Option ${OPTION_LABELS[oi]}`}
                  className={`${INPUT_SM} flex-1 ${isCorrect ? "border-rpg-green/50" : ""}`}
                />
              </div>
            );
          })}
        </div>
        <p className="text-rpg-dim/50 text-xs px-1" style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}>
          CORRECT: OPTION {OPTION_LABELS[q.correct]} — {q.options[q.correct] || "(empty)"}
        </p>
      </div>

      {/* Explanation */}
      <div className="flex flex-col gap-1.5">
        <label className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>EXPLANATION</label>
        <textarea value={q.explanation}
          onChange={(e) => onChange({ ...q, explanation: e.target.value })}
          placeholder="Why is the correct answer correct? This is shown after the player answers."
          className={`${INPUT} resize-y leading-6`}
          style={{ minHeight: 72 }} />
      </div>
    </div>
  );
}

// ─── Quiz editor ──────────────────────────────────────────────────────────────

export default function QuizEditor({
  quiz,
  onChange,
}: {
  quiz: QuizData;
  onChange: (q: QuizData) => void;
}) {
  function updateQuestion(i: number, q: QuizQuestion) {
    onChange({ ...quiz, questions: quiz.questions.map((x, idx) => idx === i ? q : x) });
  }

  function deleteQuestion(i: number) {
    onChange({ ...quiz, questions: quiz.questions.filter((_, idx) => idx !== i) });
  }

  function moveQuestion(i: number, dir: -1 | 1) {
    const qs = [...quiz.questions];
    const j = i + dir;
    if (j < 0 || j >= qs.length) return;
    [qs[i], qs[j]] = [qs[j], qs[i]];
    onChange({ ...quiz, questions: qs });
  }

  function addQuestion() {
    const nextId = Math.max(0, ...quiz.questions.map((q) => q.id)) + 1;
    onChange({ ...quiz, questions: [...quiz.questions, makeQuestion(nextId)] });
  }

  const passingPct = Math.round(quiz.passingScore * 100);

  return (
    <div className="flex flex-col gap-4">
      {/* Quiz metadata */}
      <div className="grid grid-cols-3 gap-4 p-4 border border-rpg-border/50 bg-rpg-panel/20">
        <div className="flex flex-col gap-1.5">
          <label className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>XP REWARD</label>
          <input type="number" value={quiz.xpReward}
            onChange={(e) => onChange({ ...quiz, xpReward: parseInt(e.target.value) || 0 })}
            className={INPUT} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>GOLD REWARD</label>
          <input type="number" value={quiz.goldReward}
            onChange={(e) => onChange({ ...quiz, goldReward: parseInt(e.target.value) || 0 })}
            className={INPUT} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
            PASSING SCORE — {passingPct}%
          </label>
          <div className="flex items-center gap-3">
            <input type="range" min="0" max="100" step="5" value={passingPct}
              onChange={(e) => onChange({ ...quiz, passingScore: parseInt(e.target.value) / 100 })}
              className="flex-1 accent-rpg-gold" />
            <span className="text-rpg-gold shrink-0" style={{ fontFamily: "var(--font-pixel)", fontSize: 10, minWidth: 40 }}>
              {passingPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="flex flex-col gap-3">
        {quiz.questions.length === 0 && (
          <p className="text-rpg-dim text-sm text-center py-6 border-2 border-dashed border-rpg-border/30">
            No questions yet — add one below.
          </p>
        )}

        {quiz.questions.map((q, i) => (
          <QuestionEditor
            key={q.id}
            q={q}
            index={i}
            total={quiz.questions.length}
            onChange={(updated) => updateQuestion(i, updated)}
            onDelete={() => deleteQuestion(i)}
            onMoveUp={() => moveQuestion(i, -1)}
            onMoveDown={() => moveQuestion(i, 1)}
          />
        ))}

        <button onClick={addQuestion}
          className="pixel-btn-gold text-[8px] px-4 py-2 tracking-widest self-start">
          + ADD QUESTION
        </button>
      </div>
    </div>
  );
}
