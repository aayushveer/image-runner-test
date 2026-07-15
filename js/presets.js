/**
 * presets.js — One-click preset buttons for common resize targets
 *
 * Drop-in: include <script src="js/presets.js" defer></script> in HTML.
 * Auto-injects CSS, HTML, and behavior into #presets-anchor when present.
 *
 * Workflow:
 *   1. User clicks a preset button
 *   2. We store the chosen dimensions in window.__pendingPreset
 *   3. We trigger the existing file picker
 *   4. resize-v4.js applies the pending preset after the images are loaded
 *   5. A toast confirms the preset was applied
 */

(function () {
    'use strict';

    // ---------- PRESET DATA ----------
    // Common, widely-used dimensions for Indian users
    const PRESETS = {
        social: [
            { icon: '💬', name: 'WhatsApp DP',    w: 500,  h: 500,  hint: '500 × 500' },
            { icon: '📸', name: 'Instagram Post', w: 1080, h: 1080, hint: '1080 × 1080' },
            { icon: '📱', name: 'Insta Story',    w: 1080, h: 1920, hint: '1080 × 1920' },
            { icon: '🎬', name: 'Insta Reel',     w: 1080, h: 1920, hint: '1080 × 1920' },
            { icon: '📘', name: 'Facebook Cover', w: 820,  h: 312,  hint: '820 × 312' },
            { icon: '▶️', name: 'YouTube Thumb',  w: 1280, h: 720,  hint: '1280 × 720' },
            { icon: '💼', name: 'LinkedIn Banner',w: 1584, h: 396,  hint: '1584 × 396' }
        ],
        govt: [
            { icon: '🛂', name: 'Passport Photo', w: 413, h: 531, hint: '413 × 531 (35×45mm)' },
            { icon: '🪪', name: 'PAN Card Photo', w: 200, h: 230, hint: '200 × 230' },
            { icon: '🇮🇳', name: 'Aadhaar Photo', w: 200, h: 240, hint: '200 × 240' }
        ],
        exams: [
            { icon: '📝', name: 'SSC Form Photo', w: 200, h: 230, hint: '200 × 230 (20–50KB)' },
            { icon: '🏛️', name: 'UPSC Photo',    w: 350, h: 350, hint: '350 × 350 (20–300KB)' },
            { icon: '🚂', name: 'Railway (RRB)',  w: 200, h: 230, hint: '200 × 230 (20–50KB)' },
            { icon: '🏦', name: 'Bank PO Photo',  w: 200, h: 230, hint: '200 × 230 (20–50KB)' }
        ]
    };

    // ---------- CSS (scoped under .preset-section) ----------
    const CSS = `
        .preset-section {
            max-width: 1100px;
            margin: 2.5rem auto 3rem;
            padding: 0 1rem;
            animation: slideInUp 0.8s ease-out 0.25s both;
        }
        .preset-section .preset-heading {
            text-align: center;
            margin-bottom: 1.25rem;
        }
        .preset-section .preset-heading h2 {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 0.35rem;
        }
        .preset-section .preset-heading p {
            color: var(--text-tertiary);
            font-size: 0.95rem;
        }
        .preset-section .preset-group {
            margin-bottom: 1.5rem;
        }
        .preset-section .preset-group-title {
            font-size: 0.78rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--text-tertiary);
            margin-bottom: 0.75rem;
            padding-left: 0.25rem;
        }
        .preset-section .preset-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 0.75rem;
        }
        .preset-section .preset-btn {
            background: rgba(30, 41, 59, 0.6);
            border: 1px solid rgba(148, 163, 184, 0.15);
            border-radius: 12px;
            padding: 1rem 0.75rem;
            backdrop-filter: blur(20px);
            cursor: pointer;
            transition: all 0.25s ease;
            text-align: center;
            font-family: inherit;
            color: var(--text-primary);
        }
        html.light-theme .preset-section .preset-btn {
            background: rgba(241, 245, 249, 0.7);
            border-color: rgba(71, 85, 105, 0.15);
        }
        .preset-section .preset-btn:hover {
            transform: translateY(-3px);
            border-color: var(--accent-blue);
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.2);
            background: rgba(59, 130, 246, 0.12);
        }
        html.light-theme .preset-section .preset-btn:hover {
            background: rgba(37, 99, 235, 0.1);
            box-shadow: 0 10px 25px rgba(37, 99, 235, 0.15);
        }
        .preset-section .preset-btn:active {
            transform: translateY(-1px);
        }
        .preset-section .preset-icon {
            font-size: 1.6rem;
            display: block;
            margin-bottom: 0.4rem;
        }
        .preset-section .preset-name {
            font-size: 0.88rem;
            font-weight: 600;
            margin-bottom: 0.2rem;
        }
        .preset-section .preset-hint {
            font-size: 0.72rem;
            color: var(--text-tertiary);
            font-family: 'Space Mono', monospace;
        }
        @media (max-width: 640px) {
            .preset-section .preset-grid {
                grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
            }
            .preset-section .preset-btn { padding: 0.85rem 0.5rem; }
        }
    `;

    // ---------- HTML BUILDER ----------
    function buildSection() {
        const section = document.createElement('section');
        section.className = 'preset-section';
        section.setAttribute('aria-label', 'One-click resize presets');
        section.innerHTML = `
            <div class="preset-heading">
                <h2><span aria-hidden="true">⚡</span> <span data-i18n="presets.title">One-click presets</span></h2>
                <p data-i18n="presets.subtitle">Passport · Instagram · WhatsApp DP · Aadhaar · UPSC</p>
            </div>
            <div class="preset-group">
                <div class="preset-group-title">🌐 Social Media</div>
                <div class="preset-grid">${renderButtons(PRESETS.social)}</div>
            </div>
            <div class="preset-group">
                <div class="preset-group-title">🇮🇳 Indian Govt ID &amp; Forms</div>
                <div class="preset-grid">${renderButtons(PRESETS.govt)}</div>
            </div>
            <div class="preset-group">
                <div class="preset-group-title">📚 Government Exams</div>
                <div class="preset-grid">${renderButtons(PRESETS.exams)}</div>
            </div>
        `;
        return section;
    }

    function renderButtons(list) {
        return list.map(p => `
            <button type="button" class="preset-btn"
                    data-w="${p.w}" data-h="${p.h}"
                    data-name="${p.name}"
                    aria-label="Resize for ${p.name}">
                <span class="preset-icon">${p.icon}</span>
                <span class="preset-name">${p.name}</span>
                <span class="preset-hint">${p.hint}</span>
            </button>
        `).join('');
    }

    // ---------- INJECT CSS ----------
    function injectCSS() {
        if (document.getElementById('preset-section-styles')) return;
        const style = document.createElement('style');
        style.id = 'preset-section-styles';
        style.textContent = CSS;
        document.head.appendChild(style);
    }

    // ---------- CLICK HANDLER ----------
    function setupHandlers(section) {
        section.addEventListener('click', (e) => {
            const btn = e.target.closest('.preset-btn');
            if (!btn) return;

            const w = parseInt(btn.dataset.w, 10);
            const h = parseInt(btn.dataset.h, 10);
            const name = btn.dataset.name;

            // Stash pending preset
            window.__pendingPreset = { w, h, name };
            window.dispatchEvent(new CustomEvent('imagerunner:presetselected', {
                detail: window.__pendingPreset
            }));

            // Visual feedback
            btn.style.transform = 'scale(0.96)';
            setTimeout(() => { btn.style.transform = ''; }, 120);

            // Open file picker — existing flow handles upload
            const fileInput = document.getElementById('file-input');
            if (fileInput) fileInput.click();
        });
    }

    // ---------- INIT ----------
    function init() {
        injectCSS();

        const section = buildSection();

        const anchor = document.getElementById('presets-anchor');

        if (anchor) {
            anchor.replaceChildren(section);
        } else {
            const main = document.querySelector('main');
            if (main) main.prepend(section);
        }

        setupHandlers(section);
        window.ImageRunnerI18n?.applyTranslations(section);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
