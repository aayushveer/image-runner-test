'use strict';

// Premium Background Remover - Enhanced JavaScript
let removeBackgroundFn = null;
let preloadFn = null;

const MODEL_VERSION = '1.6.0';
const MODEL_CONFIGS = [
  { publicPath: `https://staticimgly.com/@imgly/background-removal-data/${MODEL_VERSION}/dist/`, model: 'isnet_quint8', device: 'cpu' },
  { publicPath: `https://staticimgly.com/@imgly/background-removal/${MODEL_VERSION}/dist/`, model: 'isnet_fp16', device: 'cpu' }
];

const App = {
  utils: window.ImageRunnerUtils || {},
  
  // State
  sourceFile: null,
  sourceUrl: '',
  outputBlob: null,
  outputUrl: '',
  modelReady: false,
  isProcessing: false,
  customBgImage: null,
  activeModelConfig: null,
  
  // View mode: 'original', 'result', 'split'
  viewMode: 'result',
  
  // Slider state
  sliderPosition: 50,
  isDragging: false,
  
  el: {},
  
  init() {
    this.cache();
    this.bind();
    this.initSlider();
    this.updateModeVisibility();
    this.warmupModel();
  },
  
  cache() {
    const $ = (id) => document.getElementById(id);
    this.el = {
      modelState: $('model-state'),
      modelProgressText: $('model-progress-text'),
      modelProgressBar: $('model-progress-bar'),
      dropzone: $('dropzone'),
      fileInput: $('file-input'),
      uploadNote: $('upload-note'),
      previewNote: $('preview-note'),
      processNote: $('process-note'),
      beforeImg: $('before-img'),
      afterImg: $('after-img'),
      compareContainer: $('compare-container'),
      compareAfter: $('compare-after'),
      compareSlider: $('compare-slider'),
      btnViewOriginal: $('btn-view-original'),
      btnViewResult: $('btn-view-result'),
      btnViewSplit: $('btn-view-split'),
      btnZoomIn: $('btn-zoom-in'),
      btnZoomOut: $('btn-zoom-out'),
      btnZoomFit: $('btn-zoom-fit'),
      edgeSoftness: $('edge-softness'),
      edgeSoftnessValue: $('edge-softness-value'),
      alphaBoost: $('alpha-boost'),
      alphaBoostValue: $('alpha-boost-value'),
      bgMode: $('bg-mode'),
      bgColor: $('bg-color'),
      colorWrap: $('color-wrap'),
      imageWrap: $('image-wrap'),
      bgImageInput: $('bg-image-input'),
      bgImageName: $('bg-image-name'),
      btnRemove: $('btn-remove'),
      btnDownload: $('btn-download'),
      btnReset: $('btn-reset'),
      processing: $('processing'),
      processingText: $('processing-text'),
      progressBar: $('progress-bar'),
      toast: $('toast'),
      toastMessage: $('toast-message'),
      imageInfo: $('image-info'),
      infoSize: $('info-size'),
      infoDim: $('info-dim'),
      infoFormat: $('info-format'),
      manualControls: $('manual-controls'),
      qualityWrap: $('quality-wrap'),
      exportQuality: $('export-quality'),
      qualityValue: $('quality-value')
    };
  },
  
  bind() {
    const { fileInput, dropzone, btnRemove, btnDownload, btnReset, bgMode, edgeSoftness, alphaBoost, bgImageInput } = this.el;
    
    // File input
    fileInput?.addEventListener('change', (e) => this.handleFile(e.target.files?.[0]));
    
    // Dropzone drag & drop
    dropzone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('is-over');
    });
    dropzone?.addEventListener('dragleave', () => dropzone.classList.remove('is-over'));
    dropzone?.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('is-over');
      this.handleFile(e.dataTransfer?.files?.[0]);
    });
    
    // Buttons
    btnRemove?.addEventListener('click', () => this.process());
    btnDownload?.addEventListener('click', () => this.download());
    btnReset?.addEventListener('click', () => this.reset());
    
    // Sliders
    edgeSoftness?.addEventListener('input', (e) => {
      this.el.edgeSoftnessValue.textContent = e.target.value;
    });
    alphaBoost?.addEventListener('input', (e) => {
      this.el.alphaBoostValue.textContent = e.target.value;
    });
    
    // Background mode
    bgMode?.addEventListener('change', () => this.updateModeVisibility());
    
    // Custom background image
    bgImageInput?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith('image/')) return;
      try {
        this.customBgImage = await this.fileToImage(file);
        this.el.bgImageName.textContent = file.name;
        this.showToast('Custom background image loaded', 'success');
      } catch {
        this.showToast('Could not load background image', 'error');
      }
      e.target.value = '';
    });
    
    // Quality slider
    this.el.exportQuality?.addEventListener('input', (e) => {
      this.el.qualityValue.textContent = `${e.target.value}%`;
    });
    
    // Presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => this.selectPreset(btn.dataset.preset));
    });
    
    // Export format options
    document.querySelectorAll('.export-option').forEach(option => {
      option.addEventListener('click', () => this.selectExportFormat(option));
    });
    
    // View buttons
    this.el.btnViewOriginal?.addEventListener('click', () => this.setViewMode('original'));
    this.el.btnViewResult?.addEventListener('click', () => this.setViewMode('result'));
    this.el.btnViewSplit?.addEventListener('click', () => this.setViewMode('split'));
    
    // Zoom buttons
    this.el.btnZoomIn?.addEventListener('click', () => this.zoomIn());
    this.el.btnZoomOut?.addEventListener('click', () => this.zoomOut());
    this.el.btnZoomFit?.addEventListener('click', () => this.zoomFit());
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        this.toggleCompare();
      }
    });
    
    // Toast close on click
    this.el.toast?.addEventListener('click', () => this.el.toast.classList.remove('show'));
  },
  
  initSlider() {
    const slider = this.el.compareSlider;
    const container = this.el.compareContainer;
    if (!slider || !container) return;
    
    const moveSlider = (e) => {
      const rect = container.getBoundingClientRect();
      let x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      const percent = (x / rect.width) * 100;
      this.sliderPosition = percent;
      this.updateSliderPosition();
    };
    
    container.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      moveSlider(e);
    });
    
    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) moveSlider(e);
    });
    
    document.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
    
    // Touch support
    container.addEventListener('touchstart', (e) => {
      this.isDragging = true;
      moveSlider(e.touches[0]);
    });
    container.addEventListener('touchmove', (e) => {
      if (this.isDragging) {
        e.preventDefault();
        moveSlider(e.touches[0]);
      }
    });
    container.addEventListener('touchend', () => this.isDragging = false);
  },
  
  updateSliderPosition() {
    const after = this.el.compareAfter;
    const slider = this.el.compareSlider;
    if (after) {
      after.style.clipPath = `inset(0 ${100 - this.sliderPosition}% 0 0)`;
    }
    if (slider) {
      slider.style.left = `${this.sliderPosition}%`;
    }
  },
  
  setViewMode(mode) {
    this.viewMode = mode;
    const after = this.el.compareAfter;
    
    // Update button states
    document.querySelectorAll('.compare-actions button').forEach(btn => btn.classList.remove('active'));
    
    switch (mode) {
      case 'original':
        after.style.clipPath = 'inset(0 100% 0 0)';
        this.el.btnViewOriginal?.classList.add('active');
        break;
      case 'result':
        after.style.clipPath = 'inset(0 0% 0 0)';
        this.el.btnViewResult?.classList.add('active');
        break;
      case 'split':
        after.style.clipPath = `inset(0 ${100 - this.sliderPosition}% 0 0)`;
        this.el.btnViewSplit?.classList.add('active');
        break;
    }
  },
  
  toggleCompare() {
    if (this.viewMode === 'result') {
      this.setViewMode('original');
    } else {
      this.setViewMode('result');
    }
  },
  
  zoomIn() {
    const img = this.el.beforeImg;
    if (img) {
      const current = parseFloat(img.style.maxWidth || '100%');
      img.style.maxWidth = `${Math.min(current + 25, 400)}%`;
      img.style.maxHeight = `${Math.min(current + 25, 400)}%`;
    }
  },
  
  zoomOut() {
    const img = this.el.beforeImg;
    if (img) {
      const current = parseFloat(img.style.maxWidth || '100%');
      img.style.maxWidth = `${Math.max(current - 25, 50)}%`;
      img.style.maxHeight = `${Math.max(current - 25, 50)}%`;
    }
  },
  
  zoomFit() {
    const img = this.el.beforeImg;
    if (img) {
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100%';
    }
  },
  
  selectPreset(preset) {
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === preset);
    });
    
    const manualControls = this.el.manualControls;
    if (manualControls) {
      manualControls.style.display = preset === 'custom' ? 'block' : 'none';
    }
    
    if (preset === 'hair') {
      this.el.edgeSoftness.value = 4;
      this.el.edgeSoftnessValue.textContent = '4';
      this.el.alphaBoost.value = 8;
      this.el.alphaBoostValue.textContent = '8';
    } else if (preset === 'product') {
      this.el.edgeSoftness.value = 1;
      this.el.edgeSoftnessValue.textContent = '1';
      this.el.alphaBoost.value = 20;
      this.el.alphaBoostValue.textContent = '20';
    } else {
      this.el.edgeSoftness.value = 2;
      this.el.edgeSoftnessValue.textContent = '2';
      this.el.alphaBoost.value = 12;
      this.el.alphaBoostValue.textContent = '12';
    }
    
    this.showToast(`Preset: ${preset === 'auto' ? 'Auto AI' : preset === 'hair' ? 'Fine Hair' : preset === 'product' ? 'Product' : 'Manual'}`, 'success');
  },
  
  selectExportFormat(option) {
    document.querySelectorAll('.export-option').forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');
    option.querySelector('input').checked = true;
    
    const format = option.querySelector('input').value;
    const qualityWrap = this.el.qualityWrap;
    if (qualityWrap) {
      qualityWrap.style.display = format !== 'png' ? 'block' : 'none';
    }
    
    this.showToast(`Export format: ${format.toUpperCase()}`, 'success');
  },
  
  updateModeVisibility() {
    const mode = this.el.bgMode.value;
    this.el.colorWrap.style.display = mode === 'color' ? 'block' : 'none';
    this.el.imageWrap.style.display = mode === 'image' ? 'block' : 'none';
  },
  
  async handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.showNote(this.el.uploadNote, 'Please choose a valid image file (JPG, PNG, WebP, HEIC)', 'error');
      return;
    }
    
    this.cleanup();
    this.sourceFile = file;
    this.sourceUrl = URL.createObjectURL(file);
    
    // Show image info
    this.el.imageInfo.style.display = 'block';
    this.el.infoSize.textContent = this.formatFileSize(file.size);
    this.el.infoFormat.textContent = file.type.split('/')[1].toUpperCase();
    
    // Load image to get dimensions
    const img = new Image();
    img.onload = () => {
      this.el.infoDim.textContent = `${img.width} × ${img.height}`;
      this.el.beforeImg.src = this.sourceUrl;
      this.el.afterImg.src = this.sourceUrl;
    };
    img.src = this.sourceUrl;
    
    this.showNote(this.el.uploadNote, `Image loaded: ${file.name} (${this.formatFileSize(file.size)})`, 'ok');
    this.showNote(this.el.previewNote, 'Image ready. Click "Remove Background" to process.', 'ok');
    this.el.btnDownload.disabled = true;
    
    this.setViewMode('result');
    this.updateProcessButtonState();
  },
  
  async warmupModel() {
    this.showModelBadge('Preparing AI model...', 'loading');
    this.setModelProgress(0);
    
    // Simulated progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 3;
      if (progress > 90) progress = 90;
      this.setModelProgress(Math.round(progress));
    }, 200);
    
    try {
      // Try loading from CDN
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
        } catch { /* continue */ }
      }
      
      if (!removeBackgroundFn) throw new Error('AI module unavailable');
      
      // Try preloading with fallback
      for (const cfg of MODEL_CONFIGS) {
        try {
          if (preloadFn) {
            await preloadFn({ ...cfg, progress: (key, curr, tot) => {
              if (tot) this.setModelProgress(Math.round((curr / tot) * 100));
            }});
          }
          this.activeModelConfig = { ...cfg };
          break;
        } catch { /* continue */ }
      }
      
      this.modelReady = true;
      clearInterval(interval);
      this.setModelProgress(100);
      this.showModelBadge('AI model ready', 'ok');
      this.showNote(this.el.processNote, 'AI ready! Upload an image to start.', 'ok');
    } catch (error) {
      console.error(error);
      this.modelReady = false;
      clearInterval(interval);
      this.setModelProgress(0);
      this.showModelBadge('Setup issue. Refresh to retry.', 'error');
      this.showNote(this.el.processNote, 'AI model failed to load. Please refresh the page.', 'error');
    }
    
    this.updateProcessButtonState();
  },
  
  setModelProgress(percent) {
    const bounded = Math.max(0, Math.min(100, Math.round(percent)));
    this.el.modelProgressText.textContent = `${bounded}%`;
    this.el.modelProgressBar.style.width = `${bounded}%`;
  },
  
  showModelBadge(text, mode) {
    this.el.modelState.textContent = text;
    this.el.modelState.classList.remove('chip--loading', 'chip--ok', 'chip--error');
    this.el.modelState.classList.add(`chip--${mode}`);
  },
  
  updateProcessButtonState() {
    this.el.btnRemove.disabled = !this.sourceFile || !this.modelReady || this.isProcessing;
  },
  
  async process() {
    if (!this.sourceFile || this.isProcessing) return;
    if (!this.modelReady) {
      this.showToast('AI model is not ready yet. Please wait.', 'error');
      return;
    }
    
    this.isProcessing = true;
    this.updateProcessButtonState();
    this.showProcessing(true, 'Analyzing image...');
    this.setProgress(5);
    
    try {
      this.showProcessing(true, 'Loading AI model...');
      this.setProgress(15);
      
      const removed = await this.removeWithFallback(this.sourceFile);
      this.setProgress(55);
      
      const edgeSoftness = parseInt(this.el.edgeSoftness.value || 2);
      const alphaBoost = parseInt(this.el.alphaBoost.value || 12);
      
      this.showProcessing(true, 'Refining edges...');
      const refined = await this.refineAlpha(removed, edgeSoftness, alphaBoost);
      this.setProgress(75);
      
      const mode = this.el.bgMode.value;
      this.showProcessing(true, 'Applying background...');
      const finalBlob = await this.applyBackground(refined, mode);
      this.setProgress(100);
      
      this.cleanupOutput();
      this.outputBlob = finalBlob;
      this.outputUrl = URL.createObjectURL(finalBlob);
      
      this.el.afterImg.src = this.outputUrl;
      this.showProcessing(false);
      this.showNote(this.el.processNote, `Done! Output: ${this.formatFileSize(finalBlob.size)}`, 'ok');
      this.showToast('Background removed successfully!', 'success');
      this.el.btnDownload.disabled = false;
      this.setViewMode('result');
      
    } catch (error) {
      console.error(error);
      this.showProcessing(false);
      this.showNote(this.el.processNote, `Error: ${error?.message || 'Processing failed'}`, 'error');
      this.showToast('Background removal failed. Please try again.', 'error');
      this.el.btnDownload.disabled = true;
    } finally {
      this.isProcessing = false;
      this.updateProcessButtonState();
    }
  },
  
  async removeWithFallback(file) {
    const configs = this.activeModelConfig
      ? [this.activeModelConfig, ...MODEL_CONFIGS.filter(c => c.publicPath !== this.activeModelConfig.publicPath)]
      : MODEL_CONFIGS;
    
    let lastError;
    for (const cfg of configs) {
      try {
        const out = await removeBackgroundFn(file, {
          ...cfg,
          output: { format: 'image/png', quality: 0.98 },
          progress: (key, curr, tot) => {
            if (tot) this.setProgress(15 + Math.round((curr / tot) * 40));
          }
        });
        this.activeModelConfig = { ...cfg };
        return out;
      } catch (error) {
        lastError = error;
      }
    }
    throw new Error(lastError?.message || 'All AI models failed');
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
    
    // Alpha boost
    const gamma = 1 - Math.min(boost, 30) / 100;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0 || data[i] === 255) continue;
      const n = data[i] / 255;
      data[i] = Math.max(0, Math.min(255, Math.round(Math.pow(n, gamma) * 255)));
    }
    
    // Edge blur (if small enough)
    if (softness > 0 && totalPixels <= 2200000) {
      await this.blurAlpha(data, canvas.width, canvas.height, softness > 3 ? 2 : 1);
    }
    
    ctx.putImageData(imageData, 0, 0);
    return new Promise((resolve, reject) => {
      canvas.toBlob(out => out ? resolve(out) : reject(new Error('Refinement failed')), 'image/png', 0.98);
    });
  },
  
  async blurAlpha(data, width, height, radius) {
    const copy = new Uint8ClampedArray(data);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0, count = 0;
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            const idx = (ny * width + nx) * 4 + 3;
            sum += copy[idx];
            count++;
          }
        }
        const alphaIdx = (y * width + x) * 4 + 3;
        if (copy[alphaIdx] > 0 && copy[alphaIdx] < 255) {
          data[alphaIdx] = Math.round(sum / count);
        }
      }
      if (y % 60 === 0) await new Promise(r => requestAnimationFrame(r));
    }
  },
  
  async applyBackground(blob, mode) {
    if (mode === 'transparent') return blob;
    
    const cutout = await this.blobToImage(blob);
    const canvas = document.createElement('canvas');
    canvas.width = cutout.naturalWidth;
    canvas.height = cutout.naturalHeight;
    const ctx = canvas.getContext('2d');
    
    if (mode === 'image') {
      if (!this.customBgImage) throw new Error('Upload custom background first');
      this.drawCover(ctx, this.customBgImage, canvas.width, canvas.height);
    } else if (mode === 'color') {
      ctx.fillStyle = this.el.bgColor.value || '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = mode === 'white' ? '#ffffff' : '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    ctx.drawImage(cutout, 0, 0);
    
    // Get selected format
    const formatInput = document.querySelector('input[name="export-format"]:checked');
    const format = formatInput?.value || 'png';
    const quality = parseInt(this.el.exportQuality?.value || 92) / 100;
    
    return new Promise((resolve, reject) => {
      canvas.toBlob(out => out ? resolve(out) : reject(new Error('Background compose failed')), `image/${format}`, quality);
    });
  },
  
  drawCover(ctx, image, targetWidth, targetHeight) {
    const sw = image.naturalWidth || image.width;
    const sh = image.naturalHeight || image.height;
    const scale = Math.max(targetWidth / sw, targetHeight / sh);
    ctx.drawImage(image, (targetWidth - sw * scale) / 2, (targetHeight - sh * scale) / 2, sw * scale, sh * scale);
  },
  
  async download() {
    if (!this.outputBlob) return;
    const base = this.sourceFile?.name?.replace(/\.[^/.]+$/, '') || 'image';
    const formatInput = document.querySelector('input[name="export-format"]:checked');
    const format = formatInput?.value || 'png';
    const ext = format === 'jpeg' ? 'jpg' : format;
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
    this.showToast('Download started!', 'success');
  },
  
  reset() {
    this.cleanup();
    this.sourceFile = null;
    this.customBgImage = null;
    this.el.fileInput.value = '';
    this.el.beforeImg.removeAttribute('src');
    this.el.afterImg.removeAttribute('src');
    this.el.imageInfo.style.display = 'none';
    
    this.el.bgMode.value = 'transparent';
    this.el.bgColor.value = '#f8fafc';
    this.el.bgImageInput.value = '';
    this.el.bgImageName.textContent = 'No image selected.';
    
    this.el.edgeSoftness.value = '2';
    this.el.edgeSoftnessValue.textContent = '2';
    this.el.alphaBoost.value = '12';
    this.el.alphaBoostValue.textContent = '12';
    
    // Reset presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === 'auto');
    });
    this.el.manualControls.style.display = 'none';
    
    this.showNote(this.el.uploadNote, 'Tip: Use clear subjects with contrasting backgrounds for perfect edges.', '');
    this.showNote(this.el.previewNote, 'Upload an image to start previewing.', '');
    this.showNote(this.el.processNote, 'Process button becomes active once the AI model is ready.', '');
    
    this.updateModeVisibility();
    this.updateProcessButtonState();
    this.el.btnDownload.disabled = true;
    this.setViewMode('result');
    this.sliderPosition = 50;
    this.updateSliderPosition();
    
    this.showToast('Reset complete', 'success');
  },
  
  cleanup() {
    if (this.sourceUrl) { URL.revokeObjectURL(this.sourceUrl); this.sourceUrl = ''; }
    if (this.outputUrl) { URL.revokeObjectURL(this.outputUrl); this.outputUrl = ''; }
    this.outputBlob = null;
  },
  
  cleanupOutput() {
    if (this.outputUrl) { URL.revokeObjectURL(this.outputUrl); this.outputUrl = ''; }
    this.outputBlob = null;
  },
  
  showProcessing(show, text) {
    this.el.processing.classList.toggle('is-open', show);
    if (text) this.el.processingText.textContent = text;
    if (!show) this.setProgress(0);
  },
  
  setProgress(percent) {
    this.el.progressBar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  },
  
  showNote(el, text, kind) {
    if (!el) return;
    el.textContent = text;
    el.classList.remove('error', 'ok');
    if (kind === 'error') el.classList.add('error');
    if (kind === 'ok') el.classList.add('ok');
  },
  
  showToast(message, type = '') {
    const toast = this.el.toast;
    const msgEl = this.el.toastMessage;
    if (!toast || !msgEl) return;
    msgEl.textContent = message;
    toast.className = 'toast show ' + type;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  },
  
  blobToImage(blob) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image decode failed')); };
      img.src = url;
    });
  },
  
  fileToImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image decode failed')); };
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