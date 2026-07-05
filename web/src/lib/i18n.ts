// i18n configuration for agent-meow.
// Uses react-i18next with EN and ZH locales out of the box.
// The language is persisted in localStorage and defaults to the browser's
// preferred language (navigator.language), falling back to English.

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import zh from "./locales/zh-CN.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "zh-CN", label: "中文", flag: "🇨🇳" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

const STORAGE_KEY = "agent-meow.language";

function detectInitialLanguage(): string {
  // 1. Check localStorage
  const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
  if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
    return stored;
  }
  // 2. Check browser language
  if (typeof navigator !== "undefined") {
    const navLang = navigator.language;
    if (navLang.startsWith("zh")) return "zh-CN";
  }
  // 3. Default to English
  return "en";
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    "zh-CN": { translation: zh },
  },
  lng: detectInitialLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already escapes
  },
});

export function changeLanguage(code: LanguageCode): void {
  void i18n.changeLanguage(code);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, code);
  }
}

export function getCurrentLanguage(): LanguageCode {
  const lng = i18n.language;
  return SUPPORTED_LANGUAGES.some((l) => l.code === lng) ? (lng as LanguageCode) : "en";
}

export default i18n;