'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { translations } from '../i18n/translations';

type Language = 'en' | 'zh';

interface Translations {
  [key: string]: any;
}

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => any;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 获取初始语言
const getInitialLanguage = (): Language => {
  // 如果在服务器端，默认返回英语
  if (typeof window === 'undefined') {
    return 'en';
  }

  // 客户端逻辑
  const savedLanguage = localStorage.getItem('language') as Language;
  if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zh')) {
    return savedLanguage;
  }
  
  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('zh') ? 'zh' : 'en';
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [mounted, setMounted] = useState(false);

  // 仅在客户端执行的初始化
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
    }
  }, [language]);

  const t = useCallback((key: string) => {
    try {
      const keys = key.split('.');
      let value: any = translations[language] as Translations;
      for (const k of keys) {
        value = value[k];
      }
      return value;
    } catch (error) {
      console.error(`Translation key not found: ${key}`);
      return key;
    }
  }, [language]);

  // 在服务器端或初始客户端渲染时使用英语
  if (!mounted) {
    return (
      <LanguageContext.Provider 
        value={{ 
          language: 'en',
          setLanguage: () => {},
          t: (key: string) => {
            const keys = key.split('.');
            let value = translations['en'];
            for (const k of keys) {
              value = value[k];
            }
            return value;
          }
        }}
      >
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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