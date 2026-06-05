"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import NavbarAuthButton from "./NavbarAuthButton";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const navItems = [
  { label: "PATH",   href: "/path"   },
  { label: "QUESTS", href: "/quests" },
  { label: "BOOKS",  href: "/books"  },
  { label: "FORUM",  href: "/forum"  },
  { label: "SHOP",   href: "/shop"   },
];

export default function Navbar() {
  const [logo,  setLogo]  = useState("/ui/logo5.png");
  const [title, setTitle] = useState("Devstiny");

  useEffect(() => {
    fetch(`${API}/settings`)
      .then((r) => r.json())
      .then((s: Record<string, string>) => {
        if (s.site_logo)  setLogo(s.site_logo);
        if (s.site_title) setTitle(s.site_title);
      })
      .catch(() => {});
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-rpg-bg border-b-4 border-rpg-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="no-underline flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo}
            alt={title}
            width={40}
            height={40}
            style={{ imageRendering: "pixelated", objectFit: "contain" }}
          />
          <span
            className="text-rpg-text tracking-widest"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 11 }}
          >
            {title.toUpperCase()}
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-6 list-none m-0 p-0">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="text-sm text-rpg-dim hover:text-rpg-text transition-colors no-underline tracking-widest"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <NavbarAuthButton />
      </div>
    </nav>
  );
}
