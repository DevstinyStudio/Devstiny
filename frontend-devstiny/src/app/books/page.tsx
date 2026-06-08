import type { Metadata } from "next";
import BooksContent from "./BooksContent";

export const metadata: Metadata = {
  title: "The Library",
  description:
    "Browse Elvar's technical reference books. Master HTML, CSS, and JavaScript with structured, chapter-by-chapter guides.",
};

export default function BooksPage() {
  return <BooksContent />;
}
