import React from 'react';
import { Check, Download, Facebook, Twitter, Share2, Copy } from 'lucide-react';
import { ProcessedImage, ResizeResult } from '../types';

interface DownloadScreenProps {
  theme: 'dark' | 'light';
  results: ResizeResult[];
  activeImage: ProcessedImage | null;
  activeResult: ResizeResult | null;
  sliderRef: React.RefObject<HTMLDivElement>;
  sliderPos: number;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  formatSize: (bytes: number) => string;
  downloadSingleResult: (res: ResizeResult) => void;
  downloadAll: () => void;
  share: (platform: 'facebook' | 'twitter' | 'whatsapp') => void;
  copyLink: () => void;
  resetAll: () => void;
  t: (key: string, params?: any) => string;
}

export function DownloadScreen({
  theme,
  results,
  activeImage,
  activeResult,
  sliderRef,
  sliderPos,
  handleMouseMove,
  handleTouchMove,
  handleMouseDown,
  handleTouchStart,
  formatSize,
  downloadSingleResult,
  downloadAll,
  share,
  copyLink,
  resetAll,
  t
}: DownloadScreenProps) {
  return (
    <div className="w-full flex-1 flex flex-col justify-center py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-[#e6f4ea] dark:bg-[#137333]/25 text-[#137333] dark:text-[#81c995] flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Check className="w-9 h-9 stroke-[3]" />
        </div>
        <h2 className="font-display font-extrabold text-3xl mb-2 text-slate-900 dark:text-white">{t('download.title')}</h2>
        <p className="text-sm font-semibold text-[#1a73e8] dark:text-[#8ab4f8] mb-8" id="download-info">
          {results.length} {results.length === 1 ? 'image' : 'images'} processed ·{' '}
          {formatSize(
            results.reduce((acc, r) => acc + Math.max(0, r.originalSize - r.newSize), 0)
          )}{' '}
          saved
        </p>

        {/* Before/After visual comparison interactive slider */}
        {activeImage && activeResult && (
          <div className={`mb-8 p-4.5 rounded-2xl border text-left ${
            theme === 'dark' ? 'bg-[#1e1f20]/40 border-[#2d2f31]' : 'bg-[#f8f9fa] border-[#dadce0]'
          }`}>
            <h3 className="text-[11px] font-bold tracking-wider text-[#3c4043] dark:text-[#c4c7c5] uppercase mb-3.5 text-center">
              🔍 {t('editor.beforeAfter')}
            </h3>
            <div
              ref={sliderRef}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              className="relative w-full aspect-[16/10] bg-gray-950 rounded-2xl overflow-hidden cursor-ew-resize select-none border border-gray-500/10 touch-none"
            >
              {/* Before Image */}
              <img src={activeImage.url} alt="Before" className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none" draggable={false} />

              {/* After Image (Clips/overlaps via clipPath) */}
              <div
                className="absolute inset-0 w-full h-full pointer-events-none select-none"
                style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
              >
                <img src={activeResult.url} alt="After" className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none" draggable={false} />
              </div>

              {/* Divider Bar & Handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-slate-900 shadow-xl border border-gray-200 flex items-center justify-center font-bold text-sm">
                  ↔
                </div>
              </div>

              {/* Badge labels */}
              <span className="absolute bottom-3 left-3 bg-black/80 text-white text-[10px] font-semibold px-2 py-1 rounded-md">
                Before ({activeResult.originalWidth} × {activeResult.originalHeight} · {formatSize(activeResult.originalSize)})
              </span>
              <span className="absolute bottom-3 right-3 bg-[#1a73e8] text-white text-[10px] font-semibold px-2 py-1 rounded-md">
                After ({activeResult.newWidth} × {activeResult.newHeight} · {formatSize(activeResult.newSize)})
              </span>
            </div>
          </div>
        )}

        {/* Results list */}
        <div className={`mb-8 border rounded-2xl divide-y max-h-[220px] overflow-y-auto ${
          theme === 'dark' ? 'bg-[#1e1f20]/40 border-[#2d2f31] divide-[#2d2f31]' : 'bg-white border-[#dadce0] divide-[#f0f4f9]'
        }`}>
          {results.map((res) => {
            const savings = Math.max(0, res.originalSize - res.newSize);
            const savingsPct = Math.round((savings / res.originalSize) * 100);
            return (
              <div key={res.id} className="flex items-center justify-between p-3.5 text-left">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={res.url} alt="" className="w-10 h-10 object-cover rounded-xl border bg-gray-900" />
                  <div className="min-w-0">
                    <span className="font-semibold text-xs sm:text-sm block truncate text-slate-900 dark:text-white">{res.originalName}</span>
                    <span className={`text-[10px] font-medium mt-0.5 block ${theme === 'dark' ? 'text-[#9aa0a6]' : 'text-slate-600'}`}>
                      {res.originalWidth} × {res.originalHeight} → <span className="text-[#1a73e8] dark:text-[#8ab4f8] font-semibold">{res.newWidth} × {res.newHeight}</span>
                    </span>
                    <span className="text-[10px] text-[#137333] dark:text-[#81c995] font-semibold mt-0.5 block">
                      {formatSize(res.originalSize)} → {formatSize(res.newSize)} ({savingsPct}% saved
                      {res.qualityUsed ? ` @ ${res.qualityUsed}% Q` : ''})
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => downloadSingleResult(res)}
                  className={`p-2 rounded-full border hover:scale-105 active:scale-95 transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-[#1e1f20] border-[#3c4043] hover:bg-[#8ab4f8]/10 hover:border-[#8ab4f8] text-white'
                      : 'bg-[#f8f9fa] border-[#dadce0] hover:bg-[#1a73e8]/5 hover:border-[#1a73e8] text-slate-900'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Master Download Action button */}
        <button
          onClick={downloadAll}
          className="inline-flex items-center gap-2 px-10 py-3.5 rounded-full text-base font-semibold bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-sm transition-transform active:scale-[0.99] cursor-pointer"
        >
          <Download className="w-5 h-5 stroke-[2]" /> {t('download.download')} {results.length > 1 ? 'all as ZIP' : ''}
        </button>

        {/* Share section */}
        <div className={`mt-10 p-5 rounded-2xl border ${
          theme === 'dark' ? 'bg-[#1e1f20]/40 border-[#2d2f31]' : 'bg-white border-[#dadce0] shadow-sm'
        }`}>
          <p className="text-xs font-semibold text-[#444746] dark:text-[#c4c7c5] mb-3.5">{t('share.label')}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => share('facebook')}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1877f2] text-white hover:scale-105 transition-all cursor-pointer"
            >
              <Facebook className="w-5 h-5" />
            </button>
            <button
              onClick={() => share('twitter')}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1da1f2] text-white hover:scale-105 transition-all cursor-pointer"
            >
              <Twitter className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => share('whatsapp')}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#25d366] text-white hover:scale-105 transition-all cursor-pointer"
            >
              <Share2 className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={copyLink}
              className={`w-10 h-10 rounded-full flex items-center justify-center border hover:scale-105 transition-all cursor-pointer ${
                theme === 'dark' ? 'bg-[#131314] border-[#3c4043] text-[#9aa0a6]' : 'bg-[#f8f9fa] border-[#dadce0] text-[#444746]'
              }`}
            >
              <Copy className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Back to resize more */}
        <div className="mt-8">
          <button
            onClick={resetAll}
            className="text-sm font-semibold text-[#1a73e8] dark:text-[#8ab4f8] hover:underline transition-colors cursor-pointer"
          >
            ← {t('download.more')}
          </button>
        </div>
      </div>
    </div>
  );
}
