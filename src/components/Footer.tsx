import React from 'react';

interface FooterProps {
  theme: 'dark' | 'light';
  t: (key: string, params?: any) => string;
}

export function Footer({ theme, t }: FooterProps) {
  return (
    <footer className={`py-8 border-t transition-colors duration-200 text-center text-xs leading-relaxed ${
      theme === 'dark' ? 'bg-[#131314] border-[#2d2f31] text-[#80868b]' : 'bg-[#f8f9fa] border-[#dadce0] text-[#5f6368]'
    }`}>
      <div className="container mx-auto px-4 max-w-4xl space-y-2.5">
        <p className="font-medium">
          <strong className="text-[#1a73e8] dark:text-[#8ab4f8]">ImgRunner</strong> — {t('footer.tagline')}
        </p>
        <div className="flex justify-center gap-3 pt-1">
          <a href="#faq" className="hover:text-[#1a73e8] dark:hover:text-[#8ab4f8] transition-colors font-semibold">{t('footer.faq')}</a>
          <span>·</span>
          <a href="#how" className="hover:text-[#1a73e8] dark:hover:text-[#8ab4f8] transition-colors font-semibold">{t('footer.how')}</a>
          <span>·</span>
          <span className="font-medium">{t('footer.copyright')}</span>
        </div>
        <p className="text-[10px] opacity-75">{t('footer.privacy')}</p>
      </div>
    </footer>
  );
}
