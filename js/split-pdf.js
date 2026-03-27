'use strict';

const SplitPdfApp = {
    sourceFile: null,
    sourcePdfLib: null,
    sourcePdfJs: null,
    sourceBytes: null,
    sourcePageCount: 0,
    sourceSize: 0,
    selectedPages: new Set(),
    splitMode: 'selected',
    outputBlob: null,
    outputName: 'split-output.pdf',
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

            modeInputs: document.querySelectorAll('input[name="split-mode"]'),
            rangeGroup: document.getElementById('range-group'),
            rangeInput: document.getElementById('range-input'),
            selectionHint: document.getElementById('selection-hint'),

            btnSplit: document.getElementById('btn-split'),
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

        this.el.modeInputs.forEach((input) => {
            input.addEventListener('change', () => {
                this.splitMode = input.value;
                this.syncModeUi();
            });
        });

        this.el.btnSplit?.addEventListener('click', () => this.splitPdf());
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

    async loadPdfJsDocument(bytes) {
        return window.pdfjsLib.getDocument({ data: bytes }).promise;
    },

    async loadPdfLibDocument(bytes) {
        // First attempt: tolerant parser settings for real-world PDFs.
        try {
            return await window.PDFLib.PDFDocument.load(bytes, {
                ignoreEncryption: false,
                throwOnInvalidObject: false,
                updateMetadata: false
            });
        } catch (firstErr) {
            // Retry with encryption ignored. This can open some files that advertise encryption flags.
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
            // Keep bytes as Uint8Array and pass independent copies to each engine.
            // This avoids detached/consumed buffer issues in some browsers.
            const rawBytes = new Uint8Array(await file.arrayBuffer());
            this.sourceBytes = rawBytes;

            let pdfJsErr = null;
            let pdfLibErr = null;

            this.updateProgress(16, 'Opening PDF preview engine...');
            try {
                this.sourcePdfJs = await this.loadPdfJsDocument(rawBytes.slice());
            } catch (err) {
                pdfJsErr = err;
                this.sourcePdfJs = null;
            }

            this.updateProgress(22, 'Opening split engine...');
            try {
                this.sourcePdfLib = await this.loadPdfLibDocument(rawBytes.slice());
            } catch (err) {
                pdfLibErr = err;
                this.sourcePdfLib = null;
            }

            // If PDF-lib failed but PDF.js opened, retry PDF-lib using normalized bytes from PDF.js.
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

            // If PDF.js failed but PDF-lib opened, build a normalized PDF and retry PDF.js.
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

            this.updateProgress(25, 'Rendering previews...');
            await this.renderPagePreviews();

            this.el.fileName.textContent = file.name;
            this.el.pagesCount.textContent = `${this.sourcePageCount} pages`;
            this.el.originalSize.textContent = this.utils.formatFileSize(this.sourceSize);
            this.el.btnSplit.disabled = false;

            this.syncModeUi();
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
                <img alt="Page ${pageNumber}" src="${canvas.toDataURL('image/jpeg', 0.72)}">
                <p class="page-card__num">Page ${pageNumber}</p>
            `;

            card.addEventListener('click', () => {
                if (this.splitMode !== 'selected') return;
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

    syncModeUi() {
        const selected = this.splitMode === 'selected';
        const ranges = this.splitMode === 'ranges';

        this.el.rangeGroup.hidden = !ranges;
        this.el.selectionHint.hidden = !selected;

        const cards = this.el.pagesGrid.querySelectorAll('.page-card');
        cards.forEach((card) => {
            card.style.cursor = selected ? 'pointer' : 'default';
            if (!selected) card.classList.add('selected');
        });

        if (!selected) {
            this.selectedPages = new Set(Array.from({ length: this.sourcePageCount }, (_, i) => i + 1));
        }

        this.syncSelectedCards();
    },

    syncSelectedCards() {
        const cards = this.el.pagesGrid.querySelectorAll('.page-card');
        cards.forEach((card) => {
            const page = Number(card.dataset.page);
            const isSelected = this.splitMode === 'selected' ? this.selectedPages.has(page) : true;
            card.classList.toggle('selected', isSelected);
        });
    },

    parseRanges(input) {
        const ranges = [];
        const parts = String(input || '').split(',').map((s) => s.trim()).filter(Boolean);

        for (const part of parts) {
            if (/^\d+$/.test(part)) {
                const page = Number(part);
                if (page < 1 || page > this.sourcePageCount) throw new Error(`Invalid page: ${part}`);
                ranges.push([page, page]);
                continue;
            }

            const match = part.match(/^(\d+)\s*-\s*(\d+)$/);
            if (!match) throw new Error(`Invalid range: ${part}`);

            const from = Number(match[1]);
            const to = Number(match[2]);
            if (from < 1 || to < 1 || from > this.sourcePageCount || to > this.sourcePageCount || from > to) {
                throw new Error(`Invalid range: ${part}`);
            }
            ranges.push([from, to]);
        }

        if (!ranges.length) throw new Error('Enter at least one range');
        return ranges;
    },

    async buildPdfFromPages(pageNumbers) {
        const out = await window.PDFLib.PDFDocument.create();
        const indices = pageNumbers.map((p) => p - 1);
        const copied = await out.copyPages(this.sourcePdfLib, indices);
        copied.forEach((p) => out.addPage(p));
        const bytes = await out.save({ useObjectStreams: true, addDefaultPage: false });
        return new Blob([bytes], { type: 'application/pdf' });
    },

    async splitPdf() {
        if (!this.sourcePdfLib) return;

        this.showProcessing(true);

        try {
            if (this.splitMode === 'selected') {
                const selected = Array.from(this.selectedPages).sort((a, b) => a - b);
                if (!selected.length) {
                    alert('Select at least one page.');
                    return;
                }
                this.updateProgress(40, 'Extracting selected pages...');
                this.outputBlob = await this.buildPdfFromPages(selected);
                this.outputName = `${this.sourceFile.name.replace(/\.pdf$/i, '')}-selected-pages.pdf`;
                this.showDownload(`Extracted ${selected.length} page(s) from PDF`);
                return;
            }

            if (this.splitMode === 'ranges') {
                const ranges = this.parseRanges(this.el.rangeInput?.value);
                this.updateProgress(35, 'Splitting by ranges...');

                if (ranges.length === 1) {
                    const [from, to] = ranges[0];
                    const pages = Array.from({ length: to - from + 1 }, (_, i) => from + i);
                    this.outputBlob = await this.buildPdfFromPages(pages);
                    this.outputName = `${this.sourceFile.name.replace(/\.pdf$/i, '')}-${from}-${to}.pdf`;
                    this.showDownload(`Created 1 split file (${from}-${to})`);
                    return;
                }

                const zip = new JSZip();
                for (let i = 0; i < ranges.length; i += 1) {
                    const [from, to] = ranges[i];
                    const pages = Array.from({ length: to - from + 1 }, (_, idx) => from + idx);
                    this.updateProgress(35 + Math.round(((i + 1) / ranges.length) * 50), `Building range ${from}-${to}...`);
                    const blob = await this.buildPdfFromPages(pages);
                    zip.file(`${this.sourceFile.name.replace(/\.pdf$/i, '')}-${from}-${to}.pdf`, blob);
                }

                this.updateProgress(92, 'Preparing ZIP...');
                this.outputBlob = await zip.generateAsync({ type: 'blob' });
                this.outputName = `${this.sourceFile.name.replace(/\.pdf$/i, '')}-split-ranges.zip`;
                this.showDownload(`Created ${ranges.length} files in ZIP`);
                return;
            }

            const zip = new JSZip();
            for (let p = 1; p <= this.sourcePageCount; p += 1) {
                this.updateProgress(20 + Math.round((p / this.sourcePageCount) * 70), `Extracting page ${p} of ${this.sourcePageCount}...`);
                const blob = await this.buildPdfFromPages([p]);
                zip.file(`${this.sourceFile.name.replace(/\.pdf$/i, '')}-page-${String(p).padStart(2, '0')}.pdf`, blob);
            }

            this.updateProgress(95, 'Preparing ZIP...');
            this.outputBlob = await zip.generateAsync({ type: 'blob' });
            this.outputName = `${this.sourceFile.name.replace(/\.pdf$/i, '')}-pages.zip`;
            this.showDownload(`Created ${this.sourcePageCount} separate PDF pages`);
        } catch (err) {
            console.error(err);
            alert(err.message || 'Unable to split PDF. Please check input and try again.');
        } finally {
            this.showProcessing(false);
        }
    },

    showDownload(infoText) {
        this.el.downloadInfo.textContent = infoText;
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
        this.splitMode = 'selected';
        this.outputBlob = null;
        this.outputName = 'split-output.pdf';

        this.el.pagesGrid.innerHTML = '';
        this.el.btnSplit.disabled = true;
        this.el.modeInputs.forEach((input) => { input.checked = input.value === 'selected'; });
        if (this.el.rangeInput) this.el.rangeInput.value = '';
        this.syncModeUi();
        this.showPage('upload');
    },

    showProcessing(show) {
        this.el.processing?.classList.toggle('active', show);
        if (this.el.btnSplit) this.el.btnSplit.disabled = show || !this.sourcePdfLib;
        if (!show && this.el.progressBar) this.el.progressBar.style.width = '0%';
    },

    updateProgress(percent, text) {
        if (this.el.processingText) this.el.processingText.textContent = text;
        if (this.el.progressBar) this.el.progressBar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
    }
};

document.addEventListener('DOMContentLoaded', () => SplitPdfApp.init());
