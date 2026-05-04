"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PublicUser } from "@/lib/types";
import { fetchMe, loginRequest, logoutRequest, registerRequest } from "@/lib/api";
import {
  clearTokens,
  getStoredUserJson,
  setStoredUser,
  setTokens,
} from "@/lib/storage";

type AuthState = {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const { user: u } = await fetchMe();
      setUser(u);
      setStoredUser(JSON.stringify(u));
    } catch {
      setUser(null);
      clearTokens();
    }
  }, []);

  useEffect(() => {
    const raw = getStoredUserJson();
    if (raw) {
      try {
        setUser(JSON.parse(raw) as PublicUser);
      } catch {
        clearTokens();
      }
    }
    void (async () => {
      try {
        await refreshUser();
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginRequest(email, password);
    setTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
    setStoredUser(JSON.stringify(res.user));
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const res = await registerRequest(email, password);
    setTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
    setStoredUser(JSON.stringify(res.user));
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
