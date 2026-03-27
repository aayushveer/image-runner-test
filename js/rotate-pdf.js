'use strict';

const RotatePdfApp = {
    sourceFile: null,
    sourcePdfLib: null,
    sourcePdfJs: null,
    sourceBytes: null,
    sourcePageCount: 0,
    sourceSize: 0,
    selectedPages: new Set(),
    pageRotations: {},
    applyMode: 'all',
    angleMode: 'left',
    outputBlob: null,
    outputName: 'rotated.pdf',
    utils: null,
    el: {},

    init() {
        this.utils = window.ImageRunnerUtils || {
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
        };

        if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

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
            fileInputNew: document.getElementById('file-input-new'),

            fileName: document.getElementById('pdf-file-name'),
            pagesCount: document.getElementById('pdf-pages-count'),
            originalSize: document.getElementById('pdf-original-size'),
            pagesGrid: document.getElementById('pages-grid'),

            applyInputs: document.querySelectorAll('input[name="apply-mode"]'),
            angleInputs: document.querySelectorAll('input[name="angle"]'),
            selectionHint: document.getElementById('selection-hint'),

            btnRotate: document.getElementById('btn-rotate'),
            btnDownloadEditor: document.getElementById('btn-download-editor'),
            btnDownload: document.getElementById('btn-download'),
            btnMore: document.getElementById('btn-more'),

            downloadInfo: document.getElementById('download-info'),
            outputName: document.getElementById('output-name'),
            outputSize: document.getElementById('output-size'),

            processing: document.getElementById('processing'),
            processingText: document.getElementById('processing-text'),
            progressBar: document.getElementById('progress-bar')
        };
    },

    bindEvents() {
        this.el.fileInput?.addEventListener('change', (e) => this.handleFile(e.target.files?.[0]));
        this.el.fileInputNew?.addEventListener('change', (e) => this.handleFile(e.target.files?.[0]));

        this.el.dropzone?.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.el.dropzone.classList.add('dropzone--active');
        });

        this.el.dropzone?.addEventListener('dragleave', () => {
            this.el.dropzone.classList.remove('dropzone--active');
        });

        this.el.dropzone?.addEventListener('drop', (e) => {
            e.preventDefault();
            this.el.dropzone.classList.remove('dropzone--active');
            const file = e.dataTransfer?.files?.[0];
            if (file) this.handleFile(file);
        });

        this.el.applyInputs.forEach((input) => {
            input.addEventListener('change', () => {
                this.applyMode = input.value;
                this.syncSelectionMode();
            });
        });

        this.el.angleInputs.forEach((input) => {
            input.addEventListener('change', () => {
                this.angleMode = input.value;
            });
        });

        this.el.btnRotate?.addEventListener('click', () => this.rotatePreview());
        this.el.btnDownloadEditor?.addEventListener('click', () => this.generateAndDownload());
        this.el.btnDownload?.addEventListener('click', () => this.downloadOutput());
        this.el.btnMore?.addEventListener('click', () => this.reset());
    },

    showPage(name) {
        this.utils.setActivePage({ upload: this.el.pageUpload, editor: this.el.pageEditor, download: this.el.pageDownload }, name);
    },

    async loadPdfJsDocument(bytes) {
        return window.pdfjsLib.getDocument({ data: bytes }).promise;
    },

    async loadPdfLibDocument(bytes) {
        try {
            return await window.PDFLib.PDFDocument.load(bytes, {
                ignoreEncryption: false,
                throwOnInvalidObject: false,
                updateMetadata: false
            });
        } catch (_) {
            return window.PDFLib.PDFDocument.load(bytes, {
                ignoreEncryption: true,
                throwOnInvalidObject: false,
                updateMetadata: false
            });
        }
    },

    getOpenErrorMessage(err) {
        const message = String(err?.message || '').toLowerCase();
        const name = String(err?.name || '').toLowerCase();
        if (name.includes('passwordexception') || message.includes('password')) {
            return 'This PDF is password-protected. Remove password first, then try again.';
        }
        if (message.includes('encrypted')) {
            return 'This PDF appears encrypted or restricted. Please use an unlocked copy.';
        }
        return 'Failed to open this PDF. The file may be damaged, encrypted, or use an unsupported structure.';
    },

    async handleFile(file) {
        if (!file) return;
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
            alert('Please select a valid PDF file.');
            return;
        }

        if (!window.pdfjsLib || !window.PDFLib) {
            alert('PDF libraries are still loading. Please refresh and try again.');
            return;
        }

        try {
            this.showProcessing(true);
            this.updateProgress(10, 'Reading PDF...');

            this.sourceFile = file;
            this.sourceSize = file.size;
            const rawBytes = new Uint8Array(await file.arrayBuffer());
            this.sourceBytes = rawBytes;

            let pdfJsErr = null;
            let pdfLibErr = null;

            try {
                this.sourcePdfJs = await this.loadPdfJsDocument(rawBytes.slice());
            } catch (err) {
                pdfJsErr = err;
                this.sourcePdfJs = null;
            }

            try {
                this.sourcePdfLib = await this.loadPdfLibDocument(rawBytes.slice());
            } catch (err) {
                pdfLibErr = err;
                this.sourcePdfLib = null;
            }

            if (!this.sourcePdfLib && this.sourcePdfJs) {
                try {
                    const normalizedBytes = await this.sourcePdfJs.getData();
                    this.sourceBytes = normalizedBytes;
                    this.sourcePdfLib = await this.loadPdfLibDocument(normalizedBytes.slice());
                    pdfLibErr = null;
                } catch (err) {
                    pdfLibErr = err;
                }
            }

            if (!this.sourcePdfJs && this.sourcePdfLib) {
                try {
                    const normalized = await this.sourcePdfLib.save({ useObjectStreams: true, addDefaultPage: false });
                    const normalizedBytes = new Uint8Array(normalized);
                    this.sourceBytes = normalizedBytes;
                    this.sourcePdfJs = await this.loadPdfJsDocument(normalizedBytes.slice());
                    pdfJsErr = null;
                } catch (err) {
                    pdfJsErr = err;
                }
            }

            if (!this.sourcePdfJs || !this.sourcePdfLib) {
                throw pdfLibErr || pdfJsErr || new Error('Unable to initialize PDF engines');
            }

            this.sourcePageCount = this.sourcePdfLib.getPageCount();
            if (!this.sourcePageCount || this.sourcePageCount < 1) {
                throw new Error('No pages found in this PDF');
            }

            this.selectedPages = new Set(Array.from({ length: this.sourcePageCount }, (_, i) => i + 1));
            this.pageRotations = {};
            for (let i = 1; i <= this.sourcePageCount; i += 1) {
                this.pageRotations[i] = 0;
            }

            this.updateProgress(25, 'Rendering previews...');
            await this.renderPagePreviews();

            this.el.fileName.textContent = file.name;
            this.el.pagesCount.textContent = `${this.sourcePageCount} pages`;
            this.el.originalSize.textContent = this.utils.formatFileSize(this.sourceSize);
            this.el.btnRotate.disabled = false;
            if (this.el.btnDownloadEditor) this.el.btnDownloadEditor.disabled = false;
            this.syncSelectionMode();
            this.showPage('editor');
        } catch (err) {
            console.error(err);
            this.sourcePdfJs = null;
            this.sourcePdfLib = null;
            this.sourceBytes = null;
            this.sourcePageCount = 0;
            this.selectedPages.clear();
            alert(this.getOpenErrorMessage(err));
        } finally {
            this.showProcessing(false);
            if (this.el.fileInput) this.el.fileInput.value = '';
            if (this.el.fileInputNew) this.el.fileInputNew.value = '';
        }
    },

    async renderPagePreviews() {
        this.el.pagesGrid.innerHTML = '';
        for (let pageNumber = 1; pageNumber <= this.sourcePageCount; pageNumber += 1) {
            const page = await this.sourcePdfJs.getPage(pageNumber);
            const viewport = page.getViewport({ scale: 0.32 });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { alpha: false });
            canvas.width = Math.max(1, Math.floor(viewport.width));
            canvas.height = Math.max(1, Math.floor(viewport.height));
            await page.render({ canvasContext: ctx, viewport }).promise;

            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'page-card selected';
            card.dataset.page = String(pageNumber);
            card.innerHTML = `
                <img class="page-card__img" alt="Page ${pageNumber}" src="${canvas.toDataURL('image/jpeg', 0.72)}">
                <span class="page-card__top">TOP</span>
                <p class="page-card__num">Page ${pageNumber}</p>
                <span class="page-card__rot">0°</span>
            `;

            card.addEventListener('click', () => {
                if (this.applyMode !== 'selected') return;
                if (this.selectedPages.has(pageNumber)) {
                    if (this.selectedPages.size === 1) return;
                    this.selectedPages.delete(pageNumber);
                } else {
                    this.selectedPages.add(pageNumber);
                }
                this.syncSelectedCards();
            });

            this.el.pagesGrid.appendChild(card);
        }

        this.syncSelectedCards();
    },

    syncSelectionMode() {
        const isSelectedMode = this.applyMode === 'selected';
        this.el.selectionHint.hidden = !isSelectedMode;

        const cards = this.el.pagesGrid.querySelectorAll('.page-card');
        cards.forEach((card) => {
            card.classList.toggle('selectable', isSelectedMode);
            if (!isSelectedMode) {
                const page = Number(card.dataset.page);
                this.selectedPages.add(page);
            }
        });

        this.syncSelectedCards();
    },

    syncSelectedCards() {
        const cards = this.el.pagesGrid.querySelectorAll('.page-card');
        cards.forEach((card) => {
            const page = Number(card.dataset.page);
            const isSelected = this.applyMode === 'selected' ? this.selectedPages.has(page) : true;
            card.classList.toggle('selected', isSelected);
        });
    },

    getRotationDegrees() {
        if (this.angleMode === 'right') return 90;
        if (this.angleMode === '180') return 180;
        return 270; // left
    },

    rotatePreview() {
        if (!this.sourcePdfLib) return;

        const rotateDeg = this.getRotationDegrees();
        const targets = this.applyMode === 'selected'
            ? Array.from(this.selectedPages).sort((a, b) => a - b)
            : Array.from({ length: this.sourcePageCount }, (_, i) => i + 1);

        if (!targets.length) {
            alert('Select at least one page.');
            return;
        }

        targets.forEach((pageNo) => {
            const current = this.pageRotations[pageNo] || 0;
            this.pageRotations[pageNo] = (current + rotateDeg) % 360;
            this.updateCardRotation(pageNo);
        });
    },

    updateCardRotation(pageNo) {
        const card = this.el.pagesGrid.querySelector(`.page-card[data-page="${pageNo}"]`);
        if (!card) return;
        const deg = this.pageRotations[pageNo] || 0;
        const badge = card.querySelector('.page-card__rot');
        const image = card.querySelector('.page-card__img');
        if (badge) badge.textContent = `${deg}°`;
        if (image) image.style.transform = `rotate(${deg}deg)`;
    },

    async generateAndDownload() {
        if (!this.sourcePdfLib || !this.sourceBytes) return;

        this.showProcessing(true);
        this.updateProgress(10, 'Preparing rotated PDF...');

        try {
            const out = await window.PDFLib.PDFDocument.load(this.sourceBytes.slice(), {
                ignoreEncryption: true,
                throwOnInvalidObject: false,
                updateMetadata: false
            });

            const pages = out.getPages();
            for (let i = 0; i < pages.length; i += 1) {
                const pageNo = i + 1;
                const extra = this.pageRotations[pageNo] || 0;
                if (!extra) continue;
                const page = pages[i];
                const current = page.getRotation()?.angle || 0;
                page.setRotation(window.PDFLib.degrees((current + extra) % 360));
            }

            this.updateProgress(90, 'Finalizing download...');
            const bytes = await out.save({ useObjectStreams: true, addDefaultPage: false });
            this.outputBlob = new Blob([bytes], { type: 'application/pdf' });

            this.outputName = `${this.sourceFile.name.replace(/\.pdf$/i, '')}-rotated.pdf`;
            this.downloadOutput();
        } catch (err) {
            console.error(err);
            alert('Unable to prepare rotated PDF for download. Please try another file.');
        } finally {
            this.showProcessing(false);
        }
    },

    showDownload(rotatedPages, rotateDeg) {
        this.el.downloadInfo.textContent = `Rotated ${rotatedPages} page(s) by ${rotateDeg}°`;
        this.el.outputName.textContent = this.outputName;
        this.el.outputSize.textContent = this.utils.formatFileSize(this.outputBlob?.size || 0);
        this.showPage('download');
    },

    downloadOutput() {
        if (!this.outputBlob) return;
        this.utils.downloadBlob(this.outputBlob, this.outputName);
    },

    reset() {
        this.sourceFile = null;
        this.sourcePdfLib = null;
        this.sourcePdfJs = null;
        this.sourceBytes = null;
        this.sourcePageCount = 0;
        this.sourceSize = 0;
        this.selectedPages.clear();
        this.pageRotations = {};
        this.applyMode = 'all';
        this.angleMode = 'left';
        this.outputBlob = null;
        this.outputName = 'rotated.pdf';

        this.el.pagesGrid.innerHTML = '';
        this.el.btnRotate.disabled = true;
        if (this.el.btnDownloadEditor) this.el.btnDownloadEditor.disabled = true;
        this.el.applyInputs.forEach((i) => { i.checked = i.value === 'all'; });
        this.el.angleInputs.forEach((i) => { i.checked = i.value === 'left'; });
        this.syncSelectionMode();
        this.showPage('upload');
    },

    showProcessing(show) {
        this.el.processing?.classList.toggle('active', show);
        if (this.el.btnRotate) this.el.btnRotate.disabled = show || !this.sourcePdfLib;
        if (!show && this.el.progressBar) this.el.progressBar.style.width = '0%';
    },

    updateProgress(percent, text) {
        if (this.el.processingText) this.el.processingText.textContent = text;
        if (this.el.progressBar) this.el.progressBar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
    }
};

document.addEventListener('DOMContentLoaded', () => RotatePdfApp.init());
