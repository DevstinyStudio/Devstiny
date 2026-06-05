"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getUser, apiGet, type AuthResponse } from "@/lib/api";

type User = AuthResponse["user"] | null;

type AuthCtx = {
  user: User;
  ready: boolean;
  setUser: (u: User) => void;
};

const AuthContext = createContext<AuthCtx>({ user: null, ready: false, setUser: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = getUser();
    if (!stored) { setReady(true); return; }

    // Seed stored value immediately so UI doesn't flash
    setUser(stored);

    // Then refresh from backend to get up-to-date role + costume
    apiGet<{ id: string; username: string; email: string; role: string; costume: string }>("/players/me")
      .then((me) => {
        const updated = { ...stored, role: me.role, costume: me.costume ?? stored.costume ?? "1" };
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
      })
      .catch(() => {
        // Network error — keep stored but ensure costume has a fallback
        if (!stored.costume) {
          const withDefault = { ...stored, costume: "1" };
          setUser(withDefault);
          localStorage.setItem("user", JSON.stringify(withDefault));
        }
      })
      .finally(() => setReady(true));
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
