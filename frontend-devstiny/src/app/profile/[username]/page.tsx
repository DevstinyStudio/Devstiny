import type { Metadata } from "next";
import ProfileContent from "./ProfileContent";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function generateMetadata(
  { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  const { username } = await params;
  try {
    const res = await fetch(`${API}/players/profile/${username}`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("not found");
    const player = await res.json() as { username: string; level?: number };
    return {
      title: `${player.username}'s Profile`,
      description: `Check out ${player.username}'s progress on Devstiny — Level ${player.level ?? 1} Developer in The Broken Realm.`,
      alternates: { canonical: `https://www.devstiny.com/profile/${username}` },
      openGraph: {
        url:         `https://www.devstiny.com/profile/${username}`,
        title:       `${player.username} | Devstiny`,
        description: `Level ${player.level ?? 1} Developer in The Broken Realm.`,
      },
    };
  } catch {
    return {
      title: "Player Profile",
      description: "View this player's progress on Devstiny — the RPG coding platform.",
      alternates: { canonical: `https://www.devstiny.com/profile/${username}` },
    };
  }
}

export default function PublicProfilePage() {
  return <ProfileContent />;
}
