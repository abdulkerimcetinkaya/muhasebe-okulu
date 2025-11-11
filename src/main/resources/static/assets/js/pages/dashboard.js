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
    await loadWeeklyActivity();
    await loadRecentlySolved();
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

            // İstatistik kartlarını güncelle (tüm statSolutions elementleri)
            const solvedElements = document.querySelectorAll('#statSolutions');
            solvedElements.forEach(el => el.textContent = profile.solvedCount || 0);

            const scoreElements = document.querySelectorAll('#statScore');
            scoreElements.forEach(el => el.textContent = profile.totalScore || 0);

            const streakElements = document.querySelectorAll('#statStreak');
            streakElements.forEach(el => el.textContent = profile.streakDays || 0);

            // Doğru cevap oranını hesapla
            const accuracy = profile.solvedCount > 0 ?
                Math.round((profile.correctCount || 0) / profile.solvedCount * 100) : 0;

            const accuracyElements = document.querySelectorAll('#statAccuracy');
            accuracyElements.forEach(el => el.textContent = accuracy);

            // Accuracy bar'ı güncelle
            const accuracyBar = document.getElementById('accuracyBar');
            if (accuracyBar) {
                accuracyBar.style.width = accuracy + '%';
            }

            // Bugünkü hedef progress (örnek: günde 3 problem)
            const dailyGoal = 3;
            const todayProgress = Math.min(profile.solvedCount % dailyGoal, dailyGoal);
            const progressPercent = (todayProgress / dailyGoal) * 100;

            // Hero bölümündeki progress bar'ı güncelle
            const heroProgressBar = document.querySelector('.bg-blue-400');
            if (heroProgressBar) {
                heroProgressBar.style.width = progressPercent + '%';
                const progressText = heroProgressBar.parentElement.nextElementSibling;
                if (progressText) {
                    progressText.textContent = `${todayProgress}/${dailyGoal} tamamlandı`;
                }
            }
        }

    } catch (error) {
        console.error('İstatistikler yüklenirken hata:', error);
    }
}

/**
 * Load recently solved problems
 * Displays last 5 solved problems
 */
async function loadRecentlySolved() {
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
            const solvedProblems = await response.json();
            const container = document.getElementById('recentlySolved');

            if (solvedProblems.length === 0) {
                container.innerHTML = `
                    <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-lg">
                                <i data-lucide="book-open" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <p class="font-medium text-slate-900">Henüz problem çözmediniz</p>
                                <p class="text-xs text-slate-600">İlk problemi çözerek başlayın!</p>
                            </div>
                        </div>
                        <a href="problems.html" class="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                            Başla
                        </a>
                    </div>
                `;
            } else {
                container.innerHTML = solvedProblems.map(problem => `
                    <div class="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-lg">
                                <i data-lucide="check-circle" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <p class="font-medium text-slate-900">${problem.problemTitle || 'Problem'}</p>
                                <p class="text-xs text-slate-600">${new Date(problem.solvedAt).toLocaleDateString('tr-TR')}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-semibold text-blue-600">+${problem.score || 10}</span>
                            <span class="text-xs text-slate-500">puan</span>
                        </div>
                    </div>
                `).join('');
            }

            lucide.createIcons();
        }

    } catch (error) {
        console.error('Son çözülenler yüklenirken hata:', error);
    }
}

/**
 * Load weekly activity data for chart
 * Fetches last 7 days activity and updates chart
 */
async function loadWeeklyActivity() {
    try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token || !user) return;

        // Haftalık aktivite verilerini al
        const response = await fetch(`${API_URL}/users/${user.id}/activity`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const activityData = await response.json();

            // Chart.js için veri hazırla
            const labels = activityData.map(day => {
                const date = new Date(day.date);
                const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
                return dayNames[date.getDay()];
            });

            const data = activityData.map(day => day.count || 0);

            // Chart'ı güncelle
            updateWeeklyChart(labels, data);

            // Haftalık karşılaştırma verilerini hesapla
            const thisWeekTotal = data.reduce((a, b) => a + b, 0);
            const lastWeekTotal = thisWeekTotal + 8; // Örnek veri
            const change = lastWeekTotal > 0 ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100) : 0;

            // İstatistikleri güncelle
            const thisWeekElement = document.querySelector('.text-blue-600.text-2xl')?.parentElement?.querySelector('p');
            if (thisWeekElement) {
                thisWeekElement.textContent = thisWeekTotal;
            }

            const lastWeekElement = document.querySelector('.text-slate-900.text-2xl')?.parentElement?.querySelector('p');
            if (lastWeekElement) {
                lastWeekElement.textContent = lastWeekTotal;
            }

            const changeElement = document.querySelector('.text-orange-500.text-2xl');
            if (changeElement) {
                changeElement.textContent = `${change > 0 ? '+' : ''}${change}%`;
                changeElement.className = change >= 0 ? 'text-2xl font-bold text-blue-500' : 'text-2xl font-bold text-orange-500';

                const icon = changeElement.previousElementSibling;
                if (icon) {
                    icon.setAttribute('data-lucide', change >= 0 ? 'trending-up' : 'trending-down');
                    icon.className = change >= 0 ? 'w-4 h-4 text-blue-500' : 'w-4 h-4 text-orange-500';
                }
            }

            lucide.createIcons();
        }

    } catch (error) {
        console.error('Haftalık aktivite yüklenirken hata:', error);
    }
}

/**
 * Update weekly activity chart with data
 * @param {string[]} labels - Day labels
 * @param {number[]} data - Activity counts
 */
function updateWeeklyChart(labels, data) {
    const weeklyCtx = document.getElementById('weeklyActivityChart');
    if (weeklyCtx && window.weeklyActivityChart) {
        window.weeklyActivityChart.data.labels = labels;
        window.weeklyActivityChart.data.datasets[0].data = data;
        window.weeklyActivityChart.update();
    }
}


// ===========================
// EVENT LISTENERS
// ===========================

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initDashboardPage);
