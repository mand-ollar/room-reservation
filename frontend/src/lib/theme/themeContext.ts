import { createContext } from "react";

import type { Theme, ThemePreference } from "@/lib/theme/storage";

export type ThemeContextValue = {
  theme: Theme;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
