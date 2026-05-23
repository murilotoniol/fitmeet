import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { register as registerRequest, signIn } from "@/api/auth";
import { getCurrentUser } from "@/api/user";
import type { RegisterPayload, SignInPayload, UserProfile } from "@/types";

import { SessionContext, type SessionContextValue } from "./session-context";

const SESSION_STORAGE_KEY = "fitmeet-session";

function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(SESSION_STORAGE_KEY);
}

function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(Boolean(getStoredToken()));

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    const loadProfile = async () => {
      try {
        const profile = await getCurrentUser(token);

        if (active) {
          setUser(profile);
        }
      } catch {
        if (active) {
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, [token]);

  const login = useCallback(async (payload: SignInPayload) => {
    const response = await signIn(payload);
    window.localStorage.setItem(SESSION_STORAGE_KEY, response.token);
    setToken(response.token);
    const profile = await getCurrentUser(response.token);
    setUser(profile);
    setLoading(false);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await registerRequest(payload);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) {
      return;
    }

    const profile = await getCurrentUser(token);
    setUser(profile);
  }, [token]);

  const value = useMemo<SessionContextValue>(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
      refreshUser,
      setUser,
    }),
    [loading, login, logout, refreshUser, register, token, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export { SessionProvider };
