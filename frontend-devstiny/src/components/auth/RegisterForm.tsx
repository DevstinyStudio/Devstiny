"use client";

import { useState } from "react";
import Link from "next/link";
import { apiPost } from "@/lib/api";

type FormState = {
  username: string;
  email: string;
  password: string;
  confirm: string;
};

type Status = "idle" | "loading" | "error" | "success";

export default function RegisterForm() {
  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [status,   setStatus  ] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPass, setShowPass] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (status === "error") setStatus("idle");
  }

  function validate(): string | null {
    if (!form.username.trim())        return "Username is required.";
    if (form.username.length < 3)     return "Username must be at least 3 characters.";
    if (!form.email.trim())           return "Email address is required.";
    if (!form.email.includes("@"))    return "Enter a valid email address.";
    if (!form.password)               return "Password is required.";
    if (form.password.length < 8)     return "Password must be at least 8 characters.";
    if (form.password !== form.confirm) return "Passwords do not match.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    const err = validate();
    if (err) { setStatus("error"); setErrorMsg(err); return; }

    setStatus("loading");
    try {
      await apiPost<{ message: string }>("/auth/register", {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Registration failed.");
    }
  }

  if (status === "success") {
    return (
      <div className="pixel-panel flex flex-col gap-5 items-center text-center p-8">
        <span className="text-rpg-gold text-3xl">✉</span>
        <p
          className="text-rpg-gold tracking-widest"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}
        >
          CHECK YOUR EMAIL
        </p>
        <div className="w-32 pixel-divider-gold" />
        <p className="text-sm text-rpg-dim leading-7 max-w-xs">
          A verification link has been sent to{" "}
          <span className="text-rpg-text">{form.email}</span>.
          Click the link to activate your account.
        </p>
        <p className="text-xs text-rpg-dim">The link expires in 24 hours.</p>
        <Link
          href="/login"
          className="pixel-btn text-rpg-dim text-[8px] px-5 py-3 no-underline tracking-widest hover:text-rpg-text mt-2"
        >
          ← BACK TO LOGIN
        </Link>
      </div>
    );
  }

  const isLoading = status === "loading";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="pixel-panel pixel-panel-labeled flex flex-col gap-5"
    >
      <span className="pixel-panel-label">NEW CHARACTER</span>

      {/* Username */}
      <div className="flex flex-col gap-2 mt-2">
        <label
          htmlFor="username"
          className="text-rpg-dim tracking-widest"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
        >
          USERNAME
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="CoolDeveloper99"
          autoComplete="username"
          minLength={3}
          maxLength={24}
          disabled={isLoading}
          className="w-full bg-rpg-bg border-2 border-rpg-border text-rpg-text text-sm px-4 py-3 focus:border-rpg-gold focus:outline-none transition-colors placeholder:text-rpg-dim disabled:opacity-50"
        />
      </div>

      {/* Email */}
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
        <label
          htmlFor="password"
          className="text-rpg-dim tracking-widest"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
        >
          PASSWORD
        </label>
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            minLength={8}
            disabled={isLoading}
            className="w-full bg-rpg-bg border-2 border-rpg-border text-rpg-text text-sm px-4 py-3 pr-12 focus:border-rpg-gold focus:outline-none transition-colors placeholder:text-rpg-dim disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowPass((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-rpg-dim hover:text-rpg-text transition-colors"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
          >
            {showPass ? "HIDE" : "SHOW"}
          </button>
        </div>
      </div>

      {/* Confirm password */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="confirm"
          className="text-rpg-dim tracking-widest"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
        >
          CONFIRM PASSWORD
        </label>
        <input
          type={showPass ? "text" : "password"}
          id="confirm"
          name="confirm"
          value={form.confirm}
          onChange={handleChange}
          placeholder="Repeat your password"
          autoComplete="new-password"
          disabled={isLoading}
          className="w-full bg-rpg-bg border-2 border-rpg-border text-rpg-text text-sm px-4 py-3 focus:border-rpg-gold focus:outline-none transition-colors placeholder:text-rpg-dim disabled:opacity-50"
        />
      </div>

      <div className="pixel-divider" />

      {status === "error" && errorMsg && (
        <div className="flex items-start gap-3 border-2 border-rpg-red px-3 py-2">
          <span className="text-rpg-red shrink-0">✕</span>
          <p className="text-sm text-rpg-red leading-5">{errorMsg}</p>
        </div>
      )}

      <div className="pixel-divider" />

      <button
        type="submit"
        disabled={isLoading}
        className={`${isLoading ? "pixel-btn opacity-60 cursor-not-allowed" : "pixel-btn-primary"} w-full py-4 text-[9px] tracking-widest`}
      >
        {isLoading ? "█ CREATING CHARACTER... █" : "▶ CREATE CHARACTER"}
      </button>

      <p className="text-center text-sm text-rpg-dim">
        Already an adventurer?{" "}
        <Link
          href="/login"
          className="text-rpg-gold hover:text-rpg-text no-underline transition-colors"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
        >
          SIGN IN
        </Link>
      </p>
    </form>
  );
}
