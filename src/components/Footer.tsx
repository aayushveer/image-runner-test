import React from 'react';

interface FooterProps {
  theme: 'dark' | 'light';
  t: (key: string, params?: any) => string;
}

export function Footer({ theme, t }: FooterProps) {
  return (
    <footer
      className={`py-8 border-t transition-colors duration-200 text-center text-xs leading-relaxed ${
        theme === 'dark' ? 'bg-[#131314] border-[#2d2f31] text-[#80868b]' : 'bg-[#f8f9fa] border-[#dadce0] text-[#5f6368]'
      }`}
      role="contentinfo"
    >
      <div className="container mx-auto px-4 max-w-4xl space-y-3">
        {/* Brand tagline */}
        <p className="font-medium">
          <strong className="text-[#1a73e8] dark:text-[#8ab4f8]">ImgRunner</strong> — {t('footer.tagline')}
        </p>

        {/* Footer navigation links — semantic for SEO */}
        <nav className="flex justify-center gap-3 pt-1 flex-wrap" aria-label="Footer navigation">
          <span className="font-medium">{t('footer.copyright')}</span>
          <span aria-hidden="true">·</span>
          <a
            href="#faq"
            className="hover:text-[#1a73e8] dark:hover:text-[#8ab4f8] transition-colors font-semibold"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('faq');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {t('footer.faq')}
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="#how"
            className="hover:text-[#1a73e8] dark:hover:text-[#8ab4f8] transition-colors font-semibold"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('how');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {t('footer.how')}
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="#presets"
            className="hover:text-[#1a73e8] dark:hover:text-[#8ab4f8] transition-colors font-semibold"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('presets');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {t('nav.presets')}
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="#features"
            className="hover:text-[#1a73e8] dark:hover:text-[#8ab4f8] transition-colors font-semibold"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('features');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {t('nav.features')}
          </a>
        </nav>

        {/* Privacy notice */}
        <p className="text-[10px] opacity-75">{t('footer.privacy')}</p>

        {/* SEO-rich hidden microdata */}
        <div className="sr-only" aria-hidden="true">
          <span itemScope itemType="https://schema.org/WebApplication">
            <meta itemProp="name" content="ImgRunner" />
            <meta itemProp="url" content="https://imgrunner.com" />
            <meta itemProp="applicationCategory" content="MultimediaApplication" />
            <meta itemProp="operatingSystem" content="All" />
          </span>
        </div>
      </div>
    </footer>
  );
}
