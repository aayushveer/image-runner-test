'use strict';

const UploadReadyOptimizer = {
  file: null,
  image: null,
  outputBlob: null,
  outputMime: 'image/jpeg',
  outputName: 'optimized-image.jpg',
  lastStrategy: '--',
  presets: {
    custom: null,
    passport_india: { width: 413, height: 531, kb: 300 },
    profile_square_100: { width: 300, height: 300, kb: 100 },
    signature_20: { width: 300, height: 100, kb: 20 },
    exam_photo_50: { width: 200, height: 230, kb: 50 },
    job_photo_200: { width: 300, height: 300, kb: 200 },
    upsc_photo: { width: 300, height: 300, kb: 200 },
    upsc_signature: { width: 350, height: 100, kb: 50 },
    neet_photo: { width: 300, height: 400, kb: 200 },
    jee_photo: { width: 300, height: 400, kb: 200 },
    scholarship_photo: { width: 200, height: 230, kb: 50 },
    linkedin_dp: { width: 400, height: 400, kb: 200 },
    usa_visa_photo: { width: 600, height: 600, kb: 240 }
  },

  qualityProfiles: {
    balanced: [1.0, 0.9, 0.8, 0.7, 0.6],
    readability: [1.0, 0.92, 0.85, 0.78, 0.7],
    maximum: [1.0, 0.85, 0.7, 0.55, 0.45, 0.35]
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
      hardGuarantee: document.getElementById('hard-guarantee'),
      qualityMode: document.getElementById('quality-mode'),
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
      statScore: document.getElementById('stat-score'),
      statStrategy: document.getElementById('stat-strategy'),
      progressWrap: document.getElementById('progress-wrap'),
      progressBar: document.getElementById('progress-bar'),
      progressText: document.getElementById('progress-text'),
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
      enhance: this.el.enhance.checked,
      hardGuarantee: this.el.hardGuarantee.checked,
      qualityMode: this.el.qualityMode.value
    };
  },

  async optimize() {
    if (!this.image || !this.file) return;

    const rules = this.getRules();
    this.setProgressVisible(true);
    this.updateProgress(3);

    try {
      const candidates = this.buildMimeCandidates(rules.format);
      const detailLevels = [...(this.qualityProfiles[rules.qualityMode] || this.qualityProfiles.balanced)];

      if (rules.hardGuarantee && detailLevels[detailLevels.length - 1] > 0.28) {
        detailLevels.push(0.28, 0.22);
      }

      let bestPass = null;
      let smallestFail = null;
      const totalPasses = detailLevels.length * candidates.length;
      let passIndex = 0;

      for (const detailScale of detailLevels) {
        const workCanvas = this.prepareCanvas(rules, detailScale);

        for (const mime of candidates) {
          passIndex += 1;
          const base = Math.round((passIndex / totalPasses) * 90);
          this.updateProgress(Math.max(6, base));

          const result = await this.findBestForMime(workCanvas, mime, rules.targetBytes);
          result.mime = mime;
          result.detailScale = detailScale;
          result.strategy = `detail ${Math.round(detailScale * 100)}% / ${mime.replace('image/', '').toUpperCase()}`;

          if (result.blob.size <= rules.targetBytes) {
            if (!bestPass || result.blob.size > bestPass.blob.size || (result.blob.size === bestPass.blob.size && result.detailScale > bestPass.detailScale)) {
              bestPass = result;
            }
          } else if (!smallestFail || result.blob.size < smallestFail.blob.size) {
            smallestFail = result;
          }
        }
      }

      const chosen = bestPass || smallestFail;
      if (!chosen) {
        throw new Error('Optimization failed');
      }

      this.outputBlob = chosen.blob;
      this.outputMime = chosen.mime;
      this.lastStrategy = chosen.strategy;
      this.outputName = this.buildOutputName(this.file.name, this.outputMime);

      const url = URL.createObjectURL(this.outputBlob);
      this.el.preview.src = url;
      this.el.preview.hidden = false;
      this.el.previewEmpty.hidden = true;
      this.el.btnDownload.disabled = false;

      this.renderStats(rules, chosen.blob.size, !!bestPass);
      this.updateProgress(100);
    } catch (error) {
      console.error(error);
      this.setResultNote('Optimization failed. Please try a different preset or format.', 'error');
    } finally {
      window.setTimeout(() => this.setProgressVisible(false), 300);
    }
  },

  prepareCanvas(rules, detailScale) {
    const canvas = this.el.workCanvas;
    canvas.width = rules.width;
    canvas.height = rules.height;
    const ctx = canvas.getContext('2d', { alpha: false });

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (detailScale < 0.99) {
      const temp = document.createElement('canvas');
      temp.width = Math.max(24, Math.round(rules.width * detailScale));
      temp.height = Math.max(24, Math.round(rules.height * detailScale));
      const tctx = temp.getContext('2d', { alpha: false });

      tctx.fillStyle = '#ffffff';
      tctx.fillRect(0, 0, temp.width, temp.height);
      this.drawFitted(tctx, this.image, temp.width, temp.height, rules.fitContain);

      ctx.drawImage(temp, 0, 0, temp.width, temp.height, 0, 0, canvas.width, canvas.height);
    } else {
      this.drawFitted(ctx, this.image, rules.width, rules.height, rules.fitContain);
    }

    if (rules.enhance) {
      ctx.filter = detailScale >= 0.8 ? 'contrast(1.06) saturate(1.02)' : 'contrast(1.08) saturate(0.98)';
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = 'none';
    }

    return canvas;
  },

  buildMimeCandidates(selected) {
    if (selected !== 'auto') return [selected];
    return ['image/webp', 'image/jpeg'];
  },

  async findBestForMime(canvas, mime, targetBytes) {
    let low = 0.02;
    let high = 0.98;
    let bestPass = null;
    let smallestAny = null;

    for (let i = 0; i < 20; i += 1) {
      const mid = (low + high) / 2;
      const blob = await this.canvasToBlob(canvas, mime, mid);
      if (!blob) continue;

      if (!smallestAny || blob.size < smallestAny.size) {
        smallestAny = blob;
      }

      if (blob.size <= targetBytes) {
        bestPass = blob;
        low = mid;
      } else {
        high = mid;
      }
    }

    return { blob: bestPass || smallestAny };
  },

  canvasToBlob(canvas, mime, quality) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), mime, quality);
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

  renderStats(rules, outputBytes, passed) {
    const original = this.file.size;
    const targetBytes = rules.targetBytes;
    const savedPct = original > 0 ? Math.round(((original - outputBytes) / original) * 100) : 0;

    this.el.stats.hidden = false;
    this.el.statOriginal.textContent = this.formatBytes(original);
    this.el.statOutput.textContent = this.formatBytes(outputBytes);
    this.el.statDim.textContent = `${rules.width}x${rules.height}`;
    this.el.statPass.textContent = passed ? 'PASS' : 'NEAR LIMIT';
    this.el.statStrategy.textContent = this.lastStrategy;

    const score = this.computeComplianceScore(outputBytes, targetBytes, rules.width, rules.height);
    this.el.statScore.textContent = `${score}/100`;

    if (passed) {
      this.setResultNote(`Upload-ready. Saved ${savedPct}% while matching ${Math.round(targetBytes / 1024)} KB max.`, 'ok');
    } else {
      this.setResultNote('Very close to target. Increase target KB slightly or choose Maximum Reduction.', 'warn');
    }
  },

  computeComplianceScore(outputBytes, targetBytes, width, height) {
    const sizeScore = outputBytes <= targetBytes
      ? 100
      : Math.max(0, 100 - Math.round(((outputBytes - targetBytes) / targetBytes) * 140));

    const dimensionScore = width > 0 && height > 0 ? 100 : 0;
    const weighted = Math.round((sizeScore * 0.75) + (dimensionScore * 0.25));
    return Math.max(0, Math.min(100, weighted));
  },

  buildOutputName(originalName, mime) {
    const base = originalName.replace(/\.[^.]+$/, '');
    const ext = mime === 'image/webp' ? 'webp' : 'jpg';
    return `${base}-upload-ready.${ext}`;
  },

  download() {
    if (!this.outputBlob) return;

    const utils = window.ImageRunnerUtils;
    if (utils && typeof utils.downloadBlob === 'function') {
      utils.downloadBlob(this.outputBlob, this.outputName);
      return;
    }

    const url = URL.createObjectURL(this.outputBlob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = this.outputName;
    anchor.click();
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

  setProgressVisible(visible) {
    this.el.progressWrap.hidden = !visible;
    if (!visible) {
      this.el.progressBar.style.width = '0%';
      this.el.progressText.textContent = '0%';
    }
  },

  updateProgress(percent) {
    const clamped = Math.max(0, Math.min(100, percent));
    this.el.progressBar.style.width = `${clamped}%`;
    this.el.progressText.textContent = `${clamped}%`;
  },

  formatBytes(bytes) {
    const utils = window.ImageRunnerUtils;
    if (utils && typeof utils.formatFileSize === 'function') return utils.formatFileSize(bytes);
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
};

document.addEventListener('DOMContentLoaded', () => UploadReadyOptimizer.init());
