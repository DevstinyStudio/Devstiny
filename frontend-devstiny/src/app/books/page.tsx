import type { Metadata } from "next";
import BooksContent from "./BooksContent";

export const metadata: Metadata = {
  title: "The Library",
  description:
    "Browse Elvar's technical reference books. Master HTML, CSS, and JavaScript with structured, chapter-by-chapter guides written by the Elder Dev himself.",
  alternates: {
    canonical: "https://www.devstiny.com/books",
  },
  openGraph: {
    url:         "https://www.devstiny.com/books",
    title:       "The Library | Devstiny",
    description: "Browse Elvar's technical reference books. Master HTML, CSS, and JavaScript with structured, chapter-by-chapter guides.",
  },
  robots: {
    index:  true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "The Library — Technical Reference",
  description:
    "Elvar's technical reference books covering HTML, CSS, and JavaScript for web development.",
  url: "https://www.devstiny.com/books",
  isPartOf: {
    "@type": "WebSite",
    name: "Devstiny",
    url: "https://www.devstiny.com",
  },
};

export default function BooksPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BooksContent />
    </>
  );
}
