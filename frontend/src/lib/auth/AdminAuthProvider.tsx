import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { loginAdmin, refreshAuthTokens } from "@/api/auth";
import { ApiError } from "@/api/client";
import {
  AdminAuthContext,
  type AdminAuthContextValue,
} from "@/lib/auth/adminAuthContext";
import {
  clearStoredAdminTokens,
  getStoredAdminTokens,
  setStoredAdminTokens,
} from "@/lib/auth/adminStorage";

type AdminAuthProviderProps = {
  children: ReactNode;
};

async function restoreAdminSession(): Promise<boolean> {
  const storedTokens = getStoredAdminTokens();

  if (!storedTokens) {
    return false;
  }

  try {
    const refreshedTokens = await refreshAuthTokens(storedTokens.refreshToken);
    setStoredAdminTokens({
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token,
    });
    return true;
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      clearStoredAdminTokens();
      return false;
    }

    clearStoredAdminTokens();
    return false;
  }
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    let isActive: boolean = true;

    void restoreAdminSession().then((restored: boolean) => {
      if (isActive) {
        setIsAdmin(restored);
        setIsInitializing(false);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  const login = useCallback(async (password: string) => {
    setIsSubmitting(true);

    try {
      const tokens = await loginAdmin({ password });
      setStoredAdminTokens({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });
      setIsAdmin(true);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearStoredAdminTokens();
    setIsAdmin(false);
  }, []);

  const value: AdminAuthContextValue = useMemo(
    () => ({
      isAdmin,
      isInitializing,
      isSubmitting,
      login,
      logout,
    }),
    [isAdmin, isInitializing, isSubmitting, login, logout],
  );

  return (
    <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
  );
}
