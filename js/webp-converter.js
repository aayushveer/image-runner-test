/**
 * WEBP-CONVERTER.JS - JPG/PNG to WebP Converter
 * Convert images to WebP format with up to 80% size reduction
 * 100% browser-based, no upload required
 */

(function() {
    'use strict';

    // State
    let files = [];
    let convertedImages = [];
    let quality = 0.85;
    let lossless = false;

    // DOM Elements
    const pageUpload = document.getElementById('page-upload');
    const pageConvert = document.getElementById('page-convert');
    const pageDownload = document.getElementById('page-download');
    const processing = document.getElementById('processing');

    const fileInput = document.getElementById('file-input');
    const fileInputMore = document.getElementById('file-input-more');
    const dropzone = document.getElementById('dropzone');
    const imageGrid = document.getElementById('image-grid');
    const imageCount = document.getElementById('image-count');
    
    const qualitySlider = document.getElementById('quality-slider');
    const qualityValue = document.getElementById('quality-value');
    const losslessCheck = document.getElementById('lossless-check');
    
    const btnConvert = document.getElementById('btn-convert');
    const btnDownloadAll = document.getElementById('btn-download-all');
    const btnConvertMore = document.getElementById('btn-convert-more');
    
    const processingText = document.getElementById('processing-text');
    const processingCount = document.getElementById('processing-count');
    const progressBar = document.getElementById('progress-bar');
    
    const convertedGrid = document.getElementById('converted-grid');
    const downloadInfo = document.getElementById('download-info');
    const originalSizeEl = document.getElementById('original-size');
    const newSizeEl = document.getElementById('new-size');
    const savingsPercentEl = document.getElementById('savings-percent');

    // Initialize
    function init() {
        setupEventListeners();
    }

    // Setup Event Listeners
    function setupEventListeners() {
        // File inputs
        fileInput.addEventListener('change', handleFileSelect);
        fileInputMore.addEventListener('change', handleFileSelect);

        // Dropzone drag & drop
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.style.opacity = '0.7';
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.style.opacity = '1';
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.style.opacity = '1';
            handleFiles(Array.from(e.dataTransfer.files));
        });

        // Quality slider
        qualitySlider.addEventListener('input', (e) => {
            quality = e.target.value / 100;
            qualityValue.textContent = e.target.value + '%';
        });

        // Lossless checkbox
        losslessCheck.addEventListener('change', (e) => {
            lossless = e.target.checked;
            qualitySlider.disabled = lossless;
            qualitySlider.style.opacity = lossless ? '0.5' : '1';
        });

        // Convert button
        btnConvert.addEventListener('click', convertFiles);

        // Download all
        btnDownloadAll.addEventListener('click', downloadAll);

        // Convert more
        btnConvertMore.addEventListener('click', () => {
            files = [];
            convertedImages = [];
            showPage('upload');
        });

        // Prevent default drag behaviors on body
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.body.addEventListener(eventName, (e) => {
                e.preventDefault();
            });
        });
    }

    // Handle file selection
    function handleFileSelect(e) {
        handleFiles(Array.from(e.target.files));
    }

    // Process selected files
    function handleFiles(newFiles) {
        // Filter image files
        const imageFiles = newFiles.filter(file => {
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'];
            return validTypes.includes(file.type) || 
                   /\.(jpg|jpeg|png|gif|bmp|tiff?)$/i.test(file.name);
        });

        if (imageFiles.length === 0) {
            alert('Please select valid image files (JPG, PNG, GIF, BMP, TIFF).');
            return;
        }

        files = files.concat(imageFiles);
        renderImageGrid();
        showPage('convert');
    }

    // Render image grid
    function renderImageGrid() {
        imageGrid.innerHTML = '';
        imageCount.textContent = files.length;

        files.forEach((file, index) => {
            const card = document.createElement('div');
            card.className = 'image-card';
            
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.alt = file.name;
            img.loading = 'lazy';
            
            card.innerHTML = `
                <div class="image-card__info">
                    <div class="image-card__name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</div>
                    <div class="image-card__meta">${formatFileSize(file.size)}</div>
                </div>
                <button class="image-card__remove" data-index="${index}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            `;
            
            card.insertBefore(img, card.firstChild);
            imageGrid.appendChild(card);
        });

        // Add remove event listeners
        imageGrid.querySelectorAll('.image-card__remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                files.splice(index, 1);
                if (files.length === 0) {
                    showPage('upload');
                } else {
                    renderImageGrid();
                }
            });
        });
    }

    // Convert files
    async function convertFiles() {
        if (files.length === 0) return;

        showProcessing(true);
        convertedImages = [];

        const total = files.length;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            processingText.textContent = `Converting ${file.name}...`;
            processingCount.textContent = `${i + 1} / ${total}`;
            progressBar.style.width = `${((i + 1) / total) * 100}%`;

            try {
                const result = await convertToWebP(file);
                convertedImages.push(result);
            } catch (error) {
                console.error('Error converting:', file.name, error);
                convertedImages.push({
                    name: file.name,
                    error: error.message || 'Conversion failed'
                });
            }
        }

        showProcessing(false);
        showResults();
    }

    // Convert single file to WebP
    function convertToWebP(file) {
        return new Promise((resolve, reject) => {
            const originalName = file.name.replace(/\.[^/.]+$/, '');
            
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                // Convert to WebP
                const webpQuality = lossless ? 1 : quality;
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        resolve({
                            name: `${originalName}.webp`,
                            blob: blob,
                            url: url,
                            originalSize: file.size,
                            newSize: blob.size
                        });
                    } else {
                        reject(new Error('Failed to create WebP blob'));
                    }
                }, 'image/webp', webpQuality);
                
                URL.revokeObjectURL(img.src);
            };
            
            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    // Show results
    function showResults() {
        const successful = convertedImages.filter(img => !img.error);
        
        // Calculate totals
        let totalOriginal = 0;
        let totalNew = 0;
        
        successful.forEach(img => {
            totalOriginal += img.originalSize;
            totalNew += img.newSize;
        });
        
        const savings = totalOriginal > 0 ? Math.round((1 - totalNew / totalOriginal) * 100) : 0;
        
        // Update info
        downloadInfo.textContent = `${successful.length} images converted to WebP`;
        originalSizeEl.textContent = formatFileSize(totalOriginal);
        newSizeEl.textContent = formatFileSize(totalNew);
        savingsPercentEl.textContent = `-${savings}%`;

        // Render converted grid
        convertedGrid.innerHTML = '';
        
        successful.forEach((img, index) => {
            const item = document.createElement('div');
            item.className = 'converted-item';
            item.innerHTML = `
                <img src="${img.url}" alt="${escapeHtml(img.name)}" loading="lazy">
                <button class="converted-item__download" data-index="${index}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                </button>
            `;
            convertedGrid.appendChild(item);
        });

        // Add download event listeners
        convertedGrid.querySelectorAll('.converted-item__download').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                downloadSingle(successful[index]);
            });
        });

        showPage('download');
    }

    // Download single image
    function downloadSingle(img) {
        const link = document.createElement('a');
        link.href = img.url;
        link.download = img.name;
        link.click();
    }

    // Download all as ZIP
    async function downloadAll() {
        const successful = convertedImages.filter(img => !img.error);
        if (successful.length === 0) return;

        btnDownloadAll.innerHTML = '<div class="spinner" style="width:20px;height:20px;margin:0;border-width:2px;"></div> Creating ZIP...';
        btnDownloadAll.disabled = true;

        try {
            const zip = new JSZip();

            successful.forEach(img => {
                zip.file(img.name, img.blob);
            });

            const content = await zip.generateAsync({ type: 'blob' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `webp-images-${Date.now()}.zip`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('Error creating ZIP:', error);
            alert('Failed to create ZIP file');
        }

        btnDownloadAll.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download All (ZIP)
        `;
        btnDownloadAll.disabled = false;
    }

    // Show/hide page
    function showPage(page) {
        pageUpload.classList.remove('active');
        pageConvert.classList.remove('active');
        pageDownload.classList.remove('active');

        if (page === 'upload') pageUpload.classList.add('active');
        if (page === 'convert') pageConvert.classList.add('active');
        if (page === 'download') pageDownload.classList.add('active');
    }

    // Show/hide processing
    function showProcessing(show) {
        if (show) {
            processing.classList.add('active');
            progressBar.style.width = '0%';
        } else {
            processing.classList.remove('active');
        }
    }

    // Utility: Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // Utility: Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// Share Functions (global scope)
function shareTwitter() {
    const url = encodeURIComponent('https://www.imgrunner.com/webp-converter.html');
    const text = encodeURIComponent('Convert images to WebP and reduce file size by 80%! 🖼️');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
}

function shareWhatsApp() {
    const url = encodeURIComponent('https://www.imgrunner.com/webp-converter.html');
    const text = encodeURIComponent('Check out this free WebP converter! Reduce image size by 80%: ');
    window.open(`https://wa.me/?text=${text}${url}`, '_blank');
}

function copyLink() {
    navigator.clipboard.writeText('https://www.imgrunner.com/webp-converter.html').then(() => {
        const btn = document.querySelector('.share-btn--copy');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
        }, 2000);
    });
}
