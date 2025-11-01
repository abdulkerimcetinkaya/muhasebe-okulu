/**
 * Dashboard Page - Kullanıcı dashboard'u ve istatistikleri
 * Ana sayfa, kullanıcı istatistikleri, son aktiviteler
 */

// ===========================
// CONSTANTS
// ===========================
const API_URL = 'http://localhost:8080/api';

// ===========================
// INITIALIZATION
// ===========================

/**
 * Initialize dashboard page
 */
async function initDashboardPage() {
    lucide.createIcons();

    // Update year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    // Giriş kontrolü - giriş yapılmamışsa index.html'e yönlendir
    if (!storedUser || !token) {
        alert('Bu sayfayı görüntülemek için giriş yapmalısınız.');
        window.location.href = 'index.html';
        return;
    }

    const user = JSON.parse(storedUser);
    showUserInterface(user);
    await CommonUtils.updateProfileMenu();
    await loadStats();
    await loadRecentActivities();
    lucide.createIcons();
}

// ===========================
// CORE FUNCTIONS
// ===========================

/**
 * Show user interface based on user role
 * @param {Object} user - User data from localStorage
 * @param {string} user.role - User role (USER, TEACHER, ADMIN)
 * @param {string} user.firstName - User's first name
 * @param {string} user.username - User's username
 */
function showUserInterface(user) {
    // Giriş yapmamış layout'u gizle
    document.getElementById('guestLayout').classList.add('hidden');
    document.getElementById('guestAuthButtons').classList.add('hidden');

    // Giriş yapmış layout'u göster
    document.getElementById('userLayout').classList.remove('hidden');
    document.getElementById('userProfileMenu').classList.remove('hidden');

    // Welcome message için displayName
    const displayName = user.firstName || user.username;
    document.getElementById('welcomeUsername').textContent = displayName;

    // Role göre linkleri göster/gizle
    if (user.role === 'ADMIN') {
        // Admin için genel linkleri gizle, admin linklerini göster
        document.getElementById('userDashboardLink').classList.add('hidden');
        document.getElementById('userProblemsLink').classList.add('hidden');
        document.getElementById('userProfileLink').classList.add('hidden');
        document.getElementById('adminDashboardLink').classList.remove('hidden');
        document.getElementById('adminLink').classList.remove('hidden');
    } else if (user.role === 'TEACHER') {
        // Öğretmen için genel linkleri gizle, öğretmen linklerini göster
        document.getElementById('userDashboardLink').classList.add('hidden');
        document.getElementById('userProblemsLink').classList.add('hidden');
        document.getElementById('userProfileLink').classList.add('hidden');
        document.getElementById('teacherDashboardLink').classList.remove('hidden');
        document.getElementById('teacherProblemsLink').classList.remove('hidden');
        document.getElementById('teacherProfileLink').classList.remove('hidden');
    } else if (user.role === 'USER') {
        // Normal kullanıcı için genel linkleri göster
        document.getElementById('userDashboardLink').classList.remove('hidden');
        document.getElementById('userProblemsLink').classList.remove('hidden');
        document.getElementById('userProfileLink').classList.remove('hidden');
    }

    // İkonları yeniden yükle
    lucide.createIcons();
}

/**
 * Load user statistics from API
 * Fetches user profile and displays solved count, score, and accuracy
 */
async function loadStats() {
    try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token || !user) return;

        // Kullanıcının profilini al
        const response = await fetch(`${API_URL}/users/${user.id}/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const profile = await response.json();
            document.getElementById('statSolutions').textContent = profile.solvedCount || 0;
            document.getElementById('statScore').textContent = profile.totalScore || 0;

            // Doğru cevap oranını hesapla
            const accuracy = profile.solvedCount > 0 ?
                Math.round((profile.correctCount || 0) / profile.solvedCount * 100) : 0;
            document.getElementById('statAccuracy').textContent = accuracy + '%';
        }

    } catch (error) {
        console.error('İstatistikler yüklenirken hata:', error);
    }
}

/**
 * Load recent user activities
 * Displays last 5 solved problems with scores and dates
 */
async function loadRecentActivities() {
    try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token || !user) return;

        // Son çözülen problemleri al
        const response = await fetch(`${API_URL}/users/${user.id}/solved-problems?limit=5`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const activities = await response.json();
            const container = document.getElementById('recentActivities');

            if (activities.length === 0) {
                container.innerHTML = createEmptyActivitiesView();
            } else {
                container.innerHTML = activities.map(activity => createActivityItem(activity)).join('');
            }

            lucide.createIcons();
        }

    } catch (error) {
        console.error('Son aktiviteler yüklenirken hata:', error);
        document.getElementById('recentActivities').innerHTML = createErrorView();
    }
}

// ===========================
// HELPER FUNCTIONS
// ===========================

/**
 * Create empty activities view HTML
 * @returns {string} HTML for empty state
 */
function createEmptyActivitiesView() {
    return `
        <div class="text-center py-8 text-slate-500">
            <i data-lucide="book-open" class="w-12 h-12 mx-auto mb-4" style="stroke-width: 1.5;"></i>
            <p>Henüz çözülmüş problem yok.</p>
            <a href="problems.html" class="text-blue-600 hover:text-blue-800 mt-2 inline-block">
                İlk probleminizi çözmeye başlayın!
            </a>
        </div>
    `;
}

/**
 * Create activity item HTML
 * @param {Object} activity - Activity data
 * @param {string} activity.problemTitle - Problem title
 * @param {string} activity.solvedAt - ISO date string
 * @param {number} activity.score - Points earned
 * @returns {string} HTML for activity item
 */
function createActivityItem(activity) {
    return `
        <div class="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
            <div class="w-10 h-10 bg-green-100 text-green-600 flex items-center justify-center rounded-lg">
                <i data-lucide="check-circle" class="w-5 h-5" style="stroke-width: 1.5;"></i>
            </div>
            <div class="flex-1">
                <p class="text-sm font-medium text-slate-900">${activity.problemTitle || 'Problem Çözüldü'}</p>
                <p class="text-xs text-slate-500">${new Date(activity.solvedAt).toLocaleDateString('tr-TR')}</p>
            </div>
            <div class="text-sm font-medium text-green-600">
                +${activity.score || 10} puan
            </div>
        </div>
    `;
}

/**
 * Create error view HTML
 * @returns {string} HTML for error state
 */
function createErrorView() {
    return `
        <div class="text-center py-8 text-slate-500">
            <p>Aktiviteler yüklenirken bir hata oluştu.</p>
        </div>
    `;
}

// ===========================
// EVENT LISTENERS
// ===========================

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initDashboardPage);
