import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Crop, RotateCw, RotateCcw, RefreshCw } from 'lucide-react';

interface ImageCropperProps {
  imageUrl: string;
  imageName: string;
  theme: 'dark' | 'light';
  onCropSave: (croppedBlob: Blob, croppedUrl: string, width: number, height: number) => void;
  onClose: () => void;
}

interface CropBox {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  w: number; // percentage (0-100)
  h: number; // percentage (0-100)
}

type AspectRatioType = 'free' | '1:1' | '3:4' | '4:3' | '16:9' | 'passport';

export default function ImageCropper({
  imageUrl,
  imageName,
  theme,
  onCropSave,
  onClose,
}: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const parentContainerRef = useRef<HTMLDivElement>(null);

  const [box, setBox] = useState<CropBox>({ x: 10, y: 10, w: 80, h: 80 });
  const [aspect, setAspect] = useState<AspectRatioType>('free');
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [isReady, setIsReady] = useState(false);
  const [rotation, setRotation] = useState<number>(0); // angle in degrees

  // Maximum dimensions of the preview box
  const [parentSize, setParentSize] = useState({ width: 500, height: 350 });

  // Dragging state
  const dragInfo = useRef<{
    active: boolean;
    handle: string | null;
    startX: number;
    startY: number;
    startBox: CropBox;
    containerWidth: number;
    containerHeight: number;
    containerLeft: number;
    containerTop: number;
  }>({
    active: false,
    handle: null,
    startX: 0,
    startY: 0,
    startBox: { x: 10, y: 10, w: 80, h: 80 },
    containerWidth: 0,
    containerHeight: 0,
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

  // Update parent preview boundaries based on current window / modal size
  const updateParentSize = () => {
    if (parentContainerRef.current) {
      const rect = parentContainerRef.current.getBoundingClientRect();
      const availableWidth = Math.max(280, rect.width - 32); // minus padding
      const availableHeight = Math.max(250, Math.min(380, window.innerHeight * 0.42));
      setParentSize({ width: availableWidth, height: availableHeight });
    }
  };

  useEffect(() => {
    updateParentSize();
    window.addEventListener('resize', updateParentSize);
    return () => window.removeEventListener('resize', updateParentSize);
  }, [isReady]);

  // Dynamic calculations of unrotated and rotated display sizes
  const getDisplaySizes = () => {
    if (naturalSize.width === 0 || naturalSize.height === 0) {
      return {
        unrotated: { width: 0, height: 0 },
        rotated: { width: 0, height: 0 }
      };
    }

    const imageRatio = naturalSize.width / naturalSize.height;

    // Start with a base display size that fits parent preview size
    let uw = parentSize.width;
    let uh = parentSize.width / imageRatio;

    if (uh > parentSize.height) {
      uh = parentSize.height;
      uw = parentSize.height * imageRatio;
    }

    // Now calculate rotated bounding box for this candidate size
    const angleRad = (rotation * Math.PI) / 180;
    const cos = Math.abs(Math.cos(angleRad));
    const sin = Math.abs(Math.sin(angleRad));

    const rotW = uw * cos + uh * sin;
    const rotH = uw * sin + uh * cos;

    // Scale factor to make sure the rotated bounding box fits entirely in the parentSize viewport
    let scale = 1;
    if (rotW > parentSize.width || rotH > parentSize.height) {
      scale = Math.min(parentSize.width / rotW, parentSize.height / rotH);
    }

    const w = uw * scale;
    const h = uh * scale;

    const rw = w * cos + h * sin;
    const rh = w * sin + h * cos;

    return {
      unrotated: { width: w, height: h },
      rotated: { width: rw, height: rh }
    };
  };

  const { unrotated: imgDispSize, rotated: containerDispSize } = getDisplaySizes();

  // Reset or adjust crop box to keep it inside the container bounds
  const applyAspectRatio = (ratioType: AspectRatioType) => {
    if (containerDispSize.width === 0 || containerDispSize.height === 0) return;

    let targetRatio = 1;
    if (ratioType === '1:1') targetRatio = 1;
    else if (ratioType === '3:4') targetRatio = 3 / 4;
    else if (ratioType === '4:3') targetRatio = 4 / 3;
    else if (ratioType === '16:9') targetRatio = 16 / 9;
    else if (ratioType === 'passport') targetRatio = 3.5 / 4.5;
    else {
      // Free aspect: reset to standard 80% box
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
      if (hPct > 90) {
        hPct = 90;
        wPct = 90 * percentageRatio;
      }
    } else {
      hPct = 80;
      wPct = 80 * percentageRatio;
      if (wPct > 90) {
        wPct = 90;
        hPct = 90 / percentageRatio;
      }
    }

    const xPct = (100 - wPct) / 2;
    const yPct = (100 - hPct) / 2;

    setBox({
      x: Math.max(0, xPct),
      y: Math.max(0, yPct),
      w: Math.min(100, wPct),
      h: Math.min(100, hPct),
    });
  };

  useEffect(() => {
    if (isReady && containerDispSize.width > 0) {
      applyAspectRatio(aspect);
    }
  }, [aspect, isReady, rotation, parentSize.width, parentSize.height]);

  // Handle Drag Start
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!containerRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const rect = containerRef.current.getBoundingClientRect();

    dragInfo.current = {
      active: true,
      handle,
      startX: clientX,
      startY: clientY,
      startBox: { ...box },
      containerWidth: rect.width,
      containerHeight: rect.height,
      containerLeft: rect.left,
      containerTop: rect.top,
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
  };

  // Handle Drag Move
  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!dragInfo.current.active) return;
    e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const info = dragInfo.current;
    
    // Convert startBox (which is %) to pixels relative to container
    const startLeft = (info.startBox.x / 100) * info.containerWidth;
    const startTop = (info.startBox.y / 100) * info.containerHeight;
    const startWidth = (info.startBox.w / 100) * info.containerWidth;
    const startHeight = (info.startBox.h / 100) * info.containerHeight;
    const startRight = startLeft + startWidth;
    const startBottom = startTop + startHeight;

    // Current pointer coordinate relative to container
    const currentX = clientX - info.containerLeft;
    const currentY = clientY - info.containerTop;

    const minSizePx = 25; // minimum crop box size in pixels to prevent collapse

    let newX = startLeft;
    let newY = startTop;
    let newW = startWidth;
    let newH = startHeight;

    if (info.handle === 'move') {
      const dx = clientX - info.startX;
      const dy = clientY - info.startY;
      newX = Math.max(0, Math.min(info.containerWidth - startWidth, startLeft + dx));
      newY = Math.max(0, Math.min(info.containerHeight - startHeight, startTop + dy));
    } else if (aspect === 'free') {
      // Free resizing
      if (info.handle.includes('e')) {
        const targetRight = Math.max(startLeft + minSizePx, Math.min(info.containerWidth, currentX));
        newW = targetRight - startLeft;
      }
      if (info.handle.includes('w')) {
        newX = Math.max(0, Math.min(startRight - minSizePx, currentX));
        newW = startRight - newX;
      }
      if (info.handle.includes('s')) {
        const targetBottom = Math.max(startTop + minSizePx, Math.min(info.containerHeight, currentY));
        newH = targetBottom - startTop;
      }
      if (info.handle.includes('n')) {
        newY = Math.max(0, Math.min(startBottom - minSizePx, currentY));
        newH = startBottom - newY;
      }
    } else {
      // Locked aspect ratio resizing
      let targetRatio = 1;
      if (aspect === '1:1') targetRatio = 1;
      else if (aspect === '3:4') targetRatio = 3 / 4;
      else if (aspect === '4:3') targetRatio = 4 / 3;
      else if (aspect === '16:9') targetRatio = 16 / 9;
      else if (aspect === 'passport') targetRatio = 3.5 / 4.5;

      const r = targetRatio;

      if (info.handle === 'se') {
        // Anchor is (startLeft, startTop)
        const mouseW = currentX - startLeft;
        const mouseH = currentY - startTop;
        
        // Project (mouseW, mouseH) onto w = h * r
        let h = (r * mouseW + mouseH) / (r * r + 1);
        let w = h * r;

        // Ensure minimum size
        if (w < minSizePx || h < minSizePx) {
          w = minSizePx;
          h = minSizePx / r;
        }

        // Bound to container bottom-right
        if (startLeft + w > info.containerWidth) {
          w = info.containerWidth - startLeft;
          h = w / r;
        }
        if (startTop + h > info.containerHeight) {
          h = info.containerHeight - startTop;
          w = h * r;
        }

        newW = w;
        newH = h;
      } else if (info.handle === 'sw') {
        // Anchor is (startRight, startTop)
        const mouseW = startRight - currentX;
        const mouseH = currentY - startTop;

        let h = (r * mouseW + mouseH) / (r * r + 1);
        let w = h * r;

        if (w < minSizePx || h < minSizePx) {
          w = minSizePx;
          h = minSizePx / r;
        }

        // Bound to container bottom-left
        if (startRight - w < 0) {
          w = startRight;
          h = w / r;
        }
        if (startTop + h > info.containerHeight) {
          h = info.containerHeight - startTop;
          w = h * r;
        }

        newX = startRight - w;
        newW = w;
        newH = h;
      } else if (info.handle === 'ne') {
        // Anchor is (startLeft, startBottom)
        const mouseW = currentX - startLeft;
        const mouseH = startBottom - currentY;

        let h = (r * mouseW + mouseH) / (r * r + 1);
        let w = h * r;

        if (w < minSizePx || h < minSizePx) {
          w = minSizePx;
          h = minSizePx / r;
        }

        // Bound to container top-right
        if (startLeft + w > info.containerWidth) {
          w = info.containerWidth - startLeft;
          h = w / r;
        }
        if (startBottom - h < 0) {
          h = startBottom;
          w = h * r;
        }

        newY = startBottom - h;
        newW = w;
        newH = h;
      } else if (info.handle === 'nw') {
        // Anchor is (startRight, startBottom)
        const mouseW = startRight - currentX;
        const mouseH = startBottom - currentY;

        let h = (r * mouseW + mouseH) / (r * r + 1);
        let w = h * r;

        if (w < minSizePx || h < minSizePx) {
          w = minSizePx;
          h = minSizePx / r;
        }

        // Bound to container top-left
        if (startRight - w < 0) {
          w = startRight;
          h = w / r;
        }
        if (startBottom - h < 0) {
          h = startBottom;
          w = h * r;
        }

        newX = startRight - w;
        newY = startBottom - h;
        newW = w;
        newH = h;
      }
    }

    // Convert back to percentages (0-100)
    const pctBox = {
      x: (newX / info.containerWidth) * 100,
      y: (newY / info.containerHeight) * 100,
      w: (newW / info.containerWidth) * 100,
      h: (newH / info.containerHeight) * 100,
    };

    // Final safety clamps
    pctBox.x = Math.max(0, Math.min(100 - pctBox.w, pctBox.x));
    pctBox.y = Math.max(0, Math.min(100 - pctBox.h, pctBox.y));

    setBox(pctBox);
  };

  // Handle Drag End
  const handleDragEnd = () => {
    dragInfo.current.active = false;
    dragInfo.current.handle = null;
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [aspect, box]);

  // Rotate helper: change rotation state safely
  const rotateLeft = () => {
    setRotation((prev) => (prev - 90 < -180 ? prev - 90 + 360 : prev - 90));
  };

  const rotateRight = () => {
    setRotation((prev) => (prev + 90 > 180 ? prev + 90 - 360 : prev + 90));
  };

  // Save the cropped image (applying rotation first)
  const saveCrop = () => {
    if (naturalSize.width === 0 || naturalSize.height === 0) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // 1. Create a full rotated canvas of the source image
      const angleRad = (rotation * Math.PI) / 180;
      const cos = Math.abs(Math.cos(angleRad));
      const sin = Math.abs(Math.sin(angleRad));
      
      const rWidth = Math.round(img.naturalWidth * cos + img.naturalHeight * sin);
      const rHeight = Math.round(img.naturalWidth * sin + img.naturalHeight * cos);

      const rotatedCanvas = document.createElement('canvas');
      rotatedCanvas.width = rWidth;
      rotatedCanvas.height = rHeight;
      const rotCtx = rotatedCanvas.getContext('2d');

      if (!rotCtx) return;

      // Draw rotated original image at center of rotated canvas
      rotCtx.translate(rWidth / 2, rHeight / 2);
      rotCtx.rotate(angleRad);
      rotCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      // 2. Crop the designated selection from the rotated canvas
      const cropX = Math.round((box.x / 100) * rWidth);
      const cropY = Math.round((box.y / 100) * rHeight);
      const cropW = Math.round((box.w / 100) * rWidth);
      const cropH = Math.round((box.h / 100) * rHeight);

      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = cropW;
      cropCanvas.height = cropH;
      const cropCtx = cropCanvas.getContext('2d');

      if (!cropCtx) return;

      cropCtx.drawImage(rotatedCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      const mimeType = imageUrl.includes('image/png')
        ? 'image/png'
        : imageUrl.includes('image/webp')
          ? 'image/webp'
          : 'image/jpeg';

      cropCanvas.toBlob((blob) => {
        if (blob) {
          const newUrl = URL.createObjectURL(blob);
          onCropSave(blob, newUrl, cropW, cropH);
        }
      }, mimeType, 0.96);
    };
    img.src = imageUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] ${
        theme === 'dark' ? 'bg-[#1e1f20] border border-[#2d2f31]' : 'bg-white'
      }`}>
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          theme === 'dark' ? 'border-[#2d2f31]' : 'border-gray-100'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1a73e8]/10 text-[#1a73e8] flex items-center justify-center">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Professional Crop & Rotate
              </h3>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[280px] sm:max-w-md">
                {imageName} · {naturalSize.width} × {naturalSize.height} px
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2d2f31] transition-all cursor-pointer ${
              theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Active Cropper Stage */}
        <div 
          ref={parentContainerRef}
          className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center min-h-[250px] bg-black/10 dark:bg-black/40 relative"
        >
          {isReady && containerDispSize.width > 0 && (
            <div
              ref={containerRef}
              className="relative select-none"
              style={{
                width: `${containerDispSize.width}px`,
                height: `${containerDispSize.height}px`,
              }}
            >
              {/* Centered Rotated Image */}
              <img
                src={imageUrl}
                alt="To Crop"
                className="absolute shadow-lg border border-white/5 bg-checkered rounded"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                  width: `${imgDispSize.width}px`,
                  height: `${imgDispSize.height}px`,
                  maxWidth: 'none',
                  maxHeight: 'none',
                }}
                draggable={false}
              />

              {/* Backdrop masks (top, bottom, left, right) */}
              <div
                className="absolute bg-black/60 transition-all duration-75 pointer-events-none"
                style={{ top: 0, left: 0, right: 0, height: `${box.y}%` }}
              />
              <div
                className="absolute bg-black/60 transition-all duration-75 pointer-events-none"
                style={{ bottom: 0, left: 0, right: 0, height: `${100 - (box.y + box.h)}%` }}
              />
              <div
                className="absolute bg-black/60 transition-all duration-75 pointer-events-none"
                style={{ top: `${box.y}%`, left: 0, width: `${box.x}%`, height: `${box.h}%` }}
              />
              <div
                className="absolute bg-black/60 transition-all duration-75 pointer-events-none"
                style={{ top: `${box.y}%`, right: 0, width: `${100 - (box.x + box.w)}%`, height: `${box.h}%` }}
              />

              {/* Crop Box Container */}
              <div
                className="absolute border border-dashed border-[#1a73e8] dark:border-[#8ab4f8] shadow-[0_0_0_2px_rgba(255,255,255,0.5)] cursor-move transition-all duration-75"
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.w}%`,
                  height: `${box.h}%`,
                }}
                onMouseDown={(e) => handleDragStart(e, 'move')}
                onTouchStart={(e) => handleDragStart(e, 'move')}
              >
                {/* Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-50">
                  <div className="border-r border-dashed border-white/40 border-b" />
                  <div className="border-r border-dashed border-white/40 border-b" />
                  <div className="border-b border-dashed border-white/40" />
                  <div className="border-r border-dashed border-white/40 border-b" />
                  <div className="border-r border-dashed border-white/40 border-b" />
                  <div className="border-b border-dashed border-white/40" />
                  <div className="border-r border-dashed border-white/40" />
                  <div className="border-r border-dashed border-white/40" />
                  <div />
                </div>

                {/* Handles */}
                {/* Corners */}
                <div
                  className="absolute -top-1.5 -left-1.5 w-4.5 h-4.5 bg-[#1a73e8] dark:bg-[#8ab4f8] border-2 border-white rounded-full cursor-nwse-resize shadow-md"
                  onMouseDown={(e) => handleDragStart(e, 'nw')}
                  onTouchStart={(e) => handleDragStart(e, 'nw')}
                />
                <div
                  className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-[#1a73e8] dark:bg-[#8ab4f8] border-2 border-white rounded-full cursor-nesw-resize shadow-md"
                  onMouseDown={(e) => handleDragStart(e, 'ne')}
                  onTouchStart={(e) => handleDragStart(e, 'ne')}
                />
                <div
                  className="absolute -bottom-1.5 -left-1.5 w-4.5 h-4.5 bg-[#1a73e8] dark:bg-[#8ab4f8] border-2 border-white rounded-full cursor-nesw-resize shadow-md"
                  onMouseDown={(e) => handleDragStart(e, 'sw')}
                  onTouchStart={(e) => handleDragStart(e, 'sw')}
                />
                <div
                  className="absolute -bottom-1.5 -right-1.5 w-4.5 h-4.5 bg-[#1a73e8] dark:bg-[#8ab4f8] border-2 border-white rounded-full cursor-nwse-resize shadow-md"
                  onMouseDown={(e) => handleDragStart(e, 'se')}
                  onTouchStart={(e) => handleDragStart(e, 'se')}
                />

                {/* Edges (Only for free aspect) */}
                {aspect === 'free' && (
                  <>
                    <div
                      className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-[#1a73e8] dark:border-[#8ab4f8] rounded-md cursor-ew-resize shadow-md"
                      onMouseDown={(e) => handleDragStart(e, 'w')}
                      onTouchStart={(e) => handleDragStart(e, 'w')}
                    />
                    <div
                      className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-[#1a73e8] dark:border-[#8ab4f8] rounded-md cursor-ew-resize shadow-md"
                      onMouseDown={(e) => handleDragStart(e, 'e')}
                      onTouchStart={(e) => handleDragStart(e, 'e')}
                    />
                    <div
                      className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-[#1a73e8] dark:border-[#8ab4f8] rounded-md cursor-ns-resize shadow-md"
                      onMouseDown={(e) => handleDragStart(e, 'n')}
                      onTouchStart={(e) => handleDragStart(e, 'n')}
                    />
                    <div
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-[#1a73e8] dark:border-[#8ab4f8] rounded-md cursor-ns-resize shadow-md"
                      onMouseDown={(e) => handleDragStart(e, 's')}
                      onTouchStart={(e) => handleDragStart(e, 's')}
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className={`px-6 py-5 border-t flex flex-col gap-4.5 ${
          theme === 'dark' ? 'border-[#2d2f31] bg-[#1e1f20]' : 'border-gray-100 bg-gray-50'
        }`}>
          {/* Section 1: Rotation Slider & Fast Rotate Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-4.5 border-dashed border-gray-200 dark:border-[#2d2f31]">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                🔄 Rotate:
              </span>
              <button
                type="button"
                onClick={rotateLeft}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                  theme === 'dark'
                    ? 'border-[#3c4043] bg-[#131314] hover:bg-[#2d2f31] text-gray-300 hover:text-white'
                    : 'border-gray-200 bg-white hover:bg-gray-100 text-slate-700'
                }`}
                title="Rotate 90° Left"
              >
                <RotateCcw className="w-3.5 h-3.5" /> -90°
              </button>
              <button
                type="button"
                onClick={rotateRight}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                  theme === 'dark'
                    ? 'border-[#3c4043] bg-[#131314] hover:bg-[#2d2f31] text-gray-300 hover:text-white'
                    : 'border-gray-200 bg-white hover:bg-gray-100 text-slate-700'
                }`}
                title="Rotate 90° Right"
              >
                <RotateCw className="w-3.5 h-3.5" /> +90°
              </button>
            </div>

            {/* Slider with precise values */}
            <div className="flex items-center gap-3.5 w-full sm:flex-1 sm:max-w-md">
              <input
                type="range"
                min="-180"
                max="180"
                step="0.5"
                value={rotation}
                onChange={(e) => setRotation(parseFloat(e.target.value))}
                className="flex-1 accent-[#1a73e8]"
              />
              <span className="text-xs font-mono font-bold text-[#1a73e8] dark:text-[#8ab4f8] w-14 text-right">
                {rotation > 0 ? `+${rotation.toFixed(1)}` : `${rotation.toFixed(1)}`}°
              </span>
              {rotation !== 0 && (
                <button
                  type="button"
                  onClick={() => setRotation(0)}
                  className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-[#2d2f31] text-red-500 transition-colors"
                  title="Reset rotation"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Section 2: Aspect Ratio Presets & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Aspect Ratio Buttons */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {(
                [
                  { id: 'free', label: 'Free' },
                  { id: '1:1', label: '1:1 Square' },
                  { id: '3:4', label: '3:4 Portrait' },
                  { id: '4:3', label: '4:3 Landscape' },
                  { id: '16:9', label: '16:9 Wide' },
                  { id: 'passport', label: '🛂 Passport' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setAspect(item.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    aspect === item.id
                      ? 'bg-[#1a73e8] text-white shadow-sm'
                      : theme === 'dark'
                        ? 'bg-[#131314] hover:bg-[#2d2f31] text-[#9aa0a6] hover:text-white'
                        : 'bg-white border border-gray-200 hover:bg-gray-100 text-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-[#3c4043] text-gray-300 hover:bg-[#2d2f31] hover:text-white'
                    : 'border-gray-200 text-slate-700 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={saveCrop}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-bold bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-md transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" /> Crop & Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
