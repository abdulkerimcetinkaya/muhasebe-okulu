/**
 * Centralized Logging Utility
 *
 * Environment-aware logging system that only outputs logs in development mode.
 * Provides structured logging with severity levels.
 *
 * @module Logger
 */

const Logger = {
    /**
     * Check if running in development environment
     * @returns {boolean} True if localhost, false otherwise
     */
    isDevelopment: () => {
        return window.location.hostname === 'localhost' ||
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname === '';
    },

    /**
     * Log informational message (development only)
     * @param {...any} args - Arguments to log
     */
    log: (...args) => {
        if (Logger.isDevelopment()) {
            console.log('[INFO]', new Date().toISOString(), ...args);
        }
    },

    /**
     * Log error message (development only)
     * @param {...any} args - Arguments to log
     */
    error: (...args) => {
        if (Logger.isDevelopment()) {
            console.error('[ERROR]', new Date().toISOString(), ...args);
        }
    },

    /**
     * Log warning message (development only)
     * @param {...any} args - Arguments to log
     */
    warn: (...args) => {
        if (Logger.isDevelopment()) {
            console.warn('[WARN]', new Date().toISOString(), ...args);
        }
    },

    /**
     * Log debug message (development only)
     * @param {...any} args - Arguments to log
     */
    debug: (...args) => {
        if (Logger.isDevelopment()) {
            console.log('[DEBUG]', new Date().toISOString(), ...args);
        }
    },

    /**
     * Log API request details
     * @param {string} method - HTTP method
     * @param {string} url - Request URL
     * @param {any} data - Request data
     */
    apiRequest: (method, url, data = null) => {
        if (Logger.isDevelopment()) {
            console.group(`[API REQUEST] ${method} ${url}`);
            console.log('Time:', new Date().toISOString());
            if (data) console.log('Data:', data);
            console.groupEnd();
        }
    },

    /**
     * Log API response details
     * @param {string} method - HTTP method
     * @param {string} url - Request URL
     * @param {any} response - Response data
     */
    apiResponse: (method, url, response) => {
        if (Logger.isDevelopment()) {
            console.group(`[API RESPONSE] ${method} ${url}`);
            console.log('Time:', new Date().toISOString());
            console.log('Response:', response);
            console.groupEnd();
        }
    },

    /**
     * Log API error details
     * @param {string} method - HTTP method
     * @param {string} url - Request URL
     * @param {Error} error - Error object
     */
    apiError: (method, url, error) => {
        if (Logger.isDevelopment()) {
            console.group(`[API ERROR] ${method} ${url}`);
            console.error('Time:', new Date().toISOString());
            console.error('Error:', error);
            console.error('Stack:', error.stack);
            console.groupEnd();
        }
    }
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Logger;
}
