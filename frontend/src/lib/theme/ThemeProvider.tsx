import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  applyTheme,
  getSystemTheme,
  readStoredThemePreference,
  resolveTheme,
  writeStoredThemePreference,
  type Theme,
  type ThemePreference,
} from "@/lib/theme/storage";
import { ThemeContext, type ThemeContextValue } from "@/lib/theme/themeContext";

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(
    () => readStoredThemePreference(),
  );
  const [theme, setTheme] = useState<Theme>(() =>
    resolveTheme(readStoredThemePreference()),
  );

  useEffect(() => {
    const resolved: Theme = resolveTheme(themePreference);
    setTheme(resolved);
    applyTheme(resolved);
    writeStoredThemePreference(themePreference);
  }, [themePreference]);

  useEffect(() => {
    if (themePreference !== "system") {
      return;
    }

    const mediaQuery: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (): void => {
      const resolved: Theme = getSystemTheme();
      setTheme(resolved);
      applyTheme(resolved);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [themePreference]);

  const setThemePreference = useCallback((preference: ThemePreference): void => {
    setThemePreferenceState(preference);
  }, []);

  const value: ThemeContextValue = useMemo(
    () => ({
      theme,
      themePreference,
      setThemePreference,
    }),
    [theme, themePreference, setThemePreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
