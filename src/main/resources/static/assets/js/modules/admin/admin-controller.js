/**
 * Admin Controller - Main Coordinator for Admin Panel
 *
 * Coordinates all admin modules and initializes the admin panel.
 * This is the entry point for the modularized admin system.
 *
 * @module admin-controller
 */

// API Configuration
const API_PROBLEMS = `${CommonConfig.API_URL}/admin/problems`;
const API_CORRECT = `${CommonConfig.API_URL}/correct-entries`;

/**
 * Admin Panel Controller
 * Coordinates all modules and provides global functions
 */
const AdminController = {
    /**
     * Initialize all admin modules
     */
    initialize: () => {
        Logger.log('Initializing Admin Panel...');

        // Check admin authentication
        if (!AuthService.requireAdmin()) {
            Logger.warn('Admin authentication failed');
            return;
        }

        // Initialize UI helpers
        UIHelpers.initialize();

        // Initialize account helpers
        AccountHelpers.initialize();

        // Initialize domain modules
        UserManagement.initialize();
        ProblemManagement.initialize();
        BulkImport.initialize();
        QuizManagement.initialize();
        QuestionManagement.initialize();

        // Show dashboard by default
        Navigation.showSection('dashboard');

        // Add initial answer row for problem creation
        AccountHelpers.addAnswerRow('c-answersBody');

        // Refresh icons
        UIHelpers.refreshIcons();

        Logger.log('Admin Panel initialized successfully');
    },

    /**
     * Logout function
     */
    logout: () => {
        AuthService.logout();
    }
};

// Expose modules to window for onclick handlers
window.AdminController = AdminController;
window.Navigation = Navigation;
window.UIHelpers = UIHelpers;
window.Pagination = Pagination;
window.AccountHelpers = AccountHelpers;
window.UserManagement = UserManagement;
window.ProblemManagement = ProblemManagement;
window.QuizManagement = QuizManagement;
window.QuestionManagement = QuestionManagement;

// Global functions for backwards compatibility
window.showSection = Navigation.showSection;
window.toggleSubmenu = UIHelpers.toggleSubmenu;
window.toggleProfileDropdown = UIHelpers.toggleProfileDropdown;
window.logout = AdminController.logout;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    AdminController.initialize();
});

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminController;
}
