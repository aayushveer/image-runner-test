import React from 'react';
import { Plus } from 'lucide-react';
import { PRESETS } from '../data/presets';
import { SEOExtras } from './SEOExtras';
import { PresetItem } from '../types';

interface UploadScreenProps {
  theme: 'dark' | 'light';
  lang: string;
  t: (key: string, params?: any) => string;
  handleFilesSelected: (files: FileList | null) => void;
  handlePresetClick: (preset: PresetItem) => void;
}

export function UploadScreen({
  theme,
  lang,
  t,
  handleFilesSelected,
  handlePresetClick
}: UploadScreenProps) {
  const isDark = theme === 'dark';

  return (
    <div className="w-full flex-1 flex flex-col justify-center py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        {/* Main H1 Heading */}
        <h1
          id="upload-main-title"
          className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-5 max-w-3xl mx-auto text-slate-900 dark:text-white"
        >
          {t('upload.title')}
        </h1>

        {/* Hero Description — uses t() for full i18n support */}
        <p
          className={`text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed font-normal ${
            isDark ? 'text-[#c4c7c5]' : 'text-slate-600'
          }`}
        >
          {t('upload.description')}
        </p>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-10" role="list">
          {[
            { key: 'trust.private', icon: '🔒' },
            { key: 'trust.fast', icon: '⚡' },
            { key: 'trust.unlimited', icon: '∞' },
            { key: 'trust.free', icon: '🆓' },
          ].map((badge) => (
            <span
              key={badge.key}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border ${
                isDark
                  ? 'bg-[#1e1f20] border-[#3c4043] text-[#e3e3e3]'
                  : 'bg-white border-[#dadce0] text-slate-700'
              } shadow-sm`}
              role="listitem"
            >
              {badge.icon} {t(badge.key)}
            </span>
          ))}
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add(
              'bg-[#e8f0fe]', 'dark:bg-[#202124]',
              'border-[#1a73e8]', 'dark:border-[#8ab4f8]'
            );
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove(
              'bg-[#e8f0fe]', 'dark:bg-[#202124]',
              'border-[#1a73e8]', 'dark:border-[#8ab4f8]'
            );
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove(
              'bg-[#e8f0fe]', 'dark:bg-[#202124]',
              'border-[#1a73e8]', 'dark:border-[#8ab4f8]'
            );
            if (e.dataTransfer?.files) handleFilesSelected(e.dataTransfer.files);
          }}
          className={`mx-auto max-w-xl p-10 sm:p-14 rounded-3xl border border-dashed cursor-pointer transition-all duration-200 ${
            isDark
              ? 'bg-[#1e1f20] border-[#3c4043] hover:border-[#8ab4f8]'
              : 'bg-slate-50 border-[#dadce0] hover:border-[#1a73e8] hover:bg-[#e8f0fe]/40 shadow-sm'
          }`}
          onClick={() => document.getElementById('file-input-main')?.click()}
          role="button"
          tabIndex={0}
          aria-label={t('upload.select')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              document.getElementById('file-input-main')?.click();
            }
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-3.5 rounded-full bg-[#1a73e8]/10 text-[#1a73e8] dark:text-[#8ab4f8]">
              <Plus className="w-8 h-8 stroke-[2]" aria-hidden="true" />
            </div>
            <span className="font-display font-semibold text-base sm:text-lg text-[#1a73e8] dark:text-[#8ab4f8]">
              {t('upload.select')}
            </span>
            <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-[#9aa0a6]' : 'text-slate-600'}`}>
              {t('upload.dropHint')}
            </p>
            <input
              type="file"
              id="file-input-main"
              accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/heic,image/heif"
              multiple
              hidden
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
            <p
              className={`text-[11px] font-medium leading-relaxed mt-2 ${
                isDark ? 'text-[#9aa0a6]' : 'text-slate-500'
              }`}
            >
              {t('upload.meta')}
            </p>
          </div>
        </div>

        {/* One-click presets section */}
        <section id="presets" className="mt-16 scroll-mt-20" aria-label={t('presets.title')}>
          <div className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-semibold flex items-center justify-center gap-2 text-slate-900 dark:text-white">
              ⚡ {t('presets.title')}
            </h2>
            <p className={`text-xs sm:text-sm font-normal mt-1.5 ${isDark ? 'text-[#9aa0a6]' : 'text-slate-600'}`}>
              {t('presets.subtitle')}
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-6 max-w-4xl mx-auto text-left">
            {/* Category 1: Social Media */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1e1f20] border-[#2d2f31]' : 'bg-white border-[#dadce0]'}`}>
              <h3 className="text-[11px] font-bold tracking-wider text-[#3c4043] dark:text-[#c4c7c5] uppercase mb-4">
                🌐 SOCIAL MEDIA PRESETS
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {PRESETS.social.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => handlePresetClick(p)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isDark
                        ? 'bg-[#131314] border-[#3c4043] hover:border-[#8ab4f8] hover:bg-[#1e1f20]'
                        : 'bg-white border-[#dadce0] hover:border-[#1a73e8] hover:bg-[#e8f0fe]/40 shadow-sm'
                    }`}
                    title={`${p.name}: ${p.w} × ${p.h} px`}
                  >
                    <span className="text-xl mb-1.5" aria-hidden="true">{p.icon}</span>
                    <span className="font-semibold text-xs line-clamp-1 mb-0.5 text-slate-900 dark:text-neutral-200">{p.name}</span>
                    <span className={`text-[10px] font-mono font-medium ${isDark ? 'text-[#9aa0a6]' : 'text-slate-500'}`}>{p.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category 2: Indian Govt & Category 3: Govt Exams */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1e1f20] border-[#2d2f31]' : 'bg-white border-[#dadce0]'}`}>
                <h3 className="text-[11px] font-bold tracking-wider text-[#3c4043] dark:text-[#c4c7c5] uppercase mb-4">
                  🇮🇳 INDIAN GOVT ID &amp; FORMS
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {PRESETS.govt.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => handlePresetClick(p)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isDark
                          ? 'bg-[#131314] border-[#3c4043] hover:border-[#8ab4f8] hover:bg-[#1e1f20]'
                          : 'bg-white border-[#dadce0] hover:border-[#1a73e8] hover:bg-[#e8f0fe]/40 shadow-sm'
                      }`}
                      title={`${p.name}: ${p.hint}`}
                    >
                      <span className="text-xl mb-1.5" aria-hidden="true">{p.icon}</span>
                      <span className="font-semibold text-xs line-clamp-1 mb-0.5 text-slate-900 dark:text-neutral-200">{p.name}</span>
                      <span className={`text-[10px] font-mono font-medium ${isDark ? 'text-[#9aa0a6]' : 'text-slate-500'}`}>{p.hint.split(' ')[0]} px</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1e1f20] border-[#2d2f31]' : 'bg-white border-[#dadce0]'}`}>
                <h3 className="text-[11px] font-bold tracking-wider text-[#3c4043] dark:text-[#c4c7c5] uppercase mb-4">
                  📚 GOVERNMENT EXAMS
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESETS.exams.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => handlePresetClick(p)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isDark
                          ? 'bg-[#131314] border-[#3c4043] hover:border-[#8ab4f8] hover:bg-[#1e1f20]'
                          : 'bg-white border-[#dadce0] hover:border-[#1a73e8] hover:bg-[#e8f0fe]/40 shadow-sm'
                      }`}
                      title={`${p.name}: ${p.hint}`}
                    >
                      <span className="text-xl mb-1.5" aria-hidden="true">{p.icon}</span>
                      <span className="font-semibold text-xs line-clamp-1 mb-0.5 text-slate-900 dark:text-neutral-200">{p.name}</span>
                      <span className={`text-[10px] font-mono font-medium ${isDark ? 'text-[#9aa0a6]' : 'text-slate-500'}`}>{p.hint.split(' ')[0]} px</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section id="features" className="mt-24 border-t border-gray-500/10 pt-16 scroll-mt-20" aria-label={t('nav.features')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { key: 'private', icon: '🔒' },
              { key: 'fast', icon: '⚡' },
              { key: 'batch', icon: '📦' },
              { key: 'target', icon: '🎯' },
              { key: 'lang', icon: '🌍' },
              { key: 'pwa', icon: '📱' },
            ].map((feat) => (
              <div
                key={feat.key}
                className={`p-6 rounded-3xl border text-left transition-all ${
                  isDark ? 'bg-[#1e1f20] border-[#2d2f31]' : 'bg-white border-[#dadce0] shadow-sm'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#1a73e8]/10 text-[#1a73e8] dark:text-[#8ab4f8] flex items-center justify-center mb-4 text-lg">
                  {feat.icon}
                </div>
                <h3 className="font-display font-semibold text-base mb-2 text-slate-900 dark:text-white">
                  {t(`feat.${feat.key}Title`)}
                </h3>
                <p className={`text-xs sm:text-sm font-normal leading-relaxed ${isDark ? 'text-[#9aa0a6]' : 'text-slate-600'}`}>
                  {t(`feat.${feat.key}Desc`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SEO How-To Section */}
        <article
          id="how"
          className={`mt-24 text-left border p-6 sm:p-10 rounded-3xl ${
            isDark
              ? 'bg-[#1e1f20] border-[#2d2f31] text-[#cbd5e1]'
              : 'bg-white border-[#dadce0] text-slate-800 shadow-sm'
          }`}
          itemScope
          itemType="https://schema.org/HowTo"
        >
          <meta itemProp="name" content="How to Resize an Image Online Free" />
          <link itemProp="url" href="https://imgrunner.com/#how" />
          <h2 className="font-display font-semibold text-xl mb-4 text-slate-900 dark:text-white">
            {t('seo.howTitle')}
          </h2>
          <ol className="list-decimal list-inside space-y-3 pl-1 text-sm font-normal leading-relaxed mb-8">
            <li itemProp="step" itemScope itemType="https://schema.org/HowToStep">
              <strong>{t('seo.step1').split(' — ')[0]}</strong> — {t('seo.step1').split(' — ')[1]}
            </li>
            <li itemProp="step" itemScope itemType="https://schema.org/HowToStep">
              <strong>{t('seo.step2').split(' — ')[0]}</strong> — {t('seo.step2').split(' — ')[1]}
            </li>
            <li itemProp="step" itemScope itemType="https://schema.org/HowToStep">
              <strong>{t('seo.step3').split(' — ')[0]}</strong> — {t('seo.step3').split(' — ')[1]}
            </li>
            <li itemProp="step" itemScope itemType="https://schema.org/HowToStep">
              <strong>{t('seo.step4').split(' — ')[0]}</strong> — {t('seo.step4').split(' — ')[1]}
            </li>
          </ol>

          <h2 className="font-display font-semibold text-xl mb-4 text-slate-900 dark:text-white">{t('seo.featuresTitle')}</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-1 text-sm font-normal leading-relaxed mb-8">
            {[
              'Batch resize — 50 images in one go, packed into a ZIP.',
              'Target file size — type "20 KB" and we binary-search the quality slider.',
              'Multiple units — pixels, percent, centimeters and inches (DPI aware).',
              'One-click presets — Passport, Instagram, WhatsApp DP, Aadhaar and UPSC sizes in one tap.',
              'EXIF strip — GPS and camera metadata removed by default.',
              'HEIC input — iPhone photos welcome.',
              'Aspect ratio lock — keep proportions while editing one side.',
              'Quality slider — fine-tune JPG/WebP quality 10–100%.',
            ].map((text, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden="true">✓</span>
                <div itemProp="featureList">{text}</div>
              </li>
            ))}
          </ul>
        </article>

        {/* Advanced Premium SEO Comparison & Extended FAQ section */}
        <SEOExtras lang={lang} theme={theme} />
      </div>
    </div>
  );
}
