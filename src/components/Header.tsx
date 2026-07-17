import React from 'react';
import { ArrowLeft, Image as ImageIcon, Sun, Moon } from 'lucide-react';
import { LANGUAGES, type Language } from '../i18n';

interface HeaderProps {
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  lang: Language;
  setLang: (l: Language) => void;
  activePage: 'upload' | 'edit' | 'done';
  setActivePage: (p: 'upload' | 'edit' | 'done') => void;
  resetAll: () => void;
  t: (key: string, params?: any) => string;
}

// Smooth scroll to anchor helper
const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  e.preventDefault();
  const targetId = href.replace('#', '');
  const el = document.getElementById(targetId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  // Update URL hash without jumping
  window.history.pushState(null, '', href);
};

export function Header({
  theme,
  setTheme,
  lang,
  setLang,
  activePage,
  setActivePage,
  resetAll,
  t
}: HeaderProps) {
  return (
    <header className={`sticky top-0 z-40 border-b transition-all duration-200 ${
      theme === 'dark' ? 'bg-[#1e1f20]/95 border-[#2d2f31]' : 'bg-white/95 border-[#dadce0]'
    } backdrop-blur-md`} role="banner">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {activePage !== 'upload' && (
            <button
              onClick={() => {
                if (activePage === 'done') {
                  setActivePage('edit');
                } else {
                  resetAll();
                }
              }}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                theme === 'dark' ? 'hover:bg-[#2d2f31] text-[#c4c7c5]' : 'hover:bg-[#f1f3f4] text-[#444746]'
              }`}
              aria-label={t('nav.back')}
            >
              <ArrowLeft className="w-5 h-5 stroke-[2]" />
            </button>
          )}

          {/* Logo with semantic linking */}
          <a
            href="/"
            className="flex items-center gap-2.5 select-none no-underline"
            aria-label="ImgRunner Home — Free Online Image Resizer"
            title="ImgRunner Home"
          >
            <div className="flex items-center justify-center w-8.5 h-8.5 rounded-lg bg-[#1a73e8] text-white">
              <ImageIcon className="w-5 h-5 stroke-[1.75]" aria-hidden="true" />
            </div>
            <span
              id="header-logo-text"
              className="font-display font-extrabold text-[22px] tracking-tight bg-gradient-to-r from-[#1a73e8] to-[#1557b0] dark:from-[#8ab4f8] dark:to-[#e3e3e3] bg-clip-text text-transparent"
            >
              ImgRunner
            </span>
            <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f1f3f4] dark:bg-[#2d2f31] text-slate-600 dark:text-[#c4c7c5] border border-[#dadce0]/80 dark:border-[#444746]/80">
              {t('brand.badge')}
            </span>
          </a>
        </div>

        {/* Main Navigation with semantic roles */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium" aria-label={t('nav.tools')}>
          <a
            href="#features"
            onClick={(e) => smoothScroll(e, '#features')}
            className={`px-3.5 py-1.5 rounded-full transition-colors ${
              theme === 'dark' ? 'text-[#c4c7c5] hover:text-white hover:bg-[#2d2f31]' : 'text-[#444746] hover:text-[#1f1f1f] hover:bg-[#f1f3f4]'
            }`}
          >
            {t('nav.features')}
          </a>
          <a
            href="#presets"
            onClick={(e) => smoothScroll(e, '#presets')}
            className={`px-3.5 py-1.5 rounded-full transition-colors ${
              theme === 'dark' ? 'text-[#c4c7c5] hover:text-white hover:bg-[#2d2f31]' : 'text-[#444746] hover:text-[#1f1f1f] hover:bg-[#f1f3f4]'
            }`}
          >
            {t('nav.presets')}
          </a>
          <a
            href="#how"
            onClick={(e) => smoothScroll(e, '#how')}
            className={`px-3.5 py-1.5 rounded-full transition-colors ${
              theme === 'dark' ? 'text-[#c4c7c5] hover:text-white hover:bg-[#2d2f31]' : 'text-[#444746] hover:text-[#1f1f1f] hover:bg-[#f1f3f4]'
            }`}
          >
            {t('nav.how')}
          </a>
          <a
            href="#faq"
            onClick={(e) => smoothScroll(e, '#faq')}
            className={`px-3.5 py-1.5 rounded-full transition-colors ${
              theme === 'dark' ? 'text-[#c4c7c5] hover:text-white hover:bg-[#2d2f31]' : 'text-[#444746] hover:text-[#1f1f1f] hover:bg-[#f1f3f4]'
            }`}
          >
            {t('nav.faq')}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {/* Language Dropdown */}
          <div className="relative">
            <label htmlFor="lang-select" className="sr-only">{t('nav.language')}</label>
            <select
              id="lang-select"
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
              className={`py-1.5 px-3 pr-8 rounded-full text-xs font-semibold appearance-none bg-no-repeat cursor-pointer border transition-colors ${
                theme === 'dark'
                  ? 'bg-[#1e1f20] text-[#e3e3e3] border-[#444746] hover:border-[#8ab4f8]'
                  : 'bg-white text-[#1f1f1f] border-[#dadce0] hover:border-[#1a73e8]'
              }`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${theme === 'dark' ? '%23c4c7c5' : '%23444746'}' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`
              }}
            >

              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className={theme === 'dark' ? 'bg-[#1e1f20]' : 'bg-white'}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dark/Light Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#1e1f20] border-[#444746] hover:bg-[#2d2f31] text-yellow-400'
                : 'bg-white border-[#dadce0] hover:bg-[#f1f3f4] text-[#444746]'
            }`}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5" aria-hidden="true" /> : <Moon className="w-4.5 h-4.5" aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}
