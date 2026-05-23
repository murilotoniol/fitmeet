import { createContext } from "react";

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

const SessionContext = createContext<SessionContextValue | null>(null);

export { SessionContext };
export type { SessionContextValue };
