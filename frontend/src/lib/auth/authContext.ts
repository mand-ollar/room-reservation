import { createContext } from "react";

import type { UserResponse } from "@/api/types";

export type AuthContextValue = {
  user: UserResponse | null;
  isInitializing: boolean;
  isSubmitting: boolean;
  login: (name: string, phone: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
