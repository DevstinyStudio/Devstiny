import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileDashboard from "@/components/profile/ProfileDashboard";

export const metadata: Metadata = {
  title: "Profile — Devstiny",
  description: "View your player profile, achievements, inventory, and settings.",
};

export default function ProfilePage() {
  return (
    <>
      <Navbar />
      <ProfileDashboard />
      <Footer />
    </>
  );
}
