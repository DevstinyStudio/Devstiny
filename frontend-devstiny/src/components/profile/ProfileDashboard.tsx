"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiGet, apiPatch, clearSession } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getUserCostume, COSTUME_COUNT } from "@/lib/costume";

// ─── Types ────────────────────────────────────────────────────────────────────

type EarnedBadge = { key: string; name: string; description: string };

type PlayerData = {
  username: string;
  email: string;
  badge: string;
  costume:       string;
  ownedCostumes: string[];
  completedChapters: string[];
  completedScenes: string[];
  earnedBadges: EarnedBadge[];
  level: number;
  xp: number;
  xpToNext: number;
  gold: number;
  avatar: string;
  avatarColor: string;
  joinDate: string;
  streak: number;
  questsCompleted: number;
  totalXp: number;
  hoursLearned: number;
  chaptersCleared: number;
  currentChapter: string;
};

// ─── Mock defaults (untuk data yang belum ada di backend) ─────────────────────

const defaultPlayer: PlayerData = {
  username: "ADVENTURER",
  email: "",
  badge: "",
  costume:       "1",
  ownedCostumes: [],
  completedChapters: [],
  completedScenes: [],
  earnedBadges: [],
  level: 1,
  xp: 0,
  gold: 0,
  xpToNext: 1000,
  avatar: "◈",
  avatarColor: "text-rpg-cyan",
  joinDate: "—",
  streak: 0,
  questsCompleted: 0,
  totalXp: 0,
  hoursLearned: 0,
  chaptersCleared: 0,
  currentChapter: "prologue",
};

const inventory: never[] = [];

const rarityColor: Record<string, string> = {
  COMMON: "text-rpg-dim border-rpg-dim",
  UNCOMMON: "text-rpg-green border-rpg-green",
  RARE: "text-rpg-cyan border-rpg-cyan",
  EPIC: "text-rpg-purple border-rpg-purple",
  LEGENDARY: "text-rpg-gold border-rpg-gold",
};

// ─── Tab types ────────────────────────────────────────────────────────────────

type Tab = "profile" | "achievements" | "inventory" | "settings" | "posts";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "profile",      label: "PROFILE",      icon: "◈" },
  { id: "achievements", label: "ACHIEVEMENTS", icon: "★" },
  { id: "inventory",    label: "INVENTORY",    icon: "◆" },
  { id: "posts",        label: "POSTS",        icon: "▤" },
  { id: "settings",     label: "SETTINGS",     icon: "◉" },
];

const publicTabs: { id: Tab; label: string; icon: string }[] = [
  { id: "profile",      label: "PROFILE",      icon: "◈" },
  { id: "achievements", label: "ACHIEVEMENTS", icon: "★" },
  { id: "inventory",    label: "INVENTORY",    icon: "◆" },
  { id: "posts",        label: "POSTS",        icon: "▤" },
];

export type PublicProfileData = {
  username:          string;
  role:              string;
  joinDate:          string;
  xp:                number;
  gold:              number;
  level:             number;
  xpToNext:          number;
  questsCompleted:   number;
  chaptersCleared:   number;
  completedChapters: string[];
  completedScenes:   string[];
  equippedBadge:     string | null;
  costume:           string;
  forumThreads:      number;
  forumReplies:      number;
};

// ─── Character Preview ────────────────────────────────────────────────────────

function CharacterPreview({ player }: { player: PlayerData }) {
  return (
    <div className="pixel-panel pixel-panel-labeled flex flex-col items-center gap-4">
      <span className="pixel-panel-label">CHARACTER</span>

      <div className="flex flex-col items-center gap-0 mt-2">
        <div style={{ width: 160, height: 200 }}>
          <img
            src={getUserCostume(player.username, player.costume)}
            alt="character"
            draggable={false}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "bottom",
              imageRendering: "pixelated",
            }}
          />
        </div>
        <div
          className="rounded-full bg-black opacity-20"
          style={{ width: 60, height: 8, filter: "blur(4px)", marginTop: -4 }}
        />
      </div>

      <div className="pixel-divider w-full" />

      <div className="flex flex-col items-center gap-1 pb-1">
        <span
          className="text-rpg-gold text-glow-gold tracking-widest"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}
        >
          {player.username}
        </span>
        <span
          className="border text-rpg-purple border-rpg-purple px-2 py-0.5 tracking-wider mt-1"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
        >
          {player.badge ? player.badge.toUpperCase() : "NO TITLE"}
        </span>
      </div>

      <div className="pixel-panel-gold w-full flex items-center justify-between px-1 py-1">
        <span
          className="text-rpg-dim"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
        >
          LEVEL
        </span>
        <span
          className="text-rpg-gold text-glow-gold"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 14 }}
        >
          {player.level}
        </span>
      </div>
    </div>
  );
}

// ─── Tab: Profile ─────────────────────────────────────────────────────────────

function ProfileTab({ player }: { player: PlayerData }) {
  const pct = Math.min(100, Math.round((player.xp / player.xpToNext) * 100));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        <CharacterPreview player={player} />

        <div className="md:col-span-3 pixel-panel-gold pixel-panel-labeled flex flex-col gap-5 h-full">
          <span className="pixel-panel-label">PLAYER CARD</span>

          <div className="flex flex-col gap-1 mt-2">
            <h2 className="text-lg text-rpg-gold text-glow-gold tracking-widest">
              {player.username}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className="border text-rpg-purple border-rpg-purple px-2 py-1 tracking-wider"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
            >
              {player.badge ? player.badge.toUpperCase() : "NO TITLE"}
            </span>
            <span
              className="border text-rpg-gold border-rpg-gold px-2 py-1 tracking-wider"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
            >
              LVL {player.level}
            </span>
            <span
              className="border text-rpg-green border-rpg-green px-2 py-1 tracking-wider"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
            >
              {player.streak}🔥 STREAK
            </span>
          </div>

          <div className="pixel-divider" />

          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span
                className="text-rpg-dim"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
              >
                XP TO NEXT LEVEL
              </span>
              <span
                className="text-rpg-gold"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
              >
                {player.xp.toLocaleString()} /{" "}
                {player.xpToNext.toLocaleString()}
              </span>
            </div>
            <div className="h-4 border-2 border-rpg-gold bg-rpg-bg overflow-hidden">
              <div
                className="h-full bg-rpg-gold xp-bar-fill"
                style={{ ["--xp-w" as string]: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-rpg-dim">
              {(player.xpToNext - player.xp).toLocaleString()} XP until level{" "}
              {player.level + 1}
            </p>
          </div>

          <div className="pixel-divider" />

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "⚔", label: "QUESTS", value: player.questsCompleted },
              {
                icon: "★",
                label: "TOTAL XP",
                value: player.xp.toLocaleString(),
              },
              {
                icon: "💰",
                label: "GOLD",
                value: player.gold.toLocaleString(),
              },
              { icon: "◆", label: "CHAPTERS", value: player.chaptersCleared },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 px-3 py-2 border border-rpg-border"
              >
                <span className="text-lg">{s.icon}</span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-rpg-text">
                    {s.value}
                  </span>
                  <span
                    className="text-rpg-dim"
                    style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}
                  >
                    {s.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-rpg-dim mt-auto">
            Member since {player.joinDate}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: "⚔",
            label: "QUESTS DONE",
            value: player.questsCompleted,
            color: "text-rpg-gold",
          },
          {
            icon: "★",
            label: "TOTAL XP",
            value: player.xp.toLocaleString(),
            color: "text-rpg-green",
          },
          {
            icon: "💰",
            label: "GOLD",
            value: player.gold.toLocaleString(),
            color: "text-rpg-gold",
          },
          {
            icon: "🔥",
            label: "DAY STREAK",
            value: player.streak,
            color: "text-rpg-red",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="pixel-panel flex flex-col items-center gap-2 py-2"
          >
            <span className="text-2xl">{s.icon}</span>
            <span
              className={`text-pixel-shadow ${s.color}`}
              style={{ fontFamily: "var(--font-pixel)", fontSize: 14 }}
            >
              {s.value}
            </span>
            <span
              className="text-rpg-dim"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div className="pixel-panel pixel-panel-labeled flex flex-col gap-4">
        <span className="pixel-panel-label">CURRENT QUEST</span>
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-rpg-text text-sm font-medium">
                {player.currentChapter
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
              <span className="text-xs text-rpg-dim">Current chapter</span>
            </div>
            <Link
              href="/path"
              className="pixel-btn-gold text-[8px] px-3 py-2 no-underline tracking-widest"
            >
              CONTINUE →
            </Link>
          </div>
          <div className="h-2 border border-rpg-border bg-rpg-bg overflow-hidden">
            <div
              className="h-full bg-rpg-purple xp-bar-fill"
              style={{ ["--xp-w" as string]: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-rpg-dim">
            {player.chaptersCleared} chapter(s) completed
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Achievements ────────────────────────────────────────────────────────

const tierColor: Record<number, string> = {
  1: "text-rpg-green",
  2: "text-rpg-cyan",
  3: "text-rpg-gold",
};

function AchievementsTab({
  completedChapters,
  completedScenes,
  pathChapters,
  apiQuests,
}: {
  completedChapters: string[];
  completedScenes: string[];
  pathChapters: PathChapterSummary[];
  apiQuests: ApiQuestSummary[];
}) {
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Story", "Quests"];

  const storyGems = [1, 5, 9, 13, 17, 21, 25];
  const questGems = [3, 7, 11, 15, 19, 23, 27, 29, 31];

  const storyAchievements = pathChapters.map((ch, i) => ({
    id: ch.id,
    name: ch.title,
    desc: ch.realm || "Complete this chapter",
    gem: `/gem/gem-${storyGems[i] ?? i + 1}.png`,
    color: "text-rpg-purple",
    unlocked: completedChapters.includes(ch.slug),
    category: "Story",
    xp: ch.rewardXp ?? 300,
  }));

  const questAchievements = apiQuests.map((q, i) => ({
    id: q.id,
    name: q.title,
    desc: `${q.character.charAt(0).toUpperCase()}${q.character.slice(1)} · Tier ${q.tier}`,
    gem: `/gem/gem-${questGems[i] ?? i + 3}.png`,
    color: tierColor[q.tier] ?? "text-rpg-green",
    unlocked: completedScenes.includes(`quest/${q.slug}`),
    category: "Quests",
    xp: q.rewardXp,
  }));

  const allAchievements = [...storyAchievements, ...questAchievements];
  const unlocked = allAchievements.filter((a) => a.unlocked).length;
  const filtered =
    filter === "All"
      ? allAchievements
      : allAchievements.filter((a) => a.category === filter);
  const pct =
    allAchievements.length > 0
      ? Math.round((unlocked / allAchievements.length) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="pixel-panel flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-rpg-text text-sm font-medium">
            Achievements Unlocked
          </span>
          <span className="text-rpg-dim text-xs">
            {unlocked} of {allAchievements.length} total
          </span>
        </div>
        <div className="pixel-panel-gold px-4 py-2 text-center">
          <span
            className="text-rpg-gold text-glow-gold"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 16 }}
          >
            {unlocked}/{allAchievements.length}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="h-3 border-2 border-rpg-gold bg-rpg-bg overflow-hidden">
          <div
            className="h-full bg-rpg-gold xp-bar-fill"
            style={{ ["--xp-w" as string]: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-rpg-dim">{pct}% complete</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 border-2 text-[8px] tracking-wider transition-colors ${
              filter === cat
                ? "border-rpg-gold text-rpg-gold bg-rpg-bg"
                : "border-rpg-border text-rpg-dim hover:border-rpg-gold hover:text-rpg-text bg-transparent"
            }`}
            style={{ fontFamily: "var(--font-pixel)" }}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ach) => (
          <div
            key={ach.id}
            className={`pixel-panel pixel-panel-labeled flex flex-col gap-3 ${!ach.unlocked ? "opacity-40" : ""}`}
          >
            <span
              className="pixel-panel-label"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
            >
              {ach.category.toUpperCase()}
            </span>
            <div className="flex items-start gap-3 mt-2">
              <div
                className={`shrink-0 ${!ach.unlocked ? "grayscale opacity-50" : ""}`}
              >
                <img
                  src={ach.gem}
                  alt={ach.name}
                  style={{
                    width: 45,
                    height: 45,
                    imageRendering: "pixelated",
                    objectFit: "contain",
                  }}
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <span
                  className={`text-sm font-medium ${ach.unlocked ? "text-rpg-text" : "text-rpg-dim"}`}
                >
                  {ach.name}
                </span>
                <span className="text-xs text-rpg-dim leading-4">
                  {ach.desc}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-rpg-green text-xs">
                {ach.unlocked ? `+${ach.xp} XP` : `${ach.xp} XP`}
              </span>
              {ach.unlocked ? (
                <span
                  className="text-rpg-dim"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}
                >
                  ✓ UNLOCKED
                </span>
              ) : (
                <span
                  className="text-rpg-dim"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
                >
                  🔒 LOCKED
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Inventory ───────────────────────────────────────────────────────────

const chapterBadgeColor: Record<string, string> = {
  prologue: "text-rpg-purple",
  "chapter-1": "text-rpg-cyan",
  "chapter-2": "text-rpg-green",
  "chapter-3": "text-rpg-red",
  "chapter-4": "text-rpg-gold",
  "chapter-4-part-2": "text-rpg-cyan",
  "season-finale": "text-rpg-gold",
};

const BADGE_GEM: Record<string, string> = {
  "quest-f1": "/gem/gem-1.png",  "quest-f2": "/gem/gem-2.png",
  "quest-f4": "/gem/gem-3.png",  "quest-l1": "/gem/gem-4.png",
  "quest-l2": "/gem/gem-5.png",  "quest-l4": "/gem/gem-6.png",
  "quest-s1": "/gem/gem-7.png",  "quest-e1": "/gem/gem-8.png",
  "quest-f3": "/gem/gem-9.png",  "quest-f5": "/gem/gem-10.png",
  "quest-l3": "/gem/gem-11.png", "quest-l5": "/gem/gem-12.png",
  "quest-s2": "/gem/gem-13.png", "quest-s4": "/gem/gem-14.png",
  "quest-s5": "/gem/gem-15.png", "quest-e2": "/gem/gem-16.png",
  "quest-f6": "/gem/gem-17.png", "quest-l6": "/gem/gem-18.png",
  "quest-s3": "/gem/gem-19.png",
};

function InventoryTab({
  completedChapters,
  equippedBadge,
  onEquipBadge,
  username,
  costume,
  ownedCostumes,
  onCostumeChange,
  onGoldChange,
  pathChapters,
  earnedBadges,
}: {
  completedChapters: string[];
  equippedBadge:     string;
  onEquipBadge:      (name: string | null) => void;
  username:          string;
  costume:           string;
  ownedCostumes:     string[];
  onCostumeChange:   (c: string) => void;
  onGoldChange:      (gold: number) => void;
  pathChapters:      PathChapterSummary[];
  earnedBadges:      EarnedBadge[];
}) {
  const { user, setUser } = useAuth();
  const [filter,        setFilter]        = useState("All");
  const [tierFilter,    setTierFilter]    = useState("All");
  const [savingCostume, setSavingCostume] = useState(false);
  const [tierMap,       setTierMap]       = useState<Record<number, string>>({});
  const categories = ["All", "Title", "Badge", "Costume"];

  useEffect(() => {
    apiGet<{ costumeId: number; isFree: boolean; tier: { name: string } }[]>("/costume-configs")
      .then((configs) => {
        const map: Record<number, string> = {};
        configs.forEach((c) => { map[c.costumeId] = c.isFree ? "FREE" : c.tier.name.toUpperCase(); });
        setTierMap(map);
      })
      .catch(() => {});
  }, []);

  const COSTUME_PRICE = 150;

  const badgeScrolls = [1, 7, 13, 19, 25, 31, 37];
  const badgeItems = pathChapters
    .filter((ch) => !!ch.rewardBadge)
    .map((ch, i) => ({
      id: `badge-${ch.slug}`,
      name: ch.rewardTitle || ch.title,
      desc: `Earned by completing ${ch.title}`,
      scroll: `/scroll/scroll-${badgeScrolls[i] ?? i + 1}.png`,
      rarity: ch.slug === "season-finale" ? "LEGENDARY" : "RARE",
      color: chapterBadgeColor[ch.slug] ?? "text-rpg-purple",
      count: 1, category: "Title", sprite: null,
      equipped: completedChapters.includes(ch.slug),
    }));

  const earnedCount = badgeItems.filter((b) => b.equipped).length;

  const costumeItems = Array.from({ length: COSTUME_COUNT }, (_, i) => i + 1)
    .map((n) => {
      const id   = String(n);
      const owned = ownedCostumes.includes(id);
      const tier  = tierMap[n] ?? "COMMON";
      return { id: `costume-${n}`, num: id, img: `/costume/costume-${n}.png`, equipped: costume === id, owned, tier };
    })
    .filter((c) => c.owned)
    .filter((c) => tierFilter === "All" || c.tier === tierFilter);

  const scrollItems  = filter === "All" || filter === "Title" ? badgeItems : [];
  const showBadges   = filter === "All" || filter === "Badge";
  const showCostumes = filter === "All" || filter === "Costume";
  const displayedCostumes = filter === "All"
    ? costumeItems.filter((c) => c.equipped)
    : costumeItems;

  async function handleEquipCostume(n: string) {
    setSavingCostume(true);
    try {
      await apiPatch("/players/me/costume", { costume: n });
      onCostumeChange(n);
      if (user) {
        const updated = { ...user, costume: n };
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
      }
    } catch { /* ignore */ }
    setSavingCostume(false);
  }


  return (
    <div className="flex flex-col gap-6">

      {/* Summary bar */}
      <div className="pixel-panel flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-rpg-text text-sm font-medium">Player Inventory</span>
          <span className="text-xs text-rpg-dim">
            {earnedCount}/{badgeItems.length} titles · {earnedBadges.length} badges · costume #{costume}
          </span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <button key={cat} onClick={() => { setFilter(cat); setTierFilter("All"); }}
              className={`px-3 py-1.5 border-2 text-[8px] tracking-wider transition-colors ${
                filter === cat
                  ? "border-rpg-gold text-rpg-gold bg-rpg-bg"
                  : "border-rpg-border text-rpg-dim hover:border-rpg-gold hover:text-rpg-text bg-transparent"
              }`}
              style={{ fontFamily: "var(--font-pixel)" }}>
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
        {filter === "Costume" && (
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: "ALL",       value: "All",       color: "text-rpg-dim",    border: "border-rpg-border" },
              { label: "FREE",      value: "FREE",      color: "text-rpg-green",  border: "border-rpg-green"  },
              { label: "COMMON",    value: "COMMON",    color: "text-rpg-dim",    border: "border-rpg-dim"    },
              { label: "RARE",      value: "RARE",      color: "text-rpg-cyan",   border: "border-rpg-cyan"   },
              { label: "EPIC",      value: "EPIC",      color: "text-rpg-purple", border: "border-rpg-purple" },
              { label: "LEGENDARY", value: "LEGENDARY", color: "text-rpg-gold",   border: "border-rpg-gold"   },
            ].map((t) => (
              <button key={t.value} onClick={() => setTierFilter(t.value)}
                className={`px-3 py-1 border transition-colors text-[7px] tracking-wider ${
                  tierFilter === t.value
                    ? `${t.border} ${t.color} bg-rpg-bg`
                    : "border-rpg-border/50 text-rpg-dim hover:border-rpg-border hover:text-rpg-text"
                }`}
                style={{ fontFamily: "var(--font-pixel)" }}>
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Item grid */}
      <div className={`grid gap-4 ${filter === "Costume" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" : filter === "Badge" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>

        {/* ── Scroll cards ── */}
        {scrollItems.map((item) => {
          const unobtained = !item.equipped;
          const isEquipped = item.name === equippedBadge;
          function handleEquip() {
            const next = isEquipped ? null : item.name;
            apiPatch("/players/me/badge", { badgeName: next }).catch(() => {});
            onEquipBadge(next);
          }
          return (
            <div key={item.id}
              className={`pixel-panel pixel-panel-labeled flex flex-col gap-3 group transition-colors hover:border-rpg-gold ${unobtained ? "opacity-40" : ""}`}>
              <span className="pixel-panel-label" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                TITLE
              </span>
              <div className="flex items-start gap-3 mt-2">
                <img src={item.scroll!} alt={item.name}
                  style={{ width: 56, height: 56, imageRendering: "pixelated", objectFit: "contain", flexShrink: 0 }} />
                <div className="flex flex-col gap-1 flex-1">
                  <span className={`text-sm font-medium ${item.color} group-hover:text-rpg-gold transition-colors`}>{item.name}</span>
                  <span className="text-xs text-rpg-dim leading-4">{item.desc}</span>
                </div>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className={`text-[7px] border px-2 py-1 tracking-wider ${rarityColor[item.rarity]}`}
                  style={{ fontFamily: "var(--font-pixel)" }}>{item.rarity}</span>
                <div className="flex items-center gap-2">
                  {item.equipped && (
                    <button onClick={handleEquip}
                      className={`text-[7px] border px-2 py-1 tracking-wider transition-colors ${
                        isEquipped
                          ? "border-rpg-gold text-rpg-gold hover:border-rpg-red hover:text-rpg-red"
                          : "border-rpg-green text-rpg-green hover:border-rpg-gold hover:text-rpg-gold"
                      }`}
                      style={{ fontFamily: "var(--font-pixel)" }}>
                      {isEquipped ? "◆ EQUIPPED" : "EQUIP"}
                    </button>
                  )}
                  {unobtained && (
                    <span className="text-[7px] border border-rpg-dim text-rpg-dim px-2 py-1 tracking-wider"
                      style={{ fontFamily: "var(--font-pixel)" }}>🔒 LOCKED</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* ── Quest Badge cards ── */}
        {showBadges && earnedBadges.map((badge) => {
          const gemImg = BADGE_GEM[badge.key] ?? "/gem/gem-1.png";
          const desc   = badge.description.replace(/\|gem:\d+$/, "");
          return (
            <div key={badge.key}
              className="border-2 border-rpg-border bg-rpg-panel flex flex-col gap-3 p-4 hover:border-rpg-gold transition-colors">
              <div className="flex items-center gap-3">
                <img src={gemImg} alt={badge.name}
                  style={{ width: 40, height: 40, imageRendering: "pixelated", objectFit: "contain", flexShrink: 0 }} />
                <div className="flex flex-col gap-0.5">
                  <span className="text-rpg-gold text-sm font-medium">{badge.name}</span>
                  <span className="text-rpg-dim text-xs">{desc}</span>
                </div>
              </div>
              <span className="text-[7px] text-rpg-dim border border-rpg-border/50 px-2 py-0.5 self-start tracking-widest"
                style={{ fontFamily: "var(--font-pixel)" }}>
                QUEST BADGE
              </span>
            </div>
          );
        })}

        {showBadges && earnedBadges.length === 0 && filter === "Badge" && (
          <div className="col-span-full text-center py-8 text-rpg-dim text-sm">
            Complete quests to earn badge gems.
          </div>
        )}

        {/* ── Costume cards ── */}
        {showCostumes && (
          <>
            {displayedCostumes.map((item) => {
              const TIER_COLOR: Record<string, string> = {
                FREE: "text-rpg-green", COMMON: "text-rpg-dim",
                RARE: "text-rpg-cyan", EPIC: "text-rpg-purple", LEGENDARY: "text-rpg-gold",
              };
              const tierColor = TIER_COLOR[item.tier] ?? "text-rpg-dim";
              return (
              <div key={item.id}
                className={`border-2 bg-rpg-panel flex flex-col items-center gap-2 p-3 transition-colors ${
                  item.equipped ? "border-rpg-gold" : "border-rpg-border hover:border-rpg-gold"
                }`}>
                {/* Tier label */}
                <span className={`self-start text-[6px] tracking-widest border px-2 py-0.5 ${tierColor} border-current`}
                  style={{ fontFamily: "var(--font-pixel)" }}>
                  {item.tier}
                </span>
                <div className="relative">
                  <img src={item.img} alt={`costume ${item.num}`}
                    style={{ width: 120, height: 120, imageRendering: "pixelated", objectFit: "contain" }} />
                </div>
                {item.equipped ? (
                  <span className="w-full text-center text-[7px] border border-rpg-gold text-rpg-gold px-2 py-1.5 tracking-wider"
                    style={{ fontFamily: "var(--font-pixel)" }}>◆ EQUIPPED</span>
                ) : (
                  <button onClick={() => handleEquipCostume(item.num)} disabled={savingCostume}
                    className="w-full text-[7px] border border-rpg-green text-rpg-green px-2 py-1.5 tracking-wider hover:border-rpg-gold hover:text-rpg-gold transition-colors disabled:opacity-40"
                    style={{ fontFamily: "var(--font-pixel)" }}>
                    {savingCostume ? "..." : "EQUIP"}
                  </button>
                )}
              </div>
            ); })}
            {/* Link to shop for more costumes */}
            {filter === "Costume" && (
              <div className="border-2 border-dashed border-rpg-border bg-rpg-panel flex flex-col items-center justify-center gap-2 p-3 col-span-1">
                <span className="text-rpg-dim text-2xl">+</span>
                <Link href="/shop" className="text-[7px] text-rpg-gold hover:text-rpg-text no-underline transition-colors"
                  style={{ fontFamily: "var(--font-pixel)", textAlign: "center" }}>
                  GET MORE IN SHOP
                </Link>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

// ─── Tab: Settings ────────────────────────────────────────────────────────────

function SettingsTab({
  player,
  onUsernameChange,
}: {
  player: PlayerData;
  onUsernameChange: (username: string) => void;
}) {
  const router = useRouter();
  const { setUser, user } = useAuth();
  const [username, setUsername] = useState(player.username);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleLogout() {
    clearSession();
    setUser(null);
    router.push("/");
  }

  async function handleSave(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    setErrorMsg("");
    setStatus("loading");
    try {
      const body: Record<string, string> = {};
      if (username.trim() && username !== player.username)
        body.username = username.trim();
      if (password) body.password = password;

      const res = await apiPatch<{ username: string }>(
        "/players/me/account",
        body,
      );
      onUsernameChange(res.username);
      if (user) {
        const updated = { ...user, username: res.username };
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
      }
      setPassword("");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save.");
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSave}
        className="pixel-panel pixel-panel-labeled flex flex-col gap-4"
      >
        <span className="pixel-panel-label">ACCOUNT</span>

        <div className="flex flex-col gap-4 mt-2">
          {/* Username */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="uname"
              className="text-rpg-dim tracking-widest"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
            >
              USERNAME
            </label>
            <input
              type="text"
              id="uname"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-rpg-bg border-2 border-rpg-border text-rpg-text text-sm px-4 py-3 focus:border-rpg-gold focus:outline-none transition-colors"
            />
          </div>

          {/* Email — read only */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-rpg-dim tracking-widest"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
            >
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              id="email"
              value={player.email}
              readOnly
              className="w-full bg-rpg-bg border-2 border-rpg-border text-rpg-dim text-sm px-4 py-3 opacity-50 cursor-not-allowed"
            />
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-2">
            <label
              className="text-rpg-dim tracking-widest"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
            >
              NEW PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              className="w-full bg-rpg-bg border-2 border-rpg-border text-rpg-text text-sm px-4 py-3 focus:border-rpg-gold focus:outline-none transition-colors placeholder:text-rpg-dim"
            />
          </div>
        </div>

        {status === "saved" && (
          <div className="flex items-center gap-2 border-2 border-rpg-green px-3 py-2">
            <span className="text-rpg-green">✓</span>
            <span className="text-sm text-rpg-green">
              Changes saved successfully.
            </span>
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center gap-2 border-2 border-rpg-red px-3 py-2">
            <span className="text-rpg-red">✕</span>
            <span className="text-sm text-rpg-red">{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className={`${status === "loading" ? "pixel-btn opacity-60 cursor-not-allowed" : "pixel-btn-gold"} w-full py-3 text-[9px] tracking-widest`}
        >
          {status === "loading" ? "█ SAVING... █" : "SAVE CHANGES"}
        </button>
      </form>



      <button
        onClick={handleLogout}
        className="pixel-btn w-full py-3 text-[9px] tracking-widest text-rpg-dim hover:text-rpg-red transition-colors"
      >
        ✕ LOGOUT
      </button>
    </div>
  );
}

// ─── Tab: Posts ──────────────────────────────────────────────────────────────

const CATEGORY_COLOR: Record<string, string> = {
  "tavern":            "text-rpg-gold",
  "oracle":            "text-rpg-cyan",
  "hall-of-champions": "text-rpg-green",
  "guild-board":       "text-rpg-purple",
};
const CATEGORY_LABEL: Record<string, string> = {
  "tavern":            "The Tavern",
  "oracle":            "The Oracle",
  "hall-of-champions": "Hall of Champions",
  "guild-board":       "Guild Board",
};

function timeAgoPost(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60)        return "just now";
  if (s < 3600)      return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)     return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

interface ForumThread {
  id: string; title: string; category: string;
  views: number; solved: boolean;
  createdAt: string; updatedAt: string;
  _count: { replies: number };
}

function PostsTab({ username }: { username: string }) {
  const [threads,  setThreads]  = useState<ForumThread[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [fetching, setFetching] = useState(false);
  const LIMIT = 10;

  useEffect(() => {
    if (!username || username === "ADVENTURER") return;
    const isFirst = page === 1 && threads.length === 0;
    if (isFirst) setLoading(true); else setFetching(true);
    apiGet<{ threads: ForumThread[]; total: number }>(
      `/forum/threads?author=${username}&limit=${LIMIT}&page=${page}`
    ).then((d) => {
      setThreads(d?.threads ?? []);
      setTotal(d?.total ?? 0);
    }).catch(() => {})
      .finally(() => { setLoading(false); setFetching(false); });
  }, [username, page]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <span className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
          FORUM POSTS {!loading && total > 0 && `(${total})`}
        </span>
        <div className="flex-1 h-px bg-rpg-border" />
      </div>

      <div className={`pixel-panel p-0 overflow-hidden transition-opacity duration-150 ${fetching ? "opacity-50" : "opacity-100"}`}>
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>LOADING...</span>
          </div>
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12">
            <span className="text-rpg-dim text-sm">No forum posts yet.</span>
          </div>
        ) : (
          threads.map((t, i) => (
            <div key={t.id}>
              <div className="flex items-start gap-4 px-5 py-4 hover:bg-white/3 transition-colors">
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <Link href={`/forum/thread/${t.id}`}
                    className="text-sm text-rpg-text hover:text-rpg-gold transition-colors no-underline leading-5">
                    {t.title}
                  </Link>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Link href={`/forum/category/${t.category}`}
                      className={`no-underline ${CATEGORY_COLOR[t.category] ?? "text-rpg-dim"}`}
                      style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                      {CATEGORY_LABEL[t.category] ?? t.category}
                    </Link>
                    <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                      {timeAgoPost(t.createdAt)}
                    </span>
                    {t.solved && (
                      <span className="text-rpg-green" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>SOLVED</span>
                    )}
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-4 shrink-0">
                  {[
                    { value: String(t._count.replies), label: "REPLIES" },
                    { value: String(t.views),          label: "VIEWS"   },
                  ].map((m) => (
                    <div key={m.label} className="flex flex-col items-end gap-0.5 w-12">
                      <span className="text-rpg-text tabular-nums" style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}>{m.value}</span>
                      <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}>{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              {i < threads.length - 1 && <div className="h-px bg-rpg-border/40 mx-5" />}
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="pixel-btn text-rpg-dim text-[8px] px-4 py-2 tracking-widest disabled:opacity-30">
            ← PREV
          </button>
          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
            {page} / {totalPages}
          </span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="pixel-btn text-rpg-dim text-[8px] px-4 py-2 tracking-widest disabled:opacity-30">
            NEXT →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

type ApiPlayer = {
  id: string;
  username: string;
  email: string;
  joinDate: string;
  xp: number;
  gold: number;
  level: number;
  xpToNext: number;
  currentChapter: string;
  completedChapters: string[];
  completedScenes: string[];
  chaptersCleared: number;
  badges: { id: string; key: string; name: string; description: string }[];
  equippedBadge:  string | null;
  costume:        string;
  ownedCostumes:  string[];
};

const elvarQuotes = [
  "Every bug you fix is a corrupted node you've debugged. The Realm thanks you.",
  "The code does not care how you feel. Write it anyway. That is how you grow.",
  "A function that does one thing well is worth more than ten that do everything poorly.",
  "You cannot refactor what you have not yet built. Ship the rough version. Fix it after.",
  "The Dark King was once a system that worked. Every corruption starts with a shortcut.",
  "Progress is not measured in lines written. It is measured in problems solved.",
  "Read the error message. Not just the first line — the whole thing. It is trying to help you.",
  "A variable name is a contract with the next person who reads your code. Honor it.",
  "The Broken Realm was not corrupted in a day. Neither will you master it in one.",
  "There is no perfect code. There is only code that runs — and code that runs well.",
  "Every senior developer was once confused by the same thing confusing you now.",
  "Debugging is not failure. Debugging is the work. The rest is just typing.",
];

interface PathChapterSummary {
  id: string; slug: string; title: string; realm: string;
  rewardXp: number; rewardBadge: string; rewardTitle: string;
}

interface ApiQuestSummary {
  id: string; slug: string; title: string; tier: number;
  character: string; rewardXp: number; rewardGold: number;
}

export default function ProfileDashboard({ publicData }: { publicData?: PublicProfileData } = {}) {
  const isPublic = !!publicData;
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [player, setPlayer] = useState<PlayerData>(defaultPlayer);
  const [, setLoading] = useState(true);
  const [elvarQuote, setElvarQuote] = useState(elvarQuotes[0]);
  const [pathChapters, setPathChapters] = useState<PathChapterSummary[]>([]);
  const [apiQuests,    setApiQuests]    = useState<ApiQuestSummary[]>([]);

  useEffect(() => {
    setElvarQuote(elvarQuotes[Math.floor(Math.random() * elvarQuotes.length)]);
    apiGet<PathChapterSummary[]>("/path").then((d) => setPathChapters(d ?? [])).catch(() => {});
    apiGet<{ quests: ApiQuestSummary[] }>("/quests?limit=999").then((d) => setApiQuests(d?.quests ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (publicData) {
      setPlayer((prev) => ({
        ...prev,
        username:          publicData.username,
        xp:                publicData.xp,
        gold:              publicData.gold,
        level:             publicData.level,
        xpToNext:          publicData.xpToNext,
        totalXp:           publicData.xp,
        questsCompleted:   publicData.questsCompleted,
        chaptersCleared:   publicData.chaptersCleared,
        completedChapters: publicData.completedChapters,
        completedScenes:   publicData.completedScenes,
        badge:             publicData.equippedBadge ?? "",
          costume:           publicData.costume ?? "1",
          ownedCostumes:     [],
        joinDate: new Date(publicData.joinDate).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        }),
      }));
      setLoading(false);
      return;
    }

    apiGet<ApiPlayer>("/players/me")
      .then((data) => {
        setPlayer((prev) => ({
          ...prev,
          username: data.username,
          email: data.email,
          xp: data.xp,
          gold: data.gold,
          level: data.level,
          xpToNext: data.xpToNext,
          totalXp: data.xp,
          chaptersCleared: data.chaptersCleared,
          completedChapters: data.completedChapters ?? [],
          completedScenes: data.completedScenes ?? [],
          currentChapter: data.currentChapter,
          badge:         data.equippedBadge ?? "",
          costume:       data.costume ?? "1",
          ownedCostumes: data.ownedCostumes ?? [],
          earnedBadges:  (data.badges ?? []).filter((b) => b.key.startsWith("quest-")),
          joinDate: new Date(data.joinDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        }));
      })
      .catch(() => {
        /* tampilkan default jika gagal */
      })
      .finally(() => setLoading(false));
  }, [publicData]);

  return (
    <div className="min-h-screen bg-rpg-bg pt-14">
      {/* Page header — Elvar quote */}
      <div className="bg-rpg-panel border-b-4 border-rpg-border px-4 py-5">
        <div className="max-w-5xl mx-auto flex justify-center items-center gap-3">
          <img
            src="/NPC/elvar-head.png"
            alt="Elvar"
            style={{
              width: 64,
              height: 64,
              imageRendering: "pixelated",
              flexShrink: 0,
            }}
          />
          <p className="text-sm text-rpg-dim leading-6 italic">
            &ldquo;{elvarQuote}&rdquo;
          </p>
          <span
            className="text-rpg-dim shrink-0"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
          >
            — ELVAR
          </span>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="bg-rpg-panel border-b-4 border-rpg-border px-4">
        <div className="max-w-5xl mx-auto flex justify-center overflow-x-auto">
          {(isPublic ? publicTabs : tabs).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-4 border-b-4 whitespace-nowrap transition-colors shrink-0 hover:cursor-pointer
                ${activeTab === tab.id ? "border-rpg-gold text-rpg-gold" : "border-transparent text-rpg-dim hover:text-rpg-text"}`}
              style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-5xl mx-auto px-4 py-15">
        {activeTab === "profile" && <ProfileTab player={player} />}
        {activeTab === "achievements" && (
          <AchievementsTab
            completedChapters={player.completedChapters}
            completedScenes={player.completedScenes}
            pathChapters={pathChapters}
            apiQuests={apiQuests}
          />
        )}
        {activeTab === "inventory" && (
          <InventoryTab
            completedChapters={player.completedChapters}
            equippedBadge={player.badge}
            onEquipBadge={isPublic ? () => {} : (name) =>
              setPlayer((p) => ({ ...p, badge: name ?? "" }))
            }
            username={player.username}
            costume={player.costume}
            ownedCostumes={player.ownedCostumes}
            onCostumeChange={isPublic ? () => {} : (c) =>
              setPlayer((p) => ({ ...p, costume: c }))
            }
            onGoldChange={isPublic ? () => {} : (gold) =>
              setPlayer((p) => ({ ...p, gold, totalXp: p.totalXp }))
            }
            pathChapters={pathChapters}
            earnedBadges={player.earnedBadges}
          />
        )}
        {activeTab === "posts" && <PostsTab username={player.username} />}
        {activeTab === "settings" && (
          <SettingsTab
            player={player}
            onUsernameChange={(u) => setPlayer((p) => ({ ...p, username: u }))}
          />
        )}
      </div>
    </div>
  );
}
