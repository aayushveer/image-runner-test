import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingOverlayProps {
  processing: boolean;
  processingText: string;
  processingProgress: number;
  t?: (key: string, params?: any) => string;
}

export function ProcessingOverlay({
  processing,
  processingText,
  processingProgress,
  t
}: ProcessingOverlayProps) {
  if (!processing) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#000000]/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
      <div className="text-center space-y-5 max-w-xs w-full bg-white dark:bg-[#1e1f20] p-8 rounded-3xl border border-gray-500/10 shadow-2xl animate-scale-in">
        {/* Animated spinner ring */}
        <div className="relative mx-auto w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/30" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1a73e8] dark:border-t-[#8ab4f8] animate-spin" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#1a73e8]/10 to-transparent flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-[#1a73e8] dark:text-[#8ab4f8]" />
          </div>
        </div>

        <p className="font-display font-bold text-sm tracking-tight text-[#1f1f1f] dark:text-white">
          {processingText}
        </p>

        {/* Premium progress bar with gradient */}
        <div className="w-full h-2 bg-[#f0f4f9] dark:bg-[#131314] rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full animate-gradient"
            style={{
              width: `${processingProgress}%`,
              background: 'linear-gradient(90deg, #1a73e8, #8ab4f8, #1a73e8)',
              backgroundSize: '200% 100%',
              transition: 'width 0.3s ease-out',
            }}
          />
        </div>

        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
          {processingProgress}% {t ? t('processing.complete') : 'complete'}
        </p>
      </div>
    </div>
  );
}