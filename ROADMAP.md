# ImgRunner — World Best Single Tool Roadmap

Reference: `Downloads/ImgRunner-Redesign-Strategy.md`

## Phase 1 (0–6 weeks) — Core Differentiation
- [ ] Move resize/compress engine fully client-side (Canvas API + Web Worker)
- [ ] Add WASM codecs (jSquash / Squoosh) for JPG/PNG/WebP/AVIF
- [ ] "Resize to exact file size" (KB/MB) mode — binary search on quality
- [x] **One-click preset buttons** (DONE via `js/presets.js`)
  - [x] Social: WhatsApp DP, Instagram Post/Story/Reel, Facebook Cover, YouTube Thumbnail, LinkedIn Banner
  - [x] India govt: Passport Photo, PAN Card, Aadhaar Photo
  - [x] Exams: SSC, UPSC, Railway (RRB), Bank PO
  - [x] Auto-inject: no edits to index.html needed, MutationObserver picks up upload
  - [x] Toast confirmation: "✅ Applied: <preset> (<w>×<h>)"
  - [x] Glassmorphism UI, dark/light theme support, mobile responsive
- [ ] Trust badges on homepage: "Processed on your device", "No login · No watermark · No limits"
- [ ] Update tagline: "The fastest, most private, completely free image resizer — in your language"
- [ ] Basic PWA (manifest + service worker, offline after first load)
- [ ] Launch English + Hindi (i18n.js already exists)

## Phase 2 (6–14 weeks) — Scale & Monetize
- [ ] Tier 1 languages: Spanish, Portuguese, Indonesian, French, Arabic (with hreflang)
- [ ] 50–100 programmatic landing pages (dimensions, platforms, govt forms)
- [ ] Non-intrusive AdSense placements (sidebar/below-fold only)
- [ ] Batch mode — multi-image upload + ZIP download (no count cap)
- [ ] EXIF/GPS metadata strip toggle
- [ ] Dark mode polish
- [ ] Live before/after preview slider

## Phase 3 (14–26 weeks) — Compound Growth
- [ ] Tier 2/3 languages (German, Russian, Bengali, Tamil, Telugu, Marathi, Urdu, Vietnamese, Turkish, Italian, Japanese, Korean, Chinese, Thai, Filipino)
- [ ] Chrome/Edge browser extension (right-click "Resize with ImgRunner")
- [ ] HEIC input support (iPhone photos)
- [ ] Embeddable widget for bloggers
- [ ] Optional B2B/API tier (does not touch free consumer tool)
- [ ] Content pushes around exam seasons (Reels/Shorts)
- [ ] Product Hunt / AlternativeTo / SaaSHub / BetaList launch
- [ ] Crop + aspect ratio presets (1:1, 4:5, 16:9, 9:16)
- [ ] Web Share API (share to WhatsApp/Instagram)
- [ ] Paste from clipboard / paste image URL

## KPIs
- [ ] Monthly active users / unique resizes
- [ ] Organic sessions & programmatic page rankings
- [ ] Bounce rate & time-on-tool
- [ ] Mobile vs desktop traffic %
- [ ] PWA installs
- [ ] Ad RPM / total ad revenue
- [ ] Indexed pages per language
- [ ] Share-button usage
