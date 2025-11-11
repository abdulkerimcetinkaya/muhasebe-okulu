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
    1: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    2: 'bg-amber-100 text-amber-700 border-amber-200',
    3: 'bg-rose-100 text-rose-700 border-rose-200'
};
const DIFFICULTY_ICONS = {
    1: 'smile',
    2: 'meh',
    3: 'flame'
};

/**
 * Initialize page
 */
async function initQuizzesPage() {
    lucide.createIcons();

    // Show loading state
    showLoadingState();

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

        updateStats();
        renderQuizzes();
        hideLoadingState();
    } catch (error) {
        console.error('Quizler yüklenirken hata:', error);
        hideLoadingState();
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
 * Update statistics in hero section
 */
function updateStats() {
    const totalQuizzes = allQuizzes.length;
    const completedCount = completedQuizzes.length;

    document.getElementById('statTotalQuizzes').textContent = totalQuizzes;
    document.getElementById('statCompletedQuizzes').textContent = completedCount;
}

/**
 * Filter quizzes by status
 * @param {string} filter - 'all', 'completed', or 'active'
 */
function filterQuizzes(filter) {
    currentFilter = filter;

    // Update button styles
    document.querySelectorAll('[id^="filter-"]').forEach(btn => {
        btn.classList.remove('bg-slate-800', 'dark:bg-slate-700', 'text-white', 'shadow-sm');
        btn.classList.add('bg-white', 'dark:bg-slate-800', 'border', 'border-slate-200', 'dark:border-slate-700', 'text-slate-600', 'dark:text-slate-300');
    });

    const activeBtn = document.getElementById(`filter-${filter}`);
    activeBtn.classList.remove('bg-white', 'dark:bg-slate-800', 'border', 'border-slate-200', 'dark:border-slate-700', 'text-slate-600', 'dark:text-slate-300');
    activeBtn.classList.add('bg-slate-800', 'dark:bg-slate-700', 'text-white', 'shadow-sm');

    renderQuizzes();
}

/**
 * Render quizzes grid
 */
function renderQuizzes() {
    const completedIds = completedQuizzes.map(q => q.id);
    let quizzesToShow = allQuizzes;

    if (currentFilter === 'completed') {
        quizzesToShow = allQuizzes.filter(q => completedIds.includes(q.id));
    } else if (currentFilter === 'active') {
        quizzesToShow = allQuizzes.filter(q => !completedIds.includes(q.id));
    }

    const grid = document.getElementById('quizzesGrid');
    const emptyState = document.getElementById('emptyState');

    if (quizzesToShow.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        lucide.createIcons();
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
    const difficultyIcon = DIFFICULTY_ICONS[quiz.difficulty] || 'help-circle';

    // Find completed quiz data to get user's score
    const completedQuizData = completedQuizzes.find(q => q.id === quiz.id);
    const displayScore = isCompleted && completedQuizData?.userScore !== undefined
        ? completedQuizData.userScore
        : quiz.totalPoints;

    return `
        <div class="group bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
            <!-- Header with gradient -->
            <div class="bg-gradient-to-br from-slate-50 dark:from-slate-700 to-slate-100 dark:to-slate-800 p-6 border-b border-slate-200 dark:border-slate-700">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors line-clamp-2">
                            ${quiz.title}
                        </h3>
                    </div>
                    ${isCompleted ? `
                        <div class="ml-2 flex-shrink-0">
                            <div class="flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-semibold">
                                <i data-lucide="check-circle" class="w-3 h-3"></i>
                                Tamamlandı
                            </div>
                        </div>
                    ` : ''}
                </div>
                <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">${quiz.description || 'Muhasebe bilginizi test edin'}</p>
            </div>

            <!-- Content -->
            <div class="p-6">
                <!-- Tags -->
                <div class="flex flex-wrap items-center gap-2 mb-4">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border ${DIFFICULTY_COLORS[quiz.difficulty]}">
                        <i data-lucide="${difficultyIcon}" class="w-3.5 h-3.5"></i>
                        ${DIFFICULTY_LABELS[quiz.difficulty]}
                    </span>
                    ${quiz.topicName ? `
                        <span class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 rounded-lg">
                            <i data-lucide="folder" class="w-3.5 h-3.5"></i>
                            ${quiz.topicName}
                        </span>
                    ` : ''}
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-2 gap-3 mb-5">
                    <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <div class="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                            <i data-lucide="file-text" class="w-4 h-4 text-slate-500 dark:text-slate-400"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-xs text-slate-500 dark:text-slate-400">Sorular</span>
                            <span class="font-semibold text-slate-900 dark:text-slate-100">${quiz.questionCount}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <div class="w-8 h-8 ${isCompleted ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'} rounded-lg flex items-center justify-center">
                            <i data-lucide="star" class="w-4 h-4 ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-xs text-slate-500 dark:text-slate-400">${isCompleted ? 'Aldığınız' : 'Puan'}</span>
                            <span class="font-semibold text-slate-900 dark:text-slate-100">${displayScore}${isCompleted ? ` / ${quiz.totalPoints}` : ''}</span>
                        </div>
                    </div>
                    ${quiz.timeLimitMinutes ? `
                        <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 col-span-2">
                            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <i data-lucide="clock" class="w-4 h-4 text-blue-600 dark:text-blue-400"></i>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs text-slate-500 dark:text-slate-400">Süre</span>
                                <span class="font-semibold text-slate-900 dark:text-slate-100">${quiz.timeLimitMinutes} dakika</span>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- Action Button -->
                <a href="quiz-detail.html?id=${quiz.id}"
                   class="group/btn relative block w-full px-4 py-3 bg-gradient-to-r from-slate-800 dark:from-slate-700 to-slate-900 dark:to-slate-800 text-white text-center rounded-lg text-sm font-semibold overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
                    <span class="relative z-10 flex items-center justify-center gap-2">
                        ${isCompleted ? `
                            <i data-lucide="rotate-cw" class="w-4 h-4"></i>
                            Tekrar Çöz
                        ` : `
                            <i data-lucide="play-circle" class="w-4 h-4"></i>
                            Quize Başla
                        `}
                    </span>
                    <div class="absolute inset-0 bg-gradient-to-r from-slate-700 dark:from-slate-600 to-slate-800 dark:to-slate-700 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                </a>
            </div>
        </div>
    `;
}

/**
 * Show loading state
 */
function showLoadingState() {
    document.getElementById('loadingState').classList.remove('hidden');
    document.getElementById('quizzesGrid').classList.add('hidden');
    document.getElementById('emptyState').classList.add('hidden');
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    document.getElementById('loadingState').classList.add('hidden');
}

/**
 * Show empty state
 */
function showEmptyState() {
    document.getElementById('quizzesGrid').classList.add('hidden');
    document.getElementById('emptyState').classList.remove('hidden');
    document.getElementById('loadingState').classList.add('hidden');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initQuizzesPage);
