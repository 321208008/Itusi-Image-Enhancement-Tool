'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';

export function Header() {
  const { t } = useLanguage();
  
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 text-primary">
            <Image
              src="/logo.svg"
              alt="Itusi Logo"
              width={32}
              height={32}
              className="w-full h-full"
            />
          </div>
          <h1 className="text-xl font-semibold">{t('title')}</h1>
        </Link>
        <div className="flex items-center space-x-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}