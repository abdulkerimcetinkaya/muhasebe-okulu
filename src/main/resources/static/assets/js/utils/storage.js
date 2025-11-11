/**
 * Centralized LocalStorage Management Utility
 *
 * Provides type-safe localStorage operations with error handling
 * and JSON serialization/deserialization.
 *
 * @module StorageUtil
 */

const StorageUtil = {
    /**
     * Store a value in localStorage with JSON serialization
     * @param {string} key - Storage key
     * @param {any} value - Value to store (will be JSON serialized)
     * @returns {boolean} True if successful, false otherwise
     */
    set: (key, value) => {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            Logger.debug(`Storage SET: ${key}`, value);
            return true;
        } catch (e) {
            Logger.error(`Storage SET error for key "${key}":`, e);
            if (e.name === 'QuotaExceededError') {
                Logger.warn('LocalStorage quota exceeded. Consider clearing old data.');
            }
            return false;
        }
    },

    /**
     * Retrieve a value from localStorage with JSON deserialization
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key not found or error occurs
     * @returns {any} Stored value or default value
     */
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            if (item === null) {
                Logger.debug(`Storage GET: ${key} - not found, returning default`);
                return defaultValue;
            }

            // Try JSON parse, but if it fails (e.g., plain string like JWT token), return raw value
            try {
                const parsed = JSON.parse(item);
                Logger.debug(`Storage GET: ${key}`, parsed);
                return parsed;
            } catch (parseError) {
                // Not JSON, return as plain string (e.g., JWT token)
                Logger.debug(`Storage GET (plain string): ${key}`);
                return item;
            }
        } catch (e) {
            Logger.error(`Storage GET error for key "${key}":`, e);
            return defaultValue;
        }
    },

    /**
     * Remove a value from localStorage
     * @param {string} key - Storage key to remove
     * @returns {boolean} True if successful, false otherwise
     */
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            Logger.debug(`Storage REMOVE: ${key}`);
            return true;
        } catch (e) {
            Logger.error(`Storage REMOVE error for key "${key}":`, e);
            return false;
        }
    },

    /**
     * Clear all localStorage data
     * @returns {boolean} True if successful, false otherwise
     */
    clear: () => {
        try {
            localStorage.clear();
            Logger.warn('Storage CLEAR: All data cleared');
            return true;
        } catch (e) {
            Logger.error('Storage CLEAR error:', e);
            return false;
        }
    },

    /**
     * Check if a key exists in localStorage
     * @param {string} key - Storage key to check
     * @returns {boolean} True if key exists, false otherwise
     */
    has: (key) => {
        try {
            return localStorage.getItem(key) !== null;
        } catch (e) {
            Logger.error(`Storage HAS error for key "${key}":`, e);
            return false;
        }
    },

    /**
     * Get all keys in localStorage
     * @returns {string[]} Array of storage keys
     */
    keys: () => {
        try {
            return Object.keys(localStorage);
        } catch (e) {
            Logger.error('Storage KEYS error:', e);
            return [];
        }
    },

    /**
     * Get the number of items in localStorage
     * @returns {number} Number of items
     */
    length: () => {
        try {
            return localStorage.length;
        } catch (e) {
            Logger.error('Storage LENGTH error:', e);
            return 0;
        }
    },

    /**
     * Store a value temporarily (with expiration)
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @param {number} ttlMinutes - Time to live in minutes
     * @returns {boolean} True if successful
     */
    setWithExpiry: (key, value, ttlMinutes) => {
        const now = new Date();
        const item = {
            value: value,
            expiry: now.getTime() + (ttlMinutes * 60 * 1000)
        };
        return StorageUtil.set(key, item);
    },

    /**
     * Retrieve a value with expiration check
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if expired or not found
     * @returns {any} Stored value or default value
     */
    getWithExpiry: (key, defaultValue = null) => {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) {
            return defaultValue;
        }

        try {
            const item = JSON.parse(itemStr);
            const now = new Date();

            if (now.getTime() > item.expiry) {
                Logger.debug(`Storage EXPIRED: ${key}`);
                StorageUtil.remove(key);
                return defaultValue;
            }

            return item.value;
        } catch (e) {
            Logger.error(`Storage GET WITH EXPIRY error for key "${key}":`, e);
            return defaultValue;
        }
    }
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageUtil;
}
