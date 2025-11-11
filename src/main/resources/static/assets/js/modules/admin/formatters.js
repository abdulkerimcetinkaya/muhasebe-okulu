/**
 * Formatting Utilities for Admin Panel
 *
 * Provides pure formatting functions for dates, roles, difficulty levels,
 * and HTML/attribute escaping.
 *
 * @module formatters
 */

const Formatters = {
    /**
     * Format date to Turkish locale
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date or fallback message
     */
    formatDate: (dateString) => {
        if (!dateString) return 'Bilinmiyor';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Geçersiz tarih';
            }
            return date.toLocaleDateString('tr-TR');
        } catch (error) {
            Logger.error('Tarih formatlama hatası:', error);
            return 'Geçersiz tarih';
        }
    },

    /**
     * Get Tailwind CSS classes for role badges
     * @param {string} role - User role (ADMIN, USER)
     * @returns {string} Tailwind CSS classes
     */
    getRoleColor: (role) => {
        const colors = {
            'ADMIN': 'bg-red-100 text-red-800',
            'USER': 'bg-blue-100 text-blue-800'
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    },

    /**
     * Get Turkish text for role
     * @param {string} role - User role (ADMIN, USER)
     * @returns {string} Turkish role name
     */
    getRoleText: (role) => {
        const texts = {
            'ADMIN': 'Admin',
            'USER': 'Öğrenci'
        };
        return texts[role] || 'Bilinmiyor';
    },

    /**
     * Get Tailwind CSS classes for difficulty badges
     * @param {string} difficulty - Problem difficulty (EASY, MEDIUM, HARD)
     * @returns {string} Tailwind CSS classes
     */
    getDifficultyColor: (difficulty) => {
        const colors = {
            'EASY': 'bg-green-100 text-green-800',
            'MEDIUM': 'bg-yellow-100 text-yellow-800',
            'HARD': 'bg-red-100 text-red-800'
        };
        return colors[difficulty] || 'bg-gray-100 text-gray-800';
    },

    /**
     * Get Turkish text for difficulty
     * @param {string} difficulty - Problem difficulty (EASY, MEDIUM, HARD)
     * @returns {string} Turkish difficulty name
     */
    getDifficultyText: (difficulty) => {
        const texts = {
            'EASY': 'Kolay',
            'MEDIUM': 'Orta',
            'HARD': 'Zor'
        };
        return texts[difficulty] || 'Bilinmiyor';
    },

    /**
     * Get Tailwind CSS badge classes for difficulty (alternative format)
     * @param {string} difficulty - Problem difficulty (EASY, MEDIUM, HARD)
     * @returns {string} Tailwind CSS classes
     */
    difficultyBadge: (difficulty) => {
        const badges = {
            'EASY': 'bg-blue-100 text-blue-800',
            'MEDIUM': 'bg-blue-200 text-blue-900',
            'HARD': 'bg-blue-500 text-white'
        };
        return badges[difficulty] || badges['MEDIUM'];
    },

    /**
     * Get Turkish label for difficulty (legacy support)
     * @param {string} difficulty - Problem difficulty (EASY, MEDIUM, HARD)
     * @returns {string} Turkish difficulty name
     */
    difficultyLabel: (difficulty) => {
        const labels = {
            'EASY': 'Kolay',
            'MEDIUM': 'Orta',
            'HARD': 'Zor'
        };
        return labels[difficulty] || 'Orta';
    },

    /**
     * Get points for difficulty level
     * @param {string} difficulty - Problem difficulty (EASY, MEDIUM, HARD)
     * @returns {number} Points for difficulty
     */
    difficultyPoints: (difficulty) => {
        const points = {
            'EASY': 10,
            'MEDIUM': 20,
            'HARD': 30
        };
        return points[difficulty] || 20;
    },

    /**
     * Escape HTML special characters
     * @param {string} str - String to escape
     * @returns {string} HTML-safe string
     */
    escapeHtml: (str) => {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },

    /**
     * Escape attribute special characters
     * @param {string} str - String to escape
     * @returns {string} Attribute-safe string
     */
    escapeAttr: (str) => {
        return String(str || '').replace(/"/g, '&quot;');
    }
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Formatters;
}
