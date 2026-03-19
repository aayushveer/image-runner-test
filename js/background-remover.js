'use strict';

let removeBackgroundFn = null;
let preloadFn = null;

const MODEL_VERSION = '1.6.0';
const OUTPUT_CONFIG = {
    format: 'image/png',
    quality: 0.98
};
const MODEL_CONFIGS = [
    {
        publicPath: `https://staticimgly.com/@imgly/background-removal-data/${MODEL_VERSION}/dist/`,
        model: 'isnet_fp16',
        device: 'cpu'
    },
    {
        publicPath: `https://cdn.jsdelivr.net/npm/@imgly/background-removal-data@${MODEL_VERSION}/dist/`,
        model: 'isnet_quint8',
        device: 'cpu'
    },
    {
        publicPath: `https://unpkg.com/@imgly/background-removal-data@${MODEL_VERSION}/dist/`,
        model: 'isnet_quint8',
        device: 'cpu'
    }
];

const App = {
    utils: window.ImageRunnerUtils || {
        formatFileSize: (bytes) => `${bytes} B`,
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
    },

    images: [],
    results: [],
    modelReady: false,
    warmupPromise: null,
    edgeSoftness: 2,
    alphaBoost: 12,
    bgMode: 'transparent',
    customColor: '#f4f4f5',
    customBgImage: null,
    customBgImageUrl: '',
    maxImages: 1,
    activeModelConfig: null,
    lastModelError: '',
    previewZoom: 1,
    activePreviewCard: null,
    alertTimer: null,
    nextImageId: 1,
    imageFingerprints: new Set(),
    cardById: new Map(),
    sliderFrameByNode: new WeakMap(),
    initialized: false,
    uploadedImage: null,
    processedImage: null,
    isProcessing: false,

    el: {},

    init() {
        if (this.initialized) return;
        this.initialized = true;
        this.cacheElements();
        this.bindEvents();
        this.el.btnProcess.disabled = true;
        this.warmupModel();
    },

    cacheElements() {
        this.el = {
            toolBackBtn: document.getElementById('tool-back-btn'),
            pageUpload: document.getElementById('page-upload'),
            pageEditor: document.getElementById('page-editor'),
            pageDownload: document.getElementById('page-download'),

            modelStatus: document.getElementById('model-status'),
            statusReady: document.getElementById('status-ready'),
            statusProcessing: document.getElementById('status-processing'),
            statusCompleted: document.getElementById('status-completed'),
            fileInput: document.getElementById('file-input'),
            fileInputMore: document.getElementById('file-input-more'),
            dropzone: document.getElementById('dropzone'),
            uploadProgress: document.getElementById('upload-progress'),
            uploadProgressBar: document.getElementById('upload-progress-bar'),
            uploadProgressLabel: document.getElementById('upload-progress-label'),
            uploadFeedback: document.getElementById('upload-feedback'),

            imageList: document.getElementById('image-list'),
            zoomIn: document.getElementById('zoom-in'),
            zoomOut: document.getElementById('zoom-out'),
            zoomReset: document.getElementById('zoom-reset'),
            previewZoom: document.getElementById('preview-zoom'),
            bgOptions: document.getElementById('bg-options'),
            bgCustomColor: document.getElementById('bg-custom-color'),
            bgCustomImage: document.getElementById('bg-custom-image'),
            bgImageName: document.getElementById('bg-image-name'),
            edgeSoftness: document.getElementById('edge-softness'),
            edgeSoftnessValue: document.getElementById('edge-softness-value'),
            alphaBoost: document.getElementById('alpha-boost'),
            alphaBoostValue: document.getElementById('alpha-boost-value'),
            btnProcess: document.getElementById('btn-process'),
            btnDownloadInline: document.getElementById('btn-download-inline'),
            editorStatus: document.getElementById('editor-status'),

            downloadInfo: document.getElementById('download-info'),
            resultsList: document.getElementById('results-list'),
            btnDownload: document.getElementById('btn-download'),
            btnMore: document.getElementById('btn-more'),
            downloadFeedback: document.getElementById('download-feedback'),

            processing: document.getElementById('processing'),
            processingText: document.getElementById('processing-text'),
            progressBar: document.getElementById('progress-bar'),
            uiAlert: document.getElementById('ui-alert')
        };
    },

    bindEvents() {
        this.el.toolBackBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleToolBack();
        });

        this.el.fileInput?.addEventListener('change', (e) => this.handleFiles(e.target.files));
        this.el.fileInputMore?.addEventListener('change', (e) => this.handleFiles(e.target.files));

        this.el.imageList?.addEventListener('click', (e) => {
            const card = e.target.closest('.img-card');
            if (!card) return;
            this.setActivePreviewCard(card);
        });

        ['dragenter', 'dragover'].forEach((eventName) => {
            this.el.dropzone?.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.el.dropzone.classList.add('drag-over');
            });
        });
        ['dragleave', 'drop'].forEach((eventName) => {
            this.el.dropzone?.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.el.dropzone.classList.remove('drag-over');
            });
        });

        document.body.addEventListener('dragover', (e) => e.preventDefault());
        document.body.addEventListener('drop', (e) => {
            e.preventDefault();
            if (e.target?.closest?.('#dropzone')) return;
            if (e.dataTransfer.files.length) this.handleFiles(e.dataTransfer.files);
        });

        this.el.zoomIn?.addEventListener('click', () => this.setPreviewZoom(this.previewZoom + 0.1));
        this.el.zoomOut?.addEventListener('click', () => this.setPreviewZoom(this.previewZoom - 0.1));
        this.el.zoomReset?.addEventListener('click', () => this.setPreviewZoom(1));

        this.el.bgOptions?.querySelectorAll('.bg-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.el.bgOptions.querySelectorAll('.bg-btn').forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                this.bgMode = btn.dataset.bg;

                if (this.bgMode === 'custom-image' && !this.customBgImage) {
                    this.showAlert('Please upload a custom background image first.', 'error');
                    this.bgMode = 'transparent';
                    const defaultBtn = this.el.bgOptions.querySelector('[data-bg="transparent"]');
                    this.el.bgOptions.querySelectorAll('.bg-btn').forEach((b) => b.classList.remove('active'));
                    defaultBtn?.classList.add('active');
                }
            });
        });

        this.el.bgCustomColor?.addEventListener('input', (e) => {
            this.customColor = e.target.value || '#f4f4f5';
        });

        this.el.bgCustomImage?.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (!file || !file.type.startsWith('image/')) return;

            try {
                await this.setCustomBackgroundImage(file);
                if (this.el.bgImageName) this.el.bgImageName.textContent = file.name;
                this.bgMode = 'custom-image';
                this.el.bgOptions.querySelectorAll('.bg-btn').forEach((b) => b.classList.remove('active'));
                this.el.bgOptions.querySelector('[data-bg="custom-image"]')?.classList.add('active');
            } catch {
                this.showAlert('Could not load custom background image.', 'error');
            } finally {
                e.target.value = '';
            }
        });

        this.el.edgeSoftness?.addEventListener('input', (e) => {
            this.edgeSoftness = parseInt(e.target.value, 10) || 0;
            this.el.edgeSoftnessValue.textContent = String(this.edgeSoftness);
        });

        this.el.alphaBoost?.addEventListener('input', (e) => {
            this.alphaBoost = parseInt(e.target.value, 10) || 0;
            this.el.alphaBoostValue.textContent = String(this.alphaBoost);
        });

        this.el.btnProcess?.addEventListener('click', () => this.processAll());
        this.el.btnDownloadInline?.addEventListener('click', () => this.downloadAll());
        this.el.btnDownload?.addEventListener('click', () => this.downloadAll());
        this.el.btnMore?.addEventListener('click', () => this.reset());
    },

    handleToolBack() {
        if (this.el.pageEditor?.classList.contains('active')) {
            this.showPage('upload');
            return;
        }
        if (this.el.pageDownload?.classList.contains('active')) {
            this.showPage('editor');
            return;
        }
        window.location.href = 'index.html';
    },

    showPage(name) {
        this.utils.setActivePage(
            {
                upload: this.el.pageUpload,
                editor: this.el.pageEditor,
                download: this.el.pageDownload
            },
            name
        );
    },

    async warmupModel() {
        if (this.warmupPromise) return this.warmupPromise;

        this.el.modelStatus.textContent = 'Getting ready…';
        this.setToolState('ready');

        this.warmupPromise = (async () => {
            try {
                const loaderCandidates = [
                    'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.6.0/+esm',
                    'https://unpkg.com/@imgly/background-removal@1.6.0/+esm'
                ];

                for (const src of loaderCandidates) {
                    try {
                        const mod = await import(src);
                        if (mod?.removeBackground) {
                            removeBackgroundFn = mod.removeBackground;
                            preloadFn = typeof mod.preload === 'function' ? mod.preload : null;
                            break;
                        }
                    } catch {
                        // try next CDN
                    }
                }

                if (!removeBackgroundFn) {
                    throw new Error('AI module import failed');
                }

                this.modelReady = true;
                this.el.btnProcess.disabled = this.isProcessing || this.images.length === 0;

                let preloaded = false;
                if (preloadFn) {
                    for (const config of MODEL_CONFIGS) {
                        try {
                            await preloadFn({
                                ...config,
                                progress: (key, current, total) => {
                                    if (!total) return;
                                    this.el.modelStatus.textContent = 'Getting ready…';
                                }
                            });
                            this.activeModelConfig = { ...config };
                            preloaded = true;
                            break;
                        } catch {
                            // try next model endpoint
                        }
                    }
                }

                this.el.modelStatus.textContent = preloaded
                    ? 'Ready'
                    : 'Ready';
                this.el.modelStatus.style.background = '#dcfce7';
                this.el.modelStatus.style.borderColor = '#bbf7d0';
                this.el.modelStatus.style.color = '#166534';
                this.showUploadFeedback('Tool ready. Upload your image to start.', 'success');
            } catch (error) {
                this.modelReady = false;
                this.lastModelError = error?.message || String(error);
                this.el.modelStatus.textContent = 'Setup issue. Refresh once.';
                this.el.modelStatus.style.background = '#fee2e2';
                this.el.modelStatus.style.borderColor = '#fecaca';
                this.el.modelStatus.style.color = '#991b1b';
                this.el.btnProcess.disabled = this.isProcessing || this.images.length === 0;
                this.showUploadFeedback('We could not initialize AI right now. Please refresh once and retry.', 'error');
            }
        })();

        return this.warmupPromise;
    },

    async handleFiles(fileList) {
        if (!fileList || !fileList.length) return;

        const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
        if (!files.length) {
            this.showUploadFeedback('Please upload a valid image file.', 'error');
            this.showAlert('Only image files are supported.', 'error');
            return;
        }

        const acceptedFiles = files.slice(0, 1);
        this.showUploadProgress(true);
        this.setToolState('uploading');

        this.results.forEach((r) => r.url && URL.revokeObjectURL(r.url));
        this.images.forEach((i) => i.url && URL.revokeObjectURL(i.url));
        this.images = [];
        this.results = [];
        this.imageFingerprints.clear();
        this.cardById.clear();
        this.uploadedImage = null;
        this.processedImage = null;
        if (this.el.resultsList) this.el.resultsList.innerHTML = '';
        if (this.el.btnDownloadInline) this.el.btnDownloadInline.disabled = true;

        for (let i = 0; i < acceptedFiles.length; i++) {
            const file = acceptedFiles[i];
            this.updateUploadProgress(i / acceptedFiles.length, `Uploading image ${i + 1}/${acceptedFiles.length}…`);
            try {
                const fingerprint = `${file.name}::${file.size}::${file.lastModified}`;
                if (this.imageFingerprints.has(fingerprint)) continue;
                const item = await this.loadImage(file);
                this.images.push(item);
                this.imageFingerprints.add(fingerprint);
                this.uploadedImage = item;
            } catch {
                this.showUploadFeedback(`Could not load ${file.name}. Please try another image.`, 'error');
            }
        }

        this.renderImageCards();
        this.updateUploadProgress(1, 'Upload complete');
        setTimeout(() => this.showUploadProgress(false), 420);

        if (this.el.fileInput) this.el.fileInput.value = '';
        if (this.el.fileInputMore) this.el.fileInputMore.value = '';

        if (this.images.length > 0) {
            this.showPage('editor');
            await this.warmupModel();
            if (this.el.editorStatus) {
                this.el.editorStatus.textContent = 'Before/After compare dekho, then Remove Background dabao.';
            }
            this.showUploadFeedback('Image ready to process.', 'success');
            this.setToolState('ready');
            this.el.btnProcess.disabled = this.isProcessing || this.images.length === 0;
        }
    },

    loadImage(file) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => resolve({
                id: this.nextImageId++,
                file,
                name: file.name,
                size: file.size,
                url,
                element: img
            });
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('invalid image'));
            };
            img.src = url;
        });
    },

    renderImageCards() {
        const aliveIds = new Set();

        this.images.forEach((item) => {
            aliveIds.add(item.id);
            let card = this.cardById.get(item.id);

            if (!card) {
                card = this.createPreviewCard(item);
                this.cardById.set(item.id, card);
                this.el.imageList.appendChild(card);
            } else if (!card.isConnected) {
                this.el.imageList.appendChild(card);
            }

            const infoNode = card.querySelector('.img-card__info');
            if (infoNode) infoNode.textContent = item.name;

            item.previewNode = card.querySelector('[data-preview-image]');
            item.previewBadgeNode = card.querySelector('[data-preview-badge]');

            const previewSrc = item.processedResult?.url || item.url;
            if (item.previewNode && item.previewNode.src !== previewSrc) {
                item.previewNode.src = previewSrc;
            }
            if (item.previewBadgeNode) {
                item.previewBadgeNode.textContent = item.processedResult ? 'After' : 'Before';
            }
        });

        Array.from(this.cardById.keys()).forEach((id) => {
            if (aliveIds.has(id)) return;
            const staleCard = this.cardById.get(id);
            if (staleCard?.isConnected) staleCard.remove();
            this.cardById.delete(id);
        });

        if (!this.activePreviewCard?.isConnected) {
            this.activePreviewCard = null;
        }

        if (!this.activePreviewCard) {
            const firstCard = this.el.imageList.querySelector('.img-card');
            if (firstCard) this.setActivePreviewCard(firstCard);
        }
        this.applyPreviewZoom();
    },

    createPreviewCard(item) {
        const card = document.createElement('article');
        card.className = 'img-card';
        card.dataset.imageId = String(item.id);
        card.innerHTML = `
            <div class="img-card__preview">
                <img src="${item.url}" alt="Preview" class="preview-image" data-preview-image>
                <span class="preview-badge" data-preview-badge>Before</span>
            </div>
            <div class="img-card__info">${item.name}</div>
        `;
        return card;
    },

    setActivePreviewCard(card) {
        this.el.imageList.querySelectorAll('.img-card').forEach((item) => item.classList.remove('img-card--active'));
        card?.classList.add('img-card--active');
        this.activePreviewCard = card;

        const activeId = Number(card?.dataset?.imageId || 0);
        if (!activeId) return;
        const activeImage = this.images.find((item) => item.id === activeId) || null;
        if (activeImage) {
            this.uploadedImage = activeImage;
            this.processedImage = activeImage.processedResult || null;
        }
    },

    setPreviewZoom(value) {
        const bounded = Math.min(2.2, Math.max(0.7, Number(value.toFixed(2))));
        this.previewZoom = bounded;
        this.applyPreviewZoom();
    },

    applyPreviewZoom() {
        if (this.el.previewZoom) this.el.previewZoom.textContent = `${Math.round(this.previewZoom * 100)}%`;
        this.el.imageList?.style.setProperty('--preview-zoom', String(this.previewZoom));
    },

    showUploadProgress(show) {
        this.el.uploadProgress?.classList.toggle('active', show);
        if (!show) {
            if (this.el.uploadProgressBar) this.el.uploadProgressBar.style.width = '0%';
            if (this.el.uploadProgressLabel) this.el.uploadProgressLabel.textContent = 'Uploading image…';
        }
    },

    updateUploadProgress(progress, text) {
        const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100);
        if (this.el.uploadProgressBar) this.el.uploadProgressBar.style.width = `${pct}%`;
        if (this.el.uploadProgressLabel && text) this.el.uploadProgressLabel.textContent = text;
    },

    showUploadFeedback(message, type = '') {
        if (!this.el.uploadFeedback) return;
        this.el.uploadFeedback.textContent = message || '';
        this.el.uploadFeedback.classList.remove('error', 'success');
        if (type) this.el.uploadFeedback.classList.add(type);
    },

    showAlert(message, type = '') {
        if (!this.el.uiAlert || !message) return;
        this.el.uiAlert.textContent = message;
        this.el.uiAlert.classList.remove('error', 'success', 'show');
        if (type) this.el.uiAlert.classList.add(type);
        this.el.uiAlert.classList.add('show');
        if (this.alertTimer) clearTimeout(this.alertTimer);
        this.alertTimer = setTimeout(() => {
            this.el.uiAlert?.classList.remove('show');
        }, 2400);
    },

    setToolState(state) {
        const states = [
            this.el.statusReady,
            this.el.statusProcessing,
            this.el.statusCompleted
        ];
        states.forEach((node) => node?.classList.remove('status-dot--active', 'status-dot--done'));

        if (state === 'uploading') {
            this.el.statusReady?.classList.add('status-dot--active');
            if (this.el.editorStatus) this.el.editorStatus.textContent = 'Uploading image…';
        } else if (state === 'ready') {
            this.el.statusReady?.classList.add('status-dot--active');
        } else if (state === 'processing') {
            this.el.statusReady?.classList.add('status-dot--done');
            this.el.statusProcessing?.classList.add('status-dot--active');
            if (this.el.editorStatus) this.el.editorStatus.textContent = 'Processing background…';
        } else if (state === 'completed') {
            this.el.statusReady?.classList.add('status-dot--done');
            this.el.statusProcessing?.classList.add('status-dot--done');
            this.el.statusCompleted?.classList.add('status-dot--active');
            if (this.el.editorStatus) this.el.editorStatus.textContent = 'Completed. Download PNG ready.';
        } else if (state === 'error') {
            this.el.statusReady?.classList.add('status-dot--active');
            if (this.el.editorStatus) this.el.editorStatus.textContent = 'Error occurred. Please retry.';
        }
    },

    showProcessing(show, text = 'Removing background…') {
        this.el.processing?.classList.toggle('active', show);
        this.el.btnProcess.disabled = show;
        if (this.el.processingText) this.el.processingText.textContent = text;
        if (!show && this.el.progressBar) this.el.progressBar.style.width = '0%';
    },

    updateProgress(current, total, text) {
        const pct = Math.round((current / total) * 100);
        if (this.el.processingText) this.el.processingText.textContent = text;
        if (this.el.progressBar) this.el.progressBar.style.width = `${pct}%`;
    },

    async processAll() {
        if (!this.images.length || this.isProcessing) return;

        this.isProcessing = true;
        this.el.btnProcess.disabled = true;
        this.setToolState('processing');
        this.showProcessing(true, this.modelReady ? 'Removing background…' : 'Preparing AI…');
        this.results.forEach((r) => r.url && URL.revokeObjectURL(r.url));
        this.results = [];
        if (this.el.btnDownloadInline) this.el.btnDownloadInline.disabled = true;
        if (this.el.downloadFeedback) this.el.downloadFeedback.textContent = '';

        try {
            await this.warmupModel();

            const total = this.images.length;
            for (let i = 0; i < total; i++) {
                this.updateProgress(i, total, `Removing background ${i + 1}/${total}…`);
                const source = this.images[i];
                const result = await this.processSingle(source);
                this.results.push(result);
                source.processedResult = result;
                if (source.previewNode) source.previewNode.src = result.url;
                if (source.previewBadgeNode) source.previewBadgeNode.textContent = 'After';
                if (this.uploadedImage?.id === source.id) {
                    this.processedImage = result;
                }
            }

            this.updateProgress(total, total, 'Finalizing…');
            this.setToolState('completed');
            this.showDownload();
        } catch (error) {
            console.error(error);
            const reason = error?.message || this.lastModelError || 'Unknown error';
            this.showUploadFeedback('Background removal could not complete. Please retry with a clear image.', 'error');
            this.showAlert(`Background removal failed: ${reason}`, 'error');
            this.setToolState('error');
        } finally {
            this.showProcessing(false);
            this.isProcessing = false;
            this.el.btnProcess.disabled = this.images.length === 0;
        }
    },

    async processSingle(item) {
        if (!removeBackgroundFn) {
            throw new Error('AI model not available');
        }

        const cutoutBlob = await this.removeWithFallback(item.file);
        const refinedBlob = await this.refineAlpha(cutoutBlob, this.edgeSoftness, this.alphaBoost);
        const finalBlob = await this.applyBackground(refinedBlob, this.bgMode);

        const ext = this.bgMode === 'transparent' ? 'png' : 'jpg';
        const base = item.name.replace(/\.[^/.]+$/, '');
        const fileName = `${base}_no-bg.${ext}`;

        return {
            fileName,
            blob: finalBlob,
            url: URL.createObjectURL(finalBlob),
            originalName: item.name,
            size: finalBlob.size
        };
    },

    async removeWithFallback(sourceImage) {
        const configs = this.activeModelConfig
            ? [this.activeModelConfig, ...MODEL_CONFIGS.filter((cfg) => cfg.publicPath !== this.activeModelConfig.publicPath)]
            : MODEL_CONFIGS;

        let lastErr = null;
        for (const config of configs) {
            try {
                const result = await removeBackgroundFn(sourceImage, {
                    ...config,
                    output: { ...OUTPUT_CONFIG },
                    progress: (key, current) => {
                        if (current >= 0 && this.el.processingText) {
                            this.el.processingText.textContent = 'Removing background…';
                        }
                    }
                });
                this.activeModelConfig = { ...config };
                this.lastModelError = '';
                return result;
            } catch (error) {
                lastErr = error;
            }
        }

        this.lastModelError = lastErr?.message || String(lastErr || 'Unknown model error');
        throw new Error(`All AI model endpoints failed: ${this.lastModelError}`);
    },

    async refineAlpha(blob, softness = 2, boost = 12) {
        const image = await this.blobToImage(blob);
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(image, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const gamma = 1 - Math.min(boost, 30) / 100;
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] === 0 || data[i] === 255) continue;
            const n = data[i] / 255;
            data[i] = Math.max(0, Math.min(255, Math.round(Math.pow(n, gamma) * 255)));
        }

        if (softness > 0) {
            const radius = softness > 3 ? 2 : 1;
            this.blurAlpha(data, canvas.width, canvas.height, radius);
        }

        ctx.putImageData(imageData, 0, 0);
        return await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.98));
    },

    blurAlpha(data, width, height, radius) {
        const src = new Uint8ClampedArray(data.length);
        src.set(data);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let sum = 0;
                let count = 0;
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
                        const idx = (ny * width + nx) * 4 + 3;
                        sum += src[idx];
                        count++;
                    }
                }
                const alphaIdx = (y * width + x) * 4 + 3;
                if (src[alphaIdx] > 0 && src[alphaIdx] < 255) {
                    data[alphaIdx] = Math.round(sum / count);
                }
            }
        }
    },

    async applyBackground(blob, bgMode) {
        if (bgMode === 'transparent') return blob;

        const image = await this.blobToImage(blob);
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const ctx = canvas.getContext('2d');

        if (bgMode === 'custom-image' && this.customBgImage) {
            this.drawImageCover(ctx, this.customBgImage, canvas.width, canvas.height);
        } else {
            const fillColor = bgMode === 'custom-color' ? this.customColor : bgMode;
            ctx.fillStyle = fillColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(image, 0, 0);

        return await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95));
    },

    drawImageCover(ctx, sourceImage, targetWidth, targetHeight) {
        const srcWidth = sourceImage.naturalWidth || sourceImage.width;
        const srcHeight = sourceImage.naturalHeight || sourceImage.height;
        const scale = Math.max(targetWidth / srcWidth, targetHeight / srcHeight);
        const drawWidth = srcWidth * scale;
        const drawHeight = srcHeight * scale;
        const drawX = (targetWidth - drawWidth) / 2;
        const drawY = (targetHeight - drawHeight) / 2;
        ctx.drawImage(sourceImage, drawX, drawY, drawWidth, drawHeight);
    },

    async setCustomBackgroundImage(file) {
        const originalImage = await this.fileToImage(file);

        const maxDimension = 2048;
        const srcWidth = originalImage.naturalWidth;
        const srcHeight = originalImage.naturalHeight;
        const scale = Math.min(1, maxDimension / Math.max(srcWidth, srcHeight));

        if (scale === 1) {
            this.customBgImage = originalImage;
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(srcWidth * scale));
        canvas.height = Math.max(1, Math.round(srcHeight * scale));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
        if (!blob) throw new Error('background image optimization failed');
        this.customBgImage = await this.blobToImage(blob);
    },

    async fileToImage(file) {
        const objectUrl = URL.createObjectURL(file);
        try {
            const image = await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('image decode failed'));
                img.src = objectUrl;
            });
            return image;
        } finally {
            URL.revokeObjectURL(objectUrl);
        }
    },

    blobToImage(blob) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(blob);
            const image = new Image();
            image.onload = () => {
                URL.revokeObjectURL(url);
                resolve(image);
            };
            image.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('image decode failed'));
            };
            image.src = url;
        });
    },

    showDownload() {
        this.el.downloadInfo.textContent = `${this.results.length} image${this.results.length > 1 ? 's' : ''} processed`;
        this.el.resultsList.innerHTML = '';

        this.results.forEach((item) => {
            const node = document.createElement('article');
            node.className = 'result-item';
            node.innerHTML = `
                <img src="${item.url}" alt="Processed">
                <div class="meta">${item.originalName}<br>${this.utils.formatFileSize(item.size)}</div>
            `;
            this.el.resultsList.appendChild(node);
        });

        if (this.el.editorStatus) {
            this.el.editorStatus.textContent = `${this.results.length} image ready. Download Result dabao.`;
        }
        if (this.el.btnDownloadInline) {
            this.el.btnDownloadInline.disabled = this.results.length === 0;
        }
        this.showAlert('Background removed successfully. Download PNG is ready.', 'success');
    },

    async downloadAll() {
        if (!this.results.length) return;

        if (this.results.length === 1) {
            this.utils.downloadBlob(this.results[0].blob, this.results[0].fileName);
            if (this.el.downloadFeedback) this.el.downloadFeedback.textContent = 'Download complete! Your PNG is saved.';
            this.showAlert('PNG downloaded successfully.', 'success');
            return;
        }

        if (typeof JSZip === 'undefined') {
            for (const file of this.results) {
                this.utils.downloadBlob(file.blob, file.fileName);
                await new Promise((r) => setTimeout(r, 140));
            }
            if (this.el.downloadFeedback) this.el.downloadFeedback.textContent = 'Downloads complete! Images were saved separately.';
            this.showAlert('All images downloaded.', 'success');
            return;
        }

        const zip = new JSZip();
        this.results.forEach((file) => zip.file(file.fileName, file.blob));
        const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
        this.utils.downloadBlob(zipBlob, `background-removed-${Date.now()}.zip`);
        if (this.el.downloadFeedback) this.el.downloadFeedback.textContent = 'Download complete! ZIP with PNG files is saved.';
        this.showAlert('ZIP downloaded successfully.', 'success');
    },

    reset() {
        this.results.forEach((r) => r.url && URL.revokeObjectURL(r.url));
        this.images.forEach((i) => i.url && URL.revokeObjectURL(i.url));
        this.images = [];
        this.results = [];
        this.imageFingerprints.clear();
        this.cardById.clear();
        this.sliderFrameByNode = new WeakMap();
        this.customBgImageUrl = '';
        this.customBgImage = null;
        if (this.el.bgImageName) this.el.bgImageName.textContent = 'No custom background selected.';
        this.uploadedImage = null;
        this.processedImage = null;
        this.isProcessing = false;
        this.previewZoom = 1;
        this.activePreviewCard = null;
        this.el.imageList.innerHTML = '';
        this.el.resultsList.innerHTML = '';
        if (this.el.btnDownloadInline) this.el.btnDownloadInline.disabled = true;
        if (this.el.btnProcess) this.el.btnProcess.disabled = true;
        if (this.el.downloadFeedback) this.el.downloadFeedback.textContent = '';
        this.showUploadFeedback('');
        if (this.el.editorStatus) this.el.editorStatus.textContent = 'Upload ke baad preview check karo, phir Remove Background dabao.';
        this.setToolState('ready');
        this.applyPreviewZoom();
        this.showPage('upload');
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
