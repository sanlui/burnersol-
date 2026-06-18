import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import enData from "../locales/en.json";
import itData from "../locales/it.json";

export type LanguageCode = "en" | "it" | "es" | "fr" | "de" | "pt" | "ru" | "tr" | "nl" | "ar" | "ko" | "zh";

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
  hreflangLinks: { lang: string; path: string }[];
}

const translations: Record<LanguageCode, LanguageData> = {
  en: enData,
  it: itData,
  es: enData,
  fr: enData,
  de: enData,
  pt: enData,
  ru: enData,
  tr: enData,
  nl: enData,
  ar: enData,
  ko: enData,
  zh: enData,
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function getLanguageFromPath(path: string): LanguageCode {
  if (!path) return "en";
  const segments = path.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();
  
  const langMap: Record<string, LanguageCode> = {
    "en": "en",
    "it": "it",
    "es": "es",
    "fr": "fr",
    "de": "de",
    "pt": "pt",
    "ru": "ru",
    "tr": "tr",
    "nl": "nl",
    "ar": "ar",
    "ko": "ko",
    "zh": "zh",
  };
  
  return langMap[firstSegment || ""] || "en";
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

export const supportedLanguages: { code: LanguageCode; hreflang: string; name: string }[] = [
  { code: "en", hreflang: "en", name: "English" },
  { code: "it", hreflang: "it", name: "Italiano" },
  { code: "es", hreflang: "es", name: "Español" },
  { code: "fr", hreflang: "fr", name: "Français" },
  { code: "de", hreflang: "de", name: "Deutsch" },
  { code: "pt", hreflang: "pt", name: "Português" },
  { code: "ru", hreflang: "ru", name: "Русский" },
  { code: "tr", hreflang: "tr", name: "Türkçe" },
  { code: "nl", hreflang: "nl", name: "Nederlands" },
  { code: "ar", hreflang: "ar", name: "العربية" },
  { code: "ko", hreflang: "ko", name: "한국어" },
  { code: "zh", hreflang: "zh", name: "中文" },
];

const hreflangLinks = supportedLanguages.map(l => ({
  lang: l.hreflang,
  path: l.code === "en" ? "/" : `/${l.code}/`
}));

export function LanguageProvider({ 
  children, 
  initialLanguage,
  initialPath = "/"
}: { 
  children: ReactNode;
  initialLanguage?: LanguageCode;
  initialPath?: string;
}) {
  const [language, setLanguageState] = useState<LanguageCode>(
    initialLanguage || getLanguageFromPath(initialPath)
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language] || translations.en;

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("burner_language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage, isLoading: false, hreflangLinks }}>
      {children}
    </LanguageContext.Provider>
  );
}