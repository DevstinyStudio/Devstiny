"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";

interface AdminAct { id: string; slug: string; title: string; order: number; isFinalAct: boolean; isLocked: boolean; }
interface AdminChapter {
  id: string; slug: string; title: string; realm: string; order: number;
  isLocked: boolean; type: string; typeColor: string; npcImage: string;
  estimatedHours: number; difficulty: string; rewardXp: number; rewardGold: number;
  acts: AdminAct[];
}

const DIFF_COLOR: Record<string, string> = { beginner: "#40e070", intermediate: "#f0c040", advanced: "#e05050" };

export default function AdminPathPage() {
  const [chapters, setChapters] = useState<AdminChapter[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState<AdminChapter | null>(null);
  const [confirming, setConfirming] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    apiGet<AdminChapter[]>("/admin/path")
      .then((d) => setChapters((d ?? []).sort((a, b) => a.order - b.order)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleLock(ch: AdminChapter) {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/admin/path/${ch.id}`,
        { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ isLocked: !ch.isLocked }) },
      );
      if (res.ok) setChapters((prev) => prev.map((c) => c.id === ch.id ? { ...c, isLocked: !ch.isLocked } : c));
    } catch { /* ignore */ }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setConfirming(true);
    try {
      const token = localStorage.getItem("access_token");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/admin/path/${deleting.id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      setChapters((prev) => prev.filter((c) => c.id !== deleting.id));
      setDeleting(null);
    } catch { /* ignore */ }
    setConfirming(false);
  }

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>ADMIN PANEL</p>
          <h1 className="text-2xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">PATH CHAPTERS</h1>
          <div className="w-24 pixel-divider-gold mt-1" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
            {chapters.filter((c) => !c.isLocked).length} UNLOCKED / {chapters.length} TOTAL
          </span>
          <Link href="/admin/path/new" className="pixel-btn-gold text-[9px] px-4 py-2 no-underline tracking-widest">
            + NEW CHAPTER
          </Link>
        </div>
      </div>

      {/* Chapters table */}
      <div className="pixel-panel p-0 overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-rpg-border">
              {["ORDER", "CHAPTER", "REALM", "ACTS", "DIFFICULTY", "REWARDS", "STATUS", "ACTION"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-12">
                <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>LOADING...</span>
              </td></tr>
            ) : chapters.map((ch) => (
              <tr key={ch.id} className="border-b border-rpg-border/30 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3">
                  <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>{ch.order}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-sm font-medium ${ch.typeColor}`} style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>{ch.type}</span>
                    <span className="text-rpg-text text-sm">{ch.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-rpg-dim text-xs max-w-32">{ch.realm}</td>
                <td className="px-4 py-3">
                  <span className="text-rpg-text text-sm">{ch.acts.length}</span>
                  <span className="text-rpg-dim text-xs ml-1">({ch.acts.filter((a) => a.isFinalAct).length} final)</span>
                </td>
                <td className="px-4 py-3">
                  <span className="border px-2 py-0.5 text-[8px] tracking-wide"
                    style={{ borderColor: DIFF_COLOR[ch.difficulty] ?? "#b4b4df", color: DIFF_COLOR[ch.difficulty] ?? "#b4b4df" }}>
                    {ch.difficulty.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-rpg-gold text-xs">{ch.rewardXp} XP</span>
                    <span className="text-rpg-dim text-xs">{ch.rewardGold} G · {ch.estimatedHours}h</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleLock(ch)}
                    className="border px-2 py-0.5 transition-colors"
                    style={{
                      fontFamily: "var(--font-pixel)", fontSize: 7,
                      borderColor: ch.isLocked ? "#b4b4df" : "#40e070",
                      color:       ch.isLocked ? "#b4b4df" : "#40e070",
                    }}>
                    {ch.isLocked ? "LOCKED" : "UNLOCKED"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-4">
                    <Link href={`/admin/path/${ch.id}`}
                      className="text-rpg-dim hover:text-rpg-gold no-underline transition-colors"
                      style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>EDIT</Link>
                    <button onClick={() => setDeleting(ch)}
                      className="text-rpg-dim hover:text-rpg-red transition-colors"
                      style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>DELETE</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleting && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="pixel-panel w-full max-w-md flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-rpg-red" style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}>DELETE CHAPTER</span>
              <button onClick={() => setDeleting(null)} className="text-rpg-dim hover:text-rpg-text text-xl">×</button>
            </div>
            <div className="pixel-divider" />
            <div className="flex flex-col gap-3">
              <p className="text-rpg-dim text-sm leading-6">Are you sure? This will delete the chapter and all its acts.</p>
              <div className="bg-rpg-bg border border-rpg-border px-4 py-3 flex flex-col gap-0.5">
                <span className={`font-medium ${deleting.typeColor}`} style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>{deleting.type}</span>
                <span className="text-rpg-text text-sm">{deleting.title}</span>
                <span className="text-rpg-dim text-xs">{deleting.acts.length} acts</span>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleting(null)}
                className="pixel-btn text-rpg-dim text-[8px] px-4 py-2.5 tracking-widest hover:text-rpg-text">CANCEL</button>
              <button onClick={confirmDelete} disabled={confirming}
                className="text-[9px] px-5 py-2.5 tracking-widest border border-rpg-red text-rpg-red hover:bg-rpg-red/10 transition-colors disabled:opacity-40">
                {confirming ? "DELETING..." : "▶ CONFIRM DELETE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
