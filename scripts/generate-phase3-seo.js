const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const resizeTemplatePath = path.join(root, 'image-resize.html');
const convertTemplatePath = path.join(root, 'format-converter.html');
const sitemapPath = path.join(root, 'sitemap.xml');

const resizeTemplate = fs.readFileSync(resizeTemplatePath, 'utf8');
const convertTemplate = fs.readFileSync(convertTemplatePath, 'utf8');

const toTitle = (value) => value
  .split(' ')
  .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
  .join(' ');

const titleFromSlug = (slug) => toTitle(slug.replace(/-/g, ' '));

const pickCircular = (arr, index, offset) => {
  const length = arr.length;
  return arr[(index + offset + length) % length];
};

const buildRelatedUseCaseBlock = (links) => {
  const items = links
    .map((link) => `
                    <a href="${link.href}" style="display:block;padding:9px 12px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;color:#1d4ed8;text-decoration:none;font-weight:600;font-size:13px;">${link.label}</a>`)
    .join('');

  return `
            <div style="margin-top:18px;">
                <h3 style="font-size:18px; color:#0f172a; margin-bottom:10px;">Related Use Cases</h3>
                <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:10px;">
${items}
                </div>
            </div>`;
};

const resizeCases = [
  ['for-passport-photo', 'passport applications and official IDs'],
  ['for-visa-photo', 'visa submissions and embassy portals'],
  ['for-job-application', 'resume profile photos and portal uploads'],
  ['for-upsc-form', 'UPSC exam form photo dimensions'],
  ['for-ssc-form', 'SSC application form photo limits'],
  ['for-neet-form', 'NEET form photo requirements'],
  ['for-jee-form', 'JEE registration image dimensions'],
  ['for-government-form', 'government service portal rules'],
  ['for-online-application', 'general online application workflows'],
  ['for-college-admission', 'college admission forms'],
  ['for-school-admission', 'school admission document photos'],
  ['for-exam-form', 'exam application image criteria'],
  ['for-linkedin', 'LinkedIn profile and banner assets'],
  ['for-instagram', 'Instagram post and profile dimensions'],
  ['for-facebook', 'Facebook post and cover image sizing'],
  ['for-twitter', 'X/Twitter headers and post images'],
  ['for-youtube-thumbnail', 'YouTube thumbnail dimensions'],
  ['for-whatsapp-dp', 'WhatsApp display picture sizing'],
  ['for-profile-picture', 'profile images across platforms'],
  ['for-cover-photo', 'cover photos for social platforms'],
  ['for-website', 'web-optimized visual assets'],
  ['for-blog', 'blog content images and featured covers'],
  ['for-shopify', 'Shopify store product and banner images'],
  ['for-ecommerce', 'ecommerce gallery image preparation'],
  ['for-amazon-listing', 'Amazon listing image standards'],
  ['for-flipkart-listing', 'Flipkart marketplace photo specs'],
  ['for-print', 'print-ready dimensions and DPI workflows'],
  ['for-cv-photo', 'CV and resume photo boxes'],
  ['for-aadhar-card', 'Aadhar linked online uploads'],
  ['for-pan-card', 'PAN application image fields'],
  ['under-50kb', 'strict low-size upload limits'],
  ['under-100kb', 'common image upload restrictions'],
  ['under-200kb', 'moderate file size limits'],
  ['under-500kb', 'high quality with moderate size caps'],
  ['to-300x300', 'exact 300x300 pixel targets'],
  ['to-600x600', 'square profile dimensions'],
  ['to-1080x1080', 'social post standard square format'],
  ['to-1920x1080', 'landscape HD image requirements'],
  ['to-35x45mm', 'passport and document photo standards'],
  ['on-mobile', 'phone-first resizing workflow'],
  ['on-android', 'Android browser resizing'],
  ['on-iphone', 'iPhone photo resizing'],
  ['on-windows', 'Windows desktop resizing flow'],
  ['on-mac', 'Mac browser image resizing'],
  ['batch-resize', 'multi-image batch processing'],
  ['bulk-resize', 'bulk upload and resize operations'],
  ['keep-aspect-ratio', 'safe proportional resizing'],
  ['without-losing-quality', 'quality-first resizing'],
  ['for-email-attachment', 'email-ready image dimensions'],
  ['for-portal-upload', 'document and service portal uploads']
];

const convertCases = [
  ['png-to-jpg', 'convert transparent PNGs to lightweight JPGs'],
  ['jpg-to-png', 'preserve edits in a lossless PNG output'],
  ['png-to-webp', 'modern web optimization for transparent graphics'],
  ['webp-to-png', 'compatibility for legacy apps and editors'],
  ['jpg-to-webp', 'smaller website-ready photo files'],
  ['webp-to-jpg', 'easy compatibility with older viewers'],
  ['gif-to-jpg', 'static frame export from GIF files'],
  ['gif-to-png', 'clean static PNG extraction'],
  ['bmp-to-jpg', 'reduce bitmap file size significantly'],
  ['bmp-to-png', 'convert bitmap while keeping detail'],
  ['heic-to-jpg', 'share iPhone photos across all platforms'],
  ['heic-to-png', 'keep quality from HEIC source photos'],
  ['jpeg-to-jpg', 'standardize file extension compatibility'],
  ['jpg-to-jpeg', 'alternate extension output requirements'],
  ['png-to-jpeg', 'smaller files for upload workflows'],
  ['jpeg-to-png', 'lossless edits after conversion'],
  ['convert-for-instagram', 'Instagram-ready image formats'],
  ['for-whatsapp', 'chat and status compatible formats'],
  ['for-website', 'web performance and compatibility'],
  ['for-blog', 'blog CMS friendly formats'],
  ['for-ecommerce', 'catalog and product feed formats'],
  ['for-shopify', 'Shopify storefront requirements'],
  ['for-amazon', 'Amazon listing format expectations'],
  ['for-flipkart', 'Flipkart listing compatibility'],
  ['for-print', 'print workflow format preparation'],
  ['for-email', 'email attachment compatibility'],
  ['for-gmail', 'Gmail-ready image output'],
  ['for-outlook', 'Outlook-friendly image conversion'],
  ['on-mobile', 'mobile browser format conversion'],
  ['on-android', 'Android format conversion workflow'],
  ['on-iphone', 'iPhone image format conversion'],
  ['on-windows', 'Windows browser conversion flow'],
  ['on-mac', 'Mac format conversion workflow'],
  ['batch-convert', 'convert many files in one run'],
  ['bulk-convert', 'bulk format operations for teams'],
  ['without-losing-quality', 'quality-first format conversion'],
  ['fast-conversion', 'speed-first conversion workflow'],
  ['with-transparency', 'preserve alpha channel output'],
  ['for-logo-files', 'logo and brand asset conversion'],
  ['for-passport-photo', 'passport upload compatible formats'],
  ['for-government-form', 'government portal format rules'],
  ['for-document-upload', 'document support image formats'],
  ['for-linkedin', 'LinkedIn profile and post formats'],
  ['for-facebook', 'Facebook upload-friendly formats'],
  ['for-twitter', 'X/Twitter media format compatibility'],
  ['for-youtube-thumbnail', 'YouTube thumbnail accepted formats'],
  ['for-powerpoint', 'PowerPoint slide compatibility'],
  ['for-wordpress', 'WordPress optimized image formats'],
  ['for-seo', 'search-performance friendly image formats'],
  ['for-page-speed', 'faster page delivery with efficient formats']
];

const updateHead = (content, cfg) => {
  let out = content;
  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${cfg.title}</title>`);
  out = out.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${cfg.metaDescription}">`);
  out = out.replace(/<meta name="keywords" content="[^"]*">/, `<meta name="keywords" content="${cfg.keywords}">`);
  out = out.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${cfg.url}">`);
  out = out.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${cfg.ogTitle}">`);
  out = out.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${cfg.ogDescription}">`);
  out = out.replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${cfg.twitterTitle}">`);
  out = out.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${cfg.twitterDescription}">`);
  out = out.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${cfg.url}">`);
  return out;
};

const makeResizeSection = (keyword, useCase, relatedBlock) => `
    <section style="padding: 44px 0; background: #ffffff; border-top: 1px solid #e5e7eb;">
        <div class="container" style="max-width: 920px;">
            <h2 style="font-size: 28px; line-height: 1.25; color: #0f172a; margin-bottom: 12px;">How to use ${keyword}</h2>
            <p style="color:#475569; line-height:1.8; margin-bottom: 18px;">Use this page to optimize images for ${useCase}. Upload, set dimensions, keep aspect ratio if needed, and download your resized output instantly.</p>
            <ol style="padding-left: 22px; color:#334155; line-height:1.9; margin-bottom: 20px;">
                <li>Select one or more images.</li>
                <li>Set width and height in px, %, cm, or inches.</li>
                <li>Choose format and quality preferences.</li>
                <li>Click Resize and download files.</li>
            </ol>
            <div style="display:flex; flex-wrap:wrap; gap:10px;">
                <a href="image-resize-use-cases.html" style="background:#2563eb;color:#fff;padding:10px 14px;border-radius:8px;font-weight:600;text-decoration:none;">All Resize Use Cases</a>
                <a href="image-compress.html" style="background:#eff6ff;color:#1d4ed8;padding:10px 14px;border-radius:8px;font-weight:600;text-decoration:none;">Image Compress</a>
                <a href="format-converter.html" style="background:#eff6ff;color:#1d4ed8;padding:10px 14px;border-radius:8px;font-weight:600;text-decoration:none;">Format Converter</a>
            </div>
      ${relatedBlock}
        </div>
    </section>`;

      const makeConvertSection = (keyword, useCase, relatedBlock) => `
    <section style="padding: 44px 0; background: #ffffff; border-top: 1px solid #e5e7eb;">
        <div class="container" style="max-width: 920px;">
            <h2 style="font-size: 28px; line-height: 1.25; color: #0f172a; margin-bottom: 12px;">How to use ${keyword}</h2>
            <p style="color:#475569; line-height:1.8; margin-bottom: 18px;">This page is focused on ${useCase}. Upload your files, pick the target format, tune quality, and export instantly.</p>
            <ol style="padding-left: 22px; color:#334155; line-height:1.9; margin-bottom: 20px;">
                <li>Upload one or multiple images.</li>
                <li>Choose output format like JPG, PNG, or WebP.</li>
                <li>Adjust quality if applicable.</li>
                <li>Convert and download your files.</li>
            </ol>
            <div style="display:flex; flex-wrap:wrap; gap:10px;">
                <a href="convert-image-format-use-cases.html" style="background:#2563eb;color:#fff;padding:10px 14px;border-radius:8px;font-weight:600;text-decoration:none;">All Convert Use Cases</a>
                <a href="image-resize.html" style="background:#eff6ff;color:#1d4ed8;padding:10px 14px;border-radius:8px;font-weight:600;text-decoration:none;">Image Resize</a>
                <a href="image-compress.html" style="background:#eff6ff;color:#1d4ed8;padding:10px 14px;border-radius:8px;font-weight:600;text-decoration:none;">Image Compress</a>
            </div>
${relatedBlock}
        </div>
    </section>`;

const resizeUrls = [];
for (let index = 0; index < resizeCases.length; index += 1) {
  const [slugPart, useCase] = resizeCases[index];
  const fileName = `resize-image-${slugPart}.html`;
  const keyword = `resize image ${slugPart.replace(/-/g, ' ')}`;
  const keywordTitle = toTitle(keyword);
  const pageUrl = `https://www.imgrunner.com/${fileName}`;

  const resizeRelated = [1, 2, -1]
    .map((offset) => pickCircular(resizeCases, index, offset)[0])
    .map((slug) => ({
      href: `resize-image-${slug}.html`,
      label: `Resize Image ${titleFromSlug(slug)}`
    }));

  const convertRelated = [0, 17, 31]
    .map((offset) => pickCircular(convertCases, index, offset)[0])
    .map((slug) => ({
      href: `convert-image-format-${slug}.html`,
      label: `Convert Image Format ${titleFromSlug(slug)}`
    }));

  const relatedBlock = buildRelatedUseCaseBlock([...resizeRelated, ...convertRelated]);

  const headCfg = {
    title: `${keywordTitle} Online Free | Fast Image Resizer | Image Runner`,
    metaDescription: `${keywordTitle} online free. Resize for ${useCase} with custom dimensions and quality-safe output.`,
    keywords: `${keyword}, image resizer online, change image dimensions, resize photo`,
    url: pageUrl,
    ogTitle: `${keywordTitle} Online Free | Resize Images Fast`,
    ogDescription: `${keywordTitle} with private browser processing.`,
    twitterTitle: `${keywordTitle} Online Free | Image Runner`,
    twitterDescription: `${keywordTitle} instantly in your browser.`
  };

  let page = updateHead(resizeTemplate, headCfg);
  page = page.replace(/<h1 class="upload-title">[\s\S]*?<\/h1>/, `<h1 class="upload-title">${keywordTitle}</h1>`);
  page = page.replace(/<p class="upload-desc">[\s\S]*?<\/p>/, `<p class="upload-desc">Need to ${keyword}? This page helps you resize images for ${useCase} with exact dimensions and fast output.</p>`);
  page = page.replace(/<section style="padding: 22px 0 48px; background: #f8f9fa;">[\s\S]*?<\/section>\s*<!-- Footer -->/, `
${makeResizeSection(keyword, useCase, relatedBlock)}

    <!-- Footer -->`);

  fs.writeFileSync(path.join(root, fileName), page, 'utf8');
  resizeUrls.push(fileName);
}

const convertUrls = [];
for (let index = 0; index < convertCases.length; index += 1) {
  const [slugPart, useCase] = convertCases[index];
  const fileName = `convert-image-format-${slugPart}.html`;
  const keyword = `convert image format ${slugPart.replace(/-/g, ' ')}`;
  const keywordTitle = toTitle(keyword);
  const pageUrl = `https://www.imgrunner.com/${fileName}`;

  const convertRelated = [1, 2, -1]
    .map((offset) => pickCircular(convertCases, index, offset)[0])
    .map((slug) => ({
      href: `convert-image-format-${slug}.html`,
      label: `Convert Image Format ${titleFromSlug(slug)}`
    }));

  const resizeRelated = [0, 19, 33]
    .map((offset) => pickCircular(resizeCases, index, offset)[0])
    .map((slug) => ({
      href: `resize-image-${slug}.html`,
      label: `Resize Image ${titleFromSlug(slug)}`
    }));

  const relatedBlock = buildRelatedUseCaseBlock([...convertRelated, ...resizeRelated]);

  const headCfg = {
    title: `${keywordTitle} Online Free | Fast Image Format Converter | Image Runner`,
    metaDescription: `${keywordTitle} online free. Convert images for ${useCase} with private browser processing.`,
    keywords: `${keyword}, image format converter, convert png jpg webp, free image converter`,
    url: pageUrl,
    ogTitle: `${keywordTitle} Online Free | Convert Images Fast`,
    ogDescription: `${keywordTitle} with secure browser-based conversion.`,
    twitterTitle: `${keywordTitle} Online Free | Image Runner`,
    twitterDescription: `${keywordTitle} instantly in your browser.`
  };

  let page = updateHead(convertTemplate, headCfg);
  page = page.replace(/<h1 class="upload-title">[\s\S]*?<\/h1>/, `<h1 class="upload-title">${keywordTitle}</h1>`);
  page = page.replace(/<p class="upload-desc">[\s\S]*?<\/p>/, `<p class="upload-desc">Need to ${keyword}? Convert files for ${useCase} with quality controls and fast downloads.</p>`);
  page = page.replace(/<section style="padding: 20px 0 48px; background: #ffffff;">[\s\S]*?<\/section>\s*<!-- Footer -->/, `
${makeConvertSection(keyword, useCase, relatedBlock)}

    <!-- Footer -->`);

  fs.writeFileSync(path.join(root, fileName), page, 'utf8');
  convertUrls.push(fileName);
}

const buildHub = (title, url, intro, links, openTool, prefix) => {
  const linkList = links
    .slice()
    .sort()
    .map((file) => {
      const label = titleFromSlug(file.replace('.html', '').replace(/^(resize-image|convert-image-format)-/, ''));
      return `                        <li><a href="${file}" style="display:block;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;color:#1d4ed8;text-decoration:none;font-weight:600;">${prefix} ${label}</a></li>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${title} | 50 Ready Pages | Image Runner</title>
    <meta name="description" content="${intro}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title} | 50 Ready Pages">
    <meta property="og:description" content="Explore long-tail use case pages by intent.">
    <link rel="canonical" href="${url}">
    <link rel="stylesheet" href="css/merge-pdf.css">
</head>
<body>
    <header class="header">
        <div class="container header__inner">
            <a href="index.html" class="back-btn" title="Go Back">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </a>
            <a href="index.html" class="logo">
                <svg class="logo__icon" viewBox="0 0 32 32" fill="none">
                    <rect x="2" y="6" width="28" height="20" rx="3" stroke="currentColor" stroke-width="2.5"/>
                    <circle cx="11" cy="13" r="3" fill="currentColor"/>
                    <path d="M7 22L13 16L17 20L25 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="logo__text">Image Runner</span>
            </a>
            <nav class="nav" aria-label="Tool navigation">
                <a href="image-resize.html" class="nav__link">Image Resize</a>
                <a href="format-converter.html" class="nav__link">Format Converter</a>
                <a href="image-compress.html" class="nav__link">Image Compress</a>
                <a href="image-to-pdf.html" class="nav__link">Image to PDF</a>
            </nav>
        </div>
    </header>

    <main>
        <section style="padding:56px 0 22px;">
            <div class="container" style="max-width:900px;">
                <h1 style="font-size:40px;line-height:1.15;margin-bottom:12px;color:#0f172a;">${title}</h1>
                <p style="font-size:17px;color:#475569;line-height:1.7;">${intro}</p>
            </div>
        </section>

        <section style="padding: 8px 0 50px;">
            <div class="container" style="max-width:900px;">
                <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:20px;">
                    <ul style="list-style:none;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;padding:0;margin:0;">
${linkList}
                    </ul>
                </div>
                <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">
                    <a href="${openTool}" style="background:#2563eb;color:#fff;padding:10px 14px;border-radius:8px;font-weight:600;text-decoration:none;">Open Main Tool</a>
                    <a href="image-compress.html" style="background:#eff6ff;color:#1d4ed8;padding:10px 14px;border-radius:8px;font-weight:600;text-decoration:none;">Image Compress</a>
                    <a href="background-remover.html" style="background:#eff6ff;color:#1d4ed8;padding:10px 14px;border-radius:8px;font-weight:600;text-decoration:none;">Background Remover</a>
                    <a href="image-to-pdf.html" style="background:#eff6ff;color:#1d4ed8;padding:10px 14px;border-radius:8px;font-weight:600;text-decoration:none;">Image to PDF</a>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; Image Runner 2026 - Your Image Editor</p>
        </div>
    </footer>

    <script src="js/bug-report.js" defer></script>
</body>
</html>`;
};

const resizeHub = buildHub(
  'Resize Image Use Cases',
  'https://www.imgrunner.com/resize-image-use-cases.html',
  'This authority hub lists 50 targeted Resize Image pages for social media, forms, jobs, portals, and fixed dimensions. Open the right use case and resize faster with exact intent.',
  resizeUrls,
  'image-resize.html',
  'Resize Image'
);
fs.writeFileSync(path.join(root, 'resize-image-use-cases.html'), resizeHub, 'utf8');

const convertHub = buildHub(
  'Convert Image Format Use Cases',
  'https://www.imgrunner.com/convert-image-format-use-cases.html',
  'This authority hub lists 50 targeted Convert Image Format pages for format pairs, social channels, forms, ecommerce, and speed-focused workflows.',
  convertUrls,
  'format-converter.html',
  'Convert Image Format'
);
fs.writeFileSync(path.join(root, 'convert-image-format-use-cases.html'), convertHub, 'utf8');

let sitemap = fs.readFileSync(sitemapPath, 'utf8');
const urlsToAdd = [
  ...resizeUrls,
  ...convertUrls,
  'resize-image-use-cases.html',
  'convert-image-format-use-cases.html'
].map((file) => `https://www.imgrunner.com/${file}`);

const today = '2026-03-27';
const blocks = [];
for (const loc of urlsToAdd) {
  if (!sitemap.includes(`<loc>${loc}</loc>`)) {
    blocks.push(
`  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    );
  }
}

if (blocks.length) {
  sitemap = sitemap.replace('</urlset>', `${blocks.join('\n')}\n</urlset>`);
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
}

console.log(`Generated ${resizeUrls.length} resize-image pages, ${convertUrls.length} convert-image-format pages, and 2 hubs.`);
