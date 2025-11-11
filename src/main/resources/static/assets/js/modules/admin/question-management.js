/**
 * Question Management Module
 *
 * Manages quiz question and option CRUD operations for the admin panel.
 * Includes question creation, editing, deletion, option management, and ordering.
 *
 * Dependencies: Logger, StorageUtil, Formatters, UIHelpers, APIService
 *
 * @module question-management
 */

const QuestionManagement = {
    // State variables
    editingQuestionId: null,
    selectedQuizId: null,
    optionCounter: 0,
    selectedFile: null,
    currentQuestionIndex: 0,
    currentView: 'single', // 'single' or 'all' 

    /**
     * Load quiz questions for selected quiz
     * @returns {Promise<void>}
     */
    loadQuizQuestions: async () => {
        const quizSelect = document.getElementById('quizSelect');
        const quizId = quizSelect?.value;
        QuestionManagement.selectedQuizId = quizId;

        const questionsContainer = document.getElementById('questionsContainer');

        if (!quizId) {
            if (questionsContainer) questionsContainer.classList.add('hidden');
            return;
        }

        if (questionsContainer) questionsContainer.classList.remove('hidden');

        try {
            const response = await APIService.get(`/api/admin/quizzes/${quizId}`);
            const quiz = await response.json();
            const questions = quiz.questions || [];

            const questionsList = document.getElementById('questionsList');
            if (!questionsList) return;

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
                            <button onclick="QuestionManagement.editQuestion(${question.id})" class="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                                <i data-lucide="edit-2" class="w-4 h-4"></i>
                            </button>
                            <button onclick="QuestionManagement.deleteQuestion(${question.id})" class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
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
            Logger.log('Sorular yüklendi', { quizId, count: questions.length });
        } catch (error) {
            Logger.error('Sorular yüklenirken hata:', error);
            const questionsList = document.getElementById('questionsList');
            if (questionsList) {
                questionsList.innerHTML = `
                    <div class="text-center py-8">
                        <i data-lucide="alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-3"></i>
                        <p class="text-slate-600 mb-2">Quiz bilgileri yüklenemedi!</p>
                        <p class="text-xs text-slate-500">Lütfen önce "Tüm Quizler" sekmesinden bir quiz oluşturun.</p>
                    </div>
                `;
                lucide.createIcons();
            }
        }
    },

    /**
     * Show question modal
     * @param {number|null} questionId - Question ID for editing, null for creating
     */
    showQuestionModal: (questionId = null) => {
        QuestionManagement.editingQuestionId = questionId;
        const modal = document.getElementById('questionModal');
        const title = document.getElementById('questionModalTitle');

        if (!modal || !title) return;

        if (questionId) {
            title.textContent = 'Soru Düzenle';
        } else {
            title.textContent = 'Yeni Soru';
            const form = document.getElementById('questionForm');
            if (form) form.reset();

            const quizIdField = document.getElementById('questionQuizId');
            if (quizIdField) quizIdField.value = QuestionManagement.selectedQuizId;

            // Add 4 empty options
            const optionsContainer = document.getElementById('optionsContainer');
            if (optionsContainer) {
                optionsContainer.innerHTML = '';
                QuestionManagement.optionCounter = 0;
                for (let i = 0; i < 4; i++) {
                    QuestionManagement.addOption();
                }
            }
        }

        modal.classList.remove('hidden');
        lucide.createIcons();
    },

    /**
     * Close question modal
     */
    closeQuestionModal: () => {
        const modal = document.getElementById('questionModal');
        if (modal) modal.classList.add('hidden');

        QuestionManagement.editingQuestionId = null;

        const form = document.getElementById('questionForm');
        if (form) form.reset();
    },

    /**
     * Add an option input row
     */
    addOption: () => {
        const container = document.getElementById('optionsContainer');
        if (!container) return;

        const optionId = QuestionManagement.optionCounter++;
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
            <button type="button" onclick="QuestionManagement.removeOption(${optionId})" class="p-2 text-slate-400 hover:text-red-600">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
            ` : ''}
        `;

        container.appendChild(optionDiv);
        lucide.createIcons();
    },

    /**
     * Remove an option input row
     * @param {number} optionId - Option ID to remove
     */
    removeOption: (optionId) => {
        const optionDiv = document.getElementById(`option-${optionId}`);
        if (optionDiv) optionDiv.remove();

        // Update option letters
        const container = document.getElementById('optionsContainer');
        if (!container) return;

        Array.from(container.children).forEach((child, idx) => {
            const letter = child.querySelector('span');
            if (letter) letter.textContent = String.fromCharCode(65 + idx);
        });
    },

    /**
     * Save question (create or update)
     * @param {Event} event - Form submit event
     * @returns {Promise<void>}
     */
    saveQuestion: async (event) => {
        event.preventDefault();

        // Collect options
        const optionElements = document.querySelectorAll('[data-option-text]');
        const options = Array.from(optionElements).map((elem, idx) => {
            const container = elem.closest('[id^="option-"]');
            const isCorrectInput = container?.querySelector('[data-option-correct]');
            const isCorrect = isCorrectInput ? isCorrectInput.checked : false;
            return {
                optionText: elem.value,
                isCorrect: isCorrect,
                optionOrder: idx + 1
            };
        });

        // Check if at least one option is correct
        if (!options.some(opt => opt.isCorrect)) {
            UIHelpers.showError('En az bir doğru şık seçmelisiniz!');
            return;
        }

        const data = {
            quizId: document.getElementById('questionQuizId')?.value,
            questionText: document.getElementById('questionText')?.value,
            points: parseInt(document.getElementById('questionPoints')?.value),
            questionOrder: document.getElementById('questionOrder')?.value || null,
            options: options
        };

        try {
            let response;
            if (QuestionManagement.editingQuestionId) {
                response = await APIService.put(`/api/admin/quizzes/questions/${QuestionManagement.editingQuestionId}`, data);
            } else {
                response = await APIService.post('/api/admin/quizzes/questions', data);
            }

            if (response.ok) {
                UIHelpers.showSuccess(QuestionManagement.editingQuestionId ? 'Soru güncellendi!' : 'Soru oluşturuldu!');
                QuestionManagement.closeQuestionModal();
                await QuestionManagement.loadQuizQuestions();
                Logger.log(QuestionManagement.editingQuestionId ? 'Soru güncellendi' : 'Soru oluşturuldu', data);
            } else {
                const error = await response.json();
                UIHelpers.showError('Hata: ' + (error.message || 'Soru kaydedilemedi!'));
            }
        } catch (error) {
            Logger.error('Soru kaydetme hatası:', error);
            UIHelpers.showError('Bir hata oluştu!');
        }
    },

    /**
     * Edit question - load data into modal
     * @param {number} id - Question ID
     * @returns {Promise<void>}
     */
    editQuestion: async (id) => {
        try {
            const response = await APIService.get(`/api/admin/quizzes/${QuestionManagement.selectedQuizId}`);
            const quiz = await response.json();
            const question = quiz.questions.find(q => q.id === id);

            if (!question) {
                UIHelpers.showError('Soru bulunamadı!');
                return;
            }

            const fields = {
                'questionId': question.id,
                'questionQuizId': question.quizId,
                'questionText': question.questionText,
                'questionPoints': question.points,
                'questionOrder': question.questionOrder || ''
            };

            Object.entries(fields).forEach(([fieldId, value]) => {
                const element = document.getElementById(fieldId);
                if (element) element.value = value;
            });

            // Load options
            const container = document.getElementById('optionsContainer');
            if (container) {
                container.innerHTML = '';
                QuestionManagement.optionCounter = 0;

                question.options.forEach((option, idx) => {
                    QuestionManagement.addOption();
                    const optionDiv = container.children[idx];
                    if (optionDiv) {
                        const textInput = optionDiv.querySelector('[data-option-text]');
                        if (textInput) textInput.value = option.optionText;

                        if (option.isCorrect) {
                            const correctInput = optionDiv.querySelector('[data-option-correct]');
                            if (correctInput) correctInput.checked = true;
                        }
                    }
                });
            }

            QuestionManagement.showQuestionModal(id);
            Logger.log('Soru düzenleme modu', { id });
        } catch (error) {
            Logger.error('Soru yükleme hatası:', error);
            UIHelpers.showError('Soru yüklenemedi!');
        }
    },

    /**
     * Delete question
     * @param {number} id - Question ID
     * @returns {Promise<void>}
     */
    deleteQuestion: async (id) => {
        UIHelpers.showConfirm('Bu soruyu silmek istediğinizden emin misiniz?', async () => {
            try {
                const response = await APIService.delete(`/api/admin/quizzes/questions/${id}`);
                if (response.ok) {
                    UIHelpers.showSuccess('Soru silindi!');
                    await QuestionManagement.loadQuizQuestions();
                    Logger.log('Soru silindi', { id });
                } else {
                    UIHelpers.showError('Soru silinemedi!');
                }
            } catch (error) {
                Logger.error('Soru silme hatası:', error);
                UIHelpers.showError('Bir hata oluştu!');
            }
        });
    },

    /**
     * Initialize question management module
     */
    initialize: () => {
        Logger.log('Question Management modülü başlatıldı');

        // Set up quiz select change listener
        const quizSelect = document.getElementById('quizSelect');
        if (quizSelect) {
            quizSelect.addEventListener('change', QuestionManagement.loadQuizQuestions);
        }
    },

    /**
     * Show bulk import modal
     */
    showBulkImportModal: () => {
        if (!QuestionManagement.selectedQuizId) {
            UIHelpers.showError('Lütfen önce bir quiz seçin!');
            return;
        }

        const modal = document.getElementById('bulkQuestionImportModal');
        if (modal) {
            modal.classList.remove('hidden');

            // Reset form
            const fileInput = document.getElementById('bulkQuestionImportFile');
            if (fileInput) fileInput.value = '';

            const preview = document.getElementById('bulkQuestionImportPreview');
            if (preview) preview.classList.add('hidden');

            const results = document.getElementById('bulkQuestionImportResults');
            if (results) results.classList.add('hidden');

            // Hide error details
            const errorDetails = document.getElementById('questionErrorDetails');
            if (errorDetails) errorDetails.classList.add('hidden');

            // Reset navigation
            QuestionManagement.currentQuestionIndex = 0;

            // Hide summary card, navigation and counter initially
            const summaryCard = document.getElementById('questionSummaryCard');
            if (summaryCard) summaryCard.classList.add('hidden');

            // Hide navigation, counter, and toggle buttons initially
            const navFooter = document.getElementById('questionNavigation');
            const counter = document.getElementById('questionCounterContainer');
            const toggleButtons = document.getElementById('viewToggleButtons');
            if (toggleButtons) toggleButtons.classList.add('hidden');
            const fileSection = document.querySelectorAll('#bulkQuestionImportModal .space-y-4 > div');

            if (navFooter) navFooter.classList.add('hidden');
            if (counter) counter.classList.add('hidden');

            // Show file upload sections, hide preview
            fileSection.forEach((section, idx) => {
                if (idx < 3) section.classList.remove('hidden'); // Instructions, Download, Upload
            });

            lucide.createIcons();
        }
    },

    /**
     * Close bulk import modal
     */
    closeBulkImportModal: () => {
        const modal = document.getElementById('bulkQuestionImportModal');
        if (modal) modal.classList.add('hidden');
        QuestionManagement.selectedFile = null;
    },

    /**
     * Handle file selection for bulk import
     * @param {Event} event - File input change event
     */
    handleFileSelect: (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                QuestionManagement.selectedFile = jsonData;

                // Show preview as cards
                const preview = document.getElementById('bulkQuestionImportPreview');
                const previewContent = document.getElementById('bulkQuestionImportPreviewContent');
                if (preview && previewContent && jsonData.questions) {
                    previewContent.innerHTML = `
                        <div class="text-sm font-medium text-slate-900 mb-3">
                            Toplam ${jsonData.questions.length} soru yüklenecek:
                        </div>
                        <div class="space-y-3">
                            ${jsonData.questions.map((question, idx) => `
                                <div class="border border-slate-200 rounded-lg p-3 bg-white">
                                    <div class="flex items-start gap-2 mb-2">
                                        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-medium flex-shrink-0">
                                            ${idx + 1}
                                        </span>
                                        <div class="flex-1">
                                            <p class="text-sm font-medium text-slate-900">${question.questionText}</p>
                                            <span class="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded">
                                                ${question.points || 10} puan
                                            </span>
                                        </div>
                                    </div>
                                    <div class="space-y-1.5 ml-8">
                                        ${question.options?.map((option, optIdx) => `
                                            <div class="flex items-center gap-2 text-xs ${option.isCorrect ? 'text-green-700 font-medium' : 'text-slate-600'}">
                                                <span class="w-5 h-5 rounded-full border ${option.isCorrect ? 'bg-green-100 border-green-500' : 'border-slate-300'} flex items-center justify-center text-xs">
                                                    ${String.fromCharCode(65 + optIdx)}
                                                </span>
                                                <span class="flex-1">${option.optionText}</span>
                                                ${option.isCorrect ? '<i data-lucide="check" class="w-3.5 h-3.5"></i>' : ''}
                                            </div>
                                        `).join('') || '<p class="text-xs text-red-600">Şık bulunamadı!</p>'}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                    preview.classList.remove('hidden');

                    // Re-initialize lucide icons
                    setTimeout(() => lucide.createIcons(), 100);
                }

                Logger.log('Dosya yüklendi', { questions: jsonData.questions?.length || 0 });

                // Show summary card
                QuestionManagement.showSummaryCard();
            } catch (error) {
                Logger.error('JSON parse hatası:', error);
                UIHelpers.showError('Geçersiz JSON dosyası!');

                const preview = document.getElementById('bulkQuestionImportPreview');
                if (preview) preview.classList.add('hidden');

                // Preview will be hidden on error
            }
        };
        reader.readAsText(file);
    },

    /**
     * Handle drag over event
     * @param {DragEvent} event - Drag event
     */
    handleDragOver: (event) => {
        event.preventDefault();
        event.stopPropagation();
        const zone = document.getElementById('dragDropZone');
        if (zone) {
            zone.classList.add('border-slate-400', 'bg-slate-100');
        }
    },

    /**
     * Handle drag leave event
     * @param {DragEvent} event - Drag event
     */
    handleDragLeave: (event) => {
        event.preventDefault();
        event.stopPropagation();
        const zone = document.getElementById('dragDropZone');
        if (zone) {
            zone.classList.remove('border-slate-400', 'bg-slate-100');
        }
    },

    /**
     * Handle file drop event
     * @param {DragEvent} event - Drop event
     */
    handleDrop: (event) => {
        event.preventDefault();
        event.stopPropagation();

        const zone = document.getElementById('dragDropZone');
        if (zone) {
            zone.classList.remove('border-slate-400', 'bg-slate-100');
        }

        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        if (!file.name.endsWith('.json')) {
            UIHelpers.showError('Sadece .json dosyaları kabul edilir!');
            return;
        }

        // Set file to input and trigger handleFileSelect
        const fileInput = document.getElementById('bulkQuestionImportFile');
        if (fileInput) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;

            // Trigger file select handler
            QuestionManagement.handleFileSelect({ target: fileInput });
        }
    },

    /**
     * Show summary card with file statistics
     */
    showSummaryCard: () => {
        if (!QuestionManagement.selectedFile || !QuestionManagement.selectedFile.questions) {
            return;
        }

        const questions = QuestionManagement.selectedFile.questions;

        // Calculate statistics
        const totalQuestions = questions.length;
        const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
        const avgPoints = totalQuestions > 0 ? Math.round(totalPoints / totalQuestions) : 0;

        // Update summary card
        const summaryCard = document.getElementById('questionSummaryCard');
        const countEl = document.getElementById('summaryQuestionCount');
        const totalEl = document.getElementById('summaryTotalPoints');
        const avgEl = document.getElementById('summaryAvgPoints');

        if (summaryCard && countEl && totalEl && avgEl) {
            countEl.textContent = totalQuestions;
            totalEl.textContent = totalPoints;
            avgEl.textContent = avgPoints;
            summaryCard.classList.remove('hidden');
        }

        lucide.createIcons();
    },

    /**
     * Direct import without preview
     */
    directImport: async () => {
        UIHelpers.showConfirm(
            'Önizleme yapmadan doğrudan içe aktarmak istediğinizden emin misiniz?',
            async () => {
                await QuestionManagement.importQuestions();
            },
            { confirmText: 'İçe Aktar' }
        );
    },

    /**
     * Start preview mode - show first question
     */
    startPreview: () => {
        if (!QuestionManagement.selectedFile || !QuestionManagement.selectedFile.questions) {
            UIHelpers.showError('Geçerli bir dosya yükleyin!');
            return;
        }

        // Hide upload sections and summary card
        const fileSection = document.querySelectorAll('#bulkQuestionImportModal .space-y-4 > div');
        fileSection.forEach((section, idx) => {
            if (idx < 3) section.classList.add('hidden'); // Hide Instructions, Download, Upload
        });

        const summaryCard = document.getElementById('questionSummaryCard');
        if (summaryCard) summaryCard.classList.add('hidden');

        // Show preview, navigation, and toggle buttons
        const preview = document.getElementById('bulkQuestionImportPreview');
        const navFooter = document.getElementById('questionNavigation');
        const counter = document.getElementById('questionCounterContainer');
        const toggleButtons = document.getElementById('viewToggleButtons');

        if (preview) preview.classList.remove('hidden');
        if (navFooter) navFooter.classList.remove('hidden');
        if (counter) counter.classList.remove('hidden');
        if (toggleButtons) toggleButtons.classList.remove('hidden');

        // Reset to single view
        QuestionManagement.currentView = 'single';
        QuestionManagement.currentQuestionIndex = 0;
        QuestionManagement.showQuestion(0);

        lucide.createIcons();
    },

    /**
     * Switch between single and all questions view
     * @param {string} view - 'single' or 'all'
     */
    switchView: (view) => {
        QuestionManagement.currentView = view;

        const singleBtn = document.getElementById('singleViewBtn');
        const allBtn = document.getElementById('allViewBtn');
        const navFooter = document.getElementById('questionNavigation');

        // Update button states
        if (singleBtn && allBtn) {
            if (view === 'single') {
                singleBtn.classList.add('bg-slate-800', 'text-white');
                singleBtn.classList.remove('bg-white', 'text-slate-700');
                allBtn.classList.remove('bg-slate-800', 'text-white');
                allBtn.classList.add('bg-white', 'text-slate-700');
            } else {
                allBtn.classList.add('bg-slate-800', 'text-white');
                allBtn.classList.remove('bg-white', 'text-slate-700');
                singleBtn.classList.remove('bg-slate-800', 'text-white');
                singleBtn.classList.add('bg-white', 'text-slate-700');
            }
        }

        // Show/hide navigation based on view
        if (navFooter) {
            if (view === 'single') {
                navFooter.classList.remove('hidden');
            } else {
                navFooter.classList.add('hidden');
            }
        }

        // Update display
        if (view === 'single') {
            QuestionManagement.showQuestion(QuestionManagement.currentQuestionIndex);
        } else {
            QuestionManagement.showAllQuestions();
        }
    },

    /**
     * Show all questions in a list view
     */
    showAllQuestions: () => {
        const questions = QuestionManagement.selectedFile?.questions || [];
        if (questions.length === 0) return;

        const previewContent = document.getElementById('bulkQuestionImportPreviewContent');
        if (!previewContent) return;

        previewContent.innerHTML = `
            <div class="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                ${questions.map((question, idx) => `
                    <div class="border border-slate-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
                        <div class="flex items-start gap-3 mb-3">
                            <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 text-white text-sm font-medium flex-shrink-0">
                                ${idx + 1}
                            </span>
                            <div class="flex-1">
                                <p class="text-sm font-semibold text-slate-900 mb-1">${question.questionText}</p>
                                <span class="inline-block px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded">
                                    ${question.points || 10} puan
                                </span>
                            </div>
                        </div>
                        <div class="space-y-1.5 ml-10">
                            ${question.options?.map((option, optIdx) => `
                                <div class="flex items-center gap-2 text-xs ${option.isCorrect ? 'text-green-700 font-medium' : 'text-slate-600'}">
                                    <span class="w-5 h-5 rounded-full border ${option.isCorrect ? 'bg-green-100 border-green-500' : 'border-slate-300'} flex items-center justify-center text-xs">
                                        ${String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span class="flex-1">${option.optionText}</span>
                                    ${option.isCorrect ? '<i data-lucide="check" class="w-3.5 h-3.5"></i>' : ''}
                                </div>
                            `).join('') || '<p class="text-xs text-red-600">Şık bulunamadı!</p>'}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="mt-4 pt-4 border-t border-slate-200">
                <button onclick="QuestionManagement.importQuestions()" class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium">
                    <i data-lucide="upload" class="w-4 h-4"></i>
                    Tümünü İçe Aktar
                </button>
            </div>
        `;

        setTimeout(() => lucide.createIcons(), 50);
    },

    /**
     * Toggle question dropdown menu
     */
    toggleQuestionDropdown: () => {
        const dropdown = document.getElementById('questionDropdown');
        if (!dropdown) return;

        const isHidden = dropdown.classList.contains('hidden');

        if (isHidden) {
            QuestionManagement.populateQuestionDropdown();
            dropdown.classList.remove('hidden');

            // Close dropdown when clicking outside
            setTimeout(() => {
                document.addEventListener('click', QuestionManagement.closeQuestionDropdown);
            }, 0);
        } else {
            dropdown.classList.add('hidden');
            document.removeEventListener('click', QuestionManagement.closeQuestionDropdown);
        }
    },

    /**
     * Close dropdown when clicking outside
     * @param {Event} event - Click event
     */
    closeQuestionDropdown: (event) => {
        const dropdown = document.getElementById('questionDropdown');
        const counter = document.getElementById('questionCounterContainer');

        if (!dropdown || !counter) return;

        if (!dropdown.contains(event.target) && !counter.contains(event.target)) {
            dropdown.classList.add('hidden');
            document.removeEventListener('click', QuestionManagement.closeQuestionDropdown);
        }
    },

    /**
     * Populate question dropdown with list
     */
    populateQuestionDropdown: () => {
        const questions = QuestionManagement.selectedFile?.questions || [];
        const dropdown = document.getElementById('questionDropdown');
        if (!dropdown) return;

        dropdown.innerHTML = questions.map((question, idx) => `
            <button onclick="QuestionManagement.jumpToQuestion(${idx}); event.stopPropagation();"
                    class="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 ${idx === QuestionManagement.currentQuestionIndex ? 'bg-slate-100 font-medium' : ''}">
                <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-6 h-6 rounded-full ${idx === QuestionManagement.currentQuestionIndex ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'} text-xs font-medium flex-shrink-0">
                        ${idx + 1}
                    </span>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm text-slate-900 truncate">${question.questionText}</p>
                        <span class="text-xs text-slate-500">${question.points || 10} puan</span>
                    </div>
                </div>
            </button>
        `).join('');

        lucide.createIcons();
    },

    /**
     * Jump to specific question from dropdown
     * @param {number} index - Question index
     */
    jumpToQuestion: (index) => {
        const dropdown = document.getElementById('questionDropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
            document.removeEventListener('click', QuestionManagement.closeQuestionDropdown);
        }

        QuestionManagement.showQuestion(index);
    },

    /**
     * Update question points
     * @param {number} index - Question index
     * @param {number} points - New points value
     */
    updateQuestionPoints: (index, points) => {
        if (!QuestionManagement.selectedFile || !QuestionManagement.selectedFile.questions) return;

        const pointsValue = parseInt(points);
        if (pointsValue < 1 || pointsValue > 100) {
            UIHelpers.showError('Puan 1-100 arasında olmalıdır!');
            return;
        }

        QuestionManagement.selectedFile.questions[index].points = pointsValue;
        Logger.log('Soru puanı güncellendi', { index, points: pointsValue });

        // Update summary if visible
        QuestionManagement.showSummaryCard();
    },

    /**
     * Set correct option for a question
     * @param {number} questionIndex - Question index
     * @param {number} optionIndex - Option index to mark as correct
     */
    setCorrectOption: (questionIndex, optionIndex) => {
        if (!QuestionManagement.selectedFile || !QuestionManagement.selectedFile.questions) return;

        const question = QuestionManagement.selectedFile.questions[questionIndex];
        if (!question || !question.options) return;

        // Unmark all options
        question.options.forEach(opt => opt.isCorrect = false);

        // Mark selected option as correct
        question.options[optionIndex].isCorrect = true;

        Logger.log('Doğru şık güncellendi', { questionIndex, optionIndex });

        // Refresh display
        QuestionManagement.showQuestion(questionIndex);
    },

    /**
     * Delete question from preview
     * @param {number} index - Question index
     */
    deleteQuestionFromPreview: (index) => {
        UIHelpers.showConfirm('Bu soruyu içe aktarma listesinden çıkarmak istediğinizden emin misiniz?', () => {
            if (!QuestionManagement.selectedFile || !QuestionManagement.selectedFile.questions) return;

            const questions = QuestionManagement.selectedFile.questions;

            // Remove question
            questions.splice(index, 1);

            if (questions.length === 0) {
                UIHelpers.showError('Tüm sorular silindi! Lütfen yeni bir dosya yükleyin.');
                QuestionManagement.closeBulkImportModal();
                return;
            }

            Logger.log('Soru önizlemeden silindi', { index, remaining: questions.length });

            // Update summary
            QuestionManagement.showSummaryCard();

            // Adjust current index if needed
            if (index >= questions.length) {
                QuestionManagement.currentQuestionIndex = questions.length - 1;
            }

            // Refresh display
            if (QuestionManagement.currentView === 'single') {
                QuestionManagement.showQuestion(QuestionManagement.currentQuestionIndex);
            } else {
                QuestionManagement.showAllQuestions();
            }
        });
    },

    /**
     * Show specific question by index
     * @param {number} index - Question index
     */
    showQuestion: (index) => {
        const questions = QuestionManagement.selectedFile?.questions || [];
        if (index < 0 || index >= questions.length) return;

        QuestionManagement.currentQuestionIndex = index;
        const question = questions[index];

        // Update counter
        const counterText = document.getElementById('questionCounterText');
        if (counterText) {
            counterText.textContent = `Soru ${index + 1} / ${questions.length}`;
        }

        // Render question with edit controls
        const previewContent = document.getElementById('bulkQuestionImportPreviewContent');
        if (previewContent) {
            previewContent.innerHTML = `
                <div class="space-y-4">
                    <div class="flex items-start gap-3">
                        <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-white text-sm font-medium flex-shrink-0">
                            ${index + 1}
                        </span>
                        <div class="flex-1">
                            <p class="text-base font-semibold text-slate-900 mb-2">${question.questionText}</p>
                            <div class="flex items-center gap-2">
                                <input type="number" value="${question.points || 10}" min="1" max="100"
                                       onchange="QuestionManagement.updateQuestionPoints(${index}, this.value)"
                                       class="w-16 px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400">
                                <span class="text-xs text-slate-600">puan</span>
                            </div>
                        </div>
                        <button onclick="QuestionManagement.deleteQuestionFromPreview(${index})"
                                class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Soruyu Sil">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                    <div class="space-y-2 mt-4">
                        ${question.options?.map((option, optIdx) => `
                            <div onclick="QuestionManagement.setCorrectOption(${index}, ${optIdx})"
                                 class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${option.isCorrect ? 'bg-green-50 border-green-200 hover:bg-green-100' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}">
                                <div class="flex items-center gap-2">
                                    <span class="w-7 h-7 rounded-full border ${option.isCorrect ? 'bg-green-100 border-green-500 text-green-700' : 'border-slate-300 text-slate-600'} flex items-center justify-center text-sm font-medium flex-shrink-0">
                                        ${String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <div class="w-4 h-4 rounded-full border-2 ${option.isCorrect ? 'border-green-500 bg-green-500' : 'border-slate-300'} flex items-center justify-center">
                                        ${option.isCorrect ? '<div class="w-2 h-2 bg-white rounded-full"></div>' : ''}
                                    </div>
                                </div>
                                <span class="flex-1 text-sm ${option.isCorrect ? 'text-green-900 font-medium' : 'text-slate-700'}">${option.optionText}</span>
                                ${option.isCorrect ? '<i data-lucide="check-circle" class="w-5 h-5 text-green-600"></i>' : ''}
                            </div>
                        `).join('') || '<p class="text-sm text-red-600">Şık bulunamadı!</p>'}
                    </div>
                </div>
            `;
        }

        QuestionManagement.updateNavigationButtons();
        setTimeout(() => lucide.createIcons(), 50);
    },

    /**
     * Show next question
     */
    showNextQuestion: () => {
        const questions = QuestionManagement.selectedFile?.questions || [];
        const nextIndex = QuestionManagement.currentQuestionIndex + 1;

        if (nextIndex < questions.length) {
            QuestionManagement.showQuestion(nextIndex);
        }
    },

    /**
     * Show previous question
     */
    showPreviousQuestion: () => {
        const prevIndex = QuestionManagement.currentQuestionIndex - 1;

        if (prevIndex >= 0) {
            QuestionManagement.showQuestion(prevIndex);
        }
    },

    /**
     * Update navigation button states
     */
    updateNavigationButtons: () => {
        const questions = QuestionManagement.selectedFile?.questions || [];
        const currentIndex = QuestionManagement.currentQuestionIndex;

        const prevBtn = document.getElementById('prevQuestionBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');
        const nextBtnContent = document.getElementById('nextQuestionBtnContent');

        // Previous button
        if (prevBtn) {
            prevBtn.disabled = currentIndex === 0;
        }

        // Next button - last question shows "İçe Aktar" instead of "İlerle"
        if (nextBtn && nextBtnContent) {
            const isLastQuestion = currentIndex === questions.length - 1;

            if (isLastQuestion) {
                nextBtn.onclick = QuestionManagement.importQuestions;
                nextBtnContent.innerHTML = `
                    <i data-lucide="upload" class="w-4 h-4"></i>
                    İçe Aktar
                `;
            } else {
                nextBtn.onclick = QuestionManagement.showNextQuestion;
                nextBtnContent.innerHTML = `
                    İlerle
                    <i data-lucide="chevron-right" class="w-4 h-4"></i>
                `;
            }
            nextBtn.disabled = false;
        }

        setTimeout(() => lucide.createIcons(), 50);
    },

    /**
     * Import questions from JSON file
     * @returns {Promise<void>}
     */
    importQuestions: async () => {
        if (!QuestionManagement.selectedFile) {
            UIHelpers.showError('Lütfen bir dosya seçin!');
            return;
        }

        if (!QuestionManagement.selectedQuizId) {
            UIHelpers.showError('Lütfen bir quiz seçin!');
            return;
        }

        const importBtn = document.getElementById('importQuestionsBtn');
        if (importBtn) {
            importBtn.disabled = true;
            importBtn.textContent = 'İçe Aktarılıyor...';
        }

        try {
            // Override quizId with selected quiz
            const data = {
                ...QuestionManagement.selectedFile,
                quizId: parseInt(QuestionManagement.selectedQuizId)
            };

            const response = await APIService.post('/api/admin/quizzes/questions/bulk', data);

            if (response.ok) {
                const result = await response.json();

                // Extract counts from result
                const total = result.totalQuestions || data.questions?.length || 0;
                const successCount = result.successCount || 0;
                const failureCount = result.failureCount || 0;

                // Show results
                const resultsDiv = document.getElementById('bulkQuestionImportResults');
                const totalEl = document.getElementById('totalQuestions');
                const successEl = document.getElementById('successQuestionCount');
                const failureEl = document.getElementById('failureQuestionCount');

                if (resultsDiv && totalEl && successEl && failureEl) {
                    totalEl.textContent = total;
                    successEl.textContent = successCount;
                    failureEl.textContent = failureCount;
                    resultsDiv.classList.remove('hidden');

                    // Show errors if any
                    if (result.errors && result.errors.length > 0) {
                        const errorDetails = document.getElementById('questionErrorDetails');
                        const errorList = document.getElementById('questionErrorList');
                        if (errorDetails && errorList) {
                            errorList.innerHTML = result.errors.map(err =>
                                `<div class="text-xs text-red-600 bg-red-50 p-2 rounded">
                                    <strong>Soru ${err.questionIndex + 1 || '?'}:</strong> ${err.errorMessage || 'Bilinmeyen hata'}
                                </div>`
                            ).join('');
                            errorDetails.classList.remove('hidden');
                        }
                    }
                }

                if (successCount > 0) {
                    UIHelpers.showSuccess(`${successCount} soru başarıyla eklendi!`);
                    await QuestionManagement.loadQuizQuestions();
                }

                // Hide preview, navigation, toggle buttons; show results footer
                const preview = document.getElementById('bulkQuestionImportPreview');
                const navFooter = document.getElementById('questionNavigation');
                const resultsFooter = document.getElementById('resultsFooter');
                const counter = document.getElementById('questionCounterContainer');
                const toggleButtons = document.getElementById('viewToggleButtons');

                if (preview) preview.classList.add('hidden');
                if (navFooter) navFooter.classList.add('hidden');
                if (resultsFooter) resultsFooter.classList.remove('hidden');
                if (counter) counter.classList.add('hidden');
                if (toggleButtons) toggleButtons.classList.add('hidden');

                Logger.log('Toplu soru import tamamlandı', result);
            } else {
                const error = await response.json();
                UIHelpers.showError('Hata: ' + (error.message || 'İçe aktarma başarısız!'));
            }
        } catch (error) {
            Logger.error('Toplu import hatası:', error);
            UIHelpers.showError('Bir hata oluştu!');
        } finally {
            if (importBtn) {
                importBtn.disabled = false;
                importBtn.textContent = 'İçe Aktar';
            }
        }
    },

    /**
     * Close modal after import and refresh list
     */
    closeAfterImport: () => {
        QuestionManagement.closeBulkImportModal();
        // List already refreshed in importQuestions
    }
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuestionManagement;
}
