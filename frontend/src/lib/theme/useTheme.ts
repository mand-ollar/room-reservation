import { useContext } from "react";

import { ThemeContext, type ThemeContextValue } from "@/lib/theme/themeContext";

export function useTheme(): ThemeContextValue {
  const context: ThemeContextValue | null = useContext(ThemeContext);
  if (context === null) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
