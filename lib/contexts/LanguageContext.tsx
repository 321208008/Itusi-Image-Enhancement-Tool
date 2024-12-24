'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/i18n/translations';

type Language = 'en' | 'zh';

type TranslationsType = typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getNestedValue(obj: any, path: string[]): string | undefined {
  let current = obj;
  for (const key of path) {
    if (current === undefined || current === null || !(key in current)) {
      return undefined;
    }
    current = current[key];
  }
  return current;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<Language>('zh');

  useEffect(() => {
    // 从 localStorage 读取语言设置
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage === 'en' || savedLanguage === 'zh') {
      setLanguage(savedLanguage);
    }
    setMounted(true);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    try {
      const keys = key.split('.');
      const value = getNestedValue(translations[language], keys);
      
      if (value !== undefined) {
        return String(value);
      }

      // 如果在当前语言中找不到，尝试使用英语
      console.warn(`Translation key not found: ${key}`);
      const fallbackValue = getNestedValue(translations.en, keys);
      return fallbackValue !== undefined ? String(fallbackValue) : key;
    } catch (error) {
      console.error('Translation error:', error);
      return key;
    }
  };

  // 在客户端渲染之前返回空内容
  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}