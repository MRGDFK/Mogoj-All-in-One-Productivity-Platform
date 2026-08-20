"use client";

import { createContext, useContext } from "react";
import type { AuthUser } from "@mogoj/shared";
import { useMe } from "@/hooks/useAuth";

interface AuthContextValue {
  user: AuthUser | null | undefined;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: undefined, isLoading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useMe();

  return <AuthContext.Provider value={{ user: user ?? null, isLoading }}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  return useContext(AuthContext);
}
