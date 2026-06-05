"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { apiGet, apiPatch } from "@/lib/api";

interface AdminBook {
  id: string; slug: string; volume: string; title: string; subtitle: string;
  author: string; description: string; color: string; border: string;
  icon: string; defaultLang: string; status: string; order: number;
  chapters: { id: string; title: string; order: number }[];
}

const STATUS_COLOR = { available: "#40e070", "coming-soon": "#b4b4df" };
const LANG_OPTIONS = ["html", "css", "javascript", "text"];

export default function AdminBooksPage() {
  const [books,      setBooks]      = useState<AdminBook[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [editBook,   setEditBook]   = useState<AdminBook | null>(null);
  const [saving,     setSaving]     = useState(false);
  const [deleteBook, setDeleteBook] = useState<AdminBook | null>(null);
  const [deleting,   setDeleting]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    apiGet<AdminBook[]>("/admin/books")
      .then((d) => setBooks(d ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleStatus(book: AdminBook) {
    const newStatus = book.status === "available" ? "coming-soon" : "available";
    try {
      const updated = await apiPatch<AdminBook>(`/admin/books/${book.id}`, { status: newStatus });
      setBooks((prev) => prev.map((b) => b.id === updated.id ? { ...b, status: updated.status } : b));
    } catch { /* ignore */ }
  }

  async function saveEdit() {
    if (!editBook) return;
    setSaving(true);
    try {
      const updated = await apiPatch<AdminBook>(`/admin/books/${editBook.id}`, {
        title: editBook.title, subtitle: editBook.subtitle,
        author: editBook.author, description: editBook.description,
        defaultLang: editBook.defaultLang, order: editBook.order,
      });
      setBooks((prev) => prev.map((b) => b.id === updated.id ? { ...b, ...updated } : b));
      setEditBook(null);
    } catch { /* ignore */ }
    setSaving(false);
  }

  async function confirmDelete() {
    if (!deleteBook) return;
    setDeleting(true);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/admin/books/${deleteBook.id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } },
      );
      setBooks((prev) => prev.filter((b) => b.id !== deleteBook.id));
      setDeleteBook(null);
    } catch { /* ignore */ }
    setDeleting(false);
  }

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>ADMIN PANEL</p>
          <h1 className="text-2xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">BOOKS</h1>
          <div className="w-16 pixel-divider-gold mt-1" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
            {books.filter((b) => b.status === "available").length} AVAILABLE / {books.length} TOTAL
          </span>
          <Link href="/admin/books/new" className="pixel-btn-gold text-[9px] px-4 py-2 no-underline tracking-widest">
            + NEW BOOK
          </Link>
        </div>
      </div>

      {/* Books table */}
      <div className="pixel-panel p-0 overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-rpg-border">
              {["VOLUME", "TITLE", "AUTHOR", "LANG", "CHAPTERS", "STATUS", "ACTION"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12">
                <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>LOADING...</span>
              </td></tr>
            ) : books.map((b) => (
              <tr key={b.id} className="border-b border-rpg-border/30 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3">
                  <span className={`text-sm font-medium ${b.color}`} style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>{b.volume}</span>
                </td>
                <td className="px-4 py-3 text-rpg-text text-sm max-w-48">{b.title}</td>
                <td className="px-4 py-3 text-rpg-dim text-xs">{b.author}</td>
                <td className="px-4 py-3 text-rpg-dim text-xs font-mono">{b.defaultLang}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-rpg-text text-sm">{b.chapters.length}</span>
                    <Link href={`/admin/books/${b.id}/chapters`}
                      className="text-rpg-dim hover:text-rpg-cyan no-underline transition-colors"
                      style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>MANAGE</Link>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleStatus(b)}
                    className="border px-2 py-0.5 transition-colors"
                    style={{
                      fontFamily: "var(--font-pixel)", fontSize: 7,
                      borderColor: STATUS_COLOR[b.status as keyof typeof STATUS_COLOR] ?? "#b4b4df",
                      color:       STATUS_COLOR[b.status as keyof typeof STATUS_COLOR] ?? "#b4b4df",
                    }}>
                    {b.status === "available" ? "AVAILABLE" : "COMING SOON"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-4">
                    <Link href={`/admin/books/${b.id}`}
                      className="text-rpg-dim hover:text-rpg-gold no-underline transition-colors"
                      style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>EDIT</Link>
                    <button onClick={() => setDeleteBook(b)}
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
      {deleteBook && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="pixel-panel w-full max-w-md flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-rpg-red" style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}>DELETE BOOK</span>
              <button onClick={() => setDeleteBook(null)} className="text-rpg-dim hover:text-rpg-text text-xl">×</button>
            </div>
            <div className="pixel-divider" />

            <div className="flex flex-col gap-3">
              <p className="text-rpg-dim text-sm leading-6">
                Are you sure you want to delete this book? This action cannot be undone and will also delete all chapters.
              </p>
              <div className="bg-rpg-bg border border-rpg-border px-4 py-3 flex flex-col gap-0.5">
                <span className={`font-medium ${deleteBook.color}`} style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>{deleteBook.volume}</span>
                <span className="text-rpg-text text-sm">{deleteBook.title}</span>
                <span className="text-rpg-dim text-xs">{deleteBook.chapters.length} chapter{deleteBook.chapters.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteBook(null)}
                className="pixel-btn text-rpg-dim text-[8px] px-4 py-2.5 tracking-widest hover:text-rpg-text">CANCEL</button>
              <button onClick={confirmDelete} disabled={deleting}
                className="text-[9px] px-5 py-2.5 tracking-widest border border-rpg-red text-rpg-red hover:bg-rpg-red/10 transition-colors disabled:opacity-40">
                {deleting ? "DELETING..." : "▶ CONFIRM DELETE"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editBook && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="pixel-panel w-full max-w-lg flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className={`font-medium ${editBook.color}`} style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}>
                {editBook.volume} — EDIT
              </span>
              <button onClick={() => setEditBook(null)} className="text-rpg-dim hover:text-rpg-text text-xl">×</button>
            </div>
            <div className="pixel-divider" />

            <div className="flex flex-col gap-4">
              {[
                { label: "TITLE",    key: "title" },
                { label: "SUBTITLE", key: "subtitle" },
                { label: "AUTHOR",   key: "author" },
              ].map(({ label, key }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>{label}</label>
                  <input value={(editBook as Record<string, unknown>)[key] as string}
                    onChange={(e) => setEditBook({ ...editBook, [key]: e.target.value })}
                    className="bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2" />
                </div>
              ))}

              <div className="flex flex-col gap-1.5">
                <label className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>DESCRIPTION</label>
                <textarea value={editBook.description} rows={3}
                  onChange={(e) => setEditBook({ ...editBook, description: e.target.value })}
                  className="bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>DEFAULT LANG</label>
                  <select value={editBook.defaultLang} onChange={(e) => setEditBook({ ...editBook, defaultLang: e.target.value })}
                    className="bg-rpg-bg border-2 border-rpg-border text-rpg-text text-sm px-3 py-2 outline-none">
                    {LANG_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>ORDER</label>
                  <input type="number" value={editBook.order}
                    onChange={(e) => setEditBook({ ...editBook, order: parseInt(e.target.value) || 0 })}
                    className="bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditBook(null)}
                className="pixel-btn text-rpg-dim text-[8px] px-4 py-2.5 tracking-widest hover:text-rpg-text">CANCEL</button>
              <button onClick={saveEdit} disabled={saving}
                className="pixel-btn-gold text-[9px] px-5 py-2.5 tracking-widest disabled:opacity-40">
                {saving ? "SAVING..." : "SAVE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
