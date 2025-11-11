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
let sidebarOpen = false;

// ===========================
// SIDEBAR TOGGLE
// ===========================

/**
 * Toggle sidebar visibility (mobile)
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (!sidebar || !overlay) return;

    sidebarOpen = !sidebarOpen;

    if (sidebarOpen) {
        // Open sidebar
        sidebar.classList.remove('sidebar-closed');
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent body scroll
    } else {
        // Close sidebar
        sidebar.classList.add('sidebar-closed');
        overlay.classList.add('hidden');
        document.body.style.overflow = ''; // Restore body scroll
    }
}

/**
 * Close sidebar when clicking on a section (mobile)
 */
function closeSidebarOnSectionClick() {
    // Only on mobile (< lg breakpoint)
    if (window.innerWidth < 1024 && sidebarOpen) {
        toggleSidebar();
    }
}

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

        // Load user progress (if authenticated)
        await loadUserProgress();

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

    // Update breadcrumb for auth users too
    const breadcrumbAuth = document.getElementById('breadcrumbTitleAuth');
    if (breadcrumbAuth) {
        breadcrumbAuth.textContent = card.title;
    }

    // Update section count
    const sectionCount = card.sections ? card.sections.length : 0;
    document.getElementById('sectionCount').textContent = `${sectionCount} bölüm`;

    // Initialize progress
    updateProgress(0, sectionCount);
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
    sectionDiv.className = 'section-item p-4 cursor-pointer';
    sectionDiv.id = `section-${section.id}`;
    sectionDiv.onclick = () => selectSection(section.id);

    // Check if section has content (new system with HTML content or old system with contentItems)
    const hasNewContent = section.content && section.content.trim().length > 0;
    const hasOldContent = section.contentItems && section.contentItems.length > 0;
    const hasContent = hasNewContent || hasOldContent;

    const icon = hasContent ? 'layers' : 'file-text';
    const label = hasContent ? 'İçerik var' : 'İçerik yok';

    sectionDiv.innerHTML = `
        <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 section-check">
                <i data-lucide="${icon}" class="w-4 h-4 text-slate-600"></i>
            </div>
            <div class="flex-1 min-w-0">
                <span class="text-sm font-semibold text-slate-900 block">${escapeHtml(section.title)}</span>
                <span class="text-xs text-slate-500">${label}</span>
            </div>
            <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400 flex-shrink-0"></i>
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

/**
 * Get label for content type
 */
function getContentTypeLabel(contentType) {
    const labelMap = {
        'TEXT': 'Metin',
        'PROBLEM': 'Problem',
        'QUIZ': 'Quiz'
    };
    return labelMap[contentType] || 'İçerik';
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

    // Close sidebar on mobile after selection
    closeSidebarOnSectionClick();

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

        // Mark section as started (viewed) - not completed yet
        await markSectionStarted(sectionId);

    } catch (error) {
        console.error('Error loading section content:', error);
        showError('Bölüm içeriği yüklenirken hata oluştu');
        hideLoadingContent();
    }
}

/**
 * Display section content based on content items
 */
function displaySectionContent(section) {
    hideLoadingContent();

    document.getElementById('sectionTitle').textContent = section.title;

    // Update section number
    const currentIndex = currentCard.sections.findIndex(s => s.id === section.id);
    document.getElementById('sectionNumber').textContent = `Bölüm ${currentIndex + 1}`;

    const contentArea = document.getElementById('sectionContent');
    contentArea.innerHTML = '';

    // NEW: Check if section has direct HTML content (new system)
    if (section.content) {
        // Render HTML content from rich text editor
        contentArea.innerHTML = section.content;

        // Calculate reading time from HTML content
        const textContent = contentArea.textContent || contentArea.innerText || '';
        const totalWordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;
        const readingTime = Math.max(1, Math.ceil(totalWordCount / 200)); // 200 kelime/dakika
        document.getElementById('readingTime').textContent = `${readingTime} dk okuma`;
    }
    // OLD: Fallback to contentItems system (backward compatibility)
    else if (section.contentItems && section.contentItems.length > 0) {
        // Calculate reading time based on all text content items
        let totalWordCount = 0;
        section.contentItems.forEach(item => {
            if (item.contentType === 'TEXT' && item.textContent) {
                totalWordCount += item.textContent.split(/\s+/).length;
            }
        });
        const readingTime = Math.max(1, Math.ceil(totalWordCount / 200)); // 200 kelime/dakika
        document.getElementById('readingTime').textContent = `${readingTime} dk okuma`;

        // Render all content items in order
        section.contentItems.forEach((item, index) => {
            renderContentItem(item, index, contentArea);
        });
    }
    // Empty state
    else {
        contentArea.innerHTML = '<p class="text-slate-600">Bu bölümde henüz içerik yok</p>';
        document.getElementById('readingTime').textContent = '0 dk okuma';
    }

    document.getElementById('contentArea').classList.remove('hidden');

    // Update navigation buttons
    updateNavigationButtons(currentIndex);

    lucide.createIcons();
}

/**
 * Render a single content item
 */
function renderContentItem(item, index, container) {
    const itemWrapper = document.createElement('div');
    itemWrapper.className = 'content-item mb-6';
    itemWrapper.dataset.itemId = item.id;

    switch (item.contentType) {
        case 'TEXT':
            renderTextContent(item, itemWrapper);
            break;
        case 'PROBLEM':
            renderProblemLink(item, itemWrapper);
            break;
        case 'QUIZ':
            renderQuizLink(item, itemWrapper);
            break;
        case 'STUDY_PROBLEM':
            renderStudyProblem(item, itemWrapper);
            break;
        case 'STUDY_QUIZ':
            renderStudyQuiz(item, itemWrapper);
            break;
        // Notion-like block types
        case 'PARAGRAPH':
            renderParagraphBlock(item, itemWrapper);
            break;
        case 'HEADING':
            renderHeadingBlock(item, itemWrapper);
            break;
        case 'LIST':
            renderListBlock(item, itemWrapper);
            break;
        case 'TABLE':
            renderTableBlock(item, itemWrapper);
            break;
        case 'DIVIDER':
            renderDividerBlock(item, itemWrapper);
            break;
        case 'CODE':
            renderCodeBlock(item, itemWrapper);
            break;
        case 'QUOTE':
            renderQuoteBlock(item, itemWrapper);
            break;
        case 'CALLOUT':
            renderCalloutBlock(item, itemWrapper);
            break;
        default:
            itemWrapper.innerHTML = `<p class="text-slate-600">Bilinmeyen içerik tipi: ${item.contentType}</p>`;
            console.warn('Unknown content type:', item.contentType, item);
    }

    container.appendChild(itemWrapper);
}

/**
 * Render text content item
 */
function renderTextContent(item, container) {
    container.innerHTML = item.textContent || '<p class="text-slate-600">İçerik yok</p>';
}

/**
 * Render problem link content item (references existing Problem)
 */
function renderProblemLink(item, container) {
    // relatedProblemId is stored, but we need to fetch the problem details
    // For now, show a placeholder or fetch via API
    if (!item.relatedProblemId) {
        container.innerHTML = '<p class="text-slate-600">Problem ID bulunamadı</p>';
        return;
    }

    container.innerHTML = `
        <div class="problem-card bg-blue-50 border border-blue-200 rounded-lg p-6 cursor-pointer" onclick="navigateToProblem(${item.relatedProblemId})">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                        <i data-lucide="puzzle" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-slate-900">Problem #${item.relatedProblemId}</h3>
                        <span class="text-xs text-slate-500">Problem Çözümü</span>
                    </div>
                </div>
                <i data-lucide="arrow-right" class="w-5 h-5 text-blue-600"></i>
            </div>
            <button class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                <span>Problemi Çöz</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
        </div>
    `;
}

/**
 * Render quiz link content item (references existing Quiz)
 */
function renderQuizLink(item, container) {
    if (!item.relatedQuizId) {
        container.innerHTML = '<p class="text-slate-600">Quiz ID bulunamadı</p>';
        return;
    }

    container.innerHTML = `
        <div class="quiz-card bg-purple-50 border border-purple-200 rounded-lg p-6 cursor-pointer" onclick="navigateToQuiz(${item.relatedQuizId})">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                        <i data-lucide="help-circle" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-slate-900">Quiz #${item.relatedQuizId}</h3>
                        <span class="text-xs text-slate-500">Test</span>
                    </div>
                </div>
                <i data-lucide="arrow-right" class="w-5 h-5 text-purple-600"></i>
            </div>
            <button class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors">
                <span>Quiz'e Başla</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
        </div>
    `;
}

/**
 * Render study problem (custom problem created in study card)
 */
function renderStudyProblem(item, container) {
    if (!item.studyProblem) {
        container.innerHTML = '<p class="text-slate-600">Problem içeriği bulunamadı</p>';
        return;
    }

    const problem = item.studyProblem;
    const difficultyColors = {
        'KOLAY': 'bg-green-100 text-green-800',
        'ORTA': 'bg-yellow-100 text-yellow-800',
        'ZOR': 'bg-red-100 text-red-800'
    };

    const diffClass = difficultyColors[problem.difficulty] || difficultyColors['ORTA'];

    container.innerHTML = `
        <div class="study-problem bg-green-50 border border-green-200 rounded-lg p-6">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                        <i data-lucide="edit-3" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-slate-900">${escapeHtml(problem.title)}</h3>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${diffClass}">${problem.difficulty}</span>
                    </div>
                </div>
            </div>
            <div class="prose prose-slate max-w-none">
                ${problem.content}
            </div>
        </div>
    `;
}

/**
 * Render study quiz (custom quiz created in study card)
 */
function renderStudyQuiz(item, container) {
    if (!item.studyQuiz) {
        container.innerHTML = '<p class="text-slate-600">Quiz içeriği bulunamadı</p>';
        return;
    }

    const quiz = item.studyQuiz;

    container.innerHTML = `
        <div class="study-quiz bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                        <i data-lucide="clipboard-list" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-slate-900">${escapeHtml(quiz.title)}</h3>
                        <p class="text-sm text-slate-600">${escapeHtml(quiz.description || '')}</p>
                    </div>
                </div>
            </div>
            <div class="text-sm text-slate-500">
                <p>Bu bölümde özel olarak hazırlanmış bir quiz bulunmaktadır.</p>
            </div>
        </div>
    `;
}

/**
 * Render paragraph block
 */
function renderParagraphBlock(item, container) {
    const blockData = item.blockData ? JSON.parse(item.blockData) : {};
    const content = blockData.content || item.textContent || '';
    container.innerHTML = `<p class="mb-4 text-slate-700 leading-relaxed">${content}</p>`;
}

/**
 * Render heading block
 */
function renderHeadingBlock(item, container) {
    const blockData = item.blockData ? JSON.parse(item.blockData) : {};
    const level = blockData.level || 2;
    const content = blockData.content || item.textContent || 'Başlık';
    const headingClass = level === 1 ? 'text-3xl font-bold mb-4 text-slate-900' :
                         level === 2 ? 'text-2xl font-bold mb-3 text-slate-900' :
                         'text-xl font-semibold mb-2 text-slate-900';
    container.innerHTML = `<h${level} class="${headingClass}">${escapeHtml(content)}</h${level}>`;
}

/**
 * Render list block
 */
function renderListBlock(item, container) {
    const blockData = item.blockData ? JSON.parse(item.blockData) : {};
    const listType = blockData.listType || 'bullet';
    const items = blockData.items || [];

    const listTag = listType === 'numbered' ? 'ol' : 'ul';
    const listClass = listType === 'numbered' ? 'list-decimal list-inside mb-4 space-y-2' : 'list-disc list-inside mb-4 space-y-2';

    const itemsHTML = items.map(item => `<li class="text-slate-700">${escapeHtml(item)}</li>`).join('');
    container.innerHTML = `<${listTag} class="${listClass}">${itemsHTML}</${listTag}>`;
}

/**
 * Render table block
 */
function renderTableBlock(item, container) {
    const blockData = item.blockData ? JSON.parse(item.blockData) : {};
    const headers = blockData.headers || [];
    const rows = blockData.rows || [];

    const headersHTML = headers.map(h => `<th class="px-4 py-2 text-left font-semibold text-slate-900 border-b-2 border-slate-300">${escapeHtml(h)}</th>`).join('');
    const rowsHTML = rows.map(row =>
        `<tr class="hover:bg-slate-50">${row.map(cell => `<td class="px-4 py-2 border-b border-slate-200 text-slate-700">${escapeHtml(cell)}</td>`).join('')}</tr>`
    ).join('');

    container.innerHTML = `
        <div class="overflow-x-auto mb-4">
            <table class="min-w-full bg-white border border-slate-200 rounded-lg">
                <thead class="bg-slate-50">${headersHTML}</thead>
                <tbody>${rowsHTML}</tbody>
            </table>
        </div>
    `;
}

/**
 * Render divider block
 */
function renderDividerBlock(item, container) {
    container.innerHTML = '<hr class="my-8 border-slate-200">';
}

/**
 * Render code block
 */
function renderCodeBlock(item, container) {
    const blockData = item.blockData ? JSON.parse(item.blockData) : {};
    const language = blockData.language || 'text';
    const code = blockData.content || item.textContent || '';

    container.innerHTML = `
        <div class="mb-4 bg-slate-900 rounded-lg overflow-hidden">
            <div class="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold">${escapeHtml(language)}</div>
            <pre class="px-4 py-3 text-sm text-slate-100 overflow-x-auto"><code>${escapeHtml(code)}</code></pre>
        </div>
    `;
}

/**
 * Render quote block
 */
function renderQuoteBlock(item, container) {
    const blockData = item.blockData ? JSON.parse(item.blockData) : {};
    const content = blockData.content || item.textContent || '';
    const author = blockData.author || '';

    container.innerHTML = `
        <blockquote class="border-l-4 border-indigo-500 pl-4 py-2 mb-4 italic text-slate-600 bg-slate-50 rounded-r-lg">
            <p class="mb-1">${escapeHtml(content)}</p>
            ${author ? `<footer class="text-sm text-slate-500 not-italic">— ${escapeHtml(author)}</footer>` : ''}
        </blockquote>
    `;
}

/**
 * Render callout block
 */
function renderCalloutBlock(item, container) {
    const blockData = item.blockData ? JSON.parse(item.blockData) : {};
    const type = blockData.type || 'info';
    const content = blockData.content || item.textContent || '';

    const typeConfig = {
        'info': { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'info', iconColor: 'text-blue-600' },
        'warning': { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'alert-triangle', iconColor: 'text-yellow-600' },
        'error': { bg: 'bg-red-50', border: 'border-red-200', icon: 'alert-circle', iconColor: 'text-red-600' },
        'success': { bg: 'bg-green-50', border: 'border-green-200', icon: 'check-circle', iconColor: 'text-green-600' }
    };

    const config = typeConfig[type] || typeConfig['info'];

    container.innerHTML = `
        <div class="mb-4 ${config.bg} ${config.border} border rounded-lg p-4">
            <div class="flex items-start gap-3">
                <i data-lucide="${config.icon}" class="w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5"></i>
                <div class="flex-1 text-slate-700">${content}</div>
            </div>
        </div>
    `;
}

// ===========================
// NAVIGATION
// ===========================

/**
 * Navigate to previous section
 */
window.navigatePrevSection = function() {
    if (!currentCard || !currentCard.sections) return;

    const currentIndex = currentCard.sections.findIndex(s => s.id === currentSectionId);
    if (currentIndex > 0) {
        selectSection(currentCard.sections[currentIndex - 1].id);
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Navigate to next section (with completion)
 */
window.navigateNextSection = async function() {
    if (!currentCard || !currentCard.sections) return;

    // First, mark current section as completed
    if (currentSectionId) {
        await markSectionCompleted(currentSectionId);
    }

    const currentIndex = currentCard.sections.findIndex(s => s.id === currentSectionId);
    if (currentIndex < currentCard.sections.length - 1) {
        selectSection(currentCard.sections[currentIndex + 1].id);
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        // Last section completed - redirect to study cards page
        window.location.href = 'study.html';
    }
}

/**
 * Update navigation button states
 */
function updateNavigationButtons(currentIndex) {
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');

    if (prevButton) {
        prevButton.disabled = currentIndex === 0;
    }

    if (nextButton) {
        const isLastSection = currentIndex === currentCard.sections.length - 1;

        // Update button text and icon for last section
        if (isLastSection) {
            nextButton.innerHTML = `
                Tamamla
                <i data-lucide="check-circle" class="w-4 h-4"></i>
            `;
        } else {
            nextButton.innerHTML = `
                Sonraki Bölüm
                <i data-lucide="chevron-right" class="w-4 h-4"></i>
            `;
        }

        // Re-initialize lucide icons
        lucide.createIcons();
    }
}

/**
 * Update progress bar
 */
function updateProgress(completed, total) {
    if (total === 0) return;

    const percentage = Math.round((completed / total) * 100);
    document.getElementById('progressBar').style.width = `${percentage}%`;
    document.getElementById('progressText').textContent = `${completed}/${total}`;
}

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
// PROGRESS TRACKING
// ===========================

let completedSectionIds = [];
let startedSectionIds = [];

/**
 * Load user progress for current card
 */
async function loadUserProgress() {
    const token = localStorage.getItem('token');
    if (!token || !currentCardId) {
        console.log('No token or card ID, skipping progress load');
        return;
    }

    try {
        console.log('Loading progress for card:', currentCardId);
        const response = await fetch(`${API_URL}/study-cards/${currentCardId}/progress`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Progress response status:', response.status);

        if (response.ok) {
            const progress = await response.json();
            console.log('Progress data:', progress);

            completedSectionIds = progress.completedSectionIds || [];
            startedSectionIds = progress.startedSectionIds || [];

            // Update progress bar
            updateProgress(progress.completedSections, progress.totalSections);

            // Mark completed sections in UI
            completedSectionIds.forEach(sectionId => {
                const sectionElement = document.getElementById(`section-${sectionId}`);
                if (sectionElement) {
                    sectionElement.classList.add('completed');
                    const checkIcon = sectionElement.querySelector('.section-check');
                    if (checkIcon) {
                        checkIcon.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4"></i>';
                    }
                }
            });

            // Mark started (in-progress) sections in UI
            startedSectionIds.forEach(sectionId => {
                const sectionElement = document.getElementById(`section-${sectionId}`);
                if (sectionElement && !completedSectionIds.includes(sectionId)) {
                    sectionElement.classList.add('in-progress');
                    const checkIcon = sectionElement.querySelector('.section-check');
                    if (checkIcon) {
                        checkIcon.innerHTML = '<i data-lucide="clock" class="w-4 h-4"></i>';
                    }
                }
            });

            lucide.createIcons();
        } else {
            console.error('Progress load failed with status:', response.status);
            const errorText = await response.text();
            console.error('Error response:', errorText);
        }
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

/**
 * Mark section as started (viewed)
 */
async function markSectionStarted(sectionId) {
    const token = localStorage.getItem('token');
    if (!token) {
        return; // Guest user, no progress tracking
    }

    // Check if already started or completed
    if (startedSectionIds.includes(sectionId) || completedSectionIds.includes(sectionId)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/study-cards/sections/${sectionId}/start`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            // Add to started list
            startedSectionIds.push(sectionId);

            // Update UI
            const sectionElement = document.getElementById(`section-${sectionId}`);
            if (sectionElement) {
                sectionElement.classList.add('in-progress');
                const checkIcon = sectionElement.querySelector('.section-check');
                if (checkIcon) {
                    checkIcon.innerHTML = '<i data-lucide="clock" class="w-4 h-4"></i>';
                }
            }

            lucide.createIcons();
        }
    } catch (error) {
        console.error('Error marking section started:', error);
    }
}

/**
 * Mark section as completed
 */
async function markSectionCompleted(sectionId) {
    const token = localStorage.getItem('token');
    if (!token) {
        return; // Guest user, no progress tracking
    }

    // Check if already completed
    if (completedSectionIds.includes(sectionId)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/study-cards/sections/${sectionId}/complete`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            // Remove from started list if exists
            const startedIndex = startedSectionIds.indexOf(sectionId);
            if (startedIndex > -1) {
                startedSectionIds.splice(startedIndex, 1);
            }

            // Add to completed list
            completedSectionIds.push(sectionId);

            // Update UI
            const sectionElement = document.getElementById(`section-${sectionId}`);
            if (sectionElement) {
                sectionElement.classList.remove('in-progress');
                sectionElement.classList.add('completed');
                const checkIcon = sectionElement.querySelector('.section-check');
                if (checkIcon) {
                    checkIcon.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4"></i>';
                }
            }

            // Update progress bar
            const totalSections = currentCard?.sections?.length || 0;
            updateProgress(completedSectionIds.length, totalSections);

            lucide.createIcons();
        }
    } catch (error) {
        console.error('Error marking section completed:', error);
    }
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
    const displayName = user.firstName || user.username;
    const userDisplayName = document.getElementById('userDisplayName');
    if (userDisplayName) {
        userDisplayName.textContent = `Hoşgeldin, ${displayName}`;
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
