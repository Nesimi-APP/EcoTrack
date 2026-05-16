import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import { Language, Translations, translations } from "@/i18n/translations";

const STORAGE_KEY = "@ecotrack_language";
const DEFAULT_LANG: Language = "az";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: DEFAULT_LANG,
  setLanguage: async () => {},
  t: translations[DEFAULT_LANG],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<Language>(DEFAULT_LANG);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored && stored in translations) {
        setLang(stored as Language);
      }
    });
  }, []);

  const setLanguage = async (lang: Language) => {
    setLang(lang);
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t: translations[language] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
