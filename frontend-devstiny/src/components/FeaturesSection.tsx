const stats = [
  {
    abbr: "STR",
    color: "text-rpg-red",
    barColor: "bg-rpg-red",
    borderColor: "border-rpg-red",
    title: "Project-Based Learning",
    desc: "Build real apps by completing epic quests. No boring tutorials — only hands-on challenges.",
    xp: 99,
  },
  {
    abbr: "INT",
    color: "text-rpg-cyan",
    barColor: "bg-rpg-cyan",
    borderColor: "border-rpg-cyan",
    title: "Expert Mentors",
    desc: "Level up faster with guidance from senior developer masters who've been in your shoes.",
    xp: 95,
  },
  {
    abbr: "DEX",
    color: "text-rpg-green",
    barColor: "bg-rpg-green",
    borderColor: "border-rpg-green",
    title: "Learn at Your Pace",
    desc: "Complete quests on your own schedule. Life happens — your progress always waits for you.",
    xp: 99,
  },
  {
    abbr: "WIS",
    color: "text-rpg-purple",
    barColor: "bg-rpg-purple",
    borderColor: "border-rpg-purple",
    title: "Join a Guild",
    desc: "Adventure alongside fellow developers. Study together, grow together, celebrate together.",
    xp: 88,
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 px-4 bg-rpg-bg">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p
            className="text-rpg-dim tracking-widest mb-3"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}
          >
            CHARACTER ATTRIBUTES
          </p>
          <h2 className="text-lg sm:text-xl md:text-2xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">
            YOUR STATS WILL GROW
          </h2>
          <div className="w-32 pixel-divider-gold mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.abbr} className="pixel-panel pixel-panel-labeled flex flex-col gap-4">
              <span className="pixel-panel-label">{s.abbr}</span>

              <div className="flex items-center justify-between mt-2">
                <span
                  className={`text-lg font-bold ${s.color} text-pixel-shadow`}
                  style={{ fontFamily: "var(--font-pixel)" }}
                >
                  {s.abbr}
                </span>
                <span
                  className="text-rpg-dim"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
                >
                  {s.xp}/99
                </span>
              </div>

              <div className={`h-3 border-2 ${s.borderColor} bg-rpg-bg overflow-hidden`}>
                <div
                  className={`xp-bar-fill ${s.barColor}`}
                  style={{ ["--xp-w" as string]: `${s.xp}%` }}
                />
              </div>

              <h3 className="text-xs text-rpg-text tracking-wide leading-5">{s.title}</h3>

              <div className="pixel-divider" />

              <p className="text-sm text-rpg-dim leading-6">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
