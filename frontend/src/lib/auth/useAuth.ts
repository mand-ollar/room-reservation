import { useContext } from "react";

import { AuthContext, type AuthContextValue } from "@/lib/auth/authContext";

export function useAuth(): AuthContextValue {
  const context: AuthContextValue | null = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
