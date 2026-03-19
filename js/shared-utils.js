/**
 * SHARED-UTILS.JS - Common utility helpers for Image Runner tools
 */

(function () {
    'use strict';

    function formatFileSize(bytes) {
        if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
        const unit = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const index = Math.min(Math.floor(Math.log(bytes) / Math.log(unit)), sizes.length - 1);
        const value = bytes / Math.pow(unit, index);
        return `${value.toFixed(index === 0 ? 0 : 1)} ${sizes[index]}`;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function downloadBlob(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    }

    function setActivePage(pageMap, pageKey) {
        Object.values(pageMap).forEach((pageEl) => {
            if (pageEl) pageEl.classList.remove('active');
        });

        if (pageMap[pageKey]) {
            pageMap[pageKey].classList.add('active');
        }
    }

    window.ImageRunnerUtils = {
        formatFileSize,
        escapeHtml,
        downloadBlob,
        setActivePage
    };
})();
