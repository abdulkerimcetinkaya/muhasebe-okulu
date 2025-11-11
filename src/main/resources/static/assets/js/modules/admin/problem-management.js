/**
 * Problem Management Module for Admin Panel
 *
 * Provides CRUD operations for problem management including loading, creating,
 * editing, deleting problems, and search/filtering functionality.
 *
 * Dependencies: Logger, StorageUtil, Formatters, UIHelpers, Pagination, AccountHelpers
 *
 * @module problem-management
 */

const ProblemManagement = {
    // API configuration
    API_PROBLEMS: 'http://localhost:8080/api/admin/problems',
    API_CATEGORIES: 'http://localhost:8080/api/categories',

    /**
     * Load problems from API with pagination and filters
     * @param {number} page - Page number (0-indexed)
     * @param {string} search - Search query
     * @param {string} difficulty - Difficulty filter (EASY, MEDIUM, HARD)
     * @param {string} categoryId - Category filter (category ID)
     * @returns {Promise<void>}
     */
    loadProblems: async (page = 0, search = '', difficulty = '', categoryId = '') => {
        try {
            const token = StorageUtil.get('token');
            const storedUser = StorageUtil.get('user');

            if (!token || !storedUser) {
                UIHelpers.showError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
                setTimeout(() => window.location.href = 'login.html', 2000);
                return;
            }

            Logger.log('Loading problems with token:', token.substring(0, 20) + '...');

            // Build URL with parameters
            const state = Pagination.getState();
            let url = `${ProblemManagement.API_PROBLEMS}?page=${page}&size=${state.itemsPerPage}`;
            if (search && search.trim() !== '') {
                url += `&search=${encodeURIComponent(search.trim())}`;
            }
            if (difficulty && difficulty.trim() !== '') {
                url += `&difficulty=${encodeURIComponent(difficulty.trim())}`;
            }
            if (categoryId && categoryId.trim() !== '') {
                url += `&categoryId=${encodeURIComponent(categoryId.trim())}`;
            }

            Logger.log('Fetching URL:', url);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            Logger.log('Response status:', response.status);

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    UIHelpers.showError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
                    setTimeout(() => window.location.href = 'login.html', 2000);
                    return;
                }
                throw new Error(`HTTP ${response.status}: Problemler yüklenemedi`);
            }

            const responseText = await response.text();
            Logger.log('Problems response length:', responseText.length);

            // Clean large responses
            let cleanResponse = responseText;
            if (responseText.length > 100000) {
                Logger.warn('Response çok büyük, temizleniyor...');
                try {
                    const tempData = JSON.parse(responseText.substring(0, 50000));
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
                    Logger.error('Response temizleme hatası:', e);
                    throw new Error('Response çok büyük ve temizlenemedi');
                }
            }

            let data;
            try {
                data = JSON.parse(cleanResponse);
            } catch (parseError) {
                Logger.error('Problems JSON Parse Error:', parseError);
                throw new Error('Problem listesi JSON formatında değil');
            }

            // Update pagination state
            Pagination.setState({
                currentPage: data.number,
                totalPages: data.totalPages,
                totalItems: data.totalElements
            });

            ProblemManagement.renderProblems(data.content);
            Pagination.render('pagination-container');
        } catch (err) {
            Logger.error('Problem listeleme hatası:', err);
            UIHelpers.showError(err.message || 'Problemler yüklenirken hata oluştu.');
        }
    },

    /**
     * Load categories from API and populate dropdowns
     * @returns {Promise<void>}
     */
    loadCategories: async () => {
        try {
            const token = StorageUtil.get('token');
            const response = await fetch(ProblemManagement.API_CATEGORIES, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                Logger.warn('Kategoriler yüklenemedi, dropdown boş kalacak');
                return;
            }

            const categories = await response.json();

            // Populate create form dropdown
            const createDropdown = document.getElementById('c-category');
            if (createDropdown) {
                createDropdown.innerHTML = '<option value="">Kategori Seçin (opsiyonel)</option>';
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    createDropdown.appendChild(option);
                });
            }

            // Populate edit form dropdown
            const editDropdown = document.getElementById('e-category');
            if (editDropdown) {
                editDropdown.innerHTML = '<option value="">Kategori Seçin (opsiyonel)</option>';
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    editDropdown.appendChild(option);
                });
            }

            // Populate filter dropdown
            const filterDropdown = document.getElementById('problemCategoryFilter');
            if (filterDropdown) {
                filterDropdown.innerHTML = '<option value="">Tüm Kategoriler</option>';
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    filterDropdown.appendChild(option);
                });
            }

            Logger.log(`Loaded ${categories.length} categories`);
        } catch (err) {
            Logger.error('Kategori yükleme hatası:', err);
        }
    },

    /**
     * Render problems in the table
     * @param {Array} problems - Array of problem objects
     */
    renderProblems: (problems) => {
        const tbody = document.getElementById('problemsTbody');
        if (!tbody) {
            Logger.error('problemsTbody element not found');
            return;
        }

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
                    <div class="font-medium text-slate-900">${Formatters.escapeHtml(item.title)}</div>
                    <div class="text-slate-600 text-xs mt-0.5 line-clamp-2">${Formatters.escapeHtml(item.content)}</div>
                    ${item.hint ? `<div class="text-slate-500 text-xs mt-0.5">İpucu: ${Formatters.escapeHtml(item.hint)}</div>` : ''}
                    ${item.categoryName ? `<div class="mt-1.5"><span class="inline-flex items-center px-2 py-0.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 text-xs"><i data-lucide="folder" class="w-3 h-3 mr-1" style="stroke-width:1.5;"></i>${Formatters.escapeHtml(item.categoryName)}</span></div>` : ''}
                </td>
                <td class="px-6 py-3">
                    <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${Formatters.difficultyBadge(item.difficulty)}">
                        ${Formatters.difficultyLabel(item.difficulty)}
                    </span>
                </td>
                <td class="px-6 py-3">
                    <div class="flex flex-wrap gap-1.5">
                        ${(item.tags || '').split(',').filter(Boolean).map(t => `
                            <span class="inline-flex items-center px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700 text-xs">${Formatters.escapeHtml(t.trim())}</span>
                        `).join('')}
                    </div>
                </td>
                <td class="px-6 py-3 text-right">
                    <div class="inline-flex items-center gap-2">
                        <button class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50" onclick="ProblemManagement.editProblem(${item.id})">
                            <i data-lucide="pencil" class="w-3.5 h-3.5" style="stroke-width:1.5;"></i>
                            Düzenle
                        </button>
                        <button class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-red-200 text-red-700 hover:bg-red-50" onclick="ProblemManagement.deleteProblem(${item.id})">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5" style="stroke-width:1.5;"></i>
                            Sil
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        lucide.createIcons();
        Logger.log(`Rendered ${problems.length} problems`);
    },

    /**
     * Edit problem - loads problem data and shows edit form
     * @param {number} id - Problem ID
     * @returns {Promise<void>}
     */
    editProblem: async (id) => {
        try {
            const token = StorageUtil.get('token');
            const response = await fetch(`${ProblemManagement.API_PROBLEMS}/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Problem bulunamadı');

            const data = await response.json();

            UIHelpers.setValue('e-id', data.id);
            UIHelpers.setValue('e-title', data.title);
            UIHelpers.setValue('e-content', data.content);
            UIHelpers.setValue('e-hint', data.hint || '');
            UIHelpers.setValue('e-tags', data.tags || '');
            UIHelpers.setValue('e-difficulty', data.difficulty || 'MEDIUM');
            UIHelpers.setValue('e-category', data.categoryId || '');

            const body = document.getElementById('e-answersBody');
            if (body) {
                body.innerHTML = '';

                if (!data.correctEntries || !data.correctEntries.length) {
                    AccountHelpers.addAnswerRow('e-answersBody');
                } else {
                    data.correctEntries.forEach(entry =>
                        AccountHelpers.addAnswerRow('e-answersBody', entry.accountCode, entry.accountName, entry.debitAmount, entry.creditAmount)
                    );
                }

                // Update totals
                AccountHelpers.updateTotals('e-answersBody');
            }

            UIHelpers.showSection('duzenle');
            document.getElementById('duzenle')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            Logger.log(`Editing problem: ${id}`);
        } catch (err) {
            Logger.error('Problem düzenleme hatası:', err);
            UIHelpers.showError(err.message || 'Problem yüklenirken hata oluştu.');
        }
    },

    /**
     * Delete problem with confirmation
     * @param {number} id - Problem ID
     * @returns {Promise<void>}
     */
    deleteProblem: async (id) => {
        UIHelpers.showConfirm('Bu problemi silmek istediğinize emin misiniz?', async () => {
            try {
                const token = StorageUtil.get('token');
                const response = await fetch(`${ProblemManagement.API_PROBLEMS}/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Problem silinemedi');

                UIHelpers.showSuccess('Problem başarıyla silindi.');
                setTimeout(() => {
                    const state = Pagination.getState();
                    ProblemManagement.loadProblems(state.currentPage);
                }, 1500);
                Logger.log(`Problem deleted: ${id}`);
            } catch (err) {
                Logger.error('Problem silme hatası:', err);
                UIHelpers.showError(err.message || 'Problem silinirken hata oluştu.');
            }
        });
    },

    /**
     * Create new problem from form
     * Handles form submission and validation
     * @param {Event} event - Form submit event
     * @returns {Promise<void>}
     */
    createProblem: async (event) => {
        event.preventDefault();
        try {
            const title = UIHelpers.getValue('c-title').trim();
            const content = UIHelpers.getValue('c-content').trim();

            if (!title || !content) {
                UIHelpers.showError('Başlık ve İçerik zorunludur.');
                return;
            }

            const entries = AccountHelpers.collectAnswers('c-answersBody');
            if (entries.length === 0) {
                UIHelpers.showError('En az bir doğru cevap girmelisiniz!');
                return;
            }

            const categoryId = UIHelpers.getValue('c-category');

            const problem = {
                title,
                content,
                hint: UIHelpers.getValue('c-hint').trim(),
                tags: UIHelpers.getValue('c-tags').trim(),
                difficulty: UIHelpers.getValue('c-difficulty'),
                categoryId: categoryId && categoryId !== '' ? parseInt(categoryId) : null,
                correctEntries: entries
            };

            const token = StorageUtil.get('token');
            const response = await fetch(ProblemManagement.API_PROBLEMS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(problem)
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error('Problem eklenemedi: ' + error);
            }

            UIHelpers.showSuccess('Problem başarıyla kaydedildi.');
            setTimeout(() => {
                ProblemManagement.clearCreateForm();
                UIHelpers.showSection('all-problems');
                ProblemManagement.loadProblems();
            }, 2000);
            Logger.log('Problem created successfully');
        } catch (err) {
            Logger.error('Problem ekleme hatası:', err);
            UIHelpers.showError(err.message || 'Problem eklenirken hata oluştu.');
        }
    },

    /**
     * Update existing problem from edit form
     * @param {Event} event - Form submit event
     * @returns {Promise<void>}
     */
    updateProblem: async (event) => {
        event.preventDefault();
        try {
            const id = UIHelpers.getValue('e-id');
            const title = UIHelpers.getValue('e-title').trim();
            const content = UIHelpers.getValue('e-content').trim();

            if (!title || !content) {
                UIHelpers.showError('Başlık ve İçerik zorunludur.');
                return;
            }

            const entries = AccountHelpers.collectAnswers('e-answersBody');
            if (entries.length === 0) {
                UIHelpers.showError('En az bir doğru cevap girmelisiniz!');
                return;
            }

            const categoryId = UIHelpers.getValue('e-category');

            const updated = {
                title,
                content,
                hint: UIHelpers.getValue('e-hint').trim(),
                tags: UIHelpers.getValue('e-tags').trim(),
                difficulty: UIHelpers.getValue('e-difficulty'),
                categoryId: categoryId && categoryId !== '' ? parseInt(categoryId) : null,
                correctEntries: entries
            };

            const token = StorageUtil.get('token');
            const response = await fetch(`${ProblemManagement.API_PROBLEMS}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updated)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Problem güncellenemedi: ${errorText}`);
            }

            UIHelpers.showSuccess('Problem başarıyla güncellendi.');
            setTimeout(() => {
                UIHelpers.showSection('all-problems');
                ProblemManagement.loadProblems();
            }, 2000);
            Logger.log(`Problem updated: ${id}`);
        } catch (err) {
            Logger.error('Problem güncelleme hatası:', err);
            UIHelpers.showError(err.message || 'Güncelleme sırasında hata oluştu.');
        }
    },

    /**
     * Clear create form fields
     */
    clearCreateForm: () => {
        UIHelpers.setValue('c-title', '');
        UIHelpers.setValue('c-content', '');
        UIHelpers.setValue('c-hint', '');
        UIHelpers.setValue('c-tags', '');
        UIHelpers.setValue('c-difficulty', 'MEDIUM');
        UIHelpers.setValue('c-category', '');
        const body = document.getElementById('c-answersBody');
        if (body) {
            body.innerHTML = '';
            AccountHelpers.addAnswerRow('c-answersBody');
        }
        Logger.log('Create form cleared');
    },

    /**
     * Perform search with current filters
     */
    performProblemSearch: () => {
        const searchValue = document.getElementById('problemSearchInput')?.value || '';
        const difficultyValue = document.getElementById('problemDifficultyFilter')?.value || '';
        const categoryValue = document.getElementById('problemCategoryFilter')?.value || '';
        Logger.log('Performing search:', { search: searchValue, difficulty: difficultyValue, category: categoryValue });
        ProblemManagement.loadProblems(0, searchValue, difficultyValue, categoryValue);
    },

    /**
     * Clear search filters
     */
    clearProblemSearch: () => {
        const searchInput = document.getElementById('problemSearchInput');
        const difficultyFilter = document.getElementById('problemDifficultyFilter');
        const categoryFilter = document.getElementById('problemCategoryFilter');

        if (searchInput) searchInput.value = '';
        if (difficultyFilter) difficultyFilter.value = '';
        if (categoryFilter) categoryFilter.value = '';

        Logger.log('Search cleared');
        ProblemManagement.loadProblems(0, '', '', '');
    },

    /**
     * Initialize problem search event listeners
     */
    initProblemSearchListeners: () => {
        const searchButton = document.getElementById('problemSearchButton');
        const clearButton = document.getElementById('problemClearButton');
        const searchInput = document.getElementById('problemSearchInput');
        const difficultyFilter = document.getElementById('problemDifficultyFilter');

        Logger.log('Init search listeners:', { searchButton, clearButton, searchInput, difficultyFilter });

        if (searchButton) {
            searchButton.onclick = ProblemManagement.performProblemSearch;
            Logger.debug('Search button listener added');
        }

        if (clearButton) {
            clearButton.onclick = ProblemManagement.clearProblemSearch;
            Logger.debug('Clear button listener added');
        }

        // Enter key for search
        if (searchInput) {
            searchInput.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    ProblemManagement.performProblemSearch();
                }
            };
            Logger.debug('Search input listener added');
        }

        // Auto-search on difficulty change
        if (difficultyFilter) {
            difficultyFilter.onchange = ProblemManagement.performProblemSearch;
            Logger.debug('Difficulty filter listener added');
        }

        // Auto-search on category change
        const categoryFilter = document.getElementById('problemCategoryFilter');
        if (categoryFilter) {
            categoryFilter.onchange = ProblemManagement.performProblemSearch;
            Logger.debug('Category filter listener added');
        }
    },

    /**
     * Initialize problem management module
     * Sets up event listeners and form handlers
     */
    initialize: () => {
        // Load categories for dropdowns
        ProblemManagement.loadCategories();

        // Create form handler
        const createForm = document.getElementById('createForm');
        if (createForm) {
            createForm.addEventListener('submit', ProblemManagement.createProblem);
        }

        // Edit form handler
        const editForm = document.getElementById('editForm');
        if (editForm) {
            editForm.addEventListener('submit', ProblemManagement.updateProblem);
        }

        // Cancel edit button
        const cancelButton = document.getElementById('e-cancel');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                UIHelpers.showSection('all-problems');
            });
        }

        // Initialize search listeners
        ProblemManagement.initProblemSearchListeners();

        // Override Pagination.changePage to include search parameters
        const originalChangePage = Pagination.changePage;
        Pagination.changePage = (page, loadFunction) => {
            const searchValue = document.getElementById('problemSearchInput')?.value || '';
            const difficultyValue = document.getElementById('problemDifficultyFilter')?.value || '';
            const categoryValue = document.getElementById('problemCategoryFilter')?.value || '';
            ProblemManagement.loadProblems(page, searchValue, difficultyValue, categoryValue);
        };

        Logger.log('Problem Management module initialized');
    }
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProblemManagement;
}
