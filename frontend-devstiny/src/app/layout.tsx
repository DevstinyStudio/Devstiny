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

const BASE_METADATA: Metadata = {
  metadataBase: new URL("https://www.devstiny.com"),
  title: {
    default:  "Devstiny — Learn Web Development Through RPG Adventure",
    template: "%s | Devstiny",
  },
  description:
    "Master HTML, CSS, and JavaScript through an immersive dark fantasy RPG. Complete quests, defeat bosses, and become a real developer in The Broken Realm.",
  keywords: [
    "learn web development",
    "coding RPG",
    "learn HTML CSS JavaScript",
    "gamified coding",
    "interactive coding course",
    "web development game",
    "devstiny",
  ],
  authors: [{ name: "Devstiny", url: "https://www.devstiny.com" }],
  creator: "Devstiny",
  openGraph: {
    type:        "website",
    locale:      "en_US",
    url:         "https://www.devstiny.com",
    siteName:    "Devstiny",
    title:       "Devstiny — Learn Web Development Through RPG Adventure",
    description: "Master HTML, CSS, and JavaScript through an immersive dark fantasy RPG. Complete quests, defeat bosses, and become a real developer in The Broken Realm.",
    images:      [{ url: "/og-image.png", width: 1200, height: 630, alt: "Devstiny — The Broken Realm" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Devstiny — Learn Web Development Through RPG Adventure",
    description: "Master HTML, CSS, and JavaScript through an immersive dark fantasy RPG.",
    images:      ["/og-image.png"],
  },
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:               true,
      follow:              true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },
  icons: { icon: "/favicon.ico" },
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(`${API}/settings`, { next: { revalidate: 60 } });
    const s   = await res.json() as Record<string, string>;
    return {
      ...BASE_METADATA,
      ...(s.site_title       ? { title: { template: "%s | Devstiny", default: s.site_title } } : {}),
      ...(s.site_description ? { description: s.site_description } : {}),
      icons: { icon: s.site_favicon ?? "/favicon.ico" },
    };
  } catch {
    return BASE_METADATA;
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
