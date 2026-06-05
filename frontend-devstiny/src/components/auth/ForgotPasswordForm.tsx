"use client";

import { useState } from "react";
import Link from "next/link";
import { apiPost } from "@/lib/api";

type Status = "idle" | "loading" | "success" | "error";

export default function ForgotPasswordForm() {
  const [email, setEmail]     = useState("");
  const [status, setStatus]   = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }

    setStatus("loading");
    try {
      const data = await apiPost<{ message: string }>("/auth/forgot-password", { email });
      setMessage(data.message);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="pixel-panel flex flex-col gap-5 items-center text-center p-8">
        <span className="text-rpg-gold text-3xl">◈</span>
        <p
          className="text-rpg-gold tracking-widest"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}
        >
          CHECK YOUR INBOX
        </p>
        <div className="w-32 pixel-divider-gold" />
        <p className="text-sm text-rpg-dim leading-7 max-w-xs">{message}</p>
        <Link
          href="/login"
          className="pixel-btn text-rpg-dim text-[8px] px-5 py-3 no-underline tracking-widest hover:text-rpg-text mt-2"
        >
          ← BACK TO LOGIN
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="pixel-panel pixel-panel-labeled flex flex-col gap-5"
    >
      <span className="pixel-panel-label">ACCOUNT RECOVERY</span>

      <p className="text-sm text-rpg-dim leading-7 mt-2">
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-rpg-dim tracking-widest"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
        >
          EMAIL ADDRESS
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="hero@devstiny.com"
          autoComplete="email"
          disabled={status === "loading"}
          className="w-full bg-rpg-bg border-2 border-rpg-border text-rpg-text text-sm px-4 py-3 focus:border-rpg-gold focus:outline-none transition-colors placeholder:text-rpg-dim disabled:opacity-50"
        />
      </div>

      {status === "error" && message && (
        <div className="flex items-start gap-3 border-2 border-rpg-red px-3 py-2">
          <span className="text-rpg-red shrink-0">✕</span>
          <p className="text-sm text-rpg-red leading-5">{message}</p>
        </div>
      )}

      <div className="pixel-divider" />

      <button
        type="submit"
        disabled={status === "loading"}
        className={`${status === "loading" ? "pixel-btn opacity-60 cursor-not-allowed" : "pixel-btn-gold"} w-full py-4 text-[9px] tracking-widest`}
      >
        {status === "loading" ? "█ SENDING... █" : "▶ SEND RESET LINK"}
      </button>

      <p className="text-center text-sm text-rpg-dim">
        Remembered it?{" "}
        <Link
          href="/login"
          className="text-rpg-gold hover:text-rpg-text no-underline transition-colors"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
        >
          BACK TO LOGIN
        </Link>
      </p>
    </form>
  );
}
