'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { translations } from '../i18n/translations';

type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);
LanguageContext.displayName = 'LanguageContext';

function getNestedValue(obj: any, path: string[]): string {
  let current = obj;
  for (const key of path) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return '';
    }
  }
  return typeof current === 'string' ? current : '';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en';
    
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage === 'en' || savedLanguage === 'zh') {
      return savedLanguage;
    }
    
    const browserLang = navigator.language.toLowerCase();
    return browserLang.startsWith('zh') ? 'zh' : 'en';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
    }
  }, [language]);

  const t = useCallback((key: string): string => {
    try {
      const keys = key.split('.');
      const value = getNestedValue(translations[language], keys);
      
      if (value) {
        return value;
      }

      // 如果在当前语言中找不到，尝试使用英语
      const fallbackValue = getNestedValue(translations.en, keys);
      return fallbackValue || key;
    } catch (error) {
      console.error('Translation error:', error);
      return key;
    }
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t
  };

  return React.createElement(LanguageContext.Provider, { value }, children);
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}