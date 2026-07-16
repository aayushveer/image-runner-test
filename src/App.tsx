import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import {
  Plus,
  Trash2,
  Settings,
  Download,
  Lock,
  Unlock,
  Sun,
  Moon,
  Share2,
  Facebook,
  Twitter,
  Check,
  Loader2,
  Shield,
  Activity,
  ArrowLeft,
  Copy,
  FileImage,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  AlertCircle,
  Clock,
  Crop
} from 'lucide-react';
import { DICTIONARIES, LANGUAGES, RTL_LANGUAGES, type Language } from './i18n';
import ImageCropper from './components/ImageCropper';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { UploadScreen } from './components/UploadScreen';
import { DownloadScreen } from './components/DownloadScreen';
import { ProcessedImage, ResizeResult, PresetItem } from './types';
import { PRESETS } from './data/presets';

export default function App() {
  // --- Core state ---
  const [lang, setLang] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('imgrunner.language');
      if (stored && (stored === 'en' || stored === 'hi' || stored === 'es' || stored === 'pt' || stored === 'fr' || stored === 'id' || stored === 'ar')) {
        return stored as Language;
      }
    } catch {}
    const browserLang = (navigator.language || '').toLowerCase();
    if (browserLang.startsWith('hi')) return 'hi';
    if (browserLang.startsWith('es')) return 'es';
    if (browserLang.startsWith('pt')) return 'pt';
    if (browserLang.startsWith('fr')) return 'fr';
    if (browserLang.startsWith('id') || browserLang.startsWith('ms')) return 'id';
    if (browserLang.startsWith('ar')) return 'ar';
    return 'en';
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const stored = localStorage.getItem('imgrunner-theme');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {}
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [activePage, setActivePage] = useState<'upload' | 'editor' | 'download'>('upload');
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [checkedImageIds, setCheckedImageIds] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<ResizeResult[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [applyScope, setApplyScope] = useState<'all' | 'selected'>('all');
  const [isCropping, setIsCropping] = useState<boolean>(false);

  // --- Dimension and export states ---
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [unit, setUnit] = useState<'pixels' | 'percent' | 'cm' | 'inches'>('pixels');
  const [resolution, setResolution] = useState<number>(72);
  const [format, setFormat] = useState<'jpg' | 'png' | 'webp'>('jpg');
  const [quality, setQuality] = useState<number>(90);
  const [bgColor, setBgColor] = useState<'white' | 'black' | 'transparent'>('white');
  const [lockRatio, setLockRatio] = useState<boolean>(true);
  const [originalRatio, setOriginalRatio] = useState<number>(1.33);

  // --- Target size & metadata ---
  const [targetSizeEnabled, setTargetSizeEnabled] = useState<boolean>(false);
  const [targetSizeValue, setTargetSizeValue] = useState<string>('20');
  const [targetSizeUnit, setTargetSizeUnit] = useState<'kb' | 'mb' | 'bytes'>('kb');
  const [targetSizeInfo, setTargetSizeInfo] = useState<string>('');
  const [targetSizeInfoType, setTargetSizeInfoType] = useState<'ok' | 'warn' | ''>('');
  const [stripExif, setStripExif] = useState<boolean>(true);

  // --- Before/after slider ---
  const [sliderPos, setSliderPos] = useState<number>(50);
  const sliderRef = useRef<HTMLDivElement>(null);

  // --- Loader/Overlay states ---
  const [processing, setProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [processingText, setProcessingText] = useState<string>('');

  // --- Toasts ---
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);
  const toastTimerRef = useRef<any>(null);

  // --- Pending Preset ---
  const [pendingPreset, setPendingPreset] = useState<{ w: number; h: number; name: string } | null>(null);

  // --- Date for footer ---
  const [currentTime, setCurrentTime] = useState<string>('');

  // --- Effects ---
  useEffect(() => {
    // Apply theme
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light-theme', theme === 'light');
    try {
      localStorage.setItem('imgrunner-theme', theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    // Set direction
    const isRtl = RTL_LANGUAGES.has(lang);
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    try {
      localStorage.setItem('imgrunner.language', lang);
    } catch {}
  }, [lang]);

  useEffect(() => {
    // Sync current time on mount
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync dimensions when active image changes or unit changes
  useEffect(() => {
    if (images.length === 0) return;
    const activeImg = images[currentIdx] || images[0];
    setOriginalRatio(activeImg.width / activeImg.height);
    calculateDefaultDimensions(activeImg, unit, resolution);
  }, [images, currentIdx, unit, resolution]);

  // --- Translation Helper ---
  const t = (key: string, params: any = {}): string => {
    const dict = DICTIONARIES[lang] || DICTIONARIES['en'];
    const fallbackDict = DICTIONARIES['en'];
    const val = dict[key] ?? fallbackDict[key] ?? key;

    if (typeof val === 'function') {
      return val(params);
    }

    let text = String(val);
    Object.keys(params).forEach((param) => {
      text = text.replace(new RegExp(`\\{\\{\\s*${param}\\s*\\}\\}`, 'g'), String(params[param]));
    });
    return text;
  };

  const notify = (message: string, isError = false) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, isError });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // --- Dimension calculation logic ---
  const calculateDefaultDimensions = (img: ProcessedImage, currentUnit: string, dpi: number) => {
    if (currentUnit === 'pixels') {
      setWidth(img.width);
      setHeight(img.height);
    } else if (currentUnit === 'percent') {
      setWidth(100);
      setHeight(100);
    } else if (currentUnit === 'cm') {
      setWidth(Math.round((img.width * 2.54 / dpi) * 10) / 10);
      setHeight(Math.round((img.height * 2.54 / dpi) * 10) / 10);
    } else if (currentUnit === 'inches') {
      setWidth(Math.round((img.width / dpi) * 10) / 10);
      setHeight(Math.round((img.height / dpi) * 10) / 10);
    }
  };

  const handleWidthChange = (valStr: string) => {
    const val = parseFloat(valStr) || 0;
    setWidth(val);
    if (lockRatio && images.length > 0) {
      if (unit === 'percent') {
        setHeight(val);
      } else {
        setHeight(Math.max(1, Math.round(val / originalRatio)));
      }
    }
  };

  const handleHeightChange = (valStr: string) => {
    const val = parseFloat(valStr) || 0;
    setHeight(val);
    if (lockRatio && images.length > 0) {
      if (unit === 'percent') {
        setWidth(val);
      } else {
        setWidth(Math.max(1, Math.round(val * originalRatio)));
      }
    }
  };

  // --- Preset execution ---
  const applyPreset = (preset: PresetItem) => {
    setUnit('pixels');
    setWidth(preset.w);
    setHeight(preset.h);
    setOriginalRatio(preset.w / preset.h);
    setLockRatio(true);
    notify(`✅ Applied: ${preset.name} (${preset.w} × ${preset.h} px)`);
  };

  const handlePresetClick = (preset: PresetItem) => {
    if (images.length > 0) {
      applyPreset(preset);
    } else {
      setPendingPreset(preset);
      // Trigger file selector
      const fileInput = document.getElementById('file-input-main');
      if (fileInput) fileInput.click();
    }
  };

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const maxImages = 50;
    const maxFileSize = 25 * 1024 * 1024; // 25 MB
    const beforeCount = images.length;
    const remaining = maxImages - beforeCount;

    if (remaining <= 0) {
      notify(t('alerts.maxImages', { max: maxImages }), true);
      return;
    }

    const files = Array.from(fileList);
    const addedImages: ProcessedImage[] = [];
    let skippedUnsupported = 0;
    let skippedSize = 0;

    for (const file of files.slice(0, remaining)) {
      const type = file.type.toLowerCase();
      const isSupported = type.startsWith('image/') && type !== 'image/svg+xml';

      if (!isSupported) {
        skippedUnsupported++;
        continue;
      }

      if (file.size > maxFileSize) {
        skippedSize++;
        continue;
      }

      try {
        const pImg = await loadLocalImageFile(file);
        addedImages.push(pImg);
      } catch {
        skippedUnsupported++;
      }
    }

    if (addedImages.length > 0) {
      const newImages = [...images, ...addedImages];
      setImages(newImages);
      setCheckedImageIds((prev) => {
        const next = new Set(prev);
        addedImages.forEach((img) => next.add(img.id));
        return next;
      });
      setCurrentIdx(beforeCount); // set to first newly added image
      setActivePage('editor');

      // If pending preset was waiting, apply it!
      if (pendingPreset) {
        setUnit('pixels');
        setWidth(pendingPreset.w);
        setHeight(pendingPreset.h);
        setOriginalRatio(pendingPreset.w / pendingPreset.h);
        setLockRatio(true);
        setPendingPreset(null);
        notify(`✅ Applied: ${pendingPreset.name} (${pendingPreset.w} × ${pendingPreset.h} px)`);
      } else {
        const activeImg = addedImages[0];
        setOriginalRatio(activeImg.width / activeImg.height);
        calculateDefaultDimensions(activeImg, unit, resolution);
      }

      notify(t('upload.toast.added', { count: addedImages.length }));
    }

    if (skippedUnsupported > 0) {
      notify(t('alerts.unsupportedSkipped', { count: skippedUnsupported }), true);
    }
    if (skippedSize > 0) {
      notify(t('alerts.largeSkipped', { count: skippedSize, size: '25 MB' }), true);
    }
  };

  const loadLocalImageFile = (file: File): Promise<ProcessedImage> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        if (!img.naturalWidth || !img.naturalHeight) {
          URL.revokeObjectURL(url);
          reject();
          return;
        }
        resolve({
          id: Math.random().toString(36).substr(2, 9),
          file,
          name: file.name,
          size: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
          url,
          type: file.type
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject();
      };
      img.src = url;
    });
  };

  const removeImage = (idToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = images.filter((img) => img.id !== idToRemove);
    setImages(updated);

    setCheckedImageIds((prev) => {
      const next = new Set(prev);
      next.delete(idToRemove);
      return next;
    });

    if (updated.length === 0) {
      setActivePage('upload');
      setCurrentIdx(0);
    } else {
      const newIdx = Math.min(currentIdx, updated.length - 1);
      setCurrentIdx(newIdx);
    }
  };

  const toggleCheckImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedImageIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // --- Load Image from URL ---
  const [urlInput, setUrlInput] = useState<string>('');
  const loadImageFromUrl = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    try {
      setProcessing(true);
      setProcessingProgress(20);
      setProcessingText('Fetching remote image...');

      const response = await fetch(trimmed, { mode: 'cors' }).catch(() => null);
      if (!response || !response.ok) {
        throw new Error('CORS error or invalid link');
      }

      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) {
        throw new Error('Not an image file');
      }

      const filename = trimmed.split('/').pop()?.split('?')[0] || 'downloaded-image';
      const file = new File([blob], filename, { type: blob.type });
      await handleFilesSelected([file] as any);
      setUrlInput('');
    } catch {
      notify('❌ Failed to fetch image. Please ensure the URL is direct, starts with https, and allows CORS.', true);
    } finally {
      setProcessing(false);
    }
  };

  // --- Paste from clipboard handler ---
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) {
        handleFilesSelected(imageFiles as any);
        notify('📋 Image pasted from clipboard');
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [images]);

  // --- Process images ---
  const resizeImages = async () => {
    if (images.length === 0) return;

    // Clear previous results
    results.forEach((res) => URL.revokeObjectURL(res.url));
    setResults([]);

    setProcessing(true);
    setProcessingProgress(5);
    setProcessingText(t('processing.resizing'));

    const imagesToProcess = applyScope === 'all' 
      ? images.filter((img) => checkedImageIds.has(img.id))
      : [images[currentIdx]];
      
    if (imagesToProcess.length === 0) {
      setProcessing(false);
      notify('⚠️ No images are ticked/selected! Please tick at least one image to proceed.', true);
      return;
    }

    const total = imagesToProcess.length;
    const computedResults: ResizeResult[] = [];

    for (let i = 0; i < total; i++) {
      const img = imagesToProcess[i];
      setProcessingProgress(Math.round((i / total) * 100));
      setProcessingText(t('processing.progress', { current: i + 1, total }));

      try {
        const res = await processSingleImage(img, i);
        computedResults.push(res);
      } catch (err: any) {
        notify(`❌ Error processing ${img.name}: ${err?.message || 'Unknown error'}`);
      }
    }

    setResults(computedResults);
    setProcessing(false);
    setActivePage('download');
    notify(applyScope === 'all' ? `🎉 Finished resizing ${total} ticked images!` : '🎉 Finished resizing selected image!');
  };

  const processSingleImage = (img: ProcessedImage, index: number): Promise<ResizeResult> => {
    return new Promise((resolve, reject) => {
      const mimeType = format === 'jpg' ? 'image/jpeg' : format === 'png' ? 'image/png' : 'image/webp';
      const ext = format;

      // Calculate new width & height
      let newW = 0;
      let newH = 0;

      if (unit === 'percent') {
        newW = Math.round(img.width * (width / 100));
        newH = Math.round(img.height * (height / 100));
      } else if (unit === 'cm') {
        newW = Math.round((width / 2.54) * resolution);
        newH = Math.round((height / 2.54) * resolution);
      } else if (unit === 'inches') {
        newW = Math.round(width * resolution);
        newH = Math.round(height * resolution);
      } else {
        newW = Math.round(width);
        newH = Math.round(height);
      }

      newW = Math.max(1, newW);
      newH = Math.max(1, newH);

      // Check max limitations
      const maxDimension = 12000;
      const maxPixels = 60 * 1000 * 1000;
      if (newW > maxDimension || newH > maxDimension || newW * newH > maxPixels) {
        reject(new Error(t('alerts.tooLarge', { maxDimension, megapixels: Math.floor(maxPixels / 1000000) })));
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = newW;
      canvas.height = newH;
      const ctx = canvas.getContext('2d', { alpha: format !== 'jpg' });

      if (!ctx) {
        reject(new Error(t('alerts.canvasUnavailable')));
        return;
      }

      const rawImg = new Image();
      rawImg.onload = async () => {
        // Draw background
        if (format === 'jpg' || bgColor !== 'transparent') {
          ctx.fillStyle = bgColor === 'black' ? '#000000' : '#ffffff';
          ctx.fillRect(0, 0, newW, newH);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(rawImg, 0, 0, newW, newH);

        // Binary search quality for target size if enabled
        let finalBlob: Blob | null = null;
        let finalQuality = quality;
        let targetBytes = 0;

        if (targetSizeEnabled && (format === 'jpg' || format === 'webp')) {
          const valNum = parseFloat(targetSizeValue) || 20;
          if (targetSizeUnit === 'kb') targetBytes = valNum * 1024;
          else if (targetSizeUnit === 'mb') targetBytes = valNum * 1024 * 1024;
          else targetBytes = valNum;

          let low = 5;
          let high = 100;
          let bestUnderBlob: Blob | null = null;
          let bestUnderQuality = 90;
          let closestBlob: Blob | null = null;
          let closestQuality = 90;

          // Binary search
          for (let step = 0; step < 8; step++) {
            const mid = Math.floor((low + high) / 2);
            const blobCandidate = await canvasToBlobPromise(canvas, mimeType, mid / 100);
            if (!blobCandidate) continue;

            if (!closestBlob || Math.abs(blobCandidate.size - targetBytes) < Math.abs(closestBlob.size - targetBytes)) {
              closestBlob = blobCandidate;
              closestQuality = mid;
            }

            if (blobCandidate.size <= targetBytes) {
              bestUnderBlob = blobCandidate;
              bestUnderQuality = mid;
              low = mid + 1;
            } else {
              high = mid - 1;
            }
          }

          finalBlob = bestUnderBlob || closestBlob;
          finalQuality = bestUnderBlob ? bestUnderQuality : closestQuality;
        } else {
          finalBlob = await canvasToBlobPromise(canvas, mimeType, quality / 100);
        }

        if (!finalBlob) {
          reject(new Error(t('alerts.formatUnsupported')));
          return;
        }

        const cleanBaseName = img.name.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9_-]/gi, '-');
        const numPrefix = String(index + 1).padStart(2, '0');
        const outFileName = `${numPrefix}-${cleanBaseName}_${newW}x${newH}.${ext}`;

        resolve({
          id: img.id,
          fileName: outFileName,
          blob: finalBlob,
          url: URL.createObjectURL(finalBlob),
          originalWidth: img.width,
          originalHeight: img.height,
          newWidth: newW,
          newHeight: newH,
          originalName: img.name,
          originalSize: img.size,
          newSize: finalBlob.size,
          qualityUsed: (format === 'jpg' || format === 'webp') ? finalQuality : null,
          targetSizeUsed: targetSizeEnabled
        });
      };

      rawImg.onerror = () => {
        reject(new Error('Failed to draw image to Canvas'));
      };
      rawImg.src = img.url;
    });
  };

  const canvasToBlobPromise = (canvas: HTMLCanvasElement, mimeType: string, q: number): Promise<Blob | null> => {
    return new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), mimeType, q);
    });
  };

  // --- Downloader logic ---
  const downloadSingleResult = (res: ResizeResult) => {
    const a = document.createElement('a');
    a.href = res.url;
    a.download = res.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAll = async () => {
    if (results.length === 0) return;
    if (results.length === 1) {
      downloadSingleResult(results[0]);
      return;
    }

    setProcessing(true);
    setProcessingProgress(20);
    setProcessingText('Packaging files inside a single ZIP...');

    const zip = new JSZip();
    results.forEach((res) => {
      zip.file(res.fileName, res.blob);
    });

    try {
      const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        setProcessingProgress(Math.round(metadata.percent));
      });
      const dateStr = new Date().toISOString().split('T')[0];
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = `resized-images-${dateStr}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      notify('❌ Failed to package ZIP file. Downloading files individually...', true);
      results.forEach((res) => downloadSingleResult(res));
    } finally {
      setProcessing(false);
    }
  };

  // --- Comparison Slider Math ---
  const handleSliderMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      handleSliderMove(e.clientX);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleSliderMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  // --- File size format helper ---
  const formatSize = (bytes: number) => {
    if (bytes <= 0) return '0 B';
    const k = 1024;
    const dm = 1;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // --- Link sharing ---
  const share = (platform: 'facebook' | 'twitter' | 'whatsapp') => {
    const shareUrl = encodeURIComponent('https://imgrunner.com');
    const text = encodeURIComponent(t('share.text'));
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${text}`,
      whatsapp: `https://wa.me/?text=${text}%20${shareUrl}`
    };
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify(t('alerts.linkCopied'));
    } catch {
      notify(t('alerts.copyFailed'), true);
    }
  };

  const resetAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.url));
    results.forEach((res) => URL.revokeObjectURL(res.url));
    setImages([]);
    setResults([]);
    setCurrentIdx(0);
    setActivePage('upload');
  };

  const handleCropSave = (croppedBlob: Blob, croppedUrl: string, croppedW: number, croppedH: number) => {
    if (!activeImage) return;

    if (activeImage.url.startsWith('blob:')) {
      const isUrlUsedElsewhere = images.some((img, idx) => idx !== currentIdx && img.url === activeImage.url);
      if (!isUrlUsedElsewhere) {
        URL.revokeObjectURL(activeImage.url);
      }
    }

    const updatedImages = [...images];
    updatedImages[currentIdx] = {
      ...activeImage,
      file: new File([croppedBlob], activeImage.name, { type: croppedBlob.type }),
      url: croppedUrl,
      width: croppedW,
      height: croppedH,
      size: croppedBlob.size,
    };
    
    setImages(updatedImages);
    setIsCropping(false);
    notify('✂️ Image cropped and updated successfully!');
  };

  const activeImage = images[currentIdx] || images[0];
  const activeResult = results.find((r) => r.id === activeImage?.id);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      theme === 'dark' ? 'bg-[#131314] text-[#e3e3e3]' : 'bg-[#f8f9fa] text-[#1f1f1f]'
    }`}>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3.5 rounded-full shadow-lg transition-all duration-300 ${
          toast.isError
            ? 'bg-red-600 text-white shadow-red-500/10'
            : 'bg-[#137333] text-white shadow-emerald-500/10'
        }`}>
          {toast.isError ? <AlertCircle className="w-4.5 h-4.5" /> : <Check className="w-4.5 h-4.5" />}
          <span className="font-display font-medium text-sm whitespace-pre-line">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <Header
        theme={theme}
        setTheme={setTheme}
        lang={lang}
        setLang={setLang}
        activePage={activePage}
        setActivePage={setActivePage}
        resetAll={resetAll}
        t={t}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col">

        {/* ==================== PAGE 1: UPLOAD PAGE ==================== */}
        {activePage === 'upload' && (
          <UploadScreen
            theme={theme}
            lang={lang}
            t={t}
            handleFilesSelected={handleFilesSelected}
            handlePresetClick={handlePresetClick}
          />
        )}

        {/* ==================== PAGE 2: EDITOR PAGE ==================== */}
        {activePage === 'editor' && (
          <div className="flex-1 flex flex-col md:flex-row items-stretch">
            {/* Left Preview Column */}
            <div className={`flex-1 flex flex-col p-4 sm:p-6 transition-all duration-200 ${
              theme === 'dark' ? 'bg-[#131314]' : 'bg-[#f0f4f9]'
            }`}>
              <div className="flex items-center justify-between mb-4.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => document.getElementById('file-input-more')?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-[#1a73e8] hover:bg-[#1557b0] text-white transition-all shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" /> {t('editor.addMore')}
                  </button>
                  <input
                    type="file"
                    id="file-input-more"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/heic,image/heif"
                    multiple
                    hidden
                    onChange={(e) => handleFilesSelected(e.target.files)}
                  />
                </div>

                {/* Highly premium selection toggles */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckedImageIds(new Set(images.map((img) => img.id)))}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-[#1e1f20] hover:bg-[#2d2f31] border-[#3c4043] text-gray-300'
                        : 'bg-white hover:bg-gray-50 border-gray-200 text-slate-700'
                    }`}
                  >
                    Tick All
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckedImageIds(new Set())}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-[#1e1f20] hover:bg-[#2d2f31] border-[#3c4043] text-gray-300'
                        : 'bg-white hover:bg-gray-50 border-gray-200 text-slate-700'
                    }`}
                  >
                    Untick All
                  </button>
                  <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full border tracking-wide ${
                    theme === 'dark'
                      ? 'bg-[#1e1f20] border-[#3c4043] text-[#8ab4f8]'
                      : 'bg-white border-gray-200 text-[#1a73e8]'
                  }`}>
                    Ticked: {checkedImageIds.size} / {images.length}
                  </span>
                </div>
              </div>

              {/* Grid of image thumbnails */}
              <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3.5 p-4 rounded-2xl border mb-6 overflow-y-auto max-h-[145px] ${
                theme === 'dark' ? 'bg-[#1e1f20]/50 border-[#2d2f31]' : 'bg-white border-[#dadce0]'
              }`}>
                {images.map((img, idx) => {
                  const isEditing = idx === currentIdx;
                  const isChecked = checkedImageIds.has(img.id);
                  return (
                    <div
                      key={img.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`relative aspect-square rounded-2xl cursor-pointer transition-all duration-300 group ${
                        isEditing
                          ? 'p-1 bg-gradient-to-tr from-[#1a73e8] to-[#8ab4f8] scale-[1.04] shadow-md shadow-blue-500/20 ring-1 ring-blue-500/30'
                          : `p-0.5 bg-transparent border ${
                              theme === 'dark' ? 'border-[#2d2f31]' : 'border-gray-200/80'
                            }`
                      }`}
                    >
                      <div className="w-full h-full rounded-[11px] overflow-hidden relative bg-checkered">
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover select-none" />
                        
                        {/* selection state blue/green overlay or gradient */}
                        {isEditing && (
                          <div className="absolute inset-0 bg-blue-500/10 pointer-events-none flex items-end justify-center pb-1">
                            <span className="bg-[#1a73e8] text-white text-[8px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full shadow-md">
                              Active
                            </span>
                          </div>
                        )}

                        {/* Top Left Selection Check Badge - Fully Interactive & Premium */}
                        <button
                          type="button"
                          onClick={(e) => toggleCheckImage(img.id, e)}
                          className={`absolute top-1 left-1 w-5.5 h-5.5 rounded-full flex items-center justify-center shadow-md transition-all z-10 hover:scale-110 active:scale-95 cursor-pointer ${
                            isChecked
                              ? 'bg-[#1a73e8] text-white ring-1 ring-white/10'
                              : 'bg-black/40 hover:bg-black/60 text-white/80 border border-white/20'
                          }`}
                          title={isChecked ? "Remove from crop/resize queue" : "Add to crop/resize queue"}
                        >
                          <Check className={`w-3.5 h-3.5 stroke-[3.5] transition-transform duration-200 ${isChecked ? 'scale-100' : 'scale-0'}`} />
                        </button>

                        {/* Top Right index number badge to keep tabs of order */}
                        <div className={`absolute top-1 right-1 px-1.5 py-0.5 rounded-md text-[8px] font-bold shadow-sm backdrop-blur-sm ${
                          isEditing 
                            ? 'bg-black/80 text-white' 
                            : 'bg-black/55 text-white opacity-0 group-hover:opacity-100 transition-opacity'
                        }`}>
                          #{idx + 1}
                        </div>
                      </div>

                      {/* Remove image button */}
                      <button
                        onClick={(e) => removeImage(img.id, e)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title={t('editor.removeImage')}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Active Image Visual Stage with Fixed-Height Wrapper to prevent layout shifts */}
              <div className={`flex-1 flex flex-col justify-between p-5 rounded-3xl border relative min-h-[430px] ${
                theme === 'dark' ? 'bg-[#1e1f20]/30 border-[#2d2f31]' : 'bg-white border-[#dadce0] shadow-sm'
              }`}>
                {activeImage ? (
                  <div className="flex-1 flex flex-col h-full justify-between">
                    {/* Fixed size preview container to ensure zero shifting */}
                    <div className="h-[340px] w-full flex items-center justify-center bg-gray-50 dark:bg-black/15 rounded-2xl border border-gray-100 dark:border-white/5 relative overflow-hidden">
                      <img
                        src={activeImage.url}
                        alt={activeImage.name}
                        className="max-h-full max-w-full object-contain rounded-xl shadow-sm transition-all duration-300 select-none pointer-events-none"
                      />
                    </div>
                    
                    {/* Stable Metadata and crop buttons */}
                    <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 justify-between w-full px-2">
                      <div className="text-center sm:text-left truncate max-w-[220px] sm:max-w-[260px]">
                        <span className="font-display font-bold text-sm block truncate text-slate-800 dark:text-white" title={activeImage.name}>
                          {activeImage.name}
                        </span>
                        <span className={`text-xs font-semibold mt-1 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          {activeImage.width} × {activeImage.height} px · {formatSize(activeImage.size)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCropping(true)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-extrabold transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                          theme === 'dark'
                            ? 'bg-[#1a73e8]/10 hover:bg-[#1a73e8]/20 border border-[#1a73e8]/30 text-[#8ab4f8]'
                            : 'bg-white border border-gray-200 hover:bg-gray-50 text-slate-800'
                        }`}
                      >
                        <Crop className="w-4 h-4 text-blue-500 dark:text-[#8ab4f8]" />
                        <span>Crop & Rotate</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    No active image
                  </div>
                )}
              </div>
            </div>

            {/* Right Control Settings Panel */}
            <div className={`w-full md:w-[390px] p-6 border-t md:border-t-0 md:border-l flex flex-col justify-between transition-colors duration-200 ${
              theme === 'dark' ? 'bg-[#1e1f20] border-[#2d2f31]' : 'bg-white border-[#dadce0]'
            }`}>
              <div className="space-y-6">
                <div>
                  <h2 className="font-display font-semibold text-[#1f1f1f] dark:text-white text-lg text-center pb-3 border-b border-gray-500/10">
                    ⚙️ {t('editor.settingsTitle')}
                  </h2>
                </div>

                {/* Apply Settings Scope */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold tracking-wider text-[#3c4043] dark:text-[#c4c7c5] uppercase">
                    ⚙️ Apply Settings To
                  </label>
                  <div className={`p-1.5 flex gap-1 rounded-2xl border ${
                    theme === 'dark' ? 'bg-[#131314]/50 border-[#2d2f31]' : 'bg-gray-100 border-[#dadce0]'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setApplyScope('all')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                        applyScope === 'all'
                          ? 'bg-[#1a73e8] text-white shadow-md'
                          : theme === 'dark'
                            ? 'text-[#9aa0a6] hover:text-white hover:bg-white/5'
                            : 'text-[#444746] hover:text-[#1f1f1f] hover:bg-black/5'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Ticked Images ({checkedImageIds.size})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setApplyScope('selected')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                        applyScope === 'selected'
                          ? 'bg-[#1a73e8] text-white shadow-md'
                          : theme === 'dark'
                            ? 'text-[#9aa0a6] hover:text-white hover:bg-white/5'
                            : 'text-[#444746] hover:text-[#1f1f1f] hover:bg-black/5'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Active Image Only</span>
                    </button>
                  </div>
                </div>

                {/* 1. Dimensions Settings Block */}
                <div className={`p-4.5 rounded-2xl border ${theme === 'dark' ? 'bg-[#131314]/40 border-[#2d2f31]' : 'bg-[#f8f9fa] border-[#dadce0]'}`}>
                  <h3 className="text-[11px] font-bold tracking-wider text-[#3c4043] dark:text-[#c4c7c5] uppercase mb-3.5">
                    📏 {t('editor.dimensions')}
                  </h3>

                  <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end mb-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold text-[#444746] dark:text-[#c4c7c5]">{t('editor.width')}</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={width || ''}
                        onChange={(e) => handleWidthChange(e.target.value)}
                        className={`w-full text-center py-2 px-3 rounded-xl border text-sm font-semibold focus:outline-none focus:border-[#1a73e8] dark:focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#1a73e8] dark:focus:ring-[#8ab4f8] ${
                          theme === 'dark' ? 'bg-[#131314] border-[#3c4043] text-white' : 'bg-white border-[#dadce0] text-slate-900'
                        }`}
                      />
                    </div>

                    <button
                      onClick={() => setLockRatio(!lockRatio)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        lockRatio
                          ? 'bg-[#1a73e8] border-[#1a73e8] text-white hover:bg-[#1557b0]'
                          : theme === 'dark'
                            ? 'bg-[#131314] border-[#3c4043] text-[#9aa0a6] hover:text-white'
                            : 'bg-white border-[#dadce0] text-[#444746] hover:text-black'
                      }`}
                      title={t('editor.lockRatio')}
                    >
                      {lockRatio ? <Lock className="w-4 h-4 stroke-[2.5]" /> : <Unlock className="w-4 h-4 stroke-[2.5]" />}
                    </button>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold text-[#444746] dark:text-[#c4c7c5]">{t('editor.height')}</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={height || ''}
                        onChange={(e) => handleHeightChange(e.target.value)}
                        className={`w-full text-center py-2 px-3 rounded-xl border text-sm font-semibold focus:outline-none focus:border-[#1a73e8] dark:focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#1a73e8] dark:focus:ring-[#8ab4f8] ${
                          theme === 'dark' ? 'bg-[#131314] border-[#3c4043] text-white' : 'bg-white border-[#dadce0] text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Units selector */}
                  <div className="flex gap-3">
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as any)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold appearance-none bg-no-repeat cursor-pointer focus:outline-none ${
                        theme === 'dark'
                          ? 'bg-[#131314] border-[#3c4043] text-white hover:border-[#8ab4f8]'
                          : 'bg-white border-[#dadce0] text-gray-800 hover:border-[#1a73e8]'
                      }`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${theme === 'dark' ? '%23c4c7c5' : '%23444746'}' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '11px',
                      }}
                    >
                      <option value="pixels">{t('units.pixels')}</option>
                      <option value="percent">{t('units.percent')}</option>
                      <option value="cm">{t('units.cm')}</option>
                      <option value="inches">{t('units.inches')}</option>
                    </select>

                    {(unit === 'cm' || unit === 'inches') && (
                      <div className={`flex items-center border rounded-xl overflow-hidden ${
                        theme === 'dark' ? 'border-[#3c4043]' : 'border-[#dadce0]'
                      }`}>
                        <input
                          type="number"
                          min="1"
                          max="600"
                          value={resolution}
                          onChange={(e) => setResolution(Math.max(1, parseInt(e.target.value) || 72))}
                          className={`w-12 text-center py-2 text-xs font-semibold border-none focus:outline-none ${
                            theme === 'dark' ? 'bg-[#131314] text-white' : 'bg-white text-gray-800'
                          }`}
                        />
                        <span className={`px-2 py-2 text-[10px] font-bold border-l text-[#444746] dark:text-[#c4c7c5] uppercase ${
                          theme === 'dark' ? 'bg-[#1e1f20] border-[#3c4043]' : 'bg-gray-100 border-[#dadce0]'
                        }`}>
                          DPI
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Format & Compress Settings Block */}
                <div className={`p-4.5 rounded-2xl border ${theme === 'dark' ? 'bg-[#131314]/40 border-[#2d2f31]' : 'bg-[#f8f9fa] border-[#dadce0]'}`}>
                  <h3 className="text-[11px] font-bold tracking-wider text-[#3c4043] dark:text-[#c4c7c5] uppercase mb-3.5">
                    🎨 {lang === 'hi' ? 'फ़ॉर्मेट और क्वालिटी' : 'Format & Quality'}
                  </h3>

                  {/* Format Selector Row */}
                  <div className="flex flex-col gap-1.5 mb-3.5">
                    <label className="text-[11px] font-semibold text-[#444746] dark:text-[#c4c7c5]">{t('editor.format')}</label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value as any)}
                      className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold appearance-none bg-no-repeat cursor-pointer focus:outline-none focus:border-[#1a73e8] dark:focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#1a73e8] dark:focus:ring-[#8ab4f8] ${
                        theme === 'dark'
                          ? 'bg-[#131314] border-[#3c4043] text-white hover:border-[#8ab4f8]'
                          : 'bg-white border-[#dadce0] text-gray-800 hover:border-[#1a73e8]'
                      }`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${theme === 'dark' ? '%23c4c7c5' : '%23444746'}' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '11px',
                      }}
                    >
                      <option value="jpg">JPG</option>
                      <option value="png">PNG</option>
                      <option value="webp">WebP</option>
                    </select>
                  </div>

                  {/* Quality Slider - Smooth transition-all, hides when PNG selected */}
                  <div className={`transition-all duration-300 ease-in-out origin-top ${
                    format === 'png'
                      ? 'opacity-0 max-h-0 overflow-hidden mb-0'
                      : 'opacity-100 max-h-[100px] mb-3.5'
                  }`}>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold text-[#444746] dark:text-[#c4c7c5]">{t('editor.quality')}</label>
                      <div className={`flex items-center gap-2 py-1.5 px-3 border rounded-xl transition-all ${
                        theme === 'dark' ? 'bg-[#131314] border-[#3c4043]' : 'bg-white border-[#dadce0]'
                      }`}>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={quality}
                          disabled={format === 'png'}
                          onChange={(e) => setQuality(parseInt(e.target.value))}
                          className="flex-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-lg cursor-pointer accent-[#1a73e8] disabled:opacity-40"
                        />
                        <span className="text-[11px] font-bold text-[#1a73e8] dark:text-[#8ab4f8] whitespace-nowrap min-w-[28px] text-right">
                          {quality}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Background Selector - Smooth transition-all, hides when PNG selected */}
                  <div className={`transition-all duration-300 ease-in-out origin-top ${
                    format === 'png'
                      ? 'opacity-0 max-h-0 overflow-hidden mb-0 py-0 border-none'
                      : 'opacity-100 max-h-[100px] py-2 border-t border-gray-500/10 mb-2'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#444746] dark:text-[#c4c7c5]">{t('editor.background')}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setBgColor('white')}
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all bg-white hover:scale-105 cursor-pointer ${
                            bgColor === 'white' ? 'border-[#1a73e8] ring-2 ring-[#1a73e8]/15' : 'border-gray-300'
                          }`}
                          title={t('editor.bgWhite')}
                        />
                        <button
                          onClick={() => setBgColor('black')}
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all bg-black hover:scale-105 cursor-pointer ${
                            bgColor === 'black' ? 'border-[#1a73e8] ring-2 ring-[#1a73e8]/15' : 'border-gray-800'
                          }`}
                          title={t('editor.bgBlack')}
                        />
                        <button
                          onClick={() => format !== 'jpg' && setBgColor('transparent')}
                          disabled={format === 'jpg'}
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all bg-no-repeat hover:scale-105 cursor-pointer disabled:opacity-30 disabled:hover:scale-100 ${
                            bgColor === 'transparent' ? 'border-[#1a73e8] ring-2 ring-[#1a73e8]/15' : 'border-gray-300'
                          }`}
                          style={{
                            backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%),
                                              linear-gradient(-45deg, #ccc 25%, transparent 25%),
                                              linear-gradient(45deg, transparent 75%, #ccc 75%),
                                              linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                            backgroundSize: '6px 6px',
                            backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px'
                          }}
                          title={t('editor.bgTransparentTitle')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Target file size block - Smooth transition-all, hides when PNG selected */}
                  <div className={`transition-all duration-300 ease-in-out origin-top ${
                    format === 'png'
                      ? 'opacity-0 max-h-0 overflow-hidden py-0 border-none mt-0 mb-0'
                      : 'opacity-100 max-h-[150px] border-t border-gray-500/10 pt-3'
                  }`}>
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#444746] dark:text-[#c4c7c5] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={targetSizeEnabled}
                        disabled={format === 'png'}
                        onChange={(e) => setTargetSizeEnabled(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-[#1a73e8] focus:ring-[#1a73e8] accent-[#1a73e8] disabled:opacity-40"
                      />
                      <span>{t('editor.targetSize')}</span>
                    </label>

                    {targetSizeEnabled && (
                      <div className={`mt-2.5 flex items-center gap-2 p-2 rounded-xl border transition-all ${
                        theme === 'dark' ? 'bg-[#131314] border-[#3c4043]' : 'bg-white border-[#dadce0]'
                      }`}>
                        <input
                          type="number"
                          placeholder="20"
                          disabled={format === 'png'}
                          value={targetSizeValue}
                          onChange={(e) => setTargetSizeValue(e.target.value)}
                          className={`w-20 text-center py-1 px-2 rounded-lg border text-xs font-semibold focus:outline-none focus:border-[#1a73e8] ${
                            theme === 'dark' ? 'bg-[#1e1f20] border-[#3c4043] text-white' : 'bg-gray-50 border-[#dadce0] text-slate-900'
                          }`}
                        />
                        <select
                          value={targetSizeUnit}
                          disabled={format === 'png'}
                          onChange={(e) => setTargetSizeUnit(e.target.value as any)}
                          className={`py-1 px-2 rounded-lg border text-xs font-semibold cursor-pointer focus:outline-none ${
                            theme === 'dark'
                              ? 'bg-[#1e1f20] border-[#3c4043] text-white'
                              : 'bg-gray-50 border-[#dadce0] text-slate-900'
                          }`}
                        >
                          <option value="kb">KB</option>
                          <option value="mb">MB</option>
                          <option value="bytes">Bytes</option>
                        </select>
                        <span className="text-[10px] text-red-500 font-semibold pl-1">
                          {format === 'png' ? 'JPG/WebP only' : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Strip EXIF metadata */}
                  <div className="border-t border-gray-500/10 pt-3 mt-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#444746] dark:text-[#c4c7c5] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={stripExif}
                        onChange={(e) => setStripExif(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-[#1a73e8] focus:ring-[#1a73e8] accent-[#1a73e8]"
                      />
                      <span>{t('editor.stripExif')}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Process Trigger Button */}
              <div className="pt-6 border-t border-gray-500/10">
                <button
                  onClick={resizeImages}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-base font-semibold bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-sm cursor-pointer transition-transform active:scale-[0.99]"
                >
                  <Download className="w-5 h-5 stroke-[2]" /> {applyScope === 'all' ? `Resize Ticked Images (${checkedImageIds.size})` : 'Resize Active Image Only'}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-[#137333] dark:text-[#81c995] bg-[#e6f4ea] dark:bg-[#137333]/15 py-2.5 rounded-full border border-[#137333]/10">
                  <Shield className="w-4 h-4 stroke-[2]" />
                  <span>{t('editor.privacy')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== PAGE 3: DOWNLOAD PAGE ==================== */}
        {activePage === 'download' && (
          <DownloadScreen
            theme={theme}
            results={results}
            activeImage={activeImage}
            activeResult={activeResult}
            sliderRef={sliderRef}
            sliderPos={sliderPos}
            handleMouseMove={handleMouseMove}
            handleTouchMove={handleTouchMove}
            handleMouseDown={handleMouseDown}
            handleTouchStart={handleTouchStart}
            formatSize={formatSize}
            downloadSingleResult={downloadSingleResult}
            downloadAll={downloadAll}
            share={share}
            copyLink={copyLink}
            resetAll={resetAll}
            t={t}
          />
        )}
      </main>

      {/* Loader/Progress Modal Overlay */}
      <ProcessingOverlay
        processing={processing}
        processingText={processingText}
        processingProgress={processingProgress}
      />

      {/* Footer */}
      <Footer theme={theme} t={t} />

      {isCropping && activeImage && (
        <ImageCropper
          imageUrl={activeImage.url}
          imageName={activeImage.name}
          theme={theme}
          onCropSave={handleCropSave}
          onClose={() => setIsCropping(false)}
        />
      )}
    </div>
  );
}
