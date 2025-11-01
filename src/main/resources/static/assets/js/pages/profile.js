/**
 * Profile Page - Kullanıcı profili, düzenleme, şifre değiştirme
 * Profil bilgileri, çözülen problemler, aktivite analizi
 */

// ===========================
// CONSTANTS
// ===========================
const API_URL = "http://localhost:8080/api/users";

// ===========================
// STATE VARIABLES
// ===========================

// Global profile data
window.currentProfile = null;

// Role display map
const ROLE_MAP = {
    'ADMIN': 'Yönetici',
    'USER': 'Öğrenci',
    'TEACHER': 'Öğretmen'
};

// Legacy profession enum map for backward compatibility
const LEGACY_PROFESSION_MAP = {
    'STUDENT': 'Öğrenci',
    'ACCOUNTANT': 'Muhasebeci',
    'AUDITOR': 'Denetçi',
    'CFO': 'Mali İşler Müdürü',
    'TAX_CONSULTANT': 'Mali Müşavir',
    'FINANCIAL_ANALYST': 'Finansal Analist',
    'BOOKKEEPER': 'Defter Tutan',
    'OTHER': 'Diğer'
};

// ===========================
// INITIALIZATION
// ===========================

/**
 * Initialize profile page
 */
async function initProfilePage() {
    // Update year in footer
    document.getElementById("year").textContent = new Date().getFullYear();

    // Show Edit tab by default
    switchTab('edit');

    // Load settings
    loadSettings();

    // Update user display name in navbar
    CommonUtils.updateProfileMenu();

    // Load profile data
    await loadProfile();

    // Create Lucide icons
    lucide.createIcons();

    // Setup event listeners
    setupEventListeners();
}

// ===========================
// EVENT LISTENERS
// ===========================

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Profile update form
    document.getElementById("profileUpdateForm").addEventListener("submit", handleProfileUpdate);

    // Password change form
    document.getElementById("changePasswordForm").addEventListener("submit", handlePasswordChange);

    // Language select (if exists)
    const languageSelect = document.getElementById("languageSelect");
    if (languageSelect) {
        languageSelect.addEventListener("change", (e) => {
            changeLanguage(e.target.value);
        });
    }

    // Dropdown close listener artık common.js'de global olarak tanımlı
}

/**
 * Handle profile update form submission
 * @param {Event} e - Form submit event
 */
async function handleProfileUpdate(e) {
    e.preventDefault();

    const updateData = {
        firstName: document.getElementById("editFirstName").value || null,
        lastName: document.getElementById("editLastName").value || null,
        email: document.getElementById("editEmail").value || null,
        birthDate: document.getElementById("editBirthDate").value || null,
        bio: document.getElementById("editBio").value || null,
        profession: document.getElementById("editProfession").value || null,
        company: document.getElementById("editCompany").value || null,
        jobTitle: document.getElementById("editJobTitle").value || null,
        experienceYears: document.getElementById("editExperienceYears").value ?
            parseInt(document.getElementById("editExperienceYears").value) : null,
        education: document.getElementById("editEducation").value || null,
        university: document.getElementById("editUniversity").value || null
    };

    await updateProfile(updateData);
}

/**
 * Handle password change form submission
 * @param {Event} e - Form submit event
 */
async function handlePasswordChange(e) {
    e.preventDefault();

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
        alert("Yeni şifreler eşleşmiyor!");
        return;
    }

    if (newPassword.length < 6) {
        alert("Yeni şifre en az 6 karakter olmalıdır!");
        return;
    }

    try {
        await changePassword(currentPassword, newPassword);
        alert("Şifre başarıyla değiştirildi!");

        // Clear form
        document.getElementById("changePasswordForm").reset();
    } catch (err) {
        alert("Şifre değiştirilirken hata oluştu: " + err.message);
    }
}

// ===========================
// HELPER FUNCTIONS
// ===========================

/**
 * Get profession display name (supports legacy enum and free text)
 * @param {string} profession - Profession value
 * @returns {string} Display name
 */
function getProfessionDisplayName(profession) {
    if (!profession) return '-';

    // Convert legacy enum values, otherwise show as is
    return LEGACY_PROFESSION_MAP[profession] || profession;
}

/**
 * Set user display name in navbar
 */
function setUserDisplayName() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        const user = JSON.parse(storedUser);
        const displayName = user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.username;
        const displayElement = document.getElementById('userDisplayName');
        if (displayElement) {
            displayElement.textContent = displayName;
        }
    }
}

/**
 * Logout user
 * @param {Event} event - Click event
 */
function logout(event) {
    if (event) event.preventDefault();
    localStorage.clear();
    window.location.href = 'index.html';
}

// ===========================
// PROFILE LOADING
// ===========================

/**
 * Load user profile from API
 */
async function loadProfile() {
    try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        const token = localStorage.getItem("token");

        if (!storedUser || !storedUser.id || !token) {
            alert("Lütfen giriş yapın.");
            window.location.href = "index.html";
            return;
        }

        // Setup navbar layouts
        setupNavbar(storedUser);

        // Fetch profile
        const response = await fetch(`${API_URL}/${storedUser.id}/profile`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.clear();
                alert("Oturumunuz sonlanmış. Lütfen tekrar giriş yapın.");
                window.location.href = "index.html";
                return;
            }
            throw new Error(`Profil yüklenemedi (${response.status})`);
        }

        const profile = await response.json();
        window.currentProfile = profile;
        console.log('Profile loaded from API:', profile);

        // Update localStorage with firstName
        if (profile.firstName) {
            storedUser.firstName = profile.firstName;
            localStorage.setItem('user', JSON.stringify(storedUser));
            console.log('Updated localStorage with firstName:', profile.firstName);
        }

        // Display profile data
        displayProfileInfo(profile, storedUser);

        // Update activity analysis
        updateActivityAnalysis(profile);

        // Display solved problems
        displaySolvedProblems(profile);

        // Fill edit form
        fillEditForm();

    } catch (err) {
        console.error("Profil yükleme hatası:", err);
        displayProfileError(err.message);
    }
}

/**
 * Setup navbar based on user role
 * @param {Object} storedUser - User data from localStorage
 */
function setupNavbar(storedUser) {
    // Hide guest layout
    document.getElementById('guestLayout').classList.add('hidden');
    document.getElementById('guestAuthButtons').classList.add('hidden');

    // Show user layout
    document.getElementById('userLayout').classList.remove('hidden');
    document.getElementById('userProfileMenu').classList.remove('hidden');

    // Setup nav links based on role
    if (storedUser.role === 'ADMIN') {
        // Admin: hide user links, show admin links
        document.getElementById('userDashboardLink').classList.add('hidden');
        document.getElementById('userProblemsLink').classList.add('hidden');
        document.getElementById('userQuizzesLink').classList.add('hidden');
        document.getElementById('userProfileLink').classList.add('hidden');
        document.getElementById('adminDashboardLink').classList.remove('hidden');
        document.getElementById('adminLink').classList.remove('hidden');
        document.getElementById('adminQuizzesLink').classList.remove('hidden');
    } else {
        // Regular user: show user links
        document.getElementById('userDashboardLink').classList.remove('hidden');
        document.getElementById('userProblemsLink').classList.remove('hidden');
        document.getElementById('userQuizzesLink').classList.remove('hidden');
        document.getElementById('userProfileLink').classList.remove('hidden');
    }
}

/**
 * Display profile information
 * @param {Object} profile - Profile data
 * @param {Object} storedUser - User data from localStorage
 */
function displayProfileInfo(profile, storedUser) {
    // Basic info
    document.getElementById("profileUsername").textContent = profile.username;
    document.getElementById("profileAvatar").textContent = profile.username.charAt(0).toUpperCase();
    document.getElementById("profileEmail").textContent = profile.email || storedUser.username || "-";
    document.getElementById("profileProfession").textContent = getProfessionDisplayName(profile.profession);

    // Update navbar dropdown (if exists)
    const userInitial = document.getElementById("userInitial");
    if (userInitial) userInitial.textContent = profile.username.charAt(0).toUpperCase();

    const userInitialDropdown = document.getElementById("userInitialDropdown");
    if (userInitialDropdown) userInitialDropdown.textContent = profile.username.charAt(0).toUpperCase();

    const displayName = profile.firstName || profile.username;
    const userName = document.getElementById("userName");
    if (userName) userName.textContent = displayName;

    const userNameButton = document.getElementById("userNameButton");
    if (userNameButton) userNameButton.textContent = `Hoşgeldin, ${displayName}`;

    const userNameDropdown = document.getElementById("userNameDropdown");
    if (userNameDropdown) userNameDropdown.textContent = profile.username;

    // Role display
    const profileRole = document.getElementById("profileRole");
    if (profileRole) profileRole.textContent = ROLE_MAP[storedUser.role] || 'Öğrenci';

    const userRole = document.getElementById("userRole");
    if (userRole) userRole.textContent = ROLE_MAP[storedUser.role] || 'Öğrenci';

    // Statistics
    const solvedCount = profile.solvedCount || 0;
    const totalScore = profile.totalScore || 0;

    document.getElementById("statsSolved").textContent = solvedCount;
    document.getElementById("statsScore").textContent = totalScore;
    document.getElementById("solvedBadge").textContent = `${solvedCount} problem`;
}

/**
 * Display solved problems list
 * @param {Object} profile - Profile data
 */
function displaySolvedProblems(profile) {
    const container = document.getElementById("solvedProblemsContainer");

    if (!profile.solvedProblems || profile.solvedProblems.length === 0) {
        container.innerHTML = createEmptySolvedProblemsView();
        lucide.createIcons();
    } else {
        container.innerHTML = profile.solvedProblems.map(sp => createSolvedProblemItem(sp)).join("");
        lucide.createIcons();
    }
}

/**
 * Create empty solved problems view
 * @returns {string} HTML for empty state
 */
function createEmptySolvedProblemsView() {
    return `
        <div class="p-8 text-center text-slate-500">
            <i data-lucide="inbox" class="w-12 h-12 mx-auto mb-3 text-slate-300"></i>
            <p class="text-sm">Henüz hiç problem çözmediniz.</p>
            <a href="problems.html" class="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-md bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition">
                <i data-lucide="rocket" class="w-4 h-4"></i>
                İlk Problemi Çöz
            </a>
        </div>
    `;
}

/**
 * Create solved problem item HTML
 * @param {Object} sp - Solved problem data
 * @returns {string} HTML for solved problem item
 */
function createSolvedProblemItem(sp) {
    return `
        <div class="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition">
            <div class="flex items-start gap-3 min-w-0">
                <span class="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                    <i data-lucide="check" class="w-4.5 h-4.5 text-emerald-600" style="stroke-width:2;"></i>
                </span>
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                        <h3 class="text-sm font-medium text-slate-900 truncate">${sp.problemTitle || 'Problem'}</h3>
                        ${sp.roomName ? `
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 flex-shrink-0">
                                <i data-lucide="home" class="w-3 h-3"></i>
                                ${sp.roomName}
                            </span>
                        ` : `
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 flex-shrink-0">
                                <i data-lucide="globe" class="w-3 h-3"></i>
                                Genel
                            </span>
                        `}
                    </div>
                    <p class="text-xs text-slate-600 mt-0.5">${new Date(sp.solvedAt).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}</p>
                </div>
            </div>
            <div class="flex items-center gap-3 flex-shrink-0">
                <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 border border-green-200 text-xs font-medium text-green-700">
                    <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                    +${sp.earnedPoints}
                </span>
                <a href="problem-detail.html?id=${sp.problemId}"
                   class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition">
                    <i data-lucide="repeat" class="w-3.5 h-3.5"></i>
                    Tekrar Çöz
                </a>
            </div>
        </div>
    `;
}

/**
 * Display profile error
 * @param {string} errorMessage - Error message
 */
function displayProfileError(errorMessage) {
    document.getElementById("solvedProblemsContainer").innerHTML = `
        <div class="p-8 text-center text-red-500">
            <i data-lucide="alert-circle" class="w-12 h-12 mx-auto mb-3"></i>
            <p class="text-sm">${errorMessage || 'Profil yüklenirken hata oluştu'}</p>
        </div>
    `;
    lucide.createIcons();
}

// ===========================
// TAB SWITCHING
// ===========================

/**
 * Switch between profile tabs
 * @param {string} tabName - Tab name (edit, solved, settings)
 */
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.add('hidden');
    });

    // Deactivate all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active', 'border-slate-800', 'text-slate-900');
        button.classList.add('border-transparent', 'text-slate-500');
    });

    // Activate selected tab
    const activeTab = document.getElementById(`tab-${tabName}`);
    const activePanel = document.getElementById(`tab-content-${tabName}`);

    if (activeTab && activePanel) {
        activeTab.classList.add('active', 'border-slate-800', 'text-slate-900');
        activeTab.classList.remove('border-transparent', 'text-slate-500');
        activePanel.classList.remove('hidden');

        // Fill edit form when switching to edit tab
        if (tabName === 'edit') {
            fillEditForm();
        }
    }

    // Refresh icons
    lucide.createIcons();
}

/**
 * Toggle edit mode (legacy function - now uses switchTab)
 */
function toggleEditMode() {
    switchTab('edit');
    fillEditForm();
}

// ===========================
// FORM MANAGEMENT
// ===========================

/**
 * Fill edit form with current profile data
 */
function fillEditForm() {
    const profile = window.currentProfile;
    console.log('Current profile:', profile);

    // Get registration data from localStorage
    const storedUser = localStorage.getItem('user');
    let registrationData = {};
    if (storedUser) {
        registrationData = JSON.parse(storedUser);
        console.log('Registration data from localStorage:', registrationData);
    }

    // Merge registration data with profile data (profile takes priority)
    const firstName = profile?.firstName || registrationData.firstName || "";
    const lastName = profile?.lastName || registrationData.lastName || "";
    const email = profile?.email || registrationData.email || "";

    console.log('Filling form with:', { firstName, lastName, email });

    // Fill form fields
    document.getElementById("editFirstName").value = firstName;
    document.getElementById("editLastName").value = lastName;
    document.getElementById("editEmail").value = email;
    document.getElementById("editBirthDate").value = profile?.birthDate || "";
    document.getElementById("editBio").value = profile?.bio || "";
    document.getElementById("editProfession").value = profile?.profession ? profile.profession : "";
    document.getElementById("editCompany").value = profile?.company || "";
    document.getElementById("editJobTitle").value = profile?.jobTitle || "";
    document.getElementById("editExperienceYears").value = profile?.experienceYears || "";
    document.getElementById("editEducation").value = profile?.education || "";
    document.getElementById("editUniversity").value = profile?.university || "";
}

// ===========================
// PROFILE UPDATE
// ===========================

/**
 * Update profile with new data
 * @param {Object} updateData - Update data
 */
async function updateProfile(updateData) {
    try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        const token = localStorage.getItem("token");

        if (!storedUser || !storedUser.id || !token) {
            alert("Lütfen giriş yapın.");
            window.location.href = "index.html";
            return;
        }

        const response = await fetch(`${API_URL}/${storedUser.id}/profile`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.clear();
                alert("Oturumunuz sonlanmış. Lütfen tekrar giriş yapın.");
                window.location.href = "index.html";
                return;
            }
            throw new Error(`Profil güncellenemedi (${response.status})`);
        }

        const updatedProfile = await response.json();
        window.currentProfile = updatedProfile;

        // Update profile display
        document.getElementById("profileEmail").textContent = updatedProfile.email || storedUser.username || "-";
        document.getElementById("profileProfession").textContent = getProfessionDisplayName(updatedProfile.profession);

        // Update activity analysis
        updateActivityAnalysis(updatedProfile);

        // Close edit mode
        toggleEditMode();

        alert("Profil başarıyla güncellendi!");

    } catch (err) {
        console.error("Profil güncelleme hatası:", err);
        alert("Profil güncellenirken hata oluştu: " + err.message);
    }
}

// ===========================
// PASSWORD CHANGE
// ===========================

/**
 * Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} Success status
 */
async function changePassword(currentPassword, newPassword) {
    try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        const token = localStorage.getItem("token");

        if (!storedUser || !storedUser.id || !token) {
            throw new Error("Kullanıcı bilgileri bulunamadı");
        }

        const response = await fetch(`${API_URL}/${storedUser.id}/change-password`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.clear();
                alert("Oturumunuz sonlanmış. Lütfen tekrar giriş yapın.");
                window.location.href = "index.html";
                return false;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || `Şifre değiştirilemedi (${response.status})`);
        }

        return true;
    } catch (err) {
        console.error("Şifre değiştirme hatası:", err);
        throw err;
    }
}

// ===========================
// SETTINGS
// ===========================

/**
 * Load settings from localStorage
 */
function loadSettings() {
    const savedLanguage = localStorage.getItem('language') || 'tr';
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = savedLanguage;
    }
}

/**
 * Change language preference
 * @param {string} language - Language code (tr, en)
 */
function changeLanguage(language) {
    localStorage.setItem('language', language);

    if (language === 'en') {
        updateTextsToEnglish();
    } else {
        updateTextsToTurkish();
    }
}

/**
 * Update texts to English (placeholder for i18n)
 */
function updateTextsToEnglish() {
    console.log('Switching to English...');
    // This function would use an i18n library in production
}

/**
 * Update texts to Turkish (placeholder for i18n)
 */
function updateTextsToTurkish() {
    console.log('Switching to Turkish...');
    // This function would use an i18n library in production
}

// ===========================
// ACTIVITY ANALYSIS
// ===========================

/**
 * Update activity analysis display
 * @param {Object} profile - Profile data
 */
function updateActivityAnalysis(profile) {
    // Daily streak
    const dailyStreakElement = document.getElementById('dailyStreak');
    if (dailyStreakElement) {
        dailyStreakElement.textContent = (profile.dailyStreak || 0) + ' gün';
    }

    // Last active
    if (profile.lastActiveDate) {
        const lastActive = new Date(profile.lastActiveDate);
        const now = new Date();
        const diffTime = Math.abs(now - lastActive);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let lastActiveText = '';
        if (diffDays === 0) {
            lastActiveText = 'Bugün';
        } else if (diffDays === 1) {
            lastActiveText = 'Dün';
        } else if (diffDays < 7) {
            lastActiveText = `${diffDays} gün önce`;
        } else {
            lastActiveText = lastActive.toLocaleDateString('tr-TR');
        }

        const lastActiveElement = document.getElementById('lastActive');
        if (lastActiveElement) {
            lastActiveElement.textContent = lastActiveText;
        }
    } else {
        const lastActiveElement = document.getElementById('lastActive');
        if (lastActiveElement) {
            lastActiveElement.textContent = 'Bilinmiyor';
        }
    }

    // Weekly activity chart
    updateWeeklyActivityChart();
}

/**
 * Update weekly activity chart
 */
async function updateWeeklyActivityChart() {
    try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        const token = localStorage.getItem("token");

        if (!storedUser || !storedUser.id || !token) {
            console.error("Kullanıcı bilgileri bulunamadı");
            return;
        }

        console.log("Aktivite API çağrısı:", `${API_URL}/${storedUser.id}/activity`);
        console.log("Token:", token ? "Mevcut" : "Yok");

        const response = await fetch(`${API_URL}/${storedUser.id}/activity`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Aktivite verileri alınamadı (${response.status})`);
        }

        const weeklyActivity = await response.json();
        const days = ['day0', 'day1', 'day2', 'day3', 'day4', 'day5', 'day6'];

        // Update activity analysis chart
        days.forEach((dayId, index) => {
            const dayElement = document.getElementById(dayId);
            const activity = weeklyActivity[index] ? weeklyActivity[index].problemCount : 0;
            const height = Math.max(20, activity * 20); // Minimum 20px, 20px per activity

            if (dayElement) {
                dayElement.style.height = height + 'px';

                if (activity > 0) {
                    dayElement.className = 'w-8 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-sm';
                } else {
                    dayElement.className = 'w-8 bg-slate-200 rounded-t-sm';
                }
            }
        });

    } catch (error) {
        console.error("Aktivite verileri yüklenirken hata:", error);
        // Show default values on error
        const days = ['day0', 'day1', 'day2', 'day3', 'day4', 'day5', 'day6'];
        const activities = [0, 0, 0, 0, 0, 0, 0];

        days.forEach((dayId, index) => {
            const dayElement = document.getElementById(dayId);
            if (dayElement) {
                const activity = activities[index];
                const height = Math.max(20, activity * 20);
                dayElement.style.height = height + 'px';
                dayElement.className = 'w-8 bg-slate-200 rounded-t-sm';
            }
        });
    }
}

// ===========================
// GLOBAL EXPORTS
// ===========================

// Export functions to window for onclick handlers
window.switchTab = switchTab;
window.toggleEditMode = toggleEditMode;
window.logout = logout;

// ===========================
// EVENT LISTENERS
// ===========================

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", initProfilePage);
