"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPatch, getUser } from "@/lib/api";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  progress: { xp: number; gold: number; completedChapters: string[] } | null;
  _count: { forumThreads: number; forumReplies: number };
}

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function AdminUsersPage() {
  const [users,    setUsers]    = useState<AdminUser[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState("");
  const [query,    setQuery]    = useState("");
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const LIMIT     = 15;
  const currentId = getUser()?.id;

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (query) params.set("search", query);
    apiGet<{ players: AdminUser[]; total: number }>(`/admin/users?${params}`)
      .then((d) => { setUsers(d?.players ?? []); setTotal(d?.total ?? 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, query]);

  useEffect(() => { load(); }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  }

  async function toggleRole(user: AdminUser) {
    if (user.id === currentId) return;
    setUpdating(user.id);
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    try {
      await apiPatch(`/admin/users/${user.id}`, { role: newRole });
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u));
    } catch { /* ignore */ }
    setUpdating(null);
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
          ADMIN PANEL
        </p>
        <h1 className="text-2xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">
          USERS
        </h1>
        <div className="w-16 pixel-divider-gold mt-1" />
      </div>

      {/* Search + count */}
      <div className="flex items-center gap-4 flex-wrap">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-sm">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username or email..."
            className="flex-1 bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors placeholder:text-rpg-border"
          />
          <button type="submit" className="pixel-btn text-rpg-dim text-[8px] px-4 py-2 tracking-widest hover:text-rpg-text">
            SEARCH
          </button>
        </form>
        <span className="text-rpg-dim ml-auto" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
          {loading ? "—" : `${total} USERS`}
        </span>
      </div>

      {/* Table */}
      <div className="pixel-panel p-0 overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-rpg-border">
              {["USER", "EMAIL", "ROLE", "XP", "CHAPTERS", "THREADS", "JOINED", "ACTION"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-rpg-dim"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                    LOADING...
                  </span>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-rpg-dim text-sm">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-rpg-border/30 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-rpg-text text-sm font-medium">{u.username}</span>
                    {u.id === currentId && (
                      <span className="ml-2 text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}>(YOU)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-rpg-dim text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 border text-xs"
                      style={{
                        fontFamily: "var(--font-pixel)",
                        fontSize: 7,
                        color:       u.role === "ADMIN" ? "#f0c040" : "#b4b4df",
                        borderColor: u.role === "ADMIN" ? "#f0c040" : "#3d2d8c",
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-rpg-dim text-xs">
                    {(u.progress?.xp ?? 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-rpg-dim text-xs">
                    {u.progress?.completedChapters?.length ?? 0}
                  </td>
                  <td className="px-4 py-3 text-rpg-dim text-xs">
                    {u._count.forumThreads + u._count.forumReplies}
                  </td>
                  <td className="px-4 py-3 text-rpg-dim text-xs">{timeAgo(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleRole(u)}
                      disabled={updating === u.id || u.id === currentId}
                      className="text-rpg-dim hover:text-rpg-gold transition-colors disabled:opacity-30"
                      style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}
                      title={u.role === "ADMIN" ? "Demote to User" : "Promote to Admin"}
                    >
                      {updating === u.id ? "..." : u.role === "ADMIN" ? "DEMOTE" : "PROMOTE"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="pixel-btn text-rpg-dim text-[8px] px-4 py-2 tracking-widest disabled:opacity-30">
            ← PREV
          </button>
          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
            {page} / {totalPages}
          </span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="pixel-btn text-rpg-dim text-[8px] px-4 py-2 tracking-widest disabled:opacity-30">
            NEXT →
          </button>
        </div>
      )}
    </div>
  );
}
