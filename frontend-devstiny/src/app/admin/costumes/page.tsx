"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPatch, apiPost } from "@/lib/api";

const TIER_COLOR_HEX: Record<string, string> = {
  "text-rpg-dim":    "#b4b4df",
  "text-rpg-cyan":   "#40d0e0",
  "text-rpg-purple": "#c060e0",
  "text-rpg-gold":   "#f0c040",
};

const TIER_COLORS = Object.entries(TIER_COLOR_HEX).map(([value, hex]) => ({ value, hex }));

interface Tier { id: string; name: string; price: number; color: string; order: number }
interface CostumeConf { costumeId: number; isFree: boolean; tier: Tier }

export default function AdminCostumesPage() {
  const [tiers,    setTiers]    = useState<Tier[]>([]);
  const [configs,  setConfigs]  = useState<CostumeConf[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [editTier, setEditTier] = useState<Tier | null>(null);
  const [saving,   setSaving]   = useState(false);

  // Bulk selection
  const [selected,    setSelected]    = useState<Set<number>>(new Set());
  const [bulkTierId,  setBulkTierId]  = useState("");
  const [bulkSaving,  setBulkSaving]  = useState(false);

  // Filter
  const [filterTier, setFilterTier] = useState("ALL");
  const [page,       setPage]       = useState(1);
  const PAGE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    const [t, c] = await Promise.all([
      apiGet<Tier[]>("/admin/costume-tiers"),
      apiGet<CostumeConf[]>("/admin/costume-configs"),
    ]);
    setTiers(t ?? []);
    setConfigs(c ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Tier edit ──────────────────────────────────────────────────────────
  async function saveTier() {
    if (!editTier) return;
    setSaving(true);
    try {
      const updated = await apiPatch<Tier>(`/admin/costume-tiers/${editTier.id}`, {
        price: editTier.price,
        color: editTier.color,
      });
      setTiers((prev) => prev.map((t) => t.id === updated.id ? updated : t));
      setEditTier(null);
    } catch { /* ignore */ }
    setSaving(false);
  }

  // ── Individual costume toggle free ────────────────────────────────────
  async function toggleFree(costumeId: number, isFree: boolean) {
    try {
      const updated = await apiPatch<CostumeConf>(`/admin/costume-configs/${costumeId}`, { isFree });
      setConfigs((prev) => prev.map((c) => c.costumeId === costumeId ? updated : c));
    } catch { /* ignore */ }
  }

  // ── Individual costume tier change ────────────────────────────────────
  async function changeTier(costumeId: number, tierId: string) {
    try {
      const updated = await apiPatch<CostumeConf>(`/admin/costume-configs/${costumeId}`, { tierId });
      setConfigs((prev) => prev.map((c) => c.costumeId === costumeId ? updated : c));
    } catch { /* ignore */ }
  }

  // ── Bulk assign ────────────────────────────────────────────────────────
  async function bulkAssign() {
    if (!bulkTierId || selected.size === 0) return;
    setBulkSaving(true);
    try {
      await apiPost("/admin/costume-configs/bulk-tier", {
        costumeIds: [...selected],
        tierId: bulkTierId,
      });
      await load();
      setSelected(new Set());
    } catch { /* ignore */ }
    setBulkSaving(false);
  }

  // ── Filter + pagination ────────────────────────────────────────────────
  const filtered = configs.filter((c) =>
    filterTier === "ALL" ? true : c.tier.name === filterTier
  );
  const totalPages   = Math.ceil(filtered.length / PAGE);
  const paginated    = filtered.slice((page - 1) * PAGE, page * PAGE);

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map((c) => c.costumeId)));
    }
  }

  return (
    <div className="p-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
          ADMIN PANEL
        </p>
        <h1 className="text-2xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">COSTUMES</h1>
        <div className="w-20 pixel-divider-gold mt-1" />
      </div>

      {/* ── Tier cards ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <span className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
          TIERS
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {tiers.map((tier) => (
            <div key={tier.id} className="pixel-panel flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-medium" style={{ color: TIER_COLOR_HEX[tier.color] ?? "#b4b4df", fontFamily: "var(--font-pixel)", fontSize: 9 }}>
                  {tier.name}
                </span>
                <button onClick={() => setEditTier({ ...tier })}
                  className="text-rpg-dim hover:text-rpg-gold transition-colors"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                  EDIT
                </button>
              </div>
              <span style={{ fontFamily: "var(--font-pixel)", fontSize: 18, color: TIER_COLOR_HEX[tier.color] ?? "#b4b4df" }}>
                {tier.price}G
              </span>
              <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
                {configs.filter((c) => c.tier.id === tier.id).length} costumes
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Costume grid ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-rpg-dim tracking-widest" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
            COSTUMES ({filtered.length})
          </span>
          <div className="flex-1 h-px bg-rpg-border hidden sm:block" />

          {/* Filter by tier */}
          {["ALL", ...tiers.map((t) => t.name)].map((t) => (
            <button key={t} onClick={() => { setFilterTier(t); setPage(1); setSelected(new Set()); }}
              className="px-2 py-1 border transition-colors"
              style={{
                fontFamily: "var(--font-pixel)", fontSize: 7,
                borderColor: filterTier === t ? "#f0c040" : "#3d2d8c",
                color:       filterTier === t ? "#f0c040" : "#b4b4df",
              }}>
              {t}
            </button>
          ))}
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 border-2 border-rpg-gold bg-rpg-panel">
            <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
              {selected.size} SELECTED
            </span>
            <select value={bulkTierId} onChange={(e) => setBulkTierId(e.target.value)}
              className="bg-rpg-bg border-2 border-rpg-border text-rpg-text text-xs px-2 py-1 outline-none">
              <option value="">Select tier...</option>
              {tiers.map((t) => (
                <option key={t.id} value={t.id}>{t.name} — {t.price}G</option>
              ))}
            </select>
            <button onClick={bulkAssign} disabled={!bulkTierId || bulkSaving}
              className="pixel-btn-gold text-[8px] px-4 py-1.5 tracking-widest disabled:opacity-40">
              {bulkSaving ? "SAVING..." : "APPLY"}
            </button>
            <button onClick={() => setSelected(new Set())}
              className="text-rpg-dim hover:text-rpg-text transition-colors"
              style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
              CANCEL
            </button>
          </div>
        )}

        {/* Select all row */}
        <div className="flex items-center gap-3">
          <button onClick={selectAll}
            className="text-rpg-dim hover:text-rpg-gold transition-colors"
            style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>
            {selected.size === paginated.length ? "DESELECT ALL" : "SELECT ALL"}
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>LOADING...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {paginated.map((c) => {
              const tierColor = TIER_COLOR_HEX[c.tier.color] ?? "#b4b4df";
              const isSelected = selected.has(c.costumeId);
              return (
                <div key={c.costumeId}
                  className="border-2 bg-rpg-panel flex flex-col gap-2 p-2 cursor-pointer transition-colors"
                  style={{ borderColor: isSelected ? "#f0c040" : tierColor + "60" }}
                  onClick={() => toggleSelect(c.costumeId)}>
                  {/* Costume image */}
                  <div className="relative flex justify-center">
                    <img src={`/costume/costume-${c.costumeId}.png`} alt={`#${c.costumeId}`}
                      style={{ width: 120, height: 120, imageRendering: "pixelated", objectFit: "contain" }} />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="text-rpg-gold text-xl">✓</span>
                      </div>
                    )}
                  </div>

                  {/* Tier badge */}
                  <span className="text-center text-[7px]" style={{ color: tierColor, fontFamily: "var(--font-pixel)" }}>
                    {c.tier.name}
                  </span>

                  {/* Controls */}
                  <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                    {/* Tier select */}
                    <select value={c.tier.id}
                      onChange={(e) => changeTier(c.costumeId, e.target.value)}
                      className="bg-rpg-bg border border-rpg-border text-rpg-dim text-[9px] px-1 py-0.5 outline-none w-full">
                      {tiers.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>

                    {/* Free toggle */}
                    <button onClick={() => toggleFree(c.costumeId, !c.isFree)}
                      className="w-full text-[7px] border px-1 py-0.5 transition-colors"
                      style={{
                        fontFamily: "var(--font-pixel)",
                        borderColor: c.isFree ? "#40e070" : "#3d2d8c",
                        color:       c.isFree ? "#40e070" : "#b4b4df",
                      }}>
                      {c.isFree ? "✓ FREE" : "PAID"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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

      {/* ── Edit Tier Modal ──────────────────────────────────────────── */}
      {editTier && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="pixel-panel w-full max-w-sm flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="font-medium" style={{ color: TIER_COLOR_HEX[editTier.color], fontFamily: "var(--font-pixel)", fontSize: 10 }}>
                EDIT — {editTier.name}
              </span>
              <button onClick={() => setEditTier(null)} className="text-rpg-dim hover:text-rpg-text text-xl">×</button>
            </div>

            <div className="pixel-divider" />

            <div className="flex flex-col gap-4">
              {/* Price */}
              <div className="flex flex-col gap-1.5">
                <label className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>PRICE (GOLD)</label>
                <input type="number" min={0} value={editTier.price}
                  onChange={(e) => setEditTier({ ...editTier, price: parseInt(e.target.value) || 0 })}
                  className="bg-rpg-bg border-2 border-rpg-border focus:border-rpg-gold outline-none text-rpg-text text-sm px-3 py-2 transition-colors" />
              </div>

              {/* Color */}
              <div className="flex flex-col gap-1.5">
                <label className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>COLOR</label>
                <div className="flex gap-2">
                  {TIER_COLORS.map((c) => (
                    <button key={c.value} onClick={() => setEditTier({ ...editTier, color: c.value })}
                      className="w-8 h-8 border-2 transition-colors"
                      style={{
                        background: c.hex,
                        borderColor: editTier.color === c.value ? "#f0c040" : "#3d2d8c",
                      }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditTier(null)}
                className="pixel-btn text-rpg-dim text-[8px] px-4 py-2.5 tracking-widest hover:text-rpg-text">
                CANCEL
              </button>
              <button onClick={saveTier} disabled={saving}
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
