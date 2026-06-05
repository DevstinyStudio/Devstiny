import type { Metadata } from "next";
import { Press_Start_2P, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const pressStart2P = Press_Start_2P({
  weight: "400",
  variable: "--font-pixel",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(`${API}/settings`, { next: { revalidate: 60 } });
    const s   = await res.json() as Record<string, string>;
    return {
      title:       s.site_title       ?? "Devstiny",
      description: s.site_description ?? "",
      icons: { icon: s.site_favicon ?? "/favicon.ico" },
    };
  } catch {
    return {
      title:       "Devstiny — Level Up Your Coding Skills",
      description: "The pixel-art RPG platform for learning to code. Complete quests, earn XP, and master programming.",
      icons: { icon: "/favicon.ico" },
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pressStart2P.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col scanlines" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
