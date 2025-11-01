// ===========================
// STUDY CARDS LISTING PAGE
// ===========================

/**
 * study.js - JavaScript for study.html
 * Handles loading and displaying study cards grid
 */

const API_URL = window.API_URL || 'http://localhost:8080/api';

// ===========================
// INITIALIZATION
// ===========================

/**
 * Initialize study cards page
 */
async function initStudyPage() {
    console.log('Initializing study cards page...');

    // Check authentication
    checkAuth();

    // Load study cards
    await loadStudyCards();

    // Initialize icons
    lucide.createIcons();
}

// ===========================
// AUTH CHECKING
// ===========================

/**
 * Check authentication status and update UI
 */
function checkAuth() {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
        const user = JSON.parse(storedUser);
        showUserInterface(user);
    } else {
        showGuestInterface();
    }
}

// ===========================
// STUDY CARDS LOADING
// ===========================

/**
 * Load all study cards from API
 */
async function loadStudyCards() {
    try {
        const response = await fetch(`${API_URL}/study-cards`);

        if (!response.ok) {
            throw new Error('Failed to load study cards');
        }

        const cards = await response.json();
        displayStudyCards(cards);

    } catch (error) {
        console.error('Error loading study cards:', error);
        showError('Kartlar yüklenirken hata oluştu');
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('emptyState').classList.remove('hidden');
    }
}

/**
 * Display study cards in grid
 */
function displayStudyCards(cards) {
    const loadingState = document.getElementById('loadingState');
    const cardsGrid = document.getElementById('cardsGrid');
    const emptyState = document.getElementById('emptyState');

    loadingState.classList.add('hidden');

    if (!cards || cards.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    cardsGrid.classList.remove('hidden');
    cardsGrid.innerHTML = '';

    cards.forEach(card => {
        const cardElement = createCardElement(card);
        cardsGrid.appendChild(cardElement);
    });

    lucide.createIcons();
}

/**
 * Create card element
 */
function createCardElement(card) {
    const colorClasses = getColorClasses(card.color);
    const iconName = card.icon || 'book-open';

    const cardDiv = document.createElement('div');
    cardDiv.className = 'study-card bg-white rounded-lg border border-slate-200 p-6 cursor-pointer shadow-sm';
    cardDiv.onclick = () => navigateToCard(card.id);

    cardDiv.innerHTML = `
        <div class="flex items-start gap-4">
            <div class="card-icon-wrapper flex-shrink-0 w-12 h-12 ${colorClasses.bg} ${colorClasses.text} rounded-lg flex items-center justify-center">
                <i data-lucide="${iconName}" class="w-6 h-6"></i>
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="text-lg font-semibold text-slate-900 mb-2">${escapeHtml(card.title)}</h3>
                <p class="text-sm text-slate-600 mb-3 line-clamp-2">${escapeHtml(card.description || '')}</p>
                <div class="flex items-center gap-4 text-xs text-slate-500">
                    <div class="flex items-center gap-1">
                        <i data-lucide="book-open" class="w-4 h-4"></i>
                        <span>${card.sectionCount || 0} bölüm</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    return cardDiv;
}

/**
 * Get color classes for card
 */
function getColorClasses(color) {
    const colorMap = {
        'blue': { bg: 'bg-blue-100', text: 'text-blue-600' },
        'green': { bg: 'bg-green-100', text: 'text-green-600' },
        'purple': { bg: 'bg-purple-100', text: 'text-purple-600' },
        'orange': { bg: 'bg-orange-100', text: 'text-orange-600' },
        'red': { bg: 'bg-red-100', text: 'text-red-600' },
        'yellow': { bg: 'bg-yellow-100', text: 'text-yellow-600' },
        'pink': { bg: 'bg-pink-100', text: 'text-pink-600' },
        'indigo': { bg: 'bg-indigo-100', text: 'text-indigo-600' },
    };

    return colorMap[color] || colorMap['blue'];
}

/**
 * Navigate to card detail page
 */
function navigateToCard(cardId) {
    window.location.href = `study-detail.html?id=${cardId}`;
}

// ===========================
// AUTH UI
// ===========================

/**
 * Show user interface
 */
function showUserInterface(user) {
    // Hide guest layout, show user layout
    document.getElementById('guestLayout').classList.add('hidden');
    document.getElementById('userLayout').classList.remove('hidden');
    document.getElementById('guestAuthButtons').classList.add('hidden');
    document.getElementById('userProfileMenu').classList.remove('hidden');

    // Set user display name
    const firstName = user.firstName || user.username;
    const userDisplayName = document.getElementById('userDisplayName');
    if (userDisplayName) {
        userDisplayName.textContent = `Hoşgeldin, ${firstName}`;
    }

    // Show admin links if admin
    if (user.role === 'ADMIN') {
        const adminDashboardLink = document.getElementById('adminDashboardLink');
        const adminLink = document.getElementById('adminLink');
        const adminQuizzesLink = document.getElementById('adminQuizzesLink');

        if (adminDashboardLink) adminDashboardLink.classList.remove('hidden');
        if (adminLink) adminLink.classList.remove('hidden');
        if (adminQuizzesLink) adminQuizzesLink.classList.remove('hidden');
    }

    lucide.createIcons();
}

/**
 * Show guest interface
 */
function showGuestInterface() {
    document.getElementById('guestLayout').classList.remove('hidden');
    document.getElementById('userLayout').classList.add('hidden');
    document.getElementById('guestAuthButtons').classList.remove('hidden');
    document.getElementById('userProfileMenu').classList.add('hidden');
    lucide.createIcons();
}

/**
 * Toggle profile dropdown
 */
function toggleProfileDropdown() {
    document.getElementById('profileDropdown').classList.toggle('hidden');
}

/**
 * Logout
 */
function logout(event) {
    if (event) event.preventDefault();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

/**
 * Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show error message
 */
function showError(message) {
    alert(message); // Simple alert for now, can be replaced with modal
}

// ===========================
// GLOBAL EXPORTS
// ===========================
window.toggleProfileDropdown = toggleProfileDropdown;
window.logout = logout;

// ===========================
// EVENT LISTENERS
// ===========================

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initStudyPage);

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('profileDropdown');
    const button = document.querySelector('[onclick="toggleProfileDropdown()"]');
    if (dropdown && button && !button.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});
