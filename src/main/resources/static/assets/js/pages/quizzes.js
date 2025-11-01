/**
 * Quizzes Page - Quiz listesi ve filtreleme
 */

// State
let currentFilter = 'all';
let allQuizzes = [];
let completedQuizzes = [];
let currentUser = null;

// Constants
const DIFFICULTY_LABELS = { 1: 'Kolay', 2: 'Orta', 3: 'Zor' };
const DIFFICULTY_COLORS = {
    1: 'bg-green-100 text-green-800',
    2: 'bg-yellow-100 text-yellow-800',
    3: 'bg-red-100 text-red-800'
};

/**
 * Initialize page
 */
async function initQuizzesPage() {
    lucide.createIcons();

    // Navbar'ı başlat
    if (AuthService.checkAuth()) {
        document.getElementById('guestAuthButtons').classList.add('hidden');
        document.getElementById('userProfileMenu').classList.remove('hidden');
        document.getElementById('userNavLinks').classList.remove('hidden');
        CommonUtils.updateProfileMenu();

        // Get current user
        try {
            const token = localStorage.getItem('token');
            const payload = JSON.parse(atob(token.split('.')[1]));
            currentUser = { id: payload.userId };

            // Load completed quizzes
            await loadCompletedQuizzes();
        } catch (error) {
            console.error('User bilgisi alınamadı:', error);
        }
    }

    // Dropdown dışına tıklandığında kapat
    document.addEventListener('click', (event) => {
        const dropdown = document.getElementById('userDropdown');
        const button = event.target.closest('button[onclick*="toggleUserDropdown"]');
        if (!button && dropdown && !dropdown.contains(event.target)) {
            dropdown.classList.add('hidden');
        }
    });

    await loadQuizzes();
}

/**
 * Load all quizzes from API
 */
async function loadQuizzes() {
    try {
        const response = await fetch('http://localhost:8080/api/quizzes');
        allQuizzes = await response.json();

        renderQuizzes();
    } catch (error) {
        console.error('Quizler yüklenirken hata:', error);
        showEmptyState();
    }
}

/**
 * Load user's completed quizzes
 */
async function loadCompletedQuizzes() {
    if (!currentUser) return;

    try {
        const response = await APIService.get(`/api/quizzes/users/${currentUser.id}/completed`);
        completedQuizzes = await response.json();
    } catch (error) {
        console.error('Tamamlanan quizler yüklenirken hata:', error);
    }
}

/**
 * Filter quizzes by status
 * @param {string} filter - 'all' or 'completed'
 */
function filterQuizzes(filter) {
    currentFilter = filter;

    // Update button styles
    document.querySelectorAll('[id^="filter-"]').forEach(btn => {
        btn.classList.remove('bg-slate-800', 'text-white');
        btn.classList.add('bg-white', 'border', 'border-slate-200', 'text-slate-600');
    });
    document.getElementById(`filter-${filter}`).classList.remove('bg-white', 'border', 'border-slate-200', 'text-slate-600');
    document.getElementById(`filter-${filter}`).classList.add('bg-slate-800', 'text-white');

    renderQuizzes();
}

/**
 * Render quizzes grid
 */
function renderQuizzes() {
    let quizzesToShow = allQuizzes;

    if (currentFilter === 'completed') {
        const completedIds = completedQuizzes.map(q => q.id);
        quizzesToShow = allQuizzes.filter(q => completedIds.includes(q.id));
    }

    const grid = document.getElementById('quizzesGrid');
    const emptyState = document.getElementById('emptyState');

    if (quizzesToShow.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');

    grid.innerHTML = quizzesToShow.map(quiz => createQuizCard(quiz)).join('');
    lucide.createIcons();
}

/**
 * Create quiz card HTML
 * @param {Object} quiz - Quiz data
 * @returns {string} HTML string
 */
function createQuizCard(quiz) {
    const completedIds = completedQuizzes.map(q => q.id);
    const isCompleted = completedIds.includes(quiz.id);

    return `
        <div class="bg-white rounded-lg border border-slate-200 p-6 hover:border-slate-300 hover:shadow-md transition-all">
            <div class="flex items-start justify-between mb-3">
                <h3 class="text-lg font-semibold text-slate-900">${quiz.title}</h3>
                ${isCompleted ? '<span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">Tamamlandı</span>' : ''}
            </div>
            <p class="text-sm text-slate-600 mb-4">${quiz.description || 'Açıklama yok'}</p>

            <div class="flex items-center gap-3 mb-4">
                <span class="px-2 py-1 text-xs font-medium rounded ${DIFFICULTY_COLORS[quiz.difficulty]}">${DIFFICULTY_LABELS[quiz.difficulty]}</span>
                ${quiz.topicName ? `<span class="text-xs text-slate-500"><i data-lucide="folder" class="w-3 h-3 inline"></i> ${quiz.topicName}</span>` : ''}
            </div>

            <div class="flex items-center gap-4 mb-4 text-xs text-slate-500">
                <span><i data-lucide="file-text" class="w-4 h-4 inline"></i> ${quiz.questionCount} soru</span>
                <span><i data-lucide="star" class="w-4 h-4 inline"></i> ${quiz.totalPoints} puan</span>
                ${quiz.timeLimitMinutes ? `<span><i data-lucide="clock" class="w-4 h-4 inline"></i> ${quiz.timeLimitMinutes} dk</span>` : ''}
            </div>

            <a href="quiz-detail.html?id=${quiz.id}" class="block w-full px-4 py-2 bg-slate-800 text-white text-center rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
                ${isCompleted ? 'Tekrar Çöz' : 'Quize Başla'}
            </a>
        </div>
    `;
}

/**
 * Show empty state
 */
function showEmptyState() {
    document.getElementById('quizzesGrid').classList.add('hidden');
    document.getElementById('emptyState').classList.remove('hidden');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initQuizzesPage);
