import { createContext, useContext, useState, ReactNode } from "react";
import enData from "../locales/en.json";
import itData from "../locales/it.json";

export type LanguageCode = "en" | "it" | "es" | "zh" | "ja" | "de" | "fr" | "ru";

interface LanguageData {
  code: LanguageCode;
  name: string;
  [key: string]: unknown;
}

interface LanguageContextType {
  language: LanguageCode;
  t: LanguageData;
  setLanguage: (lang: LanguageCode) => void;
  isLoading: boolean;
}

const translations: Record<LanguageCode, LanguageData> = {
  en: enData,
  it: itData,
  es: enData,
  zh: enData,
  ja: enData,
  de: enData,
  fr: enData,
  ru: enData,
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ 
  children, 
  initialLanguage = "en" 
}: { 
  children: ReactNode;
  initialLanguage?: LanguageCode;
}) {
  const [language, setLanguageState] = useState<LanguageCode>(initialLanguage);

  const t = translations[language] || translations.en;

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("burner_language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage, isLoading: false }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

export const supportedLanguages: { code: LanguageCode; name: string }[] = [
  { code: "en", name: "English" },
  { code: "it", name: "Italiano" },
  { code: "es", name: "Español" },
  { code: "zh", name: "中文" },
  { code: "ja", name: "日本語" },
  { code: "de", name: "Deutsch" },
  { code: "fr", name: "Français" },
  { code: "ru", name: "Русский" },
];

export function getLanguageFromPath(path: string): LanguageCode {
  if (path.startsWith("/it") || path === "/it") return "it";
  if (path.startsWith("/es") || path === "/es") return "es";
  if (path.startsWith("/zh") || path === "/zh") return "zh";
  if (path.startsWith("/ja") || path === "/ja") return "ja";
  if (path.startsWith("/de") || path === "/de") return "de";
  if (path.startsWith("/fr") || path === "/fr") return "fr";
  if (path.startsWith("/ru") || path === "/ru") return "ru";
  return "en";
}