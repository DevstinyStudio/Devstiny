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
  metadataBase: new URL("https://devstiny.com"),
  title: {
    template: "%s | Devstiny",
    default:  "Devstiny — Learn Web Development Through RPG Adventure",
  },
  description: "Master HTML, CSS, and JavaScript through an immersive pixel art RPG. Free to play.",
  openGraph: {
    type:      "website",
    url:       "https://devstiny.com",
    siteName:  "Devstiny",
    images:    [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card:   "summary_large_image",
    images: ["/og-image.png"],
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
