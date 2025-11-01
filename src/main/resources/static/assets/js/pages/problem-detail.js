/**
 * Problem Detail Page - Problem çözme sayfası
 * Muhasebe kayıt girişi, yevmiye tablosu, doğrulama
 */

// ===========================
// CONSTANTS
// ===========================
const API_URL = 'http://localhost:8080/api';

// URL parametreleri
const params = new URLSearchParams(window.location.search);
const problemId = params.get("id");
const roomId = params.get("roomId"); // Oda içinden çözülüyorsa
const reviewMode = params.get("reviewMode") === "true"; // İnceleme modu

// Difficulty mappings
const difficultyColors = {
    EASY: "bg-emerald-100 text-emerald-800",
    MEDIUM: "bg-amber-100 text-amber-800",
    HARD: "bg-rose-100 text-rose-800"
};

const difficultyLabels = {
    EASY: "Kolay",
    MEDIUM: "Orta",
    HARD: "Zor"
};

// ===========================
// STATE VARIABLES
// ===========================
let accountSearchTimeout;

// ===========================
// INITIALIZATION
// ===========================

/**
 * Initialize problem detail page
 * Sets up authentication UI and loads problem data
 */
async function initProblemDetailPage() {
    lucide.createIcons();

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        showUserInterface(JSON.parse(storedUser));
    } else {
        showGuestInterface();
    }

    await loadProblem();

    // İnceleme modundaysa, geçmiş cevapları yükle ve formu kilitle
    if (reviewMode) {
        await loadPastAnswers();
        enableReviewMode();
    } else {
        document.getElementById('addRowBtn').addEventListener('click', addJournalRow);
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', submitEntry);
        }
    }

    lucide.createIcons();
}

// ===========================
// CORE FUNCTIONS
// ===========================

/**
 * Load problem from API
 * Fetches problem details and checks if already submitted
 */
async function loadProblem() {
    if (!problemId) {
        showError("Problem ID bulunamadı.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/problems/${problemId}`);
        if (!response.ok) throw new Error(`Problem yüklenemedi (${response.status})`);

        const problem = await response.json();
        document.getElementById("problemTitle").textContent = problem.title || "Problem";
        document.getElementById("breadcrumbTitle").textContent = problem.title || "Problem";
        document.getElementById("problemContent").textContent = problem.content || "";

        if (problem.hint) {
            document.getElementById("problemHint").textContent = problem.hint;
            document.getElementById("hintSection").classList.remove("hidden");
        }

        if (problem.tags) {
            document.getElementById("problemTags").textContent = `#${problem.tags}`;
        }

        const diffCls = difficultyColors[problem.difficulty] || difficultyColors.EASY;
        const diffLabel = difficultyLabels[problem.difficulty] || "Kolay";

        document.getElementById("problemDifficulty").className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${diffCls}`;
        document.getElementById("problemDifficulty").textContent = diffLabel;

        addJournalRow();

        // Öğrenci daha önce bu problemi göndermiş mi kontrol et
        // REMOVED: Users can now submit multiple times, backend handles point awarding
        // await checkIfAlreadySubmitted();

    } catch (error) {
        console.error("Problem yükleme hatası:", error);
        showError(error.message);
    }
}

/**
 * Check if student already submitted this problem
 * Disables form if already submitted
 */
async function checkIfAlreadySubmitted() {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) return; // Giriş yapmamış

    try {
        const user = JSON.parse(storedUser);
        let checkUrl = `${API_URL}/solved-problems/check-submission?problemId=${problemId}&userId=${user.id}`;

        if (roomId) {
            checkUrl += `&roomId=${roomId}`;
        }

        const response = await fetch(checkUrl, {
            headers: {'Authorization': `Bearer ${token}`}
        });

        if (response.ok) {
            const data = await response.json();
            if (data.alreadySubmitted) {
                disableProblemForm();
            }
        }
    } catch (error) {
        console.error("Gönderim kontrolü hatası:", error);
    }
}

/**
 * Disable problem form - already submitted once
 * Locks all inputs and buttons, shows info message
 */
function disableProblemForm() {
    // Tüm input'ları disable et
    document.querySelectorAll('#journalEntries input').forEach(input => {
        input.disabled = true;
        input.classList.add('bg-slate-100', 'cursor-not-allowed');
    });

    // Tüm butonları disable et
    document.querySelectorAll('#journalEntries button').forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
    });

    document.getElementById('addRowBtn').disabled = true;
    document.getElementById('addRowBtn').classList.add('opacity-50', 'cursor-not-allowed');

    // Gönder butonunu disable et ve mesaj değiştir
    const submitBtn = document.querySelector('button[onclick="submitEntry()"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.className = 'px-4 py-2 text-sm font-medium text-white bg-slate-400 rounded-md cursor-not-allowed flex items-center gap-2';
        submitBtn.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4" style="stroke-width: 1.5;"></i>Gönderildi';
        lucide.createIcons();
    }

    // Uyarı mesajı göster
    const tableContainer = document.getElementById('journalEntries').parentElement;
    const warningDiv = document.createElement('div');
    warningDiv.className = 'bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4';
    warningDiv.innerHTML = `
        <div class="flex items-start gap-3">
            <i data-lucide="info" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"></i>
            <div class="text-sm text-blue-800">
                <span class="font-medium">Bu problemi zaten çözdünüz!</span>
                <p class="mt-1">Aynı problemi birden fazla kez gönderemezsiniz.</p>
            </div>
        </div>
    `;
    tableContainer.parentElement.insertBefore(warningDiv, tableContainer);
    lucide.createIcons();
}

/**
 * Submit journal entry for validation
 * Sends user's accounting entries to backend for checking
 */
async function submitEntry() {
    // Onay dialog'u göster
    const confirmed = confirm(
        "Çözümünüzü göndermek istediğinize emin misiniz?"
    );

    if (!confirmed) {
        return; // Kullanıcı iptal etti
    }

    try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        if (!storedUser || !token) {
            showError("Lütfen önce giriş yapın.");
            setTimeout(() => window.location.href = "login.html", 2000);
            return;
        }

        const entries = [];
        document.querySelectorAll("#journalEntries .grid").forEach(row => {
            const accountCode = row.querySelector("input[type='text']").value.trim();
            const inputs = row.querySelectorAll("input[type='number']");
            const debit = parseFloat(inputs[0].value) || 0;
            const credit = parseFloat(inputs[1].value) || 0;

            if (accountCode) {
                entries.push({ accountCode, debit, credit });
            }
        });

        if (entries.length === 0) {
            showError("En az bir yevmiye kaydı girmelisiniz.");
            return;
        }

        const requestBody = {
            problemId: Number(problemId),
            userId: storedUser.id,
            entries: entries
        };

        // Eğer oda içinden çözülüyorsa roomId ekle
        if (roomId) {
            requestBody.roomId = Number(roomId);
        }

        const response = await fetch(`${API_URL}/solved-problems/check`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.clear();
                showError("Oturumunuz sonlanmış. Lütfen tekrar giriş yapın.");
                setTimeout(() => window.location.href = "login.html", 2000);
                return;
            }
            if (response.status === 400) {
                // Backend'den BadRequestException geldi
                const errorData = await response.json();
                showErrorModal(errorData.error || "Çözüm gönderilemedi!");
                return;
            }
            throw new Error(`Cevap kontrol edilemedi (${response.status})`);
        }

        const data = await response.json();

        if (data.correct) {
            showSuccess(data.message || "✅ Tebrikler! Problem doğru çözüldü.");
            // No automatic redirect - user can close modal and resubmit or use "Problemlere Dön" button
        } else {
            showError(data.message || "⚠️ Cevabınız yanlış, tekrar deneyin.");
        }

    } catch (error) {
        console.error("Submit hatası:", error);
        showError(error.message || "Bir hata oluştu.");
    }
}

// ===========================
// JOURNAL ENTRY MANAGEMENT
// ===========================

/**
 * Add a new journal row to the table
 * Creates a new row with account code, name, debit, credit inputs
 */
function addJournalRow() {
    const tableBody = document.getElementById('journalEntries');
    const newRow = document.createElement('div');
    newRow.className = 'grid grid-cols-12 gap-x-3 p-2 items-center text-sm';
    newRow.innerHTML = `
        <div class="col-span-2">
            <input type="text" placeholder="100" class="w-full border rounded p-1 text-sm focus:ring-1 focus:ring-blue-300" oninput="updateAccountName(this)">
        </div>
        <div class="col-span-4">
            <input type="text" placeholder="Hesap adı otomatik gelecek..." class="w-full border-0 focus:ring-0 p-1 text-sm bg-slate-50 text-slate-600" readonly>
        </div>
        <div class="col-span-2">
            <input type="number" step="0.01" min="0" placeholder="0.00" class="debit-input w-full border-0 focus:ring-0 p-1 text-sm text-right" oninput="updateTotals()">
        </div>
        <div class="col-span-2">
            <input type="number" step="0.01" min="0" placeholder="0.00" class="credit-input w-full border-0 focus:ring-0 p-1 text-sm text-right" oninput="updateTotals()">
        </div>
        <div class="col-span-2 flex justify-end gap-2">
            <button onclick="addJournalRow()" class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 border border-green-200 rounded-md">
                <i data-lucide="plus" class="w-3.5 h-3.5" style="stroke-width: 1.5;"></i>
                Ekle
            </button>
            <button onclick="removeJournalRow(this)" class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-md">
                <i data-lucide="trash-2" class="w-3.5 h-3.5" style="stroke-width: 1.5;"></i>
                Sil
            </button>
        </div>
    `;

    tableBody.appendChild(newRow);

    // Event listener'ları ekle - Borç/Alacak mutual exclusion
    const debitInput = newRow.querySelector('.debit-input');
    const creditInput = newRow.querySelector('.credit-input');

    debitInput.addEventListener('input', function() {
        if (this.value && parseFloat(this.value) > 0) {
            creditInput.value = '';
            updateTotals();
        }
    });

    creditInput.addEventListener('input', function() {
        if (this.value && parseFloat(this.value) > 0) {
            debitInput.value = '';
            updateTotals();
        }
    });

    lucide.createIcons();
    updateTotals();
}

/**
 * Remove a journal row from the table
 * @param {HTMLElement} button - The remove button that was clicked
 */
function removeJournalRow(button) {
    const tableBody = document.getElementById('journalEntries');
    const row = button.closest('.grid');

    if (row) {
        row.remove();

        // Eğer hiç satır kalmadıysa, en az bir boş satır ekle
        const remainingRows = tableBody.querySelectorAll('.grid');
        if (remainingRows.length === 0) {
            addJournalRow();
        } else {
            updateTotals();
        }
    }
}

/**
 * Update account name from database based on account code
 * @param {HTMLInputElement} input - The account code input element
 */
async function updateAccountName(input) {
    const accountCode = input.value.trim();
    const accountNameInput = input.closest('.grid').querySelector('input[readonly]');

    // Boş ise temizle
    if (!accountCode) {
        accountNameInput.value = '';
        input.classList.remove('border-green-500', 'border-red-500', 'border-slate-300');
        input.classList.add('border-slate-300');
        return;
    }

    // Hesap kodları her zaman 3 hanelidir - 3 haneden az ise sorgu yapma
    if (accountCode.length < 3) {
        accountNameInput.value = '';
        input.classList.remove('border-green-500', 'border-red-500');
        input.classList.add('border-slate-300');
        return;
    }

    // 3 haneli değilse sorgu yapma
    if (accountCode.length !== 3) {
        accountNameInput.value = '';
        input.classList.remove('border-green-500', 'border-red-500');
        input.classList.add('border-slate-300');
        return;
    }

    // Sadece 3 haneli kodlar için sorgu yap
    try {
        // API'den hesap planını ara
        const response = await fetch(`${API_URL}/account-plans/search?code=${accountCode}`);

        if (response.ok) {
            const account = await response.json();
            accountNameInput.value = account.name;
            input.classList.remove('border-red-500', 'border-slate-300');
            input.classList.add('border-green-500');
            console.log('✅ Hesap bulundu:', account.name);
        } else {
            // Bulunamadı
            accountNameInput.value = 'Hesap bulunamadı';
            input.classList.remove('border-green-500', 'border-slate-300');
            input.classList.add('border-red-500');
            console.log('❌ Hesap bulunamadı:', accountCode);
        }
    } catch (error) {
        console.error('Hesap planı arama hatası:', error);
        accountNameInput.value = 'Hata';
        input.classList.remove('border-green-500', 'border-slate-300');
        input.classList.add('border-red-500');
    }

    updateTotals();
}

/**
 * Update debit and credit totals and balance status
 * Calculates totals and shows balance indicator
 */
function updateTotals() {
    const rows = document.querySelectorAll('#journalEntries .grid');
    let totalDebit = 0;
    let totalCredit = 0;

    rows.forEach(row => {
        const inputs = row.querySelectorAll('input[type="number"]');
        if (inputs.length >= 2) {
            const debitValue = parseFloat(inputs[0].value) || 0;
            const creditValue = parseFloat(inputs[1].value) || 0;

            totalDebit += debitValue;
            totalCredit += creditValue;
        }
    });

    // Toplamları Türkçe formatla göster
    document.getElementById('debit-total').textContent = totalDebit.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    document.getElementById('credit-total').textContent = totalCredit.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const balance = document.getElementById('balance');
    const difference = Math.abs(totalDebit - totalCredit);

    if (difference < 0.01 && totalDebit > 0) {
        balance.innerHTML = '<i data-lucide="check-circle-2" class="w-4 h-4" style="stroke-width: 1.5;"></i><span>Kayıt Dengede</span>';
        balance.className = 'flex items-center gap-2 text-green-600';
    } else if (totalDebit === 0 && totalCredit === 0) {
        balance.innerHTML = '<i data-lucide="minus-circle" class="w-4 h-4" style="stroke-width: 1.5;"></i><span>Kayıt Boş</span>';
        balance.className = 'flex items-center gap-2 text-slate-500';
    } else {
        const farkText = difference.toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        balance.innerHTML = '<i data-lucide="alert-triangle" class="w-4 h-4" style="stroke-width: 1.5;"></i><span>Dengesiz (Fark: ' + farkText + '₺)</span>';
        balance.className = 'flex items-center gap-2 text-amber-600';
    }
    lucide.createIcons();
}

/**
 * Add event listeners to existing rows
 * Sets up debit/credit mutual exclusion for existing rows
 */
function addEventListenersToExistingRows() {
    document.querySelectorAll('#journalEntries .grid').forEach(row => {
        const debitInput = row.querySelector('.debit-input');
        const creditInput = row.querySelector('.credit-input');

        if (debitInput && creditInput) {
            // Mevcut event listener'ları kaldır (duplikasyon önlemek için)
            debitInput.removeEventListener('input', handleDebitInput);
            creditInput.removeEventListener('input', handleCreditInput);

            // Yeni event listener'ları ekle
            debitInput.addEventListener('input', handleDebitInput);
            creditInput.addEventListener('input', handleCreditInput);
        }
    });
}

/**
 * Handle debit input change
 * Clears credit when debit is entered
 */
function handleDebitInput() {
    if (this.value && parseFloat(this.value) > 0) {
        const creditInput = this.closest('.grid').querySelector('.credit-input');
        if (creditInput) {
            creditInput.value = '';
            updateTotals();
        }
    }
}

/**
 * Handle credit input change
 * Clears debit when credit is entered
 */
function handleCreditInput() {
    if (this.value && parseFloat(this.value) > 0) {
        const debitInput = this.closest('.grid').querySelector('.debit-input');
        if (debitInput) {
            debitInput.value = '';
            updateTotals();
        }
    }
}

// ===========================
// REVIEW MODE
// ===========================

/**
 * Load past answers for review mode
 * Fetches and displays previously submitted answers
 */
async function loadPastAnswers() {
    try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (!storedUser || !token || !roomId) return;

        // Oda içinden çözüldüyse UserAnswer'ları getir
        const response = await fetch(
            `${API_URL}/teacher/grading/rooms/${roomId}/problems/${problemId}/answers`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (!response.ok) {
            console.error('Past answers could not be loaded');
            return;
        }

        const answers = await response.json();

        // Bu kullanıcının cevaplarını filtrele
        const userAnswers = answers.filter(a => a.userId === storedUser.id);

        if (userAnswers.length > 0) {
            // Tabloyu temizle
            const tableBody = document.getElementById('journalEntries');
            tableBody.innerHTML = '';

            // Her cevabı tabloya ekle
            userAnswers.forEach(answer => {
                addJournalRow();
                const rows = tableBody.querySelectorAll('.grid');
                const lastRow = rows[rows.length - 1];

                const accountInput = lastRow.querySelector('input[type="text"]');
                const numberInputs = lastRow.querySelectorAll('input[type="number"]');

                accountInput.value = answer.accountCode;
                numberInputs[0].value = answer.debit || 0;
                numberInputs[1].value = answer.credit || 0;

                // Hesap adını güncelle
                updateAccountName(accountInput);
            });

            updateTotals();
        }
    } catch (error) {
        console.error('Error loading past answers:', error);
    }
}

/**
 * Enable review mode
 * Makes form read-only and adds review mode indicators
 */
function enableReviewMode() {
    // Başlığı değiştir
    const titleEl = document.querySelector('h1.text-3xl');
    if (titleEl) {
        const badge = document.createElement('span');
        badge.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 ml-3';
        badge.innerHTML = '<i data-lucide="eye" class="w-4 h-4 mr-1"></i>İnceleme Modu';
        titleEl.appendChild(badge);
        lucide.createIcons();
    }

    // Tüm inputları readonly yap
    setTimeout(() => {
        document.querySelectorAll('#journalEntries input').forEach(input => {
            input.setAttribute('readonly', true);
            input.classList.add('bg-slate-100', 'cursor-not-allowed');
        });
    }, 500);

    // Butonları gizle/devre dışı bırak
    const addRowBtn = document.getElementById('addRowBtn');
    const submitBtn = document.getElementById('submitBtn');

    if (addRowBtn) addRowBtn.style.display = 'none';
    if (submitBtn) submitBtn.style.display = 'none';

    // Silme butonlarını gizle
    setTimeout(() => {
        document.querySelectorAll('button[onclick^="removeJournalRow"]').forEach(btn => {
            btn.style.display = 'none';
        });
    }, 500);

    // Bilgi mesajı ekle
    const mainContent = document.querySelector('.flex.flex-col.h-screen > div:nth-child(2)');
    if (mainContent) {
        const notice = document.createElement('div');
        notice.className = 'bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4';
        notice.innerHTML = `
            <div class="flex items-center gap-2 text-blue-700">
                <i data-lucide="info" class="w-5 h-5"></i>
                <span class="font-medium">İnceleme Modu</span>
            </div>
            <p class="text-sm text-blue-600 mt-1">
                Bu problemi daha önce çözdünüz. Cevaplarınızı inceleyebilirsiniz ancak değişiklik yapamazsınız.
            </p>
        `;
        mainContent.insertBefore(notice, mainContent.firstChild);
        lucide.createIcons();
    }
}

// ===========================
// AUTH UI
// ===========================

/**
 * Show user interface for authenticated users
 * @param {Object} user - User data from localStorage
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

    // Profil API'sinden firstName'i al ve localStorage'a kaydet
    loadUserProfile(user);
}

/**
 * Load user profile and update localStorage with firstName
 * @param {Object} user - User data
 */
async function loadUserProfile(user) {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_URL}/users/${user.id}/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const profile = await response.json();

            // localStorage'daki user verisini firstName ile güncelle
            if (profile.firstName) {
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                storedUser.firstName = profile.firstName;
                localStorage.setItem('user', JSON.stringify(storedUser));
                console.log('Updated localStorage with firstName:', profile.firstName);

                // Navbar'ı güncelle
                const userDisplayName = document.getElementById('userDisplayName');
                if (userDisplayName) {
                    userDisplayName.textContent = `Hoşgeldin, ${profile.firstName}`;
                }
            }
        }
    } catch (error) {
        console.error('Profil yükleme hatası:', error);
    }
}

/**
 * Show guest interface for non-authenticated users
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
 * Logout user
 * @param {Event} event - Click event
 */
function logout(event) {
    if (event) event.preventDefault();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

/**
 * Navigate back to problems list or room problems
 */
function goBack() {
    // URL parametrelerinden roomId'yi kontrol et
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('roomId');

    if (roomId) {
        // Oda içinden geldiyse, o odanın problemler sayfasına dön
        window.location.href = `student-room-problems.html?id=${roomId}`;
    } else {
        // Genel problem listesinden geldiyse, oraya dön
        window.location.href = 'problems.html';
    }
}

// ===========================
// MODAL FUNCTIONS
// ===========================

/**
 * Show error modal
 * @param {string} message - Error message to display
 */
function showError(message) {
    document.getElementById("errorMessage").textContent = message;
    document.getElementById("errorModal").classList.remove("hidden");
}

/**
 * Close error modal
 */
function closeErrorModal() {
    document.getElementById("errorModal").classList.add("hidden");
}

/**
 * Show success modal
 * @param {string} message - Success message to display
 */
function showSuccess(message) {
    document.getElementById("successMessage").textContent = message;
    document.getElementById("successModal").classList.remove("hidden");
}

/**
 * Close success modal
 */
function closeSuccessModal() {
    document.getElementById("successModal").classList.add("hidden");
}

/**
 * Show error modal with detailed message
 * @param {string} message - Error message to display
 */
function showErrorModal(message) {
    document.getElementById('errorModalMessage').textContent = message;
    document.getElementById('errorModal').classList.remove('hidden');
    lucide.createIcons();
}

// ===========================
// GLOBAL EXPORTS
// ===========================
window.addJournalRow = addJournalRow;
window.removeJournalRow = removeJournalRow;
window.updateAccountName = updateAccountName;
window.updateTotals = updateTotals;
window.submitEntry = submitEntry;
window.toggleProfileDropdown = toggleProfileDropdown;
window.logout = logout;
window.goBack = goBack;
window.showError = showError;
window.closeErrorModal = closeErrorModal;
window.showSuccess = showSuccess;
window.closeSuccessModal = closeSuccessModal;

// ===========================
// EVENT LISTENERS
// ===========================

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initProblemDetailPage);

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('profileDropdown');
    const button = document.querySelector('[onclick="toggleProfileDropdown()"]');
    if (dropdown && button && !button.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});

// Add event listeners to existing rows
document.addEventListener('DOMContentLoaded', function() {
    addEventListenersToExistingRows();
});
