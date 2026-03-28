'use strict';

let removeBackgroundFn = null;
let preloadFn = null;

const MODEL_VERSION = '1.6.0';
const MODEL_CONFIGS = [
  {
    publicPath: `https://cdn.jsdelivr.net/npm/@imgly/background-removal-data@${MODEL_VERSION}/dist/`,
    model: 'isnet_quint8',
    device: 'cpu'
  },
  {
    publicPath: `https://unpkg.com/@imgly/background-removal-data@${MODEL_VERSION}/dist/`,
    model: 'isnet_quint8',
    device: 'cpu'
  },
  {
    publicPath: `https://staticimgly.com/@imgly/background-removal-data/${MODEL_VERSION}/dist/`,
    model: 'isnet_fp16',
    device: 'cpu'
  }
];

const App = {
  utils: window.ImageRunnerUtils || {},

  sourceFile: null,
  sourceUrl: '',
  outputBlob: null,
  outputUrl: '',
  processingInputBlob: null,
  processingInputUrl: '',
  activeModelConfig: null,
  modelReady: false,
  isProcessing: false,
  customBgImage: null,
  compareDragging: false,
  modelProgressTimer: null,

  el: {},

  init() {
    this.cache();
    this.bind();
    this.syncCompare(50);
    this.updateModeVisibility();
    this.warmupModel();
  },

  cache() {
    this.el = {
      modelState: document.getElementById('model-state'),
      modelProgressText: document.getElementById('model-progress-text'),
      modelProgressBar: document.getElementById('model-progress-bar'),
      dropzone: document.getElementById('dropzone'),
      fileInput: document.getElementById('file-input'),
      uploadNote: document.getElementById('upload-note'),
      previewNote: document.getElementById('preview-note'),
      processNote: document.getElementById('process-note'),

      beforeImg: document.getElementById('before-img'),
      beforeWrap: document.getElementById('before-wrap'),
      compare: document.getElementById('compare'),
      afterImg: document.getElementById('after-img'),
      afterWrap: document.getElementById('after-wrap'),
      divider: document.getElementById('divider'),
      compareHandle: document.getElementById('compare-handle'),
      compareSlider: document.getElementById('compare-slider'),

      edgeSoftness: document.getElementById('edge-softness'),
      edgeSoftnessValue: document.getElementById('edge-softness-value'),
      alphaBoost: document.getElementById('alpha-boost'),
      alphaBoostValue: document.getElementById('alpha-boost-value'),

      bgMode: document.getElementById('bg-mode'),
      bgColor: document.getElementById('bg-color'),
      colorWrap: document.getElementById('color-wrap'),
      imageWrap: document.getElementById('image-wrap'),
      bgImageInput: document.getElementById('bg-image-input'),
      bgImageName: document.getElementById('bg-image-name'),

      btnRemove: document.getElementById('btn-remove'),
      btnDownload: document.getElementById('btn-download'),
      btnReset: document.getElementById('btn-reset'),

      processing: document.getElementById('processing'),
      processingText: document.getElementById('processing-text'),
      progressBar: document.getElementById('progress-bar'),
      toast: document.getElementById('toast')
    };
  },

  bind() {
    this.el.fileInput?.addEventListener('change', (e) => this.handleFile(e.target.files?.[0]));

    this.el.dropzone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.el.dropzone.classList.add('is-over');
    });

    this.el.dropzone?.addEventListener('dragleave', () => {
      this.el.dropzone.classList.remove('is-over');
    });

    this.el.dropzone?.addEventListener('drop', (e) => {
      e.preventDefault();
      this.el.dropzone.classList.remove('is-over');
      this.handleFile(e.dataTransfer?.files?.[0]);
    });

    this.el.compareSlider?.addEventListener('input', (e) => {
      this.syncCompare(Number(e.target.value || 50));
    });

    this.el.compare?.addEventListener?.('pointerdown', (e) => {
      this.compareDragging = true;
      this.syncCompareFromPointer(e);
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.compareDragging) return;
      this.syncCompareFromPointer(e);
    });

    window.addEventListener('pointerup', () => {
      this.compareDragging = false;
    });

    this.el.edgeSoftness?.addEventListener('input', (e) => {
      this.el.edgeSoftnessValue.textContent = String(e.target.value || 0);
    });

    this.el.alphaBoost?.addEventListener('input', (e) => {
      this.el.alphaBoostValue.textContent = String(e.target.value || 0);
    });

    this.el.bgMode?.addEventListener('change', () => this.updateModeVisibility());

    this.el.bgImageInput?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith('image/')) return;
      try {
        this.customBgImage = await this.fileToImage(file);
        this.el.bgImageName.textContent = file.name;
        this.notify('Custom background image ready.');
      } catch {
        this.notify('Could not load custom background image.');
      } finally {
        e.target.value = '';
      }
    });

    this.el.btnRemove?.addEventListener('click', () => this.process());
    this.el.btnDownload?.addEventListener('click', () => this.download());
    this.el.btnReset?.addEventListener('click', () => this.reset());
  },

  async warmupModel() {
    this.setModelBadge('Preparing AI model...', 'loading');
    this.setModelProgress(0);
    this.startModelProgressFallback();

    try {
      const sources = [
        `https://cdn.jsdelivr.net/npm/@imgly/background-removal@${MODEL_VERSION}/+esm`,
        `https://unpkg.com/@imgly/background-removal@${MODEL_VERSION}/+esm`
      ];

      for (const src of sources) {
        try {
          const mod = await import(src);
          if (mod?.removeBackground) {
            removeBackgroundFn = mod.removeBackground;
            preloadFn = typeof mod.preload === 'function' ? mod.preload : null;
            break;
          }
        } catch {
          // continue
        }
      }

      if (!removeBackgroundFn) {
        throw new Error('AI module unavailable');
      }

      if (preloadFn) {
        for (const cfg of MODEL_CONFIGS) {
          try {
            await preloadFn({
              ...cfg,
              progress: (_key, current, total) => {
                if (!total || total <= 0) return;
                const pct = Math.max(0, Math.min(100, Math.round((current / total) * 100)));
                this.setModelProgress(pct);
              }
            });
            this.activeModelConfig = { ...cfg };
            break;
          } catch {
            // continue
          }
        }
      }

      this.modelReady = true;
      this.stopModelProgressFallback();
      this.setModelProgress(100);
      this.setModelBadge('AI model ready', 'ok');
      this.updateProcessButtonState();
    } catch (error) {
      console.error(error);
      this.modelReady = false;
      this.stopModelProgressFallback();
      this.setModelProgress(0);
      this.setModelBadge('AI setup issue. Refresh once.', 'error');
      this.updateProcessButtonState();
    }
  },

  startModelProgressFallback() {
    this.stopModelProgressFallback();
    this.modelProgressTimer = setInterval(() => {
      const current = parseInt((this.el.modelProgressText?.textContent || '0').replace('%', ''), 10) || 0;
      if (current >= 92) return;
      this.setModelProgress(current + 1);
    }, 180);
  },

  stopModelProgressFallback() {
    if (!this.modelProgressTimer) return;
    clearInterval(this.modelProgressTimer);
    this.modelProgressTimer = null;
  },

  setModelProgress(percent) {
    const bounded = Math.max(0, Math.min(100, Math.round(percent)));
    if (this.el.modelProgressText) this.el.modelProgressText.textContent = `${bounded}%`;
    if (this.el.modelProgressBar) this.el.modelProgressBar.style.width = `${bounded}%`;
  },

  setModelBadge(text, mode) {
    if (!this.el.modelState) return;
    this.el.modelState.textContent = text;
    this.el.modelState.classList.remove('chip--loading', 'chip--ok', 'chip--error');
    if (mode === 'ok') this.el.modelState.classList.add('chip--ok');
    else if (mode === 'error') this.el.modelState.classList.add('chip--error');
    else this.el.modelState.classList.add('chip--loading');
  },

  async handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.setNote(this.el.uploadNote, 'Please choose a valid image file.', 'error');
      return;
    }

    this.cleanupSource();
    this.cleanupOutput();

    this.sourceFile = file;
    this.sourceUrl = URL.createObjectURL(file);
    this.el.beforeImg.src = this.sourceUrl;
    this.el.afterImg.src = this.sourceUrl;
    this.syncCompare(Number(this.el.compareSlider.value || 50));

    this.setNote(this.el.uploadNote, 'Image loaded successfully. Click Remove Background to continue.', 'ok');
    this.setNote(this.el.previewNote, `${file.name} (${this.formatFileSize(file.size)})`, 'ok');

    this.updateProcessButtonState();
    this.el.btnDownload.disabled = true;

    if (file.size > 12 * 1024 * 1024) {
      this.setNote(this.el.uploadNote, 'Large file detected. Input will be auto-optimized for stable processing.', 'ok');
    }
  },

  updateProcessButtonState() {
    if (!this.el.btnRemove) return;
    this.el.btnRemove.disabled = !this.sourceFile || !this.modelReady || this.isProcessing;
  },

  syncCompare(value) {
    const bounded = Math.max(0, Math.min(100, value));
    this.el.afterWrap.style.width = `${bounded}%`;
    this.el.beforeWrap.style.width = `${100 - bounded}%`;
    this.el.divider.style.left = `${bounded}%`;
    if (this.el.compareHandle) this.el.compareHandle.style.left = `${bounded}%`;
  },

  syncCompareFromPointer(event) {
    const box = this.el.compare.getBoundingClientRect();
    if (!box.width) return;
    const x = Math.max(0, Math.min(box.width, event.clientX - box.left));
    const pct = Math.round((x / box.width) * 100);
    this.el.compareSlider.value = String(pct);
    this.syncCompare(pct);
  },

  updateModeVisibility() {
    const mode = this.el.bgMode.value;
    this.el.colorWrap.style.display = mode === 'color' ? 'block' : 'none';
    this.el.imageWrap.style.display = mode === 'image' ? 'block' : 'none';
  },

  async process() {
    if (!this.sourceFile || this.isProcessing) return;
    if (!this.modelReady) {
      this.notify('Model is not ready yet. Please wait a moment.');
      return;
    }

    this.isProcessing = true;
    this.updateProcessButtonState();
    this.setProcessing(true, 'Removing background...');
    this.setProgress(6);

    try {
      const inputBlob = await this.prepareProcessingInput(this.sourceFile);
      this.setProgress(16);
      const removed = await this.removeWithFallback(inputBlob);
      this.setProgress(48);

      const edgeSoftness = Number(this.el.edgeSoftness.value || 2);
      const alphaBoost = Number(this.el.alphaBoost.value || 12);
      const refined = await this.refineAlpha(removed, edgeSoftness, alphaBoost);
      this.setProgress(76);

      const mode = this.el.bgMode.value;
      const finalBlob = await this.applyBackground(refined, mode);
      this.setProgress(100);

      this.cleanupOutput();
      this.outputBlob = finalBlob;
      this.outputUrl = URL.createObjectURL(finalBlob);

      this.el.afterImg.src = this.outputUrl;
      this.setNote(this.el.processNote, `Done. Output size: ${this.formatFileSize(finalBlob.size)}`, 'ok');
      this.notify('Background removed successfully.');
      this.el.btnDownload.disabled = false;
    } catch (error) {
      console.error(error);
      this.setNote(this.el.processNote, `Process failed: ${error?.message || 'unknown error'}`, 'error');
      this.notify('Background removal failed. Please retry.');
      this.el.btnDownload.disabled = true;
    } finally {
      this.isProcessing = false;
      this.updateProcessButtonState();
      this.setProcessing(false, '');
    }
  },

  async removeWithFallback(file) {
    const configs = this.activeModelConfig
      ? [this.activeModelConfig, ...MODEL_CONFIGS.filter((cfg) => cfg.publicPath !== this.activeModelConfig.publicPath)]
      : MODEL_CONFIGS;

    let lastError = null;

    for (const cfg of configs) {
      try {
        const out = await removeBackgroundFn(file, {
          ...cfg,
          output: {
            format: 'image/png',
            quality: 0.98
          },
          progress: (_key, current, total) => {
            if (!total || total <= 0) return;
            const pct = Math.round((current / total) * 24);
            this.setProgress(24 + Math.max(0, Math.min(24, pct)));
          }
        });

        this.activeModelConfig = { ...cfg };
        return out;
      } catch (error) {
        lastError = error;
      }
    }

    throw new Error(lastError?.message || 'All model endpoints failed');
  },

  async prepareProcessingInput(file) {
    this.cleanupProcessingInput();

    const maxDimension = 2000;
    const sourceImage = await this.fileToImage(file);
    const sw = sourceImage.naturalWidth || sourceImage.width;
    const sh = sourceImage.naturalHeight || sourceImage.height;
    const scale = Math.min(1, maxDimension / Math.max(sw, sh));

    if (scale === 1) {
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(sw * scale));
    canvas.height = Math.max(1, Math.round(sh * scale));
    const ctx = canvas.getContext('2d');
    ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

    const optimized = await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Input optimization failed'));
      }, 'image/jpeg', 0.95);
    });

    this.processingInputBlob = optimized;
    this.processingInputUrl = URL.createObjectURL(optimized);
    return optimized;
  },

  async refineAlpha(blob, softness, boost) {
    const img = await this.blobToImage(blob);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const totalPixels = canvas.width * canvas.height;
    const gamma = 1 - Math.min(boost, 30) / 100;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0 || data[i] === 255) continue;
      const n = data[i] / 255;
      data[i] = Math.max(0, Math.min(255, Math.round(Math.pow(n, gamma) * 255)));
    }

    // Skip heavy blur on very large frames to avoid browser unresponsive state.
    if (softness > 0 && totalPixels <= 2200000) {
      const radius = softness > 3 ? 2 : 1;
      await this.blurAlpha(data, canvas.width, canvas.height, radius);
    } else if (softness > 0 && totalPixels > 2200000) {
      this.setNote(this.el.processNote, 'Large image detected: edge blur reduced for stability.', 'ok');
    }

    ctx.putImageData(imageData, 0, 0);

    return await new Promise((resolve, reject) => {
      canvas.toBlob((out) => {
        if (out) resolve(out);
        else reject(new Error('Alpha refinement failed'));
      }, 'image/png', 0.98);
    });
  },

  async blurAlpha(data, width, height, radius) {
    const copy = new Uint8ClampedArray(data.length);
    copy.set(data);

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        let sum = 0;
        let count = 0;

        for (let dy = -radius; dy <= radius; dy += 1) {
          for (let dx = -radius; dx <= radius; dx += 1) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            const idx = (ny * width + nx) * 4 + 3;
            sum += copy[idx];
            count += 1;
          }
        }

        const alphaIdx = (y * width + x) * 4 + 3;
        if (copy[alphaIdx] > 0 && copy[alphaIdx] < 255) {
          data[alphaIdx] = Math.round(sum / count);
        }
      }

      if (y % 60 === 0) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
    }
  },

  async applyBackground(blob, mode) {
    if (mode === 'transparent') {
      return blob;
    }

    const cutout = await this.blobToImage(blob);
    const canvas = document.createElement('canvas');
    canvas.width = cutout.naturalWidth;
    canvas.height = cutout.naturalHeight;
    const ctx = canvas.getContext('2d');

    if (mode === 'image') {
      if (!this.customBgImage) {
        throw new Error('Please upload custom background image first');
      }
      this.drawCover(ctx, this.customBgImage, canvas.width, canvas.height);
    } else if (mode === 'color') {
      ctx.fillStyle = this.el.bgColor.value || '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = mode === 'white' ? '#ffffff' : '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(cutout, 0, 0);

    return await new Promise((resolve, reject) => {
      canvas.toBlob((out) => {
        if (out) resolve(out);
        else reject(new Error('Background compose failed'));
      }, 'image/jpeg', 0.95);
    });
  },

  drawCover(ctx, image, targetWidth, targetHeight) {
    const sw = image.naturalWidth || image.width;
    const sh = image.naturalHeight || image.height;
    const scale = Math.max(targetWidth / sw, targetHeight / sh);
    const dw = sw * scale;
    const dh = sh * scale;
    const dx = (targetWidth - dw) / 2;
    const dy = (targetHeight - dh) / 2;
    ctx.drawImage(image, dx, dy, dw, dh);
  },

  async download() {
    if (!this.outputBlob) return;

    const mode = this.el.bgMode.value;
    const ext = mode === 'transparent' ? 'png' : 'jpg';
    const base = this.sourceFile?.name?.replace(/\.[^/.]+$/, '') || 'image';
    const fileName = `${base}-bg-removed.${ext}`;

    if (this.utils?.downloadBlob) {
      this.utils.downloadBlob(this.outputBlob, fileName);
    } else {
      const url = URL.createObjectURL(this.outputBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }

    this.notify('Download started.');
  },

  reset() {
    this.cleanupSource();
    this.cleanupOutput();
    this.cleanupProcessingInput();

    this.sourceFile = null;
    this.customBgImage = null;

    this.el.fileInput.value = '';
    this.el.beforeImg.removeAttribute('src');
    this.el.afterImg.removeAttribute('src');
    this.el.compareSlider.value = '50';
    this.syncCompare(50);

    this.el.bgMode.value = 'transparent';
    this.el.bgColor.value = '#f8fafc';
    this.el.bgImageInput.value = '';
    this.el.bgImageName.textContent = 'No custom background image selected.';

    this.el.edgeSoftness.value = '2';
    this.el.edgeSoftnessValue.textContent = '2';
    this.el.alphaBoost.value = '12';
    this.el.alphaBoostValue.textContent = '12';

    this.setNote(this.el.uploadNote, 'Tip: clear subject + contrast background gives best edges.', '');
    this.setNote(this.el.previewNote, 'Upload image to start preview.', '');
    this.setNote(this.el.processNote, 'Process button becomes active once model loading is complete.', '');

    this.updateModeVisibility();
    this.updateProcessButtonState();
    this.el.btnDownload.disabled = true;
  },

  cleanupSource() {
    if (this.sourceUrl) {
      URL.revokeObjectURL(this.sourceUrl);
      this.sourceUrl = '';
    }
  },

  cleanupOutput() {
    if (this.outputUrl) {
      URL.revokeObjectURL(this.outputUrl);
      this.outputUrl = '';
    }
    this.outputBlob = null;
  },

  cleanupProcessingInput() {
    if (this.processingInputUrl) {
      URL.revokeObjectURL(this.processingInputUrl);
      this.processingInputUrl = '';
    }
    this.processingInputBlob = null;
  },

  setProcessing(open, text) {
    this.el.processing.classList.toggle('is-open', open);
    this.el.processing.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (text) this.el.processingText.textContent = text;
    if (!open) this.setProgress(0);
  },

  setProgress(percent) {
    this.el.progressBar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  },

  setNote(el, text, kind) {
    if (!el) return;
    el.textContent = text;
    el.classList.remove('error', 'ok');
    if (kind === 'error') el.classList.add('error');
    if (kind === 'ok') el.classList.add('ok');
  },

  notify(message) {
    if (!this.el.toast || !message) return;
    this.el.toast.textContent = message;
    this.el.toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.el.toast.classList.remove('show'), 2200);
  },

  blobToImage(blob) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Image decode failed'));
      };
      img.src = url;
    });
  },

  fileToImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Image decode failed'));
      };
      img.src = url;
    });
  },

  formatFileSize(bytes) {
    if (this.utils?.formatFileSize) return this.utils.formatFileSize(bytes);
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${bytes} B`;
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
