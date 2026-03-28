'use strict';

const UploadReadyOptimizer = {
  file: null,
  image: null,
  outputBlob: null,
  outputMime: 'image/jpeg',
  outputName: 'optimized-image.jpg',
  presets: {
    custom: null,
    passport_india: { width: 413, height: 531, kb: 300 },
    profile_square_100: { width: 300, height: 300, kb: 100 },
    signature_20: { width: 300, height: 100, kb: 20 },
    exam_photo_50: { width: 200, height: 230, kb: 50 },
    job_photo_200: { width: 300, height: 300, kb: 200 }
  },

  init() {
    this.el = {
      fileInput: document.getElementById('input-file'),
      dropzone: document.getElementById('dropzone'),
      preset: document.getElementById('preset'),
      targetKb: document.getElementById('target-kb'),
      targetWidth: document.getElementById('target-width'),
      targetHeight: document.getElementById('target-height'),
      format: document.getElementById('format'),
      fitContain: document.getElementById('fit-contain'),
      enhance: document.getElementById('enhance'),
      btnOptimize: document.getElementById('btn-optimize'),
      btnDownload: document.getElementById('btn-download'),
      uploadMeta: document.getElementById('upload-meta'),
      resultNote: document.getElementById('result-note'),
      preview: document.getElementById('preview'),
      previewEmpty: document.getElementById('preview-empty'),
      stats: document.getElementById('stats'),
      statOriginal: document.getElementById('stat-original'),
      statOutput: document.getElementById('stat-output'),
      statDim: document.getElementById('stat-dim'),
      statPass: document.getElementById('stat-pass'),
      workCanvas: document.getElementById('work-canvas')
    };

    this.bindEvents();
  },

  bindEvents() {
    this.el.fileInput.addEventListener('change', (e) => this.loadFile(e.target.files?.[0]));

    this.el.dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.el.dropzone.classList.add('is-over');
    });

    this.el.dropzone.addEventListener('dragleave', () => {
      this.el.dropzone.classList.remove('is-over');
    });

    this.el.dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.el.dropzone.classList.remove('is-over');
      const file = e.dataTransfer?.files?.[0];
      this.loadFile(file);
    });

    this.el.preset.addEventListener('change', () => this.applyPreset());
    this.el.btnOptimize.addEventListener('click', () => this.optimize());
    this.el.btnDownload.addEventListener('click', () => this.download());
  },

  applyPreset() {
    const key = this.el.preset.value;
    const preset = this.presets[key];
    if (!preset) return;
    this.el.targetWidth.value = String(preset.width);
    this.el.targetHeight.value = String(preset.height);
    this.el.targetKb.value = String(preset.kb);
  },

  async loadFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.setUploadMeta('Please upload an image file.', 'error');
      return;
    }

    this.file = file;
    this.image = await this.readImage(file);

    this.el.btnOptimize.disabled = false;
    this.el.btnDownload.disabled = true;
    this.setUploadMeta(`Loaded ${file.name} • ${this.formatBytes(file.size)} • ${this.image.width}x${this.image.height}`, 'ok');
    this.setResultNote('Ready to optimize.', 'ok');
  },

  readImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to read image'));
      };
      img.src = url;
    });
  },

  getRules() {
    const width = Math.max(32, parseInt(this.el.targetWidth.value, 10) || 300);
    const height = Math.max(32, parseInt(this.el.targetHeight.value, 10) || 300);
    const targetKB = Math.max(5, parseInt(this.el.targetKb.value, 10) || 100);
    return {
      width,
      height,
      targetBytes: targetKB * 1024,
      format: this.el.format.value,
      fitContain: this.el.fitContain.checked,
      enhance: this.el.enhance.checked
    };
  },

  async optimize() {
    if (!this.image || !this.file) return;

    const rules = this.getRules();
    const canvas = this.el.workCanvas;
    canvas.width = rules.width;
    canvas.height = rules.height;
    const ctx = canvas.getContext('2d', { alpha: false });

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.drawFitted(ctx, this.image, rules.width, rules.height, rules.fitContain);

    if (rules.enhance) {
      // Mild enhancement to preserve readability in low-size outputs.
      ctx.filter = 'contrast(1.06) saturate(1.02)';
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = 'none';
    }

    const candidates = this.buildMimeCandidates(rules.format);

    let best = null;
    for (const mime of candidates) {
      const result = await this.findBestForMime(canvas, mime, rules.targetBytes);
      if (!best || result.blob.size < best.blob.size) {
        best = result;
      }
      if (result.blob.size <= rules.targetBytes) break;
    }

    this.outputBlob = best.blob;
    this.outputMime = best.mime;
    this.outputName = this.buildOutputName(this.file.name, this.outputMime);

    const url = URL.createObjectURL(this.outputBlob);
    this.el.preview.src = url;
    this.el.preview.hidden = false;
    this.el.previewEmpty.hidden = true;
    this.el.btnDownload.disabled = false;

    this.renderStats(rules, best.blob.size);
  },

  buildMimeCandidates(selected) {
    if (selected !== 'auto') return [selected];
    return ['image/webp', 'image/jpeg'];
  },

  async findBestForMime(canvas, mime, targetBytes) {
    let low = 0.1;
    let high = 0.98;
    let bestBlob = await this.canvasToBlob(canvas, mime, 0.8);

    for (let i = 0; i < 16; i += 1) {
      const mid = (low + high) / 2;
      const blob = await this.canvasToBlob(canvas, mime, mid);

      if (blob.size <= targetBytes) {
        bestBlob = blob;
        low = mid;
      } else {
        if (!bestBlob || blob.size < bestBlob.size) bestBlob = blob;
        high = mid;
      }
    }

    return { mime, blob: bestBlob };
  },

  canvasToBlob(canvas, mime, quality) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, mime, quality);
    });
  },

  drawFitted(ctx, img, targetW, targetH, contain) {
    const srcW = img.width;
    const srcH = img.height;
    const scale = contain
      ? Math.min(targetW / srcW, targetH / srcH)
      : Math.max(targetW / srcW, targetH / srcH);

    const drawW = Math.round(srcW * scale);
    const drawH = Math.round(srcH * scale);
    const dx = Math.round((targetW - drawW) / 2);
    const dy = Math.round((targetH - drawH) / 2);

    ctx.drawImage(img, dx, dy, drawW, drawH);
  },

  renderStats(rules, outputBytes) {
    const original = this.file.size;
    const pass = outputBytes <= rules.targetBytes;

    this.el.stats.hidden = false;
    this.el.statOriginal.textContent = this.formatBytes(original);
    this.el.statOutput.textContent = this.formatBytes(outputBytes);
    this.el.statDim.textContent = `${rules.width}x${rules.height}`;
    this.el.statPass.textContent = pass ? 'PASS' : 'NEAR LIMIT';

    if (pass) {
      this.setResultNote(`Ready to upload. Target ${Math.round(rules.targetBytes / 1024)} KB passed.`, 'ok');
    } else {
      this.setResultNote('Could not fully reach target without heavy quality loss. Try WebP or larger target KB.', 'warn');
    }
  },

  buildOutputName(originalName, mime) {
    const base = originalName.replace(/\.[^.]+$/, '');
    const ext = mime === 'image/webp' ? 'webp' : 'jpg';
    return `${base}-upload-ready.${ext}`;
  },

  download() {
    if (!this.outputBlob) return;

    const utils = window.ImageRunnerUtils;
    if (utils?.downloadBlob) {
      utils.downloadBlob(this.outputBlob, this.outputName);
      return;
    }

    const url = URL.createObjectURL(this.outputBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.outputName;
    a.click();
    URL.revokeObjectURL(url);
  },

  setUploadMeta(text, type) {
    this.el.uploadMeta.textContent = text;
    this.el.uploadMeta.className = `meta ${type || ''}`.trim();
  },

  setResultNote(text, type) {
    this.el.resultNote.textContent = text;
    this.el.resultNote.className = `meta ${type || ''}`.trim();
  },

  formatBytes(bytes) {
    const utils = window.ImageRunnerUtils;
    if (utils?.formatFileSize) return utils.formatFileSize(bytes);
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
};

document.addEventListener('DOMContentLoaded', () => UploadReadyOptimizer.init());
