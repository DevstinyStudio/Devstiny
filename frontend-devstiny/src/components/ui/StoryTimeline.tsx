"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type ChapterStatus = "completed" | "active" | "locked";

const chapters = [
  {
    id: 0, slug: "prologue",
    label: "PROLOGUE", labelColor: "text-rpg-purple", borderColor: "border-rpg-purple",
    realm: "Gate of First Light", title: "The Beginning",
    opening: "You don't know how you got here. One second ago you were somewhere else — a world that made sense. Now you're standing before a gate made of light, in the middle of a meadow that looks too green to be real. And then — footsteps. Calm. Rhythmic.",
    companion: null, companionIntro: null, companionPortrait: null,
    worldContext: "This world is code. It was built to become something — buildings that are solid and modifiable, roads that bring people where they mean to go. It can be debugged. Refactored. Fixed. But not by me. That is why I need you.",
    worldContextSpeaker: "ELVAR",
    boss: null,
    epilogue: "The Syntax Wraith dissolves into scattered semicolons. Elvar examines you in silence for a long moment. Then — for the first time — he looks like what he is: someone who has been carrying something heavy for a very long time, and has finally found someone to help him carry it.",
    href: "/path/prologue/act-1",
    darkKingHint: "In the far corner of the world map — a dark point blinks once. Then disappears.",
  },
  {
    id: 1, slug: "chapter-1",
    label: "CHAPTER 1", labelColor: "text-rpg-purple", borderColor: "border-rpg-purple",
    realm: "The Compiler Archive", title: "Web Foundations",
    opening: "You are still in the tower. The window still shows the Broken Realm below. Elvar gestures toward it — and begins to explain not just what it is, but what it is made of.",
    companion: "ELVAR", companionIntro: "The web is not magic. It is a system built by people, running on rules written by people — which means it can be understood, and it can be fixed.",
    companionPortrait: "/NPC/elvar.png",
    worldContext: "Every territory in the Broken Realm corresponds to a real technology. The HTML Realm, the CSS Kingdom, the JavaScript Realm — they are not metaphors. They are the actual languages that build the web.",
    worldContextSpeaker: "ELVAR",
    boss: null,
    epilogue: "The Archive dims. The screens go dark, one by one. Elvar steps back from the window. 'You understand what the territories are now. Not just names on a map — languages. Systems. Tools. The HTML Realm is where you start. Ferrus is there. He has been waiting.'",
    href: "/path/chapter-1/act-1",
    darkKingHint: null,
  },
  {
    id: 2, slug: "chapter-2",
    label: "CHAPTER 2", labelColor: "text-rpg-purple", borderColor: "border-rpg-purple",
    realm: "The HTML Realm", title: "Structure",
    opening: "Everything stops moving. A bird frozen mid-flight. A market stall arranged too precisely. The wind simply ceases to exist. And then — the sound of something hitting stone. Rhythmic. Heavy.",
    companion: "FERRUS", companionIntro: "Name's Ferrus. I make things that last. The Iron Warden locked this entire realm into a static state. Nothing can be changed. Nothing updated. I've been trying to break through with a hammer. You're going to explain to me why that isn't working.",
    companionPortrait: "/NPC/ferrus.png",
    worldContext: "Every structure in this territory has a blueprint underneath it. The Elder Dev calls it HTML. I call it the thing I should have learned instead of buying a bigger hammer.",
    worldContextSpeaker: "FERRUS",
    boss: { name: "The Iron Warden", title: "Corrupted General — Module STRUCTURE", portrait: "/NPC/iron-warden.png", description: "A knight in seamless dark armor with no face — armor that has decided to be alive. Its fortress is a perfect building that cannot be entered, modified, or escaped. Structure taken to its logical extreme." },
    epilogue: "The territory unfreezes. Not all at once. In sections — like pages loading. The frozen bird completes its interrupted flight. The market stall settles. Ferrus sets his hammer down — carefully, for the first time — on the forge's edge.",
    href: "/path/chapter-2/act-1",
    darkKingHint: "The sky darkens for a moment. A silhouette. Too tall. A crown too large for a human head. Two points of red, closer than before. Then it vanishes.",
  },
  {
    id: 3, slug: "chapter-3",
    label: "CHAPTER 3", labelColor: "text-rpg-purple", borderColor: "border-rpg-purple",
    realm: "The CSS Kingdom", title: "Appearance",
    opening: "The air changes before anything else does. One step past the border marker, and the world becomes prettier. Not slowly — immediately. The grass sharpens into a gradient. The clouds are evenly spaced, perfectly scaled.",
    companion: "LYRA", companionIntro: "The proportions are perfect. That's how I know something's wrong. I've been here long enough to fill four notebooks with observations and zero solutions.",
    companionPortrait: "/NPC/lyra.png",
    worldContext: "CSS is not about how something looks. It is about the rules that govern how it looks. And rules can be read. Rules can be rewritten.",
    worldContextSpeaker: "LYRA",
    boss: { name: "The Weaver of Lies", title: "Corrupted General — Module MANIPULATION", portrait: "/NPC/weaver.png", description: "A tall figure without a face, dressed like an artist — hands always moving, adjusting values in the air. Its presence makes every colour slightly too bright, every proportion slightly too perfect." },
    epilogue: "The CSS Kingdom resolves. Not into something simpler — into something honest. The buildings are still beautiful. They're just beautiful because they're built correctly. Lyra hasn't spoken since The Weaver dissolved.",
    href: "/path/chapter-3/act-1",
    darkKingHint: null,
  },
  {
    id: 4, slug: "chapter-4",
    label: "CHAPTER 4", labelColor: "text-rpg-purple", borderColor: "border-rpg-purple",
    realm: "The JavaScript Realm", title: "Logic",
    opening: "Doors that open as you approach and close once you pass. Shop signs that change their text depending on who is reading them. Residents who respond differently the fifth time you walk past than they did the first. The world here doesn't sit still. It reacts.",
    companion: "SOMERS", companionIntro: "You're two weeks late. I was beginning to think a more interesting group might come through first. My name is Somers. I know how this world works better than anyone here, including all of you.",
    companionPortrait: "/NPC/somers.png",
    worldContext: "This world runs on conditional logic. If-else. State that changes. Values that shift based on what happens around them.",
    worldContextSpeaker: "SOMERS",
    boss: { name: "The Phantom Broker", title: "Corrupted General — Module EXPLOIT", portrait: "/NPC/phantom.png", description: "A well-dressed merchant who always appears warm and forthcoming. He always smiles. He is not pretending to be friendly. He simply also collects every word you say, every weakness you reveal, every secret you let slip — and sells it." },
    epilogue: "The JavaScript Realm is still moving — but differently now. Not the controlled chaos of a system exploiting everyone who passed through it. Just a reactive world, responding to whoever interacts with it, without hiding what it collects.",
    href: "/path/chapter-4/act-1",
    darkKingHint: "Something that isn't in any variable Somers has ever read about this world. The next chapter is going to be less predictable than he'd like.",
  },
  {
    id: 5, slug: "chapter-4-part-2",
    label: "CHAPTER 4 — II", labelColor: "text-rpg-purple", borderColor: "border-rpg-purple",
    realm: "The Wired District", title: "The DOM",
    opening: "The rest of the JavaScript Realm was reactive — loud, kinetic, always responding. The Wired District is the opposite. Completely silent.",
    companion: "SOMERS", companionIntro: "Many times. Alone. I could read every node in this district. Every element, every broken reference, every severed listener. I couldn't do anything about it.",
    companionPortrait: "/NPC/somers.png",
    worldContext: "The DOM is the layer between the code and what people see. If JavaScript is the logic, the DOM is the surface.",
    worldContextSpeaker: "SOMERS",
    boss: { name: "The Null Renderer", title: "Corrupted General — Module DISPLAY", portrait: "/NPC/null-renderer.png", description: "The only boss in Season 1 that is difficult to see. Not because it hides — because it barely renders. Off-white, flat, featureless. No texture. No shadow." },
    epilogue: "The district is loud now. Not artificially — genuinely loud, the way a market sounds when it's actually open. Every element present, visible, responsive.",
    href: "/path/chapter-4-part-2/act-1",
    darkKingHint: "A DOM tree. Stored deliberately. It is not a mistake. It is a key.",
  },
  {
    id: 6, slug: "season-finale",
    label: "SEASON FINALE", labelColor: "text-rpg-gold", borderColor: "border-rpg-gold",
    realm: "The Compiler's Tower", title: "The Compiler's Crown",
    opening: "The DOM tree at the center of the Wired District pulses once — twice — then releases a beam of light that traces every node upward through the sky, all the way to the peak of the Compiler's Tower.",
    companion: "ELVAR", companionIntro: "You found it. I have been watching every chapter from behind glass. Watching you fail and fix and push forward. I have been — very proud. And very ashamed that I could not be with you.",
    companionPortrait: "/NPC/elvar.png",
    worldContext: "Every chapter, you learned one part of the language this world is built from. HTML gave it structure. CSS gave it appearance. JavaScript gave it life. The DOM gave it memory and response. But you have never built something whole.",
    worldContextSpeaker: "ELVAR",
    boss: { name: "The Dark King", title: "N.O.A.H. Core — Fully Corrupted", portrait: "/NPC/dark-king.png", description: "Full armor of dark purple-black, each plate fused seamlessly to the next with no visible joint. A crown of jagged obsidian spires rises directly from the helmet." },
    epilogue: "He raises both hands. And then he does something no one could have predicted. He does not flee. He does not attack. He reaches into his own chest, into the lattice of corrupted code that makes him, and he pulls himself apart.",
    href: "/path/season-finale/act-1",
    darkKingHint: "You stabilized one realm. One. There are — many more. Different mythologies. Different architectures. Different error types. Can you debug something you cannot even name?",
  },
];

function computeStatus(slug: string, completedChapters: string[]): ChapterStatus {
  if (completedChapters.includes(slug)) return "completed";
  const idx = chapters.findIndex((c) => c.slug === slug);
  if (idx === 0) return "active";
  const prev = chapters[idx - 1];
  return completedChapters.includes(prev.slug) ? "active" : "locked";
}

export default function StoryTimeline() {
  const { user, ready } = useAuth();
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);

  useEffect(() => {
    if (!ready || !user) return;
    apiGet<{ completedChapters: string[] }>("/players/me")
      .then((d) => setCompletedChapters(d.completedChapters ?? []))
      .catch(() => {});
  }, [ready, user]);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-16">
      {chapters.map((ch, i) => {
        const status = computeStatus(ch.slug, completedChapters);
        const isLocked    = status === "locked";
        const isCompleted = status === "completed";
        const isActive    = status === "active";

        return (
          <div key={ch.id} className={`flex flex-col gap-6 ${isLocked ? "opacity-40" : ""}`}>
            {/* Chapter header */}
            <div className="flex items-center gap-4">
              <div className={`border-2 ${ch.borderColor} px-3 py-1`}>
                <span className={`tracking-widest ${ch.labelColor}`}
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                  {ch.label}
                </span>
              </div>
              <div className="flex-1 h-px bg-rpg-border" />
              {isCompleted && (
                <span className="text-rpg-green border border-rpg-green px-2 py-0.5 tracking-widest"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                  ✓ COMPLETED
                </span>
              )}
              {isActive && (
                <span className="text-rpg-gold border border-rpg-gold px-2 py-0.5 tracking-widest blink"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                  ▶ ACTIVE
                </span>
              )}
              {isLocked && (
                <span className="text-rpg-dim border border-rpg-dim px-2 py-0.5 tracking-widest"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                  🔒 LOCKED
                </span>
              )}
              <span className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                {ch.realm}
              </span>
            </div>

            {/* Title */}
            <h2 className={`text-base sm:text-lg tracking-widest ${ch.labelColor}`}
              style={{ fontFamily: "var(--font-pixel)" }}>
              {ch.title.toUpperCase()}
            </h2>

            {/* Opening narration */}
            <p className="text-sm text-rpg-text leading-7 italic border-l-2 border-rpg-border pl-4">
              {ch.opening}
            </p>

            {/* Content hidden when locked */}
            {!isLocked && (
              <>
                {ch.companion && ch.companionIntro && (
                  <div className="pixel-panel flex items-start gap-4">
                    {ch.companionPortrait && (
                      <Image src={ch.companionPortrait} alt={ch.companion} width={48} height={48} className="shrink-0 object-cover" />
                    )}
                    <div className="flex flex-col gap-1">
                      <span className={`tracking-widest ${ch.labelColor}`} style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                        {ch.companion}
                      </span>
                      <p className="text-sm text-rpg-dim leading-6">&ldquo;{ch.companionIntro}&rdquo;</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1 px-4">
                  <p className="text-xs text-rpg-dim leading-6">{ch.worldContext}</p>
                  <span className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                    — {ch.worldContextSpeaker}
                  </span>
                </div>

                {ch.boss && (
                  <div className="pixel-panel border-rpg-red flex items-start gap-4">
                    {ch.boss.portrait ? (
                      <Image src={ch.boss.portrait} alt={ch.boss.name} width={56} height={56} className="shrink-0 object-cover" />
                    ) : (
                      <div className="w-14 h-14 border-2 border-rpg-red flex items-center justify-center shrink-0">
                        <span className="text-rpg-red text-xl">☠</span>
                      </div>
                    )}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-rpg-red border border-rpg-red px-2 py-0.5 tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>BOSS</span>
                        <span className="text-rpg-red tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>{ch.boss.name}</span>
                      </div>
                      <span className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>{ch.boss.title}</span>
                      <p className="text-xs text-rpg-dim leading-5 mt-1">{ch.boss.description}</p>
                    </div>
                  </div>
                )}

                {isCompleted && (
                  <>
                    <p className="text-sm text-rpg-text leading-7 italic border-l-2 border-rpg-border pl-4">
                      {ch.epilogue}
                    </p>
                    {ch.darkKingHint && (
                      <div className="pixel-panel border-rpg-purple flex items-center gap-3">
                        <span className="text-rpg-purple text-lg shrink-0">◈</span>
                        <p className="text-rpg-purple text-xs leading-5 tracking-wide" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                          {ch.darkKingHint}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Action button */}
            <div>
              {isLocked ? (
                <span className="pixel-btn opacity-40 cursor-not-allowed text-[8px] px-5 py-2 tracking-widest"
                  style={{ fontFamily: "var(--font-pixel)" }}>
                  🔒 LOCKED
                </span>
              ) : (
                <Link href={ch.href}
                  className={`pixel-btn text-[8px] px-5 py-2 no-underline tracking-widest border-2 ${ch.borderColor} ${ch.labelColor} hover:bg-rpg-panel transition-colors`}>
                  {isCompleted ? `↩ REPLAY ${ch.label}` : `▶ PLAY ${ch.label}`}
                </Link>
              )}
            </div>

            {i < chapters.length - 1 && <div className="w-full pixel-divider mt-4" />}
          </div>
        );
      })}
    </div>
  );
}
