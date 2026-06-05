"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiGet, apiPost, apiPatch, getUser } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getUserCostume, COSTUME_COUNT } from "@/lib/costume";

// Free costumes are now determined by the backend (CostumeConfig.isFree)

const TIER_HEX: Record<string, string> = {
  "text-rpg-dim":    "#b4b4df",
  "text-rpg-cyan":   "#40d0e0",
  "text-rpg-purple": "#c060e0",
  "text-rpg-gold":   "#f0c040",
};
function tierHex(color: string) { return TIER_HEX[color] ?? "#b4b4df"; }

interface PlayerShopData {
  gold:          number;
  ownedCostumes: string[];
  costume:       string;
}

interface CostumeConf {
  costumeId: number;
  isFree:    boolean;
  tier: { id: string; name: string; price: number; color: string };
}

export default function ShopPage() {
  const router = useRouter();
  const [data,        setData]        = useState<PlayerShopData | null>(null);
  const [configs,     setConfigs]     = useState<Record<number, CostumeConf>>({});
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState<"all" | "owned" | "available">("all");
  const [tierFilter,  setTierFilter]  = useState("All");
  const [buyingId,    setBuyingId]    = useState<string | null>(null);
  const [errorMsg,    setErrorMsg]    = useState("");
  const [confirmId,   setConfirmId]   = useState<string | null>(null);
  const [page,        setPage]        = useState(1);
  const PAGE_SIZE = 20;

  const { user, setUser } = useAuth();

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    Promise.allSettled([
      apiGet<PlayerShopData>("/players/me"),
      apiGet<CostumeConf[]>("/costume-configs"),
    ]).then(([playerRes, configRes]) => {
      if (playerRes.status === "fulfilled" && playerRes.value) {
        const d = playerRes.value;
        setData({ gold: d.gold, ownedCostumes: d.ownedCostumes ?? [], costume: d.costume });
      }
      if (configRes.status === "fulfilled" && configRes.value) {
        const map: Record<number, CostumeConf> = {};
        configRes.value.forEach((c) => { map[c.costumeId] = c; });
        setConfigs(map);
      }
    }).finally(() => setLoading(false));
  }, []);

  async function handleBuy(n: string) {
    if (!data) return;
    setBuyingId(n);
    setErrorMsg("");
    try {
      const res = await apiPost<{ gold: number; ownedCostumes: string[] }>(
        "/players/me/costume/buy", { costume: n }
      );
      setData((prev) => prev ? { ...prev, gold: res.gold, ownedCostumes: res.ownedCostumes } : prev);
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Purchase failed.");
    }
    setBuyingId(null);
  }

  async function handleEquip(n: string) {
    if (!data) return;
    try {
      await apiPatch("/players/me/costume", { costume: n });
      setData((prev) => prev ? { ...prev, costume: n } : prev);
      // Update AuthContext → NavbarAuthButton langsung re-render
      if (user) {
        const updated = { ...user, costume: n };
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
      }
    } catch { /* ignore */ }
  }

  // Build costume list
  const costumeList = Array.from({ length: COSTUME_COUNT }, (_, i) => i + 1).map((n) => {
    const id    = String(n);
    const conf  = configs[n];
    const free  = conf?.isFree ?? false;
    const price = free ? 0 : (conf?.tier.price ?? 150);
    const tier  = conf?.tier;
    const tierName = free ? "FREE" : (tier?.name?.toUpperCase() ?? "COMMON");
    const owned = free || (data?.ownedCostumes ?? []).includes(id);
    return { id, img: getUserCostume("", id), free, owned, equipped: data?.costume === id, price, tier, tierName };
  });

  const filtered = costumeList.filter((c) => {
    if (filter === "owned")     return c.owned;
    if (filter === "available") return !c.owned;
    return true;
  }).filter((c) => tierFilter === "All" || c.tierName === tierFilter);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const displayed  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const ownedCount = costumeList.filter((c) => c.owned).length;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-rpg-bg pt-14 pb-20">

        {/* ── Header ──────────────────────────────────────────────── */}
        <section className="border-b-4 border-rpg-border bg-rpg-panel px-4 py-10">
          <div className="max-w-5xl mx-auto flex items-start gap-6">
            <img src="/gem/gem-33.png" alt="Shop"
              style={{ width: 56, height: 56, imageRendering: "pixelated", objectFit: "contain", flexShrink: 0, marginTop: 4 }} />
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex items-center gap-3">
                <span className="text-rpg-dim tracking-widest"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: 8 }}>
                  THE ARMORY
                </span>
                <div className="flex-1 h-px bg-rpg-border" />
              </div>
              <h1 className="text-xl sm:text-2xl text-rpg-gold text-glow-gold text-pixel-shadow tracking-widest">
                COSTUME SHOP
              </h1>
              <p className="text-sm text-rpg-dim leading-6 max-w-xl">
                Spend your hard-earned gold on new costumes. Every costume you buy is yours permanently.
              </p>
              {/* Gold + owned count */}
              <div className="flex items-center gap-4 mt-1">
                <div className="border-2 border-rpg-border bg-rpg-bg px-4 py-2 flex items-center gap-2">
                  <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}>
                    🪙 {loading ? "—" : (data?.gold ?? 0).toLocaleString()}G
                  </span>
                  <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>GOLD</span>
                </div>
                <div className="border-2 border-rpg-border bg-rpg-bg px-4 py-2 flex items-center gap-2">
                  <span className="text-rpg-text" style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}>
                    {loading ? "—" : ownedCount}
                  </span>
                  <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 7 }}>OWNED</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Controls ─────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-4">
          {/* Row 1: ownership filter */}
          <div className="flex items-center gap-3 flex-wrap">
            {(["all", "owned", "available"] as const).map((f) => (
              <button key={f} onClick={() => { setFilter(f); setPage(1); }}
                className="px-3 py-1.5 border-2 text-[8px] tracking-wider transition-colors"
                style={{
                  fontFamily: "var(--font-pixel)",
                  borderColor: filter === f ? "#f0c040" : "#3d2d8c",
                  color:       filter === f ? "#f0c040" : "#b4b4df",
                  background:  filter === f ? "rgba(240,192,64,0.08)" : "transparent",
                }}>
                {f === "all" ? "ALL" : f === "owned" ? "OWNED" : "AVAILABLE"}
              </button>
            ))}
          </div>

          {/* Row 2: tier filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: "ALL TIERS", value: "All",       hex: "#b4b4df" },
              { label: "FREE",      value: "FREE",      hex: "#40e070" },
              { label: "COMMON",    value: "COMMON",    hex: "#b4b4df" },
              { label: "RARE",      value: "RARE",      hex: "#40d0e0" },
              { label: "EPIC",      value: "EPIC",      hex: "#c060e0" },
              { label: "LEGENDARY", value: "LEGENDARY", hex: "#f0c040" },
            ].map((t) => (
              <button key={t.value} onClick={() => { setTierFilter(t.value); setPage(1); }}
                className="px-3 py-1 border text-[7px] tracking-wider transition-colors"
                style={{
                  fontFamily: "var(--font-pixel)",
                  borderColor: tierFilter === t.value ? t.hex : "#3d2d8c",
                  color:       tierFilter === t.value ? t.hex : "#7a7ab0",
                  background:  tierFilter === t.value ? `${t.hex}15` : "transparent",
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {errorMsg && (
            <p className="text-rpg-red text-sm text-center">{errorMsg}</p>
          )}

          {/* ── Costume grid ──────────────────────────────────────── */}
          {loading ? (
            <div className="flex justify-center py-20">
              <span className="text-rpg-dim blink-slow" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>LOADING...</span>
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex justify-center py-20">
              <span className="text-rpg-dim" style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>NO COSTUMES FOUND</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {displayed.map((c) => (
                <div key={c.id}
                  className={`border-2 bg-rpg-panel flex flex-col items-center gap-2 p-2 transition-colors ${
                    c.equipped   ? "border-rpg-gold"    :
                    c.owned      ? "border-rpg-border hover:border-rpg-gold" :
                                   "border-rpg-border/40"
                  }`}>
                  {/* Costume image */}
                  <div className="relative w-full flex justify-center">
                    <img src={c.img} alt={`Costume #${c.id}`}
                      style={{ width: 120, height: 120, imageRendering: "pixelated", objectFit: "contain" }} />
                    {c.free && (
                      <span className="absolute top-0 right-0 text-rpg-green"
                        style={{ fontFamily: "var(--font-pixel)", fontSize: 6 }}>FREE</span>
                    )}
                  </div>

                  {/* Action */}
                  {c.equipped ? (
                    <div className="w-full flex items-center justify-between gap-2">
                      {c.tier && (
                        <span style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: tierHex(c.tier.color) }}>
                          {c.tier.name}
                        </span>
                      )}
                      <span className="text-[7px] border border-rpg-gold text-rpg-gold px-3 py-1 tracking-wider"
                        style={{ fontFamily: "var(--font-pixel)" }}>◆ EQUIPPED</span>
                    </div>
                  ) : c.owned ? (
                    <div className="w-full flex items-center justify-between gap-2">
                      {c.tier && (
                        <span style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: tierHex(c.tier.color) }}>
                          {c.tier?.name ?? "COMMON"}
                        </span>
                      )}
                      <button onClick={() => handleEquip(c.id)}
                        className="text-[7px] border border-rpg-green text-rpg-green px-3 py-1 tracking-wider hover:border-rpg-gold hover:text-rpg-gold transition-colors"
                        style={{ fontFamily: "var(--font-pixel)" }}>EQUIP</button>
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between gap-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-rpg-gold"
                          style={{ fontFamily: "var(--font-pixel)", fontSize: 9 }}>
                          {c.price}G
                        </span>
                        {c.tier && (
                          <span style={{ fontFamily: "var(--font-pixel)", fontSize: 6, color: tierHex(c.tier.color) }}>
                            {c.tier.name}
                          </span>
                        )}
                      </div>
                      <button onClick={() => setConfirmId(c.id)}
                        className="text-[7px] border border-rpg-cyan text-rpg-cyan px-3 py-1 tracking-wider hover:border-rpg-gold hover:text-rpg-gold transition-colors"
                        style={{ fontFamily: "var(--font-pixel)" }}>
                        BUY
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
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

      </main>
      <Footer />

      {/* ── Confirm modal ──────────────────────────────────────────── */}
      {confirmId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="pixel-panel w-full max-w-sm flex flex-col gap-5">
            {/* Preview */}
            <div className="flex items-center gap-4">
              <img
                src={getUserCostume("", confirmId)}
                alt="costume preview"
                style={{ width: 80, height: 80, imageRendering: "pixelated", objectFit: "contain", flexShrink: 0 }}
              />
              <div className="flex flex-col gap-1">
                <span className="text-rpg-text text-sm font-medium">Confirm Purchase</span>
                <span className="text-xs text-rpg-dim leading-5">
                  Buy this costume for{" "}
                  <span className="text-rpg-gold" style={{ fontFamily: "var(--font-pixel)", fontSize: 10 }}>
                    {costumeList.find((c) => c.id === confirmId)?.price ?? 0}G
                  </span>?
                </span>
                <span className="text-xs text-rpg-dim">
                  {(() => {
                    const price = costumeList.find((c) => c.id === confirmId)?.price ?? 0;
                    const gold  = data?.gold ?? 0;
                    return <>Your gold: <span className="text-rpg-gold">{gold}G</span>{" → "}<span className={gold >= price ? "text-rpg-green" : "text-rpg-red"}>{gold - price}G</span></>;
                  })()}
                </span>
              </div>
            </div>

            <div className="pixel-divider" />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmId(null)}
                className="pixel-btn text-rpg-dim text-[8px] px-4 py-2.5 tracking-widest hover:text-rpg-text"
              >
                CANCEL
              </button>
              <button
                onClick={async () => {
                  const id = confirmId;
                  setConfirmId(null);
                  await handleBuy(id);
                }}
                disabled={buyingId !== null || (data?.gold ?? 0) < (costumeList.find((c) => c.id === confirmId)?.price ?? 0)}
                className="pixel-btn-gold text-[9px] px-5 py-2.5 tracking-widest disabled:opacity-40"
              >
                {buyingId ? "BUYING..." : "CONFIRM"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
