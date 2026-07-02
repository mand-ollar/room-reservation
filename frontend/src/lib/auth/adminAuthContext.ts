import { createContext } from "react";

export type AdminAuthContextValue = {
  isAdmin: boolean;
  isInitializing: boolean;
  isSubmitting: boolean;
  login: (password: string) => Promise<void>;
  logout: () => void;
};

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(
  null,
);
