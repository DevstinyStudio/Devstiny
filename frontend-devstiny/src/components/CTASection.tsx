import Link from "next/link";
import StarField from "@/components/StarField";

export default function CTASection() {
  return (
    <section className="relative py-32 px-4 overflow-hidden text-center bg-rpg-bg">
      <StarField />

      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-8">
        <div
          className="pixel-panel-gold p-2"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
        >
          <span className="text-rpg-gold">◆ FINAL CALL ◆</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest leading-loose">
          ARE YOU READY?
        </h2>

        <p
          className="text-rpg-text text-pixel-shadow tracking-widest"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 11 }}
        >
          YOUR CODING DESTINY AWAITS
        </p>

        <p className="text-sm text-rpg-dim leading-7 max-w-md">
          Join 10,000+ adventurers already on their journey.
          Free to start — no credit card required.
        </p>

        <Link
          href="/path"
          className="pixel-btn-gold text-sm px-8 py-4 tracking-widest no-underline"
        >
          ▶ START JOURNEY
        </Link>

        <div className="flex flex-wrap justify-center gap-4 text-sm text-rpg-dim">
          <span><span className="text-rpg-green">★</span> Free Starter Quest</span>
          <span>·</span>
          <span><span className="text-rpg-green">★</span> No experience needed</span>
          <span>·</span>
          <span><span className="text-rpg-green">★</span> Join any time</span>
        </div>
      </div>
    </section>
  );
}
