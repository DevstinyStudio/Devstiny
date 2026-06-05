"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiPost, saveSession, type AuthResponse } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type FormState = { email: string; password: string };
type Status = "idle" | "loading" | "error" | "unverified";

export default function LoginForm() {
  const router = useRouter();
  const { user, ready, setUser } = useAuth();

  useEffect(() => {
    if (ready && user) router.replace("/");
  }, [ready, user, router]);

  const [form,     setForm    ] = useState<FormState>({ email: "", password: "" });
  const [status,   setStatus  ] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "sent">("idle");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (status === "error" || status === "unverified") setStatus("idle");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!form.email.trim() || !form.password) {
      setStatus("error");
      setErrorMsg("All fields are required.");
      return;
    }

    setStatus("loading");
    try {
      const data = await apiPost<AuthResponse>("/auth/login", {
        email: form.email,
        password: form.password,
      });
      saveSession(data);
      setUser(data.user);
      router.push("/path");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed.";
      if (msg === "EMAIL_NOT_VERIFIED") {
        setStatus("unverified");
      } else {
        setStatus("error");
        setErrorMsg(msg);
      }
    }
  }

  async function handleResend() {
    setResendStatus("loading");
    try {
      await apiPost("/auth/resend-verification", { email: form.email });
      setResendStatus("sent");
    } catch {
      setResendStatus("sent"); // always show success to avoid leaking info
    }
  }

  const isLoading = status === "loading";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="pixel-panel pixel-panel-labeled flex flex-col gap-5"
    >
      <span className="pixel-panel-label">SAVE FILE #1</span>

      {/* Email */}
      <div className="flex flex-col gap-2 mt-2">
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
          value={form.email}
          onChange={handleChange}
          placeholder="hero@devstiny.com"
          autoComplete="email"
          disabled={isLoading}
          className="w-full bg-rpg-bg border-2 border-rpg-border text-rpg-text text-sm px-4 py-3 focus:border-rpg-gold focus:outline-none transition-colors placeholder:text-rpg-dim disabled:opacity-50"
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-rpg-dim tracking-widest"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
          >
            PASSWORD
          </label>
          <Link
            href="/forgot-password"
            className="text-rpg-dim hover:text-rpg-gold no-underline transition-colors"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
          >
            FORGOT?
          </Link>
        </div>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isLoading}
            className="w-full bg-rpg-bg border-2 border-rpg-border text-rpg-text text-sm px-4 py-3 pr-12 focus:border-rpg-gold focus:outline-none transition-colors placeholder:text-rpg-dim disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-rpg-dim hover:text-rpg-text transition-colors text-xs"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
          >
            {showPassword ? "HIDE" : "SHOW"}
          </button>
        </div>
      </div>

      {/* Generic error */}
      {status === "error" && errorMsg && (
        <div className="flex items-start gap-3 border-2 border-rpg-red px-3 py-2">
          <span className="text-rpg-red shrink-0">✕</span>
          <p className="text-sm text-rpg-red leading-5">{errorMsg}</p>
        </div>
      )}

      {/* Email not verified */}
      {status === "unverified" && (
        <div className="flex flex-col gap-3 border-2 border-rpg-gold px-4 py-3">
          <div className="flex items-start gap-3">
            <span className="text-rpg-gold shrink-0">✉</span>
            <div>
              <p className="text-sm text-rpg-gold leading-5 mb-1">Email not verified</p>
              <p className="text-xs text-rpg-dim leading-5">
                Check your inbox for the verification link. Didn&apos;t receive it?
              </p>
            </div>
          </div>
          {resendStatus === "sent" ? (
            <p className="text-xs text-rpg-cyan" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
              ✓ NEW LINK SENT — CHECK YOUR INBOX
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendStatus === "loading"}
              className="pixel-btn text-rpg-gold border-rpg-gold text-[8px] px-3 py-2 tracking-widest self-start disabled:opacity-50"
            >
              {resendStatus === "loading" ? "SENDING..." : "RESEND VERIFICATION EMAIL"}
            </button>
          )}
        </div>
      )}

      <div className="pixel-divider" />

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className={`${isLoading ? "pixel-btn opacity-60 cursor-not-allowed" : "pixel-btn-gold"} w-full py-4 text-[9px] tracking-widest`}
      >
        {isLoading ? "█ LOADING... █" : "▶ ENTER THE REALM"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 pixel-divider" />
        <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>OR</span>
        <div className="flex-1 pixel-divider" />
      </div>

      {/* Register */}
      <p className="text-center text-sm text-rpg-dim">
        New adventurer?{" "}
        <Link
          href="/register"
          className="text-rpg-gold hover:text-rpg-text no-underline transition-colors"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
        >
          CREATE ACCOUNT
        </Link>
      </p>
    </form>
  );
}
