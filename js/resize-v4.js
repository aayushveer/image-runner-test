/**
 * RESIZE-V4.JS - Image resize tool runtime
 */

'use strict';

const App = {
    images: [],
    results: [],
    utils: null,
    currentIdx: 0,

    width: 800,
    height: 600,
    unit: 'pixels',
    resolution: 72,
    format: 'jpg',
    quality: 90,
    bgColor: 'white',
    lockRatio: true,
    originalRatio: 1,
    toastTimer: null,
    themeStorageKey: 'imgrunner-theme',
    themeMediaQuery: null,

    maxImages: 50,
    maxFileSize: 25 * 1024 * 1024,
    maxDimension: 12000,
    maxCanvasPixels: 60 * 1000 * 1000,
    supportedInputTypes: new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/heic', 'image/heif']),
    outputFormats: {
        jpg: { mimeType: 'image/jpeg', ext: 'jpg', supportsQuality: true, supportsAlpha: false },
        png: { mimeType: 'image/png', ext: 'png', supportsQuality: false, supportsAlpha: true },
        webp: { mimeType: 'image/webp', ext: 'webp', supportsQuality: true, supportsAlpha: true }
    },
    el: {},

    init() {
        this.themeMediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
        this.utils = window.ImageRunnerUtils || {
            downloadBlob: (blob, fileName) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                link.click();
                URL.revokeObjectURL(url);
            },
            setActivePage: (pageMap, pageKey) => {
                Object.values(pageMap).forEach((pageEl) => pageEl?.classList.remove('active'));
                pageMap[pageKey]?.classList.add('active');
            }
        };

        this.cacheElements();
        this.initTheme();
        this.bindEvents();
        this.syncLanguageControl();
        this.updateQualityAvailability();
        this.updateBackgroundAvailability();
        this.updateTargetSizeAvailability();
    },

    cacheElements() {
        this.el = {
            pageUpload: document.getElementById('page-upload'),
            pageEditor: document.getElementById('page-editor'),
            pageDownload: document.getElementById('page-download'),

            backBtn: document.getElementById('back-btn'),
            languageSelect: document.getElementById('language-select'),
            themeToggle: document.getElementById('theme-toggle'),

            dropzone: document.getElementById('dropzone'),
            fileInput: document.getElementById('file-input'),
            fileInputMore: document.getElementById('file-input-more'),
            addMoreBtn: document.getElementById('add-more-btn'),
            urlInput: document.getElementById('url-input'),
            urlLoad: document.getElementById('url-load'),

            previewArea: document.getElementById('preview-area'),
            imageCount: document.getElementById('image-count'),

            widthInput: document.getElementById('width-input'),
            heightInput: document.getElementById('height-input'),
            unitSelect: document.getElementById('unit-select'),
            lockBtn: document.getElementById('lock-btn'),
            resolutionInput: document.getElementById('resolution-input'),
            formatSelect: document.getElementById('format-select'),
            qualityInput: document.getElementById('quality-input'),
            qualitySlider: document.getElementById('quality-slider'),
            qualityDisplay: document.getElementById('quality-display'),
            bgBtns: document.querySelectorAll('.bg-btn'),
            targetSizeToggle: document.getElementById('target-size-toggle'),
            targetSizeRow: document.getElementById('ts-row'),
            targetSizeValue: document.getElementById('target-size-value'),
            targetSizeUnit: document.getElementById('target-size-unit'),
            targetSizeInfo: document.getElementById('ts-info'),

            btnResize: document.getElementById('btn-resize'),
            downloadInfo: document.getElementById('download-info'),
            resultsList: document.getElementById('results-list'),
            btnDownload: document.getElementById('btn-download'),
            btnMore: document.getElementById('btn-more'),

            shareButtons: document.querySelectorAll('[data-share]'),
            copyLinkBtn: document.getElementById('copy-link-btn'),

            processing: document.getElementById('processing'),
            processingText: document.getElementById('processing-text'),
            progressBar: document.getElementById('progress-bar'),
            toast: document.getElementById('toast')
        };
    },

    bindEvents() {
        this.el.backBtn?.addEventListener('click', (event) => this.goBack(event));
        this.el.languageSelect?.addEventListener('change', (event) => this.setLanguage(event.target.value));
        this.el.themeToggle?.addEventListener('click', () => this.toggleTheme());

        this.themeMediaQuery?.addEventListener?.('change', (event) => this.handleSystemThemeChange(event));

        this.el.fileInput?.addEventListener('change', (event) => this.handleFiles(event.target.files));
        this.el.fileInputMore?.addEventListener('change', (event) => this.handleFiles(event.target.files));
        this.el.addMoreBtn?.addEventListener('click', () => this.el.fileInputMore?.click());

        this.el.dropzone?.addEventListener('dragover', (event) => {
            event.preventDefault();
            this.el.dropzone.classList.add('drag-over');
        });
        this.el.dropzone?.addEventListener('dragleave', () => this.el.dropzone.classList.remove('drag-over'));
        this.el.dropzone?.addEventListener('drop', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.el.dropzone.classList.remove('drag-over');
            if (event.dataTransfer?.files?.length) this.handleFiles(event.dataTransfer.files);
        });

        this.el.urlLoad?.addEventListener('click', () => this.loadImageFromUrl());
        this.el.urlInput?.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.loadImageFromUrl();
            }
        });

        document.addEventListener('paste', (event) => this.handlePaste(event));
        document.addEventListener('dragstart', (event) => {
            if (event.target instanceof Element && event.target.closest('.img-thumb')) {
                event.preventDefault();
            }
        }, true);

        document.body.addEventListener('dragover', (event) => event.preventDefault());
        document.body.addEventListener('drop', (event) => {
            event.preventDefault();
            if (event.dataTransfer?.files?.length) this.handleFiles(event.dataTransfer.files);
        });

        this.el.widthInput?.addEventListener('input', (event) => this.handleWidthInput(event.target.value));
        this.el.heightInput?.addEventListener('input', (event) => this.handleHeightInput(event.target.value));

        this.el.unitSelect?.addEventListener('change', (event) => {
            this.unit = event.target.value;
            this.updateDimensionPlaceholders();
            this.updateResolutionAvailability();
        });

        this.el.lockBtn?.addEventListener('click', () => {
            this.lockRatio = !this.lockRatio;
            this.el.lockBtn.classList.toggle('active', this.lockRatio);
        });

        this.el.resolutionInput?.addEventListener('input', (event) => {
            this.resolution = this.clampNumber(parseInt(event.target.value, 10), 1, 600, 72);
            if (this.unit === 'cm' || this.unit === 'inches') this.updateDimensionPlaceholders();
        });

        this.el.formatSelect?.addEventListener('change', (event) => {
            this.format = this.outputFormats[event.target.value] ? event.target.value : 'jpg';
            this.updateQualityAvailability();
            this.updateBackgroundAvailability();
            this.updateTargetSizeAvailability();
        });

        this.el.qualitySlider?.addEventListener('input', (event) => {
            this.quality = this.clampNumber(parseInt(event.target.value, 10), 10, 100, 90);
            this.syncQualityControls();
        });

        this.el.qualityInput?.addEventListener('input', (event) => {
            this.quality = this.clampNumber(parseInt(event.target.value, 10), 10, 100, 90);
            this.syncQualityControls();
        });

        this.el.bgBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                if (btn.disabled) return;
                this.el.bgBtns.forEach((item) => item.classList.remove('active'));
                btn.classList.add('active');
                this.bgColor = btn.dataset.bg || 'white';
            });
        });

        this.el.targetSizeToggle?.addEventListener('change', () => {
            this.toggleTargetSizeRow();
            this.updateTargetSizeAvailability();
        });

        this.el.btnResize?.addEventListener('click', () => this.resize());
        this.el.btnDownload?.addEventListener('click', () => this.download());
        this.el.btnMore?.addEventListener('click', () => this.reset());

        this.el.shareButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                this.share(button.dataset.share);
            });
        });

        this.el.copyLinkBtn?.addEventListener('click', () => this.copyCurrentLink());

        window.addEventListener('imagerunner:languagechange', () => this.refreshDynamicText());
        window.addEventListener('imagerunner:presetselected', (event) => {
            if (this.images.length) this.applyPreset(event.detail);
        });
    },

    t(key, params = {}) {
        return window.ImageRunnerI18n?.t(key, params) || key;
    },

    setLanguage(language) {
        window.ImageRunnerI18n?.setLanguage(language);
        this.syncLanguageControl();
        this.refreshDynamicText();
    },

    syncLanguageControl() {
        if (this.el.languageSelect && window.ImageRunnerI18n) {
            this.el.languageSelect.value = window.ImageRunnerI18n.getLanguage();
        }
    },

    initTheme() {
        this.applyTheme(this.getInitialTheme(), false);
    },

    getInitialTheme() {
        try {
            const storedTheme = window.localStorage.getItem(this.themeStorageKey);
            if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
        } catch (error) {
            // Ignore storage failures in private or locked-down contexts.
        }

        return this.themeMediaQuery?.matches ? 'dark' : 'light';
    },

    getActiveTheme() {
        return document.documentElement.classList.contains('light-theme') ? 'light' : 'dark';
    },

    applyTheme(theme, persist = true) {
        const nextTheme = theme === 'dark' ? 'dark' : 'light';
        document.documentElement.classList.toggle('light-theme', nextTheme === 'light');

        if (this.el.themeToggle) {
            const isLight = nextTheme === 'light';
            this.el.themeToggle.textContent = isLight ? '☀️' : '🌙';
            this.el.themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
            this.el.themeToggle.title = isLight ? 'Switch to dark theme' : 'Switch to light theme';
        }

        if (persist) {
            try {
                window.localStorage.setItem(this.themeStorageKey, nextTheme);
            } catch (error) {
                // Ignore storage failures in private or locked-down contexts.
            }
        }

        this.syncThemeColorMeta(nextTheme);
    },

    toggleTheme() {
        this.applyTheme(this.getActiveTheme() === 'light' ? 'dark' : 'light');
    },

    handleSystemThemeChange(event) {
        try {
            const storedTheme = window.localStorage.getItem(this.themeStorageKey);
            if (storedTheme === 'light' || storedTheme === 'dark') return;
        } catch (error) {
            return;
        }

        this.applyTheme(event.matches ? 'dark' : 'light', false);
    },

    syncThemeColorMeta(theme) {
        const themeColor = theme === 'dark' ? '#0f172a' : '#ffffff';
        document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
            const media = meta.getAttribute('media');
            if (!media) {
                meta.setAttribute('content', themeColor);
                return;
            }

            if (theme === 'dark' && media.includes('prefers-color-scheme: dark')) {
                meta.setAttribute('content', themeColor);
            }

            if (theme === 'light' && media.includes('prefers-color-scheme: light')) {
                meta.setAttribute('content', themeColor);
            }
        });
    },

    refreshDynamicText() {
        this.updateImageCount();
        this.updateDownloadInfo();
        this.updatePreviewRemoveTitles();
    },

    goBack(event) {
        if (window.history.length > 1) {
            event.preventDefault();
            window.history.back();
        }
    },

    showPage(name) {
        this.utils.setActivePage({
            upload: this.el.pageUpload,
            editor: this.el.pageEditor,
            download: this.el.pageDownload
        }, name);
    },

    async handleFiles(fileList) {
        if (!fileList || !fileList.length) return;

        const files = Array.from(fileList);
        const beforeCount = this.images.length;
        const remaining = this.maxImages - this.images.length;
        const skipped = { type: 0, size: 0, load: 0, extra: Math.max(0, files.length - Math.max(remaining, 0)) };

        if (remaining <= 0) {
            this.notify(this.t('alerts.maxImages', { max: this.maxImages }));
            this.clearFileInputs();
            return;
        }

        for (const file of files.slice(0, remaining)) {
            if (!this.isSupportedFile(file)) {
                skipped.type += 1;
                continue;
            }

            if (file.size > this.maxFileSize) {
                skipped.size += 1;
                continue;
            }

            try {
                const img = await this.loadImage(file);
                this.images.push(img);
            } catch (error) {
                skipped.load += 1;
            }
        }

        this.clearFileInputs();

        if (this.images.length > 0) {
            this.currentIdx = 0;
            this.originalRatio = this.images[0].width / this.images[0].height;
            this.showPage('editor');
            this.updatePreview();
            this.updateDimensionPlaceholders();
            this.applyPendingPreset();
            this.updateResolutionAvailability();
        }

        const added = this.images.length - beforeCount;
        if (added > 0) this.notify(this.t('upload.toast.added', { count: added }));
        this.reportSkippedFiles(skipped);
    },

    isSupportedFile(file) {
        const type = String(file?.type || '').toLowerCase();
        if (this.supportedInputTypes.has(type)) return true;
        return type.startsWith('image/') && type !== 'image/svg+xml';
    },

    loadImage(file) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.decoding = 'async';
            img.onload = () => {
                if (!img.naturalWidth || !img.naturalHeight) {
                    URL.revokeObjectURL(url);
                    reject(new Error('empty-image'));
                    return;
                }

                resolve({
                    file,
                    name: file.name || 'image',
                    size: file.size,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    url,
                    type: file.type
                });
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('load-failed'));
            };
            img.src = url;
        });
    },

    clearFileInputs() {
        if (this.el.fileInput) this.el.fileInput.value = '';
        if (this.el.fileInputMore) this.el.fileInputMore.value = '';
    },

    async handlePaste(event) {
        const files = Array.from(event.clipboardData?.files || []).filter((file) => this.isSupportedFile(file));
        if (!files.length) return;
        event.preventDefault();
        await this.handleFiles(files);
    },

    async loadImageFromUrl() {
        const rawUrl = this.el.urlInput?.value.trim();
        let url;

        try {
            url = new URL(rawUrl);
        } catch (error) {
            this.notify('Enter a valid image URL.', true);
            return;
        }

        try {
            this.showProcessing(true);
            this.updateProgress(0, 1, 'Loading image...');

            const response = await fetch(url.href, { mode: 'cors' });
            if (!response.ok) throw new Error('bad-response');

            const blob = await response.blob();
            if (!blob.type.startsWith('image/')) throw new Error('not-image');

            const fileName = this.deriveFileNameFromUrl(url, blob.type);
            const file = new File([blob], fileName, { type: blob.type });
            await this.handleFiles([file]);
            if (this.el.urlInput) this.el.urlInput.value = '';
        } catch (error) {
            this.notify('Could not load that image URL. Try a direct image link with CORS enabled.', true);
        } finally {
            this.showProcessing(false);
        }
    },

    deriveFileNameFromUrl(url, type) {
        const fromPath = decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || '');
        if (fromPath && /\.[a-z0-9]+$/i.test(fromPath)) return fromPath.slice(0, 120);

        const extByType = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
            'image/gif': 'gif',
            'image/bmp': 'bmp'
        };
        return `remote-image.${extByType[type] || 'jpg'}`;
    },

    reportSkippedFiles(skipped) {
        const messages = [];
        if (skipped.extra) messages.push(this.t('alerts.extraSkipped', { count: skipped.extra, max: this.maxImages }));
        if (skipped.type) messages.push(this.t('alerts.unsupportedSkipped', { count: skipped.type }));
        if (skipped.size) messages.push(this.t('alerts.largeSkipped', { count: skipped.size, size: this.utils.formatFileSize(this.maxFileSize) }));
        if (skipped.load) messages.push(this.t('alerts.loadSkipped', { count: skipped.load }));
        if (messages.length) this.notify(messages.join('\n'));
    },

    updatePreview() {
        if (!this.el.previewArea) return;
        this.el.previewArea.replaceChildren();

        this.images.forEach((img, idx) => {
            const thumb = document.createElement('div');
            thumb.className = 'img-thumb';
            thumb.dataset.idx = String(idx);
            thumb.setAttribute('draggable', 'false');
            thumb.addEventListener('dragstart', (event) => event.preventDefault());

            const image = document.createElement('img');
            image.src = img.url;
            image.alt = img.name;
            image.draggable = false;
            image.setAttribute('draggable', 'false');
            image.addEventListener('dragstart', (event) => event.preventDefault());

            const remove = document.createElement('button');
            remove.className = 'img-remove';
            remove.type = 'button';
            remove.title = this.t('editor.removeImage');
            remove.setAttribute('aria-label', this.t('editor.removeImage'));
            remove.textContent = 'x';
            remove.addEventListener('click', () => this.removeImage(idx));

            thumb.append(image, remove);
            this.el.previewArea.appendChild(thumb);
        });

        this.updateImageCount();

        const currentImg = this.images[this.currentIdx] || this.images[0];
        if (currentImg) this.originalRatio = currentImg.width / currentImg.height;
    },

    updatePreviewRemoveTitles() {
        this.el.previewArea?.querySelectorAll('.img-remove').forEach((button) => {
            button.title = this.t('editor.removeImage');
            button.setAttribute('aria-label', this.t('editor.removeImage'));
        });
    },

    updateImageCount() {
        if (!this.el.imageCount) return;
        this.el.imageCount.textContent = this.t('status.imageCount', { count: this.images.length });
    },

    updateDownloadInfo() {
        if (!this.el.downloadInfo) return;
        const saved = this.results.reduce((total, result) => total + Math.max(0, result.originalSize - result.newSize), 0);
        this.el.downloadInfo.textContent = this.results.length
            ? this.t('download.info', { count: this.results.length, saved: this.utils.formatFileSize(saved) })
            : this.t('status.processedCount', { count: 0 });
    },

    updateDimensionPlaceholders() {
        if (!this.images.length) return;
        const img = this.images[this.currentIdx] || this.images[0];
        const dpi = this.clampNumber(this.resolution, 1, 600, 72);

        if (this.unit === 'pixels') {
            this.width = img.width;
            this.height = img.height;
        } else if (this.unit === 'percent') {
            this.width = 100;
            this.height = 100;
        } else if (this.unit === 'cm') {
            this.width = Math.round((img.width * 2.54 / dpi) * 10) / 10;
            this.height = Math.round((img.height * 2.54 / dpi) * 10) / 10;
        } else if (this.unit === 'inches') {
            this.width = Math.round((img.width / dpi) * 10) / 10;
            this.height = Math.round((img.height / dpi) * 10) / 10;
        }

        this.syncDimensionControls();
    },

    handleWidthInput(value) {
        this.width = this.parseDimensionValue(value);
        if (!this.lockRatio || !this.images.length) return;

        if (this.unit === 'percent') {
            this.height = this.width;
        } else {
            this.height = Math.max(1, Math.round(this.width / this.originalRatio));
        }

        if (this.el.heightInput) this.el.heightInput.value = this.height;
    },

    handleHeightInput(value) {
        this.height = this.parseDimensionValue(value);
        if (!this.lockRatio || !this.images.length) return;

        if (this.unit === 'percent') {
            this.width = this.height;
        } else {
            this.width = Math.max(1, Math.round(this.height * this.originalRatio));
        }

        if (this.el.widthInput) this.el.widthInput.value = this.width;
    },

    parseDimensionValue(value) {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : 0;
    },

    syncDimensionControls() {
        if (this.el.widthInput) this.el.widthInput.value = this.width;
        if (this.el.heightInput) this.el.heightInput.value = this.height;
    },

    syncQualityControls() {
        if (this.el.qualityInput) this.el.qualityInput.value = this.quality;
        if (this.el.qualitySlider) this.el.qualitySlider.value = this.quality;
        if (this.el.qualityDisplay) this.el.qualityDisplay.textContent = '%';
    },

    updateResolutionAvailability() {
        const isPhysicalUnit = this.unit === 'cm' || this.unit === 'inches';
        if (this.el.resolutionInput) this.el.resolutionInput.disabled = !isPhysicalUnit;
        document.querySelector('.resolution-field')?.classList.toggle('is-disabled', !isPhysicalUnit);
    },

    updateQualityAvailability() {
        const format = this.outputFormats[this.format] || this.outputFormats.jpg;
        const disabled = !format.supportsQuality;
        if (this.el.qualitySlider) this.el.qualitySlider.disabled = disabled;
        if (this.el.qualityInput) this.el.qualityInput.disabled = disabled;
        document.querySelector('.quality-input-wrap')?.classList.toggle('is-disabled', disabled);
    },

    updateTargetSizeAvailability() {
        const format = this.outputFormats[this.format] || this.outputFormats.jpg;
        const disabled = !format.supportsQuality;
        const enabled = Boolean(this.el.targetSizeToggle?.checked);

        [this.el.targetSizeValue, this.el.targetSizeUnit].forEach((element) => {
            if (element) element.disabled = disabled || !enabled;
        });

        if (this.el.targetSizeInfo) {
            this.el.targetSizeInfo.textContent = disabled ? 'JPG/WebP only' : '';
            this.el.targetSizeInfo.className = disabled ? 'ts-info warn' : 'ts-info';
        }
    },

    toggleTargetSizeRow() {
        if (!this.el.targetSizeRow || !this.el.targetSizeToggle) return;
        this.el.targetSizeRow.hidden = !this.el.targetSizeToggle.checked;
    },

    updateBackgroundAvailability() {
        const format = this.outputFormats[this.format] || this.outputFormats.jpg;
        this.el.bgBtns.forEach((btn) => {
            const isTransparent = btn.dataset.bg === 'transparent';
            btn.disabled = isTransparent && !format.supportsAlpha;
            btn.classList.toggle('is-disabled', btn.disabled);
        });

        if (!format.supportsAlpha && this.bgColor === 'transparent') {
            this.bgColor = 'white';
            this.el.bgBtns.forEach((btn) => btn.classList.toggle('active', btn.dataset.bg === 'white'));
        }
    },

    applyPendingPreset() {
        return this.applyPreset(window.__pendingPreset);
    },

    applyPreset(preset) {
        if (!preset || !Number.isFinite(preset.w) || !Number.isFinite(preset.h)) return false;

        this.unit = 'pixels';
        this.width = Math.max(1, Math.round(preset.w));
        this.height = Math.max(1, Math.round(preset.h));
        this.originalRatio = this.width / this.height;
        this.lockRatio = true;

        if (this.el.unitSelect) this.el.unitSelect.value = 'pixels';
        this.el.lockBtn?.classList.add('active');
        this.syncDimensionControls();
        this.updateResolutionAvailability();

        window.__pendingPreset = null;
        this.notify(`Applied: ${preset.name || 'preset'} (${this.width} x ${this.height})`);
        return true;
    },

    removeImage(idx) {
        const removed = this.images.splice(idx, 1)[0];
        if (removed?.url) URL.revokeObjectURL(removed.url);

        this.currentIdx = Math.min(this.currentIdx, Math.max(this.images.length - 1, 0));

        if (this.images.length === 0) {
            this.showPage('upload');
            this.updatePreview();
            return;
        }

        this.updatePreview();
        this.updateDimensionPlaceholders();
    },

    async resize() {
        if (!this.images.length) return;

        this.releaseResults();
        this.showProcessing(true);

        const total = this.images.length;

        try {
            for (let i = 0; i < total; i += 1) {
                this.updateProgress(i, total, this.t('processing.progress', { current: i + 1, total }));
                const result = await this.processImage(this.images[i], i);
                this.results.push(result);
                await this.delay(20);
            }

            this.updateProgress(total, total, this.t('processing.done'));
            await this.delay(250);
            this.showDownload();
        } catch (error) {
            this.notify(error?.message || this.t('alerts.resizeError'), true);
        } finally {
            this.showProcessing(false);
        }
    },

    processImage(img, index) {
        return new Promise((resolve, reject) => {
            const format = this.outputFormats[this.format] || this.outputFormats.jpg;
            const dimensions = this.getOutputDimensions(img);

            try {
                this.validateDimensions(dimensions.width, dimensions.height);
            } catch (error) {
                reject(error);
                return;
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { alpha: format.supportsAlpha });
            if (!ctx) {
                reject(new Error(this.t('alerts.canvasUnavailable')));
                return;
            }

            canvas.width = dimensions.width;
            canvas.height = dimensions.height;

            const image = new Image();
            image.onload = async () => {
                try {
                    const bgColor = this.getCanvasBackground(format);
                    if (bgColor) {
                        ctx.fillStyle = bgColor;
                        ctx.fillRect(0, 0, dimensions.width, dimensions.height);
                    }

                    ctx.globalCompositeOperation = 'source-over';
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    this.drawImageToCanvas(ctx, image, dimensions.width, dimensions.height);

                    const exportResult = await this.exportCanvas(canvas, format);
                    canvas.width = 0;
                    canvas.height = 0;

                    const baseName = this.sanitizeBaseName(img.name);
                    const prefix = String(index + 1).padStart(2, '0');
                    const fileName = `${prefix}-${baseName}_${dimensions.width}x${dimensions.height}.${format.ext}`;

                    resolve({
                        fileName,
                        blob: exportResult.blob,
                        url: URL.createObjectURL(exportResult.blob),
                        originalWidth: img.width,
                        originalHeight: img.height,
                        newWidth: dimensions.width,
                        newHeight: dimensions.height,
                        originalName: img.name,
                        originalSize: img.size,
                        newSize: exportResult.blob.size,
                        qualityUsed: exportResult.quality,
                        targetSizeUsed: exportResult.targeted
                    });
                } catch (error) {
                    canvas.width = 0;
                    canvas.height = 0;
                    reject(error);
                }
            };
            image.onerror = () => reject(new Error(this.t('alerts.resizeError')));
            image.src = img.url;
        });
    },

    drawImageToCanvas(ctx, image, width, height) {
        ctx.drawImage(image, 0, 0, width, height);
    },

    async exportCanvas(canvas, format) {
        const targetBytes = this.getTargetBytes();

        if (!format.supportsQuality || !targetBytes) {
            const quality = format.supportsQuality ? this.quality : null;
            const blob = await this.canvasToBlob(canvas, format.mimeType, format.supportsQuality ? quality / 100 : undefined);
            return { blob, quality, targeted: false };
        }

        let low = 10;
        let high = 100;
        let bestUnder = null;
        let closest = null;

        for (let i = 0; i < 8 && low <= high; i += 1) {
            const quality = Math.floor((low + high) / 2);
            const blob = await this.canvasToBlob(canvas, format.mimeType, quality / 100);
            const candidate = { blob, quality, targeted: true };

            if (!closest || Math.abs(blob.size - targetBytes) < Math.abs(closest.blob.size - targetBytes)) {
                closest = candidate;
            }

            if (blob.size <= targetBytes) {
                bestUnder = candidate;
                low = quality + 1;
            } else {
                high = quality - 1;
            }
        }

        const result = bestUnder || closest;
        if (!result) throw new Error(this.t('alerts.formatUnsupported'));

        if (this.el.targetSizeInfo) {
            const hit = result.blob.size <= targetBytes;
            this.el.targetSizeInfo.textContent = hit
                ? this.t('alerts.targetSizeHit', { quality: result.quality, size: this.utils.formatFileSize(result.blob.size) })
                : this.t('alerts.targetSizeMiss');
            this.el.targetSizeInfo.className = hit ? 'ts-info ok' : 'ts-info warn';
        }

        return result;
    },

    canvasToBlob(canvas, mimeType, quality) {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error(this.t('alerts.formatUnsupported')));
                    return;
                }
                resolve(blob);
            }, mimeType, quality);
        });
    },

    getTargetBytes() {
        if (!this.el.targetSizeToggle?.checked) return null;

        const value = parseFloat(this.el.targetSizeValue?.value || '');
        if (!Number.isFinite(value) || value <= 0) return null;

        const unit = this.el.targetSizeUnit?.value || 'kb';
        if (unit === 'bytes') return Math.round(value);
        if (unit === 'mb') return Math.round(value * 1024 * 1024);
        return Math.round(value * 1024);
    },

    getOutputDimensions(img) {
        let newWidth;
        let newHeight;
        const dpi = this.clampNumber(this.resolution, 1, 600, 72);

        if (this.unit === 'percent') {
            newWidth = Math.round(img.width * (this.width / 100));
            newHeight = Math.round(img.height * (this.height / 100));
        } else if (this.unit === 'cm') {
            newWidth = Math.round(this.width * dpi / 2.54);
            newHeight = Math.round(this.height * dpi / 2.54);
        } else if (this.unit === 'inches') {
            newWidth = Math.round(this.width * dpi);
            newHeight = Math.round(this.height * dpi);
        } else {
            newWidth = Math.round(this.width);
            newHeight = Math.round(this.height);
        }

        return {
            width: Math.max(1, newWidth || 0),
            height: Math.max(1, newHeight || 0)
        };
    },

    validateDimensions(width, height) {
        if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
            throw new Error(this.t('alerts.invalidDimensions'));
        }

        if (width > this.maxDimension || height > this.maxDimension || width * height > this.maxCanvasPixels) {
            throw new Error(this.t('alerts.tooLarge', {
                maxDimension: this.maxDimension,
                megapixels: Math.floor(this.maxCanvasPixels / 1000000)
            }));
        }
    },

    getCanvasBackground(format) {
        if (this.bgColor === 'transparent' && format.supportsAlpha) return null;
        if (this.bgColor === 'black') return '#000000';
        return '#ffffff';
    },

    sanitizeBaseName(name) {
        const base = String(name || 'image')
            .replace(/\.[^/.]+$/, '')
            .replace(/[\\/:*?"<>|]+/g, '-')
            .replace(/\s+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 80);

        return base || 'image';
    },

    showDownload() {
        this.updateDownloadInfo();
        this.renderResults();
        this.showPage('download');
    },

    renderResults() {
        if (!this.el.resultsList) return;
        this.el.resultsList.replaceChildren();

        this.results.forEach((result) => {
            const item = document.createElement('div');
            item.className = 'result-item';

            const image = document.createElement('img');
            image.className = 'result-thumb';
            image.src = result.url;
            image.alt = '';

            const info = document.createElement('div');
            info.className = 'result-info';

            const name = document.createElement('div');
            name.className = 'result-name';
            name.textContent = result.originalName;

            const dims = document.createElement('div');
            dims.className = 'result-dims';
            dims.textContent = `${result.originalWidth} x ${result.originalHeight} -> `;

            const newDims = document.createElement('span');
            newDims.textContent = `${result.newWidth} x ${result.newHeight}`;
            dims.appendChild(newDims);

            const size = document.createElement('div');
            size.className = 'result-savings';
            const savedBytes = Math.max(0, result.originalSize - result.newSize);
            const qualityText = result.qualityUsed ? ` at ${result.qualityUsed}%` : '';
            size.textContent = `${this.utils.formatFileSize(result.originalSize)} -> ${this.utils.formatFileSize(result.newSize)} (${this.utils.formatFileSize(savedBytes)} saved${qualityText})`;

            info.append(name, dims, size);
            item.append(image, info);
            this.el.resultsList.appendChild(item);
        });
    },

    async download() {
        if (!this.results.length) return;

        if (this.results.length === 1) {
            this.downloadBlob(this.results[0].blob, this.results[0].fileName);
            return;
        }

        if (typeof JSZip === 'undefined') {
            for (const result of this.results) {
                this.downloadBlob(result.blob, result.fileName);
                await this.delay(200);
            }
            return;
        }

        const zip = new JSZip();
        this.results.forEach((result) => zip.file(result.fileName, result.blob));

        const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
        const date = new Date().toISOString().slice(0, 10);
        this.downloadBlob(zipBlob, `resized-images-${date}.zip`);
    },

    downloadBlob(blob, name) {
        this.utils.downloadBlob(blob, name);
    },

    share(type) {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(this.t('share.text'));
        const shareUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
            whatsapp: `https://wa.me/?text=${text}%20${url}`
        };

        if (!shareUrls[type]) return;
        const popup = window.open(shareUrls[type], '_blank', 'noopener,noreferrer,width=640,height=520');
        if (popup) popup.opener = null;
    },

    async copyCurrentLink() {
        const text = window.location.href;
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                this.fallbackCopy(text);
            }
            this.notify(this.t('alerts.linkCopied'));
        } catch (error) {
            this.notify(this.t('alerts.copyFailed'));
        }
    },

    fallbackCopy(text) {
        const input = document.createElement('textarea');
        input.value = text;
        input.setAttribute('readonly', '');
        input.style.position = 'fixed';
        input.style.left = '-9999px';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
    },

    reset() {
        this.releaseResults();
        this.images.forEach((image) => image.url && URL.revokeObjectURL(image.url));
        this.images = [];
        this.currentIdx = 0;
        this.showPage('upload');
        this.updatePreview();
    },

    releaseResults() {
        this.results.forEach((result) => result.url && URL.revokeObjectURL(result.url));
        this.results = [];
    },

    showProcessing(show) {
        this.el.processing?.classList.toggle('active', show);
        if (this.el.btnResize) this.el.btnResize.disabled = show;
        if (!show && this.el.progressBar) this.el.progressBar.style.width = '0%';
    },

    updateProgress(current, total, text) {
        const pct = total > 0 ? Math.round((current / total) * 100) : 0;
        if (this.el.processingText) this.el.processingText.textContent = text;
        if (this.el.progressBar) this.el.progressBar.style.width = `${pct}%`;
    },

    notify(message, isError = false) {
        const text = String(message || '').trim();
        if (!text) return;

        if (!this.el.toast) {
            window.alert(text);
            return;
        }

        window.clearTimeout(this.toastTimer);
        this.el.toast.textContent = text;
        this.el.toast.classList.toggle('error', Boolean(isError));
        this.el.toast.classList.add('show');

        this.toastTimer = window.setTimeout(() => {
            this.el.toast?.classList.remove('show');
        }, 2800);
    },

    clampNumber(value, min, max, fallback) {
        if (!Number.isFinite(value)) return fallback;
        return Math.min(max, Math.max(min, value));
    },

    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
