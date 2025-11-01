// ===========================
// STUDY CARD DETAIL PAGE
// ===========================

/**
 * study-detail.js - JavaScript for study-detail.html
 * Handles master-detail layout with sections and dynamic content
 */

const API_URL = window.API_URL || 'http://localhost:8080/api';
let currentCardId = null;
let currentCard = null;
let currentSectionId = null;

// ===========================
// INITIALIZATION
// ===========================

/**
 * Initialize study card detail page
 */
async function initStudyDetailPage() {
    console.log('Initializing study card detail page...');

    // Get card ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentCardId = urlParams.get('id');

    if (!currentCardId) {
        showError('Kart ID bulunamadı');
        setTimeout(() => window.location.href = 'study.html', 2000);
        return;
    }

    // Check authentication
    checkAuth();

    // Load card with sections
    await loadStudyCard();

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
// STUDY CARD LOADING
// ===========================

/**
 * Load study card with sections
 */
async function loadStudyCard() {
    try {
        const response = await fetch(`${API_URL}/study-cards/${currentCardId}`);

        if (!response.ok) {
            throw new Error('Failed to load study card');
        }

        currentCard = await response.json();
        displayCardHeader(currentCard);
        displaySections(currentCard.sections);

        // Auto-select first section
        if (currentCard.sections && currentCard.sections.length > 0) {
            selectSection(currentCard.sections[0].id);
        } else {
            showEmptyContent();
        }

    } catch (error) {
        console.error('Error loading study card:', error);
        showError('Kart yüklenirken hata oluştu');
        setTimeout(() => window.location.href = 'study.html', 2000);
    }
}

/**
 * Display card header
 */
function displayCardHeader(card) {
    document.getElementById('cardTitle').textContent = card.title;
    document.getElementById('cardDescription').textContent = card.description || '';
    document.getElementById('breadcrumbTitle').textContent = card.title;
}

/**
 * Display sections in left panel
 */
function displaySections(sections) {
    const sectionsList = document.getElementById('sectionsList');
    sectionsList.innerHTML = '';

    if (!sections || sections.length === 0) {
        sectionsList.innerHTML = '<p class="text-sm text-slate-500">Henüz bölüm yok</p>';
        return;
    }

    sections.forEach(section => {
        const sectionElement = createSectionElement(section);
        sectionsList.appendChild(sectionElement);
    });

    lucide.createIcons();
}

/**
 * Create section list item
 */
function createSectionElement(section) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'section-item px-4 py-3 rounded-lg cursor-pointer';
    sectionDiv.id = `section-${section.id}`;
    sectionDiv.onclick = () => selectSection(section.id);

    const icon = getContentTypeIcon(section.contentType);

    sectionDiv.innerHTML = `
        <div class="flex items-center gap-3">
            <i data-lucide="${icon}" class="w-4 h-4 text-slate-500 flex-shrink-0"></i>
            <span class="text-sm font-medium text-slate-700">${escapeHtml(section.title)}</span>
        </div>
    `;

    return sectionDiv;
}

/**
 * Get icon for content type
 */
function getContentTypeIcon(contentType) {
    const iconMap = {
        'TEXT': 'file-text',
        'PROBLEM': 'puzzle',
        'QUIZ': 'help-circle'
    };
    return iconMap[contentType] || 'file-text';
}

// ===========================
// SECTION SELECTION
// ===========================

/**
 * Select a section and load its content
 */
async function selectSection(sectionId) {
    // Update active state
    document.querySelectorAll('.section-item').forEach(item => {
        item.classList.remove('active');
    });
    const selectedItem = document.getElementById(`section-${sectionId}`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }

    currentSectionId = sectionId;

    // Load section content
    await loadSectionContent(sectionId);
}

/**
 * Load section content
 */
async function loadSectionContent(sectionId) {
    showLoadingContent();

    try {
        const response = await fetch(`${API_URL}/study-cards/sections/${sectionId}`);

        if (!response.ok) {
            throw new Error('Failed to load section content');
        }

        const section = await response.json();
        displaySectionContent(section);

    } catch (error) {
        console.error('Error loading section content:', error);
        showError('Bölüm içeriği yüklenirken hata oluştu');
        hideLoadingContent();
    }
}

/**
 * Display section content based on type
 */
function displaySectionContent(section) {
    hideLoadingContent();

    document.getElementById('sectionTitle').textContent = section.title;

    const contentArea = document.getElementById('sectionContent');
    contentArea.innerHTML = '';

    switch (section.contentType) {
        case 'TEXT':
            displayTextContent(section.content);
            break;
        case 'PROBLEM':
            displayProblemLink(section.relatedProblem);
            break;
        case 'QUIZ':
            displayQuizLink(section.relatedQuiz);
            break;
        default:
            contentArea.innerHTML = '<p class="text-slate-600">İçerik bulunamadı</p>';
    }

    document.getElementById('contentArea').classList.remove('hidden');
    lucide.createIcons();
}

/**
 * Display text content
 */
function displayTextContent(content) {
    const contentArea = document.getElementById('sectionContent');
    contentArea.innerHTML = content || '<p class="text-slate-600">İçerik yok</p>';
}

/**
 * Display problem link
 */
function displayProblemLink(problem) {
    const contentArea = document.getElementById('sectionContent');

    if (!problem) {
        contentArea.innerHTML = '<p class="text-slate-600">Problem bulunamadı</p>';
        return;
    }

    const difficultyColors = {
        'EASY': 'bg-green-100 text-green-800',
        'MEDIUM': 'bg-yellow-100 text-yellow-800',
        'HARD': 'bg-red-100 text-red-800'
    };

    const difficultyLabels = {
        'EASY': 'Kolay',
        'MEDIUM': 'Orta',
        'HARD': 'Zor'
    };

    const diffClass = difficultyColors[problem.difficulty] || difficultyColors['EASY'];
    const diffLabel = difficultyLabels[problem.difficulty] || 'Kolay';

    contentArea.innerHTML = `
        <div class="problem-card bg-blue-50 border border-blue-200 rounded-lg p-6 cursor-pointer" onclick="navigateToProblem(${problem.id})">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                        <i data-lucide="puzzle" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-slate-900">${escapeHtml(problem.title)}</h3>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${diffClass}">${diffLabel}</span>
                    </div>
                </div>
                <i data-lucide="arrow-right" class="w-5 h-5 text-blue-600"></i>
            </div>
            <p class="text-sm text-slate-600 mb-4">${escapeHtml(problem.content.substring(0, 150))}${problem.content.length > 150 ? '...' : ''}</p>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4 text-xs text-slate-500">
                    <div class="flex items-center gap-1">
                        <i data-lucide="star" class="w-4 h-4"></i>
                        <span>${problem.points || 0} puan</span>
                    </div>
                </div>
                <button class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                    <span>Problemi Çöz</span>
                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    `;
}

/**
 * Display quiz link
 */
function displayQuizLink(quiz) {
    const contentArea = document.getElementById('sectionContent');

    if (!quiz) {
        contentArea.innerHTML = '<p class="text-slate-600">Quiz bulunamadı</p>';
        return;
    }

    contentArea.innerHTML = `
        <div class="quiz-card bg-purple-50 border border-purple-200 rounded-lg p-6 cursor-pointer" onclick="navigateToQuiz(${quiz.id})">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                        <i data-lucide="help-circle" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-slate-900">${escapeHtml(quiz.title)}</h3>
                        <p class="text-sm text-slate-600">${escapeHtml(quiz.description || '')}</p>
                    </div>
                </div>
                <i data-lucide="arrow-right" class="w-5 h-5 text-purple-600"></i>
            </div>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4 text-xs text-slate-500">
                    <div class="flex items-center gap-1">
                        <i data-lucide="list" class="w-4 h-4"></i>
                        <span>${quiz.questionCount || 0} soru</span>
                    </div>
                </div>
                <button class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors">
                    <span>Quiz'e Başla</span>
                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    `;
}

// ===========================
// NAVIGATION
// ===========================

/**
 * Navigate to problem
 */
function navigateToProblem(problemId) {
    window.location.href = `problem-detail.html?id=${problemId}`;
}

/**
 * Navigate to quiz
 */
function navigateToQuiz(quizId) {
    window.location.href = `quiz-detail.html?id=${quizId}`;
}

/**
 * Go back to study cards list
 */
function goBack() {
    window.location.href = 'study.html';
}

// ===========================
// UI STATES
// ===========================

/**
 * Show loading content
 */
function showLoadingContent() {
    document.getElementById('loadingContent').classList.remove('hidden');
    document.getElementById('contentArea').classList.add('hidden');
    document.getElementById('emptyContent').classList.add('hidden');
}

/**
 * Hide loading content
 */
function hideLoadingContent() {
    document.getElementById('loadingContent').classList.add('hidden');
}

/**
 * Show empty content
 */
function showEmptyContent() {
    document.getElementById('loadingContent').classList.add('hidden');
    document.getElementById('contentArea').classList.add('hidden');
    document.getElementById('emptyContent').classList.remove('hidden');
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
    document.getElementById('guestAuthButtons').classList.add('hidden');
    document.getElementById('userLayout').classList.remove('hidden');
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
    document.getElementById('guestAuthButtons').classList.remove('hidden');
    document.getElementById('userLayout').classList.add('hidden');
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
window.goBack = goBack;
window.navigateToProblem = navigateToProblem;
window.navigateToQuiz = navigateToQuiz;

// ===========================
// EVENT LISTENERS
// ===========================

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initStudyDetailPage);

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('profileDropdown');
    const button = document.querySelector('[onclick="toggleProfileDropdown()"]');
    if (dropdown && button && !button.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});
