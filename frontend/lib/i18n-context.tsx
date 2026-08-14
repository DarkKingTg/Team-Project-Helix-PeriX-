"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import en from "@/messages/en.json";
import hi from "@/messages/hi.json";
import ta from "@/messages/ta.json";
import te from "@/messages/te.json";
import kn from "@/messages/kn.json";
import ml from "@/messages/ml.json";
import mr from "@/messages/mr.json";
import bn from "@/messages/bn.json";
import gu from "@/messages/gu.json";

export type Locale = "en" | "hi" | "ta" | "te" | "kn" | "ml" | "mr" | "bn" | "gu";

export const localeNames: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
  ta: "தமிழ்",
  te: "తెలుగు",
  kn: "ಕನ್ನಡ",
  ml: "മലയാളം",
  mr: "मराठी",
  bn: "বাংলা",
  gu: "ગુજરાતી",
};

const translations: Record<Locale, Record<string, any>> = {
  en,
  hi,
  ta,
  te,
  kn,
  ml,
  mr,
  bn,
  gu,
};

interface I18nContextType {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: (path: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (path: string, fallback?: string) => fallback || path,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Read language preference from cookie / localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      let activeLocale: Locale = "en";
      const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
      if (match && match[1] && (match[1] in translations)) {
        activeLocale = match[1] as Locale;
      } else {
        const stored = localStorage.getItem("NEXT_LOCALE") as Locale;
        if (stored && (stored in translations)) {
          activeLocale = stored;
        }
      }
      setLocaleState(activeLocale);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      localStorage.setItem("NEXT_LOCALE", newLocale);
    }
  }, []);

  const t = useCallback(
    (path: string, fallback?: string): string => {
      const keys = path.split(".");
      let current: any = translations[locale] || translations.en;

      for (const k of keys) {
        if (current && typeof current === "object" && k in current) {
          current = current[k];
        } else {
          // Fallback to English dictionary
          let enCurrent: any = translations.en;
          for (const ek of keys) {
            if (enCurrent && typeof enCurrent === "object" && ek in enCurrent) {
              enCurrent = enCurrent[ek];
            } else {
              enCurrent = undefined;
              break;
            }
          }
          if (typeof enCurrent === "string") return enCurrent;
          return fallback || path;
        }
      }

      if (typeof current === "string") return current;
      return fallback || path;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
