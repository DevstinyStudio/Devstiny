"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";

type Status = "idle" | "loading" | "success" | "error";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password,        setPassword       ] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword,    setShowPassword   ] = useState(false);
  const [status,          setStatus         ] = useState<Status>("idle");
  const [message,         setMessage        ] = useState("");

  if (!token) {
    return (
      <div className="pixel-panel flex flex-col gap-5 items-center text-center p-8">
        <span className="text-rpg-red text-3xl">✕</span>
        <p
          className="text-rpg-red tracking-widest"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}
        >
          INVALID LINK
        </p>
        <div className="w-32 pixel-divider" />
        <p className="text-sm text-rpg-dim leading-7 max-w-xs">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="pixel-btn-gold text-[9px] px-5 py-3 no-underline tracking-widest mt-2"
        >
          ▶ REQUEST NEW LINK
        </Link>
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
          PASSWORD UPDATED
        </p>
        <div className="w-32 pixel-divider-gold" />
        <p className="text-sm text-rpg-dim leading-7 max-w-xs">{message}</p>
        <button
          onClick={() => router.push("/login")}
          className="pixel-btn-gold text-[9px] px-5 py-3 tracking-widest mt-2"
        >
          ▶ GO TO LOGIN
        </button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!password) {
      setStatus("error");
      setMessage("Please enter a new password.");
      return;
    }
    if (password.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    try {
      const data = await apiPost<{ message: string }>("/auth/reset-password", {
        token,
        password,
      });
      setMessage(data.message);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const isLoading = status === "loading";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="pixel-panel pixel-panel-labeled flex flex-col gap-5"
    >
      <span className="pixel-panel-label">NEW PASSWORD</span>

      {/* New password */}
      <div className="flex flex-col gap-2 mt-2">
        <label
          htmlFor="password"
          className="text-rpg-dim tracking-widest"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
        >
          NEW PASSWORD
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isLoading}
            className="w-full bg-rpg-bg border-2 border-rpg-border text-rpg-text text-sm px-4 py-3 pr-12 focus:border-rpg-gold focus:outline-none transition-colors placeholder:text-rpg-dim disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-rpg-dim hover:text-rpg-text transition-colors"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
          >
            {showPassword ? "HIDE" : "SHOW"}
          </button>
        </div>
      </div>

      {/* Confirm password */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="confirmPassword"
          className="text-rpg-dim tracking-widest"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
        >
          CONFIRM PASSWORD
        </label>
        <input
          type={showPassword ? "text" : "password"}
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={isLoading}
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
        disabled={isLoading}
        className={`${isLoading ? "pixel-btn opacity-60 cursor-not-allowed" : "pixel-btn-gold"} w-full py-4 text-[9px] tracking-widest`}
      >
        {isLoading ? "█ SAVING... █" : "▶ SET NEW PASSWORD"}
      </button>

      <p className="text-center text-sm text-rpg-dim">
        <Link
          href="/login"
          className="text-rpg-gold hover:text-rpg-text no-underline transition-colors"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
        >
          ← BACK TO LOGIN
        </Link>
      </p>
    </form>
  );
}
