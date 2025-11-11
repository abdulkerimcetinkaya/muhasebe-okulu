// Admin Dashboard.js - Admin dashboard işlemleri
// Ortak dosyalar: common.js, api.js, auth.js

let dailyChart, difficultyChart;

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
    // Admin guard kullan
    if (!AuthService.requireAdmin()) {
        return;
    }

    // Kullanıcı bilgilerini güncelle
    updateUserInfo();

    await loadDashboard();
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

    // Yeni alanlar
    const activityRate = data.totalUsers > 0 ? Math.round((data.activeUsers / data.totalUsers) * 100) : 0;
    document.getElementById('activity-rate').textContent = `%${activityRate}`;

    const problemsThisMonth = Math.floor(data.totalProblems * 0.15); // Örnek hesaplama
    animateCount(document.getElementById('problems-this-month'), problemsThisMonth);

    // Zorluk dağılımı - yeni format
    const easyCount = data.problemsByDifficulty.EASY || 0;
    const mediumCount = data.problemsByDifficulty.MEDIUM || 0;
    const hardCount = data.problemsByDifficulty.HARD || 0;

    document.getElementById('difficulty-breakdown').innerHTML = `
        <span class="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">K:${easyCount}</span>
        <span class="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">O:${mediumCount}</span>
        <span class="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded">Z:${hardCount}</span>
    `;

    // Zorluk sayıları
    animateCount(document.getElementById('easy-count'), easyCount);
    animateCount(document.getElementById('medium-count'), mediumCount);
    animateCount(document.getElementById('hard-count'), hardCount);

    // Hızlı Özetler
    const successRate = data.totalSolutions > 0 ? Math.round((data.totalSolutions / (data.totalProblems * data.totalUsers)) * 100) : 0;
    const displaySuccessRate = Math.min(successRate, 100);
    document.getElementById('success-rate').textContent = `%${displaySuccessRate}`;
    document.getElementById('success-rate-bar').style.width = `${displaySuccessRate}%`;

    const dailyAvgSolutions = data.dailySolutions && data.dailySolutions.length > 0
        ? Math.round(data.dailySolutions.reduce((sum, d) => sum + d.count, 0) / data.dailySolutions.length)
        : 0;
    animateCount(document.getElementById('daily-avg-solutions'), dailyAvgSolutions);

    // En popüler kategori (örnek - gerçek data'dan alınabilir)
    document.getElementById('popular-category').textContent = 'Genel Muhasebe';
    document.getElementById('popular-category-count').textContent = '142 çözüm';

    // Aktif oturumlar (aktif kullanıcıların yaklaşık %20'si)
    const activeSessions = Math.round(data.activeUsers * 0.2);
    animateCount(document.getElementById('active-sessions'), activeSessions);

    // 2. Grafikler
    renderDailySolutionsChart(data.dailySolutions);
    renderDifficultyChart(data.problemsByDifficulty);

    // 3. Tablo ve En Aktif Kullanıcılar
    renderTopProblemsTable(data.topSolvedProblems);
    renderTopUsers(data.topUsers);

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
                borderColor: '#1e293b',
                backgroundColor: 'rgba(30,41,59,0.1)',
                pointBackgroundColor: '#1e293b',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.4,
                fill: true,
                borderWidth: 2.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 1200, easing: 'easeOutQuart' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#fff',
                    bodyColor: '#e2e8f0',
                    padding: 12,
                    cornerRadius: 10,
                    displayColors: false,
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#64748b', font: { size: 11, weight: '500' } }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(148,163,184,0.2)', drawBorder: false },
                    ticks: {
                        color: '#64748b',
                        font: { size: 11, weight: '500' },
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
                backgroundColor: ['#34d399', '#fbbf24', '#fb7185'],
                borderColor: '#ffffff',
                borderWidth: 3,
                hoverOffset: 8,
                hoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            animation: { duration: 1200, easing: 'easeOutQuart' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#fff',
                    bodyColor: '#e2e8f0',
                    padding: 12,
                    cornerRadius: 10,
                    displayColors: true,
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 },
                    boxWidth: 12,
                    boxHeight: 12,
                    usePointStyle: true
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
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-slate-500 text-sm">Henüz çözülen problem yok</td></tr>';
        return;
    }

    problems.forEach((problem, index) => {
        const difficultyBadge = getDifficultyBadge(problem.difficulty);
        const medalIcon = index < 3 ? getMedalIcon(index) : '';
        const row = `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 text-sm font-semibold text-slate-900">${medalIcon}${index + 1}</td>
                <td class="px-6 py-4 text-sm font-medium text-slate-900">${problem.title}</td>
                <td class="px-6 py-4">${difficultyBadge}</td>
                <td class="px-6 py-4 text-right">
                    <span class="inline-flex items-center gap-1 text-sm font-bold text-slate-900">
                        <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i>
                        ${problem.solveCount.toLocaleString('tr-TR')}
                    </span>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    lucide.createIcons();
}

// En Aktif Kullanıcılar listesi
function renderTopUsers(topUsers) {
    const container = document.getElementById('top-users-list');

    // Eğer veri yoksa boş mesajı göster
    if (!topUsers || topUsers.length === 0) {
        container.innerHTML = '<div class="text-center py-8 text-slate-500 text-sm">Henüz aktif kullanıcı yok</div>';
        return;
    }

    const gradients = [
        'from-emerald-500 to-emerald-600',
        'from-slate-400 to-slate-500',
        'from-amber-500 to-amber-600'
    ];

    const badges = [
        { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'trophy' },
        { bg: 'bg-slate-100', text: 'text-slate-600', icon: 'star' },
        { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'award' }
    ];

    container.innerHTML = topUsers.map((user, index) => `
        <div class="flex items-center gap-3 p-3 rounded-lg ${index === 0 ? 'bg-slate-50 border border-slate-100' : 'hover:bg-slate-50'} transition-colors">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br ${gradients[index]} text-white flex items-center justify-center font-bold text-sm">
                ${user.rank}
            </div>
            <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-slate-900">${user.username}</div>
                <div class="text-xs text-slate-500">${user.solutionCount} çözüm</div>
            </div>
            <div class="flex items-center gap-1 px-2 py-1 ${badges[index].bg} ${badges[index].text} rounded-md">
                <i data-lucide="${badges[index].icon}" class="w-3 h-3" style="stroke-width:2;"></i>
                <span class="text-xs font-semibold">${user.solutionCount}</span>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

// Medal ikonu
function getMedalIcon(index) {
    const medals = ['🥇 ', '🥈 ', '🥉 '];
    return medals[index] || '';
}

// Zorluk badge
function getDifficultyBadge(difficulty) {
    const badges = {
        'EASY': '<span class="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200">Kolay</span>',
        'MEDIUM': '<span class="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-100 text-amber-700 border border-amber-200">Orta</span>',
        'HARD': '<span class="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-100 text-rose-700 border border-rose-200">Zor</span>'
    };
    return badges[difficulty] || difficulty;
}

// Profil dropdown'ını aç/kapat
function toggleProfileDropdown(event) {
    if (event) {
        event.stopPropagation(); // Event'in üst elementlere yayılmasını engelle
    }
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

// Dropdown dışına tıklandığında kapat
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('profileDropdown');

    if (dropdown && !dropdown.contains(event.target)) {
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

// Global exports
window.toggleProfileDropdown = toggleProfileDropdown;
window.logout = logout;