/**
 * API Service - Tüm API çağrıları için wrapper fonksiyonlar
 * CommonUtils.apiCall kullanarak API isteklerini yönetir
 */

const ApiService = {
    // Problem işlemleri
    getProblems: (page = 0, size = CommonConfig.PAGINATION.DEFAULT_PAGE_SIZE, filters = {}) => {
        let url = `/problems?page=${page}&size=${size}`;
        
        if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
        if (filters.difficulty) url += `&difficulty=${filters.difficulty}`;
        if (filters.status) url += `&status=${filters.status}`;
        
        return CommonUtils.apiCall(url);
    },
    
    getProblemById: (problemId) => {
        return CommonUtils.apiCall(`/problems/${problemId}`);
    },
    
    submitSolution: (problemId, solutionData) => {
        return CommonUtils.apiCall(`/problems/${problemId}/submit`, {
            method: 'POST',
            body: JSON.stringify(solutionData)
        });
    },
    
    // Profil işlemleri
    getUserProfile: (userId) => {
        return CommonUtils.apiCall(`/users/${userId}/profile`);
    },
    
    updateUserProfile: (userId, data) => {
        return CommonUtils.apiCall(`/users/${userId}/profile`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    // Auth işlemleri
    login: (credentials) => {
        return CommonUtils.apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },
    
    register: (userData) => {
        return CommonUtils.apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },
    
    logout: () => {
        // Frontend logout - backend'e istek göndermeye gerek yok
        CommonUtils.clearAuthData();
        CommonUtils.redirectTo('index.html');
    },
    
    // Admin işlemleri
    getAdminStats: () => {
        return CommonUtils.apiCall('/admin/stats');
    },
    
    getAllUsers: (page = 0, size = CommonConfig.PAGINATION.DEFAULT_PAGE_SIZE) => {
        return CommonUtils.apiCall(`/admin/users?page=${page}&size=${size}`);
    },
    
    updateUserRole: (userId, role) => {
        return CommonUtils.apiCall(`/admin/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role })
        });
    },
    
    deleteUser: (userId) => {
        return CommonUtils.apiCall(`/admin/users/${userId}`, {
            method: 'DELETE'
        });
    },
    
    // Problem yönetimi (Admin)
    createProblem: (problemData) => {
        return CommonUtils.apiCall('/admin/problems', {
            method: 'POST',
            body: JSON.stringify(problemData)
        });
    },
    
    updateProblem: (problemId, problemData) => {
        return CommonUtils.apiCall(`/admin/problems/${problemId}`, {
            method: 'PUT',
            body: JSON.stringify(problemData)
        });
    },
    
    deleteProblem: (problemId) => {
        return CommonUtils.apiCall(`/admin/problems/${problemId}`, {
            method: 'DELETE'
        });
    },
    
    // İstatistikler
    getUserStats: (userId) => {
        return CommonUtils.apiCall(`/users/${userId}/stats`);
    },
    
    // Dashboard verileri
    getDashboardData: () => {
        return CommonUtils.apiCall('/dashboard');
    }
};

// Global olarak erişilebilir hale getir
window.ApiService = ApiService;

// Generic REST API Service for quiz and other modules
const APIService = {
    // Global error handler for 401/403 responses
    handleResponse: async (response) => {
        if (response.status === 401 || response.status === 403) {
            // Oturum süresi dolmuş veya yetki yok
            console.error('Oturum süresi dolmuş veya yetkiniz yok. Çıkış yapılıyor...');
            localStorage.clear();
            alert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
            window.location.href = 'login.html';
            throw new Error('Unauthorized');
        }
        return response;
    },

    get: async (url) => {
        const response = await fetch(`http://localhost:8080${url}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return await APIService.handleResponse(response);
    },

    post: async (url, data) => {
        const response = await fetch(`http://localhost:8080${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        return await APIService.handleResponse(response);
    },

    put: async (url, data) => {
        const response = await fetch(`http://localhost:8080${url}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        return await APIService.handleResponse(response);
    },

    delete: async (url) => {
        const response = await fetch(`http://localhost:8080${url}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return await APIService.handleResponse(response);
    }
};

// Global olarak erişilebilir hale getir
window.APIService = APIService;
