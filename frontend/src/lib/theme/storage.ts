export type Theme = "light" | "dark";

export type ThemePreference = Theme | "system";

export const THEME_STORAGE_KEY = "room-reservation-theme";

export function readStoredThemePreference(): ThemePreference {
  const value: string | null = localStorage.getItem(THEME_STORAGE_KEY);
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }
  return "system";
}

export function writeStoredThemePreference(preference: ThemePreference): void {
  localStorage.setItem(THEME_STORAGE_KEY, preference);
}

export function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveTheme(preference: ThemePreference): Theme {
  if (preference === "system") {
    return getSystemTheme();
  }
  return preference;
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}
