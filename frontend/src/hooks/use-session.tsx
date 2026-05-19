/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { register as registerRequest, signIn } from "@/api/auth";
import { getCurrentUser } from "@/api/user";
import type { RegisterPayload, SignInPayload, UserProfile } from "@/types";

type SessionContextValue = {
  token: string | null;
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: SignInPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
};

const SESSION_STORAGE_KEY = "fitmeet-session";

const SessionContext = createContext<SessionContextValue | null>(null);

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

function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession deve ser usado dentro de SessionProvider.");
  }

  return context;
}

export { SessionProvider, useSession };
