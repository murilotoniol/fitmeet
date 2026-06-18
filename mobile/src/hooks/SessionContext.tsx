import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {signIn, register as registerRequest} from '../api/auth';
import {getCurrentUser} from '../api/user';
import {getToken, removeToken, saveToken} from '../api/client';
import type {RegisterPayload, SignInPayload, UserProfile} from '../types';

type SessionContextValue = {
  token: string | null;
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: SignInPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function SessionProvider({children}: {children: ReactNode}) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        const storedToken = await getToken();

        if (!storedToken) {
          if (active) {
            setLoading(false);
          }
          return;
        }

        setToken(storedToken);
        const profile = await getCurrentUser();

        if (active) {
          setUser(profile);
        }
      } catch {
        if (active) {
          await removeToken();
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    restoreSession().catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (payload: SignInPayload) => {
    const response = await signIn(payload);
    await saveToken(response.token);
    setToken(response.token);
    const profile = await getCurrentUser();
    setUser(profile);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await registerRequest(payload);
  }, []);

  const logout = useCallback(async () => {
    await removeToken();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) {
      return;
    }
    const profile = await getCurrentUser();
    setUser(profile);
  }, [token]);

  const value = useMemo<SessionContextValue>(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      refreshUser,
      setUser,
    }),
    [loading, login, logout, refreshUser, register, token, user],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export {SessionContext, SessionProvider};
export type {SessionContextValue};
