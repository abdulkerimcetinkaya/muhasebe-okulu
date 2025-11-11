/**
 * Navigation Module for Admin Panel
 *
 * Manages section routing and navigation between different admin views.
 * Depends on: Logger, UIHelpers
 *
 * @module navigation
 */

const Navigation = {
    /**
     * Show a specific section and hide all others
     * @param {string} sectionId - Section ID to show
     */
    showSection: (sectionId) => {
        const sections = [
            'dashboard', 'all-problems', 'add-problem',
            'all-quizzes', 'add-quiz', 'quiz-topics',
            'all-users', 'active-users', 'banned-users',
            'problem-reports', 'user-reports', 'performance-analysis',
            'duzenle', 'quiz-quizzes', 'quiz-questions',
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
        const targetElement = document.getElementById(sectionId);
        if (targetElement) {
            targetElement.classList.remove('hidden');
            Logger.debug(`Section shown: ${sectionId}`);
        } else {
            Logger.warn(`Section not found: ${sectionId}`);
        }

        // Section-specific initialization
        Navigation.initializeSection(sectionId);

        // Refresh icons
        UIHelpers.refreshIcons();
    },

    /**
     * Initialize section-specific functionality
     * @param {string} sectionId - Section that was just shown
     */
    initializeSection: (sectionId) => {
        // This will be populated by domain modules
        // Each domain module can register its initialization here
        const initializers = {
            'all-problems': () => {
                if (typeof ProblemManagement !== 'undefined') {
                    ProblemManagement.loadProblems();
                    // Search listeners are already initialized in admin-controller.js
                }
            },
            'all-users': () => {
                if (typeof UserManagement !== 'undefined') {
                    UserManagement.loadUsers();
                }
            },
            'all-quizzes': () => {
                if (typeof QuizManagement !== 'undefined') {
                    QuizManagement.loadAdminQuizzes();
                }
            },
            'add-quiz': () => {
                if (typeof QuizManagement !== 'undefined') {
                    QuizManagement.loadAdminTopicsForForm();
                    QuizManagement.resetAdminQuizForm();
                }
            },
            'quiz-topics': () => {
                if (typeof QuizManagement !== 'undefined') {
                    QuizManagement.loadTopics();
                    QuizManagement.loadTopicsForSelect();
                }
            },
            'quiz-quizzes': () => {
                if (typeof QuizManagement !== 'undefined') {
                    QuizManagement.loadQuizzes();
                    QuizManagement.loadQuizzesForSelect();
                }
            },
            'quiz-questions': () => {
                if (typeof QuizManagement !== 'undefined') {
                    QuizManagement.loadQuizzesForSelect();
                }
            },
            'study-cards-list': () => {
                if (typeof StudyManagement !== 'undefined') {
                    StudyManagement.loadStudyCards();
                }
            },
            'study-card-sections': () => {
                if (typeof StudyCardBuilder !== 'undefined') {
                    StudyCardBuilder.init();
                }
            }
        };

        const initializer = initializers[sectionId];
        if (initializer) {
            initializer();
        }
    },

    /**
     * Initialize navigation on page load
     */
    initialize: () => {
        // Show dashboard by default
        Navigation.showSection('dashboard');
        Logger.debug('Navigation initialized');
    }
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
}
