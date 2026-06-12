import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, TranslationKey } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('finbee_userSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.language || 'English';
      }
      return 'English';
    } catch (error) {
      console.error('Error loading language:', error);
      return 'English';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);

    // Save to localStorage
    try {
      const saved = localStorage.getItem('finbee_userSettings');
      const settings = saved ? JSON.parse(saved) : {};
      settings.language = lang;
      localStorage.setItem('finbee_userSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.English[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
