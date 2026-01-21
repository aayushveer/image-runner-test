/**
 * BASE64-CONVERTER.JS - Image to Base64 Converter
 * Production-level client-side image to Base64 encoding
 * Supports: JPEG, PNG, GIF, WEBP, SVG, BMP
 */

(function() {
    'use strict';

    // State
    const state = {
        images: [],
        maxFiles: 20
    };

    // DOM Elements
    const elements = {
        pageUpload: document.getElementById('page-upload'),
        pageResults: document.getElementById('page-results'),
        infoSection: document.getElementById('info-section'),
        
        dropzone: document.getElementById('dropzone'),
        fileInput: document.getElementById('file-input'),
        fileInputMore: document.getElementById('file-input-more'),
        
        imageCount: document.getElementById('image-count'),
        resultsList: document.getElementById('results-list'),
        
        btnNew: document.getElementById('btn-new'),
        
        toast: document.getElementById('toast'),
        toastText: document.getElementById('toast-text')
    };

    // Initialize
    function init() {
        setupEventListeners();
        setupDragAndDrop();
        setupExampleCopy();
    }

    // Event Listeners
    function setupEventListeners() {
        // File inputs
        elements.fileInput.addEventListener('change', handleFileSelect);
        elements.fileInputMore.addEventListener('change', handleFileSelect);
        
        // Start over button
        elements.btnNew.addEventListener('click', resetToUpload);
    }

    // Drag & Drop
    function setupDragAndDrop() {
        const dropzone = elements.dropzone;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => dropzone.classList.add('dragover'), false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => dropzone.classList.remove('dragover'), false);
        });
        
        dropzone.addEventListener('drop', handleDrop, false);
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDrop(e) {
        const files = e.dataTransfer.files;
        if (files.length) {
            processFiles(Array.from(files));
        }
    }

    // File handling
    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length) {
            processFiles(files);
        }
        e.target.value = '';
    }

    function processFiles(files) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            showToast('Please select valid image files.', 'error');
            return;
        }
        
        // Check max files limit
        const remainingSlots = state.maxFiles - state.images.length;
        if (remainingSlots <= 0) {
            showToast('Maximum 20 files allowed.', 'error');
            return;
        }
        
        const filesToProcess = imageFiles.slice(0, remainingSlots);
        
        filesToProcess.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64String = e.target.result;
                const mimeType = file.type || getMimeFromExtension(file.name);
                
                // Create image to get dimensions
                const img = new Image();
                img.onload = () => {
                    const imageData = {
                        id: Date.now() + Math.random(),
                        name: file.name,
                        mimeType: mimeType,
                        originalSize: file.size,
                        base64Size: base64String.length,
                        base64: base64String,
                        width: img.width,
                        height: img.height,
                        success: true
                    };
                    
                    state.images.push(imageData);
                    renderResults();
                    showPage('results');
                };
                img.onerror = () => {
                    state.images.push({
                        id: Date.now() + Math.random(),
                        name: file.name,
                        success: false,
                        error: 'Failed to load image'
                    });
                    renderResults();
                    showPage('results');
                };
                img.src = base64String;
            };
            reader.onerror = () => {
                state.images.push({
                    id: Date.now() + Math.random(),
                    name: file.name,
                    success: false,
                    error: 'Failed to read file'
                });
                renderResults();
                showPage('results');
            };
            reader.readAsDataURL(file);
        });
    }

    // Get MIME type from extension
    function getMimeFromExtension(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const mimeTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'svg': 'image/svg+xml',
            'bmp': 'image/bmp',
            'ico': 'image/x-icon'
        };
        return mimeTypes[ext] || 'image/png';
    }

    // Render results
    function renderResults() {
        const successCount = state.images.filter(img => img.success).length;
        elements.imageCount.textContent = successCount;
        
        elements.resultsList.innerHTML = state.images.map((img, index) => {
            if (img.success) {
                return `
                    <div class="result-card success" data-index="${index}">
                        <div class="result-preview">
                            <img src="${img.base64}" alt="${img.name}">
                        </div>
                        <div class="result-info">
                            <div class="result-name">${escapeHtml(img.name)}</div>
                            <div class="result-meta">${img.width} × ${img.height} pixels</div>
                            <div class="result-size">
                                <span class="size-original">${formatSize(img.originalSize)}</span>
                                <span class="size-arrow">→</span>
                                <span class="size-base64">${formatSize(img.base64Size)} (Base64)</span>
                            </div>
                        </div>
                        <div class="result-actions">
                            <button class="copy-btn copy-btn--html" onclick="copyHTML(${index})">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                                Copy HTML
                            </button>
                            <button class="copy-btn copy-btn--css" onclick="copyCSS(${index})">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                                Copy CSS
                            </button>
                            <button class="copy-btn copy-btn--base64" onclick="copyBase64(${index})">
                                Copy Raw Base64
                            </button>
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="result-card error" data-index="${index}">
                        <div class="result-preview">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:32px;height:32px;color:#ef4444;">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="15" y1="9" x2="9" y2="15"/>
                                <line x1="9" y1="9" x2="15" y2="15"/>
                            </svg>
                        </div>
                        <div class="result-info">
                            <div class="result-name">${escapeHtml(img.name)}</div>
                            <div class="result-meta" style="color:#ef4444;">${img.error}</div>
                        </div>
                    </div>
                `;
            }
        }).join('');
    }

    // Copy functions (global for onclick)
    window.copyHTML = function(index) {
        const img = state.images[index];
        if (!img || !img.success) return;
        
        const html = `<img src="${img.base64}" width="${img.width}" height="${img.height}" alt="${escapeHtml(img.name.replace(/\.[^/.]+$/, ''))}">`;
        copyToClipboard(html, index, 'html');
    };

    window.copyCSS = function(index) {
        const img = state.images[index];
        if (!img || !img.success) return;
        
        const css = `.image-${index + 1} {\n    background-image: url('${img.base64}');\n    background-size: cover;\n    background-position: center;\n}`;
        copyToClipboard(css, index, 'css');
    };

    window.copyBase64 = function(index) {
        const img = state.images[index];
        if (!img || !img.success) return;
        
        // Copy just the base64 string without data URI prefix
        const base64Only = img.base64.split(',')[1];
        copyToClipboard(base64Only, index, 'base64');
    };

    function copyToClipboard(text, index, type) {
        navigator.clipboard.writeText(text).then(() => {
            // Show feedback on button
            const card = document.querySelector(`.result-card[data-index="${index}"]`);
            const btn = card.querySelector(`.copy-btn--${type}`);
            if (btn) {
                btn.classList.add('copied');
                const originalText = btn.innerHTML;
                btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Copied!`;
                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.innerHTML = originalText;
                }, 2000);
            }
            
            // Show toast
            const messages = {
                html: 'HTML code copied!',
                css: 'CSS code copied!',
                base64: 'Base64 string copied!'
            };
            showToast(messages[type] || 'Copied!');
        }).catch(() => {
            showToast('Failed to copy. Try again.', 'error');
        });
    }

    // Example copy buttons
    function setupExampleCopy() {
        document.querySelectorAll('.copy-example').forEach(btn => {
            btn.addEventListener('click', () => {
                const codeBlock = btn.closest('.code-example').querySelector('code');
                const code = codeBlock.textContent;
                navigator.clipboard.writeText(code).then(() => {
                    const originalText = btn.textContent;
                    btn.textContent = 'Copied!';
                    setTimeout(() => {
                        btn.textContent = originalText;
                    }, 2000);
                });
            });
        });
    }

    // Page navigation
    function showPage(page) {
        elements.pageUpload.classList.remove('active');
        elements.pageResults.classList.remove('active');
        
        if (page === 'upload') {
            elements.pageUpload.classList.add('active');
            elements.infoSection.style.display = 'block';
        } else if (page === 'results') {
            elements.pageResults.classList.add('active');
            elements.infoSection.style.display = 'block';
        }
    }

    // Reset
    function resetToUpload() {
        state.images = [];
        elements.resultsList.innerHTML = '';
        showPage('upload');
    }

    // Toast notification
    function showToast(message, type = 'success') {
        elements.toastText.textContent = message;
        elements.toast.classList.add('show');
        
        if (type === 'error') {
            elements.toast.querySelector('svg').style.color = '#ef4444';
        } else {
            elements.toast.querySelector('svg').style.color = '#22c55e';
        }
        
        setTimeout(() => {
            elements.toast.classList.remove('show');
        }, 3000);
    }

    // Utility functions
    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
