import type { Locale } from "@/api/types";
import { useTranslation } from "react-i18next";

import type { AppLanguage } from "@/lib/i18n/config";

export function getLocalizedName(
  names: { ko: string; en: string },
  locale: Locale,
): string {
  return names[locale];
}

export function useAppLocale(): Locale {
  const { i18n } = useTranslation();
  return i18n.language === "en" ? "en" : "ko";
}

export function useAppLanguage(): {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
} {
  const { i18n } = useTranslation();

  const language: AppLanguage = i18n.language === "en" ? "en" : "ko";

  const setLanguage = (nextLanguage: AppLanguage): void => {
    void i18n.changeLanguage(nextLanguage);
  };

  return { language, setLanguage };
}
