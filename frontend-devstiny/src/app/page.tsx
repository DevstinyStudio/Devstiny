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
  title: "Devstiny — Learn Web Development Through RPG Adventure",
  description:
    "Master HTML, CSS, and JavaScript through an immersive dark fantasy RPG. Complete quests, defeat bosses, and become a real developer in The Broken Realm.",
  alternates: {
    canonical: "https://www.devstiny.com",
  },
  openGraph: {
    url:         "https://www.devstiny.com",
    title:       "Devstiny — Learn Web Development Through RPG Adventure",
    description: "Master HTML, CSS, and JavaScript through an immersive dark fantasy RPG. Complete quests, defeat bosses, and become a real developer in The Broken Realm.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Devstiny",
  url: "https://www.devstiny.com",
  description: "Master HTML, CSS, and JavaScript through an immersive dark fantasy RPG.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.devstiny.com/profile/{search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
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
