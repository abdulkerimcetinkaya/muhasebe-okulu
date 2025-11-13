/**
 * Auth Service - Kimlik doğrulama ve kullanıcı yönetimi
 * Login, register, logout ve auth state yönetimi
 */

const AuthService = {
    // Login işlemi
    login: async (email, password) => {
        try {
            const response = await ApiService.login({ email, password });
            
            if (response.token) {
                // Token'ı localStorage'a kaydet
                localStorage.setItem(CommonConfig.STORAGE_KEYS.TOKEN, response.token);
                
                // Kullanıcı bilgilerini kaydet
                CommonUtils.setUserData({
                    id: response.user.id,
                    username: response.user.username,
                    role: response.user.role,
                    firstName: response.user.firstName,
                    lastName: response.user.lastName,
                    email: response.user.email
                });
                
                return { success: true, user: response.user };
            } else {
                throw new Error('Token alınamadı');
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Register işlemi
    register: async (userData) => {
        try {
            const response = await ApiService.register(userData);
            
            if (response.token) {
                // Token'ı localStorage'a kaydet
                localStorage.setItem(CommonConfig.STORAGE_KEYS.TOKEN, response.token);
                
                // Kullanıcı bilgilerini kaydet
                CommonUtils.setUserData({
                    id: response.user.id,
                    username: response.user.username,
                    role: response.user.role,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email
                });
                
                return { success: true, user: response.user };
            } else {
                throw new Error('Token alınamadı');
            }
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Logout işlemi
    logout: () => {
        ApiService.logout();
    },
    
    // Auth state kontrolü
    checkAuth: () => {
        return CommonUtils.isAuthenticated();
    },
    
    // Kullanıcı bilgilerini al
    getCurrentUser: () => {
        return CommonUtils.getStoredUser();
    },
    
    // Admin kontrolü
    isAdmin: () => {
        return CommonUtils.isAdmin();
    },
    
    // Auth guard - sayfa erişim kontrolü
    requireAuth: (redirectUrl = 'index.html') => {
        if (!AuthService.checkAuth()) {
            CommonUtils.redirectTo(redirectUrl);
            return false;
        }
        return true;
    },
    
    // Admin guard
    requireAdmin: (redirectUrl = 'index.html') => {
        if (!AuthService.checkAuth()) {
            CommonUtils.redirectTo('index.html');
            return false;
        }
        
        if (!AuthService.isAdmin()) {
            CommonUtils.redirectTo(redirectUrl);
            return false;
        }
        return true;
    },
    
    // Navbar güncelleme
    updateNavbar: async () => {
        const user = AuthService.getCurrentUser();
        if (!user) return;
        
        try {
            // Profil bilgilerini API'den al
            const profile = await ApiService.getUserProfile(user.id);
            
            if (profile.firstName) {
                // localStorage'ı güncelle
                CommonUtils.updateUserData({ firstName: profile.firstName });
                
                // Navbar'ı güncelle
                CommonUtils.updateNavbar(profile.firstName);
            } else {
                // Fallback olarak username kullan
                CommonUtils.updateNavbar(user.username);
            }
        } catch (error) {
            console.error('Navbar update error:', error);
            // Fallback olarak username kullan
            CommonUtils.updateNavbar(user.username);
        }
    },
    
    // Form validation helpers
    validateLoginForm: (email, password) => {
        const errors = [];

        if (!email || !CommonUtils.validateEmail(email)) {
            errors.push('Geçerli bir email adresi giriniz');
        }

        if (!password || password.length < 6) {
            errors.push('Şifre en az 6 karakter olmalıdır');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },
    
    validateRegisterForm: (formData) => {
        const errors = [];
        
        if (!formData.username || formData.username.trim().length < 3) {
            errors.push('Kullanıcı adı en az 3 karakter olmalıdır');
        }
        
        if (!formData.password || formData.password.length < 6) {
            errors.push('Şifre en az 6 karakter olmalıdır');
        }
        
        if (formData.password !== formData.confirmPassword) {
            errors.push('Şifreler eşleşmiyor');
        }
        
        if (!formData.firstName || formData.firstName.trim().length < 2) {
            errors.push('Ad en az 2 karakter olmalıdır');
        }
        
        if (!formData.lastName || formData.lastName.trim().length < 2) {
            errors.push('Soyad en az 2 karakter olmalıdır');
        }
        
        if (!formData.email || !CommonUtils.validateEmail(formData.email)) {
            errors.push('Geçerli bir email adresi giriniz');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
};

// Global olarak erişilebilir hale getir
window.AuthService = AuthService;
