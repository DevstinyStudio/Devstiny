const steps = [
  {
    num: "01",
    gem: "/gem/gem-4.png",
    title: "CREATE CHARACTER",
    desc: "Sign up and choose your class: Frontend, Backend, or Fullstack.",
  },
  {
    num: "02",
    gem: "/gem/gem-10.png",
    title: "CHOOSE YOUR QUEST",
    desc: "Browse the quest board and pick your first adventure.",
  },
  {
    num: "03",
    gem: "/gem/gem-16.png",
    title: "GAIN EXPERIENCE",
    desc: "Complete lessons, build projects, and earn XP every day.",
  },
  {
    num: "04",
    gem: "/gem/gem-22.png",
    title: "CLAIM YOUR DESTINY",
    desc: "Earn certificates and land your dream developer role.",
  },
];

export default function AdventurePathSection() {
  return (
    <section className="py-20 px-4 bg-rpg-bg">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p
            className="text-rpg-dim tracking-widest mb-3"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}
          >
            HOW IT WORKS
          </p>
          <h2 className="text-lg sm:text-xl md:text-2xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">
            YOUR ADVENTURE PATH
          </h2>
          <div className="w-32 pixel-divider-gold mx-auto mt-4" />
        </div>

        {/* Icon row with broken line */}
        <div className="hidden lg:flex items-center mb-2">
          {steps.map((s, i) => (
            <div key={s.num} className="flex-1 flex items-center">
              <div className={`flex-1 h-0.75 ${i === 0 ? "opacity-0" : "bg-rpg-border"}`} />
              <img
                src={s.gem}
                alt={s.title}
                style={{ width: 56, height: 56, imageRendering: "pixelated", objectFit: "contain", flexShrink: 0 }}
              />
              <div className={`flex-1 h-0.75 ${i === steps.length - 1 ? "opacity-0" : "bg-rpg-border"}`} />
            </div>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col items-center text-center px-6 pb-6 pt-2 gap-3">
              {/* Mobile icon */}
              <img
                src={s.gem}
                alt={s.title}
                className="lg:hidden"
                style={{ width: 56, height: 56, imageRendering: "pixelated", objectFit: "contain" }}
              />
              <span
                className="text-rpg-dim tracking-widest"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
              >
                {s.num}
              </span>
              <h3 className="text-[9px] text-rpg-text tracking-wide leading-5">{s.title}</h3>
              <p className="text-sm text-rpg-dim leading-6">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
