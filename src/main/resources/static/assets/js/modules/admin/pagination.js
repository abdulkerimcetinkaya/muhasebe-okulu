/**
 * Pagination Utilities for Admin Panel
 *
 * Provides functions for rendering pagination controls and handling page changes.
 * Depends on: Logger, UIHelpers
 *
 * @module pagination
 */

// Pagination state
let currentPage = 0; // Backend 0-indexed
let totalPages = 0;
let totalItems = 0;
const itemsPerPage = 5;

const Pagination = {
    /**
     * Get current pagination state
     * @returns {Object} Pagination state
     */
    getState: () => ({
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage
    }),

    /**
     * Set pagination state
     * @param {Object} state - New state
     */
    setState: (state) => {
        if (state.currentPage !== undefined) currentPage = state.currentPage;
        if (state.totalPages !== undefined) totalPages = state.totalPages;
        if (state.totalItems !== undefined) totalItems = state.totalItems;
        Logger.debug(`Pagination state updated:`, { currentPage, totalPages, totalItems });
    },

    /**
     * Render pagination controls
     * @param {string} containerId - ID of pagination container element
     */
    render: (containerId = 'pagination-container') => {
        const container = document.getElementById(containerId);
        if (!container) {
            Logger.warn(`Pagination container not found: ${containerId}`);
            return;
        }

        // Single page or no pages
        if (totalPages <= 1) {
            container.innerHTML = `
                <div class="text-sm text-slate-600">
                    Toplam <span class="font-medium">${totalItems}</span> kayıt
                </div>
            `;
            return;
        }

        // Calculate display range
        const startItem = currentPage * itemsPerPage + 1;
        const endItem = Math.min((currentPage + 1) * itemsPerPage, totalItems);

        let html = '<div class="flex items-center justify-between">';

        // Left: Info
        html += `
            <div class="text-sm text-slate-600">
                <span class="font-medium">${startItem}</span> - <span class="font-medium">${endItem}</span> / <span class="font-medium">${totalItems}</span> kayıt
            </div>
        `;

        // Right: Buttons
        html += '<div class="flex items-center gap-2">';

        // Previous button
        html += `
            <button onclick="Pagination.changePage(${currentPage - 1})"
                ${currentPage === 0 ? 'disabled' : ''}
                class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white">
                <i data-lucide="chevron-left" class="w-4 h-4" style="stroke-width:1.5;"></i>
                Önceki
            </button>
        `;

        // Page numbers (1-indexed display)
        for (let i = 0; i < totalPages; i++) {
            if (i === currentPage) {
                html += `
                    <button class="inline-flex items-center justify-center w-10 h-10 text-sm font-medium rounded-md bg-blue-900 text-white">
                        ${i + 1}
                    </button>
                `;
            } else if (i === 0 || i === totalPages - 1 || Math.abs(i - currentPage) <= 1) {
                html += `
                    <button onclick="Pagination.changePage(${i})" class="inline-flex items-center justify-center w-10 h-10 text-sm font-medium rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50">
                        ${i + 1}
                    </button>
                `;
            } else if (Math.abs(i - currentPage) === 2) {
                html += '<span class="text-slate-400 px-2">...</span>';
            }
        }

        // Next button
        html += `
            <button onclick="Pagination.changePage(${currentPage + 1})"
                ${currentPage === totalPages - 1 ? 'disabled' : ''}
                class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white">
                Sonraki
                <i data-lucide="chevron-right" class="w-4 h-4" style="stroke-width:1.5;"></i>
            </button>
        `;

        html += '</div></div>';
        container.innerHTML = html;
        UIHelpers.refreshIcons();
    },

    /**
     * Change to a specific page
     * @param {number} page - Page number (0-indexed)
     * @param {Function} loadFunction - Function to load page data
     */
    changePage: (page, loadFunction) => {
        if (page < 0 || page >= totalPages) {
            Logger.warn(`Invalid page number: ${page}`);
            return;
        }
        if (loadFunction && typeof loadFunction === 'function') {
            loadFunction(page);
        } else {
            Logger.warn('No load function provided for page change');
        }
    }
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Pagination;
}
