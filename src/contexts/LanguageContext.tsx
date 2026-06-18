import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

function detectInitialLanguage(): LanguageCode {
  try {
    const stored = localStorage.getItem("burner_language") as LanguageCode;
    if (stored && translations[stored]) return stored;
  } catch {}

  try {
    const langParam = new URLSearchParams(window.location.search).get("lang") as LanguageCode;
    if (langParam && translations[langParam]) return langParam;
  } catch {}

  try {
    const browserLangs = navigator.languages || [navigator.language];
    for (const lang of browserLangs) {
      const prefix = lang.split("-")[0].toLowerCase();
      const langCode = prefix as LanguageCode;
      if (translations[langCode]) return langCode;
    }
  } catch {}

  return "en";
}

export function LanguageProvider({ 
  children, 
  initialLanguage
}: { 
  children: ReactNode;
  initialLanguage?: LanguageCode;
}) {
  const [language, setLanguageState] = useState<LanguageCode>(
    initialLanguage || detectInitialLanguage()
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