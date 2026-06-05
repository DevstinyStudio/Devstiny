"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProfileDashboard, { type PublicProfileData } from "@/components/profile/ProfileDashboard";
import { apiGet } from "@/lib/api";

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile,  setProfile]  = useState<PublicProfileData | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;
    apiGet<PublicProfileData>(`/players/${username}/public`)
      .then(setProfile)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-rpg-bg pt-14 flex items-center justify-center">
          <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>
            LOADING...
          </span>
        </main>
      </>
    );
  }

  if (notFound || !profile) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-rpg-bg pt-14 flex flex-col items-center justify-center gap-4">
          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>
            ADVENTURER NOT FOUND
          </span>
          <Link href="/forum" className="pixel-btn text-rpg-dim text-[8px] px-4 py-3 no-underline tracking-widest hover:text-rpg-text">
            ← BACK TO FORUM
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <ProfileDashboard publicData={profile} />
    </>
  );
}
