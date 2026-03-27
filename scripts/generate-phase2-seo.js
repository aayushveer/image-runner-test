const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const compressTemplatePath = path.join(root, 'compress-pdf.html');
const imageTemplatePath = path.join(root, 'image-compress.html');
const sitemapPath = path.join(root, 'sitemap.xml');

const compressTemplate = fs.readFileSync(compressTemplatePath, 'utf8');
const imageTemplate = fs.readFileSync(imageTemplatePath, 'utf8');

const toTitle = (value) => value
  .split(' ')
  .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
  .join(' ');

const compressCases = [
  ['for-email', 'email attachments and quick sharing'],
  ['for-job-application', 'resume, cover letter, and certificates'],
  ['for-visa-application', 'passport documents and support files'],
  ['for-college-admission', 'application forms and marksheets'],
  ['for-bank-statement', 'monthly statement uploads'],
  ['for-tax-filing', 'returns and tax proof uploads'],
  ['for-loan-application', 'income proof and document uploads'],
  ['for-insurance-claim', 'claim forms and medical bills'],
  ['for-legal-documents', 'legal submission size limits'],
  ['for-contracts', 'contract sharing by email'],
  ['for-invoices', 'invoice bundles for clients'],
  ['for-client-proposal', 'proposal sharing with attachments'],
  ['for-project-report', 'report uploads on portals'],
  ['for-portfolio', 'portfolio sharing with recruiters'],
  ['for-research-paper', 'paper submission workflows'],
  ['for-thesis-submission', 'thesis and appendix uploads'],
  ['for-assignment-submission', 'student assignment uploads'],
  ['for-school-homework', 'homework file size limits'],
  ['for-meeting-notes', 'shared notes in compact format'],
  ['for-monthly-reports', 'monthly reporting workflows'],
  ['for-audit-files', 'audit document transfer'],
  ['for-hr-documents', 'employee document management'],
  ['for-employee-onboarding', 'joining document uploads'],
  ['for-real-estate-documents', 'property document packets'],
  ['for-medical-records', 'health record upload requirements'],
  ['for-passport-application', 'passport portal size limits'],
  ['for-immigration-files', 'immigration form uploads'],
  ['for-scholarship-application', 'scholarship document uploads'],
  ['for-court-filing', 'court portal submission limits'],
  ['for-printing', 'print-ready compact files'],
  ['for-whatsapp-sharing', 'mobile sharing on chat apps'],
  ['for-gmail', 'Gmail attachment limits'],
  ['for-outlook', 'Outlook attachment limits'],
  ['under-1mb', 'strict 1MB upload limits'],
  ['under-2mb', '2MB upload constraints'],
  ['under-5mb', '5MB upload constraints'],
  ['without-losing-quality', 'quality-first file reduction'],
  ['on-mobile', 'phone-based compression workflow'],
  ['on-android', 'Android browser compression'],
  ['on-iphone', 'iPhone browser compression'],
  ['on-windows', 'Windows desktop workflow'],
  ['on-mac', 'Mac browser workflow'],
  ['for-scanned-documents', 'large scanned PDF reduction'],
  ['for-team-sharing', 'team document sharing'],
  ['for-client-delivery', 'client-ready file handoff'],
  ['for-case-study', 'case study submission files'],
  ['for-property-documents', 'property deal documentation'],
  ['for-tender-submission', 'tender portal requirements'],
  ['for-government-application', 'government portal limits'],
  ['for-portal-upload', 'general web portal uploads']
];

const imageCases = [
  ['for-email', 'email attachment size limits'],
  ['for-whatsapp', 'WhatsApp sharing quality and size'],
  ['for-telegram', 'Telegram media sharing'],
  ['for-instagram', 'Instagram upload optimization'],
  ['for-facebook', 'Facebook post optimization'],
  ['for-linkedin', 'LinkedIn profile and post images'],
  ['for-twitter', 'social image optimization'],
  ['for-website', 'website speed and image size'],
  ['for-blog', 'blog performance optimization'],
  ['for-wordpress', 'WordPress media optimization'],
  ['for-shopify', 'Shopify store image speed'],
  ['for-ecommerce', 'ecommerce product optimization'],
  ['for-product-images', 'product gallery optimization'],
  ['for-catalog', 'catalog image batching'],
  ['for-brochure', 'brochure image uploads'],
  ['for-job-application', 'job portal image limits'],
  ['for-resume-photo', 'resume profile image size'],
  ['for-passport-photo', 'passport photo upload limits'],
  ['for-id-card', 'ID card form uploads'],
  ['for-school-admission', 'school form image limits'],
  ['for-college-admission', 'college portal image upload'],
  ['for-exam-form', 'exam form upload constraints'],
  ['for-government-form', 'government form image rules'],
  ['for-visa-application', 'visa image requirements'],
  ['for-immigration', 'immigration image submissions'],
  ['for-online-forms', 'online form image fields'],
  ['for-scan-copy', 'scan copy upload optimization'],
  ['for-document-upload', 'document image upload'],
  ['for-gmail-attachment', 'Gmail image attachments'],
  ['for-outlook-attachment', 'Outlook image attachments'],
  ['under-20kb', 'strict low-size uploads'],
  ['under-50kb', 'small image upload limits'],
  ['under-100kb', 'common form photo limits'],
  ['under-200kb', 'moderate upload restrictions'],
  ['under-500kb', 'profile photo limits'],
  ['under-1mb', 'high-resolution upload control'],
  ['for-mobile', 'mobile-only compression'],
  ['for-android', 'Android image compression'],
  ['for-iphone', 'iPhone image compression'],
  ['on-windows', 'Windows desktop compression'],
  ['on-mac', 'Mac image compression'],
  ['batch-compression', 'batch processing workflows'],
  ['bulk-compress', 'bulk file reduction'],
  ['high-quality-compress', 'quality-first compression'],
  ['without-losing-quality', 'sharpness-safe compression'],
  ['fast-compression', 'quick compression workflow'],
  ['for-seo', 'SEO and Core Web Vitals'],
  ['for-page-speed', 'faster page load performance'],
  ['for-marketplace', 'marketplace image limits'],
  ['for-print', 'print asset optimization']
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

const makeCompressSection = (keyword, useCase) => `
    <section style="padding: 60px 0; background: #fff;">
        <div class="container" style="max-width: 820px; color: #334155; line-height: 1.7;">
            <h2 style="font-size: 26px; color: #0f172a; margin-bottom: 16px;">How to use ${keyword}</h2>
            <ol style="padding-left: 22px; margin-bottom: 30px;">
                <li>Upload your PDF file.</li>
                <li>Choose compression mode by quality target.</li>
                <li>Click Compress PDF and process instantly.</li>
                <li>Download your reduced-size PDF file.</li>
            </ol>

            <h2 style="font-size: 26px; color: #0f172a; margin-bottom: 12px;">Benefits</h2>
            <ul style="padding-left: 22px; margin-bottom: 30px;">
                <li>Built for ${useCase}.</li>
                <li>Fast browser-only workflow.</li>
                <li>Clear quality and size balance.</li>
                <li>Works on desktop and mobile.</li>
                <li>Private processing with no signup.</li>
            </ul>

            <h2 style="font-size: 26px; color: #0f172a; margin-bottom: 12px;">Related tools</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 14px;">
                <a href="merge-pdf.html" style="background:#eff6ff;color:#1d4ed8;padding:8px 14px;border-radius:8px;font-weight:600;">Merge PDF</a>
                <a href="split-pdf.html" style="background:#eff6ff;color:#1d4ed8;padding:8px 14px;border-radius:8px;font-weight:600;">Split PDF</a>
                <a href="pdf-to-image.html" style="background:#eff6ff;color:#1d4ed8;padding:8px 14px;border-radius:8px;font-weight:600;">PDF to Image</a>
            </div>
        </div>
    </section>`;

const makeImageSection = (keyword, useCase) => `
    <section style="padding: 40px 0; background: #fff;">
        <div class="container" style="max-width: 920px; color: #334155; line-height: 1.7;">
            <h2 style="font-size: 26px; color: #0f172a; margin-bottom: 12px;">How to use ${keyword}</h2>
            <ol style="padding-left: 22px; margin-bottom: 24px;">
                <li>Upload one or multiple images.</li>
                <li>Set quality level and preview output size.</li>
                <li>Click Compress Images and process files.</li>
                <li>Download compressed images instantly.</li>
            </ol>
            <p style="margin-bottom: 20px;">This page is optimized for ${useCase}. Keep visuals clear while reducing file size for faster upload and sharing.</p>
            <h2 style="font-size: 26px; color: #0f172a; margin-bottom: 12px;">Related tools</h2>
            <div style="display:flex;flex-wrap:wrap;gap:10px;">
                <a href="image-resize.html" style="background:#eff6ff;color:#1d4ed8;padding:8px 14px;border-radius:8px;font-weight:600;">Image Resize</a>
                <a href="format-converter.html" style="background:#eff6ff;color:#1d4ed8;padding:8px 14px;border-radius:8px;font-weight:600;">Format Converter</a>
                <a href="image-to-pdf.html" style="background:#eff6ff;color:#1d4ed8;padding:8px 14px;border-radius:8px;font-weight:600;">Image to PDF</a>
            </div>
        </div>
    </section>`;

const compressUrls = [];
for (const [slugPart, useCase] of compressCases) {
  const fileName = `compress-pdf-${slugPart}.html`;
  const keyword = `compress pdf ${slugPart.replace(/-/g, ' ')}`;
  const keywordTitle = toTitle(keyword);
  const pageUrl = `https://www.imgrunner.com/${fileName}`;

  const headCfg = {
    title: `${keywordTitle} Online Free | Fast Secure PDF Compression | Image Runner`,
    metaDescription: `${keywordTitle} online free. Reduce PDF size for ${useCase}. Fast browser compression with instant download.`,
    keywords: `${keyword}, reduce pdf size, pdf compressor online, compress pdf file`,
    url: pageUrl,
    ogTitle: `${keywordTitle} Online Free | Compress PDF Fast`,
    ogDescription: `${keywordTitle} with browser-based private workflow.`,
    twitterTitle: `${keywordTitle} Online Free | Image Runner`,
    twitterDescription: `${keywordTitle} quickly in your browser.`
  };

  let page = updateHead(compressTemplate, headCfg);
  page = page.replace(/<h1 class="upload-title">[\s\S]*?<\/h1>/, `<h1 class="upload-title">${keywordTitle}</h1>`);
  page = page.replace(/<p class="upload-desc">[\s\S]*?<\/p>/, `<p class="upload-desc">Need to ${keyword} quickly? This page helps you reduce file size for ${useCase} while keeping readable quality and fast delivery.</p>`);
  page = page.replace(/<section style="padding: 60px 0; background: #fff;">[\s\S]*?<\/section>/, makeCompressSection(keyword, useCase));

  fs.writeFileSync(path.join(root, fileName), page, 'utf8');
  compressUrls.push(fileName);
}

const imageUrls = [];
for (const [slugPart, useCase] of imageCases) {
  const fileName = `image-compress-${slugPart}.html`;
  const keyword = `compress image ${slugPart.replace(/-/g, ' ')}`;
  const keywordTitle = toTitle(keyword);
  const pageUrl = `https://www.imgrunner.com/${fileName}`;

  const headCfg = {
    title: `${keywordTitle} Online Free | Fast Image Compression | Image Runner`,
    metaDescription: `${keywordTitle} online free. Reduce image size for ${useCase} with clear output and quick download.`,
    keywords: `${keyword}, image compressor online, reduce image size, optimize image`,
    url: pageUrl,
    ogTitle: `${keywordTitle} Online Free | Compress Images Fast`,
    ogDescription: `${keywordTitle} with private browser-based compression.`,
    twitterTitle: `${keywordTitle} Online Free | Image Runner`,
    twitterDescription: `${keywordTitle} instantly in your browser.`
  };

  let page = updateHead(imageTemplate, headCfg);
  page = page.replace(/<h1 class="upload-title">[\s\S]*?<\/h1>/, `<h1 class="upload-title">${keywordTitle}</h1>`);
  page = page.replace(/<p class="upload-desc">[\s\S]*?<\/p>/, `<p class="upload-desc">Need to ${keyword}? Compress photos for ${useCase} with better size control and clean quality for uploads and sharing.</p>`);
  page = page.replace(/<section style="padding: 40px 0; background: #fff;">[\s\S]*?<\/section>\s*<!-- Footer -->/, `${makeImageSection(keyword, useCase)}\n\n    <!-- Footer -->`);

  fs.writeFileSync(path.join(root, fileName), page, 'utf8');
  imageUrls.push(fileName);
}

const buildHub = (title, url, intro, links, openTool) => {
  const linkList = links
    .slice()
    .sort()
    .map((file) => {
      const label = toTitle(file.replace('.html', '').replace(/^(compress-pdf|image-compress)-/, '').replace(/-/g, ' '));
      const prefix = file.startsWith('compress-pdf-') ? 'Compress PDF ' : 'Compress Image ';
      return `                        <li><a href="${file}" style="display:block;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;color:#1d4ed8;text-decoration:none;font-weight:600;">${prefix}${label}</a></li>`;
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
                <a href="compress-pdf.html" class="nav__link">Compress PDF</a>
                <a href="image-compress.html" class="nav__link">Image Compress</a>
                <a href="merge-pdf.html" class="nav__link">Merge PDF</a>
                <a href="pdf-to-image.html" class="nav__link">PDF to Image</a>
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
                    <a href="merge-pdf.html" style="background:#eff6ff;color:#1d4ed8;padding:10px 14px;border-radius:8px;font-weight:600;text-decoration:none;">Merge PDF</a>
                    <a href="split-pdf.html" style="background:#eff6ff;color:#1d4ed8;padding:10px 14px;border-radius:8px;font-weight:600;text-decoration:none;">Split PDF</a>
                    <a href="pdf-to-image.html" style="background:#eff6ff;color:#1d4ed8;padding:10px 14px;border-radius:8px;font-weight:600;text-decoration:none;">PDF to Image</a>
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

const compressHub = buildHub(
  'Compress PDF Use Cases',
  'https://www.imgrunner.com/compress-pdf-use-cases.html',
  'This authority hub lists 50 targeted Compress PDF pages for email, forms, jobs, portals, and mobile workflows. Pick the exact use case and compress files faster with intent-matched guidance.',
  compressUrls,
  'compress-pdf.html'
);
fs.writeFileSync(path.join(root, 'compress-pdf-use-cases.html'), compressHub, 'utf8');

const imageHub = buildHub(
  'Image Compress Use Cases',
  'https://www.imgrunner.com/image-compress-use-cases.html',
  'This authority hub lists 50 targeted Image Compress pages for social media, forms, websites, and specific KB/MB limits. Open the right use-case page and optimize images with faster workflow.',
  imageUrls,
  'image-compress.html'
);
fs.writeFileSync(path.join(root, 'image-compress-use-cases.html'), imageHub, 'utf8');

let sitemap = fs.readFileSync(sitemapPath, 'utf8');
const urlsToAdd = [
  ...compressUrls,
  ...imageUrls,
  'compress-pdf-use-cases.html',
  'image-compress-use-cases.html'
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

console.log(`Generated ${compressUrls.length} compress-pdf pages, ${imageUrls.length} image-compress pages, and 2 hubs.`);
