/**
 * MERGE-PDF.JS - Merge multiple PDF files into one
 */

'use strict';

const MergePdfApp = {
    files: [],
    mergedBlob: null,
    utils: null,
    maxFiles: 40,
    maxFileSize: 40 * 1024 * 1024,
    el: {},
    dragSrcEl: null,

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

            fileList: document.getElementById('file-list'),
            fileCount: document.getElementById('file-count'),
            fileCountBadge: document.getElementById('file-count-badge'),
            totalPages: document.getElementById('total-pages'),

            keepBookmarks: document.getElementById('keep-bookmarks'),
            btnMerge: document.getElementById('btn-merge'),

            downloadInfo: document.getElementById('download-info'),
            pdfName: document.getElementById('pdf-name'),
            pdfSize: document.getElementById('pdf-size'),
            btnDownload: document.getElementById('btn-download'),
            btnMore: document.getElementById('btn-more'),

            processing: document.getElementById('processing'),
            processingText: document.getElementById('processing-text'),
            progressBar: document.getElementById('progress-bar')
        };
    },

    bindEvents() {
        this.el.fileInput?.addEventListener('change', (e) => this.handleFiles(e.target.files));
        this.el.fileInputMore?.addEventListener('change', (e) => this.handleFiles(e.target.files));

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
            if (e.dataTransfer?.files?.length) {
                this.handleFiles(e.dataTransfer.files);
            }
        });

        this.el.btnMerge?.addEventListener('click', () => this.mergeFiles());
        this.el.btnDownload?.addEventListener('click', () => this.downloadMergedPdf());
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

    async handleFiles(fileList) {
        if (!fileList?.length) return;

        const incoming = Array.from(fileList);
        const remaining = this.maxFiles - this.files.length;

        if (remaining <= 0) {
            alert(`Maximum ${this.maxFiles} PDF files allowed.`);
            return;
        }

        for (const file of incoming.slice(0, remaining)) {
            if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                continue;
            }
            if (file.size > this.maxFileSize) {
                continue;
            }

            try {
                const arrayBuffer = await file.arrayBuffer();
                const pageCount = await this.readPageCount(arrayBuffer);

                this.files.push({
                    file,
                    name: file.name,
                    size: file.size,
                    pageCount,
                    bytes: arrayBuffer
                });
            } catch (err) {
                console.error('Failed to read PDF:', file.name, err);
            }
        }

        if (this.el.fileInput) this.el.fileInput.value = '';
        if (this.el.fileInputMore) this.el.fileInputMore.value = '';

        if (this.files.length > 0) {
            this.renderFiles();
            this.el.btnMerge.disabled = false;
            this.showPage('editor');
        }
    },

    async readPageCount(arrayBuffer) {
        if (!window.PDFLib) {
            throw new Error('PDF library not loaded');
        }
        const doc = await window.PDFLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
        return doc.getPageCount();
    },

    renderFiles() {
        this.el.fileList.innerHTML = '';

        this.files.forEach((entry, idx) => {
            const card = document.createElement('div');
            card.className = 'pdf-card';
            card.dataset.idx = idx;
            card.draggable = true;

            card.innerHTML = `
                <div class="pdf-card__left">
                    <span class="pdf-card__order">${idx + 1}</span>
                    <div class="pdf-card__meta">
                        <p class="pdf-card__name" title="${entry.name}">${entry.name}</p>
                        <p class="pdf-card__info">${entry.pageCount} page${entry.pageCount === 1 ? '' : 's'} • ${this.utils.formatFileSize(entry.size)}</p>
                    </div>
                </div>
                <button class="pdf-card__remove" type="button" aria-label="Remove file">×</button>
            `;

            card.querySelector('.pdf-card__remove')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFile(idx);
            });

            card.addEventListener('dragstart', (e) => this.handleDragStart(e, card));
            card.addEventListener('dragend', () => this.handleDragEnd(card));
            card.addEventListener('dragover', (e) => this.handleDragOver(e));
            card.addEventListener('drop', (e) => this.handleDrop(e, card));

            this.el.fileList.appendChild(card);
        });

        const totalPages = this.files.reduce((sum, item) => sum + item.pageCount, 0);
        this.el.fileCount.textContent = String(this.files.length);
        if (this.el.fileCountBadge) this.el.fileCountBadge.textContent = String(this.files.length);
        this.el.totalPages.textContent = String(totalPages);
    },

    handleDragStart(e, card) {
        this.dragSrcEl = card;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', card.dataset.idx);
    },

    handleDragEnd(card) {
        card.classList.remove('dragging');
        this.dragSrcEl = null;
    },

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    },

    handleDrop(e, card) {
        e.preventDefault();
        if (!this.dragSrcEl || this.dragSrcEl === card) return;

        const srcIdx = Number(this.dragSrcEl.dataset.idx);
        const destIdx = Number(card.dataset.idx);
        if (Number.isNaN(srcIdx) || Number.isNaN(destIdx) || srcIdx === destIdx) return;

        const [item] = this.files.splice(srcIdx, 1);
        this.files.splice(destIdx, 0, item);
        this.dragSrcEl = null;
        this.renderFiles();
    },

    removeFile(idx) {
        this.files.splice(idx, 1);
        if (this.files.length === 0) {
            this.el.btnMerge.disabled = true;
            this.showPage('upload');
        } else {
            this.renderFiles();
        }
    },

    async mergeFiles() {
        if (!this.files.length) return;
        if (!window.PDFLib) {
            alert('PDF library not loaded. Refresh and try again.');
            return;
        }

        this.showProcessing(true);

        try {
            const { PDFDocument } = window.PDFLib;
            const outputDoc = await PDFDocument.create();
            const keepBookmarks = this.el.keepBookmarks?.checked;

            for (let i = 0; i < this.files.length; i += 1) {
                const current = this.files[i];
                this.updateProgress(i, this.files.length, `Merging ${i + 1} of ${this.files.length}: ${current.name}`);

                const srcDoc = await PDFDocument.load(current.bytes, {
                    ignoreEncryption: false,
                    updateMetadata: false
                });

                const pageIndices = srcDoc.getPageIndices();
                const copiedPages = await outputDoc.copyPages(srcDoc, pageIndices);
                copiedPages.forEach((page) => outputDoc.addPage(page));

                if (keepBookmarks) {
                    // Placeholder for future bookmark strategy. Kept as explicit toggle for UX clarity.
                }
            }

            this.updateProgress(this.files.length, this.files.length, 'Finalizing merged PDF...');
            const outputBytes = await outputDoc.save({
                useObjectStreams: true,
                addDefaultPage: false
            });

            this.mergedBlob = new Blob([outputBytes], { type: 'application/pdf' });
            this.showDownload();
        } catch (err) {
            console.error('Merge failed:', err);
            alert('Unable to merge one or more files. Encrypted or corrupted PDF may not be supported.');
        } finally {
            this.showProcessing(false);
        }
    },

    showDownload() {
        const totalPages = this.files.reduce((sum, item) => sum + item.pageCount, 0);
        this.el.downloadInfo.textContent = `${this.files.length} PDF files merged • ${totalPages} total pages`;

        const dateStamp = new Date().toISOString().slice(0, 10);
        const fileName = `merged-pdf-${dateStamp}.pdf`;

        this.el.pdfName.textContent = fileName;
        this.el.pdfSize.textContent = this.utils.formatFileSize(this.mergedBlob?.size || 0);
        this.showPage('download');
    },

    downloadMergedPdf() {
        if (!this.mergedBlob) return;
        const dateStamp = new Date().toISOString().slice(0, 10);
        this.utils.downloadBlob(this.mergedBlob, `merged-pdf-${dateStamp}.pdf`);
    },

    reset() {
        this.files = [];
        this.mergedBlob = null;
        this.el.btnMerge.disabled = true;
        if (this.el.fileList) this.el.fileList.innerHTML = '';
        if (this.el.fileCount) this.el.fileCount.textContent = '0';
        if (this.el.fileCountBadge) this.el.fileCountBadge.textContent = '0';
        if (this.el.totalPages) this.el.totalPages.textContent = '0';
        this.showPage('upload');
    },

    showProcessing(show) {
        this.el.processing?.classList.toggle('active', show);
        if (this.el.btnMerge) this.el.btnMerge.disabled = show || this.files.length === 0;
        if (!show && this.el.progressBar) this.el.progressBar.style.width = '0%';
    },

    updateProgress(current, total, text) {
        const pct = Math.round((current / total) * 100);
        if (this.el.processingText) this.el.processingText.textContent = text;
        if (this.el.progressBar) this.el.progressBar.style.width = `${pct}%`;
    }
};

document.addEventListener('DOMContentLoaded', () => MergePdfApp.init());
