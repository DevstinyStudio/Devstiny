"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { clearSession } from "@/lib/api";
import { getUserCostume } from "@/lib/costume";

export default function NavbarAuthButton() {
  const { user, ready, setUser } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleLogout() {
    clearSession();
    setUser(null);
    setOpen(false);
    router.push("/");
  }

  if (!ready) {
    return (
      <div className="w-24 h-8 opacity-0 pointer-events-none select-none" />
    );
  }

  if (user) {
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((p) => !p)}
          className="flex items-center gap-2 hover:opacity-80 hover:cursor-pointer transition-opacity h-14"
        >
          {/* Username */}
          <span
            className="text-white tracking-wider"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}
          >
            {user.username}
          </span>
          {/* Half-body sprite — flipped horizontally */}
          <div className="overflow-hidden shrink-0" style={{ width: 40, height: 52, marginLeft: -4, marginBottom: 4 }}>
            <img
              src={getUserCostume(user.username, user.costume)}
              alt="character"
              style={{
                width: 40,
                height: 104,
                objectFit: "cover",
                objectPosition: "top center",
                imageRendering: "pixelated",
                transform: "scaleX(-1)",
              }}
            />
          </div>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 z-50 flex flex-col border-4 border-rpg-border bg-rpg-panel min-w-35">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-rpg-dim hover:text-rpg-gold hover:bg-rpg-bg no-underline transition-colors border-b-2 border-rpg-border"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
            >
              ◈ PROFILE
            </Link>
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-rpg-gold hover:text-rpg-text hover:bg-rpg-bg no-underline transition-colors border-b-2 border-rpg-border"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
              >
                ▦ DASHBOARD
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-3 text-rpg-dim hover:text-rpg-red hover:bg-rpg-bg transition-colors text-left cursor-pointer"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
            >
              ✕ LOGOUT
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="pixel-btn-gold text-[9px] px-4 py-2 no-underline tracking-wider"
    >
      LOGIN
    </Link>
  );
}
