import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import StarField from "@/components/StarField";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password — Devstiny",
  description: "Reset your Devstiny account password.",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-screen flex items-center justify-center bg-rpg-bg pt-14 px-4 overflow-hidden">
        <StarField />

        <div className="absolute top-20 left-8  text-rpg-purple opacity-20 float text-3xl" style={{ animationDelay: "0s"   }}>◆</div>
        <div className="absolute top-32 right-8 text-rpg-gold   opacity-20 float text-2xl" style={{ animationDelay: "1s"   }}>★</div>
        <div className="absolute bottom-24 left-12  text-rpg-cyan opacity-20 float text-xl"  style={{ animationDelay: "0.5s" }}>◈</div>
        <div className="absolute bottom-32 right-12 text-rpg-green opacity-20 float text-2xl" style={{ animationDelay: "1.5s" }}>◆</div>

        <div className="relative z-10 w-full max-w-md flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-xl sm:text-2xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest leading-loose">
              ACCOUNT RECOVERY
            </h1>
            <div className="w-36 pixel-divider-gold" />
            <p className="text-sm text-rpg-dim leading-6 mb-2">
              Lost your way? We&apos;ll send a recovery scroll to your inbox.
            </p>
          </div>

          <ForgotPasswordForm />
        </div>
      </main>
    </>
  );
}
