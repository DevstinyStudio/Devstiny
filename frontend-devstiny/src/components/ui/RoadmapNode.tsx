import type { Difficulty } from "@/types/quest";
import type { NodeStatus } from "@/types/roadmap";

function DifficultyStars({ level }: { level: Difficulty }) {
  return (
    <span style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < level ? "text-rpg-gold" : "text-rpg-dim"}>★</span>
      ))}
    </span>
  );
}

const statusConfig: Record<NodeStatus, { label: string; labelColor: string; btnText: string; cardOpacity: string }> = {
  available:  { label: "AVAILABLE",  labelColor: "text-rpg-green border-rpg-green", btnText: "ENTER DUNGEON →", cardOpacity: "" },
  locked:     { label: "LOCKED",     labelColor: "text-rpg-dim border-rpg-dim",     btnText: "LOCKED",          cardOpacity: "opacity-60" },
  completed:  { label: "COMPLETED",  labelColor: "text-rpg-cyan border-rpg-cyan",   btnText: "✓ COMPLETED",     cardOpacity: "" },
};

interface RoadmapNodeProps {
  step: number;
  icon: string;
  iconColor: string;
  title: string;
  type: string;
  typeColor: string;
  typeBg: string;
  desc: string;
  skills: string[];
  xp: number;
  duration: string;
  difficulty: Difficulty;
  status: NodeStatus;
  btnClass: string;
  isLast?: boolean;
}

export default function RoadmapNode({
  step,
  icon,
  iconColor,
  title,
  type,
  typeColor,
  typeBg,
  desc,
  skills,
  xp,
  duration,
  difficulty,
  status,
  btnClass,
  isLast = false,
}: RoadmapNodeProps) {
  const cfg = statusConfig[status];

  return (
    <div className="flex gap-4 md:gap-8">
      {/* Left: step indicator + connector */}
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Step circle */}
        <div
          className={`pixel-panel w-14 h-14 flex flex-col items-center justify-center gap-0.5 z-10 ${cfg.cardOpacity}`}
        >
          <span className={`text-xl leading-none ${iconColor}`}>{icon}</span>
          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
            {String(step).padStart(2, "0")}
          </span>
        </div>

        {/* Vertical connector — hidden on last node */}
        {!isLast && (
          <div className="w-[4px] flex-1 min-h-8 bg-rpg-border mt-1" />
        )}
      </div>

      {/* Right: card */}
      <div className={`flex-1 mb-8 ${cfg.cardOpacity}`}>
        <div className="pixel-panel pixel-panel-labeled flex flex-col gap-4">
          {/* Legend label */}
          <span className="pixel-panel-label">{type}</span>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span
              className={`text-[7px] border px-2 py-1 tracking-wider ${typeColor} ${typeBg}`}
              style={{ fontFamily: "var(--font-pixel)" }}
            >
              {type}
            </span>
            <span
              className={`text-[7px] border px-2 py-1 tracking-wider ${cfg.labelColor}`}
              style={{ fontFamily: "var(--font-pixel)" }}
            >
              {cfg.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm md:text-base text-rpg-text tracking-wide leading-6">{title}</h3>

          {/* Description */}
          <p className="text-sm text-rpg-dim leading-6">{desc}</p>

          <div className="pixel-divider" />

          {/* Skills you'll learn */}
          <div className="flex flex-col gap-2">
            <span
              className="text-rpg-dim tracking-widest"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
            >
              SKILLS UNLOCKED
            </span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 list-none p-0 m-0">
              {skills.map((skill) => (
                <li key={skill} className="flex items-center gap-2 text-sm text-rpg-text">
                  <span className="text-rpg-green text-xs">▶</span>
                  {skill}
                </li>
              ))}
            </ul>
          </div>

          <div className="pixel-divider" />

          {/* Difficulty + duration + XP */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                DIFFICULTY
              </span>
              <DifficultyStars level={difficulty} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                DURATION
              </span>
              <span className="text-rpg-text" style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}>{duration}</span>
            </div>
            <div className="px-3 py-2 flex flex-col gap-1">
              <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                XP REWARD
              </span>
              <span
                className="text-rpg-gold text-glow-gold"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}
              >
                +{xp.toLocaleString()} XP
              </span>
            </div>
          </div>

          {/* CTA button */}
          <button
            className={`${status === "locked" ? "pixel-btn opacity-50 cursor-not-allowed" : btnClass} w-full py-3 text-[9px] tracking-widest`}
            disabled={status === "locked"}
          >
            {cfg.btnText}
          </button>
        </div>
      </div>
    </div>
  );
}
