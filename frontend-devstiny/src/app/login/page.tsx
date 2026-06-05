import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import StarField from "@/components/StarField";
import LoginForm from "@/components/auth/LoginForm";
import LoginStats from "@/components/auth/LoginStats";

export const metadata: Metadata = {
  title: "Login — Devstiny",
  description: "Sign in to continue your developer journey.",
};

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-screen flex items-center justify-center bg-rpg-bg pt-14 px-4 overflow-hidden">
        <StarField />

        {/* Floating decorations */}
        <div className="absolute top-20 left-8 text-rpg-purple opacity-20 float text-3xl" style={{ animationDelay: "0s" }}>◆</div>
        <div className="absolute top-32 right-8 text-rpg-gold opacity-20 float text-2xl"   style={{ animationDelay: "1s" }}>★</div>
        <div className="absolute bottom-24 left-12 text-rpg-cyan opacity-20 float text-xl"  style={{ animationDelay: "0.5s" }}>◈</div>
        <div className="absolute bottom-32 right-12 text-rpg-green opacity-20 float text-2xl" style={{ animationDelay: "1.5s" }}>◆</div>

        <div className="relative z-10 w-full max-w-md flex flex-col gap-6">

          {/* Header */}
          <div className="flex flex-col items-center gap-4 text-center">
            

            <h1 className="text-xl sm:text-2xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest leading-loose">
              WELCOME BACK
            </h1>

            <div className="w-36 pixel-divider-gold" />

            <p className="text-sm text-rpg-dim leading-6 mb-5">
              Your progress is waiting. Sign in to continue your journey.
            </p>
          </div>

          {/* Login form */}
          <LoginForm />

          {/* Stats teaser */}
          <LoginStats />

        </div>
      </main>
    </>
  );
}
