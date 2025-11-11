/**
 * Category Management Module for Admin Panel
 *
 * Provides CRUD operations for category management including loading, creating,
 * editing, and deleting categories.
 *
 * Dependencies: Logger, StorageUtil, Formatters, UIHelpers
 *
 * @module category-management
 */

const CategoryManagement = {
    // API configuration
    API_CATEGORIES: 'http://localhost:8080/api/categories',

    /**
     * Load categories from API
     * @returns {Promise<void>}
     */
    loadCategories: async () => {
        try {
            const token = StorageUtil.get('token');
            if (!token) {
                UIHelpers.showError('Oturum s�resi dolmu_. L�tfen tekrar giri_ yap1n.');
                setTimeout(() => window.location.href = 'login.html', 2000);
                return;
            }

            Logger.log('Loading categories...');

            const response = await fetch(CategoryManagement.API_CATEGORIES, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    UIHelpers.showError('Oturum s�resi dolmu_. L�tfen tekrar giri_ yap1n.');
                    setTimeout(() => window.location.href = 'login.html', 2000);
                    return;
                }
                throw new Error(`HTTP ${response.status}: Kategoriler y�klenemedi`);
            }

            const categories = await response.json();
            CategoryManagement.renderCategories(categories);
            Logger.log(`Loaded ${categories.length} categories`);
        } catch (err) {
            Logger.error('Kategori y�kleme hatas1:', err);
            UIHelpers.showError(err.message || 'Kategoriler y�klenirken hata olu_tu.');
        }
    },

    /**
     * Render categories in the grid
     * @param {Array} categories - Array of category objects
     */
    renderCategories: (categories) => {
        const container = document.querySelector('#categories .grid');
        if (!container) {
            Logger.error('categories grid container not found');
            return;
        }

        container.innerHTML = '';

        if (!categories || !categories.length) {
            container.innerHTML = '<div class="col-span-full text-center py-8 text-slate-500">Hen�z kategori eklenmemi_.</div>';
            lucide.createIcons();
            return;
        }

        const colors = [
            { bg: 'bg-blue-100', text: 'text-blue-700' },
            { bg: 'bg-purple-100', text: 'text-purple-700' },
            { bg: 'bg-emerald-100', text: 'text-emerald-700' },
            { bg: 'bg-amber-100', text: 'text-amber-700' },
            { bg: 'bg-rose-100', text: 'text-rose-700' },
            { bg: 'bg-cyan-100', text: 'text-cyan-700' }
        ];

        const icons = ['calculator', 'file-text', 'book-open', 'chart-bar', 'layers', 'folder'];

        categories.forEach((category, index) => {
            const color = colors[index % colors.length];
            const icon = icons[index % icons.length];

            const card = document.createElement('div');
            card.className = 'group relative rounded-xl border border-slate-200 bg-white p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5';

            card.innerHTML = `
                <div class="flex items-start justify-between mb-3">
                    <div class="w-10 h-10 rounded-lg ${color.bg} ${color.text} flex items-center justify-center">
                        <i data-lucide="${icon}" class="w-5 h-5" style="stroke-width:2;"></i>
                    </div>
                </div>
                <h3 class="font-semibold text-slate-900 mb-1">${Formatters.escapeHtml(category.name)}</h3>
                ${category.description ? `<p class="text-xs text-slate-600 mb-2">${Formatters.escapeHtml(category.description)}</p>` : ''}
                <div class="flex items-center justify-between">
                    <p class="text-sm text-slate-500">${category.problemCount || 0} problem</p>
                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="CategoryManagement.editCategory(${category.id})" class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                            <i data-lucide="edit" class="w-4 h-4" style="stroke-width:2;"></i>
                        </button>
                        <button onclick="CategoryManagement.deleteCategory(${category.id}, '${Formatters.escapeHtml(category.name)}')" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                            <i data-lucide="trash-2" class="w-4 h-4" style="stroke-width:2;"></i>
                        </button>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });

        lucide.createIcons();
    },

    /**
     * Show create category modal
     */
    showCreateModal: () => {
        UIHelpers.setValue('cat-id', '');
        UIHelpers.setValue('cat-name', '');
        UIHelpers.setValue('cat-description', '');
        UIHelpers.setValue('cat-order', '');

        const modalTitle = document.getElementById('categoryModalTitle');
        if (modalTitle) modalTitle.textContent = 'Yeni Kategori';

        const modal = document.getElementById('categoryModal');
        if (modal) modal.classList.remove('hidden');
    },

    /**
     * Hide category modal
     */
    hideModal: () => {
        const modal = document.getElementById('categoryModal');
        if (modal) modal.classList.add('hidden');
    },

    /**
     * Edit category - loads category data and shows edit modal
     * @param {number} id - Category ID
     * @returns {Promise<void>}
     */
    editCategory: async (id) => {
        try {
            const token = StorageUtil.get('token');
            const response = await fetch(`${CategoryManagement.API_CATEGORIES}/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Kategori bulunamad1');

            const category = await response.json();

            UIHelpers.setValue('cat-id', category.id);
            UIHelpers.setValue('cat-name', category.name);
            UIHelpers.setValue('cat-description', category.description || '');
            UIHelpers.setValue('cat-order', category.displayOrder || '');

            const modalTitle = document.getElementById('categoryModalTitle');
            if (modalTitle) modalTitle.textContent = 'Kategori D�zenle';

            const modal = document.getElementById('categoryModal');
            if (modal) modal.classList.remove('hidden');

            Logger.log(`Editing category: ${id}`);
        } catch (err) {
            Logger.error('Kategori d�zenleme hatas1:', err);
            UIHelpers.showError(err.message || 'Kategori y�klenirken hata olu_tu.');
        }
    },

    /**
     * Delete category with confirmation
     * @param {number} id - Category ID
     * @param {string} name - Category name
     * @returns {Promise<void>}
     */
    deleteCategory: async (id, name) => {
        UIHelpers.showConfirm(`"${name}" kategorisini silmek istediinize emin misiniz?\n\nBu kategoriye bal1 problemler varsa kategori silinemez.`, async () => {
            try {
            const token = StorageUtil.get('token');
            const response = await fetch(`${CategoryManagement.API_CATEGORIES}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Kategori silinemedi');
            }

            UIHelpers.showSuccess('Kategori başarıyla silindi.');
            setTimeout(() => {
                CategoryManagement.loadCategories();
            }, 1500);
            Logger.log(`Category deleted: ${id}`);
        } catch (err) {
            Logger.error('Kategori silme hatası:', err);
            UIHelpers.showError(err.message || 'Kategori silinirken hata oluştu.');
            }
        });
    },

    /**
     * Save category (create or update)
     * @param {Event} event - Form submit event
     * @returns {Promise<void>}
     */
    saveCategory: async (event) => {
        event.preventDefault();
        try {
            const id = UIHelpers.getValue('cat-id');
            const name = UIHelpers.getValue('cat-name').trim();
            const description = UIHelpers.getValue('cat-description').trim();
            const displayOrder = UIHelpers.getValue('cat-order').trim();

            if (!name) {
                UIHelpers.showError('Kategori ad1 zorunludur.');
                return;
            }

            const category = {
                name,
                description: description || null,
                displayOrder: displayOrder ? parseInt(displayOrder) : null
            };

            const token = StorageUtil.get('token');
            const url = id ? `${CategoryManagement.API_CATEGORIES}/${id}` : CategoryManagement.API_CATEGORIES;
            const method = id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(category)
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Kategori kaydedilemedi');
            }

            UIHelpers.showSuccess(id ? 'Kategori ba_ar1yla g�ncellendi.' : 'Kategori ba_ar1yla olu_turuldu.');

            CategoryManagement.hideModal();

            setTimeout(() => {
                CategoryManagement.loadCategories();
                // Reload category dropdowns in problem forms
                if (typeof ProblemManagement !== 'undefined' && ProblemManagement.loadCategories) {
                    ProblemManagement.loadCategories();
                }
            }, 1500);

            Logger.log(`Category ${id ? 'updated' : 'created'} successfully`);
        } catch (err) {
            Logger.error('Kategori kaydetme hatas1:', err);
            UIHelpers.showError(err.message || 'Kategori kaydedilirken hata olu_tu.');
        }
    },

    /**
     * Initialize category management module
     * Sets up event listeners and handlers
     */
    initialize: () => {
        // New category button
        const newCategoryBtn = document.getElementById('newCategoryBtn');
        if (newCategoryBtn) {
            newCategoryBtn.addEventListener('click', CategoryManagement.showCreateModal);
        }

        // Category form
        const categoryForm = document.getElementById('categoryForm');
        if (categoryForm) {
            categoryForm.addEventListener('submit', CategoryManagement.saveCategory);
        }

        // Cancel button
        const cancelBtn = document.getElementById('cat-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', CategoryManagement.hideModal);
        }

        // Close modal on backdrop click
        const modal = document.getElementById('categoryModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    CategoryManagement.hideModal();
                }
            });
        }

        Logger.log('Category Management module initialized');
    }
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CategoryManagement;
}

