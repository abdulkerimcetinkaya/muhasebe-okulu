/**
 * Theme Management Utility
 * Handles dark/light mode with system preference detection and smooth transitions
 */

// Theme configuration
const THEME_CONFIG = {
    LIGHT: 'light',
    DARK: 'dark',
    STORAGE_KEY: 'theme-preference',
    TRANSITION_DURATION: 300 // ms
};

/**
 * Get system color scheme preference
 */
function getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return THEME_CONFIG.DARK;
    }
    return THEME_CONFIG.LIGHT;
}

/**
 * Get stored theme preference or fallback to system preference
 */
function getStoredTheme() {
    try {
        const stored = localStorage.getItem(THEME_CONFIG.STORAGE_KEY);
        if (stored === THEME_CONFIG.LIGHT || stored === THEME_CONFIG.DARK) {
            return stored;
        }
    } catch (e) {
        console.warn('Failed to access localStorage for theme:', e);
    }
    return getSystemPreference();
}

/**
 * Apply theme to document
 */
function applyTheme(theme, withTransition = true) {
    const html = document.documentElement;

    // Add transition class if requested
    if (withTransition) {
        html.classList.add('theme-transitioning');
    }

    if (theme === THEME_CONFIG.DARK) {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }

    // Remove transition class after animation completes
    if (withTransition) {
        setTimeout(() => {
            html.classList.remove('theme-transitioning');
        }, THEME_CONFIG.TRANSITION_DURATION);
    }

    // Store preference
    try {
        localStorage.setItem(THEME_CONFIG.STORAGE_KEY, theme);
    } catch (e) {
        console.warn('Failed to save theme preference:', e);
    }

    // Dispatch custom event for components that need to react to theme changes
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    const currentTheme = document.documentElement.classList.contains('dark')
        ? THEME_CONFIG.DARK
        : THEME_CONFIG.LIGHT;
    const newTheme = currentTheme === THEME_CONFIG.DARK
        ? THEME_CONFIG.LIGHT
        : THEME_CONFIG.DARK;
    applyTheme(newTheme, true);
    return newTheme;
}

/**
 * Get current active theme
 */
function getCurrentTheme() {
    return document.documentElement.classList.contains('dark')
        ? THEME_CONFIG.DARK
        : THEME_CONFIG.LIGHT;
}

/**
 * Initialize theme on page load (call this ASAP to prevent flash)
 */
function initTheme() {
    const theme = getStoredTheme();
    applyTheme(theme, false); // No transition on initial load
}

/**
 * Listen for system preference changes
 */
function watchSystemPreference() {
    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Only auto-switch if user hasn't manually set a preference
    mediaQuery.addEventListener('change', (e) => {
        const hasManualPreference = localStorage.getItem(THEME_CONFIG.STORAGE_KEY);
        if (!hasManualPreference) {
            applyTheme(e.matches ? THEME_CONFIG.DARK : THEME_CONFIG.LIGHT, true);
        }
    });
}

/**
 * Create and inject theme toggle button
 * @param {string} containerSelector - CSS selector for button container
 */
function createThemeToggle(containerSelector = '#theme-toggle-container') {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.warn('Theme toggle container not found:', containerSelector);
        return;
    }

    const currentTheme = getCurrentTheme();
    const isDark = currentTheme === THEME_CONFIG.DARK;

    const button = document.createElement('button');
    button.id = 'theme-toggle';
    button.className = 'p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors';
    button.setAttribute('aria-label', 'Toggle dark mode');
    button.innerHTML = `
        <i data-lucide="${isDark ? 'sun' : 'moon'}" class="w-5 h-5 text-slate-600 dark:text-slate-300"></i>
    `;

    button.addEventListener('click', () => {
        const newTheme = toggleTheme();
        const isDark = newTheme === THEME_CONFIG.DARK;
        button.innerHTML = `
            <i data-lucide="${isDark ? 'sun' : 'moon'}" class="w-5 h-5 text-slate-600 dark:text-slate-300"></i>
        `;
        // Re-initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    });

    container.appendChild(button);
}

// Auto-initialize theme on script load (prevents flash of wrong theme)
initTheme();

// Watch for system preference changes
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchSystemPreference);
} else {
    watchSystemPreference();
}

// Export for use in other scripts
window.ThemeManager = {
    toggle: toggleTheme,
    apply: applyTheme,
    getCurrent: getCurrentTheme,
    init: initTheme,
    createToggle: createThemeToggle,
    THEME: THEME_CONFIG
};
