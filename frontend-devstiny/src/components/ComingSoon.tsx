import Link from "next/link";
import StarField from "@/components/StarField";

interface ComingSoonProps {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  iconColor: string;
  accentColor: string;
  eta?: string;
}

export default function ComingSoon({
  title,
  subtitle,
  description,
  icon,
  iconColor,
  accentColor,
  eta,
}: ComingSoonProps) {
  return (
    <section className="relative min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 bg-rpg-bg overflow-hidden">
      <StarField />

      {/* Animated corner decorations */}
      <div className="absolute top-8 left-8 opacity-20 float" style={{ animationDelay: "0s" }}>
        <div className={`text-4xl ${accentColor}`}>◆</div>
      </div>
      <div className="absolute top-8 right-8 opacity-20 float" style={{ animationDelay: "1s" }}>
        <div className={`text-4xl ${accentColor}`}>◆</div>
      </div>
      <div className="absolute bottom-16 left-8 opacity-20 float" style={{ animationDelay: "0.5s" }}>
        <div className={`text-4xl ${accentColor}`}>◆</div>
      </div>
      <div className="absolute bottom-16 right-8 opacity-20 float" style={{ animationDelay: "1.5s" }}>
        <div className={`text-4xl ${accentColor}`}>◆</div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-xl">
        {/* Icon */}
        <div className={`pixel-panel w-24 h-24 flex items-center justify-center float`}>
          <span className={`text-5xl ${iconColor}`}>{icon}</span>
        </div>

        {/* Label */}
        <div
          className={`pixel-panel px-4 py-2 ${accentColor} tracking-widest`}
          style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
        >
          ◈ {subtitle} ◈
        </div>

        {/* Title */}
        <h1
          className={`text-xl sm:text-2xl md:text-3xl ${accentColor} text-pixel-shadow tracking-widest leading-loose`}
        >
          {title}
        </h1>

        <div className="w-48 pixel-divider-gold" />

        {/* Description */}
        <p className="text-sm text-rpg-dim leading-7 max-w-md">{description}</p>

        {/* ETA */}
        {eta && (
          <div className="pixel-panel-gold px-6 py-3 flex flex-col items-center gap-1">
            <span
              className="text-rpg-dim tracking-widest"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
            >
              ESTIMATED ARRIVAL
            </span>
            <span
              className="text-rpg-gold text-glow-gold"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}
            >
              {eta}
            </span>
          </div>
        )}

        {/* Blinking status */}
        <div
          className="flex items-center gap-3 text-rpg-dim"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
        >
          <span className="blink text-rpg-green">█</span>
          <span className="tracking-widest">UNDER CONSTRUCTION</span>
          <span className="blink text-rpg-green" style={{ animationDelay: "0.5s" }}>█</span>
        </div>

        {/* Back button */}
        <Link
          href="/"
          className="pixel-btn text-rpg-dim text-[8px] px-6 py-3 no-underline tracking-widest hover:text-rpg-text"
        >
          ← BACK TO HOME
        </Link>
      </div>
    </section>
  );
}
