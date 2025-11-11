// Admin.js - Admin panel işlemleri
// Ortak dosyalar: common.js, api.js, auth.js

const API_PROBLEMS = `${CommonConfig.API_URL}/admin/problems`;
const API_CORRECT = `${CommonConfig.API_URL}/correct-entries`;

// Pagination state
let currentPage = 0; // Backend 0-indexed
let totalPages = 0;
let totalItems = 0;
const itemsPerPage = 5;

// Auth kontrolü
document.addEventListener('DOMContentLoaded', () => {
    // Admin guard kullan
    if (!AuthService.requireAdmin()) {
        return;
    }

    // İlk yükleme
    showSection('dashboard');
    addAnswerRow('c-answersBody');
    lucide.createIcons();
});

// Logout
function logout() {
    AuthService.logout();
}

// Section Management
function showSection(which) {
    // Tüm bölümleri gizle
    const sections = [
        'dashboard', 'all-problems', 'add-problem', 'categories',
        'all-quizzes', 'add-quiz', 'quiz-topics',
        'all-users', 'active-users', 'banned-users',
        'problem-reports', 'user-reports', 'performance-analysis',
        'duzenle', 'quiz-topics', 'quiz-quizzes', 'quiz-questions',
        'study-cards-list', 'study-card-sections',
        'study-cards-crud', 'study-sections-management'
    ];

    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            element.classList.add('hidden');
        }
    });

    // Seçilen bölümü göster
    const targetElement = document.getElementById(which);
    if (targetElement) {
        targetElement.classList.remove('hidden');
    }

    // Bölüme özel işlemler
    if (which === 'all-problems') {
        loadProblems();
        // Event listener'ları ekle
        setTimeout(() => {
            initProblemSearchListeners();
        }, 100);
    } else if (which === 'add-problem') {
        // Yeni problem formu için gerekli işlemler
    } else if (which === 'all-users') {
        loadUsers();
    } else if (which === 'dashboard') {
        // Dashboard karşılama ekranı - veri yükleme gerekmez
    } else if (which === 'all-quizzes') {
        loadAdminQuizzes();
    } else if (which === 'add-quiz') {
        loadAdminTopicsForForm();
        resetAdminQuizForm();
    } else if (which === 'quiz-topics') {
        loadTopics();
        loadTopicsForSelect();
    } else if (which === 'quiz-quizzes') {
        loadQuizzes();
        loadQuizzesForSelect();
    } else if (which === 'quiz-questions') {
        loadQuizzesForSelect();
    } else if (which === 'categories') {
        loadCategories();
    } else if (which === 'study-cards-list') {
        loadStudyCards();
    } else if (which === 'study-card-sections') {
        loadCardsForSelect();
    } else if (which === 'study-cards-crud') {
        // Kart Yönetimi - kartların temel bilgilerini yönet
        if (window.studyCardCRUD) {
            window.studyCardCRUD.init();
        }
    } else if (which === 'study-sections-management') {
        // Bölüm Yönetimi
        if (window.studySectionManager) {
            window.studySectionManager.init();
        }
    }

    // Force hide study-cards-crud section when not active (using display style)
    const studyCardsSection = document.getElementById('study-cards-crud');
    if (studyCardsSection) {
        if (which === 'study-cards-crud') {
            // Show the section
            studyCardsSection.style.display = 'block';
            studyCardsSection.classList.remove('hidden');
        } else {
            // Hide the section forcefully
            studyCardsSection.style.display = 'none';
            studyCardsSection.classList.add('hidden');
            // Clear container content
            const container = document.getElementById('study-cards-crud-container');
            if (container) {
                container.innerHTML = '';
            }
        }
    }

    lucide.createIcons();
}

// Submenu toggle
function toggleSubmenu(menuName) {
    const submenu = document.getElementById(`${menuName}-submenu`);
    const chevron = document.getElementById(`${menuName}-chevron`);
    
    if (submenu && chevron) {
        submenu.classList.toggle('hidden');
        chevron.classList.toggle('rotate-180');
    }
}

// Helpers
const getValue = id => document.getElementById(id).value;
const setValue = (id, val) => document.getElementById(id).value = val;
const escapeHtml = str => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeAttr = str => String(str || '').replace(/"/g, '&quot;');

const difficultyBadge = d => {
    const badges = {
        'EASY': 'bg-blue-100 text-blue-800',
        'MEDIUM': 'bg-blue-200 text-blue-900',
        'HARD': 'bg-blue-500 text-white'
    };
    return badges[d] || badges['MEDIUM'];
};

const difficultyLabel = d => {
    const labels = { 'EASY': 'Kolay', 'MEDIUM': 'Orta', 'HARD': 'Zor' };
    return labels[d] || 'Orta';
};

const difficultyPoints = d => {
    const points = { 'EASY': 10, 'MEDIUM': 20, 'HARD': 30 };
    return points[d] || 20;
};

// Modals
function showSuccess(msg) {
    document.getElementById('successText').textContent = msg || 'İşlem başarılı.';
    const m = document.getElementById('successModal');
    m.classList.remove('hidden');
    m.classList.add('flex');
    lucide.createIcons();
    setTimeout(() => hideModal('successModal'), 2000);
}

function showError(msg) {
    document.getElementById('errorText').textContent = msg || 'Bir hata oluştu.';
    const m = document.getElementById('errorModal');
    m.classList.remove('hidden');
    m.classList.add('flex');
    lucide.createIcons();
}

function hideModal(id) {
    const m = document.getElementById(id);
    m.classList.add('hidden');
    m.classList.remove('flex');
}

// Answer Rows
function addAnswerRow(tbodyId, hesapKodu = '', hesapAdi = '', borc = '', alacak = '') {
    const tbody = document.getElementById(tbodyId);
    const tr = document.createElement('tr');
    tr.className = 'align-top';
    tr.innerHTML = `
        <td class="px-4 py-2">
            <input type="text" value="${escapeAttr(hesapKodu)}" placeholder="Örn: 100" class="account-code-input w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300" />
        </td>
        <td class="px-4 py-2">
            <div class="account-name-display text-sm text-slate-600 py-1.5 px-2.5 rounded-md border border-slate-200 bg-slate-50 min-h-[38px] flex items-center">${escapeAttr(hesapAdi)}</div>
        </td>
        <td class="px-4 py-2">
            <div class="relative">
                <span class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₺</span>
                <input type="number" step="0.01" value="${escapeAttr(borc)}" class="debit-input w-full rounded-md border border-slate-300 bg-white pl-6 pr-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300" />
            </div>
        </td>
        <td class="px-4 py-2">
            <div class="relative">
                <span class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₺</span>
                <input type="number" step="0.01" value="${escapeAttr(alacak)}" class="credit-input w-full rounded-md border border-slate-300 bg-white pl-6 pr-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300" />
            </div>
        </td>
        <td class="px-4 py-2 text-right">
            <div class="flex items-center justify-end gap-2">
                <button type="button" class="add-row-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-green-200 text-green-700 hover:bg-green-50">
                    <i data-lucide="plus" class="w-3.5 h-3.5" style="stroke-width:1.5;"></i>
                    Ekle
                </button>
                <button type="button" class="remove-row-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-red-200 text-red-700 hover:bg-red-50">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5" style="stroke-width:1.5;"></i>
                    Sil
                </button>
            </div>
        </td>
    `;
    tbody.appendChild(tr);
    
    // Event listener'ları ekle - Borç/Alacak mutual exclusion
    const debitInput = tr.querySelector('.debit-input');
    const creditInput = tr.querySelector('.credit-input');
    const accountCodeInput = tr.querySelector('.account-code-input');
    const accountNameDisplay = tr.querySelector('.account-name-display');
    
    // Hesap kodu değiştiğinde hesap adını getir - Sadece 3 haneli kodlar için
    accountCodeInput.addEventListener('input', function() {
        const code = this.value.trim();

        // Hesap kodları her zaman 3 hanelidir
        if (code && code.length === 3) {
            updateAccountName(code, accountNameDisplay);
        } else if (code.length > 0 && code.length < 3) {
            // Henüz 3 hane girilmedi
            accountNameDisplay.textContent = '';
            accountNameDisplay.className = 'account-name-display text-sm text-slate-600 py-1.5 px-2.5 rounded-md border border-slate-200 bg-slate-50 min-h-[38px] flex items-center';
        } else {
            // Boş
            accountNameDisplay.textContent = '';
            accountNameDisplay.className = 'account-name-display text-sm text-slate-600 py-1.5 px-2.5 rounded-md border border-slate-200 bg-slate-50 min-h-[38px] flex items-center';
        }
    });
    
    debitInput.addEventListener('input', function() {
        if (this.value && parseFloat(this.value) > 0) {
            creditInput.value = '';
        }
        updateAdminTotals(tbodyId);
    });
    
    creditInput.addEventListener('input', function() {
        if (this.value && parseFloat(this.value) > 0) {
            debitInput.value = '';
        }
        updateAdminTotals(tbodyId);
    });
    
    // "Ekle" butonu event listener
    tr.querySelector('.add-row-btn').addEventListener('click', () => {
        addAnswerRow(tbodyId);
    });
    
    // "Sil" butonu event listener
    tr.querySelector('.remove-row-btn').addEventListener('click', () => {
        tr.remove();
        updateAdminTotals(tbodyId);
    });
    
    lucide.createIcons();
}

document.getElementById('c-addRow').addEventListener('click', () => addAnswerRow('c-answersBody'));
document.getElementById('e-addRow').addEventListener('click', () => addAnswerRow('e-answersBody'));

// Admin toplam ve denge kontrolü
function updateAdminTotals(tbodyId) {
    const rows = Array.from(document.querySelectorAll(`#${tbodyId} tr`));
    let totalDebit = 0;
    let totalCredit = 0;
    
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input[type="number"]');
        if (inputs.length >= 2) {
            totalDebit += parseFloat(inputs[0].value) || 0;
            totalCredit += parseFloat(inputs[1].value) || 0;
        }
    });
    
    // Form ID'sine göre element ID'lerini belirle
    const isCreateForm = tbodyId === 'c-answersBody';
    const prefix = isCreateForm ? 'c' : 'e';
    
    // Toplamları güncelle
    const debitTotalElement = document.getElementById(`${prefix}-debit-total`);
    const creditTotalElement = document.getElementById(`${prefix}-credit-total`);
    const balanceElement = document.getElementById(`${prefix}-balance`);
    
    if (debitTotalElement) {
        debitTotalElement.textContent = totalDebit.toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
    
    if (creditTotalElement) {
        creditTotalElement.textContent = totalCredit.toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
    
    // Denge kontrolü
    if (balanceElement) {
        if (totalDebit === 0 && totalCredit === 0) {
            balanceElement.innerHTML = '<i data-lucide="minus-circle" class="w-4 h-4" style="stroke-width: 1.5;"></i><span>Kayıt Boş</span>';
            balanceElement.className = 'flex items-center gap-2 text-slate-500';
        } else if (Math.abs(totalDebit - totalCredit) < 0.01) {
            balanceElement.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4" style="stroke-width: 1.5;"></i><span>Dengeli</span>';
            balanceElement.className = 'flex items-center gap-2 text-green-600';
        } else {
            const difference = Math.abs(totalDebit - totalCredit);
            const farkText = difference.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            balanceElement.innerHTML = '<i data-lucide="alert-triangle" class="w-4 h-4" style="stroke-width: 1.5;"></i><span>Dengesiz (Fark: ' + farkText + '₺)</span>';
            balanceElement.className = 'flex items-center gap-2 text-amber-600';
        }
        lucide.createIcons();
    }
}

// Collect answers from tbody
function collectAnswers(tbodyId) {
    const rows = Array.from(document.querySelectorAll(`#${tbodyId} tr`));
    return rows.map(r => {
        const inputs = r.querySelectorAll('input');
        const accountNameDisplay = r.querySelector('.account-name-display');
        return {
            accountCode: (inputs[0].value || '').trim(),
            accountName: accountNameDisplay ? accountNameDisplay.textContent.trim() : '',
            debitAmount: Number(inputs[1].value || 0),
            creditAmount: Number(inputs[2].value || 0),
        };
    }).filter(a => a.accountCode || a.debitAmount || a.creditAmount);
}

// LIST (GET) - Backend Sayfalama ile
async function loadProblems(page = 0, search = '', difficulty = '') {
    try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
            showError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
            setTimeout(() => window.location.href = 'login.html', 2000);
            return;
        }

        console.log('Loading problems with token:', token.substring(0, 20) + '...');

        // URL parametrelerini oluştur
        let url = `${API_PROBLEMS}?page=${page}&size=${itemsPerPage}`;
        if (search && search.trim() !== '') {
            url += `&search=${encodeURIComponent(search.trim())}`;
        }
        if (difficulty && difficulty.trim() !== '') {
            url += `&difficulty=${encodeURIComponent(difficulty.trim())}`;
        }

        console.log('Fetching URL:', url);

        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', res.status);
        console.log('Response headers:', res.headers);

        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                showError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
                setTimeout(() => window.location.href = 'login.html', 2000);
                return;
            }
            throw new Error(`HTTP ${res.status}: Problemler yüklenemedi`);
        }

        const responseText = await res.text();
        console.log('Problems response length:', responseText.length);
        console.log('Problems response preview:', responseText.substring(0, 200));
        
        // Response çok büyükse kes
        let cleanResponse = responseText;
        if (responseText.length > 100000) { // 100KB'den büyükse
            console.warn('Response çok büyük, temizleniyor...');
            // JSON'u temizle - sadece temel alanları al
            try {
                const tempData = JSON.parse(responseText.substring(0, 50000)); // İlk 50KB'yi al
                cleanResponse = JSON.stringify({
                    number: tempData.number || 0,
                    totalPages: tempData.totalPages || 0,
                    totalElements: tempData.totalElements || 0,
                    content: tempData.content ? tempData.content.map(item => ({
                        id: item.id,
                        title: item.title,
                        content: item.content,
                        hint: item.hint,
                        tags: item.tags,
                        difficulty: item.difficulty,
                        createdAt: item.createdAt
                    })) : []
                });
            } catch (e) {
                console.error('Response temizleme hatası:', e);
                throw new Error('Response çok büyük ve temizlenemedi');
            }
        }
        
        let data;
        try {
            data = JSON.parse(cleanResponse);
        } catch (parseError) {
            console.error('Problems JSON Parse Error:', parseError);
            console.error('Problems response text (first 500 chars):', cleanResponse.substring(0, 500));
            throw new Error('Problem listesi JSON formatında değil');
        }

        currentPage = data.number;
        totalPages = data.totalPages;
        totalItems = data.totalElements;

        renderProblems(data.content);
        renderPagination();
    } catch (err) {
        console.error('Problem listeleme hatası:', err);
        showError(err.message || 'Problemler yüklenirken hata oluştu.');
    }
}

function renderProblems(problems) {
    const tbody = document.getElementById('problemsTbody');
    tbody.innerHTML = '';

    if (!problems || !problems.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-6 text-sm text-slate-500 text-center">Kayıt bulunamadı.</td></tr>';
        lucide.createIcons();
        return;
    }

    problems.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50/60 align-top';

        tr.innerHTML = `
            <td class="px-6 py-3 text-sm">
                <div class="font-medium text-slate-900">${escapeHtml(item.title)}</div>
                <div class="text-slate-600 text-xs mt-0.5 line-clamp-2">${escapeHtml(item.content)}</div>
                ${item.hint ? `<div class="text-slate-500 text-xs mt-0.5">İpucu: ${escapeHtml(item.hint)}</div>` : ''}
            </td>
            <td class="px-6 py-3">
                <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${difficultyBadge(item.difficulty)}">
                    ${difficultyLabel(item.difficulty)}
                </span>
            </td>
            <td class="px-6 py-3">
                <div class="flex flex-wrap gap-1.5">
                    ${(item.tags || '').split(',').filter(Boolean).map(t => `
                        <span class="inline-flex items-center px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700 text-xs">${escapeHtml(t.trim())}</span>
                    `).join('')}
                </div>
            </td>
            <td class="px-6 py-3 text-right">
                <div class="inline-flex items-center gap-2">
                    <button class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50" onclick="editProblem(${item.id})">
                        <i data-lucide="pencil" class="w-3.5 h-3.5" style="stroke-width:1.5;"></i>
                        Düzenle
                    </button>
                    <button class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-red-200 text-red-700 hover:bg-red-50" onclick="deleteProblem(${item.id})">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5" style="stroke-width:1.5;"></i>
                        Sil
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    lucide.createIcons();
}

function renderPagination() {
    const paginationContainer = document.getElementById('pagination-container');

    if (!paginationContainer) return;

    if (totalPages <= 1) {
        paginationContainer.innerHTML = `
            <div class="text-sm text-slate-600">
                Toplam <span class="font-medium">${totalItems}</span> problem
            </div>
        `;
        return;
    }

    let paginationHTML = '<div class="flex items-center justify-between">';

    // Sol: Bilgi
    const startItem = currentPage * itemsPerPage + 1;
    const endItem = Math.min((currentPage + 1) * itemsPerPage, totalItems);
    paginationHTML += `
        <div class="text-sm text-slate-600">
            <span class="font-medium">${startItem}</span> - <span class="font-medium">${endItem}</span> / <span class="font-medium">${totalItems}</span> problem
        </div>
    `;

    // Sağ: Butonlar
    paginationHTML += '<div class="flex items-center gap-2">';

    // Önceki butonu
    paginationHTML += `
        <button onclick="changePage(${currentPage - 1})" 
            ${currentPage === 0 ? 'disabled' : ''} 
            class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white">
            <i data-lucide="chevron-left" class="w-4 h-4" style="stroke-width:1.5;"></i>
            Önceki
        </button>
    `;

    // Sayfa numaraları (1-indexed gösterim)
    for (let i = 0; i < totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `
                <button class="inline-flex items-center justify-center w-10 h-10 text-sm font-medium rounded-md bg-blue-900 text-white">
                    ${i + 1}
                </button>
            `;
        } else if (i === 0 || i === totalPages - 1 || Math.abs(i - currentPage) <= 1) {
            paginationHTML += `
                <button onclick="changePage(${i})" class="inline-flex items-center justify-center w-10 h-10 text-sm font-medium rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50">
                    ${i + 1}
                </button>
            `;
        } else if (Math.abs(i - currentPage) === 2) {
            paginationHTML += '<span class="text-slate-400 px-2">...</span>';
        }
    }

    // Sonraki butonu
    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" 
            ${currentPage === totalPages - 1 ? 'disabled' : ''} 
            class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white">
            Sonraki
            <i data-lucide="chevron-right" class="w-4 h-4" style="stroke-width:1.5;"></i>
        </button>
    `;

    paginationHTML += '</div></div>';
    paginationContainer.innerHTML = paginationHTML;
    lucide.createIcons();
}

function changePage(page) {
    if (page < 0 || page >= totalPages) return;
    loadProblems(page);
}

// CREATE (POST)
document.getElementById('createForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const title = getValue('c-title').trim();
        const content = getValue('c-content').trim();

        if (!title || !content) {
            showError('Başlık ve İçerik zorunludur.');
            return;
        }

        const entries = collectAnswers('c-answersBody');
        if (entries.length === 0) {
            showError('En az bir doğru cevap girmelisiniz!');
            return;
        }

        const problem = {
            title,
            content,
            hint: getValue('c-hint').trim(),
            tags: getValue('c-tags').trim(),
            difficulty: getValue('c-difficulty'),
            correctEntries: entries
        };

        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/admin/problems', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(problem)
        });

        if (!res.ok) {
            const error = await res.text();
            throw new Error('Problem eklenemedi: ' + error);
        }

        showSuccess('Problem başarıyla kaydedildi.');
        setTimeout(() => {
            clearCreateForm();
            showSection('all-problems');
            loadProblems();
        }, 2000);
    } catch (err) {
        console.error('Problem ekleme hatası:', err);
        showError(err.message || 'Problem eklenirken hata oluştu.');
    }
});

function clearCreateForm() {
    setValue('c-title', '');
    setValue('c-content', '');
    setValue('c-hint', '');
    setValue('c-tags', '');
    setValue('c-difficulty', 'MEDIUM');
    const body = document.getElementById('c-answersBody');
    body.innerHTML = '';
    addAnswerRow('c-answersBody');
}

// EDIT (GET + PUT)
async function editProblem(id) {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8080/api/admin/problems/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Problem bulunamadı');

        const data = await res.json();
        
        setValue('e-id', data.id);
        setValue('e-title', data.title);
        setValue('e-content', data.content);
        setValue('e-hint', data.hint || '');
        setValue('e-tags', data.tags || '');
        setValue('e-difficulty', data.difficulty || 'MEDIUM');

        const body = document.getElementById('e-answersBody');
        body.innerHTML = '';

        if (!data.correctEntries || !data.correctEntries.length) {
            addAnswerRow('e-answersBody');
        } else {
            data.correctEntries.forEach(entry => 
                addAnswerRow('e-answersBody', entry.accountCode, entry.accountName, entry.debitAmount, entry.creditAmount)
            );
        }

        // Toplam güncelle
        updateAdminTotals('e-answersBody');

        showSection('edit');
        document.getElementById('duzenle').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
        console.error('Problem düzenleme hatası:', err);
        showError(err.message || 'Problem yüklenirken hata oluştu.');
    }
}

document.getElementById('e-cancel').addEventListener('click', () => {
    showSection('list');
});

document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const id = getValue('e-id');
        const title = getValue('e-title').trim();
        const content = getValue('e-content').trim();

        if (!title || !content) {
            showError('Başlık ve İçerik zorunludur.');
            return;
        }

        const entries = collectAnswers('e-answersBody');
        if (entries.length === 0) {
            showError('En az bir doğru cevap girmelisiniz!');
            return;
        }

        const updated = {
            title: getValue('e-title').trim(),
            content: getValue('e-content').trim(),
            hint: getValue('e-hint').trim(),
            tags: getValue('e-tags').trim(),
            difficulty: getValue('e-difficulty'),
            correctEntries: entries
        };

        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8080/api/admin/problems/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updated)
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Problem güncellenemedi: ${errorText}`);
        }

        showSuccess('Problem başarıyla güncellendi.');
        setTimeout(() => {
            showSection('all-problems');
            loadProblems();
        }, 2000);
    } catch (err) {
        console.error('Problem güncelleme hatası:', err);
        showError(err.message || 'Güncelleme sırasında hata oluştu.');
    }
});

// DELETE
async function deleteProblem(id) {
    if (!confirm('Bu problemi silmek istediğinize emin misiniz?')) return;

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8080/api/admin/problems/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Problem silinemedi');

        showSuccess('Problem başarıyla silindi.');
        setTimeout(() => {
            loadProblems(currentPage);
        }, 1500);
    } catch (err) {
        console.error('Problem silme hatası:', err);
        showError(err.message || 'Problem silinirken hata oluştu.');
    }
}

// Mevcut satırlara event listener ekle
function addEventListenersToExistingRows() {
    document.querySelectorAll('#c-answersBody tr, #e-answersBody tr').forEach(row => {
        const debitInput = row.querySelector('.debit-input');
        const creditInput = row.querySelector('.credit-input');
        const accountCodeInput = row.querySelector('.account-code-input');
        const accountNameDisplay = row.querySelector('.account-name-display');
        
        if (debitInput && creditInput) {
            // Mevcut event listener'ları kaldır (duplikasyon önlemek için)
            debitInput.removeEventListener('input', handleDebitInput);
            creditInput.removeEventListener('input', handleCreditInput);
            
            // Yeni event listener'ları ekle
            debitInput.addEventListener('input', handleDebitInput);
            creditInput.addEventListener('input', handleCreditInput);
        }
        
        // Hesap kodu event listener'ı ekle
        if (accountCodeInput && accountNameDisplay) {
            accountCodeInput.removeEventListener('input', handleAccountCodeInput);
            accountCodeInput.addEventListener('input', handleAccountCodeInput);
        }
    });
}

// Event handler fonksiyonları
function handleDebitInput() {
    if (this.value && parseFloat(this.value) > 0) {
        const creditInput = this.closest('tr').querySelector('.credit-input');
        if (creditInput) {
            creditInput.value = '';
        }
    }
    // Toplam güncelle
    const tbodyId = this.closest('tbody').id;
    updateAdminTotals(tbodyId);
}

function handleCreditInput() {
    if (this.value && parseFloat(this.value) > 0) {
        const debitInput = this.closest('tr').querySelector('.debit-input');
        if (debitInput) {
            debitInput.value = '';
        }
    }
    // Toplam güncelle
    const tbodyId = this.closest('tbody').id;
    updateAdminTotals(tbodyId);
}

function handleAccountCodeInput() {
    const code = this.value.trim();
    const accountNameDisplay = this.closest('tr').querySelector('.account-name-display');

    // Hesap kodları her zaman 3 hanelidir, sadece 3 haneli kodlar için sorgu yap
    if (code && code.length === 3) {
        updateAccountName(code, accountNameDisplay);
    } else if (code.length > 0 && code.length < 3) {
        // Henüz 3 hane girilmedi, temizle
        accountNameDisplay.textContent = '';
        accountNameDisplay.className = 'account-name-display text-sm text-slate-600 py-1.5 px-2.5 rounded-md border border-slate-200 bg-slate-50 min-h-[38px] flex items-center';
    } else {
        // Boş ise temizle
        accountNameDisplay.textContent = '';
        accountNameDisplay.className = 'account-name-display text-sm text-slate-600 py-1.5 px-2.5 rounded-md border border-slate-200 bg-slate-50 min-h-[38px] flex items-center';
    }
}

// Sayfa yüklendiğinde mevcut satırlara event listener ekle
document.addEventListener('DOMContentLoaded', function() {
    addEventListenersToExistingRows();
});

// Profil dropdown fonksiyonları
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
        document.getElementById('userInitial').textContent = initial;
        document.getElementById('userInitialDropdown').textContent = initial;
        document.getElementById('userName').textContent = user.username;
        document.getElementById('userRole').textContent = 'Yönetici';
        
        // Dropdown butonundaki kullanıcı adını güncelle
        const firstName = user.firstName || user.username;
        console.log('Displaying name:', firstName);
        document.getElementById('userNameButton').textContent = `Hoşgeldin, ${firstName}`;
    }
}

// Hesap adını güncelle
async function updateAccountName(code, displayElement) {
    try {
        const response = await fetch(`${CommonConfig.API_URL}/account-plans/search?code=${encodeURIComponent(code)}`);
        if (response.ok) {
            const data = await response.json();
            if (data && data.name) {
                displayElement.textContent = data.name;
                displayElement.className = 'account-name-display text-sm text-green-600 py-1.5 px-2.5 rounded-md border border-green-200 bg-green-50 min-h-[38px] flex items-center';
            } else {
                displayElement.textContent = 'Hesap bulunamadı';
                displayElement.className = 'account-name-display text-sm text-red-500 py-1.5 px-2.5 rounded-md border border-red-200 bg-red-50 min-h-[38px] flex items-center';
            }
        } else {
            displayElement.textContent = 'Hesap bulunamadı';
            displayElement.className = 'account-name-display text-sm text-red-500 py-1.5 px-2.5 rounded-md border border-red-200 bg-red-50 min-h-[38px] flex items-center';
        }
    } catch (error) {
        console.error('Hesap adı getirme hatası:', error);
        displayElement.textContent = 'Hesap bulunamadı';
        displayElement.className = 'account-name-display text-sm text-red-500 py-1.5 px-2.5 rounded-md border border-red-200 bg-red-50 min-h-[38px] flex items-center';
    }
}

        // Dashboard artık sadece karşılama ekranı - veri yükleme gerekmez

// Users management
async function loadUsers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8080/api/admin/users?page=0&size=50', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Kullanıcılar alınamadı');
        }
        
        const data = await response.json();
        const tbody = document.getElementById('usersTbody');
        
        if (data.content && data.content.length > 0) {
            tbody.innerHTML = data.content.map(user => `
                <tr>
                    <td class="px-6 py-3 text-sm">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                ${user.firstName ? user.firstName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div class="font-medium text-slate-900">${user.firstName ? `${user.firstName} ${user.lastName}` : user.username}</div>
                                <div class="text-slate-500 text-xs">${user.email || 'E-posta yok'}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-3 text-sm text-slate-600">${user.email || 'E-posta yok'}</td>
                    <td class="px-6 py-3">
                        <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${getRoleColor(user.role)}">
                            ${getRoleText(user.role)}
                        </span>
                    </td>
                    <td class="px-6 py-3 text-sm text-slate-600">${formatDate(user.createdAt)}</td>
                    <td class="px-6 py-3 text-right">
                        <div class="flex items-center gap-2">
                            <button onclick="editUser('${user.id}')" class="text-slate-400 hover:text-slate-600">
                                <i data-lucide="edit" class="w-4 h-4"></i>
                            </button>
                            <button onclick="deleteUser('${user.id}')" class="text-slate-400 hover:text-red-600">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-8 text-center text-slate-500">
                        <i data-lucide="users" class="w-8 h-8 mx-auto mb-2 text-slate-400"></i>
                        <div>Henüz kullanıcı bulunmuyor</div>
                    </td>
                </tr>
            `;
        }
        
        lucide.createIcons();
    } catch (err) {
        console.error('Kullanıcı yükleme hatası:', err);
        const tbody = document.getElementById('usersTbody');
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-8 text-center text-red-500">
                    <i data-lucide="alert-circle" class="w-8 h-8 mx-auto mb-2"></i>
                    <div>Kullanıcılar yüklenirken hata oluştu</div>
                </td>
            </tr>
        `;
        lucide.createIcons();
    }
}

// Helper functions
function getRoleColor(role) {
    switch (role) {
        case 'ADMIN':
            return 'bg-red-100 text-red-800';
        case 'USER':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function getRoleText(role) {
    switch (role) {
        case 'ADMIN':
            return 'Admin';
        case 'USER':
            return 'Öğrenci';
        default:
            return 'Bilinmiyor';
    }
}

function getDifficultyColor(difficulty) {
    switch (difficulty) {
        case 'EASY':
            return 'bg-green-100 text-green-800';
        case 'MEDIUM':
            return 'bg-yellow-100 text-yellow-800';
        case 'HARD':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function getDifficultyText(difficulty) {
    switch (difficulty) {
        case 'EASY':
            return 'Kolay';
        case 'MEDIUM':
            return 'Orta';
        case 'HARD':
            return 'Zor';
        default:
            return 'Bilinmiyor';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'Bilinmiyor';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Geçersiz tarih';
        }
        return date.toLocaleDateString('tr-TR');
    } catch (error) {
        console.error('Tarih formatlama hatası:', error);
        return 'Geçersiz tarih';
    }
}

// User management functions
async function editUser(userId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Kullanıcı bilgileri alınamadı');
        }
        
        const user = await response.json();
        
        // Kullanıcı düzenleme modalını aç
        const newRole = prompt(`Kullanıcı rolünü değiştir (${user.username}):`, user.role);
        if (newRole && newRole !== user.role) {
            await updateUserRole(userId, newRole);
        }
    } catch (err) {
        console.error('Kullanıcı düzenleme hatası:', err);
        alert('Kullanıcı düzenlenirken hata oluştu');
    }
}

async function updateUserRole(userId, newRole) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/role?role=${newRole}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Kullanıcı rolü güncellenemedi');
        }
        
        alert('Kullanıcı rolü başarıyla güncellendi');
        loadUsers(); // Listeyi yenile
    } catch (err) {
        console.error('Rol güncelleme hatası:', err);
        alert('Rol güncellenirken hata oluştu');
    }
}

async function deleteUser(userId) {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Kullanıcı silinemedi');
        }
        
        alert('Kullanıcı başarıyla silindi');
        loadUsers(); // Listeyi yenile
    } catch (err) {
        console.error('Kullanıcı silme hatası:', err);
        alert('Kullanıcı silinirken hata oluştu');
    }
}

// Problem management functions
async function editProblem(problemId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/admin/problems/${problemId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Problem bilgileri alınamadı');
        }
        
        const problem = await response.json();
        
        // Problem düzenleme formunu doldur
        document.getElementById('e-id').value = problem.id;
        document.getElementById('e-title').value = problem.title;
        document.getElementById('e-content').value = problem.content;
        document.getElementById('e-hint').value = problem.hint || '';
        document.getElementById('e-tags').value = problem.tags || '';
        document.getElementById('e-difficulty').value = problem.difficulty;
        
        // Doğru cevapları doldur
        const answersBody = document.getElementById('e-answersBody');
        answersBody.innerHTML = '';
        
        if (problem.correctEntries && problem.correctEntries.length > 0) {
            problem.correctEntries.forEach(entry => {
                addAnswerRow('e-answersBody', entry.accountCode, entry.accountName, entry.debitAmount, entry.creditAmount);
            });
        } else {
            addAnswerRow('e-answersBody');
        }
        
        // Düzenleme bölümünü göster
        showSection('duzenle');
        
    } catch (err) {
        console.error('Problem düzenleme hatası:', err);
        alert('Problem düzenlenirken hata oluştu');
    }
}

async function deleteProblem(problemId) {
    if (!confirm('Bu problemi silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/admin/problems/${problemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Problem silinemedi');
        }
        
        alert('Problem başarıyla silindi');
        loadProblems(); // Listeyi yenile
    } catch (err) {
        console.error('Problem silme hatası:', err);
        alert('Problem silinirken hata oluştu');
    }
}

// Problem Arama Fonksiyonları
function performProblemSearch() {
    const searchValue = document.getElementById('problemSearchInput')?.value || '';
    const difficultyValue = document.getElementById('problemDifficultyFilter')?.value || '';

    console.log('Arama yapılıyor:', { search: searchValue, difficulty: difficultyValue });

    // İlk sayfadan başlat
    currentPage = 0;
    loadProblems(currentPage, searchValue, difficultyValue);
}

function clearProblemSearch() {
    const searchInput = document.getElementById('problemSearchInput');
    const difficultyFilter = document.getElementById('problemDifficultyFilter');

    if (searchInput) searchInput.value = '';
    if (difficultyFilter) difficultyFilter.value = '';

    // Aramayı temizle ve tüm problemleri yükle
    currentPage = 0;
    loadProblems(currentPage, '', '');
}

// Event listener'ları ekle - Her section gösterildiğinde çağrılacak
function initProblemSearchListeners() {
    const searchButton = document.getElementById('problemSearchButton');
    const clearButton = document.getElementById('problemClearButton');
    const searchInput = document.getElementById('problemSearchInput');
    const difficultyFilter = document.getElementById('problemDifficultyFilter');

    console.log('Init search listeners:', { searchButton, clearButton, searchInput, difficultyFilter });

    if (searchButton) {
        searchButton.onclick = performProblemSearch;
        console.log('Search button listener added');
    }

    if (clearButton) {
        clearButton.onclick = clearProblemSearch;
        console.log('Clear button listener added');
    }

    // Enter tuşu ile arama
    if (searchInput) {
        searchInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performProblemSearch();
            }
        };
        console.log('Search input listener added');
    }

    // Zorluk filtresi değiştiğinde otomatik arama
    if (difficultyFilter) {
        difficultyFilter.onchange = performProblemSearch;
        console.log('Difficulty filter listener added');
    }
}

// Sayfalama fonksiyonunu güncelle
const originalChangePage = changePage;
function changePage(page) {
    const searchValue = document.getElementById('problemSearchInput')?.value || '';
    const difficultyValue = document.getElementById('problemDifficultyFilter')?.value || '';
    loadProblems(page, searchValue, difficultyValue);
}

// ==================== Quiz Management Functions ====================

let adminQuizzes = [];
let adminTopics = [];
let currentEditingQuizId = null;

// Load all quizzes
async function loadAdminQuizzes() {
    try {
        const response = await APIService.get('/api/admin/quizzes?page=0&size=50');
        const data = await response.json();
        adminQuizzes = data.content || [];
        renderAdminQuizzesTable();
        document.getElementById('admin-total-quizzes').textContent = data.totalElements || 0;
    } catch (error) {
        console.error('Quizler yüklenirken hata:', error);
        alert('Quizler yüklenemedi!');
    }
}

// Load all topics
async function loadAdminTopics() {
    try {
        const response = await APIService.get('/api/admin/quizzes/topics');
        adminTopics = await response.json();
        renderAdminTopicsTable();
        document.getElementById('admin-total-topics').textContent = adminTopics.length;
    } catch (error) {
        console.error('Konular yüklenirken hata:', error);
        alert('Konular yüklenemedi!');
    }
}

// Load topics for dropdown
async function loadAdminTopicsForForm() {
    try {
        const response = await APIService.get('/api/admin/quizzes/topics');
        adminTopics = await response.json();
        const select = document.getElementById('admin-quiz-topic-id');
        select.innerHTML = '<option value="">Konu Seçin</option>';
        adminTopics.forEach(topic => {
            select.innerHTML += `<option value="${topic.id}">${escapeHtml(topic.name)}</option>`;
        });
    } catch (error) {
        console.error('Konular yüklenirken hata:', error);
    }
}

// Render quizzes table
function renderAdminQuizzesTable() {
    const tbody = document.getElementById('admin-quizzes-table');
    tbody.innerHTML = '';

    if (!adminQuizzes || adminQuizzes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-slate-500">Henüz quiz eklenmemiş</td></tr>';
        return;
    }

    adminQuizzes.forEach(quiz => {
        const difficultyBadges = {
            1: '<span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-emerald-100 text-emerald-700">Kolay</span>',
            2: '<span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-amber-100 text-amber-700">Orta</span>',
            3: '<span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-rose-100 text-rose-700">Zor</span>'
        };
        const statusBadge = quiz.isActive
            ? '<span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-green-100 text-green-700">Aktif</span>'
            : '<span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-600">Pasif</span>';

        const row = `
            <tr class="hover:bg-slate-50/60">
                <td class="px-6 py-3 text-sm font-medium text-slate-900">${escapeHtml(quiz.title)}</td>
                <td class="px-6 py-3 text-sm text-slate-700">${escapeHtml(quiz.topic?.name || '-')}</td>
                <td class="px-6 py-3">${difficultyBadges[quiz.difficulty] || '-'}</td>
                <td class="px-6 py-3 text-sm text-slate-700">${quiz.questions?.length || 0}</td>
                <td class="px-6 py-3">${statusBadge}</td>
                <td class="px-6 py-3 text-right">
                    <button onclick="editAdminQuiz(${quiz.id})" class="text-slate-600 hover:text-slate-900 mr-3">
                        <i data-lucide="edit-2" class="w-4 h-4"></i>
                    </button>
                    <button onclick="deleteAdminQuiz(${quiz.id})" class="text-red-600 hover:text-red-700">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    lucide.createIcons();
}

// Render topics table
function renderAdminTopicsTable() {
    const tbody = document.getElementById('admin-topics-table');
    tbody.innerHTML = '';

    if (!adminTopics || adminTopics.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-slate-500">Henüz konu eklenmemiş</td></tr>';
        return;
    }

    adminTopics.forEach(topic => {
        const row = `
            <tr class="hover:bg-slate-50/60">
                <td class="px-6 py-3 text-sm font-medium text-slate-900">${escapeHtml(topic.name)}</td>
                <td class="px-6 py-3 text-sm text-slate-700">${escapeHtml(topic.description || '-')}</td>
                <td class="px-6 py-3 text-sm text-slate-700">${topic.quizCount || 0}</td>
                <td class="px-6 py-3 text-right">
                    <button onclick="editAdminTopic(${topic.id})" class="text-slate-600 hover:text-slate-900 mr-3">
                        <i data-lucide="edit-2" class="w-4 h-4"></i>
                    </button>
                    <button onclick="deleteAdminTopic(${topic.id})" class="text-red-600 hover:text-red-700">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    lucide.createIcons();
}

// Reset quiz form
function resetAdminQuizForm() {
    currentEditingQuizId = null;
    document.getElementById('admin-quiz-form').reset();
    document.getElementById('admin-quiz-id').value = '';
    document.getElementById('admin-quiz-is-active').checked = true;
    document.getElementById('admin-quiz-pass-percentage').value = 70;
}

// Edit quiz
async function editAdminQuiz(quizId) {
    try {
        const response = await APIService.get(`/api/admin/quizzes/${quizId}`);
        const quiz = await response.json();

        currentEditingQuizId = quizId;
        await loadAdminTopicsForForm();

        document.getElementById('admin-quiz-id').value = quiz.id;
        document.getElementById('admin-quiz-title').value = quiz.title;
        document.getElementById('admin-quiz-description').value = quiz.description || '';
        document.getElementById('admin-quiz-topic-id').value = quiz.topic?.id || '';
        document.getElementById('admin-quiz-difficulty').value = quiz.difficulty;
        document.getElementById('admin-quiz-time-limit').value = quiz.timeLimitMinutes || '';
        document.getElementById('admin-quiz-pass-percentage').value = quiz.passPercentage;
        document.getElementById('admin-quiz-is-active').checked = quiz.isActive;

        showSection('add-quiz');
    } catch (error) {
        console.error('Quiz yüklenirken hata:', error);
        alert('Quiz bilgileri yüklenemedi!');
    }
}

// Delete quiz
async function deleteAdminQuiz(quizId) {
    if (!confirm('Bu quizi silmek istediğinizden emin misiniz?')) return;

    try {
        await APIService.delete(`/api/admin/quizzes/${quizId}`);
        alert('Quiz başarıyla silindi!');
        await loadAdminQuizzes();
    } catch (error) {
        console.error('Quiz silinirken hata:', error);
        alert('Quiz silinemedi!');
    }
}

// Topic functions (basic implementation)
function openTopicModal() {
    const topicName = prompt('Konu adı:');
    if (!topicName) return;

    const topicDescription = prompt('Açıklama (opsiyonel):');

    createAdminTopic({ name: topicName, description: topicDescription });
}

async function createAdminTopic(topicData) {
    try {
        await APIService.post('/api/admin/quizzes/topics', topicData);
        alert('Konu başarıyla eklendi!');
        await loadAdminTopics();
    } catch (error) {
        console.error('Konu eklenirken hata:', error);
        alert('Konu eklenemedi!');
    }
}

async function editAdminTopic(topicId) {
    const topic = adminTopics.find(t => t.id === topicId);
    if (!topic) return;

    const newName = prompt('Konu adı:', topic.name);
    if (!newName) return;

    const newDescription = prompt('Açıklama:', topic.description || '');

    try {
        await APIService.put(`/api/admin/quizzes/topics/${topicId}`, {
            name: newName,
            description: newDescription
        });
        alert('Konu başarıyla güncellendi!');
        await loadAdminTopics();
    } catch (error) {
        console.error('Konu güncellenirken hata:', error);
        alert('Konu güncellenemedi!');
    }
}

async function deleteAdminTopic(topicId) {
    if (!confirm('Bu konuyu silmek istediğinizden emin misiniz?')) return;

    try {
        await APIService.delete(`/api/admin/quizzes/topics/${topicId}`);
        alert('Konu başarıyla silindi!');
        await loadAdminTopics();
    } catch (error) {
        console.error('Konu silinirken hata:', error);
        alert('Konu silinemedi!');
    }
}

// Form submission handler
document.addEventListener('DOMContentLoaded', () => {
    const quizForm = document.getElementById('admin-quiz-form');
    if (quizForm) {
        quizForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const quizData = {
                title: document.getElementById('admin-quiz-title').value,
                description: document.getElementById('admin-quiz-description').value || null,
                topicId: document.getElementById('admin-quiz-topic-id').value || null,
                difficulty: parseInt(document.getElementById('admin-quiz-difficulty').value),
                timeLimitMinutes: document.getElementById('admin-quiz-time-limit').value
                    ? parseInt(document.getElementById('admin-quiz-time-limit').value)
                    : null,
                passPercentage: parseInt(document.getElementById('admin-quiz-pass-percentage').value),
                isActive: document.getElementById('admin-quiz-is-active').checked
            };

            try {
                if (currentEditingQuizId) {
                    await APIService.put(`/api/admin/quizzes/${currentEditingQuizId}`, quizData);
                    alert('Quiz başarıyla güncellendi!');
                } else {
                    await APIService.post('/api/admin/quizzes', quizData);
                    alert('Quiz başarıyla eklendi!');
                }

                showSection('all-quizzes');
            } catch (error) {
                console.error('Quiz kaydedilirken hata:', error);
                alert('Quiz kaydedilemedi!');
            }
        });
    }
});

// ==================== Category Management Functions ====================

let adminCategories = [];

// Load all categories
async function loadCategories() {
    try {
        const response = await fetch('http://localhost:8080/api/categories', {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Kategoriler yüklenemedi');
        }

        adminCategories = await response.json();
        renderCategoriesGrid();
    } catch (error) {
        console.error('Kategori yükleme hatası:', error);
        showError('Kategoriler yüklenirken hata oluştu.');
    }
}

// Render categories grid
function renderCategoriesGrid() {
    const container = document.querySelector('#categories .grid');

    if (!container) {
        console.error('Categories grid container not found');
        return;
    }

    container.innerHTML = '';

    if (!adminCategories || adminCategories.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-8 text-slate-500">
                <i data-lucide="folder-open" class="w-12 h-12 mx-auto mb-3 text-slate-400"></i>
                <p>Henüz kategori eklenmemiş</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    adminCategories.forEach(category => {
        const categoryCard = `
            <div class="bg-slate-50 rounded-lg p-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="font-medium text-slate-900">${escapeHtml(category.name)}</h3>
                        <p class="text-sm text-slate-500">${category.problemCount || 0} problem</p>
                        ${category.description ? `<p class="text-xs text-slate-600 mt-1">${escapeHtml(category.description)}</p>` : ''}
                    </div>
                    <div class="flex gap-1">
                        <button onclick="editCategory(${category.id})" class="p-1 text-slate-400 hover:text-slate-600">
                            <i data-lucide="edit" class="w-4 h-4"></i>
                        </button>
                        <button onclick="deleteCategory(${category.id})" class="p-1 text-slate-400 hover:text-red-600">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += categoryCard;
    });

    lucide.createIcons();
}

// Create new category
async function createCategory() {
    const name = prompt('Kategori adı:');
    if (!name || !name.trim()) return;

    const description = prompt('Açıklama (opsiyonel):');
    const displayOrder = prompt('Sıra numarası (opsiyonel, 0-100):', '0');

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8080/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: name.trim(),
                description: description ? description.trim() : null,
                displayOrder: parseInt(displayOrder) || 0
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Kategori eklenemedi');
        }

        showSuccess('Kategori başarıyla eklendi.');
        loadCategories();
    } catch (error) {
        console.error('Kategori ekleme hatası:', error);
        showError(error.message || 'Kategori eklenirken hata oluştu.');
    }
}

// Edit category
async function editCategory(categoryId) {
    const category = adminCategories.find(c => c.id === categoryId);
    if (!category) return;

    const newName = prompt('Kategori adı:', category.name);
    if (!newName || !newName.trim()) return;

    const newDescription = prompt('Açıklama:', category.description || '');
    const newDisplayOrder = prompt('Sıra numarası:', category.displayOrder || '0');

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/categories/${categoryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: newName.trim(),
                description: newDescription ? newDescription.trim() : null,
                displayOrder: parseInt(newDisplayOrder) || 0
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Kategori güncellenemedi');
        }

        showSuccess('Kategori başarıyla güncellendi.');
        loadCategories();
    } catch (error) {
        console.error('Kategori güncelleme hatası:', error);
        showError(error.message || 'Kategori güncellenirken hata oluştu.');
    }
}

// Delete category
async function deleteCategory(categoryId) {
    const category = adminCategories.find(c => c.id === categoryId);
    if (!category) return;

    if (!confirm(`"${category.name}" kategorisini silmek istediğinizden emin misiniz?`)) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/categories/${categoryId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Kategori silinemedi');
        }

        showSuccess('Kategori başarıyla silindi.');
        loadCategories();
    } catch (error) {
        console.error('Kategori silme hatası:', error);
        showError(error.message || 'Kategori silinirken hata oluştu.');
    }
}

// Global exports
window.changePage = changePage;
window.editProblem = editProblem;
window.deleteProblem = deleteProblem;
window.toggleProfileDropdown = toggleProfileDropdown;
window.toggleSubmenu = toggleSubmenu;
window.showSection = showSection;
window.logout = logout;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.performProblemSearch = performProblemSearch;
window.clearProblemSearch = clearProblemSearch;
window.editAdminQuiz = editAdminQuiz;
window.deleteAdminQuiz = deleteAdminQuiz;
window.openTopicModal = openTopicModal;
window.editAdminTopic = editAdminTopic;
window.deleteAdminTopic = deleteAdminTopic;
window.loadCategories = loadCategories;
window.createCategory = createCategory;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;

// ==================== QUIZ YÖNETİMİ ====================

let editingTopicId = null;
let editingQuizId = null;
let editingQuestionId = null;
let selectedQuizId = null;
let optionCounter = 0;

// ==================== TOPICS ====================

async function loadTopics() {
    try {
        const response = await APIService.get('/api/admin/quizzes/topics');
        const topics = await response.json();

        const topicsList = document.getElementById('topicsList');
        if (topics.length === 0) {
            topicsList.innerHTML = '<p class="text-slate-500 text-sm text-center py-8">Henüz konu eklenmemiş</p>';
            return;
        }

        topicsList.innerHTML = topics.map(topic => `
            <div class="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                <div>
                    <h4 class="font-semibold text-slate-900">${topic.name}</h4>
                    <p class="text-sm text-slate-600 mt-1">${topic.description || 'Açıklama yok'}</p>
                    <p class="text-xs text-slate-500 mt-2">${topic.quizCount} quiz</p>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="editTopic(${topic.id})" class="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                        <i data-lucide="edit-2" class="w-4 h-4"></i>
                    </button>
                    <button onclick="deleteTopic(${topic.id})" class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `).join('');

        lucide.createIcons();
    } catch (error) {
        console.error('Konular yüklenirken hata:', error);
        alert('Konular yüklenemedi!');
    }
}

async function loadTopicsForSelect() {
    try {
        const response = await APIService.get('/api/admin/quizzes/topics');
        const topics = await response.json();

        const select = document.getElementById('quizTopicId');
        select.innerHTML = '<option value="">Konu seçin...</option>' +
            topics.map(topic => `<option value="${topic.id}">${topic.name}</option>`).join('');
    } catch (error) {
        console.error('Konular yüklenirken hata:', error);
    }
}

function showTopicModal(topicId = null) {
    editingTopicId = topicId;
    const modal = document.getElementById('topicModal');
    const title = document.getElementById('topicModalTitle');

    if (topicId) {
        title.textContent = 'Konu Düzenle';
    } else {
        title.textContent = 'Yeni Konu';
        document.getElementById('topicForm').reset();
    }

    modal.classList.remove('hidden');
    lucide.createIcons();
}

function closeTopicModal() {
    document.getElementById('topicModal').classList.add('hidden');
    editingTopicId = null;
    document.getElementById('topicForm').reset();
}

async function saveTopic(event) {
    event.preventDefault();

    const data = {
        name: document.getElementById('topicName').value,
        description: document.getElementById('topicDescription').value
    };

    try {
        let response;
        if (editingTopicId) {
            response = await APIService.put(`/api/admin/quizzes/topics/${editingTopicId}`, data);
        } else {
            response = await APIService.post('/api/admin/quizzes/topics', data);
        }

        if (response.ok) {
            alert(editingTopicId ? 'Konu güncellendi!' : 'Konu oluşturuldu!');
            closeTopicModal();
            loadTopics();
            loadTopicsForSelect();
        } else {
            const error = await response.json();
            alert('Hata: ' + (error.message || 'Konu kaydedilemedi!'));
        }
    } catch (error) {
        console.error('Konu kaydetme hatası:', error);
        alert('Bir hata oluştu!');
    }
}

async function editTopic(id) {
    try {
        const response = await APIService.get(`/api/admin/quizzes/topics/${id}`);
        const topic = await response.json();

        document.getElementById('topicId').value = topic.id;
        document.getElementById('topicName').value = topic.name;
        document.getElementById('topicDescription').value = topic.description || '';

        showTopicModal(id);
    } catch (error) {
        console.error('Konu yükleme hatası:', error);
        alert('Konu yüklenemedi!');
    }
}

async function deleteTopic(id) {
    if (!confirm('Bu konuyu silmek istediğinizden emin misiniz?')) return;

    try {
        const response = await APIService.delete(`/api/admin/quizzes/topics/${id}`);
        if (response.ok) {
            alert('Konu silindi!');
            loadTopics();
            loadTopicsForSelect();
        } else {
            alert('Konu silinemedi!');
        }
    } catch (error) {
        console.error('Konu silme hatası:', error);
        alert('Bir hata oluştu!');
    }
}

// ==================== QUIZZES ====================

async function loadQuizzes() {
    try {
        const response = await APIService.get('/api/admin/quizzes?page=0&size=50');
        const data = await response.json();
        const quizzes = data.content || [];

        const quizzesList = document.getElementById('quizzesList');
        if (quizzes.length === 0) {
            quizzesList.innerHTML = '<p class="text-slate-500 text-sm text-center py-8">Henüz quiz eklenmemiş</p>';
            return;
        }

        const difficultyLabels = { 1: 'Kolay', 2: 'Orta', 3: 'Zor' };
        const difficultyColors = { 1: 'bg-green-100 text-green-800', 2: 'bg-yellow-100 text-yellow-800', 3: 'bg-red-100 text-red-800' };

        quizzesList.innerHTML = quizzes.map(quiz => `
            <div class="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h4 class="font-semibold text-slate-900">${quiz.title}</h4>
                        <span class="px-2 py-1 text-xs font-medium rounded ${difficultyColors[quiz.difficulty]}">${difficultyLabels[quiz.difficulty]}</span>
                        ${quiz.isActive ? '<span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">Aktif</span>' : '<span class="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-800 rounded">Pasif</span>'}
                    </div>
                    <p class="text-sm text-slate-600">${quiz.description || 'Açıklama yok'}</p>
                    <div class="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        ${quiz.topicName ? `<span><i data-lucide="folder" class="w-3 h-3 inline"></i> ${quiz.topicName}</span>` : ''}
                        <span><i data-lucide="file-text" class="w-3 h-3 inline"></i> ${quiz.questionCount} soru</span>
                        <span><i data-lucide="star" class="w-3 h-3 inline"></i> ${quiz.totalPoints} puan</span>
                        ${quiz.timeLimitMinutes ? `<span><i data-lucide="clock" class="w-3 h-3 inline"></i> ${quiz.timeLimitMinutes} dk</span>` : ''}
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="editQuiz(${quiz.id})" class="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                        <i data-lucide="edit-2" class="w-4 h-4"></i>
                    </button>
                    <button onclick="deleteQuiz(${quiz.id})" class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `).join('');

        lucide.createIcons();
    } catch (error) {
        console.error('Quizler yüklenirken hata:', error);
        alert('Quizler yüklenemedi!');
    }
}

async function loadQuizzesForSelect() {
    try {
        const response = await APIService.get('/api/admin/quizzes/active');
        const quizzes = await response.json();

        const select = document.getElementById('quizSelect');
        select.innerHTML = '<option value="">Quiz seçin...</option>' +
            quizzes.map(quiz => `<option value="${quiz.id}">${quiz.title}</option>`).join('');
    } catch (error) {
        console.error('Quizler yüklenirken hata:', error);
    }
}

function showQuizModal(quizId = null) {
    editingQuizId = quizId;
    const modal = document.getElementById('quizModal');
    const title = document.getElementById('quizModalTitle');

    if (quizId) {
        title.textContent = 'Quiz Düzenle';
    } else {
        title.textContent = 'Yeni Quiz';
        document.getElementById('quizForm').reset();
        loadTopicsForSelect();
    }

    modal.classList.remove('hidden');
    lucide.createIcons();
}

function closeQuizModal() {
    document.getElementById('quizModal').classList.add('hidden');
    editingQuizId = null;
    document.getElementById('quizForm').reset();
}

async function saveQuiz(event) {
    event.preventDefault();

    const data = {
        title: document.getElementById('quizTitle').value,
        description: document.getElementById('quizDescription').value,
        topicId: document.getElementById('quizTopicId').value || null,
        difficulty: parseInt(document.getElementById('quizDifficulty').value),
        timeLimitMinutes: document.getElementById('quizTimeLimitMinutes').value || null,
        passPercentage: parseInt(document.getElementById('quizPassPercentage').value),
        isActive: document.getElementById('quizIsActive').checked
    };

    try {
        let response;
        if (editingQuizId) {
            response = await APIService.put(`/api/admin/quizzes/${editingQuizId}`, data);
        } else {
            response = await APIService.post('/api/admin/quizzes', data);
        }

        if (response.ok) {
            alert(editingQuizId ? 'Quiz güncellendi!' : 'Quiz oluşturuldu!');
            closeQuizModal();
            loadQuizzes();
            loadQuizzesForSelect();
        } else {
            const error = await response.json();
            alert('Hata: ' + (error.message || 'Quiz kaydedilemedi!'));
        }
    } catch (error) {
        console.error('Quiz kaydetme hatası:', error);
        alert('Bir hata oluştu!');
    }
}

async function editQuiz(id) {
    try {
        const response = await APIService.get(`/api/admin/quizzes/${id}`);
        const quiz = await response.json();

        await loadTopicsForSelect();

        document.getElementById('quizId').value = quiz.id;
        document.getElementById('quizTitle').value = quiz.title;
        document.getElementById('quizDescription').value = quiz.description || '';
        document.getElementById('quizTopicId').value = quiz.topicId || '';
        document.getElementById('quizDifficulty').value = quiz.difficulty;
        document.getElementById('quizTimeLimitMinutes').value = quiz.timeLimitMinutes || '';
        document.getElementById('quizPassPercentage').value = quiz.passPercentage;
        document.getElementById('quizIsActive').checked = quiz.isActive;

        showQuizModal(id);
    } catch (error) {
        console.error('Quiz yükleme hatası:', error);
        alert('Quiz yüklenemedi!');
    }
}

async function deleteQuiz(id) {
    if (!confirm('Bu quizi silmek istediğinizden emin misiniz?')) return;

    try {
        const response = await APIService.delete(`/api/admin/quizzes/${id}`);
        if (response.ok) {
            alert('Quiz silindi!');
            loadQuizzes();
            loadQuizzesForSelect();
        } else {
            alert('Quiz silinemedi!');
        }
    } catch (error) {
        console.error('Quiz silme hatası:', error);
        alert('Bir hata oluştu!');
    }
}

// ==================== QUESTIONS ====================

async function loadQuizQuestions() {
    const quizId = document.getElementById('quizSelect').value;
    selectedQuizId = quizId;

    if (!quizId) {
        document.getElementById('questionsContainer').classList.add('hidden');
        return;
    }

    document.getElementById('questionsContainer').classList.remove('hidden');

    try {
        const response = await APIService.get(`/api/admin/quizzes/${quizId}`);
        const quiz = await response.json();
        const questions = quiz.questions || [];

        const questionsList = document.getElementById('questionsList');
        if (questions.length === 0) {
            questionsList.innerHTML = '<p class="text-slate-500 text-sm text-center py-8">Bu quiz için henüz soru eklenmemiş</p>';
            return;
        }

        questionsList.innerHTML = questions.map(question => `
            <div class="p-4 border border-slate-200 rounded-lg">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-xs font-medium text-slate-500">Soru #${question.questionOrder || question.id}</span>
                            <span class="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">${question.points} puan</span>
                        </div>
                        <p class="text-sm font-medium text-slate-900">${question.questionText}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="editQuestion(${question.id})" class="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                            <i data-lucide="edit-2" class="w-4 h-4"></i>
                        </button>
                        <button onclick="deleteQuestion(${question.id})" class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
                <div class="space-y-2 mt-3">
                    ${question.options.map((option, idx) => `
                        <div class="flex items-center gap-2 text-sm ${option.isCorrect ? 'text-green-700 font-medium' : 'text-slate-600'}">
                            <span class="w-5 h-5 rounded-full border ${option.isCorrect ? 'bg-green-100 border-green-500' : 'border-slate-300'} flex items-center justify-center text-xs">
                                ${String.fromCharCode(65 + idx)}
                            </span>
                            ${option.optionText}
                            ${option.isCorrect ? '<i data-lucide="check" class="w-4 h-4 ml-2"></i>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        lucide.createIcons();
    } catch (error) {
        console.error('Sorular yüklenirken hata:', error);
        alert('Sorular yüklenemedi!');
    }
}

function showQuestionModal(questionId = null) {
    editingQuestionId = questionId;
    const modal = document.getElementById('questionModal');
    const title = document.getElementById('questionModalTitle');

    if (questionId) {
        title.textContent = 'Soru Düzenle';
    } else {
        title.textContent = 'Yeni Soru';
        document.getElementById('questionForm').reset();
        document.getElementById('questionQuizId').value = selectedQuizId;
        // Add 4 empty options
        document.getElementById('optionsContainer').innerHTML = '';
        optionCounter = 0;
        for (let i = 0; i < 4; i++) {
            addOption();
        }
    }

    modal.classList.remove('hidden');
    lucide.createIcons();
}

function closeQuestionModal() {
    document.getElementById('questionModal').classList.add('hidden');
    editingQuestionId = null;
    document.getElementById('questionForm').reset();
}

function addOption() {
    const container = document.getElementById('optionsContainer');
    const optionId = optionCounter++;
    const optionLetter = String.fromCharCode(65 + container.children.length);

    const optionDiv = document.createElement('div');
    optionDiv.className = 'flex items-center gap-3 p-3 border border-slate-200 rounded-lg';
    optionDiv.id = `option-${optionId}`;
    optionDiv.innerHTML = `
        <span class="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-xs font-medium">${optionLetter}</span>
        <input type="text"
               class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent text-sm"
               placeholder="Şık metni"
               data-option-text
               required>
        <label class="flex items-center gap-2 text-sm text-slate-700 whitespace-nowrap">
            <input type="radio" name="correctOption" value="${optionId}" class="w-4 h-4 text-slate-800" data-option-correct>
            Doğru
        </label>
        ${container.children.length > 1 ? `
        <button type="button" onclick="removeOption(${optionId})" class="p-2 text-slate-400 hover:text-red-600">
            <i data-lucide="x" class="w-4 h-4"></i>
        </button>
        ` : ''}
    `;

    container.appendChild(optionDiv);
    lucide.createIcons();
}

function removeOption(optionId) {
    const optionDiv = document.getElementById(`option-${optionId}`);
    if (optionDiv) optionDiv.remove();

    // Update option letters
    const container = document.getElementById('optionsContainer');
    Array.from(container.children).forEach((child, idx) => {
        const letter = child.querySelector('span');
        if (letter) letter.textContent = String.fromCharCode(65 + idx);
    });
}

async function saveQuestion(event) {
    event.preventDefault();

    // Collect options
    const optionElements = document.querySelectorAll('[data-option-text]');
    const options = Array.from(optionElements).map((elem, idx) => {
        const container = elem.closest('[id^="option-"]');
        const isCorrect = container.querySelector('[data-option-correct]').checked;
        return {
            optionText: elem.value,
            isCorrect: isCorrect,
            optionOrder: idx + 1
        };
    });

    // Check if at least one option is correct
    if (!options.some(opt => opt.isCorrect)) {
        alert('En az bir doğru şık seçmelisiniz!');
        return;
    }

    const data = {
        quizId: document.getElementById('questionQuizId').value,
        questionText: document.getElementById('questionText').value,
        points: parseInt(document.getElementById('questionPoints').value),
        questionOrder: document.getElementById('questionOrder').value || null,
        options: options
    };

    try {
        let response;
        if (editingQuestionId) {
            response = await APIService.put(`/api/admin/quizzes/questions/${editingQuestionId}`, data);
        } else {
            response = await APIService.post('/api/admin/quizzes/questions', data);
        }

        if (response.ok) {
            alert(editingQuestionId ? 'Soru güncellendi!' : 'Soru oluşturuldu!');
            closeQuestionModal();
            loadQuizQuestions();
        } else {
            const error = await response.json();
            alert('Hata: ' + (error.message || 'Soru kaydedilemedi!'));
        }
    } catch (error) {
        console.error('Soru kaydetme hatası:', error);
        alert('Bir hata oluştu!');
    }
}

async function editQuestion(id) {
    try {
        const response = await APIService.get(`/api/admin/quizzes/${selectedQuizId}`);
        const quiz = await response.json();
        const question = quiz.questions.find(q => q.id === id);

        if (!question) {
            alert('Soru bulunamadı!');
            return;
        }

        document.getElementById('questionId').value = question.id;
        document.getElementById('questionQuizId').value = question.quizId;
        document.getElementById('questionText').value = question.questionText;
        document.getElementById('questionPoints').value = question.points;
        document.getElementById('questionOrder').value = question.questionOrder || '';

        // Load options
        const container = document.getElementById('optionsContainer');
        container.innerHTML = '';
        optionCounter = 0;

        question.options.forEach((option, idx) => {
            addOption();
            const optionDiv = container.children[idx];
            optionDiv.querySelector('[data-option-text]').value = option.optionText;
            if (option.isCorrect) {
                optionDiv.querySelector('[data-option-correct]').checked = true;
            }
        });

        showQuestionModal(id);
    } catch (error) {
        console.error('Soru yükleme hatası:', error);
        alert('Soru yüklenemedi!');
    }
}

async function deleteQuestion(id) {
    if (!confirm('Bu soruyu silmek istediğinizden emin misiniz?')) return;

    try {
        const response = await APIService.delete(`/api/admin/quizzes/questions/${id}`);
        if (response.ok) {
            alert('Soru silindi!');
            loadQuizQuestions();
        } else {
            alert('Soru silinemedi!');
        }
    } catch (error) {
        console.error('Soru silme hatası:', error);
        alert('Bir hata oluştu!');
    }
}

// Window exports for quiz management
window.showTopicModal = showTopicModal;
window.closeTopicModal = closeTopicModal;
window.saveTopic = saveTopic;
window.editTopic = editTopic;
window.deleteTopic = deleteTopic;
window.showQuizModal = showQuizModal;
window.closeQuizModal = closeQuizModal;
window.saveQuiz = saveQuiz;
window.editQuiz = editQuiz;
window.deleteQuiz = deleteQuiz;
window.loadQuizQuestions = loadQuizQuestions;
window.showQuestionModal = showQuestionModal;
window.closeQuestionModal = closeQuestionModal;
window.addOption = addOption;
window.removeOption = removeOption;
window.saveQuestion = saveQuestion;
window.editQuestion = editQuestion;
window.deleteQuestion = deleteQuestion;

// ==================== STUDY CARDS YÖNETİMİ ====================

let studyCards = [];
let editingStudyCardId = null;
let editingCardSectionId = null;
let selectedCardForSections = null;

// Load all study cards
async function loadStudyCards() {
    try {
        const response = await APIService.get('/api/admin/study-cards');
        studyCards = await response.json();
        renderStudyCardsGrid();
    } catch (error) {
        console.error('Kartlar yüklenirken hata:', error);
        alert('Kartlar yüklenemedi!');
    }
}

// Render study cards grid
function renderStudyCardsGrid() {
    const container = document.getElementById('studyCardsList');
    container.innerHTML = '';

    if (!studyCards || studyCards.length === 0) {
        container.innerHTML = '<div class="col-span-3 text-center py-8 text-slate-500">Henüz kart eklenmemiş</div>';
        return;
    }

    studyCards.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'bg-white border border-slate-200 rounded-lg p-4';

        const colorClasses = {
            'blue': 'bg-blue-100 text-blue-600',
            'green': 'bg-green-100 text-green-600',
            'purple': 'bg-purple-100 text-purple-600',
            'orange': 'bg-orange-100 text-orange-600',
            'red': 'bg-red-100 text-red-600',
            'yellow': 'bg-yellow-100 text-yellow-600',
            'pink': 'bg-pink-100 text-pink-600',
            'indigo': 'bg-indigo-100 text-indigo-600'
        };

        const colorClass = colorClasses[card.color] || colorClasses['blue'];

        cardDiv.innerHTML = `
            <div class="flex items-start gap-3 mb-3">
                <div class="w-10 h-10 ${colorClass} rounded-lg flex items-center justify-center flex-shrink-0">
                    <i data-lucide="${card.icon || 'book-open'}" class="w-5 h-5"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-slate-900 mb-1">${escapeHtml(card.title)}</h3>
                    <p class="text-sm text-slate-600 line-clamp-2">${escapeHtml(card.description || '')}</p>
                </div>
            </div>
            <div class="flex items-center justify-between text-xs text-slate-500 mb-3">
                <span>Sıra: ${card.displayOrder}</span>
                <span class="px-2 py-0.5 rounded ${card.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}">
                    ${card.active ? 'Aktif' : 'Pasif'}
                </span>
            </div>
            <div class="flex gap-2">
                <button onclick="editStudyCard(${card.id})"
                        class="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors">
                    <i data-lucide="edit-2" class="w-3.5 h-3.5 inline mr-1"></i>
                    Düzenle
                </button>
                <button onclick="deleteStudyCard(${card.id})"
                        class="px-3 py-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5 inline"></i>
                </button>
            </div>
        `;

        container.appendChild(cardDiv);
    });

    lucide.createIcons();
}

// Show study card modal
function showStudyCardModal(cardId = null) {
    editingStudyCardId = cardId;
    const modal = document.getElementById('studyCardModal');
    const title = document.getElementById('studyCardModalTitle');

    if (cardId) {
        title.textContent = 'Öğrenme Kartını Düzenle';
        // Form will be populated by editStudyCard function
    } else {
        title.textContent = 'Yeni Öğrenme Kartı';
        document.getElementById('studyCardForm').reset();
        document.getElementById('studyCardId').value = '';
        document.getElementById('studyCardActive').checked = true;
        document.getElementById('studyCardOrder').value = '0';
    }

    modal.classList.remove('hidden');
    lucide.createIcons();
}

// Close study card modal
function closeStudyCardModal() {
    document.getElementById('studyCardModal').classList.add('hidden');
    editingStudyCardId = null;
    document.getElementById('studyCardForm').reset();
}

// Save study card
async function saveStudyCard(event) {
    event.preventDefault();

    const data = {
        title: document.getElementById('studyCardTitle').value,
        description: document.getElementById('studyCardDescription').value,
        displayOrder: parseInt(document.getElementById('studyCardOrder').value),
        active: document.getElementById('studyCardActive').checked
    };

    try {
        let response;
        if (editingStudyCardId) {
            data.id = editingStudyCardId;
            response = await APIService.put(`/api/admin/study-cards/${editingStudyCardId}`, data);
        } else {
            response = await APIService.post('/api/admin/study-cards', data);
        }

        if (response.ok) {
            alert(editingStudyCardId ? 'Kart güncellendi!' : 'Kart oluşturuldu!');
            closeStudyCardModal();
            await loadStudyCards();
        } else {
            alert('Bir hata oluştu!');
        }
    } catch (error) {
        console.error('Kart kaydetme hatası:', error);
        alert('Bir hata oluştu!');
    }
}

// Edit study card
async function editStudyCard(id) {
    try {
        const response = await APIService.get(`/api/admin/study-cards/${id}`);
        const card = await response.json();

        document.getElementById('studyCardId').value = card.id;
        document.getElementById('studyCardTitle').value = card.title;
        document.getElementById('studyCardDescription').value = card.description || '';
        document.getElementById('studyCardOrder').value = card.displayOrder;
        document.getElementById('studyCardActive').checked = card.active;

        showStudyCardModal(id);
    } catch (error) {
        console.error('Kart yükleme hatası:', error);
        alert('Kart yüklenemedi!');
    }
}

// Delete study card
async function deleteStudyCard(id) {
    if (!confirm('Bu kartı silmek istediğinizden emin misiniz? İlişkili tüm bölümler de silinecektir!')) return;

    try {
        const response = await APIService.delete(`/api/admin/study-cards/${id}`);
        if (response.ok) {
            alert('Kart silindi!');
            await loadStudyCards();
        } else {
            alert('Bir hata oluştu!');
        }
    } catch (error) {
        console.error('Kart silme hatası:', error);
        alert('Bir hata oluştu!');
    }
}

// Load cards for select dropdown
async function loadCardsForSelect() {
    try {
        const response = await APIService.get('/api/admin/study-cards');
        const cards = await response.json();

        const cardSelect = document.getElementById('cardSelectForSections');
        cardSelect.innerHTML = '<option value="">Kart seçin...</option>';

        cards.forEach(card => {
            const option = document.createElement('option');
            option.value = card.id;
            option.textContent = card.title;
            cardSelect.appendChild(option);
        });

        // Also populate the section modal dropdown
        const sectionCardSelect = document.getElementById('cardSectionCardId');
        if (sectionCardSelect) {
            sectionCardSelect.innerHTML = '<option value="">Kart seçin...</option>';
            cards.forEach(card => {
                const option = document.createElement('option');
                option.value = card.id;
                option.textContent = card.title;
                sectionCardSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Kartlar yüklenirken hata:', error);
    }
}

// Load card sections for management
async function loadCardSectionsForManagement() {
    const cardId = document.getElementById('cardSelectForSections').value;
    selectedCardForSections = cardId;

    if (!cardId) {
        document.getElementById('sectionsContainer').classList.add('hidden');
        return;
    }

    try {
        const response = await APIService.get(`/api/admin/study-cards/${cardId}/sections`);
        const sections = await response.json();

        document.getElementById('sectionsContainer').classList.remove('hidden');
        renderCardSectionsList(sections);
    } catch (error) {
        console.error('Bölümler yüklenirken hata:', error);
        alert('Bölümler yüklenemedi!');
    }
}

// Render card sections list
function renderCardSectionsList(sections) {
    const container = document.getElementById('cardSectionsList');
    container.innerHTML = '';

    if (!sections || sections.length === 0) {
        container.innerHTML = '<div class="text-center py-8 text-slate-500">Henüz bölüm eklenmemiş</div>';
        return;
    }

    sections.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'bg-white border border-slate-200 rounded-lg p-4';

        const contentTypeLabels = {
            'TEXT': 'Metin',
            'PROBLEM': 'Problem Linki',
            'QUIZ': 'Quiz Linki'
        };

        sectionDiv.innerHTML = `
            <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                    <h4 class="font-semibold text-slate-900 mb-1">${escapeHtml(section.title)}</h4>
                    <div class="flex items-center gap-2 text-xs text-slate-500">
                        <span class="px-2 py-0.5 bg-slate-100 rounded">${contentTypeLabels[section.contentType]}</span>
                        <span>Sıra: ${section.displayOrder}</span>
                        <span class="px-2 py-0.5 rounded ${section.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}">
                            ${section.active ? 'Aktif' : 'Pasif'}
                        </span>
                    </div>
                </div>
            </div>
            <div class="flex gap-2 mt-3">
                <button onclick="editCardSection(${section.id})"
                        class="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors">
                    <i data-lucide="edit-2" class="w-3.5 h-3.5 inline mr-1"></i>
                    Düzenle
                </button>
                <button onclick="deleteCardSection(${section.id})"
                        class="px-3 py-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5 inline"></i>
                </button>
            </div>
        `;

        container.appendChild(sectionDiv);
    });

    lucide.createIcons();
}

// Show card section modal
async function showCardSectionModal(sectionId = null) {
    editingCardSectionId = sectionId;
    const modal = document.getElementById('cardSectionModal');
    const title = document.getElementById('cardSectionModalTitle');

    // Load dropdowns
    await loadCardsForSelect();
    await loadProblemsForSelect();
    await loadQuizzesForSelectInSections();

    if (sectionId) {
        title.textContent = 'Bölümü Düzenle';
        // Form will be populated by editCardSection function
    } else {
        title.textContent = 'Yeni Bölüm';
        document.getElementById('cardSectionForm').reset();
        document.getElementById('cardSectionId').value = '';
        document.getElementById('cardSectionActive').checked = true;
        document.getElementById('cardSectionOrder').value = '0';
        document.getElementById('cardSectionContentType').value = 'TEXT';

        // Set the selected card if coming from sections management
        if (selectedCardForSections) {
            document.getElementById('cardSectionCardId').value = selectedCardForSections;
        }

        handleContentTypeChange();
    }

    modal.classList.remove('hidden');
    lucide.createIcons();
}

// Close card section modal
function closeCardSectionModal() {
    document.getElementById('cardSectionModal').classList.add('hidden');
    editingCardSectionId = null;
    document.getElementById('cardSectionForm').reset();
}

// Handle content type change
function handleContentTypeChange() {
    const contentType = document.getElementById('cardSectionContentType').value;
    const textDiv = document.getElementById('textContentDiv');
    const problemDiv = document.getElementById('problemLinkDiv');
    const quizDiv = document.getElementById('quizLinkDiv');

    // Hide all content divs
    textDiv.classList.add('hidden');
    problemDiv.classList.add('hidden');
    quizDiv.classList.add('hidden');

    // Show the appropriate div
    switch (contentType) {
        case 'TEXT':
            textDiv.classList.remove('hidden');
            break;
        case 'PROBLEM':
            problemDiv.classList.remove('hidden');
            break;
        case 'QUIZ':
            quizDiv.classList.remove('hidden');
            break;
    }
}

// Save card section
async function saveCardSection(event) {
    event.preventDefault();

    const contentType = document.getElementById('cardSectionContentType').value;
    const data = {
        studyCardId: parseInt(document.getElementById('cardSectionCardId').value),
        title: document.getElementById('cardSectionTitle').value,
        contentType: contentType,
        displayOrder: parseInt(document.getElementById('cardSectionOrder').value),
        active: document.getElementById('cardSectionActive').checked
    };

    // Add content based on type
    switch (contentType) {
        case 'TEXT':
            data.content = document.getElementById('cardSectionContent').value;
            data.relatedProblemId = null;
            data.relatedQuizId = null;
            break;
        case 'PROBLEM':
            data.content = null;
            const problemId = document.getElementById('cardSectionProblemId').value;
            data.relatedProblemId = problemId ? parseInt(problemId) : null;
            data.relatedQuizId = null;
            break;
        case 'QUIZ':
            data.content = null;
            data.relatedProblemId = null;
            const quizId = document.getElementById('cardSectionQuizId').value;
            data.relatedQuizId = quizId ? parseInt(quizId) : null;
            break;
    }

    try {
        let response;
        if (editingCardSectionId) {
            data.id = editingCardSectionId;
            response = await APIService.put(`/api/admin/study-cards/sections/${editingCardSectionId}`, data);
        } else {
            response = await APIService.post('/api/admin/study-cards/sections', data);
        }

        if (response.ok) {
            alert(editingCardSectionId ? 'Bölüm güncellendi!' : 'Bölüm oluşturuldu!');
            closeCardSectionModal();
            await loadCardSectionsForManagement();
        } else {
            alert('Bir hata oluştu!');
        }
    } catch (error) {
        console.error('Bölüm kaydetme hatası:', error);
        alert('Bir hata oluştu!');
    }
}

// Edit card section
async function editCardSection(id) {
    try {
        const response = await APIService.get(`/api/admin/study-cards/sections/${id}`);
        const section = await response.json();

        document.getElementById('cardSectionId').value = section.id;
        document.getElementById('cardSectionCardId').value = section.studyCardId;
        document.getElementById('cardSectionTitle').value = section.title;
        document.getElementById('cardSectionContentType').value = section.contentType;
        document.getElementById('cardSectionOrder').value = section.displayOrder;
        document.getElementById('cardSectionActive').checked = section.active;

        // Set content based on type
        switch (section.contentType) {
            case 'TEXT':
                document.getElementById('cardSectionContent').value = section.content || '';
                break;
            case 'PROBLEM':
                document.getElementById('cardSectionProblemId').value = section.relatedProblemId || '';
                break;
            case 'QUIZ':
                document.getElementById('cardSectionQuizId').value = section.relatedQuizId || '';
                break;
        }

        handleContentTypeChange();
        showCardSectionModal(id);
    } catch (error) {
        console.error('Bölüm yükleme hatası:', error);
        alert('Bölüm yüklenemedi!');
    }
}

// Delete card section
async function deleteCardSection(id) {
    if (!confirm('Bu bölümü silmek istediğinizden emin misiniz?')) return;

    try {
        const response = await APIService.delete(`/api/admin/study-cards/sections/${id}`);
        if (response.ok) {
            alert('Bölüm silindi!');
            await loadCardSectionsForManagement();
        } else {
            alert('Bir hata oluştu!');
        }
    } catch (error) {
        console.error('Bölüm silme hatası:', error);
        alert('Bir hata oluştu!');
    }
}

// Load problems for select dropdown
async function loadProblemsForSelect() {
    try {
        const response = await APIService.get('/api/problems');
        const data = await response.json();

        const select = document.getElementById('cardSectionProblemId');
        select.innerHTML = '<option value="">Problem seçin...</option>';

        // API returns a Page object with content array
        const problems = data.content || data;
        problems.forEach(problem => {
            const option = document.createElement('option');
            option.value = problem.id;
            option.textContent = problem.title;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Problemler yüklenirken hata:', error);
    }
}

// Load quizzes for select dropdown (reuse existing function or create new one)
async function loadQuizzesForSelectInSections() {
    try {
        const response = await APIService.get('/api/admin/quizzes/active');
        const quizzes = await response.json();

        const select = document.getElementById('cardSectionQuizId');
        select.innerHTML = '<option value="">Quiz seçin...</option>';

        quizzes.forEach(quiz => {
            const option = document.createElement('option');
            option.value = quiz.id;
            option.textContent = quiz.title;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Quizler yüklenirken hata:', error);
    }
}

// Window exports for study cards management
window.showStudyCardModal = showStudyCardModal;
window.closeStudyCardModal = closeStudyCardModal;
window.saveStudyCard = saveStudyCard;
window.editStudyCard = editStudyCard;
window.deleteStudyCard = deleteStudyCard;
window.loadStudyCards = loadStudyCards;
window.loadCardsForSelect = loadCardsForSelect;
window.loadCardSectionsForManagement = loadCardSectionsForManagement;
window.showCardSectionModal = showCardSectionModal;
window.closeCardSectionModal = closeCardSectionModal;
window.handleContentTypeChange = handleContentTypeChange;
window.saveCardSection = saveCardSection;
window.editCardSection = editCardSection;
window.deleteCardSection = deleteCardSection;