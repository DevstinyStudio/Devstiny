"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const links: Record<string, { label: string; href: string }[]> = {
  EXPLORE: [
    { label: "PATH",       href: "/path"      },
    { label: "QUESTS",     href: "/quests"    },
    { label: "BOOKS",      href: "/books"     },
    { label: "FORUM",      href: "/forum"     },
    { label: "SHOP",       href: "/shop"      },
    { label: "WHAT'S NEW", href: "/whats-new" },
  ],
  ACCOUNT: [
    { label: "PROFILE",   href: "/profile"   },
    { label: "INVENTORY", href: "/profile"   },
    { label: "LOGIN",     href: "/login"     },
    { label: "REGISTER",  href: "/register"  },
  ],
  COMMUNITY: [
    { label: "THE ORACLE",        href: "/forum/category/oracle"            },
    { label: "HALL OF CHAMPIONS", href: "/forum/category/hall-of-champions" },
    { label: "GUILD BOARD",       href: "/forum/category/guild-board"       },
    { label: "THE TAVERN",        href: "/forum/category/tavern"            },
  ],
};

export default function Footer() {
  const [logo,        setLogo]        = useState("/ui/logo5.png");
  const [title,       setTitle]       = useState("Devstiny");
  const [description, setDescription] = useState(
    "The pixel-art RPG platform for learning to code. Complete quests, earn XP, and master programming."
  );

  useEffect(() => {
    fetch(`${API}/settings`)
      .then((r) => r.json())
      .then((s: Record<string, string>) => {
        if (s.site_logo)        setLogo(s.site_logo);
        if (s.site_title)       setTitle(s.site_title);
        if (s.site_description) setDescription(s.site_description);
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="border-t-4 border-rpg-border bg-rpg-panel">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
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
            <p className="text-sm text-rpg-dim leading-6">
              {description}
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group} className="flex flex-col gap-4">
              <span
                className="text-rpg-gold tracking-widest"
                style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}
              >
                {group}
              </span>
              <div className="pixel-divider-gold w-12" />
              <ul className="flex flex-col gap-3 list-none m-0 p-0">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-rpg-dim hover:text-rpg-text transition-colors no-underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t-4 border-rpg-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-rpg-dim text-xs">
            © 2026 {title}. All rights reserved.
          </span>
          <span
            className="text-rpg-dim blink-slow"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
          >
            ★ SAVE PROGRESS ★
          </span>
        </div>
      </div>
    </footer>
  );
}
