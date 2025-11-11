/**
 * UI Helper Utilities for Admin Panel
 *
 * Provides functions for modals, toasts, dropdowns, and DOM manipulation.
 * Depends on: Logger, StorageUtil
 *
 * @module ui-helpers
 */

const UIHelpers = {
    // State variable for confirm callback
    confirmCallback: null,

    /**
     * Show success toast/modal
     * @param {string} msg - Success message
     */
    showSuccess: (msg) => {
        const text = document.getElementById('successText');
        if (text) {
            text.textContent = msg || 'İşlem başarılı.';
        }
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            lucide.createIcons();
            setTimeout(() => UIHelpers.hideModal('successModal'), 2000);
        }
    },

    /**
     * Show error toast/modal
     * @param {string} msg - Error message
     */
    showError: (msg) => {
        const text = document.getElementById('errorText');
        if (text) {
            text.textContent = msg || 'Bir hata oluştu.';
        }
        const modal = document.getElementById('errorModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            lucide.createIcons();
        }
    },

    /**
     * Show custom confirm dialog
     * @param {string} message - Confirmation message
     * @param {Function} callback - Function to execute if confirmed
     */
    showConfirm: (message, callback, options = {}) => {
        const text = document.getElementById('confirmText');
        if (text) {
            text.textContent = message || 'Bu işlemi gerçekleştirmek istediğinizden emin misiniz?';
        }

        // Update button text
        const confirmButton = document.getElementById('confirmButton');
        if (confirmButton) {
            confirmButton.textContent = options.confirmText || 'Sil';
        }

        UIHelpers.confirmCallback = callback;

        const modal = document.getElementById('confirmModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            lucide.createIcons();
        }
    },

    /**
     * Cancel confirmation dialog
     */
    cancelConfirm: () => {
        UIHelpers.confirmCallback = null;
        UIHelpers.hideModal('confirmModal');
    },

    /**
     * Execute confirmed action
     */
    executeConfirm: () => {
        if (UIHelpers.confirmCallback && typeof UIHelpers.confirmCallback === 'function') {
            UIHelpers.confirmCallback();
        }
        UIHelpers.confirmCallback = null;
        UIHelpers.hideModal('confirmModal');
    },

    /**
     * Hide modal by ID
     * @param {string} id - Modal element ID
     */
    hideModal: (id) => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    /**
     * Toggle submenu visibility with chevron rotation
     * @param {string} menuName - Menu identifier (prefix for IDs)
     */
    toggleSubmenu: (menuName) => {
        const submenu = document.getElementById(`${menuName}-submenu`);
        const chevron = document.getElementById(`${menuName}-chevron`);

        if (submenu) {
            submenu.classList.toggle('hidden');
        }
        if (chevron) {
            chevron.classList.toggle('rotate-180');
        }
    },

    /**
     * Toggle profile dropdown visibility
     * @param {Event} event - Click event (to stop propagation)
     */
    toggleProfileDropdown: (event) => {
        if (event) {
            event.stopPropagation();
        }
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    },

    /**
     * Update user information in UI
     * Fetches current user from AuthService and updates display elements
     */
    updateUserInfo: () => {
        const user = AuthService.getCurrentUser();
        if (!user) {
            Logger.warn('No user found in updateUserInfo');
            return;
        }

        const initial = user.username.charAt(0).toUpperCase();

        const elements = {
            userInitial: document.getElementById('userInitial'),
            userInitialDropdown: document.getElementById('userInitialDropdown'),
            userName: document.getElementById('userName'),
            userRole: document.getElementById('userRole'),
            userNameButton: document.getElementById('userNameButton')
        };

        if (elements.userInitial) {
            elements.userInitial.textContent = initial;
        }
        if (elements.userInitialDropdown) {
            elements.userInitialDropdown.textContent = initial;
        }
        if (elements.userName) {
            elements.userName.textContent = user.username;
        }
        if (elements.userRole) {
            elements.userRole.textContent = 'Yönetici';
        }
        if (elements.userNameButton) {
            const firstName = user.firstName || user.username;
            elements.userNameButton.textContent = `Hoşgeldin, ${firstName}`;
            Logger.debug('Updated user display name:', firstName);
        }
    },

    /**
     * Get input element value by ID
     * @param {string} id - Element ID
     * @returns {string} Element value or empty string
     */
    getValue: (id) => {
        const element = document.getElementById(id);
        return element ? element.value : '';
    },

    /**
     * Set input element value by ID
     * @param {string} id - Element ID
     * @param {string} val - Value to set
     */
    setValue: (id, val) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = val;
        }
    },

    /**
     * Initialize Lucide icons
     * Wrapper for lucide.createIcons() with error handling
     */
    refreshIcons: () => {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        } else {
            Logger.warn('Lucide icons library not available');
        }
    },

    /**
     * Show loading indicator
     * @param {string} message - Loading message
     */
    showLoading: (message = 'Yükleniyor...') => {
        let loader = document.getElementById('globalLoadingIndicator');
        if (!loader) {
            // Create loading indicator if doesn't exist
            loader = document.createElement('div');
            loader.id = 'globalLoadingIndicator';
            loader.className = 'fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center';
            loader.innerHTML = `
                <div class="bg-white rounded-lg p-6 shadow-xl flex items-center gap-4">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span id="loadingMessage" class="text-gray-800 font-medium">${message}</span>
                </div>
            `;
            document.body.appendChild(loader);
        } else {
            const msgEl = loader.querySelector('#loadingMessage');
            if (msgEl) msgEl.textContent = message;
            loader.classList.remove('hidden');
        }
    },

    /**
     * Hide loading indicator
     */
    hideLoading: () => {
        const loader = document.getElementById('globalLoadingIndicator');
        if (loader) {
            loader.classList.add('hidden');
        }
    },

    /**
     * Show section and hide all others
     * @param {string} which - Section ID to show
     * @param {Function} callback - Optional callback after section shown
     */
    showSection: (which, callback) => {
        const sections = [
            'dashboard', 'all-problems', 'add-problem', 'categories',
            'all-quizzes', 'add-quiz', 'quiz-topics',
            'all-users', 'active-users', 'banned-users',
            'problem-reports', 'user-reports', 'performance-analysis',
            'duzenle', 'quiz-topics', 'quiz-quizzes', 'quiz-questions',
            'study-cards-list', 'study-card-sections'
        ];

        // Hide all sections
        sections.forEach(section => {
            const element = document.getElementById(section);
            if (element) {
                element.classList.add('hidden');
            }
        });

        // Show target section
        const targetElement = document.getElementById(which);
        if (targetElement) {
            targetElement.classList.remove('hidden');
            Logger.debug(`Section shown: ${which}`);
        } else {
            Logger.warn(`Section not found: ${which}`);
        }

        // Execute callback if provided
        if (callback && typeof callback === 'function') {
            callback();
        }

        // Refresh icons
        UIHelpers.refreshIcons();
    },

    /**
     * Setup dropdown close on outside click
     * Closes profile dropdown when clicking outside
     */
    initDropdownCloseListener: () => {
        document.addEventListener('click', function (event) {
            const dropdown = document.getElementById('profileDropdown');
            if (dropdown && !dropdown.contains(event.target)) {
                dropdown.classList.add('hidden');
            }
        });
        Logger.debug('Dropdown close listener initialized');
    },

    /**
     * Initialize all UI helpers on page load
     * Should be called once when DOM is ready
     */
    initialize: () => {
        UIHelpers.initDropdownCloseListener();
        UIHelpers.updateUserInfo();
        Logger.debug('UI Helpers initialized');
    }
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIHelpers;
}
