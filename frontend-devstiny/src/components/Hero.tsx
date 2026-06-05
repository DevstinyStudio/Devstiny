import Link from "next/link";

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center pt-14 overflow-hidden"
      style={{
        backgroundImage:    "url('https://res.cloudinary.com/dnr7khgro/image/upload/devstiny/ui/bg-image4.png')",
        backgroundSize:     "cover",
        backgroundPosition: "center bottom",
        backgroundRepeat:   "no-repeat",
        imageRendering:     "pixelated",
      }}
    >
      {/* Dark overlay — keeps text readable over the scene */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "rgba(10, 8, 24, 0.55)" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 max-w-4xl mx-auto">
        {/* Badge */}
        <div
          className="pixel-panel px-4 py-2 text-rpg-cyan tracking-widest"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}
        >
          NEW ADVENTURE AWAITS
        </div>

        {/* Main title */}
        <h1 className="block text-base sm:text-lg md:text-2xl text-rpg-text text-pixel-shadow">
          The Dark King rises. <br />Only a developer can stop him.
        </h1>

        <div className="w-48 pixel-divider-gold" />

        {/* Description */}
        <p className="text-sm text-rpg-dim leading-7 max-w-lg tracking-wide">
          Master programming through epic quests. Earn XP, level up your skills,
          and claim your destiny as a developer.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <Link href="/path" className="pixel-btn-gold text-[10px] px-6 py-3 tracking-widest no-underline">
            ▶ START JOURNEY
          </Link>
          <Link href="/quests" className="pixel-btn text-rpg-text bg-transparent text-[10px] px-6 py-3 tracking-widest no-underline">
            VIEW QUESTS
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-rpg-dim blink-slow"
        style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
      >
        <span>▼</span>
        <span className="tracking-widest">SCROLL</span>
      </div>
    </section>
  );
}
