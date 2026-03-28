/**
 * COMPRESS-PDF.JS - Compress PDF in browser
 */

'use strict';

const CompressPdfApp = {
    sourceFile: null,
    sourceBytes: null,
    sourcePdf: null,
    sourcePageCount: 0,
    sourceSize: 0,
    outputBlob: null,
    outputUsedOriginal: false,
    selectedPages: new Set(),
    mode: 'balanced',
    pageRange: 'all',
    utils: null,
    el: {},

    modeConfig: {
        high: { renderScale: 2.0, jpegQuality: 0.85 },
        balanced: { renderScale: 1.5, jpegQuality: 0.72 },
        compact: { renderScale: 1.2, jpegQuality: 0.58 }
    },

    modeProfiles: {
        high: [
            { renderScale: 2.0, jpegQuality: 0.85 },
            { renderScale: 1.7, jpegQuality: 0.78 },
            { renderScale: 1.45, jpegQuality: 0.70 }
        ],
        balanced: [
            { renderScale: 1.5, jpegQuality: 0.72 },
            { renderScale: 1.3, jpegQuality: 0.64 },
            { renderScale: 1.1, jpegQuality: 0.56 }
        ],
        compact: [
            { renderScale: 1.2, jpegQuality: 0.58 },
            { renderScale: 1.0, jpegQuality: 0.50 },
            { renderScale: 0.9, jpegQuality: 0.42 }
        ]
    },

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
            modeButtons: document.querySelectorAll('.mode-btn'),
            pageRangeInputs: document.querySelectorAll('input[name="page-range"]'),
            selectedPagesHint: document.getElementById('selected-pages-hint'),

            btnCompress: document.getElementById('btn-compress'),
            btnDownload: document.getElementById('btn-download'),
            btnMore: document.getElementById('btn-more'),

            downloadInfo: document.getElementById('download-info'),
            outName: document.getElementById('pdf-output-name'),
            outSize: document.getElementById('pdf-output-size'),
            statOriginal: document.getElementById('stat-original'),
            statCompressed: document.getElementById('stat-compressed'),
            statSaved: document.getElementById('stat-saved'),

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

        this.el.modeButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                this.el.modeButtons.forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                this.mode = btn.dataset.mode;
            });
        });

        this.el.pageRangeInputs.forEach((input) => {
            input.addEventListener('change', () => {
                this.pageRange = input.value;
                this.updateSelectableState();
            });
        });

        this.el.btnCompress?.addEventListener('click', () => this.compressPdf());
        this.el.btnDownload?.addEventListener('click', () => this.downloadOutput());
        this.el.btnMore?.addEventListener('click', () => this.reset());
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

    async handleFile(file) {
        if (!file) return;

        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
            alert('Please select a valid PDF file.');
            return;
        }

        if (file.size > 100 * 1024 * 1024) {
            alert('Please select a PDF under 100 MB for browser-based compression.');
            return;
        }

        if (!window.pdfjsLib || typeof jspdf === 'undefined') {
            alert('PDF libraries are not loaded yet. Please refresh and try again.');
            return;
        }

        try {
            this.showProcessing(true);
            this.updateProgress(5, 'Reading PDF...');

            this.sourceFile = file;
            this.sourceSize = file.size;
            this.sourceBytes = await file.arrayBuffer();
            this.sourcePdf = await window.pdfjsLib.getDocument({ data: this.sourceBytes }).promise;
            this.sourcePageCount = this.sourcePdf.numPages;

            this.selectedPages = new Set(Array.from({ length: this.sourcePageCount }, (_, i) => i + 1));

            this.updateProgress(20, 'Rendering page previews...');
            await this.renderPagePreviews();

            this.el.fileName.textContent = file.name;
            this.el.pagesCount.textContent = `${this.sourcePageCount} pages`;
            this.el.originalSize.textContent = this.utils.formatFileSize(this.sourceSize);
            this.el.btnCompress.disabled = false;

            this.updateSelectableState();
            this.showPage('editor');
        } catch (err) {
            console.error(err);
            alert('Failed to open this PDF. The file may be encrypted or unsupported.');
        } finally {
            this.showProcessing(false);
            if (this.el.fileInput) this.el.fileInput.value = '';
            if (this.el.fileInputNew) this.el.fileInputNew.value = '';
        }
    },

    async renderPagePreviews() {
        this.el.pagesGrid.innerHTML = '';

        for (let pageNumber = 1; pageNumber <= this.sourcePageCount; pageNumber += 1) {
            const page = await this.sourcePdf.getPage(pageNumber);
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
                <img alt="Page ${pageNumber}" src="${canvas.toDataURL('image/jpeg', 0.72)}">
                <p class="page-card__num">Page ${pageNumber}</p>
            `;

            card.addEventListener('click', () => {
                if (this.pageRange !== 'selected') return;
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

    updateSelectableState() {
        const selectable = this.pageRange === 'selected';
        this.el.selectedPagesHint.hidden = !selectable;

        const cards = this.el.pagesGrid.querySelectorAll('.page-card');
        cards.forEach((card) => {
            card.classList.toggle('selectable', selectable);
            if (!selectable) {
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
            card.classList.toggle('selected', this.selectedPages.has(page));
        });
    },

    getPagesToCompress() {
        if (this.pageRange !== 'selected') {
            return Array.from({ length: this.sourcePageCount }, (_, i) => i + 1);
        }
        return Array.from(this.selectedPages).sort((a, b) => a - b);
    },

    async compressPdf() {
        if (!this.sourcePdf) return;

        const pagesToCompress = this.getPagesToCompress();
        if (!pagesToCompress.length) {
            alert('Please select at least one page.');
            return;
        }

        this.showProcessing(true);

        try {
            this.outputUsedOriginal = false;

            const modeProfiles = this.modeProfiles[this.mode] || [this.modeConfig[this.mode]];
            let attempts = [...modeProfiles];

            // If first pass isn't enough, auto-fallback to compact profile before giving up.
            if (this.mode !== 'compact') {
                attempts = attempts.concat(this.modeProfiles.compact);
            }

            let bestBlob = null;
            let bestSize = Number.POSITIVE_INFINITY;

            for (let pass = 0; pass < attempts.length; pass += 1) {
                const settings = attempts[pass];
                this.updateProgress(Math.round((pass / attempts.length) * 30), `Analyzing pass ${pass + 1} of ${attempts.length}...`);

                const candidateBlob = await this.compressWithSettings(pagesToCompress, settings, pass, attempts.length);
                if (candidateBlob.size < bestSize) {
                    bestBlob = candidateBlob;
                    bestSize = candidateBlob.size;
                }

                // Early stop as soon as we get at least ~2% reduction for all-pages compression.
                if (this.pageRange === 'all' && candidateBlob.size <= this.sourceSize * 0.98) {
                    break;
                }
            }

            // Never return a larger file when compressing all pages; keep original for best UX.
            if (this.pageRange === 'all' && bestBlob && bestBlob.size >= this.sourceSize) {
                this.outputBlob = new Blob([this.sourceBytes], { type: 'application/pdf' });
                this.outputUsedOriginal = true;
            } else {
                this.outputBlob = bestBlob;
            }

            this.showDownload();
        } catch (err) {
            console.error(err);
            alert('Compression failed. Please try another PDF or a different mode.');
        } finally {
            this.showProcessing(false);
        }
    },

    showDownload() {
        const original = this.sourceSize;
        const compressed = this.outputBlob.size;
        const savedBytes = original - compressed;
        const savedPct = original > 0 ? Math.round((savedBytes / original) * 100) : 0;

        this.el.statOriginal.textContent = this.utils.formatFileSize(original);
        this.el.statCompressed.textContent = this.utils.formatFileSize(compressed);
        this.el.statSaved.textContent = savedPct >= 0 ? `${savedPct}%` : `+${Math.abs(savedPct)}%`;

        const outputName = this.buildOutputFileName();
        this.el.outName.textContent = outputName;
        this.el.outSize.textContent = this.utils.formatFileSize(compressed);

        if (this.outputUsedOriginal) {
            this.el.statSaved.textContent = '0%';
            this.el.downloadInfo.textContent = 'This PDF is already highly optimized. Returned original for best size.';
        } else if (savedPct >= 0) {
            this.el.downloadInfo.textContent = `PDF size reduced by ${savedPct}%`;
        } else {
            this.el.downloadInfo.textContent = 'Output is slightly larger for selected page set. Try Compact mode or different pages.';
        }

        this.showPage('download');
    },

    buildOutputFileName() {
        const base = this.sourceFile?.name?.replace(/\.pdf$/i, '') || 'document';
        return `${base}-compressed.pdf`;
    },

    downloadOutput() {
        if (!this.outputBlob) return;
        this.utils.downloadBlob(this.outputBlob, this.buildOutputFileName());
    },

    reset() {
        this.sourceFile = null;
        this.sourceBytes = null;
        this.sourcePdf = null;
        this.sourcePageCount = 0;
        this.sourceSize = 0;
        this.outputBlob = null;
        this.outputUsedOriginal = false;
        this.selectedPages.clear();
        this.pageRange = 'all';
        this.mode = 'balanced';

        this.el.pagesGrid.innerHTML = '';
        this.el.btnCompress.disabled = true;

        this.el.modeButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.mode === 'balanced'));
        this.el.pageRangeInputs.forEach((input) => {
            input.checked = input.value === 'all';
        });

        this.showPage('upload');
    },

    showProcessing(show) {
        this.el.processing?.classList.toggle('active', show);
        if (this.el.btnCompress) this.el.btnCompress.disabled = show || !this.sourcePdf;
        if (!show && this.el.progressBar) this.el.progressBar.style.width = '0%';
    },

    updateProgress(percent, text) {
        if (this.el.processingText) this.el.processingText.textContent = text;
        if (this.el.progressBar) this.el.progressBar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
    },

    async compressWithSettings(pagesToCompress, settings, passIndex, passTotal) {
        const { jsPDF } = jspdf;
        let pdfDoc = null;

        for (let i = 0; i < pagesToCompress.length; i += 1) {
            const pageNum = pagesToCompress[i];
            const pageProgress = ((i + 1) / pagesToCompress.length) * 60;
            const passProgress = (passIndex / Math.max(1, passTotal)) * 30;
            this.updateProgress(Math.round(30 + passProgress + pageProgress), `Compressing page ${i + 1} of ${pagesToCompress.length}...`);

            const page = await this.sourcePdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: settings.renderScale });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { alpha: false });
            canvas.width = Math.max(1, Math.floor(viewport.width));
            canvas.height = Math.max(1, Math.floor(viewport.height));

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            await page.render({ canvasContext: ctx, viewport }).promise;

            const imgData = canvas.toDataURL('image/jpeg', settings.jpegQuality);

            const mmWidth = canvas.width * 0.264583;
            const mmHeight = canvas.height * 0.264583;
            const orientation = mmWidth > mmHeight ? 'landscape' : 'portrait';

            if (!pdfDoc) {
                pdfDoc = new jsPDF({
                    orientation,
                    unit: 'mm',
                    format: [mmWidth, mmHeight],
                    compress: true
                });
            } else {
                pdfDoc.addPage([mmWidth, mmHeight], orientation);
            }

            pdfDoc.addImage(imgData, 'JPEG', 0, 0, mmWidth, mmHeight, undefined, 'FAST');
        }

        this.updateProgress(95, 'Finalizing compressed PDF...');
        return pdfDoc.output('blob');
    }
};

document.addEventListener('DOMContentLoaded', () => CompressPdfApp.init());
