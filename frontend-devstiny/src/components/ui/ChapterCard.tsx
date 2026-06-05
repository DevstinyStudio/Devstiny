import Link from "next/link";
import type { Chapter, ChapterStatus } from "@/types/chapter";

const statusConfig: Record<ChapterStatus, {
  badge: string;
  badgeColor: string;
  btnText: string;
  dim: boolean;
}> = {
  completed: { badge: "✓ COMPLETED", badgeColor: "text-rpg-cyan  border-rpg-cyan",  btnText: "REPLAY",          dim: false },
  active:    { badge: "▶ ACTIVE",    badgeColor: "text-rpg-green border-rpg-green", btnText: "ENTER CHAPTER →", dim: false },
  locked:    { badge: "🔒 LOCKED",   badgeColor: "text-rpg-dim   border-rpg-dim",   btnText: "LOCKED",          dim: true  },
};

interface ChapterCardProps extends Omit<Chapter, "id"> {
  href?: string;
}

export default function ChapterCard({
  label,
  title,
  type,
  typeColor,
  typeBg,
  accentColor,
  icon,
  image,
  story,
  skills,
  xp,
  gold,
  duration,
  status,
  btnClass,
  href,
}: ChapterCardProps) {
  const cfg = statusConfig[status];
  const canNavigate = status !== "locked" && href;

  return (
    <div className={`pixel-panel pixel-panel-labeled flex flex-col md:flex-row gap-6 transition-colors duration-150 ${cfg.dim ? "opacity-50" : "hover:border-rpg-gold"} group`}>
      <span className="pixel-panel-label">{label}</span>

      {/* Left — icon column */}
      <div className="flex flex-row md:flex-col items-center md:justify-start gap-4 md:gap-3 md:w-24 shrink-0 pt-2">
        <div className=" flex items-center justify-center shrink-0 overflow-hidden">
          {image
            ? <img src={image} alt={label} style={{ imageRendering: "pixelated", width: 70, height: 70, objectFit: "contain" }} />
            : <span className={`text-3xl ${accentColor}`}>{icon}</span>
          }
        </div>
        <div className="flex flex-col gap-1">
          <span
            className="text-rpg-dim tracking-widest"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
          >
            {label}
          </span>
          <span
            className={`text-[7px] border px-2 py-1 tracking-wider ${typeColor} ${typeBg}`}
            style={{ fontFamily: "var(--font-pixel)" }}
          >
            {type}
          </span>
        </div>
      </div>

      <div className="hidden md:block w-1 bg-rpg-border self-stretch shrink-0" />

      {/* Right — content */}
      <div className="flex flex-col gap-4 flex-1">
        {/* Title + status */}
        <div className="flex items-start justify-between gap-2">
          <h3 className={`flex-1 min-w-0 text-sm md:text-base tracking-wide leading-6 transition-colors ${accentColor}`}>
            {title}
          </h3>
          <span
            className={`text-[7px] border px-2 py-1 tracking-wider shrink-0 ${cfg.badgeColor}`}
            style={{ fontFamily: "var(--font-pixel)" }}
          >
            {cfg.badge}
          </span>
        </div>

        {/* Story */}
        <p className="text-sm text-rpg-dim leading-6">{story}</p>

        <div className="pixel-divider" />

        {/* Skills */}
        <div className="flex flex-col gap-2">
          <span
            className="text-rpg-dim tracking-widest"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
          >
            SKILLS UNLOCKED
          </span>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-1 list-none p-0 m-0">
            {skills.map((skill) => (
              <li key={skill} className="flex items-center gap-2 text-sm text-rpg-text">
                <span className={`text-xs ${accentColor}`}>▶</span>
                {skill}
              </li>
            ))}
          </ul>
        </div>

        <div className="pixel-divider" />

        {/* Footer row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                DURATION
              </span>
              <span className="text-rpg-text" style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}>{duration}</span>
            </div>
            <div className="px-3 py-1.5 flex flex-col gap-0.5">
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
            <div className="px-3 py-1.5 flex flex-col gap-0.5">
              <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                GOLD
              </span>
              <span
                className="text-rpg-gold"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}
              >
                +{gold.toLocaleString()} G
              </span>
            </div>
          </div>

          {/* CTA — Link jika bisa navigasi, button jika locked */}
          {canNavigate ? (
            <Link
              href={href}
              className={`${btnClass} px-6 py-3 text-[8px] tracking-widest no-underline`}
            >
              {cfg.btnText}
            </Link>
          ) : (
            <button
              disabled={status === "locked"}
              className={`${status === "locked" ? "pixel-btn opacity-40 cursor-not-allowed" : btnClass} px-6 py-3 text-[8px] tracking-widest`}
            >
              {cfg.btnText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
