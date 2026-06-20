/**
 * I18N.JS - Small translation layer for static Image Runner tools.
 *
 * Add a new language by extending DICTIONARIES and adding its code to the
 * language selector in index.html.
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'imagerunner.language';
    const DEFAULT_LANGUAGE = 'en';

    const DICTIONARIES = {
        en: {
            'meta.title': 'Resize Images Online Free | Change Image Dimensions Instantly | Batch Photo Resizer | Image Runner',
            'meta.description': 'Resize images online instantly. Scale photos by pixels or percentage for social media, document uploads, and web design. Fast, free and private.',

            'nav.back': 'Go Back',
            'nav.tools': 'Tool navigation',
            'nav.language': 'Language',

            'upload.title': 'Resize IMAGE',
            'upload.description': 'Resize <span class="highlight">JPG</span>, <span class="highlight">PNG</span>, <span class="highlight">WebP</span> to exact dimensions.<br>Change size by pixels, percentage, or presets.',
            'upload.select': 'Select images',
            'upload.dropHint': 'or drop images here',

            'editor.addMore': '+ Add More',
            'editor.settingsTitle': 'Resize Settings',
            'editor.dimensions': 'Dimensions',
            'editor.width': 'Width',
            'editor.height': 'Height',
            'editor.lockRatio': 'Lock aspect ratio',
            'editor.output': 'Output',
            'editor.format': 'Format',
            'editor.quality': 'Quality',
            'editor.background': 'Background',
            'editor.bgWhite': 'White background',
            'editor.bgBlack': 'Black background',
            'editor.bgTransparent': 'Transparent background',
            'editor.bgTransparentTitle': 'Transparent (PNG/WebP only)',
            'editor.resize': 'Resize Image',
            'editor.privacy': 'Image files are processed locally in your browser',
            'editor.removeImage': 'Remove image',

            'units.pixels': 'Pixels (px)',
            'units.percent': 'Percentage (%)',
            'units.cm': 'Centimeters (cm)',
            'units.inches': 'Inches (in)',

            'download.title': 'Images Resized!',
            'download.download': 'Download resized images',
            'download.more': 'Resize more images',

            'share.label': 'Share this tool:',
            'share.copy': 'Copy Link',
            'share.facebook': 'Share on Facebook',
            'share.twitter': 'Share on Twitter',
            'share.whatsapp': 'Share on WhatsApp',
            'share.text': 'Free online image resizer',

            'processing.resizing': 'Resizing...',
            'processing.progress': ({ current, total }) => `Resizing ${current} of ${total}...`,
            'processing.done': 'Done!',

            'status.imageCount': ({ count }) => `${count} image${count === 1 ? '' : 's'}`,
            'status.processedCount': ({ count }) => `${count} image${count === 1 ? '' : 's'} processed`,

            'alerts.maxImages': ({ max }) => `Maximum ${max} images are allowed.`,
            'alerts.extraSkipped': ({ count, max }) => `${count} extra file${count === 1 ? '' : 's'} skipped. Maximum is ${max}.`,
            'alerts.unsupportedSkipped': ({ count }) => `${count} unsupported file${count === 1 ? '' : 's'} skipped. Use JPG, PNG, WebP, or GIF input.`,
            'alerts.largeSkipped': ({ count, size }) => `${count} file${count === 1 ? '' : 's'} skipped because each image must be ${size} or smaller.`,
            'alerts.loadSkipped': ({ count }) => `${count} image${count === 1 ? '' : 's'} could not be loaded.`,
            'alerts.resizeError': 'Error during resizing. Try a smaller image or dimensions.',
            'alerts.invalidDimensions': 'Enter valid width and height values.',
            'alerts.tooLarge': ({ maxDimension, megapixels }) => `Output is too large. Use dimensions up to ${maxDimension}px per side and ${megapixels} megapixels total.`,
            'alerts.canvasUnavailable': 'Your browser could not create the image canvas.',
            'alerts.formatUnsupported': 'This browser could not export the selected format.',
            'alerts.linkCopied': 'Link copied!',
            'alerts.copyFailed': 'Could not copy the link.',

            'seo.title': 'Free Online Image Resizer Tool',
            'seo.intro1': 'Image Runner\'s <strong>Image Resizer</strong> changes image dimensions in your browser. Use it for social media, document uploads, forms, and web design without uploading your image files.',
            'seo.intro2': 'It works well for students, job seekers, and anyone who needs quick resizing with JPG, PNG, WebP, or GIF input and JPG, PNG, or WebP output.',
            'seo.howTitle': 'How to Resize Images Online',
            'seo.step1': '<strong>Upload your image</strong> - select files or drag and drop them.',
            'seo.step2': '<strong>Set dimensions</strong> - enter pixels, percentage, centimeters, or inches.',
            'seo.step3': '<strong>Choose format</strong> - export as JPG, PNG, or WebP.',
            'seo.step4': '<strong>Download</strong> - save one image directly or multiple images as a ZIP.',
            'seo.featuresTitle': 'Key Features',
            'seo.feature1': '<strong>Batch resize</strong> - resize up to 50 images at once.',
            'seo.feature2': '<strong>Multiple units</strong> - pixels, percentage, centimeters, and inches.',
            'seo.feature3': '<strong>Aspect ratio lock</strong> - keep proportions while editing dimensions.',
            'seo.feature4': '<strong>Quality control</strong> - adjust JPG and WebP output quality.',
            'seo.feature5': '<strong>ZIP download</strong> - download multiple processed files together.',
            'seo.feature6': '<strong>No watermark</strong> - clean output every time.',
            'seo.faqTitle': 'Frequently Asked Questions',
            'seo.faq1Q': 'What size should a passport photo be?',
            'seo.faq1A': 'Indian passport photos are commonly 35x45 mm. US visa photos are 2x2 in. Always check the official requirement for the form you are submitting.',
            'seo.faq2Q': 'How do I reach 50KB or 100KB?',
            'seo.faq2A': 'Resize to the required dimensions first, then lower JPG or WebP quality until the file size fits the limit.',
            'seo.faq3Q': 'Does resizing reduce quality?',
            'seo.faq3A': 'Downscaling usually keeps images sharp. Upscaling can soften details because the browser has to create extra pixels.',
            'seo.faq4Q': 'Does the DPI field write print metadata?',
            'seo.faq4A': 'No. DPI is used only to convert centimeters or inches into pixel dimensions in this browser tool.',

            'footer.copyright': '&copy; 2026 Image Runner. All rights reserved.',
            'footer.privacy': 'Image files are processed locally in your browser.'
        },

        hi: {
            'meta.title': 'Image Runner पर ऑनलाइन इमेज Resize करें | Free Photo Resizer',
            'meta.description': 'ब्राउजर में ही JPG, PNG और WebP इमेज resize करें. फोटो अपलोड नहीं होती, काम तेज और निजी रहता है.',

            'nav.back': 'वापस जाएं',
            'nav.tools': 'टूल नेविगेशन',
            'nav.language': 'भाषा',

            'upload.title': 'इमेज Resize करें',
            'upload.description': '<span class="highlight">JPG</span>, <span class="highlight">PNG</span>, <span class="highlight">WebP</span> को exact dimensions में resize करें.<br>Size pixels, percentage या presets से बदलें.',
            'upload.select': 'इमेज चुनें',
            'upload.dropHint': 'या इमेज यहां drop करें',

            'editor.addMore': '+ और जोड़ें',
            'editor.settingsTitle': 'Resize Settings',
            'editor.dimensions': 'Dimensions',
            'editor.width': 'चौड़ाई',
            'editor.height': 'ऊंचाई',
            'editor.lockRatio': 'Aspect ratio lock करें',
            'editor.output': 'Output',
            'editor.format': 'Format',
            'editor.quality': 'Quality',
            'editor.background': 'Background',
            'editor.bgWhite': 'सफेद background',
            'editor.bgBlack': 'काला background',
            'editor.bgTransparent': 'Transparent background',
            'editor.bgTransparentTitle': 'Transparent (सिर्फ PNG/WebP)',
            'editor.resize': 'Image Resize करें',
            'editor.privacy': 'इमेज फाइलें आपके browser में ही process होती हैं',
            'editor.removeImage': 'इमेज हटाएं',

            'units.pixels': 'Pixels (px)',
            'units.percent': 'Percentage (%)',
            'units.cm': 'Centimeters (cm)',
            'units.inches': 'Inches (in)',

            'download.title': 'Images Resize हो गईं!',
            'download.download': 'Resize हुई images download करें',
            'download.more': 'और images resize करें',

            'share.label': 'यह tool share करें:',
            'share.copy': 'Link copy करें',
            'share.facebook': 'Facebook पर share करें',
            'share.twitter': 'Twitter पर share करें',
            'share.whatsapp': 'WhatsApp पर share करें',
            'share.text': 'Free online image resizer',

            'processing.resizing': 'Resize हो रहा है...',
            'processing.progress': ({ current, total }) => `${total} में से ${current} resize हो रही है...`,
            'processing.done': 'हो गया!',

            'status.imageCount': ({ count }) => `${count} image`,
            'status.processedCount': ({ count }) => `${count} image processed`,

            'alerts.maxImages': ({ max }) => `Maximum ${max} images allowed हैं.`,
            'alerts.extraSkipped': ({ count, max }) => `${count} extra file skip हुई. Maximum ${max} है.`,
            'alerts.unsupportedSkipped': ({ count }) => `${count} unsupported file skip हुई. JPG, PNG, WebP या GIF input use करें.`,
            'alerts.largeSkipped': ({ count, size }) => `${count} file skip हुई क्योंकि हर image ${size} या उससे छोटी होनी चाहिए.`,
            'alerts.loadSkipped': ({ count }) => `${count} image load नहीं हो सकी.`,
            'alerts.resizeError': 'Resize करते समय error आया. छोटी image या dimensions try करें.',
            'alerts.invalidDimensions': 'Valid width और height डालें.',
            'alerts.tooLarge': ({ maxDimension, megapixels }) => `Output बहुत बड़ा है. हर side ${maxDimension}px तक और total ${megapixels} megapixels तक रखें.`,
            'alerts.canvasUnavailable': 'Browser image canvas create नहीं कर पाया.',
            'alerts.formatUnsupported': 'Browser selected format export नहीं कर पाया.',
            'alerts.linkCopied': 'Link copy हो गया!',
            'alerts.copyFailed': 'Link copy नहीं हो पाया.',

            'seo.title': 'Free Online Image Resizer Tool',
            'seo.intro1': 'Image Runner का <strong>Image Resizer</strong> आपके browser में image dimensions बदलता है. Social media, document upload, forms और web design के लिए image files upload किए बिना use करें.',
            'seo.intro2': 'यह students, job seekers और quick resizing चाहने वाले users के लिए useful है. Input JPG, PNG, WebP या GIF हो सकता है; output JPG, PNG या WebP मिलता है.',
            'seo.howTitle': 'Online Image Resize कैसे करें',
            'seo.step1': '<strong>Image upload करें</strong> - files select करें या drag and drop करें.',
            'seo.step2': '<strong>Dimensions set करें</strong> - pixels, percentage, centimeters या inches डालें.',
            'seo.step3': '<strong>Format चुनें</strong> - JPG, PNG या WebP में export करें.',
            'seo.step4': '<strong>Download करें</strong> - single image direct save करें या multiple images ZIP में लें.',
            'seo.featuresTitle': 'Key Features',
            'seo.feature1': '<strong>Batch resize</strong> - एक बार में 50 images तक resize करें.',
            'seo.feature2': '<strong>Multiple units</strong> - pixels, percentage, centimeters और inches.',
            'seo.feature3': '<strong>Aspect ratio lock</strong> - dimensions edit करते समय proportions बनाए रखें.',
            'seo.feature4': '<strong>Quality control</strong> - JPG और WebP output quality adjust करें.',
            'seo.feature5': '<strong>ZIP download</strong> - multiple processed files साथ में download करें.',
            'seo.feature6': '<strong>No watermark</strong> - हर बार clean output.',
            'seo.faqTitle': 'अक्सर पूछे जाने वाले सवाल',
            'seo.faq1Q': 'Passport photo का size क्या होना चाहिए?',
            'seo.faq1A': 'Indian passport photos commonly 35x45 mm होते हैं. US visa photos 2x2 in होते हैं. Form submit करने से पहले official requirement जरूर check करें.',
            'seo.faq2Q': '50KB या 100KB कैसे करें?',
            'seo.faq2A': 'पहले required dimensions में resize करें, फिर JPG या WebP quality कम करें जब तक file size limit में न आ जाए.',
            'seo.faq3Q': 'Resize करने से quality कम होती है?',
            'seo.faq3A': 'Downscale करने पर image आम तौर पर sharp रहती है. Upscale करने पर details soft हो सकती हैं क्योंकि browser extra pixels बनाता है.',
            'seo.faq4Q': 'क्या DPI field print metadata लिखता है?',
            'seo.faq4A': 'नहीं. DPI यहां सिर्फ centimeters या inches को pixel dimensions में convert करने के लिए use होता है.',

            'footer.copyright': '&copy; 2026 Image Runner. सभी अधिकार सुरक्षित.',
            'footer.privacy': 'इमेज फाइलें आपके browser में locally process होती हैं.'
        }
    };

    let currentLanguage = detectLanguage();

    function getValue(dictionary, key) {
        return key.split('.').reduce((value, part) => value && value[part], dictionary);
    }

    function interpolate(template, params) {
        return String(template).replace(/\{\{\s*(\w+)\s*\}\}/g, (_, name) => (
            params[name] == null ? '' : String(params[name])
        ));
    }

    function t(key, params = {}) {
        const dictionary = DICTIONARIES[currentLanguage] || DICTIONARIES[DEFAULT_LANGUAGE];
        const fallback = DICTIONARIES[DEFAULT_LANGUAGE];
        const value = getValue(dictionary, key) ?? getValue(fallback, key) ?? key;
        return typeof value === 'function' ? value(params) : interpolate(value, params);
    }

    function applyTranslations(root = document) {
        document.documentElement.lang = currentLanguage;
        document.documentElement.dir = 'ltr';
        document.title = t('meta.title');

        const description = document.querySelector('meta[name="description"]');
        if (description) description.setAttribute('content', t('meta.description'));

        root.querySelectorAll('[data-i18n]').forEach((element) => {
            element.textContent = t(element.dataset.i18n);
        });

        root.querySelectorAll('[data-i18n-html]').forEach((element) => {
            element.innerHTML = t(element.dataset.i18nHtml);
        });

        root.querySelectorAll('[data-i18n-attr]').forEach((element) => {
            element.dataset.i18nAttr.split(',').forEach((entry) => {
                const [attr, key] = entry.split(':').map((item) => item.trim());
                if (attr && key) element.setAttribute(attr, t(key));
            });
        });
    }

    function setLanguage(language) {
        currentLanguage = DICTIONARIES[language] ? language : DEFAULT_LANGUAGE;
        try {
            window.localStorage.setItem(STORAGE_KEY, currentLanguage);
        } catch (error) {
            // Ignore storage failures in private or locked-down contexts.
        }

        applyTranslations();
        window.dispatchEvent(new CustomEvent('imagerunner:languagechange', { detail: { language: currentLanguage } }));
    }

    function getLanguage() {
        return currentLanguage;
    }

    function detectLanguage() {
        const params = new URLSearchParams(window.location.search);
        const fromUrl = params.get('lang');
        if (fromUrl && DICTIONARIES[fromUrl]) return fromUrl;

        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (stored && DICTIONARIES[stored]) return stored;
        } catch (error) {
            // Ignore storage failures in private or locked-down contexts.
        }

        const browserLanguage = (navigator.language || '').toLowerCase();
        if (browserLanguage.startsWith('hi')) return 'hi';
        return DEFAULT_LANGUAGE;
    }

    window.ImageRunnerI18n = {
        applyTranslations,
        getLanguage,
        setLanguage,
        t,
        languages: Object.keys(DICTIONARIES)
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => applyTranslations());
    } else {
        applyTranslations();
    }
})();
