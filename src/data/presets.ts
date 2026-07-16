import { PresetItem } from '../types';

export const PRESETS: Record<'social' | 'govt' | 'exams', PresetItem[]> = {
  social: [
    { icon: '💬', name: 'WhatsApp DP', w: 500, h: 500, hint: '500 × 500' },
    { icon: '📸', name: 'Instagram Post', w: 1080, h: 1080, hint: '1080 × 1080' },
    { icon: '📱', name: 'Insta Story', w: 1080, h: 1920, hint: '1080 × 1920' },
    { icon: '🎬', name: 'Insta Reel', w: 1080, h: 1920, hint: '1080 × 1920' },
    { icon: '📘', name: 'Facebook Cover', w: 820, h: 312, hint: '820 × 312' },
    { icon: '▶️', name: 'YouTube Thumb', w: 1280, h: 720, hint: '1280 × 720' },
    { icon: '💼', name: 'LinkedIn Banner', w: 1584, h: 396, hint: '1584 × 396' }
  ],
  govt: [
    { icon: '🛂', name: 'Passport Photo', w: 413, h: 531, hint: '413 × 531 (35×45mm)' },
    { icon: '🪪', name: 'PAN Card Photo', w: 200, h: 230, hint: '200 × 230' },
    { icon: '🇮🇳', name: 'Aadhaar Photo', w: 200, h: 240, hint: '200 × 240' }
  ],
  exams: [
    { icon: '📝', name: 'SSC Form Photo', w: 200, h: 230, hint: '200 × 230 (20–50KB)' },
    { icon: '🏛️', name: 'UPSC Photo', w: 350, h: 350, hint: '350 × 350 (20–300KB)' },
    { icon: '🚂', name: 'Railway (RRB)', w: 200, h: 230, hint: '200 × 230 (20–50KB)' },
    { icon: '🏦', name: 'Bank PO Photo', w: 200, h: 230, hint: '200 × 230 (20–50KB)' }
  ]
};
