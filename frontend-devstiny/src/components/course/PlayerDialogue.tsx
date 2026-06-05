"use client";

import { useAuth } from "@/context/AuthContext";
import { getUserCostume } from "@/lib/costume";

export default function PlayerDialogue({ lines }: { lines: string[] }) {
  const { user } = useAuth();
  const displayName = user?.username ?? "PLAYER";
  const costume     = user?.costume;

  return (
    <div
      className="pixel-panel pixel-panel-labeled flex gap-4 my-6"
      style={{ borderColor: "#2A4A6A" }}
    >
      <span
        className="pixel-panel-label"
        style={{
          fontFamily: "var(--font-pixel)",
          fontSize: 7,
          color: "#4a8ac4",
          borderColor: "#2A4A6A",
        }}
      >
        PLAYER
      </span>

      <div className="shrink-0 mt-2">
        <img
          src={getUserCostume(displayName, costume)}
          alt="Player"
          style={{
            imageRendering: "pixelated",
            width: 96,
            height: 96,
            objectFit: "contain",
          }}
        />
      </div>

      <div className="flex flex-col gap-2 flex-1 mt-2">
        <div className="flex flex-row items-center gap-1">
          <span
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 12,
              color: "#4a8ac4",
            }}
          >
            {displayName}
          </span>
        </div>
        <div className="pixel-divider" style={{ borderColor: "#2A4A6A" }} />
        <div className="flex flex-col gap-2">
          {lines.map((line, i) => (
            <p
              key={i}
              className="text-sm leading-6"
              style={{ color: "#b0c8e8" }}
            >
              &ldquo;{line}&rdquo;
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
