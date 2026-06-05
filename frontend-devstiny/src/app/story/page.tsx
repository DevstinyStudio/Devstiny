import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StarField from "@/components/StarField";
import StoryTimeline from "@/components/ui/StoryTimeline";

export const metadata: Metadata = {
  title: "The Story — Devstiny",
  description: "The chronicle of Season 1 — The Broken Realm. Every chapter. Every companion. Every boss.",
};

export default function StoryPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative pt-28 pb-16 px-4 text-center overflow-hidden bg-rpg-bg">
          <StarField />
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-5">
            <p className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>
              SEASON 1
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest leading-normal">
              THE BROKEN REALM
            </h1>
            <div className="w-48 pixel-divider-gold" />
            <p className="text-sm text-rpg-dim leading-7 max-w-xl">
              A world built from code, broken by corruption. Four companions. Seven chapters. One Dark King
              who fragmented himself across five realms rather than be compiled against.
            </p>
            <div className="flex items-center gap-6 mt-2">
              <div className="pixel-panel px-4 py-2 flex flex-col items-center gap-0.5">
                <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>CHAPTERS</span>
                <span className="text-rpg-gold text-glow-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 12 }}>7</span>
              </div>
              <div className="pixel-panel px-4 py-2 flex flex-col items-center gap-0.5">
                <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>COMPANIONS</span>
                <span className="text-rpg-gold text-glow-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 12 }}>4</span>
              </div>
              <div className="pixel-panel px-4 py-2 flex flex-col items-center gap-0.5">
                <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>BOSSES</span>
                <span className="text-rpg-gold text-glow-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 12 }}>6</span>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline — progress dari backend */}
        <section className="py-16 px-4 bg-rpg-bg">
          <StoryTimeline />
        </section>

        {/* Season 2 teaser */}
        <section className="py-16 px-4 bg-rpg-panel border-y-4 border-rpg-border">
          <div className="max-w-3xl mx-auto flex flex-col items-center gap-6 text-center">
            <p className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>
              WHAT COMES NEXT
            </p>
            <h2 className="text-lg sm:text-xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">
              SEASON 2 — THE MYTHIC REALMS
            </h2>
            <div className="w-32 pixel-divider-gold" />
            <p className="text-sm text-rpg-dim leading-7 max-w-xl">
              The Dark King fragmented himself across five realms. The companions lost their technical knowledge —
              but not their will. Different mythologies. Different architectures. The same language underneath.
              And you speak it.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-2">
              {[
                { color: "text-rpg-cyan",   label: "THE SURFACE REALM",    sub: "Frontend — A world perfect from outside, hollow within." },
                { color: "text-rpg-purple", label: "THE UNDERWORLD REALM",  sub: "Backend — Unseen, necessary, running everything." },
                { color: "text-rpg-gold",   label: "THE ARCHIVE REALM",     sub: "Database — An ancient archive of infinite scale." },
              ].map((r) => (
                <div key={r.label} className="pixel-panel flex flex-col gap-2">
                  <span className={`tracking-widest ${r.color}`} style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                    {r.label}
                  </span>
                  <p className="text-xs text-rpg-dim leading-5">{r.sub}</p>
                </div>
              ))}
            </div>
            <div className="pixel-panel px-6 py-3 mt-2">
              <span className="text-rpg-dim tracking-widest blink" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                COMING — SEASON 2
              </span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
