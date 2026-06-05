"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveSession } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Status = "loading" | "success" | "error";

interface VerifyResponse {
  message: string;
  access_token: string;
  user: { id: string; email: string; username: string; role: string; costume?: string };
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function VerifyEmailClient({ token }: { token: string }) {
  const router   = useRouter();
  const { setUser } = useAuth();
  const [status,  setStatus ] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in this link.");
      return;
    }

    fetch(`${API}/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message ?? "Verification failed.");
        return data as VerifyResponse;
      })
      .then((data) => {
        saveSession(data);
        setUser(data.user);
        setStatus("success");
        setMessage(data.message);
        setTimeout(() => router.push("/path"), 2500);
      })
      .catch((err: unknown) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verification failed.");
      });
  }, [token, router, setUser]);

  if (status === "loading") {
    return (
      <div className="pixel-panel flex flex-col gap-5 items-center text-center p-8">
        <span className="text-rpg-gold text-2xl animate-pulse">◈</span>
        <p
          className="text-rpg-dim tracking-widest"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}
        >
          VERIFYING...
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="pixel-panel flex flex-col gap-5 items-center text-center p-8">
        <span className="text-rpg-gold text-3xl">★</span>
        <p
          className="text-rpg-gold tracking-widest"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}
        >
          EMAIL VERIFIED
        </p>
        <div className="w-32 pixel-divider-gold" />
        <p className="text-sm text-rpg-dim leading-7 max-w-xs">{message}</p>
        <p className="text-xs text-rpg-dim">Redirecting to your adventure...</p>
      </div>
    );
  }

  return (
    <div className="pixel-panel flex flex-col gap-5 items-center text-center p-8">
      <span className="text-rpg-red text-3xl">✕</span>
      <p
        className="text-rpg-red tracking-widest"
        style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}
      >
        VERIFICATION FAILED
      </p>
      <div className="w-32 pixel-divider" />
      <p className="text-sm text-rpg-dim leading-7 max-w-xs">{message}</p>
      <div className="flex flex-col gap-3 mt-2 w-full max-w-xs">
        <Link
          href="/register"
          className="pixel-btn-gold text-[9px] px-5 py-3 no-underline tracking-widest text-center"
        >
          ▶ REQUEST NEW LINK
        </Link>
        <Link
          href="/login"
          className="pixel-btn text-rpg-dim text-[8px] px-5 py-3 no-underline tracking-widest hover:text-rpg-text text-center"
        >
          ← BACK TO LOGIN
        </Link>
      </div>
    </div>
  );
}
