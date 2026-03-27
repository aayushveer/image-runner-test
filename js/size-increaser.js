'use strict';

const SizeIncreaserApp = {
  images: [],
  results: [],
  currentIndex: 0,
  maxImages: 50,
  maxFileSize: 25 * 1024 * 1024,
  el: {},

  init() {
    this.cacheElements();
    this.bindEvents();
  },

  cacheElements() {
    this.el = {
      pageUpload: document.getElementById('page-upload'),
      pageEditor: document.getElementById('page-editor'),
      pageDownload: document.getElementById('page-download'),

      dropzone: document.getElementById('dropzone'),
      fileInput: document.getElementById('file-input'),
      fileInputMore: document.getElementById('file-input-more'),

      previewImg: document.getElementById('preview-img'),
      imageCount: document.getElementById('image-count'),
      currentSize: document.getElementById('current-size'),

      targetSize: document.getElementById('target-size'),
      sizeUnit: document.getElementById('size-unit'),
      formatSelect: document.getElementById('format-select'),

      btnIncrease: document.getElementById('btn-increase'),
      btnDownload: document.getElementById('btn-download'),
      btnMore: document.getElementById('btn-more'),

      downloadInfo: document.getElementById('download-info'),
      originalSizeDisplay: document.getElementById('original-size-display'),
      newSizeDisplay: document.getElementById('new-size-display'),
      resultsList: document.getElementById('results-list'),

      processing: document.getElementById('processing'),
      processingText: document.getElementById('processing-text'),
      progressBar: document.getElementById('progress-bar')
    };
  },

  bindEvents() {
    this.el.fileInput?.addEventListener('change', (e) => this.handleFiles(e.target.files));
    this.el.fileInputMore?.addEventListener('change', (e) => this.handleFiles(e.target.files));

    document.body.addEventListener('dragover', (e) => e.preventDefault());
    document.body.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files?.length) {
        this.handleFiles(e.dataTransfer.files);
      }
    });

    this.el.btnIncrease?.addEventListener('click', () => this.increaseAll());
    this.el.btnDownload?.addEventListener('click', () => this.downloadAll());
    this.el.btnMore?.addEventListener('click', () => this.reset());
  },

  showPage(pageKey) {
    const pages = {
      upload: this.el.pageUpload,
      editor: this.el.pageEditor,
      download: this.el.pageDownload
    };

    Object.values(pages).forEach((page) => page?.classList.remove('active'));
    pages[pageKey]?.classList.add('active');
  },

  async handleFiles(fileList) {
    if (!fileList || !fileList.length) return;

    const remaining = this.maxImages - this.images.length;
    if (remaining <= 0) {
      alert('Maximum ' + this.maxImages + ' images allowed.');
      return;
    }

    for (const file of Array.from(fileList).slice(0, remaining)) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > this.maxFileSize) continue;

      const imageData = await this.loadImage(file);
      if (imageData) {
        this.images.push(imageData);
      }
    }

    if (this.el.fileInput) this.el.fileInput.value = '';
    if (this.el.fileInputMore) this.el.fileInputMore.value = '';

    if (!this.images.length) return;

    this.currentIndex = 0;
    this.updatePreview();
    this.showPage('editor');
  },

  async loadImage(file) {
    return new Promise((resolve) => {
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();

      image.onload = () => {
        resolve({
          file,
          name: file.name,
          objectUrl,
          width: image.naturalWidth || image.width,
          height: image.naturalHeight || image.height,
          imgElement: image
        });
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };

      image.src = objectUrl;
    });
  },

  updatePreview() {
    const item = this.images[this.currentIndex];
    if (!item) return;

    if (this.el.previewImg) {
      this.el.previewImg.src = item.objectUrl;
      this.el.previewImg.alt = item.name;
    }

    if (this.el.imageCount) {
      this.el.imageCount.textContent = this.images.length + (this.images.length > 1 ? ' images' : ' image');
    }

    if (this.el.currentSize) {
      this.el.currentSize.textContent = this.formatSize(item.file.size);
    }
  },

  getTargetBytes() {
    const raw = parseFloat(this.el.targetSize?.value || '0');
    if (!Number.isFinite(raw) || raw <= 0) return 0;

    const unit = (this.el.sizeUnit?.value || 'kb').toLowerCase();
    const multiplier = unit === 'mb' ? 1024 * 1024 : 1024;
    return Math.round(raw * multiplier);
  },

  async increaseAll() {
    if (!this.images.length) {
      alert('Please select at least one image.');
      return;
    }

    const targetBytes = this.getTargetBytes();
    if (!targetBytes) {
      alert('Please enter a valid target size.');
      return;
    }

    const format = this.el.formatSelect?.value === 'png' ? 'png' : 'jpg';

    this.results = [];
    this.toggleProcessing(true, 'Increasing size...');

    for (let i = 0; i < this.images.length; i += 1) {
      const item = this.images[i];
      try {
        const blob = await this.renderBaseBlob(item, format);
        const finalBlob = this.ensureTargetSize(blob, targetBytes);

        this.results.push({
          originalName: item.name,
          fileName: this.buildOutputName(item.name, format),
          originalSize: item.file.size,
          newSize: finalBlob.size,
          blob: finalBlob
        });
      } catch (error) {
        console.error('Increase failed for', item.name, error);
      }

      const progress = ((i + 1) / this.images.length) * 100;
      this.setProgress(progress);
    }

    this.toggleProcessing(false, '');

    if (!this.results.length) {
      alert('Could not process selected images. Try another image.');
      return;
    }

    this.renderResults();
    this.showPage('download');
  },

  async renderBaseBlob(item, format) {
    const canvas = document.createElement('canvas');
    canvas.width = item.width;
    canvas.height = item.height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(item.imgElement, 0, 0, item.width, item.height);

    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    const quality = format === 'png' ? undefined : 0.95;

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to render output blob'));
      }, mime, quality);
    });
  },

  ensureTargetSize(blob, targetBytes) {
    if (blob.size >= targetBytes) {
      return blob;
    }

    const paddingSize = targetBytes - blob.size;
    const pad = new Uint8Array(paddingSize);
    return new Blob([blob, pad], { type: blob.type || 'application/octet-stream' });
  },

  renderResults() {
    if (!this.results.length) return;

    if (this.el.downloadInfo) {
      this.el.downloadInfo.textContent = this.results.length + (this.results.length > 1 ? ' images processed' : ' image processed');
    }

    const first = this.results[0];
    if (this.el.originalSizeDisplay) this.el.originalSizeDisplay.textContent = this.formatSize(first.originalSize);
    if (this.el.newSizeDisplay) this.el.newSizeDisplay.textContent = this.formatSize(first.newSize);

    if (!this.el.resultsList) return;

    this.el.resultsList.innerHTML = this.results
      .map((r) => `<div class="result-item" style="display:flex;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;margin-top:8px;"><span style="color:#334155;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.fileName}</span><strong style="color:#1d4ed8;font-size:13px;">${this.formatSize(r.originalSize)} -> ${this.formatSize(r.newSize)}</strong></div>`)
      .join('');
  },

  async downloadAll() {
    if (!this.results.length) return;

    if (this.results.length === 1) {
      this.downloadBlob(this.results[0].blob, this.results[0].fileName);
      return;
    }

    if (!window.JSZip) {
      // Fallback to sequential downloads when JSZip is unavailable.
      this.results.forEach((item) => this.downloadBlob(item.blob, item.fileName));
      return;
    }

    const zip = new window.JSZip();
    this.results.forEach((item) => zip.file(item.fileName, item.blob));

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    this.downloadBlob(zipBlob, 'increased-images.zip');
  },

  downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  buildOutputName(inputName, format) {
    const base = inputName.replace(/\.[^.]+$/, '');
    const ext = format === 'png' ? 'png' : 'jpg';
    return base + '-increased.' + ext;
  },

  toggleProcessing(show, text) {
    if (this.el.processing) {
      this.el.processing.style.display = show ? 'flex' : 'none';
    }
    if (this.el.processingText && text) {
      this.el.processingText.textContent = text;
    }
    if (!show) {
      this.setProgress(0);
    }
  },

  setProgress(percent) {
    if (this.el.progressBar) {
      this.el.progressBar.style.width = Math.max(0, Math.min(100, percent)) + '%';
    }
  },

  formatSize(bytes) {
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
    return Math.max(1, Math.round(bytes / 1024)) + ' KB';
  },

  reset() {
    this.images.forEach((img) => {
      if (img.objectUrl) URL.revokeObjectURL(img.objectUrl);
    });

    this.images = [];
    this.results = [];
    this.currentIndex = 0;

    if (this.el.fileInput) this.el.fileInput.value = '';
    if (this.el.fileInputMore) this.el.fileInputMore.value = '';
    if (this.el.resultsList) this.el.resultsList.innerHTML = '';

    this.showPage('upload');
  }
};

document.addEventListener('DOMContentLoaded', () => SizeIncreaserApp.init());
