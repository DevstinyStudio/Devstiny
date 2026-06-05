import Image from "next/image";

const mentors = [
  {
    id: 1,
    portrait: "/NPC/elvar-head.png",
    name: "ELVAR",
    role: "The Elder Dev",
    roleColor: "text-rpg-cyan",
    quote:
      "Structure. Style. Behavior. Memory. These are not features — they are the four pillars the Dark King fears most. Master all four, and he cannot touch what you have built.",
    skill: "HTML · CSS · JS · DOM",
  },
  {
    id: 2,
    portrait: "/NPC/ferrus-head.png",
    name: "FERRUS",
    role: "Dwarf Blacksmith",
    roleColor: "text-rpg-red",
    quote:
      "The Iron Warden tried to make me think structure didn't matter. Every broken tag, every corrupted element — that was his weapon. Learn HTML right, and you take that weapon away.",
    skill: "HTML Structure",
  },
  {
    id: 3,
    portrait: "/NPC/lyra-head.png",
    name: "LYRA",
    role: "Alchemist",
    roleColor: "text-rpg-purple",
    quote:
      "The Weaver of Lies worked in confusion — false styles layered over true ones. When you understand the cascade, her illusions collapse. CSS is not decoration. It is truth made visible.",
    skill: "CSS & Layout",
  },
  {
    id: 4,
    portrait: "/NPC/somers-head.png",
    name: "SOMERS",
    role: "Jester",
    roleColor: "text-rpg-gold",
    quote:
      "The Dark King fragmented himself believing what is distributed cannot be fixed. He miscalculated. One developer who understands event delegation can debug anything from a single root.",
    skill: "JavaScript & DOM",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 px-4 bg-rpg-panel border-y-4 border-rpg-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p
            className="text-rpg-dim tracking-widest mb-3"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}
          >
            WORDS OF THE COMPANIONS
          </p>
          <h2 className="text-lg sm:text-xl md:text-2xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">
            MENTOR WISDOM
          </h2>
          <div className="w-32 pixel-divider-gold mx-auto mt-4" />
          <p className="text-rpg-dim text-sm mt-4 max-w-xl mx-auto leading-6">
            Your companions have faced the Dark King before. Their knowledge is your greatest weapon.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mentors.map((m) => (
            <div key={m.id} className="pixel-panel-gold pixel-panel-labeled flex flex-col gap-4">
              <span className="pixel-panel-label">{m.name}</span>

              <div className="flex items-center gap-3 mt-2">
                <Image
                  src={m.portrait}
                  alt={m.name}
                  width={48}
                  height={48}
                  className="shrink-0 object-cover"
                />
                <div className="flex flex-col gap-1">
                  <span
                    className="text-rpg-gold"
                    style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}
                  >
                    {m.name}
                  </span>
                  <span className={`text-xs ${m.roleColor}`}>{m.role}</span>
                </div>
              </div>

              <div className="pixel-divider" />

              <p className="text-sm text-rpg-text leading-6 flex-1">&ldquo;{m.quote}&rdquo;</p>

              <div className="flex items-center gap-2">
                <span className="text-rpg-gold text-base">⚔</span>
                <span
                  className="text-rpg-dim tracking-wider"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
                >
                  {m.skill}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
