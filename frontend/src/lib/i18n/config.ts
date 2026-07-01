import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "@/lib/i18n/locales/en.json";
import ko from "@/lib/i18n/locales/ko.json";

export type AppLanguage = "ko" | "en";

export const APP_LANGUAGES: readonly AppLanguage[] = ["ko", "en"] as const;

const isAppLanguage = (value: string): value is AppLanguage =>
  value === "ko" || value === "en";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: ko },
      en: { translation: en },
    },
    fallbackLng: "ko",
    supportedLngs: [...APP_LANGUAGES],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "room-reservation-language",
    },
  });

i18n.on("languageChanged", (language: string) => {
  const resolved: AppLanguage = isAppLanguage(language) ? language : "ko";
  document.documentElement.lang = resolved;
});

document.documentElement.lang = i18n.resolvedLanguage ?? "ko";

export { i18n };
