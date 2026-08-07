"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { getAccessToken } from "./tokens";
import * as authApi from "./auth-api";
import type { User } from "./types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  loginWithFacebook: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Session restore on load — if a token exists, confirm it's still
    // valid by fetching the current user rather than trusting the
    // stored token blindly (it may have expired or been revoked
    // elsewhere, e.g. a password change on another device).
    async function restore() {
      if (!getAccessToken()) {
        setIsLoading(false);
        return;
      }
      try {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      } catch {
        // Token invalid/expired and refresh already failed inside
        // apiFetch — just proceed as logged out.
      } finally {
        setIsLoading(false);
      }
    }
    restore();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const loggedInUser = await authApi.login(email, password);
    setUser(loggedInUser);
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    const newUser = await authApi.signup(email, password, name);
    setUser(newUser);
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const loggedInUser = await authApi.loginWithGoogle(idToken);
    setUser(loggedInUser);
  }, []);

  const loginWithFacebook = useCallback(async (accessToken: string) => {
    const loggedInUser = await authApi.loginWithFacebook(accessToken);
    setUser(loggedInUser);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async (password?: string) => {
    await authApi.deleteAccount(password);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await authApi.getCurrentUser();
    setUser(currentUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        loginWithFacebook,
        logout,
        deleteAccount,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
