"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StarField from "@/components/StarField";
import PathContent from "@/components/ui/PathContent";
import { apiGet } from "@/lib/api";

export default function PathPage() {
  const [worldContext, setWorldContext] = useState("Your destiny as a developer begins here.");

  useEffect(() => {
    apiGet<{ worldContext: string }[]>("/path")
      .then((chapters) => {
        const first = chapters?.sort((a, b) => (a as unknown as { order: number }).order - (b as unknown as { order: number }).order)[0];
        if (first?.worldContext) setWorldContext(first.worldContext);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative pt-28 pb-16 px-4 text-center overflow-hidden bg-rpg-bg">
          <StarField />
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-5">
            <h1 className="text-2xl sm:text-3xl md:text-4xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest leading-normal">
              THE DEVSTINY<br />CHRONICLES
            </h1>
            <div className="w-48 pixel-divider-gold" />
            <p className="text-sm text-rpg-dim leading-7 max-w-xl">{worldContext}</p>
          </div>
        </section>

        {/* Progress + Chapter list */}
        <PathContent />
      </main>
      <Footer />
    </>
  );
}
