import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingOverlayProps {
  processing: boolean;
  processingText: string;
  processingProgress: number;
}

export function ProcessingOverlay({
  processing,
  processingText,
  processingProgress
}: ProcessingOverlayProps) {
  if (!processing) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#000000]/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="text-center space-y-4 max-w-xs w-full bg-white dark:bg-[#1e1f20] p-6 rounded-3xl border border-gray-500/10 shadow-xl">
        <Loader2 className="w-10 h-10 animate-spin text-[#1a73e8] dark:text-[#8ab4f8] mx-auto" />
        <p className="text-sm font-semibold tracking-tight text-[#1f1f1f] dark:text-white">{processingText}</p>
        <div className="w-full h-1.5 bg-[#f0f4f9] dark:bg-[#131314] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#1a73e8] to-blue-500 rounded-full transition-all duration-200"
            style={{ width: `${processingProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
