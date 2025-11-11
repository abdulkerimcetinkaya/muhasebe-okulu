/**
 * Study Cards Page - Öğrenme kartları ve filtreleme
 */

// State
let currentFilter = 'all';
let allCards = [];
let cardProgress = {}; // { cardId: { status, completedSections, totalSections, percentage } }
let currentUser = null;

// API URL
const API_URL = window.API_URL || 'http://localhost:8080/api';

/**
 * Initialize study cards page
 */
async function initStudyPage() {
    lucide.createIcons();

    // Show loading state
    showLoadingState();

    // Check authentication and get current user
    if (AuthService.checkAuth()) {
        document.getElementById('guestAuthButtons').classList.add('hidden');
        document.getElementById('userProfileMenu').classList.remove('hidden');
        document.getElementById('guestLayout').classList.add('hidden');
        document.getElementById('userLayout').classList.remove('hidden');
        CommonUtils.updateProfileMenu();

        // Get current user
        try {
            const token = localStorage.getItem('token');
            const payload = JSON.parse(atob(token.split('.')[1]));
            currentUser = { id: payload.userId };

            // Load user progress
            await loadAllProgress();
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

    await loadStudyCards();
}


/**
 * Load all study cards from API
 */
async function loadStudyCards() {
    try {
        const response = await fetch(`${API_URL}/study-cards`);

        if (!response.ok) {
            throw new Error('Failed to load study cards');
        }

        allCards = await response.json();
        updateStats();
        renderCards();
        hideLoadingState();
    } catch (error) {
        console.error('Kartlar yüklenirken hata:', error);
        hideLoadingState();
        showEmptyState();
    }
}

/**
 * Load user's progress across all cards
 */
async function loadAllProgress() {
    if (!currentUser) {
        console.log('No current user, skipping progress load');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        console.log('Loading progress for user:', currentUser.id);
        console.log('Token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

        const response = await fetch(`${API_URL}/study-cards/progress`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Progress response status:', response.status);

        if (response.ok) {
            const progressList = await response.json();
            console.log('Progress loaded:', progressList);

            // Convert to map for easy lookup
            cardProgress = {};
            progressList.forEach(p => {
                cardProgress[p.cardId] = p;
            });
            console.log('Card progress map:', cardProgress);
        } else {
            console.error('Progress load failed with status:', response.status);
            const errorText = await response.text();
            console.error('Error response:', errorText);
        }
    } catch (error) {
        console.error('İlerleme yüklenirken hata:', error);
    }
}

/**
 * Update statistics in hero section
 */
function updateStats() {
    const totalCards = Array.isArray(allCards) ? allCards.length : 0;

    let completedCount = 0;
    let inProgressCount = 0;

    // Calculate from progress data
    Object.values(cardProgress).forEach(progress => {
        if (progress.status === 'completed') {
            completedCount++;
        } else if (progress.status === 'in-progress') {
            inProgressCount++;
        }
    });

    const progress = totalCards > 0 ? Math.round((completedCount / totalCards) * 100) : 0;

    document.getElementById('statTotalCards').textContent = totalCards;
    document.getElementById('statCompletedCards').textContent = completedCount;
    document.getElementById('statProgress').textContent = progress;

    // Günlük seri için örnek veri (gerçek veriye bağlanabilir)
    document.getElementById('statStreak').textContent = inProgressCount;
}

/**
 * Filter cards by category
 */
function filterByCategory(filter) {
    currentFilter = filter;

    // Update button styles
    document.querySelectorAll('[id^="filter-"]').forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'dark:bg-indigo-700', 'text-white', 'shadow-sm');
        btn.classList.add('bg-white', 'dark:bg-slate-800', 'border', 'border-slate-200', 'dark:border-slate-700', 'text-slate-600', 'dark:text-slate-300');
    });

    const activeBtn = document.getElementById(`filter-${filter}`);
    activeBtn.classList.remove('bg-white', 'dark:bg-slate-800', 'border', 'border-slate-200', 'dark:border-slate-700', 'text-slate-600', 'dark:text-slate-300');
    activeBtn.classList.add('bg-indigo-600', 'dark:bg-indigo-700', 'text-white', 'shadow-sm');

    renderCards();
}

/**
 * Filter cards by search input
 */
function filterCards() {
    renderCards();
}

/**
 * Render cards grid based on current filters
 */
function renderCards() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';

    let cardsToShow = allCards;

    // Separate in-progress cards
    let inProgressCards = [];
    let otherCards = [];

    allCards.forEach(card => {
        const progress = cardProgress[card.id];
        const status = progress ? progress.status : 'not-started';

        if (status === 'in-progress') {
            inProgressCards.push({...card, progress: progress});
        } else {
            otherCards.push({...card, progress: progress});
        }
    });

    // Apply category filter
    if (currentFilter === 'completed') {
        cardsToShow = otherCards.filter(c => c.progress && c.progress.status === 'completed');
        inProgressCards = []; // Hide in-progress section
    } else if (currentFilter === 'in-progress') {
        cardsToShow = inProgressCards;
        inProgressCards = []; // All cards are in main section
    } else {
        cardsToShow = otherCards;
    }

    // Apply search filter
    if (searchTerm) {
        cardsToShow = cardsToShow.filter(c =>
            c.title.toLowerCase().includes(searchTerm) ||
            (c.description && c.description.toLowerCase().includes(searchTerm))
        );
        inProgressCards = inProgressCards.filter(c =>
            c.title.toLowerCase().includes(searchTerm) ||
            (c.description && c.description.toLowerCase().includes(searchTerm))
        );
    }

    // Render in-progress section (only in 'all' filter and no search)
    const inProgressSection = document.getElementById('inProgressSection');
    const inProgressGrid = document.getElementById('inProgressGrid');

    if (currentFilter === 'all' && !searchTerm && inProgressCards.length > 0) {
        inProgressSection.classList.remove('hidden');
        inProgressGrid.innerHTML = inProgressCards.map(card => createCardHTML(card)).join('');
    } else {
        inProgressSection.classList.add('hidden');
    }

    // Render main grid
    const grid = document.getElementById('cardsGrid');
    const emptyState = document.getElementById('emptyState');

    if (cardsToShow.length === 0 && inProgressCards.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        lucide.createIcons();
        return;
    }

    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');

    grid.innerHTML = cardsToShow.map(card => createCardHTML(card)).join('');
    lucide.createIcons();
}

/**
 * Create card HTML with premium design
 */
function createCardHTML(card) {
    const progress = card.progress || cardProgress[card.id];
    const status = progress ? progress.status : 'not-started';
    const percentage = progress ? progress.percentage : 0;
    const completedSections = progress ? progress.completedSections : 0;
    const totalSections = card.sectionCount || 0;

    const isCompleted = status === 'completed';
    const isInProgress = status === 'in-progress';

    return `
        <div class="group bg-white dark:bg-slate-800 rounded-xl border-2 ${isInProgress ? 'border-indigo-300 dark:border-indigo-800' : 'border-slate-200 dark:border-slate-700'} hover:border-slate-300 dark:hover:border-slate-600 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
             onclick="navigateToCard('${card.id}')">
            <!-- Header with gradient -->
            <div class="bg-gradient-to-br from-slate-50 dark:from-slate-700 to-slate-100 dark:to-slate-800 p-6 border-b border-slate-200 dark:border-slate-700 relative">
                ${isInProgress ? `
                    <div class="absolute top-3 right-3">
                        <div class="flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-semibold">
                            <i data-lucide="clock" class="w-3 h-3"></i>
                            Devam Ediyor
                        </div>
                    </div>
                ` : ''}
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors line-clamp-2">
                            ${card.title}
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
                <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">${card.description || 'Muhasebe konularını öğrenin'}</p>
            </div>

            <!-- Content -->
            <div class="p-6">
                <!-- Stats -->
                <div class="grid grid-cols-2 gap-3 mb-5">
                    <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <div class="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                            <i data-lucide="book-open" class="w-4 h-4 text-slate-500 dark:text-slate-400"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-xs text-slate-500 dark:text-slate-400">Bölümler</span>
                            <span class="font-semibold text-slate-900 dark:text-slate-100">${totalSections}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <div class="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                            <i data-lucide="trending-up" class="w-4 h-4 text-indigo-600 dark:text-indigo-400"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-xs text-slate-500 dark:text-slate-400">İlerleme</span>
                            <span class="font-semibold text-slate-900 dark:text-slate-100">${percentage}%</span>
                        </div>
                    </div>
                </div>

                <!-- Progress Bar -->
                ${percentage > 0 ? `
                    <div class="mb-5">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-xs text-slate-600 dark:text-slate-400">${completedSections}/${totalSections} bölüm tamamlandı</span>
                        </div>
                        <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                            <div class="bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 h-2 rounded-full transition-all" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                ` : ''}

                <!-- Action Button -->
                <button class="group/btn relative w-full px-4 py-3 bg-gradient-to-r from-slate-800 dark:from-slate-700 to-slate-900 dark:to-slate-800 text-white text-center rounded-lg text-sm font-semibold overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
                    <span class="relative z-10 flex items-center justify-center gap-2">
                        ${isCompleted ? `
                            <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                            Tekrar Gözden Geçir
                        ` : isInProgress ? `
                            <i data-lucide="play-circle" class="w-4 h-4"></i>
                            Devam Et
                        ` : `
                            <i data-lucide="play-circle" class="w-4 h-4"></i>
                            Öğrenmeye Başla
                        `}
                    </span>
                    <div class="absolute inset-0 bg-gradient-to-r from-slate-700 dark:from-slate-600 to-slate-800 dark:to-slate-700 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                </button>
            </div>
        </div>
    `;
}

/**
 * Navigate to card detail page
 */
function navigateToCard(cardId) {
    window.location.href = `study-detail.html?id=${cardId}`;
}

/**
 * Show loading state
 */
function showLoadingState() {
    document.getElementById('loadingState').classList.remove('hidden');
    document.getElementById('cardsGrid').classList.add('hidden');
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
    document.getElementById('cardsGrid').classList.add('hidden');
    document.getElementById('emptyState').classList.remove('hidden');
    document.getElementById('loadingState').classList.add('hidden');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initStudyPage);
