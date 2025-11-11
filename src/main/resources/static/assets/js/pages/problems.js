/**
 * Problems Page - Problem listeleme, filtreleme ve pagination
 * Problem kartları, zorluk filtreleme, arama, çözüm durumu takibi
 */

// ===========================
// CONSTANTS
// ===========================
const API_URL = 'http://localhost:8080/api';
const API_PROBLEMS = `${API_URL}/problems`;

// ===========================
// STATE VARIABLES
// ===========================

// Pagination state
let currentPage = 1;
const itemsPerPage = 15;
let totalPages = 1;
let allProblems = [];

// Filter state
let currentDifficulty = '';
let currentStatus = '';

// ===========================
// INITIALIZATION
// ===========================

/**
 * Initialize problems page
 */
async function initProblemsPage() {
    // Update year in footer
    document.getElementById("year").textContent = new Date().getFullYear();

    // Create Lucide icons
    lucide.createIcons();

    // Setup navbar based on role
    setupNavbarByRole();

    // Load user stats if logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        document.getElementById('statsSection').classList.remove('hidden');
        await loadUserStats();
    }

    // Load problems
    await loadProblems();

    // Setup event listeners
    setupEventListeners();
}

/**
 * Refresh problems when page becomes visible (after solving a problem)
 */
function handleVisibilityChange() {
    if (!document.hidden) {
        loadProblems();
    }
}

// ===========================
// NAVBAR & AUTHENTICATION
// ===========================

/**
 * Setup navbar based on user role
 * Shows appropriate nav links for USER, TEACHER, or ADMIN
 */
function setupNavbarByRole() {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
        const user = JSON.parse(storedUser);

        // Hide guest layout
        document.getElementById('guestLayout').classList.add('hidden');
        document.getElementById('guestAuthButtons').classList.add('hidden');

        // Show user layout
        document.getElementById('userLayout').classList.remove('hidden');
        document.getElementById('userProfileMenu').classList.remove('hidden');

        // Update profile menu using CommonUtils
        CommonUtils.updateProfileMenu();

        // Setup nav links based on role
        if (user.role === 'ADMIN') {
            // Admin: hide user links, show admin links
            document.getElementById('userDashboardLink').classList.add('hidden');
            document.getElementById('userProblemsLink').classList.add('hidden');
            document.getElementById('userProfileLink').classList.add('hidden');
            document.getElementById('adminDashboardLink').classList.remove('hidden');
            document.getElementById('adminLink').classList.remove('hidden');
        } else if (user.role === 'TEACHER') {
            // Teacher: hide user links, show teacher links
            document.getElementById('userDashboardLink').classList.add('hidden');
            document.getElementById('userProblemsLink').classList.add('hidden');
            document.getElementById('userProfileLink').classList.add('hidden');
            document.getElementById('teacherDashboardLink').classList.remove('hidden');
            document.getElementById('teacherProblemsLink').classList.remove('hidden');
            document.getElementById('teacherProfileLink').classList.remove('hidden');
        } else if (user.role === 'USER') {
            // Regular user: show user links
            document.getElementById('userDashboardLink').classList.remove('hidden');
            document.getElementById('userProblemsLink').classList.remove('hidden');
            document.getElementById('userProfileLink').classList.remove('hidden');
        }

        // Hide other role links
        if (user.role !== 'ADMIN') {
            document.getElementById('adminDashboardLink').classList.add('hidden');
            document.getElementById('adminLink').classList.add('hidden');
        }
        if (user.role !== 'TEACHER') {
            document.getElementById('teacherDashboardLink').classList.add('hidden');
            document.getElementById('teacherProblemsLink').classList.add('hidden');
            document.getElementById('teacherProfileLink').classList.add('hidden');
        }

    } else {
        // Guest: show guest layout
        document.getElementById('guestLayout').classList.remove('hidden');
        document.getElementById('guestAuthButtons').classList.remove('hidden');

        // Hide user layout
        document.getElementById('userLayout').classList.add('hidden');
        document.getElementById('userProfileMenu').classList.add('hidden');
    }
}

// ===========================
// EVENT LISTENERS
// ===========================

/**
 * Setup all event listeners for filters and inputs
 */
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', debounce(filterProblems, 300));
    document.getElementById('sortFilter').addEventListener('change', filterProblems);
}

// ===========================
// DATA LOADING
// ===========================

/**
 * Load user statistics
 */
async function loadUserStats() {
    try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (!token || !storedUser) return;

        const user = JSON.parse(storedUser);
        const userId = user.id;

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // Fetch user statistics from the new endpoint
        const response = await fetch(`${API_URL}/solved-problems/stats/${userId}`, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) throw new Error('İstatistikler yüklenemedi');

        const stats = await response.json();

        // Update stats
        document.getElementById('statTotalProblems').textContent = stats.totalProblems;
        document.getElementById('statSolved').textContent = stats.solvedProblems;
        document.getElementById('statAttempted').textContent = stats.attemptedProblems;
        document.getElementById('statSuccessRate').textContent = stats.successRate;

        lucide.createIcons();
    } catch (error) {
        console.error('İstatistik yükleme hatası:', error);
    }
}

/**
 * Load problems from API
 * @param {number} page - Page number (0-indexed for backend)
 */
async function loadProblems(page = 0) {
    try {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_PROBLEMS}?page=${page}&size=${itemsPerPage}&sort=createdAt,desc`, {
            method: 'GET',
            headers: headers
        });
        if (!response.ok) throw new Error('Problemler yüklenemedi');

        const data = await response.json();
        console.log('API Response:', data);

        // Extract data from Spring Boot Page format
        if (data.content && Array.isArray(data.content)) {
            allProblems = data.content;
            totalPages = data.totalPages;
            currentPage = data.number + 1; // Spring Boot 0-based, we use 1-based
        } else {
            console.error('Beklenmeyen veri formatı:', data);
            allProblems = [];
            totalPages = 0;
            currentPage = 1;
        }

        updateResultCount();
        displayProblems();
        updatePagination();
    } catch (error) {
        console.error('Hata:', error);
        allProblems = [];
        totalPages = 0;
        currentPage = 1;
        updateResultCount();
        displayErrorState();
    }
}

/**
 * Load problems with filters applied
 * @param {number} page - Page number (0-indexed)
 * @param {string} search - Search term
 * @param {string} difficulty - Difficulty level (EASY, MEDIUM, HARD)
 * @param {string} status - Solution status (solved, unsolved)
 * @param {string} sort - Sort parameter
 */
async function loadProblemsWithFilters(page = 0, search = '', difficulty = '', status = '', sort = 'createdAt,desc') {
    try {
        let url = `${API_PROBLEMS}?page=${page}&size=${itemsPerPage}&sort=${sort}`;

        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }
        if (difficulty) {
            url += `&difficulty=${difficulty}`;
        }
        if (status) {
            url += `&status=${status}`;
        }

        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });
        if (!response.ok) throw new Error('Problemler yüklenemedi');

        const data = await response.json();
        console.log('Filtrelenmiş API Response:', data);

        if (data.content && Array.isArray(data.content)) {
            allProblems = data.content;
            totalPages = data.totalPages;
            currentPage = data.number + 1;

            console.log('Backend\'ten gelen problem sayısı:', allProblems.length);
            console.log('Toplam sayfa:', totalPages);
            if (allProblems.length > 0) {
                console.log('İlk problem örneği:', allProblems[0]);
            }
        } else {
            console.error('Beklenmeyen veri formatı:', data);
            allProblems = [];
            totalPages = 0;
            currentPage = 1;
        }

        console.log('displayProblems() çağrılıyor, allProblems.length:', allProblems.length);

        updateResultCount();
        displayProblems();
        updatePagination();
    } catch (error) {
        console.error('Hata:', error);
        allProblems = [];
        totalPages = 0;
        currentPage = 1;
        updateResultCount();
        displayProblems();
        updatePagination();
    }
}

// ===========================
// FILTERING & SORTING
// ===========================

/**
 * Set difficulty filter and update UI
 * @param {string} difficulty - Difficulty level (EASY, MEDIUM, HARD, or empty)
 */
function setDifficultyFilter(difficulty) {
    currentDifficulty = difficulty;

    // Update button states
    document.querySelectorAll('#diffAll, #diffEasy, #diffMedium, #diffHard').forEach(btn => {
        btn.classList.remove('active', 'bg-slate-800', 'dark:bg-slate-700', 'text-white', 'border-slate-800', 'dark:border-slate-700');
        btn.classList.add('bg-white', 'dark:bg-slate-900', 'text-slate-700', 'dark:text-slate-300', 'border-slate-300', 'dark:border-slate-700');
    });

    let activeBtn;
    if (difficulty === 'EASY') activeBtn = document.getElementById('diffEasy');
    else if (difficulty === 'MEDIUM') activeBtn = document.getElementById('diffMedium');
    else if (difficulty === 'HARD') activeBtn = document.getElementById('diffHard');
    else activeBtn = document.getElementById('diffAll');

    activeBtn.classList.remove('bg-white', 'dark:bg-slate-900', 'text-slate-700', 'dark:text-slate-300', 'border-slate-300', 'dark:border-slate-700');
    activeBtn.classList.add('active', 'bg-slate-800', 'dark:bg-slate-700', 'text-white', 'border-slate-800', 'dark:border-slate-700');

    filterProblems();
}

/**
 * Set status filter and update UI
 * @param {string} status - Status (solved, unsolved, or empty)
 */
function setStatusFilter(status) {
    currentStatus = status;

    // Update button states
    document.querySelectorAll('#statusAll, #statusSolved, #statusUnsolved').forEach(btn => {
        btn.classList.remove('active', 'bg-slate-800', 'dark:bg-slate-700', 'text-white', 'border-slate-800', 'dark:border-slate-700');
        btn.classList.add('bg-white', 'dark:bg-slate-900', 'text-slate-700', 'dark:text-slate-300', 'border-slate-300', 'dark:border-slate-700');
    });

    let activeBtn;
    if (status === 'solved') activeBtn = document.getElementById('statusSolved');
    else if (status === 'unsolved') activeBtn = document.getElementById('statusUnsolved');
    else activeBtn = document.getElementById('statusAll');

    activeBtn.classList.remove('bg-white', 'dark:bg-slate-900', 'text-slate-700', 'dark:text-slate-300', 'border-slate-300', 'dark:border-slate-700');
    activeBtn.classList.add('active', 'bg-slate-800', 'dark:bg-slate-700', 'text-white', 'border-slate-800', 'dark:border-slate-700');

    filterProblems();
}

/**
 * Filter problems based on user input
 * Reads filter values and triggers filtered API request
 */
function filterProblems() {
    const searchTerm = document.getElementById('searchInput').value;
    const sortBy = document.getElementById('sortFilter').value;

    // Prepare sort parameter
    let sortParam = 'createdAt,desc';
    if (sortBy === 'oldest') {
        sortParam = 'createdAt,asc';
    } else if (sortBy === 'difficulty-asc') {
        sortParam = 'difficulty,asc';
    } else if (sortBy === 'difficulty-desc') {
        sortParam = 'difficulty,desc';
    } else if (sortBy === 'title') {
        sortParam = 'title,asc';
    }

    // Load problems with filters
    loadProblemsWithFilters(0, searchTerm, currentDifficulty, currentStatus, sortParam);
}

// ===========================
// DISPLAY FUNCTIONS
// ===========================

/**
 * Display problems as cards
 */
function displayProblems() {
    console.log('🎨 displayProblems() fonksiyonu çalışıyor');
    console.log('allProblems:', allProblems);
    console.log('allProblems.length:', allProblems ? allProblems.length : 'undefined');

    // Safety check
    if (!Array.isArray(allProblems)) {
        console.error('❌ allProblems bir array değil:', allProblems);
        allProblems = [];
    }

    const problemsList = document.getElementById('problemsList');
    console.log('problemsList element:', problemsList);

    if (allProblems.length === 0) {
        console.log('⚠️ allProblems boş, boş mesajı gösteriliyor');
        displayEmptyState();
        return;
    }

    problemsList.innerHTML = allProblems.map(problem => createProblemCard(problem)).join('');

    console.log('📝 HTML render edildi, problemsList.innerHTML.length:', problemsList.innerHTML.length);
    console.log('📝 problemsList.children.length:', problemsList.children.length);

    lucide.createIcons();
}

/**
 * Create problem card HTML
 * @param {Object} problem - Problem data
 * @returns {string} HTML for problem card
 */
function createProblemCard(problem) {
    // Check if problem is solved
    const isSolved = problem.solved === true || problem.solved === 'true' || problem.solved === 1;

    const cardClass = 'problem-card bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl shadow-sm overflow-hidden';

    const solvedBadge = isSolved ? `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
            <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
            Çözüldü
        </span>
    ` : '';

    // Difficulty badge - dashboard style with dark mode
    const difficultyBadges = {
        'EASY': {
            class: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            text: 'Kolay'
        },
        'MEDIUM': {
            class: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
            text: 'Orta'
        },
        'HARD': {
            class: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
            text: 'Zor'
        }
    };

    const diffBadge = difficultyBadges[problem.difficulty] || difficultyBadges['MEDIUM'];

    const buttonHTML = isSolved ? `
        <button onclick="startProblem(${problem.id})" class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
            <i data-lucide="refresh-cw" class="w-4 h-4"></i>
            Tekrar Çöz
        </button>
    ` : `
        <button onclick="startProblem(${problem.id})" class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors">
            <i data-lucide="play" class="w-4 h-4"></i>
            Çözmeye Başla
        </button>
    `;

    return `
    <div class="${cardClass}">
        <div class="p-5">
            <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                    <!-- Badges -->
                    <div class="flex items-center gap-2 mb-3">
                        ${solvedBadge}
                        <span class="inline-flex items-center px-2.5 py-1 ${diffBadge.class} rounded-full text-xs font-semibold">
                            ${diffBadge.text}
                        </span>
                    </div>

                    <!-- Title -->
                    <h3 class="text-base font-semibold ${isSolved ? 'text-slate-500 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'} mb-2">
                        ${problem.title}
                    </h3>

                    <!-- Description -->
                    <p class="${isSolved ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400'} text-sm mb-3 line-clamp-2">
                        ${problem.content}
                    </p>

                    <!-- Metadata -->
                    <div class="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span class="flex items-center gap-1">
                            <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
                            ${new Date(problem.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                        ${problem.tags ? `
                            <span class="flex items-center gap-1">
                                <i data-lucide="tag" class="w-3.5 h-3.5"></i>
                                ${problem.tags}
                            </span>
                        ` : ''}
                    </div>
                </div>

                <!-- Action button -->
                <div class="flex-shrink-0">
                    ${buttonHTML}
                </div>
            </div>
        </div>
    </div>
    `;
}

/**
 * Display empty state when no problems found
 */
function displayEmptyState() {
    const problemsList = document.getElementById('problemsList');
    problemsList.innerHTML = `
        <div class="text-center py-12">
            <i data-lucide="search" class="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4"></i>
            <p class="text-slate-600 dark:text-slate-400">Arama kriterlerinize uygun problem bulunamadı.</p>
        </div>
    `;
    lucide.createIcons();
}

/**
 * Display error state when API fails
 */
function displayErrorState() {
    document.getElementById('problemsList').innerHTML = `
        <div class="text-center py-12">
            <i data-lucide="alert-circle" class="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4"></i>
            <p class="text-slate-600 dark:text-slate-400">Problemler yüklenirken bir hata oluştu.</p>
        </div>
    `;
    lucide.createIcons();
}

/**
 * Update result count display
 */
function updateResultCount() {
    const totalResults = document.getElementById('totalResults');
    if (totalResults) {
        totalResults.textContent = allProblems.length;
    }
}

// ===========================
// PAGINATION
// ===========================

/**
 * Update pagination buttons
 */
function updatePagination() {
    const container = document.getElementById('pagination-container');

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // Previous page button
    if (currentPage > 1) {
        paginationHTML += `
            <button onclick="changePage(${currentPage - 1})" class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <i data-lucide="chevron-left" class="w-4 h-4" style="stroke-width:1.5;"></i>
                Önceki
            </button>
        `;
    }

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button onclick="changePage(${i})" class="px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                i === currentPage
                    ? 'bg-slate-800 dark:bg-slate-700 text-white'
                    : 'text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }">
                ${i}
            </button>
        `;
    }

    // Next page button
    if (currentPage < totalPages) {
        paginationHTML += `
            <button onclick="changePage(${currentPage + 1})" class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Sonraki
                <i data-lucide="chevron-right" class="w-4 h-4" style="stroke-width:1.5;"></i>
            </button>
        `;
    }

    container.innerHTML = paginationHTML;
    lucide.createIcons();
}

/**
 * Change to a different page
 * @param {number} page - Page number to load (1-indexed)
 */
function changePage(page) {
    const searchTerm = document.getElementById('searchInput').value;
    const sortBy = document.getElementById('sortFilter').value;

    // Prepare sort parameter
    let sortParam = 'createdAt,desc';
    if (sortBy === 'oldest') {
        sortParam = 'createdAt,asc';
    } else if (sortBy === 'difficulty-asc') {
        sortParam = 'difficulty,asc';
    } else if (sortBy === 'difficulty-desc') {
        sortParam = 'difficulty,desc';
    } else if (sortBy === 'title') {
        sortParam = 'title,asc';
    }

    loadProblemsWithFilters(page - 1, searchTerm, currentDifficulty, currentStatus, sortParam);
}

// ===========================
// NAVIGATION & ACTIONS
// ===========================

/**
 * Start solving a problem
 * Redirects to problem-detail page or shows auth notification
 * @param {number} problemId - Problem ID
 */
function startProblem(problemId) {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
        // Show auth notification for guests
        showNotification(problemId);
        return;
    }

    window.location.href = `problem-detail.html?id=${problemId}`;
}

/**
 * Navigate back
 */
function goBack() {
    window.history.back();
}

// ===========================
// NOTIFICATION SYSTEM
// ===========================

/**
 * Show authentication notification toast
 * @param {number} problemId - Problem ID for redirect after auth
 */
function showNotification(problemId) {
    // Remove existing toast if any
    const existingToast = document.getElementById('auth-toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast notification
    const toast = document.createElement('div');
    toast.id = 'auth-toast';
    toast.className = 'fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:max-w-sm z-50 notification-slide-up';

    toast.innerHTML = `
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
            <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                    <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-600 dark:text-amber-400"></i>
                </div>
            </div>
            <div class="flex-1 min-w-0">
                <h4 class="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">Giriş Gerekli</h4>
                <p class="text-xs text-slate-600 dark:text-slate-400 mb-3">Problemleri çözmek için kayıt olun veya giriş yapın.</p>
                <div class="flex gap-2">
                    <button onclick="goToLogin(${problemId})" class="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                        Giriş Yap
                    </button>
                    <button onclick="goToRegister(${problemId})" class="px-3 py-1.5 text-xs font-medium text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors">
                        Kayıt Ol
                    </button>
                </div>
            </div>
            <button onclick="closeToast()" class="flex-shrink-0 p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>
    `;

    // Add to body
    document.body.appendChild(toast);

    // Load icons
    lucide.createIcons();

    // Auto-close after 5 seconds
    setTimeout(() => {
        closeToast();
    }, 5000);
}

/**
 * Redirect to login page
 * @param {number} problemId - Problem ID for redirect after login
 */
function goToLogin(problemId) {
    closeToast();
    localStorage.setItem('redirectAfterLogin', `problem-detail.html?id=${problemId}`);
    window.location.href = 'login.html';
}

/**
 * Redirect to register page
 * @param {number} problemId - Problem ID for redirect after registration
 */
function goToRegister(problemId) {
    closeToast();
    localStorage.setItem('redirectAfterRegister', `problem-detail.html?id=${problemId}`);
    window.location.href = 'register.html';
}

/**
 * Close toast notification
 */
function closeToast() {
    const toast = document.getElementById('auth-toast');
    if (toast) {
        toast.classList.remove('notification-slide-up');
        toast.classList.add('notification-slide-down');

        setTimeout(() => {
            toast.remove();
        }, 300);
    }
}

/**
 * Hide notification (alias for closeToast)
 */
function hideNotification() {
    closeToast();
}

// ===========================
// HELPER FUNCTIONS
// ===========================

/**
 * Debounce function to limit rapid function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===========================
// GLOBAL EXPORTS
// ===========================

// Export functions to window for onclick handlers
window.startProblem = startProblem;
window.changePage = changePage;
window.showNotification = showNotification;
window.hideNotification = hideNotification;
window.goBack = goBack;
window.goToLogin = goToLogin;
window.goToRegister = goToRegister;
window.closeToast = closeToast;
window.setDifficultyFilter = setDifficultyFilter;
window.setStatusFilter = setStatusFilter;

// ===========================
// EVENT LISTENERS
// ===========================

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initProblemsPage);

// Refresh when page becomes visible
document.addEventListener('visibilitychange', handleVisibilityChange);
