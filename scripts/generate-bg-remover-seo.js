const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const templatePath = path.join(root, 'background-remover.html');
const sitemapPath = path.join(root, 'sitemap.xml');
const siteOrigin = 'https://www.imgrunner.com';
const today = new Date().toISOString().slice(0, 10);

const template = fs.readFileSync(templatePath, 'utf8');

const baseCases = [
  { slug: 'for-ecommerce-products', keywordTitle: 'Background Remover for Ecommerce Products', description: 'Remove background for ecommerce product photos with clean cutouts and transparent PNG export for marketplaces and stores.', useCase: 'ecommerce product listings, marketplace uploads, and catalog-ready product images' },
  { slug: 'for-passport-photo', keywordTitle: 'Background Remover for Passport Photo', description: 'Remove background for passport photos and create clean background-ready outputs for application workflows.', useCase: 'passport forms, visa forms, and official ID photo preparation' },
  { slug: 'for-linkedin-profile', keywordTitle: 'Background Remover for LinkedIn Profile', description: 'Remove background for LinkedIn profile images and create polished, professional profile visuals quickly.', useCase: 'LinkedIn profile photos, personal branding, and career profile updates' },
  { slug: 'for-instagram-creator', keywordTitle: 'Background Remover for Instagram Creator', description: 'Remove background for Instagram creator photos and create transparent cutouts for stories, reels, and covers.', useCase: 'Instagram stories, creator assets, and social cutout graphics' },
  { slug: 'for-logo-cutout', keywordTitle: 'Background Remover for Logo Cutout', description: 'Remove background from logos and export transparent logo assets for websites, presentations, and branding.', useCase: 'logo cleanup, transparent branding assets, and design workflows' },
  { slug: 'for-id-card-photo', keywordTitle: 'Background Remover for ID Card Photo', description: 'Remove background for ID card photos and generate cleaner portraits for card and profile formats.', useCase: 'ID card photos, employee cards, and school or college profile IDs' },
  { slug: 'for-youtube-thumbnail-subject', keywordTitle: 'Background Remover for YouTube Thumbnail Subject', description: 'Remove background from subject photos for YouTube thumbnails and compose high-CTR thumbnail visuals.', useCase: 'YouTube thumbnail subject cutouts and creator workflow assets' },
  { slug: 'for-product-ad-creatives', keywordTitle: 'Background Remover for Product Ad Creatives', description: 'Remove background for product ad creatives and build cleaner performance marketing visuals faster.', useCase: 'ad creatives for Meta, Google, and ecommerce campaigns' },
  { slug: 'for-white-background', keywordTitle: 'Background Remover for White Background', description: 'Remove background and place subjects on white background for marketplace and portfolio-ready photos.', useCase: 'white background photos for ecommerce and official uploads' },
  { slug: 'for-transparent-png', keywordTitle: 'Background Remover for Transparent PNG', description: 'Remove background and export transparent PNG images for websites, overlays, and design use.', useCase: 'transparent PNG exports for web, design, and content creation' }
];

const extraCases = [
  { slug: 'for-amazon-listing', keywordTitle: 'Background Remover for Amazon Listing', description: 'Remove background for Amazon listing photos and create cleaner product visuals for marketplace compliance.', useCase: 'Amazon product listing images and white-background catalog uploads' },
  { slug: 'for-shopify-store', keywordTitle: 'Background Remover for Shopify Store', description: 'Remove background for Shopify product photos and create conversion-focused storefront visuals.', useCase: 'Shopify product cards, collection grids, and hero product highlights' },
  { slug: 'for-flipkart-listing', keywordTitle: 'Background Remover for Flipkart Listing', description: 'Remove background for Flipkart listing photos and prepare cleaner marketplace-ready assets.', useCase: 'Flipkart product listings and catalog image standards' },
  { slug: 'for-etsy-product', keywordTitle: 'Background Remover for Etsy Product', description: 'Remove background for Etsy product photos and build premium listing visuals for handmade brands.', useCase: 'Etsy store product imagery and creative listing assets' },
  { slug: 'for-food-delivery-menu', keywordTitle: 'Background Remover for Food Delivery Menu', description: 'Remove background for food photos and create menu-ready visuals for delivery platforms.', useCase: 'restaurant menus, food delivery apps, and promo creatives' },
  { slug: 'for-real-estate-listing', keywordTitle: 'Background Remover for Real Estate Listing', description: 'Remove background for agent portraits and listing graphics to create cleaner property marketing creatives.', useCase: 'real estate listing banners, agent profile cards, and social posts' },
  { slug: 'for-car-dealer-listing', keywordTitle: 'Background Remover for Car Dealer Listing', description: 'Remove background from car and dealer subject photos for polished auto listing graphics.', useCase: 'auto dealer listings, inventory cards, and promotional creatives' },
  { slug: 'for-fashion-portfolio', keywordTitle: 'Background Remover for Fashion Portfolio', description: 'Remove background for fashion portraits and create cleaner model portfolio assets.', useCase: 'fashion portfolio images, model cards, and agency presentations' },
  { slug: 'for-wedding-photo-edit', keywordTitle: 'Background Remover for Wedding Photo Edit', description: 'Remove background for wedding subject photos and create elegant cutouts for albums and invites.', useCase: 'wedding album design, invitation graphics, and event creatives' },
  { slug: 'for-school-id-card', keywordTitle: 'Background Remover for School ID Card', description: 'Remove background for school ID card photos and prepare clean student profile images.', useCase: 'school ID cards, student profile systems, and admin uploads' },
  { slug: 'for-college-admission-photo', keywordTitle: 'Background Remover for College Admission Photo', description: 'Remove background for college admission photos to match portal requirements and cleaner profile output.', useCase: 'college admissions, student portal forms, and document workflows' },
  { slug: 'for-job-application-photo', keywordTitle: 'Background Remover for Job Application Photo', description: 'Remove background for job application photos and create professional profile-ready portraits.', useCase: 'job portals, professional profile uploads, and HR submissions' },
  { slug: 'for-resume-profile-photo', keywordTitle: 'Background Remover for Resume Profile Photo', description: 'Remove background for resume profile photos and improve first impression with clean portraits.', useCase: 'resume photos, CV profiles, and professional portfolio pages' },
  { slug: 'for-whatsapp-dp', keywordTitle: 'Background Remover for WhatsApp DP', description: 'Remove background for WhatsApp display pictures and create standout profile visuals.', useCase: 'WhatsApp profile images, creator branding, and personal profile assets' },
  { slug: 'for-podcast-cover', keywordTitle: 'Background Remover for Podcast Cover', description: 'Remove background for podcast host images and build cleaner cover artwork quickly.', useCase: 'podcast cover design, Spotify artwork, and host branding' },
  { slug: 'for-blog-featured-image', keywordTitle: 'Background Remover for Blog Featured Image', description: 'Remove background for blog featured visuals and create cleaner editorial thumbnails.', useCase: 'blog featured images, article hero banners, and editorial graphics' },
  { slug: 'for-web-banner-design', keywordTitle: 'Background Remover for Web Banner Design', description: 'Remove background for web banner subjects and build cleaner, high-contrast banners.', useCase: 'website hero banners, campaign headers, and landing page assets' },
  { slug: 'for-presentation-slides', keywordTitle: 'Background Remover for Presentation Slides', description: 'Remove background for speaker and product images for cleaner presentation slides.', useCase: 'PowerPoint slides, pitch decks, and keynote visual assets' },
  { slug: 'for-print-ready-cutout', keywordTitle: 'Background Remover for Print Ready Cutout', description: 'Remove background for print-ready cutouts used in posters, brochures, and standees.', useCase: 'print design workflows, DTP projects, and promotional materials' },
  { slug: 'for-sticker-design', keywordTitle: 'Background Remover for Sticker Design', description: 'Remove background for sticker artwork and generate transparent assets for print and digital packs.', useCase: 'sticker packs, merch artwork, and creator products' },
  { slug: 'for-meme-template', keywordTitle: 'Background Remover for Meme Template', description: 'Remove background for meme subjects and build reusable template cutouts quickly.', useCase: 'meme template creation, social engagement posts, and content ideation' },
  { slug: 'for-game-avatar', keywordTitle: 'Background Remover for Game Avatar', description: 'Remove background for game avatars and build clean profile assets for gaming communities.', useCase: 'gaming profile images, avatar design, and creator branding' },
  { slug: 'for-discord-profile', keywordTitle: 'Background Remover for Discord Profile', description: 'Remove background for Discord profile pictures and create cleaner server identity visuals.', useCase: 'Discord avatars, server branding, and community profiles' },
  { slug: 'for-twitch-thumbnail', keywordTitle: 'Background Remover for Twitch Thumbnail', description: 'Remove background for Twitch thumbnails and stream promo creatives.', useCase: 'Twitch thumbnails, stream covers, and gaming campaign graphics' },
  { slug: 'for-facebook-ads', keywordTitle: 'Background Remover for Facebook Ads', description: 'Remove background for Facebook ad creatives and design cleaner performance ads.', useCase: 'Meta ad creatives, product campaigns, and social conversion funnels' },
  { slug: 'for-instagram-ads', keywordTitle: 'Background Remover for Instagram Ads', description: 'Remove background for Instagram ad creatives and improve visual focus on subject and offer.', useCase: 'Instagram feed ads, story ads, and creator campaign visuals' },
  { slug: 'for-google-display-ads', keywordTitle: 'Background Remover for Google Display Ads', description: 'Remove background for Google display ad assets and create cleaner campaign graphics.', useCase: 'display ad creatives, banner variants, and PPC asset workflows' },
  { slug: 'for-marketplace-bulk-photos', keywordTitle: 'Background Remover for Marketplace Bulk Photos', description: 'Remove background for marketplace bulk photos and produce consistent listing visuals at scale.', useCase: 'bulk marketplace catalogs and large inventory image workflows' },
  { slug: 'for-product-catalog', keywordTitle: 'Background Remover for Product Catalog', description: 'Remove background for product catalog photography and create consistent catalog-ready assets.', useCase: 'catalog production, product brochures, and ecommerce collections' },
  { slug: 'for-brand-poster-design', keywordTitle: 'Background Remover for Brand Poster Design', description: 'Remove background for poster subjects and create premium brand poster layouts.', useCase: 'brand campaign posters, launch creatives, and event marketing' }
];

const cases = [...baseCases, ...extraCases];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getCategory(slug) {
  if (/(amazon|shopify|flipkart|etsy|marketplace|catalog|ecommerce)/.test(slug)) return 'Ecommerce';
  if (/(passport|id-card|school|college|job|resume)/.test(slug)) return 'Professional Profiles';
  if (/(facebook|instagram|google|thumbnail|banner|ads|podcast|blog)/.test(slug)) return 'Marketing and Creator';
  if (/(sticker|meme|avatar|discord|twitch|logo|print|poster)/.test(slug)) return 'Design and Creative';
  return 'Business Workflows';
}

function buildKeywords(entry) {
  return [
    entry.keywordTitle.toLowerCase(),
    `best ${entry.keywordTitle.toLowerCase()}`,
    'ai background remover',
    'remove image background online',
    'transparent png maker',
    'free background remover tool'
  ].join(', ');
}

function updateHead(content, cfg) {
  let out = content;
  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(cfg.title)}</title>`);
  out = out.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeHtml(cfg.metaDescription)}">`);
  out = out.replace(/<meta name="keywords" content="[^"]*">/, `<meta name="keywords" content="${escapeHtml(cfg.keywords)}">`);
  out = out.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${escapeHtml(cfg.url)}">`);
  out = out.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escapeHtml(cfg.ogTitle)}">`);
  out = out.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escapeHtml(cfg.ogDescription)}">`);
  out = out.replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${escapeHtml(cfg.twitterTitle)}">`);
  out = out.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${escapeHtml(cfg.twitterDescription)}">`);
  out = out.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${escapeHtml(cfg.url)}">`);
  return out;
}

function injectStructuredData(content, graph) {
  const json = JSON.stringify(graph).replace(/<\//g, '<\\/');
  return content.replace('</head>', `    <script type="application/ld+json">${json}</script>\n</head>`);
}

function getRelated(slug) {
  const currentIndex = cases.findIndex((item) => item.slug === slug);
  const prev = cases[(currentIndex - 1 + cases.length) % cases.length];
  const next = cases[(currentIndex + 1) % cases.length];
  const cross = cases[(currentIndex + 7) % cases.length];
  const extra = cases[(currentIndex + 13) % cases.length];
  return [prev, next, cross, extra];
}

function getFaqs(entry) {
  return [
    {
      q: `Is ${entry.keywordTitle.toLowerCase()} free to use?`,
      a: `Yes, this workflow is free and runs directly in your browser with no server upload.`
    },
    {
      q: `What output format should I use for ${entry.useCase}?`,
      a: 'Use transparent PNG when you need flexible overlays, and JPG when you want lightweight, solid background exports.'
    },
    {
      q: 'How can I get sharper edges after removing background?',
      a: 'Upload a high-contrast photo, then use edge softness and foreground strength controls for cleaner cutouts.'
    }
  ];
}

function buildFaqHtml(entry) {
  return getFaqs(entry)
    .map((item) => `
                    <details style="border:1px solid #dbeafe;border-radius:10px;padding:10px 12px;background:#f8fbff;">
                        <summary style="font-weight:700;color:#1e3a8a;cursor:pointer;">${escapeHtml(item.q)}</summary>
                        <p style="margin:8px 0 0;color:#334155;line-height:1.7;">${escapeHtml(item.a)}</p>
                    </details>`)
    .join('');
}

function buildSeoSection(entry) {
  const related = getRelated(entry.slug);
  const relatedLinks = related
    .map((item) => `<a href="background-remover-${item.slug}.html" style="display:block;padding:10px 12px;border:1px solid #dbeafe;border-radius:10px;background:#f8fbff;color:#1d4ed8;text-decoration:none;font-weight:600;">${escapeHtml(item.keywordTitle)}</a>`)
    .join('');

  const category = getCategory(entry.slug);

  return `
        <section style="padding: 12px 0 18px;">
            <article class="panel" style="margin-bottom:14px;">
                <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#2563eb;font-weight:700;">${escapeHtml(category)} Use Case</p>
                <h2 style="margin:0 0 10px;font-size:24px;">${escapeHtml(entry.keywordTitle)}</h2>
                <p style="margin:0;color:#475569;line-height:1.75;">${escapeHtml(entry.description)} This workflow is ideal for ${escapeHtml(entry.useCase)}.</p>
            </article>

            <article class="panel" style="margin-bottom:14px;">
                <h3 style="margin:0 0 10px;font-size:18px;">How To Get Best Results</h3>
                <ol style="margin:0;padding-left:18px;color:#334155;line-height:1.8;">
                    <li>Upload a clear source image with subject-background contrast.</li>
                    <li>Click Remove Background and wait for AI edge refinement.</li>
                    <li>Adjust edge softness and foreground strength for cleaner output.</li>
                    <li>Export as transparent PNG or custom background JPG based on channel needs.</li>
                </ol>
                <p style="margin:10px 0 0;color:#475569;line-height:1.75;">For teams running production pipelines, this page helps standardize outputs and reduce manual editing time.</p>
            </article>

            <article class="panel" style="margin-bottom:14px;">
                <h3 style="margin:0 0 10px;font-size:18px;">Revenue-Focused Workflow Tips</h3>
                <ul style="margin:0;padding-left:18px;color:#334155;line-height:1.8;">
                    <li>Use consistent cutout style across listings to improve visual trust and conversion.</li>
                    <li>Create multiple variants from one subject image for ads, social, and marketplace uploads.</li>
                    <li>Keep transparent PNG master files so new campaigns can be launched faster.</li>
                </ul>
            </article>

            <article class="panel" style="margin-bottom:14px;">
                <h3 style="margin:0 0 10px;font-size:18px;">Related Use Cases</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;">
                    ${relatedLinks}
                </div>
                <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px;">
                    <a href="background-remover-use-cases.html" style="padding:10px 14px;border-radius:10px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;">All BG Remover Use Cases</a>
                    <a href="background-remover.html" style="padding:10px 14px;border-radius:10px;background:#eff6ff;color:#1d4ed8;text-decoration:none;font-weight:700;">Open Main Tool</a>
                </div>
            </article>

            <article class="panel">
                <h3 style="margin:0 0 10px;font-size:18px;">FAQ</h3>
                <div style="display:grid;gap:10px;">
                    ${buildFaqHtml(entry)}
                </div>
            </article>
        </section>`;
}

function buildPageSchema(entry, fileName) {
  const pageUrl = `${siteOrigin}/${fileName}`;
  const faqs = getFaqs(entry);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${pageUrl}#app`,
        name: entry.keywordTitle,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        },
        url: pageUrl,
        publisher: {
          '@type': 'Organization',
          name: 'Image Runner',
          url: siteOrigin
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Image Runner',
            item: `${siteOrigin}/index.html`
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Background Remover Use Cases',
            item: `${siteOrigin}/background-remover-use-cases.html`
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: entry.keywordTitle,
            item: pageUrl
          }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a
          }
        }))
      }
    ]
  };
}

function buildHubPage() {
  const links = cases
    .map((entry) => `<a href="background-remover-${entry.slug}.html" style="display:block;padding:10px 12px;border:1px solid #dbeafe;border-radius:10px;background:#f8fbff;color:#1d4ed8;text-decoration:none;font-weight:600;">${escapeHtml(entry.keywordTitle)}</a>`)
    .join('\n');

  const categoryStats = {};
  for (const entry of cases) {
    const category = getCategory(entry.slug);
    categoryStats[category] = (categoryStats[category] || 0) + 1;
  }

  const statsHtml = Object.entries(categoryStats)
    .map(([label, count]) => `<div style="border:1px solid #dbeafe;border-radius:10px;background:#f8fbff;padding:12px;"><p style="margin:0;color:#1e3a8a;font-weight:700;">${escapeHtml(label)}</p><p style="margin:6px 0 0;color:#334155;">${count} intent pages</p></div>`)
    .join('');

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Background Remover Use Cases',
    itemListElement: cases.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.keywordTitle,
      url: `${siteOrigin}/background-remover-${entry.slug}.html`
    }))
  };

  const schemaTag = JSON.stringify(itemListSchema).replace(/<\//g, '<\\/');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Background Remover Use Cases | ${cases.length} Revenue Intent Pages | Image Runner</title>
    <meta name="description" content="Explore ${cases.length} high-intent background remover use-case pages built for ecommerce, creator workflows, advertising, and business growth.">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${siteOrigin}/background-remover-use-cases.html">
    <meta property="og:title" content="Background Remover Use Cases | ${cases.length} Revenue Intent Pages">
    <meta property="og:description" content="Find the best background remover workflow page based on commercial use-case intent.">
    <link rel="canonical" href="${siteOrigin}/background-remover-use-cases.html">
    <link rel="stylesheet" href="css/background-remover.css">
    <script type="application/ld+json">${schemaTag}</script>
</head>
<body>
    <header class="topbar">
        <div class="shell topbar__row">
            <a href="index.html" class="brand" aria-label="Image Runner Home">
                <span class="brand__dot"></span>
                <span>Image Runner</span>
            </a>
            <nav class="topbar__nav" aria-label="Primary">
                <a href="background-remover.html">BG Remove</a>
                <a href="image-resize.html">Resize</a>
                <a href="image-compress.html">Compress</a>
            </nav>
        </div>
    </header>

    <main class="shell workspace" style="padding-top:28px;">
        <section class="hero" style="margin-bottom:14px;">
            <p class="hero__kicker">USE CASE HUB</p>
            <h1>Background Remover Use Cases</h1>
            <p>${cases.length} commercial-intent pages to capture targeted search demand and route visitors into your core tool.</p>
        </section>

        <section class="panel" style="margin-bottom:14px;">
            <h2 style="margin:0 0 10px;font-size:22px;">Intent Coverage Snapshot</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;">${statsHtml}</div>
        </section>

        <section class="panel" style="display:grid;gap:10px;">
            ${links}
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;">
                <a href="background-remover.html" class="btn btn--primary" style="text-decoration:none;text-align:center;">Open Main Background Remover</a>
                <a href="index.html" class="btn" style="text-decoration:none;text-align:center;">Back to Home</a>
            </div>
        </section>
    </main>

    <script src="js/bug-report.js" defer></script>
</body>
</html>`;
}

const generated = [];
for (const entry of cases) {
  const fileName = `background-remover-${entry.slug}.html`;
  const pageUrl = `${siteOrigin}/${fileName}`;

  let page = updateHead(template, {
    title: `${entry.keywordTitle} Online Free | Image Runner`,
    metaDescription: entry.description,
    keywords: buildKeywords(entry),
    url: pageUrl,
    ogTitle: `${entry.keywordTitle} | Image Runner`,
    ogDescription: entry.description,
    twitterTitle: `${entry.keywordTitle} | Image Runner`,
    twitterDescription: entry.description
  });

  page = page.replace(/<h1>[\s\S]*?<\/h1>/, `<h1>${escapeHtml(entry.keywordTitle)}</h1>`);
  page = page.replace(/<\/section>\s*<section class="grid">/, `</section>\n${buildSeoSection(entry)}\n\n        <section class="grid">`);
  page = injectStructuredData(page, buildPageSchema(entry, fileName));

  fs.writeFileSync(path.join(root, fileName), page, 'utf8');
  generated.push(fileName);
}

const hubName = 'background-remover-use-cases.html';
fs.writeFileSync(path.join(root, hubName), buildHubPage(), 'utf8');

let sitemap = fs.readFileSync(sitemapPath, 'utf8');
const urls = [...generated, hubName].map((name) => `${siteOrigin}/${name}`);

for (const url of urls) {
  if (sitemap.includes(`<loc>${url}</loc>`)) continue;
  const priority = url.endsWith('background-remover-use-cases.html') ? '0.8' : '0.7';
  const node = `\n  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  sitemap = sitemap.replace('</urlset>', `${node}\n</urlset>`);
}

fs.writeFileSync(sitemapPath, sitemap, 'utf8');

console.log(`Generated ${generated.length} background remover SEO pages + 1 hub.`);
