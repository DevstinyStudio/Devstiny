import type { Metadata } from "next";
import BookContent from "./BookContent";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API}/books/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return { title: "Book Not Found" };
    const book = await res.json() as { title: string; subtitle: string; description: string; volume: string };
    return {
      title: `${book.volume}: ${book.title}`,
      description: book.description || book.subtitle,
    };
  } catch {
    return { title: "The Library" };
  }
}

export default function BookPage() {
  return <BookContent />;
}
