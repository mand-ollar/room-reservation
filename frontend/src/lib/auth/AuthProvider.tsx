import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  fetchCurrentUser,
  loginUser,
  refreshAuthTokens,
} from "@/api/auth";
import { ApiError } from "@/api/client";
import type { UserResponse } from "@/api/types";
import { AuthContext, type AuthContextValue } from "@/lib/auth/authContext";
import {
  clearStoredTokens,
  getStoredTokens,
  setStoredTokens,
} from "@/lib/auth/storage";

type AuthProviderProps = {
  children: ReactNode;
};

async function loadUserFromTokens(): Promise<UserResponse | null> {
  const storedTokens = getStoredTokens();

  if (!storedTokens) {
    return null;
  }

  try {
    return await fetchCurrentUser(storedTokens.accessToken);
  } catch (error: unknown) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      clearStoredTokens();
      return null;
    }
  }

  try {
    const refreshedTokens = await refreshAuthTokens(storedTokens.refreshToken);
    setStoredTokens({
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token,
    });
    return await fetchCurrentUser(refreshedTokens.access_token);
  } catch {
    clearStoredTokens();
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    let isActive: boolean = true;

    void loadUserFromTokens().then((loadedUser: UserResponse | null) => {
      if (isActive) {
        setUser(loadedUser);
        setIsInitializing(false);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  const login = useCallback(async (name: string, phone: string) => {
    setIsSubmitting(true);

    try {
      const tokens = await loginUser({ name, phone });
      setStoredTokens({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });
      const currentUser: UserResponse = await fetchCurrentUser(
        tokens.access_token,
      );
      setUser(currentUser);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearStoredTokens();
    setUser(null);
  }, []);

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      isInitializing,
      isSubmitting,
      login,
      logout,
    }),
    [user, isInitializing, isSubmitting, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
