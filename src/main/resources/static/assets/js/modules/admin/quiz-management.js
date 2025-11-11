/**
 * Quiz Management Module
 *
 * Manages quiz and topic CRUD operations for the admin panel.
 * Includes quiz creation, editing, deletion, and topic management.
 *
 * Dependencies: Logger, StorageUtil, Formatters, UIHelpers, APIService
 *
 * @module quiz-management
 */

const QuizManagement = {
    // State variables
    adminQuizzes: [],
    adminTopics: [],
    currentEditingQuizId: null,
    editingTopicId: null,
    editingQuizId: null,

    /**
     * Load all quizzes from API
     * @returns {Promise<void>}
     */
    loadAdminQuizzes: async () => {
        try {
            const response = await APIService.get('/api/admin/quizzes?page=0&size=50');
            const data = await response.json();
            QuizManagement.adminQuizzes = data.content || [];
            QuizManagement.renderAdminQuizzesTable();
            const totalElement = document.getElementById('admin-total-quizzes');
            if (totalElement) {
                totalElement.textContent = data.totalElements || 0;
            }
            Logger.log('Quizler yüklendi', { count: QuizManagement.adminQuizzes.length });
        } catch (error) {
            Logger.error('Quizler yüklenirken hata:', error);
            UIHelpers.showError('Quizler yüklenemedi!');
        }
    },

    /**
     * Load all topics from API (admin panel version)
     * @returns {Promise<void>}
     */
    loadAdminTopics: async () => {
        try {
            const response = await APIService.get('/api/admin/quizzes/topics');
            QuizManagement.adminTopics = await response.json();
            QuizManagement.renderAdminTopicsTable();
            const totalElement = document.getElementById('admin-total-topics');
            if (totalElement) {
                totalElement.textContent = QuizManagement.adminTopics.length;
            }
            Logger.log('Konular yüklendi', { count: QuizManagement.adminTopics.length });
        } catch (error) {
            Logger.error('Konular yüklenirken hata:', error);
            UIHelpers.showError('Konular yüklenemedi!');
        }
    },

    /**
     * Load topics for form dropdown
     * @returns {Promise<void>}
     */
    loadAdminTopicsForForm: async () => {
        try {
            const response = await APIService.get('/api/admin/quizzes/topics');
            QuizManagement.adminTopics = await response.json();
            const select = document.getElementById('admin-quiz-topic-id');
            if (!select) return;

            select.innerHTML = '<option value="">Konu Seçin</option>';
            QuizManagement.adminTopics.forEach(topic => {
                select.innerHTML += `<option value="${topic.id}">${Formatters.escapeHtml(topic.name)}</option>`;
            });
        } catch (error) {
            Logger.error('Konular yüklenirken hata:', error);
        }
    },

    /**
     * Render quizzes table in admin panel
     */
    renderAdminQuizzesTable: () => {
        const tbody = document.getElementById('admin-quizzes-table');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (!QuizManagement.adminQuizzes || QuizManagement.adminQuizzes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-slate-500">Henüz quiz eklenmemiş</td></tr>';
            return;
        }

        QuizManagement.adminQuizzes.forEach(quiz => {
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
                    <td class="px-6 py-3 text-sm font-medium text-slate-900">${Formatters.escapeHtml(quiz.title)}</td>
                    <td class="px-6 py-3 text-sm text-slate-700">${Formatters.escapeHtml(quiz.topic?.name || '-')}</td>
                    <td class="px-6 py-3">${difficultyBadges[quiz.difficulty] || '-'}</td>
                    <td class="px-6 py-3 text-sm text-slate-700">${quiz.questions?.length || 0}</td>
                    <td class="px-6 py-3">${statusBadge}</td>
                    <td class="px-6 py-3 text-right">
                        <button onclick="QuizManagement.editAdminQuiz(${quiz.id})" class="text-slate-600 hover:text-slate-900 mr-3">
                            <i data-lucide="edit-2" class="w-4 h-4"></i>
                        </button>
                        <button onclick="QuizManagement.deleteAdminQuiz(${quiz.id})" class="text-red-600 hover:text-red-700">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

        lucide.createIcons();
    },

    /**
     * Render topics table in admin panel
     */
    renderAdminTopicsTable: () => {
        const tbody = document.getElementById('admin-topics-table');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (!QuizManagement.adminTopics || QuizManagement.adminTopics.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-slate-500">Henüz konu eklenmemiş</td></tr>';
            return;
        }

        QuizManagement.adminTopics.forEach(topic => {
            const row = `
                <tr class="hover:bg-slate-50/60">
                    <td class="px-6 py-3 text-sm font-medium text-slate-900">${Formatters.escapeHtml(topic.name)}</td>
                    <td class="px-6 py-3 text-sm text-slate-700">${Formatters.escapeHtml(topic.description || '-')}</td>
                    <td class="px-6 py-3 text-sm text-slate-700">${topic.quizCount || 0}</td>
                    <td class="px-6 py-3 text-right">
                        <button onclick="QuizManagement.editAdminTopic(${topic.id})" class="text-slate-600 hover:text-slate-900 mr-3">
                            <i data-lucide="edit-2" class="w-4 h-4"></i>
                        </button>
                        <button onclick="QuizManagement.deleteAdminTopic(${topic.id})" class="text-red-600 hover:text-red-700">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

        lucide.createIcons();
    },

    /**
     * Reset quiz form to default state
     */
    resetAdminQuizForm: () => {
        QuizManagement.currentEditingQuizId = null;
        const form = document.getElementById('admin-quiz-form');
        if (form) form.reset();

        const idField = document.getElementById('admin-quiz-id');
        if (idField) idField.value = '';

        const activeField = document.getElementById('admin-quiz-is-active');
        if (activeField) activeField.checked = true;

        const passPercentageField = document.getElementById('admin-quiz-pass-percentage');
        if (passPercentageField) passPercentageField.value = 70;
    },

    /**
     * Edit quiz - load quiz data into form
     * @param {number} quizId - Quiz ID
     * @returns {Promise<void>}
     */
    editAdminQuiz: async (quizId) => {
        try {
            const response = await APIService.get(`/api/admin/quizzes/${quizId}`);
            const quiz = await response.json();

            QuizManagement.currentEditingQuizId = quizId;
            await QuizManagement.loadAdminTopicsForForm();

            const fields = {
                'admin-quiz-id': quiz.id,
                'admin-quiz-title': quiz.title,
                'admin-quiz-description': quiz.description || '',
                'admin-quiz-topic-id': quiz.topic?.id || '',
                'admin-quiz-difficulty': quiz.difficulty,
                'admin-quiz-time-limit': quiz.timeLimitMinutes || '',
                'admin-quiz-pass-percentage': quiz.passPercentage
            };

            Object.entries(fields).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) element.value = value;
            });

            const activeField = document.getElementById('admin-quiz-is-active');
            if (activeField) activeField.checked = quiz.isActive;

            // Show the add-quiz section
            if (typeof showSection === 'function') {
                showSection('add-quiz');
            }

            Logger.log('Quiz düzenleme modu', { quizId });
        } catch (error) {
            Logger.error('Quiz yüklenirken hata:', error);
            UIHelpers.showError('Quiz bilgileri yüklenemedi!');
        }
    },

    /**
     * Delete quiz
     * @param {number} quizId - Quiz ID
     * @returns {Promise<void>}
     */
    deleteAdminQuiz: async (quizId) => {
        UIHelpers.showConfirm('Bu quizi silmek istediğinizden emin misiniz?', async () => {
            try {
                await APIService.delete(`/api/admin/quizzes/${quizId}`);
                UIHelpers.showSuccess('Quiz başarıyla silindi!');
                await QuizManagement.loadAdminQuizzes();
                Logger.log('Quiz silindi', { quizId });
            } catch (error) {
                Logger.error('Quiz silinirken hata:', error);
                UIHelpers.showError('Quiz silinemedi!');
            }
        });
    },

    /**
     * Open topic modal for creation
     */
    openTopicModal: () => {
        const topicName = prompt('Konu adı:');
        if (!topicName) return;

        const topicDescription = prompt('Açıklama (opsiyonel):');

        QuizManagement.createAdminTopic({ name: topicName, description: topicDescription });
    },

    /**
     * Create new topic
     * @param {Object} topicData - Topic data
     * @param {string} topicData.name - Topic name
     * @param {string} [topicData.description] - Topic description
     * @returns {Promise<void>}
     */
    createAdminTopic: async (topicData) => {
        try {
            await APIService.post('/api/admin/quizzes/topics', topicData);
            UIHelpers.showSuccess('Konu başarıyla eklendi!');
            await QuizManagement.loadAdminTopics();
            Logger.log('Konu oluşturuldu', topicData);
        } catch (error) {
            Logger.error('Konu eklenirken hata:', error);
            UIHelpers.showError('Konu eklenemedi!');
        }
    },

    /**
     * Edit topic
     * @param {number} topicId - Topic ID
     * @returns {Promise<void>}
     */
    editAdminTopic: async (topicId) => {
        const topic = QuizManagement.adminTopics.find(t => t.id === topicId);
        if (!topic) return;

        const newName = prompt('Konu adı:', topic.name);
        if (!newName) return;

        const newDescription = prompt('Açıklama:', topic.description || '');

        try {
            await APIService.put(`/api/admin/quizzes/topics/${topicId}`, {
                name: newName,
                description: newDescription
            });
            UIHelpers.showSuccess('Konu başarıyla güncellendi!');
            await QuizManagement.loadAdminTopics();
            Logger.log('Konu güncellendi', { topicId });
        } catch (error) {
            Logger.error('Konu güncellenirken hata:', error);
            UIHelpers.showError('Konu güncellenemedi!');
        }
    },

    /**
     * Delete topic
     * @param {number} topicId - Topic ID
     * @returns {Promise<void>}
     */
    deleteAdminTopic: async (topicId) => {
        UIHelpers.showConfirm('Bu konuyu silmek istediğinizden emin misiniz?', async () => {
            try {
                await APIService.delete(`/api/admin/quizzes/topics/${topicId}`);
                UIHelpers.showSuccess('Konu başarıyla silindi!');
                await QuizManagement.loadAdminTopics();
                Logger.log('Konu silindi', { topicId });
            } catch (error) {
                Logger.error('Konu silinirken hata:', error);
                UIHelpers.showError('Konu silinemedi!');
            }
        });
    },

    // ==================== NEW QUIZ MANAGEMENT (from line 1701+) ====================

    /**
     * Load topics for display in topics list
     * @returns {Promise<void>}
     */
    loadTopics: async () => {
        try {
            const response = await APIService.get('/api/admin/quizzes/topics');
            const topics = await response.json();

            const topicsList = document.getElementById('topicsList');
            if (!topicsList) return;

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
                        <button onclick="QuizManagement.editTopic(${topic.id})" class="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                            <i data-lucide="edit-2" class="w-4 h-4"></i>
                        </button>
                        <button onclick="QuizManagement.deleteTopic(${topic.id})" class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            `).join('');

            lucide.createIcons();
            Logger.log('Konular listesi yüklendi', { count: topics.length });
        } catch (error) {
            Logger.error('Konular yüklenirken hata:', error);
            UIHelpers.showError('Konular yüklenemedi!');
        }
    },

    /**
     * Load topics for select dropdown
     * @returns {Promise<void>}
     */
    loadTopicsForSelect: async () => {
        try {
            const response = await APIService.get('/api/admin/quizzes/topics');
            const topics = await response.json();

            const select = document.getElementById('quizTopicId');
            if (!select) return;

            select.innerHTML = '<option value="">Konu seçin...</option>' +
                topics.map(topic => `<option value="${topic.id}">${topic.name}</option>`).join('');
        } catch (error) {
            Logger.error('Konular yüklenirken hata:', error);
        }
    },

    /**
     * Show topic modal
     * @param {number|null} topicId - Topic ID for editing, null for creating
     */
    showTopicModal: (topicId = null) => {
        QuizManagement.editingTopicId = topicId;
        const modal = document.getElementById('topicModal');
        const title = document.getElementById('topicModalTitle');

        if (!modal || !title) return;

        if (topicId) {
            title.textContent = 'Konu Düzenle';
        } else {
            title.textContent = 'Yeni Konu';
            const form = document.getElementById('topicForm');
            if (form) form.reset();
        }

        modal.classList.remove('hidden');
        lucide.createIcons();
    },

    /**
     * Close topic modal
     */
    closeTopicModal: () => {
        const modal = document.getElementById('topicModal');
        if (modal) modal.classList.add('hidden');

        QuizManagement.editingTopicId = null;

        const form = document.getElementById('topicForm');
        if (form) form.reset();
    },

    /**
     * Save topic (create or update)
     * @param {Event} event - Form submit event
     * @returns {Promise<void>}
     */
    saveTopic: async (event) => {
        event.preventDefault();

        const nameField = document.getElementById('topicName');
        const descriptionField = document.getElementById('topicDescription');

        if (!nameField) return;

        const data = {
            name: nameField.value,
            description: descriptionField ? descriptionField.value : ''
        };

        try {
            let response;
            if (QuizManagement.editingTopicId) {
                response = await APIService.put(`/api/admin/quizzes/topics/${QuizManagement.editingTopicId}`, data);
            } else {
                response = await APIService.post('/api/admin/quizzes/topics', data);
            }

            if (response.ok) {
                UIHelpers.showSuccess(QuizManagement.editingTopicId ? 'Konu güncellendi!' : 'Konu oluşturuldu!');
                QuizManagement.closeTopicModal();
                await QuizManagement.loadTopics();
                await QuizManagement.loadTopicsForSelect();
                Logger.log(QuizManagement.editingTopicId ? 'Konu güncellendi' : 'Konu oluşturuldu', data);
            } else {
                const error = await response.json();
                UIHelpers.showError('Hata: ' + (error.message || 'Konu kaydedilemedi!'));
            }
        } catch (error) {
            Logger.error('Konu kaydetme hatası:', error);
            UIHelpers.showError('Bir hata oluştu!');
        }
    },

    /**
     * Edit topic - load data into modal
     * @param {number} id - Topic ID
     * @returns {Promise<void>}
     */
    editTopic: async (id) => {
        try {
            const response = await APIService.get(`/api/admin/quizzes/topics/${id}`);
            const topic = await response.json();

            const idField = document.getElementById('topicId');
            const nameField = document.getElementById('topicName');
            const descriptionField = document.getElementById('topicDescription');

            if (idField) idField.value = topic.id;
            if (nameField) nameField.value = topic.name;
            if (descriptionField) descriptionField.value = topic.description || '';

            QuizManagement.showTopicModal(id);
            Logger.log('Konu düzenleme modu', { id });
        } catch (error) {
            Logger.error('Konu yükleme hatası:', error);
            UIHelpers.showError('Konu yüklenemedi!');
        }
    },

    /**
     * Delete topic
     * @param {number} id - Topic ID
     * @returns {Promise<void>}
     */
    deleteTopic: async (id) => {
        UIHelpers.showConfirm('Bu konuyu silmek istediğinizden emin misiniz?', async () => {
            try {
                const response = await APIService.delete(`/api/admin/quizzes/topics/${id}`);
                if (response.ok) {
                    UIHelpers.showSuccess('Konu silindi!');
                    await QuizManagement.loadTopics();
                    await QuizManagement.loadTopicsForSelect();
                    Logger.log('Konu silindi', { id });
                } else {
                    UIHelpers.showError('Konu silinemedi!');
                }
            } catch (error) {
                Logger.error('Konu silme hatası:', error);
                UIHelpers.showError('Bir hata oluştu!');
            }
        });
    },

    /**
     * Load quizzes for display
     * @returns {Promise<void>}
     */
    loadQuizzes: async () => {
        try {
            const response = await APIService.get('/api/admin/quizzes?page=0&size=50');
            const data = await response.json();
            const quizzes = data.content || [];

            const quizzesList = document.getElementById('quizzesList');
            if (!quizzesList) return;

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
                        <button onclick="QuizManagement.editQuiz(${quiz.id})" class="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                            <i data-lucide="edit-2" class="w-4 h-4"></i>
                        </button>
                        <button onclick="QuizManagement.deleteQuiz(${quiz.id})" class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            `).join('');

            lucide.createIcons();
            Logger.log('Quizler listesi yüklendi', { count: quizzes.length });
        } catch (error) {
            Logger.error('Quizler yüklenirken hata:', error);
            UIHelpers.showError('Quizler yüklenemedi!');
        }
    },

    /**
     * Load quizzes for select dropdown
     * @returns {Promise<void>}
     */
    loadQuizzesForSelect: async () => {
        try {
            const response = await APIService.get('/api/admin/quizzes/active');
            const quizzes = await response.json();

            const select = document.getElementById('quizSelect');
            if (!select) return;

            select.innerHTML = '<option value="">Quiz seçin...</option>' +
                quizzes.map(quiz => `<option value="${quiz.id}">${quiz.title}</option>`).join('');
        } catch (error) {
            Logger.error('Quizler yüklenirken hata:', error);
        }
    },

    /**
     * Show quiz modal
     * @param {number|null} quizId - Quiz ID for editing, null for creating
     */
    showQuizModal: (quizId = null) => {
        QuizManagement.editingQuizId = quizId;
        const modal = document.getElementById('quizModal');
        const title = document.getElementById('quizModalTitle');

        if (!modal || !title) return;

        if (quizId) {
            title.textContent = 'Quiz Düzenle';
        } else {
            title.textContent = 'Yeni Quiz';
            const form = document.getElementById('quizForm');
            if (form) form.reset();
            QuizManagement.loadTopicsForSelect();
        }

        modal.classList.remove('hidden');
        lucide.createIcons();
    },

    /**
     * Close quiz modal
     */
    closeQuizModal: () => {
        const modal = document.getElementById('quizModal');
        if (modal) modal.classList.add('hidden');

        QuizManagement.editingQuizId = null;

        const form = document.getElementById('quizForm');
        if (form) form.reset();
    },

    /**
     * Save quiz (create or update)
     * @param {Event} event - Form submit event
     * @returns {Promise<void>}
     */
    saveQuiz: async (event) => {
        event.preventDefault();

        const data = {
            title: document.getElementById('quizTitle')?.value,
            description: document.getElementById('quizDescription')?.value,
            topicId: document.getElementById('quizTopicId')?.value || null,
            difficulty: parseInt(document.getElementById('quizDifficulty')?.value),
            timeLimitMinutes: document.getElementById('quizTimeLimitMinutes')?.value || null,
            passPercentage: parseInt(document.getElementById('quizPassPercentage')?.value),
            isActive: document.getElementById('quizIsActive')?.checked
        };

        try {
            let response;
            if (QuizManagement.editingQuizId) {
                response = await APIService.put(`/api/admin/quizzes/${QuizManagement.editingQuizId}`, data);
            } else {
                response = await APIService.post('/api/admin/quizzes', data);
            }

            if (response.ok) {
                UIHelpers.showSuccess(QuizManagement.editingQuizId ? 'Quiz güncellendi!' : 'Quiz oluşturuldu!');
                QuizManagement.closeQuizModal();
                await QuizManagement.loadQuizzes();
                await QuizManagement.loadQuizzesForSelect();
                Logger.log(QuizManagement.editingQuizId ? 'Quiz güncellendi' : 'Quiz oluşturuldu', data);
            } else {
                const error = await response.json();
                UIHelpers.showError('Hata: ' + (error.message || 'Quiz kaydedilemedi!'));
            }
        } catch (error) {
            Logger.error('Quiz kaydetme hatası:', error);
            UIHelpers.showError('Bir hata oluştu!');
        }
    },

    /**
     * Edit quiz - load data into modal
     * @param {number} id - Quiz ID
     * @returns {Promise<void>}
     */
    editQuiz: async (id) => {
        try {
            const response = await APIService.get(`/api/admin/quizzes/${id}`);
            const quiz = await response.json();

            await QuizManagement.loadTopicsForSelect();

            const fields = {
                'quizId': quiz.id,
                'quizTitle': quiz.title,
                'quizDescription': quiz.description || '',
                'quizTopicId': quiz.topicId || '',
                'quizDifficulty': quiz.difficulty,
                'quizTimeLimitMinutes': quiz.timeLimitMinutes || '',
                'quizPassPercentage': quiz.passPercentage
            };

            Object.entries(fields).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) element.value = value;
            });

            const activeField = document.getElementById('quizIsActive');
            if (activeField) activeField.checked = quiz.isActive;

            QuizManagement.showQuizModal(id);
            Logger.log('Quiz düzenleme modu', { id });
        } catch (error) {
            Logger.error('Quiz yükleme hatası:', error);
            UIHelpers.showError('Quiz yüklenemedi!');
        }
    },

    /**
     * Delete quiz
     * @param {number} id - Quiz ID
     * @returns {Promise<void>}
     */
    deleteQuiz: async (id) => {
        UIHelpers.showConfirm('Bu quizi silmek istediğinizden emin misiniz?', async () => {
            try {
                const response = await APIService.delete(`/api/admin/quizzes/${id}`);
                if (response.ok) {
                    UIHelpers.showSuccess('Quiz silindi!');
                    await QuizManagement.loadQuizzes();
                    await QuizManagement.loadQuizzesForSelect();
                    Logger.log('Quiz silindi', { id });
                } else {
                    UIHelpers.showError('Quiz silinemedi!');
                }
            } catch (error) {
                Logger.error('Quiz silme hatası:', error);
                UIHelpers.showError('Bir hata oluştu!');
            }
        });
    },

    /**
     * Initialize quiz management module
     */
    initialize: () => {
        Logger.log('Quiz Management modülü başlatıldı');

        // Set up form submission handler if form exists
        const quizForm = document.getElementById('admin-quiz-form');
        if (quizForm) {
            quizForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const quizData = {
                    title: document.getElementById('admin-quiz-title')?.value,
                    description: document.getElementById('admin-quiz-description')?.value || null,
                    topicId: document.getElementById('admin-quiz-topic-id')?.value || null,
                    difficulty: parseInt(document.getElementById('admin-quiz-difficulty')?.value),
                    timeLimitMinutes: document.getElementById('admin-quiz-time-limit')?.value
                        ? parseInt(document.getElementById('admin-quiz-time-limit').value)
                        : null,
                    passPercentage: parseInt(document.getElementById('admin-quiz-pass-percentage')?.value),
                    isActive: document.getElementById('admin-quiz-is-active')?.checked
                };

                try {
                    if (QuizManagement.currentEditingQuizId) {
                        await APIService.put(`/api/admin/quizzes/${QuizManagement.currentEditingQuizId}`, quizData);
                        UIHelpers.showSuccess('Quiz başarıyla güncellendi!');
                    } else {
                        await APIService.post('/api/admin/quizzes', quizData);
                        UIHelpers.showSuccess('Quiz başarıyla eklendi!');
                    }

                    if (typeof showSection === 'function') {
                        showSection('all-quizzes');
                    }
                    Logger.log('Quiz kaydedildi', quizData);
                } catch (error) {
                    Logger.error('Quiz kaydedilirken hata:', error);
                    UIHelpers.showError('Quiz kaydedilemedi!');
                }
            });
        }
    }
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizManagement;
}
