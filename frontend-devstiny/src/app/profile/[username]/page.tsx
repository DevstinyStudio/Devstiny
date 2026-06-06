import type { Metadata } from "next";
import ProfileContent from "./ProfileContent";

export async function generateMetadata(
  { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  const { username } = await params;
  return {
    title: username,
    description: `Check out ${username}'s adventure on Devstiny.`,
  };
}

export default function PublicProfilePage() {
  return <ProfileContent />;
}
