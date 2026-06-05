import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Lore — Devstiny",
  description: "The world of Devstiny. Coming soon.",
};

export default function LorePage() {
  return (
    <>
      <Navbar />
      <main className="pt-14">
        <ComingSoon
          title="THE LORE ARCHIVE"
          subtitle="LORE"
          description="The scribes are still writing the history of Devstiny — the origin of the Dark King, the ancient developer guilds, and the prophecy that began it all. The Archive opens soon."
          icon="📜"
          iconColor="text-rpg-gold"
          accentColor="text-rpg-gold"
          eta="SEASON 2"
        />
      </main>
    </>
  );
}