import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import BooksSection from "@/components/BooksSection";
import QuestBoardSection from "@/components/QuestBoardSection";
import AdventurePathSection from "@/components/AdventurePathSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Master HTML, CSS, and JavaScript through an immersive pixel art RPG adventure. Complete quests, earn XP, and become a developer.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Devstiny",
  url: "https://devstiny.com",
  description: "Learn web development through pixel art RPG adventure",
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <AdventurePathSection />
        <QuestBoardSection />
        <BooksSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
