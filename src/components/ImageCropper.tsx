import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Check, Crop, RotateCw, RotateCcw, RefreshCw } from 'lucide-react';

interface ImageCropperProps {
  imageUrl: string;
  imageName: string;
  theme: 'dark' | 'light';
  onCropSave: (croppedBlob: Blob, croppedUrl: string, width: number, height: number) => void;
  onClose: () => void;
  t?: (key: string, params?: any) => string;
  lang?: string;
}

interface CropBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

type AspectRatioType = 'free' | '1:1' | '3:4' | '4:3' | '16:9' | 'passport';

// Aspect ratio presets
const ASPECT_RATIOS: Record<Exclude<AspectRatioType, 'free'>, number> = {
  '1:1': 1,
  '3:4': 3 / 4,
  '4:3': 4 / 3,
  '16:9': 16 / 9,
  'passport': 3.5 / 4.5
};

export default function ImageCropper({
  imageUrl,
  imageName,
  theme,
  onCropSave,
  onClose,
  t,
  lang,
}: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const parentContainerRef = useRef<HTMLDivElement>(null);

  const [box, setBox] = useState<CropBox>({ x: 10, y: 10, w: 80, h: 80 });
  const [aspect, setAspect] = useState<AspectRatioType>('free');
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [isReady, setIsReady] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Ref-based values to avoid stale closure in drag handlers
  const aspectRef = useRef(aspect);
  const boxRef = useRef(box);
  const rotationRef = useRef(rotation);
  const naturalSizeRef = useRef(naturalSize);

  // Keep refs in sync with state
  useEffect(() => { aspectRef.current = aspect; }, [aspect]);
  useEffect(() => { boxRef.current = box; }, [box]);
  useEffect(() => { rotationRef.current = rotation; }, [rotation]);
  useEffect(() => { naturalSizeRef.current = naturalSize; }, [naturalSize]);

  const [parentSize, setParentSize] = useState({ width: 400, height: 300 });

  // Dragging state in refs (no stale closure issues)
  const dragState = useRef({
    active: false,
    handle: null as string | null,
    startX: 0,
    startY: 0,
    startBox: { x: 10, y: 10, w: 80, h: 80 },
    containerWidth: 500,
    containerHeight: 350,
    containerLeft: 0,
    containerTop: 0,
  });

  // Load natural image dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      setIsReady(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Responsive container sizing
  const updateParentSize = useCallback(() => {
    if (parentContainerRef.current) {
      const rect = parentContainerRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // For small screens (mobile): use most of the viewport
      // For large screens: cap at reasonable dimensions
      const maxW = vw < 640 ? vw - 32 : Math.min(rect.width - 32, 600);
      const maxH = vw < 640 ? vh * 0.4 : Math.min(vh * 0.42, 380);

      setParentSize({
        width: Math.max(220, maxW),
        height: Math.max(200, maxH),
      });
    }
  }, []);

  useEffect(() => {
    updateParentSize();
    window.addEventListener('resize', updateParentSize);
    return () => window.removeEventListener('resize', updateParentSize);
  }, [isReady, updateParentSize]);

  // Compute display sizes
  const getDisplaySizes = useCallback(() => {
    const ns = naturalSizeRef.current;
    const rot = rotationRef.current;
    if (ns.width === 0 || ns.height === 0) {
      return { unrotated: { width: 0, height: 0 }, rotated: { width: 0, height: 0 } };
    }

    const imageRatio = ns.width / ns.height;
    let uw = parentSize.width;
    let uh = parentSize.width / imageRatio;

    if (uh > parentSize.height) {
      uh = parentSize.height;
      uw = parentSize.height * imageRatio;
    }

    const angleRad = (rot * Math.PI) / 180;
    const cos = Math.abs(Math.cos(angleRad));
    const sin = Math.abs(Math.sin(angleRad));

    const rotW = uw * cos + uh * sin;
    const rotH = uw * sin + uh * cos;

    let scale = 1;
    if (rotW > parentSize.width || rotH > parentSize.height) {
      scale = Math.min(parentSize.width / rotW, parentSize.height / rotH);
    }

    const w = uw * scale;
    const h = uh * scale;
    const rw = w * cos + h * sin;
    const rh = w * sin + h * cos;

    return {
      unrotated: { width: Math.round(w), height: Math.round(h) },
      rotated: { width: Math.round(rw), height: Math.round(rh) }
    };
  }, [parentSize]);

  const display = getDisplaySizes();
  const imgDispSize = display.unrotated;
  const containerDispSize = display.rotated;

  // Apply aspect ratio
  const applyAspectRatio = useCallback((ratioType: AspectRatioType) => {
    if (containerDispSize.width === 0 || containerDispSize.height === 0) return;

    let targetRatio = ratioType === 'free' ? null : ASPECT_RATIOS[ratioType];

    if (!targetRatio) {
      setBox({ x: 10, y: 10, w: 80, h: 80 });
      return;
    }

    const containerRatio = containerDispSize.width / containerDispSize.height;
    let wPct = 80;
    let hPct = 80;
    const percentageRatio = targetRatio / containerRatio;

    if (percentageRatio > 1) {
      wPct = 80;
      hPct = 80 / percentageRatio;
      if (hPct > 90) { hPct = 90; wPct = 90 * percentageRatio; }
    } else {
      hPct = 80;
      wPct = 80 * percentageRatio;
      if (wPct > 90) { wPct = 90; hPct = 90 / percentageRatio; }
    }

    setBox({
      x: Math.max(0, (100 - wPct) / 2),
      y: Math.max(0, (100 - hPct) / 2),
      w: Math.min(100, wPct),
      h: Math.min(100, hPct),
    });
  }, [containerDispSize]);

  useEffect(() => {
    if (isReady && containerDispSize.width > 0) {
      applyAspectRatio(aspect);
    }
  }, [aspect, isReady, rotation, parentSize.width, parentSize.height, applyAspectRatio, containerDispSize]);

  // === DRAG HANDLERS (using refs to avoid stale closures) ===

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    const ds = dragState.current;
    if (!ds.active) return;
    e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    // Always read latest values from refs
    const currentAspect = aspectRef.current;
    const startBox = ds.startBox;

    const startLeft = (startBox.x / 100) * ds.containerWidth;
    const startTop = (startBox.y / 100) * ds.containerHeight;
    const startWidth = (startBox.w / 100) * ds.containerWidth;
    const startHeight = (startBox.h / 100) * ds.containerHeight;
    const startRight = startLeft + startWidth;
    const startBottom = startTop + startHeight;

    const currentX = clientX - ds.containerLeft;
    const currentY = clientY - ds.containerTop;
    const minPx = 25;
    const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

    let newX = startLeft;
    let newY = startTop;
    let newW = startWidth;
    let newH = startHeight;

    if (ds.handle === 'move') {
      const dx = clientX - ds.startX;
      const dy = clientY - ds.startY;
      newX = Math.max(0, Math.min(ds.containerWidth - startWidth, startLeft + dx));
      newY = Math.max(0, Math.min(ds.containerHeight - startHeight, startTop + dy));
    } else if (currentAspect === 'free') {
      if (ds.handle!.includes('e')) {
        newW = Math.max(startLeft + minPx, Math.min(ds.containerWidth, currentX)) - startLeft;
      }
      if (ds.handle!.includes('w')) {
        newX = Math.max(0, Math.min(startRight - minPx, currentX));
        newW = startRight - newX;
      }
      if (ds.handle!.includes('s')) {
        newH = Math.max(startTop + minPx, Math.min(ds.containerHeight, currentY)) - startTop;
      }
      if (ds.handle!.includes('n')) {
        newY = Math.max(0, Math.min(startBottom - minPx, currentY));
        newH = startBottom - newY;
      }
    } else {
      // Locked aspect ratio
      const targetRatio = ASPECT_RATIOS[currentAspect as Exclude<AspectRatioType, 'free'>] || 1;
      const r = targetRatio;

      if (ds.handle === 'se') {
        const mouseW = currentX - startLeft;
        const mouseH = currentY - startTop;
        let h = (r * mouseW + mouseH) / (r * r + 1);
        let w = h * r;
        if (w < minPx || h < minPx) { w = minPx; h = minPx / r; }
        if (startLeft + w > ds.containerWidth) { w = ds.containerWidth - startLeft; h = w / r; }
        if (startTop + h > ds.containerHeight) { h = ds.containerHeight - startTop; w = h * r; }
        newW = w; newH = h;
      } else if (ds.handle === 'sw') {
        const mouseW = startRight - currentX;
        const mouseH = currentY - startTop;
        let h = (r * mouseW + mouseH) / (r * r + 1);
        let w = h * r;
        if (w < minPx || h < minPx) { w = minPx; h = minPx / r; }
        if (startRight - w < 0) { w = startRight; h = w / r; }
        if (startTop + h > ds.containerHeight) { h = ds.containerHeight - startTop; w = h * r; }
        newX = startRight - w; newW = w; newH = h;
      } else if (ds.handle === 'ne') {
        const mouseW = currentX - startLeft;
        const mouseH = startBottom - currentY;
        let h = (r * mouseW + mouseH) / (r * r + 1);
        let w = h * r;
        if (w < minPx || h < minPx) { w = minPx; h = minPx / r; }
        if (startLeft + w > ds.containerWidth) { w = ds.containerWidth - startLeft; h = w / r; }
        if (startBottom - h < 0) { h = startBottom; w = h * r; }
        newY = startBottom - h; newW = w; newH = h;
      } else if (ds.handle === 'nw') {
        const mouseW = startRight - currentX;
        const mouseH = startBottom - currentY;
        let h = (r * mouseW + mouseH) / (r * r + 1);
        let w = h * r;
        if (w < minPx || h < minPx) { w = minPx; h = minPx / r; }
        if (startRight - w < 0) { w = startRight; h = w / r; }
        if (startBottom - h < 0) { h = startBottom; w = h * r; }
        newX = startRight - w; newY = startBottom - h; newW = w; newH = h;
      }
    }

    const pctBox: CropBox = {
      x: clamp((newX / ds.containerWidth) * 100, 0, 100),
      y: clamp((newY / ds.containerHeight) * 100, 0, 100),
      w: clamp((newW / ds.containerWidth) * 100, 0, 100),
      h: clamp((newH / ds.containerHeight) * 100, 0, 100),
    };

    // Ensure box stays within container
    pctBox.x = Math.max(0, Math.min(100 - pctBox.w, pctBox.x));
    pctBox.y = Math.max(0, Math.min(100 - pctBox.h, pctBox.y));

    setBox(pctBox);
  }, []); // No deps needed - all values read from refs

  const handleDragEnd = useCallback(() => {
    dragState.current.active = false;
    dragState.current.handle = null;
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);
  }, [handleDragMove]);

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!containerRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const rect = containerRef.current.getBoundingClientRect();

    dragState.current = {
      active: true,
      handle,
      startX: clientX,
      startY: clientY,
      startBox: { ...boxRef.current },
      containerWidth: rect.width,
      containerHeight: rect.height,
      containerLeft: rect.left,
      containerTop: rect.top,
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
  }, [handleDragMove, handleDragEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  // Rotate helpers
  const rotateLeft = () => setRotation(p => (p - 90 < -180 ? p - 90 + 360 : p - 90));
  const rotateRight = () => setRotation(p => (p + 90 > 180 ? p + 90 - 360 : p + 90));

  // Save cropped image
  const saveCrop = () => {
    const ns = naturalSizeRef.current;
    const rot = rotationRef.current;
    if (ns.width === 0 || ns.height === 0) return;
    const currentBox = boxRef.current;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const angleRad = (rot * Math.PI) / 180;
      const cos = Math.abs(Math.cos(angleRad));
      const sin = Math.abs(Math.sin(angleRad));

      const rWidth = Math.round(img.naturalWidth * cos + img.naturalHeight * sin);
      const rHeight = Math.round(img.naturalWidth * sin + img.naturalHeight * cos);

      const rotatedCanvas = document.createElement('canvas');
      rotatedCanvas.width = rWidth;
      rotatedCanvas.height = rHeight;
      const rotCtx = rotatedCanvas.getContext('2d');
      if (!rotCtx) return;

      rotCtx.translate(rWidth / 2, rHeight / 2);
      rotCtx.rotate(angleRad);
      rotCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      const cropX = Math.round((currentBox.x / 100) * rWidth);
      const cropY = Math.round((currentBox.y / 100) * rHeight);
      const cropW = Math.round((currentBox.w / 100) * rWidth);
      const cropH = Math.round((currentBox.h / 100) * rHeight);

      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = cropW;
      cropCanvas.height = cropH;
      const cropCtx = cropCanvas.getContext('2d');
      if (!cropCtx) return;

      cropCtx.drawImage(rotatedCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      // Determine MIME type from original or prefer JPEG
      const mimeType = imageUrl.includes('image/png') ? 'image/png'
        : imageUrl.includes('image/webp') ? 'image/webp'
        : 'image/jpeg';

      cropCanvas.toBlob((blob) => {
        if (blob) {
          onCropSave(blob, URL.createObjectURL(blob), cropW, cropH);
        }
      }, mimeType, 0.96);
    };
    img.src = imageUrl;
  };

  const localized = (key: string, def: string) => t ? t(key) : def;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-4xl rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[98vh] sm:max-h-[95vh] ${
        theme === 'dark' ? 'bg-[#1e1f20] border border-[#2d2f31]' : 'bg-white'
      }`}>
        {/* Modal Header - compact on mobile */}
        <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between ${
          theme === 'dark' ? 'border-[#2d2f31]' : 'border-gray-100'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1a73e8]/10 text-[#1a73e8] flex items-center justify-center flex-shrink-0">
              <Crop className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                {localized('editor.cropTitle', 'Crop & Rotate')}
              </h3>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[180px] sm:max-w-md">
                {imageName} · {naturalSize.width}×{naturalSize.height}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className={`p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2d2f31] transition-all cursor-pointer flex-shrink-0 ${
              theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-slate-900'
            }`}>
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Body - Crop Stage */}
        <div ref={parentContainerRef}
          className="flex-1 overflow-hidden p-2 sm:p-4 md:p-6 flex flex-col items-center justify-center min-h-[200px] sm:min-h-[250px] bg-black/10 dark:bg-black/40 relative">
          {isReady && containerDispSize.width > 0 && (
            <div ref={containerRef}
              className="relative select-none"
              style={{
                width: `${containerDispSize.width}px`,
                height: `${containerDispSize.height}px`,
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            >
              {/* Rotated Image */}
              <img src={imageUrl} alt="To Crop"
                className="absolute shadow-lg border border-white/5 bg-checkered rounded"
                style={{
                  left: '50%', top: '50%',
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                  width: `${imgDispSize.width}px`,
                  height: `${imgDispSize.height}px`,
                  maxWidth: 'none', maxHeight: 'none',
                }}
                draggable={false} />

              {/* Backdrop masks */}
              <div className="absolute bg-black/60 pointer-events-none" style={{ top: 0, left: 0, right: 0, height: `${box.y}%` }} />
              <div className="absolute bg-black/60 pointer-events-none" style={{ bottom: 0, left: 0, right: 0, height: `${100 - (box.y + box.h)}%` }} />
              <div className="absolute bg-black/60 pointer-events-none" style={{ top: `${box.y}%`, left: 0, width: `${box.x}%`, height: `${box.h}%` }} />
              <div className="absolute bg-black/60 pointer-events-none" style={{ top: `${box.y}%`, right: 0, width: `${100 - (box.x + box.w)}%`, height: `${box.h}%` }} />

              {/* Crop Box */}
              <div className="absolute border border-dashed border-[#1a73e8] dark:border-[#8ab4f8] shadow-[0_0_0_2px_rgba(255,255,255,0.5)] cursor-move"
                style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%` }}
                onMouseDown={(e) => handleDragStart(e, 'move')}
                onTouchStart={(e) => handleDragStart(e, 'move')}
                onPointerDown={(e) => e.stopPropagation()}>
                {/* Grid guide lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                  <div className="border-r border-dashed border-white/50 border-b" />
                  <div className="border-r border-dashed border-white/50 border-b" />
                  <div className="border-b border-dashed border-white/50" />
                  <div className="border-r border-dashed border-white/50 border-b" />
                  <div className="border-r border-dashed border-white/50 border-b" />
                  <div className="border-b border-dashed border-white/50" />
                  <div className="border-r border-dashed border-white/50" />
                  <div className="border-r border-dashed border-white/50" />
                  <div />
                </div>

                {/* Corner handles - larger touch targets */}
                <div className="absolute -top-3.5 -left-3.5 w-7 h-7 bg-[#1a73e8] dark:bg-[#8ab4f8] border-[2.5px] border-white rounded-full cursor-nwse-resize shadow-lg z-10 hover:scale-125 transition-transform"
                  onMouseDown={(e) => { e.stopPropagation(); handleDragStart(e, 'nw'); }}
                  onTouchStart={(e) => { e.stopPropagation(); handleDragStart(e, 'nw'); }} />
                <div className="absolute -top-3.5 -right-3.5 w-7 h-7 bg-[#1a73e8] dark:bg-[#8ab4f8] border-[2.5px] border-white rounded-full cursor-nesw-resize shadow-lg z-10 hover:scale-125 transition-transform"
                  onMouseDown={(e) => { e.stopPropagation(); handleDragStart(e, 'ne'); }}
                  onTouchStart={(e) => { e.stopPropagation(); handleDragStart(e, 'ne'); }} />
                <div className="absolute -bottom-3.5 -left-3.5 w-7 h-7 bg-[#1a73e8] dark:bg-[#8ab4f8] border-[2.5px] border-white rounded-full cursor-nesw-resize shadow-lg z-10 hover:scale-125 transition-transform"
                  onMouseDown={(e) => { e.stopPropagation(); handleDragStart(e, 'sw'); }}
                  onTouchStart={(e) => { e.stopPropagation(); handleDragStart(e, 'sw'); }} />
                <div className="absolute -bottom-3.5 -right-3.5 w-7 h-7 bg-[#1a73e8] dark:bg-[#8ab4f8] border-[2.5px] border-white rounded-full cursor-nwse-resize shadow-lg z-10 hover:scale-125 transition-transform"
                  onMouseDown={(e) => { e.stopPropagation(); handleDragStart(e, 'se'); }}
                  onTouchStart={(e) => { e.stopPropagation(); handleDragStart(e, 'se'); }} />

                {/* Edge handles - free aspect only */}
                {aspect === 'free' && (
                  <>
                    <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-12 bg-white border-2 border-[#1a73e8] dark:border-[#8ab4f8] rounded-md cursor-ew-resize shadow-lg z-10 hover:scale-110 transition-transform"
                      onMouseDown={(e) => { e.stopPropagation(); handleDragStart(e, 'w'); }}
                      onTouchStart={(e) => { e.stopPropagation(); handleDragStart(e, 'w'); }} />
                    <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-12 bg-white border-2 border-[#1a73e8] dark:border-[#8ab4f8] rounded-md cursor-ew-resize shadow-lg z-10 hover:scale-110 transition-transform"
                      onMouseDown={(e) => { e.stopPropagation(); handleDragStart(e, 'e'); }}
                      onTouchStart={(e) => { e.stopPropagation(); handleDragStart(e, 'e'); }} />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-white border-2 border-[#1a73e8] dark:border-[#8ab4f8] rounded-md cursor-ns-resize shadow-lg z-10 hover:scale-110 transition-transform"
                      onMouseDown={(e) => { e.stopPropagation(); handleDragStart(e, 'n'); }}
                      onTouchStart={(e) => { e.stopPropagation(); handleDragStart(e, 'n'); }} />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-white border-2 border-[#1a73e8] dark:border-[#8ab4f8] rounded-md cursor-ns-resize shadow-lg z-10 hover:scale-110 transition-transform"
                      onMouseDown={(e) => { e.stopPropagation(); handleDragStart(e, 's'); }}
                      onTouchStart={(e) => { e.stopPropagation(); handleDragStart(e, 's'); }} />
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className={`px-3 sm:px-6 py-3 sm:py-5 border-t flex flex-col gap-3 sm:gap-4 ${
          theme === 'dark' ? 'border-[#2d2f31] bg-[#1e1f20]' : 'border-gray-100 bg-gray-50'
        }`}>
          {/* Rotation controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 border-b pb-3 sm:pb-4 border-dashed border-gray-200 dark:border-[#2d2f31]">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                🔄 {localized('editor.rotate', 'Rotate')}:
              </span>
              <button type="button" onClick={rotateLeft}
                className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-[10px] sm:text-xs font-semibold ${theme === 'dark' ? 'border-[#3c4043] bg-[#131314] hover:bg-[#2d2f31] text-gray-300' : 'border-gray-200 bg-white hover:bg-gray-100 text-slate-700'}`}
                title={localized('editor.rotateLeft', 'Rotate 90° Left')}>
                <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> -90°
              </button>
              <button type="button" onClick={rotateRight}
                className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-[10px] sm:text-xs font-semibold ${theme === 'dark' ? 'border-[#3c4043] bg-[#131314] hover:bg-[#2d2f31] text-gray-300' : 'border-gray-200 bg-white hover:bg-gray-100 text-slate-700'}`}
                title={localized('editor.rotateRight', 'Rotate 90° Right')}>
                <RotateCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> +90°
              </button>
            </div>
            <div className="flex items-center gap-2 w-full sm:flex-1 sm:max-w-xs">
              <input type="range" min="-180" max="180" step="0.5" value={rotation}
                onChange={(e) => setRotation(parseFloat(e.target.value))}
                className="flex-1 accent-[#1a73e8] h-1 sm:h-1.5" />
              <span className="text-[10px] sm:text-xs font-mono font-bold text-[#1a73e8] dark:text-[#8ab4f8] w-12 sm:w-14 text-right flex-shrink-0">
                {rotation > 0 ? `+${rotation.toFixed(0)}` : `${rotation.toFixed(0)}`}°
              </span>
              {rotation !== 0 && (
                <button type="button" onClick={() => setRotation(0)}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-[#2d2f31] text-red-500 transition-colors flex-shrink-0"
                  title={localized('editor.resetRotation', 'Reset rotation')}>
                  <RefreshCw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Aspect ratio + actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1 justify-center">
              {([
                { id: 'free' as const, label: localized('crop.free', 'Free') },
                { id: '1:1' as const, label: '1:1' },
                { id: '3:4' as const, label: '3:4' },
                { id: '4:3' as const, label: '4:3' },
                { id: '16:9' as const, label: '16:9' },
                { id: 'passport' as const, label: '🛂' },
              ]).map((item) => (
                <button key={item.id} onClick={() => setAspect(item.id)}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold transition-all cursor-pointer ${
                    aspect === item.id
                      ? 'bg-[#1a73e8] text-white shadow-sm'
                      : theme === 'dark' ? 'bg-[#131314] hover:bg-[#2d2f31] text-[#9aa0a6] hover:text-white'
                      : 'bg-white border border-gray-200 hover:bg-gray-100 text-slate-700'
                  }`}>
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={onClose}
                className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-bold border transition-all cursor-pointer ${
                  theme === 'dark' ? 'border-[#3c4043] text-gray-300 hover:bg-[#2d2f31]' : 'border-gray-200 text-slate-700 hover:bg-gray-100'
                }`}>
                {localized('editor.cancel', 'Cancel')}
              </button>
              <button onClick={saveCrop}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-bold bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-md transition-all cursor-pointer">
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                {localized('editor.cropAndSave', 'Crop')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}