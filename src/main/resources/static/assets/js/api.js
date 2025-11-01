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
    get: (url) => {
        return fetch(`http://localhost:8080${url}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
    },

    post: (url, data) => {
        return fetch(`http://localhost:8080${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
    },

    put: (url, data) => {
        return fetch(`http://localhost:8080${url}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
    },

    delete: (url) => {
        return fetch(`http://localhost:8080${url}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
    }
};

// Global olarak erişilebilir hale getir
window.APIService = APIService;
