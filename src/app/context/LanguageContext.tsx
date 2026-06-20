import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, TranslationKey } from '../i18n/translations';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  RM: 'RM',
  EUR: '€',
  GBP: '£',
};

export function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? code;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  currency: string;
  setCurrency: (c: string) => void;
  currencySymbol: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('finbee_userSettings');
      if (saved) return JSON.parse(saved).language || 'English';
      return 'English';
    } catch {
      return 'English';
    }
  });

  const [currency, setCurrencyState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('finbee_userSettings');
      if (saved) return JSON.parse(saved).currency || 'RM';
      return 'RM';
    } catch {
      return 'RM';
    }
  });

  // Keep in sync when settings change externally (e.g. Profile page saves)
  useEffect(() => {
    const onStorage = () => {
      try {
        const saved = localStorage.getItem('finbee_userSettings');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.language) setLanguageState(parsed.language);
          if (parsed.currency) setCurrencyState(parsed.currency);
        }
      } catch {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      const saved = localStorage.getItem('finbee_userSettings');
      const settings = saved ? JSON.parse(saved) : {};
      settings.language = lang;
      localStorage.setItem('finbee_userSettings', JSON.stringify(settings));
    } catch {}
  };

  const setCurrency = (c: string) => {
    setCurrencyState(c);
    try {
      const saved = localStorage.getItem('finbee_userSettings');
      const settings = saved ? JSON.parse(saved) : {};
      settings.currency = c;
      localStorage.setItem('finbee_userSettings', JSON.stringify(settings));
    } catch {}
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.English[key] || key;
  };

  const currencySymbol = getCurrencySymbol(currency);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currency, setCurrency, currencySymbol }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
