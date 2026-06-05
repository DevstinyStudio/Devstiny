import type { Quest, Difficulty } from "@/types/quest";

function DifficultyStars({ level }: { level: Difficulty }) {
  return (
    <span className="tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < level ? "text-rpg-gold" : "text-rpg-dim"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function QuestCard({
  name,
  type,
  typeColor,
  typeBg,
  desc,
  difficulty,
  xp,
  duration,
  tag,
  tagColor,
  btnClass,
}: Omit<Quest, "id">) {
  return (
    <div className="pixel-panel pixel-panel-labeled flex flex-col gap-4 hover:border-rpg-gold transition-colors duration-150 group">
      <span className="pixel-panel-label">{type}</span>

      {/* Type + tag badges */}
      <div className="flex items-center justify-between mt-2">
        <span
          className={`text-[7px] border px-2 py-1 tracking-wider ${typeColor} ${typeBg}`}
          style={{ fontFamily: "var(--font-pixel)" }}
        >
          {type}
        </span>
        <span
          className={`text-[7px] border px-2 py-1 tracking-wider ${tagColor}`}
          style={{ fontFamily: "var(--font-pixel)" }}
        >
          {tag}
        </span>
      </div>

      {/* Quest name */}
      <h3 className="text-[9px] text-rpg-text tracking-wide leading-5 group-hover:text-rpg-gold transition-colors">
        {name}
      </h3>

      {/* Description */}
      <p className="text-sm text-rpg-dim leading-6 flex-1">{desc}</p>

      <div className="pixel-divider" />

      {/* Difficulty + duration */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
            DIFFICULTY
          </span>
          <DifficultyStars level={difficulty} />
        </div>
        <div className="flex flex-col gap-1 text-right">
          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
            DURATION
          </span>
          <span className="text-rpg-text text-sm">{duration}</span>
        </div>
      </div>

      {/* XP reward */}
      <div className="pixel-panel-gold p-2 flex items-center justify-between">
        <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
          XP REWARD
        </span>
        <span
          className="text-rpg-gold text-glow-gold"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}
        >
          +{xp.toLocaleString()} XP
        </span>
      </div>

      {/* CTA button */}
      <button className={`${btnClass} w-full py-3 text-[8px] tracking-widest`}>
        [ ACCEPT QUEST ]
      </button>
    </div>
  );
}
