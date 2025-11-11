/**
 * Ortak sabitler ve utility fonksiyonlar
 * Tüm sayfalarda kullanılacak ortak kodlar
 */

// Ortak sabitler
const CommonConfig = {
    API_URL: 'http://localhost:8080/api',
    STORAGE_KEYS: {
        USER: 'user',
        TOKEN: 'token'
    },
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 15,
        MAX_PAGE_SIZE: 50
    }
};

// Ortak utility fonksiyonlar
const CommonUtils = {
    // Auth işlemleri
    getStoredUser: () => {
        try {
            return JSON.parse(localStorage.getItem(CommonConfig.STORAGE_KEYS.USER) || 'null');
        } catch (e) {
            console.error('User data parse error:', e);
            return null;
        }
    },
    
    getToken: () => localStorage.getItem(CommonConfig.STORAGE_KEYS.TOKEN),
    
    isAuthenticated: () => !!localStorage.getItem(CommonConfig.STORAGE_KEYS.TOKEN),
    
    // API çağrıları
    apiCall: async (endpoint, options = {}) => {
        const token = CommonUtils.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${CommonConfig.API_URL}${endpoint}`, {
                ...options,
                headers
            });

            // 401/403 hatalarında otomatik logout
            if (response.status === 401 || response.status === 403) {
                console.error('Oturum süresi dolmuş veya yetkiniz yok. Çıkış yapılıyor...');
                localStorage.clear();
                alert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
                window.location.href = 'login.html';
                throw new Error('Unauthorized');
            }

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    },
    
    // UI işlemleri
    updateNavbar: (firstName) => {
        const userNameButton = document.getElementById('userNameButton');
        if (userNameButton) {
            userNameButton.textContent = `Hoşgeldin, ${firstName}`;
        }
    },

    // Navbar profil menüsünü güncelle
    updateProfileMenu: async () => {
        const user = CommonUtils.getStoredUser();
        if (!user) return;

        // Profili API'den çek
        try {
            const profile = await CommonUtils.apiCall(`/users/${user.id}/profile`);

            // Tam adı oluştur
            const displayName = profile.firstName || user.username;

            // Navbar profil menüsünü güncelle
            const userDisplayName = document.getElementById('userDisplayName');
            if (userDisplayName) {
                userDisplayName.textContent = `Hoşgeldin, ${displayName}`;
            }

            // localStorage'ı güncelle
            if (profile.firstName) {
                CommonUtils.updateUserData({ firstName: profile.firstName, lastName: profile.lastName });
            }
        } catch (error) {
            console.error('Profile fetch failed:', error);
            // Hata durumunda username kullan
            const userDisplayName = document.getElementById('userDisplayName');
            if (userDisplayName) {
                userDisplayName.textContent = `Hoşgeldin, ${user.username}`;
            }
        }
    },

    // Dropdown toggle - hem userDropdown hem profileDropdown ID'lerini destekler
    toggleUserDropdown: () => {
        // Önce userDropdown'ı ara, bulamazsa profileDropdown'ı dene
        const dropdown = document.getElementById('userDropdown') || document.getElementById('profileDropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    },

    // Çıkış yap
    logout: () => {
        CommonUtils.clearAuthData();
        CommonUtils.redirectTo('index.html');
    },
    
    // Debounce fonksiyonu
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle fonksiyonu
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Loading state yönetimi
    showLoading: (elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '<div class="flex justify-center items-center p-4"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>';
        }
    },
    
    hideLoading: (elementId, originalContent) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = originalContent;
        }
    },
    
    // Error handling
    showError: (message, elementId = 'error-message') => {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
            setTimeout(() => {
                errorElement.classList.add('hidden');
            }, 5000);
        }
    },
    
    // Success message
    showSuccess: (message, elementId = 'success-message') => {
        const successElement = document.getElementById(elementId);
        if (successElement) {
            successElement.textContent = message;
            successElement.classList.remove('hidden');
            setTimeout(() => {
                successElement.classList.add('hidden');
            }, 3000);
        }
    },
    
    // Form validation
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    validatePassword: (password) => {
        return password && password.length >= 6;
    },
    
    // Date formatting
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    // Local storage helpers
    setUserData: (userData) => {
        localStorage.setItem(CommonConfig.STORAGE_KEYS.USER, JSON.stringify(userData));
    },
    
    updateUserData: (updates) => {
        const currentUser = CommonUtils.getStoredUser();
        if (currentUser) {
            const updatedUser = { ...currentUser, ...updates };
            CommonUtils.setUserData(updatedUser);
        }
    },
    
    // Clear auth data
    clearAuthData: () => {
        localStorage.removeItem(CommonConfig.STORAGE_KEYS.USER);
        localStorage.removeItem(CommonConfig.STORAGE_KEYS.TOKEN);
    },
    
    // Redirect helper
    redirectTo: (url) => {
        window.location.href = url;
    },
    
    // Check if user is admin
    isAdmin: () => {
        const user = CommonUtils.getStoredUser();
        return user && user.role === 'ADMIN';
    }
};

// Global olarak erişilebilir hale getir
window.CommonConfig = CommonConfig;
window.CommonUtils = CommonUtils;

// Dropdown için global click outside listener
// Bu sayede tüm sayfalarda otomatik çalışır
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDropdownListener);
} else {
    initDropdownListener();
}

function initDropdownListener() {
    document.addEventListener('click', (event) => {
        // userDropdown veya profileDropdown elementlerini bul
        const dropdown = document.getElementById('userDropdown') || document.getElementById('profileDropdown');

        if (!dropdown) return; // Dropdown yoksa bir şey yapma

        // Tıklanan element dropdown button'u mu?
        const button = event.target.closest('button[onclick*="toggleUserDropdown"]');

        // Button'a tıklanmadıysa ve dropdown'a da tıklanmadıysa dropdown'u kapat
        if (!button && !dropdown.contains(event.target)) {
            dropdown.classList.add('hidden');
        }
    });
}







