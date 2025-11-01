// Admin Dashboard.js - Admin dashboard işlemleri
// Ortak dosyalar: common.js, api.js, auth.js

let dailyChart, difficultyChart;
let currentQuizIdToDelete = null;
let allTopics = [];

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
    // Admin guard kullan
    if (!AuthService.requireAdmin()) {
        return;
    }

    // Kullanıcı bilgilerini güncelle
    updateUserInfo();

    await loadDashboard();
    await loadQuizzes();
    await loadTopics();
});

// Dashboard verilerini yükle
async function loadDashboard() {
    try {
        const data = await ApiService.getAdminStats();
        renderDashboard(data);
    } catch (error) {
        console.error('Dashboard yükleme hatası:', error);
        alert('Dashboard yüklenirken bir hata oluştu!');
    }
}

// Dashboard'u render et
function renderDashboard(data) {
    // 1. Stat Cards (Count-up animasyonlu)
    animateCount(document.getElementById('total-users'), data.totalUsers);
    animateCount(document.getElementById('users-this-week'), data.usersThisWeek);
    animateCount(document.getElementById('active-users'), data.activeUsers);
    animateCount(document.getElementById('total-problems'), data.totalProblems);
    animateCount(document.getElementById('total-solutions'), data.totalSolutions);
    animateCount(document.getElementById('solutions-this-week'), data.solutionsThisWeek);

    // Zorluk dağılımı
    const diffBreakdown = `K:${data.problemsByDifficulty.EASY || 0} O:${data.problemsByDifficulty.MEDIUM || 0} Z:${data.problemsByDifficulty.HARD || 0}`;
    document.getElementById('difficulty-breakdown').textContent = diffBreakdown;

    // 2. Grafikler
    renderDailySolutionsChart(data.dailySolutions);
    renderDifficultyChart(data.problemsByDifficulty);

    // 3. Tablo
    renderTopProblemsTable(data.topSolvedProblems);

    // Loading'i gizle
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('dashboard-content').classList.remove('hidden');

    lucide.createIcons();
}

// Count-up animasyonu
function animateCount(element, target, duration = 1200) {
    const start = 0;
    const startTime = performance.now();
    const formatter = new Intl.NumberFormat('tr-TR');

    function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        const value = Math.floor(start + (target - start) * eased);
        element.textContent = formatter.format(value);
        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

// Line Chart
function renderDailySolutionsChart(dailySolutions) {
    const ctx = document.getElementById('dailySolutionsChart').getContext('2d');

    const labels = dailySolutions.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
    });
    const counts = dailySolutions.map(d => d.count);

    if (dailyChart) dailyChart.destroy();

    dailyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Çözümler',
                data: counts,
                borderColor: '#1e3a8a',
                backgroundColor: 'rgba(30,58,138,0.12)',
                pointBackgroundColor: '#1e3a8a',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 3.5,
                tension: 0.36,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 900, easing: 'easeOutQuart' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0f172a',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 10,
                    cornerRadius: 8,
                    displayColors: false
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#334155', font: { size: 11 } }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(148,163,184,0.25)' },
                    ticks: {
                        color: '#334155',
                        font: { size: 11 },
                        precision: 0,
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Doughnut Chart
function renderDifficultyChart(difficulties) {
    const ctx = document.getElementById('difficultyChart').getContext('2d');

    if (difficultyChart) difficultyChart.destroy();

    difficultyChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Kolay', 'Orta', 'Zor'],
            datasets: [{
                data: [
                    difficulties.EASY || 0,
                    difficulties.MEDIUM || 0,
                    difficulties.HARD || 0
                ],
                backgroundColor: ['#93c5fd', '#3b82f6', '#1e3a8a'],
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '62%',
            animation: { duration: 1000, easing: 'easeOutQuart' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0f172a',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 10,
                    cornerRadius: 8,
                    displayColors: true
                }
            }
        }
    });
}

// Tablo
function renderTopProblemsTable(problems) {
    const tbody = document.getElementById('top-problems-table');
    tbody.innerHTML = '';

    if (!problems || problems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-slate-500">Henüz çözülen problem yok</td></tr>';
        return;
    }

    problems.forEach((problem, index) => {
        const difficultyBadge = getDifficultyBadge(problem.difficulty);
        const row = `
            <tr class="hover:bg-slate-50/60">
                <td class="px-6 py-3 text-sm text-slate-700">${index + 1}</td>
                <td class="px-6 py-3 text-sm font-medium text-slate-900">${problem.title}</td>
                <td class="px-6 py-3">${difficultyBadge}</td>
                <td class="px-6 py-3 text-right text-sm font-medium text-slate-900">${problem.solveCount.toLocaleString('tr-TR')}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Zorluk badge
function getDifficultyBadge(difficulty) {
    const badges = {
        'EASY': '<span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-700">Kolay</span>',
        'MEDIUM': '<span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-blue-200 text-blue-800">Orta</span>',
        'HARD': '<span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-blue-400 text-white">Zor</span>'
    };
    return badges[difficulty] || difficulty;
}

// Profil dropdown'ını aç/kapat
function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

// Dropdown dışına tıklandığında kapat
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('profileDropdown');
    const button = document.querySelector('[onclick="toggleProfileDropdown()"]');

    if (dropdown && button && !button.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});

// Kullanıcı bilgilerini güncelle
function updateUserInfo() {
    const user = AuthService.getCurrentUser();
    if (user) {
        const initial = user.username.charAt(0).toUpperCase();
        
        // Elementleri güvenli şekilde güncelle
        const userInitial = document.getElementById('userInitial');
        const userInitialDropdown = document.getElementById('userInitialDropdown');
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');
        
        if (userInitial) userInitial.textContent = initial;
        if (userInitialDropdown) userInitialDropdown.textContent = initial;
        if (userName) userName.textContent = user.username;
        if (userRole) userRole.textContent = 'Yönetici';
    }
}

// Çıkış
function logout(event) {
    if (event) event.preventDefault();
    AuthService.logout();
}

// ==================== Quiz Management Functions ====================

// Load all quizzes
async function loadQuizzes() {
    try {
        const response = await APIService.get('/api/admin/quizzes?page=0&size=10');
        const data = await response.json();
        renderQuizzesTable(data.content || []);
        document.getElementById('total-quizzes').textContent = data.totalElements || 0;
    } catch (error) {
        console.error('Quizler yüklenirken hata:', error);
    }
}

// Load all topics for dropdown
async function loadTopics() {
    try {
        const response = await APIService.get('/api/admin/quizzes/topics');
        allTopics = await response.json();
        populateTopicDropdown();
    } catch (error) {
        console.error('Konular yüklenirken hata:', error);
    }
}

// Populate topic dropdown
function populateTopicDropdown() {
    const select = document.getElementById('quizTopicId');
    select.innerHTML = '<option value="">Konu Seçin</option>';
    allTopics.forEach(topic => {
        select.innerHTML += `<option value="${topic.id}">${topic.name}</option>`;
    });
}

// Render quizzes table
function renderQuizzesTable(quizzes) {
    const tbody = document.getElementById('quizzes-table');
    tbody.innerHTML = '';

    if (!quizzes || quizzes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-slate-500">Henüz quiz eklenmemiş</td></tr>';
        return;
    }

    quizzes.forEach(quiz => {
        const difficultyBadge = getQuizDifficultyBadge(quiz.difficulty);
        const statusBadge = quiz.isActive
            ? '<span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-green-100 text-green-700">Aktif</span>'
            : '<span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-600">Pasif</span>';

        const row = `
            <tr class="hover:bg-slate-50/60">
                <td class="px-6 py-3 text-sm font-medium text-slate-900">${quiz.title}</td>
                <td class="px-6 py-3 text-sm text-slate-700">${quiz.topic?.name || '-'}</td>
                <td class="px-6 py-3">${difficultyBadge}</td>
                <td class="px-6 py-3 text-sm text-slate-700">${quiz.timeLimitMinutes ? quiz.timeLimitMinutes + ' dk' : '-'}</td>
                <td class="px-6 py-3">${statusBadge}</td>
                <td class="px-6 py-3 text-right">
                    <button onclick="editQuiz(${quiz.id})" class="text-slate-600 hover:text-slate-900 mr-3">
                        <i data-lucide="edit-2" class="w-4 h-4"></i>
                    </button>
                    <button onclick="deleteQuiz(${quiz.id})" class="text-red-600 hover:text-red-700">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    lucide.createIcons();
}

// Get quiz difficulty badge
function getQuizDifficultyBadge(difficulty) {
    const badges = {
        1: '<span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-emerald-100 text-emerald-700">Kolay</span>',
        2: '<span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-amber-100 text-amber-700">Orta</span>',
        3: '<span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-rose-100 text-rose-700">Zor</span>'
    };
    return badges[difficulty] || '-';
}

// Open quiz modal (create)
function openQuizModal() {
    document.getElementById('quizModalTitle').textContent = 'Yeni Quiz Ekle';
    document.getElementById('quizForm').reset();
    document.getElementById('quizId').value = '';
    document.getElementById('quizIsActive').checked = true;
    document.getElementById('quizPassPercentage').value = 70;
    document.getElementById('quizModal').classList.remove('hidden');
    lucide.createIcons();
}

// Edit quiz
async function editQuiz(quizId) {
    try {
        const response = await APIService.get(`/api/admin/quizzes/${quizId}`);
        const quiz = await response.json();

        document.getElementById('quizModalTitle').textContent = 'Quiz Düzenle';
        document.getElementById('quizId').value = quiz.id;
        document.getElementById('quizTitle').value = quiz.title;
        document.getElementById('quizDescription').value = quiz.description || '';
        document.getElementById('quizTopicId').value = quiz.topic?.id || '';
        document.getElementById('quizDifficulty').value = quiz.difficulty;
        document.getElementById('quizTimeLimitMinutes').value = quiz.timeLimitMinutes || '';
        document.getElementById('quizPassPercentage').value = quiz.passPercentage;
        document.getElementById('quizIsActive').checked = quiz.isActive;

        document.getElementById('quizModal').classList.remove('hidden');
        lucide.createIcons();
    } catch (error) {
        console.error('Quiz yüklenirken hata:', error);
        alert('Quiz bilgileri yüklenemedi!');
    }
}

// Close quiz modal
function closeQuizModal() {
    document.getElementById('quizModal').classList.add('hidden');
}

// Submit quiz form
document.getElementById('quizForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const quizId = document.getElementById('quizId').value;
    const quizData = {
        title: document.getElementById('quizTitle').value,
        description: document.getElementById('quizDescription').value || null,
        topicId: document.getElementById('quizTopicId').value || null,
        difficulty: parseInt(document.getElementById('quizDifficulty').value),
        timeLimitMinutes: document.getElementById('quizTimeLimitMinutes').value
            ? parseInt(document.getElementById('quizTimeLimitMinutes').value)
            : null,
        passPercentage: parseInt(document.getElementById('quizPassPercentage').value),
        isActive: document.getElementById('quizIsActive').checked
    };

    try {
        if (quizId) {
            // Update
            await APIService.put(`/api/admin/quizzes/${quizId}`, quizData);
            alert('Quiz başarıyla güncellendi!');
        } else {
            // Create
            await APIService.post('/api/admin/quizzes', quizData);
            alert('Quiz başarıyla eklendi!');
        }

        closeQuizModal();
        await loadQuizzes();
    } catch (error) {
        console.error('Quiz kaydedilirken hata:', error);
        alert('Quiz kaydedilemedi!');
    }
});

// Delete quiz
function deleteQuiz(quizId) {
    currentQuizIdToDelete = quizId;
    document.getElementById('deleteQuizModal').classList.remove('hidden');
    lucide.createIcons();
}

// Close delete modal
function closeDeleteQuizModal() {
    document.getElementById('deleteQuizModal').classList.add('hidden');
    currentQuizIdToDelete = null;
}

// Confirm delete
async function confirmDeleteQuiz() {
    if (!currentQuizIdToDelete) return;

    try {
        await APIService.delete(`/api/admin/quizzes/${currentQuizIdToDelete}`);
        alert('Quiz başarıyla silindi!');
        closeDeleteQuizModal();
        await loadQuizzes();
    } catch (error) {
        console.error('Quiz silinirken hata:', error);
        alert('Quiz silinemedi!');
    }
}

// Global exports
window.toggleProfileDropdown = toggleProfileDropdown;
window.logout = logout;
window.openQuizModal = openQuizModal;
window.closeQuizModal = closeQuizModal;
window.editQuiz = editQuiz;
window.deleteQuiz = deleteQuiz;
window.closeDeleteQuizModal = closeDeleteQuizModal;
window.confirmDeleteQuiz = confirmDeleteQuiz;