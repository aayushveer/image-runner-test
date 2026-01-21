/**
 * FAVICON-GENERATOR.JS - Favicon Generator Tool
 * High-quality multi-platform favicon/app icon generation
 * NO QUALITY LOSS - Uses high-quality canvas rendering
 */

(function() {
    'use strict';

    // =====================================================
    // ICON CONFIGURATIONS - All platforms and sizes
    // =====================================================
    
    const ICON_CONFIGS = {
        web: {
            name: 'Web (Browsers)',
            emoji: '🌐',
            sizes: [
                { size: 16, format: 'ico', name: 'favicon-16x16' },
                { size: 32, format: 'ico', name: 'favicon-32x32' },
                { size: 48, format: 'ico', name: 'favicon-48x48' },
                { size: 64, format: 'ico', name: 'favicon-64x64' },
                { size: 16, format: 'png', name: 'favicon-16x16' },
                { size: 32, format: 'png', name: 'favicon-32x32' },
                { size: 48, format: 'png', name: 'favicon-48x48' },
                { size: 96, format: 'png', name: 'favicon-96x96' },
                { size: 128, format: 'png', name: 'favicon-128x128' },
                { size: 192, format: 'png', name: 'favicon-192x192' },
                { size: 256, format: 'png', name: 'favicon-256x256' }
            ]
        },
        apple: {
            name: 'Apple iOS',
            emoji: '🍎',
            sizes: [
                { size: 57, format: 'png', name: 'apple-touch-icon-57x57' },
                { size: 60, format: 'png', name: 'apple-touch-icon-60x60' },
                { size: 72, format: 'png', name: 'apple-touch-icon-72x72' },
                { size: 76, format: 'png', name: 'apple-touch-icon-76x76' },
                { size: 114, format: 'png', name: 'apple-touch-icon-114x114' },
                { size: 120, format: 'png', name: 'apple-touch-icon-120x120' },
                { size: 144, format: 'png', name: 'apple-touch-icon-144x144' },
                { size: 152, format: 'png', name: 'apple-touch-icon-152x152' },
                { size: 167, format: 'png', name: 'apple-touch-icon-167x167' },
                { size: 180, format: 'png', name: 'apple-touch-icon-180x180' },
                { size: 1024, format: 'png', name: 'apple-touch-icon-1024x1024' }
            ]
        },
        android: {
            name: 'Android',
            emoji: '🤖',
            sizes: [
                { size: 36, format: 'png', name: 'android-icon-36x36' },
                { size: 48, format: 'png', name: 'android-icon-48x48' },
                { size: 72, format: 'png', name: 'android-icon-72x72' },
                { size: 96, format: 'png', name: 'android-icon-96x96' },
                { size: 144, format: 'png', name: 'android-icon-144x144' },
                { size: 192, format: 'png', name: 'android-icon-192x192' },
                { size: 384, format: 'png', name: 'android-icon-384x384' },
                { size: 512, format: 'png', name: 'android-icon-512x512' }
            ]
        },
        windows: {
            name: 'Windows',
            emoji: '🪟',
            sizes: [
                { size: 70, format: 'png', name: 'ms-icon-70x70' },
                { size: 144, format: 'png', name: 'ms-icon-144x144' },
                { size: 150, format: 'png', name: 'ms-icon-150x150' },
                { size: 310, format: 'png', name: 'ms-icon-310x310' }
            ]
        }
    };

    const BASIC_SIZES = {
        web: [{ size: 16, format: 'ico', name: 'favicon' }, { size: 32, format: 'ico', name: 'favicon-32x32' }],
        apple: [{ size: 180, format: 'png', name: 'apple-touch-icon' }],
        android: [{ size: 192, format: 'png', name: 'android-icon-192x192' }],
        windows: [{ size: 144, format: 'png', name: 'ms-icon-144x144' }]
    };

    // =====================================================
    // STATE
    // =====================================================
    
    let sourceImage = null;
    let sourceImageInfo = { width: 0, height: 0, type: '' };
    let generatedIcons = [];

    // =====================================================
    // DOM ELEMENTS
    // =====================================================
    
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const fileInput = $('#file-input');
    const dropzone = $('.dropzone');
    const pages = {
        upload: $('#page-upload'),
        options: $('#page-options'),
        results: $('#page-results')
    };
    const previewImg = $('#preview-img');
    const imageSize = $('#image-size');
    const imageType = $('#image-type');
    const platformChecks = $$('.platform-checkbox');
    const quickOptions = $$('input[name="quick-option"]');
    const advancedOptions = {
        maintainRatio: $('#opt-ratio'),
        transparency: $('#opt-transparency'),
        htmlCode: $('#opt-html')
    };
    const generateBtn = $('#generate-btn');
    const processing = $('#processing');
    const progressBar = $('.progress__bar');
    const progressCount = $('.processing__count');
    const iconsGrid = $('#icons-grid');
    const htmlCodeOutput = $('#html-code-output');
    const downloadAllBtn = $('#download-all-btn');
    const copyCodeBtn = $('#copy-code-btn');
    const newBtn = $('#new-btn');
    const changeImageBtn = $('#change-image-btn');
    const toast = $('#toast');

    // =====================================================
    // INITIALIZATION
    // =====================================================
    
    function init() {
        setupEventListeners();
        showPage('upload');
    }

    function setupEventListeners() {
        // File input
        fileInput.addEventListener('change', handleFileSelect);
        
        // Dropzone
        dropzone.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('dragover', handleDragOver);
        dropzone.addEventListener('dragleave', handleDragLeave);
        dropzone.addEventListener('drop', handleDrop);
        
        // Platform checkboxes
        platformChecks.forEach(pc => {
            pc.addEventListener('click', () => {
                pc.classList.toggle('checked');
                pc.querySelector('input').checked = !pc.querySelector('input').checked;
            });
        });
        
        // Generate button
        generateBtn.addEventListener('click', generateIcons);
        
        // Download all
        downloadAllBtn.addEventListener('click', downloadAll);
        
        // Copy HTML code
        copyCodeBtn.addEventListener('click', copyHtmlCode);
        
        // New generation
        newBtn.addEventListener('click', () => showPage('upload'));
        
        // Change image
        if (changeImageBtn) {
            changeImageBtn.addEventListener('click', () => fileInput.click());
        }
    }

    // =====================================================
    // FILE HANDLING
    // =====================================================
    
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) processFile(file);
    }

    function handleDragOver(e) {
        e.preventDefault();
        dropzone.classList.add('dragover');
    }

    function handleDragLeave() {
        dropzone.classList.remove('dragover');
    }

    function handleDrop(e) {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            processFile(file);
        }
    }

    function processFile(file) {
        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            showToast('Please upload a valid image file (PNG, JPG, GIF, WebP, SVG)', 'error');
            return;
        }
        
        // Check file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            showToast('Image file is too large. Maximum size is 50MB.', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                sourceImage = img;
                sourceImageInfo = {
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    type: file.type.split('/')[1].toUpperCase()
                };
                
                // Show preview
                previewImg.src = e.target.result;
                imageSize.textContent = `${img.naturalWidth} × ${img.naturalHeight}px`;
                imageType.textContent = file.type.split('/')[1].toUpperCase();
                
                showPage('options');
            };
            img.onerror = () => {
                showToast('Failed to load image. Please try another file.', 'error');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // =====================================================
    // PAGE NAVIGATION
    // =====================================================
    
    function showPage(pageName) {
        Object.values(pages).forEach(p => p.classList.remove('active'));
        pages[pageName].classList.add('active');
        
        // Reset state if going back to upload
        if (pageName === 'upload') {
            sourceImage = null;
            generatedIcons = [];
            fileInput.value = '';
        }
    }

    // =====================================================
    // ICON GENERATION - HIGH QUALITY
    // =====================================================
    
    async function generateIcons() {
        // Get selected platforms
        const selectedPlatforms = [];
        platformChecks.forEach(pc => {
            if (pc.classList.contains('checked')) {
                selectedPlatforms.push(pc.dataset.platform);
            }
        });
        
        if (selectedPlatforms.length === 0) {
            showToast('Please select at least one platform', 'error');
            return;
        }
        
        // Get options
        const useAllSizes = $('input[name="quick-option"]:checked').value === 'all';
        const maintainRatio = advancedOptions.maintainRatio.checked;
        const preserveTransparency = advancedOptions.transparency.checked;
        const generateHtml = advancedOptions.htmlCode.checked;
        
        // Build icons list
        const iconsToGenerate = [];
        selectedPlatforms.forEach(platform => {
            const sizes = useAllSizes ? ICON_CONFIGS[platform].sizes : BASIC_SIZES[platform];
            sizes.forEach(size => {
                iconsToGenerate.push({
                    ...size,
                    platform: platform
                });
            });
        });
        
        // Show processing
        processing.classList.add('active');
        progressBar.style.width = '0%';
        progressCount.textContent = `0 / ${iconsToGenerate.length}`;
        
        generatedIcons = [];
        
        try {
            for (let i = 0; i < iconsToGenerate.length; i++) {
                const iconConfig = iconsToGenerate[i];
                
                // Generate icon
                const iconData = await generateSingleIcon(
                    iconConfig.size, 
                    iconConfig.format, 
                    maintainRatio, 
                    preserveTransparency
                );
                
                generatedIcons.push({
                    ...iconConfig,
                    data: iconData
                });
                
                // Update progress
                const progress = ((i + 1) / iconsToGenerate.length) * 100;
                progressBar.style.width = `${progress}%`;
                progressCount.textContent = `${i + 1} / ${iconsToGenerate.length}`;
                
                // Small delay for UI update
                await new Promise(r => setTimeout(r, 10));
            }
            
            // Hide processing
            processing.classList.remove('active');
            
            // Display results
            displayResults(selectedPlatforms, generateHtml);
            showPage('results');
            
            showToast(`✨ Generated ${generatedIcons.length} icons successfully!`);
            
        } catch (error) {
            console.error('Generation error:', error);
            processing.classList.remove('active');
            showToast('Failed to generate icons. Please try again.', 'error');
        }
    }

    async function generateSingleIcon(size, format, maintainRatio, preserveTransparency) {
        return new Promise((resolve, reject) => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = size;
                canvas.height = size;
                
                // HIGH QUALITY SETTINGS
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                // Clear canvas (for transparency)
                if (preserveTransparency) {
                    ctx.clearRect(0, 0, size, size);
                } else {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, size, size);
                }
                
                let sx = 0, sy = 0, sw = sourceImage.naturalWidth, sh = sourceImage.naturalHeight;
                let dx = 0, dy = 0, dw = size, dh = size;
                
                if (maintainRatio) {
                    const ratio = Math.min(sw / sh, sh / sw);
                    const imgRatio = sw / sh;
                    
                    if (imgRatio > 1) {
                        // Landscape
                        dh = size / imgRatio;
                        dy = (size - dh) / 2;
                    } else if (imgRatio < 1) {
                        // Portrait
                        dw = size * imgRatio;
                        dx = (size - dw) / 2;
                    }
                }
                
                // Draw with high quality
                ctx.drawImage(sourceImage, sx, sy, sw, sh, dx, dy, dw, dh);
                
                if (format === 'ico') {
                    // Generate ICO format (embedded PNG in ICO container)
                    canvas.toBlob((blob) => {
                        blob.arrayBuffer().then(buffer => {
                            const icoData = createICO([{ size, buffer: new Uint8Array(buffer) }]);
                            resolve(icoData);
                        });
                    }, 'image/png', 1.0);
                } else {
                    // Generate PNG - MAX QUALITY (1.0)
                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, 'image/png', 1.0);
                }
                
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Create ICO file from PNG data
     * ICO format: https://en.wikipedia.org/wiki/ICO_(file_format)
     */
    function createICO(images) {
        // ICO Header: 6 bytes
        // ICONDIR entries: 16 bytes each
        // Image data follows
        
        const numImages = images.length;
        const headerSize = 6;
        const entrySize = 16;
        const dataOffset = headerSize + (entrySize * numImages);
        
        // Calculate total size
        let totalDataSize = 0;
        images.forEach(img => totalDataSize += img.buffer.length);
        
        const totalSize = dataOffset + totalDataSize;
        const buffer = new ArrayBuffer(totalSize);
        const view = new DataView(buffer);
        const bytes = new Uint8Array(buffer);
        
        // ICO Header
        view.setUint16(0, 0, true);      // Reserved, must be 0
        view.setUint16(2, 1, true);      // Image type: 1 = ICO
        view.setUint16(4, numImages, true); // Number of images
        
        // Write ICONDIR entries and image data
        let currentOffset = dataOffset;
        
        images.forEach((img, index) => {
            const entryOffset = headerSize + (index * entrySize);
            const size = img.size;
            
            // ICONDIR entry
            view.setUint8(entryOffset + 0, size < 256 ? size : 0);    // Width (0 = 256)
            view.setUint8(entryOffset + 1, size < 256 ? size : 0);    // Height (0 = 256)
            view.setUint8(entryOffset + 2, 0);                         // Color palette (0 = no palette)
            view.setUint8(entryOffset + 3, 0);                         // Reserved
            view.setUint16(entryOffset + 4, 1, true);                  // Color planes
            view.setUint16(entryOffset + 6, 32, true);                 // Bits per pixel
            view.setUint32(entryOffset + 8, img.buffer.length, true);  // Image data size
            view.setUint32(entryOffset + 12, currentOffset, true);     // Offset to image data
            
            // Copy image data
            bytes.set(img.buffer, currentOffset);
            currentOffset += img.buffer.length;
        });
        
        return new Blob([buffer], { type: 'image/x-icon' });
    }

    /**
     * Create multi-size ICO file
     */
    async function createMultiSizeICO(sizes = [16, 32, 48]) {
        const images = [];
        
        for (const size of sizes) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = size;
            canvas.height = size;
            
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            ctx.drawImage(sourceImage, 0, 0, size, size);
            
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/png', 1.0);
            });
            
            const buffer = await blob.arrayBuffer();
            images.push({ size, buffer: new Uint8Array(buffer) });
        }
        
        return createICO(images);
    }

    // =====================================================
    // DISPLAY RESULTS
    // =====================================================
    
    function displayResults(selectedPlatforms, generateHtml) {
        // Group icons by platform
        const groupedIcons = {};
        generatedIcons.forEach(icon => {
            if (!groupedIcons[icon.platform]) {
                groupedIcons[icon.platform] = [];
            }
            groupedIcons[icon.platform].push(icon);
        });
        
        // Build icons grid HTML
        let gridHtml = '';
        
        selectedPlatforms.forEach(platform => {
            const config = ICON_CONFIGS[platform];
            const icons = groupedIcons[platform] || [];
            
            gridHtml += `
                <div class="icon-section" data-platform="${platform}">
                    <div class="icon-section__header">
                        <h3 class="icon-section__title">
                            <span>${config.emoji}</span>
                            ${config.name}
                        </h3>
                        <span class="icon-section__count">${icons.length} icons</span>
                    </div>
                    <div class="icon-section__grid">
                        ${icons.map((icon, idx) => {
                            const url = URL.createObjectURL(icon.data);
                            return `
                                <div class="icon-item" data-platform="${platform}" data-index="${idx}">
                                    <div class="icon-preview">
                                        <img src="${url}" alt="${icon.size}x${icon.size}">
                                    </div>
                                    <span class="icon-size">${icon.size}×${icon.size}</span>
                                    <span class="icon-format">${icon.format.toUpperCase()}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        });
        
        iconsGrid.innerHTML = gridHtml;
        
        // Add click handlers for individual downloads
        $$('.icon-item').forEach(item => {
            item.addEventListener('click', () => {
                const platform = item.dataset.platform;
                const index = parseInt(item.dataset.index);
                const icons = groupedIcons[platform];
                const icon = icons[index];
                
                downloadSingleIcon(icon);
            });
        });
        
        // Generate HTML code
        if (generateHtml) {
            const htmlCode = generateHtmlCode(selectedPlatforms);
            htmlCodeOutput.textContent = htmlCode;
            $('.html-code-section').style.display = 'block';
        } else {
            $('.html-code-section').style.display = 'none';
        }
        
        // Update results header
        const totalIcons = generatedIcons.length;
        $('#results-count').textContent = totalIcons;
    }

    function generateHtmlCode(selectedPlatforms) {
        let code = `<!-- Favicon and App Icons - Generated by Image Runner -->\n`;
        
        if (selectedPlatforms.includes('web')) {
            code += `\n<!-- Standard Favicon -->\n`;
            code += `<link rel="icon" type="image/x-icon" href="/favicon.ico">\n`;
            code += `<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">\n`;
            code += `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n`;
            code += `<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">\n`;
            code += `<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png">\n`;
        }
        
        if (selectedPlatforms.includes('apple')) {
            code += `\n<!-- Apple Touch Icons -->\n`;
            code += `<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n`;
            code += `<link rel="apple-touch-icon" sizes="57x57" href="/apple-touch-icon-57x57.png">\n`;
            code += `<link rel="apple-touch-icon" sizes="60x60" href="/apple-touch-icon-60x60.png">\n`;
            code += `<link rel="apple-touch-icon" sizes="72x72" href="/apple-touch-icon-72x72.png">\n`;
            code += `<link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon-76x76.png">\n`;
            code += `<link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png">\n`;
            code += `<link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">\n`;
            code += `<link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png">\n`;
            code += `<link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">\n`;
            code += `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">\n`;
        }
        
        if (selectedPlatforms.includes('android')) {
            code += `\n<!-- Android Icons -->\n`;
            code += `<link rel="manifest" href="/manifest.json">\n`;
            code += `<meta name="theme-color" content="#ffffff">\n`;
        }
        
        if (selectedPlatforms.includes('windows')) {
            code += `\n<!-- Windows Tiles -->\n`;
            code += `<meta name="msapplication-TileColor" content="#ffffff">\n`;
            code += `<meta name="msapplication-TileImage" content="/ms-icon-144x144.png">\n`;
            code += `<meta name="msapplication-config" content="/browserconfig.xml">\n`;
        }
        
        return code;
    }

    // =====================================================
    // DOWNLOAD FUNCTIONS
    // =====================================================
    
    function downloadSingleIcon(icon) {
        const url = URL.createObjectURL(icon.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${icon.name}.${icon.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        showToast(`Downloaded ${icon.name}.${icon.format}`);
    }

    async function downloadAll() {
        if (generatedIcons.length === 0) return;
        
        // Show processing
        processing.classList.add('active');
        progressBar.style.width = '0%';
        $('.processing__text').textContent = 'Creating ZIP file...';
        progressCount.textContent = 'Please wait...';
        
        try {
            const zip = new JSZip();
            
            // Group by platform for organized folders
            const platforms = {};
            generatedIcons.forEach(icon => {
                if (!platforms[icon.platform]) {
                    platforms[icon.platform] = [];
                }
                platforms[icon.platform].push(icon);
            });
            
            // Add icons to ZIP
            let processed = 0;
            for (const [platform, icons] of Object.entries(platforms)) {
                const folder = zip.folder(platform);
                
                for (const icon of icons) {
                    const filename = `${icon.name}.${icon.format}`;
                    folder.file(filename, icon.data);
                    
                    processed++;
                    const progress = (processed / generatedIcons.length) * 100;
                    progressBar.style.width = `${progress}%`;
                }
            }
            
            // Add multi-size favicon.ico to root
            progressCount.textContent = 'Generating multi-size favicon.ico...';
            const multiIco = await createMultiSizeICO([16, 32, 48]);
            zip.file('favicon.ico', multiIco);
            
            // Add HTML code if available
            const htmlCode = htmlCodeOutput.textContent;
            if (htmlCode) {
                zip.file('favicon-html-code.txt', htmlCode);
            }
            
            // Add manifest.json for Android
            if (platforms.android) {
                const manifest = {
                    name: 'App Name',
                    short_name: 'App',
                    icons: platforms.android.map(icon => ({
                        src: `/android/${icon.name}.png`,
                        sizes: `${icon.size}x${icon.size}`,
                        type: 'image/png',
                        purpose: 'any maskable'
                    })),
                    theme_color: '#ffffff',
                    background_color: '#ffffff',
                    display: 'standalone'
                };
                zip.file('manifest.json', JSON.stringify(manifest, null, 2));
            }
            
            // Add browserconfig.xml for Windows
            if (platforms.windows) {
                const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square70x70logo src="/windows/ms-icon-70x70.png"/>
            <square150x150logo src="/windows/ms-icon-150x150.png"/>
            <square310x310logo src="/windows/ms-icon-310x310.png"/>
            <TileColor>#ffffff</TileColor>
        </tile>
    </msapplication>
</browserconfig>`;
                zip.file('browserconfig.xml', browserconfig);
            }
            
            // Generate ZIP
            progressCount.textContent = 'Compressing...';
            const zipBlob = await zip.generateAsync({ 
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            });
            
            // Download
            const url = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'favicons-imagerunner.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            
            processing.classList.remove('active');
            showToast(`✅ Downloaded ZIP with ${generatedIcons.length} icons!`);
            
        } catch (error) {
            console.error('ZIP error:', error);
            processing.classList.remove('active');
            showToast('Failed to create ZIP file', 'error');
        }
    }

    // =====================================================
    // COPY HTML CODE
    // =====================================================
    
    async function copyHtmlCode() {
        const code = htmlCodeOutput.textContent;
        
        try {
            // Modern API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(code);
                copySuccess();
            } else {
                // Fallback
                fallbackCopy(code);
            }
        } catch (error) {
            fallbackCopy(code);
        }
    }

    function fallbackCopy(text) {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            copySuccess();
        } catch (error) {
            showToast('Failed to copy code', 'error');
        }
    }

    function copySuccess() {
        copyCodeBtn.textContent = 'Copied!';
        copyCodeBtn.classList.add('copied');
        showToast('HTML code copied to clipboard!');
        
        setTimeout(() => {
            copyCodeBtn.textContent = 'Copy Code';
            copyCodeBtn.classList.remove('copied');
        }, 2000);
    }

    // =====================================================
    // TOAST NOTIFICATIONS
    // =====================================================
    
    function showToast(message, type = 'success') {
        toast.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${type === 'success' 
                    ? '<path d="M20 6L9 17l-5-5"/>' 
                    : '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>'}
            </svg>
            ${message}
        `;
        toast.querySelector('svg').style.color = type === 'success' ? '#22c55e' : '#ef4444';
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // =====================================================
    // START
    // =====================================================
    
    document.addEventListener('DOMContentLoaded', init);
    
})();
