export interface ProcessedImage {
  id: string;
  file: File;
  name: string;
  size: number;
  width: number;
  height: number;
  url: string;
  type: string;
}

export interface ResizeResult {
  id: string;
  fileName: string;
  blob: Blob;
  url: string;
  originalWidth: number;
  originalHeight: number;
  newWidth: number;
  newHeight: number;
  originalName: string;
  originalSize: number;
  newSize: number;
  qualityUsed: number | null;
  targetSizeUsed: boolean;
}

export interface PresetItem {
  icon: string;
  name: string;
  w: number;
  h: number;
  hint: string;
}
