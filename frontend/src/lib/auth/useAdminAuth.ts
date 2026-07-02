import { useContext } from "react";

import {
  AdminAuthContext,
  type AdminAuthContextValue,
} from "@/lib/auth/adminAuthContext";

export function useAdminAuth(): AdminAuthContextValue {
  const context: AdminAuthContextValue | null = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }

  return context;
}
