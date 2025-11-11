/**
 * Study Card Builder - Block-based editor with Slash Commands
 * Notion-style block editor for study content
 */

const StudyCardBuilder = {
    // State
    currentStudyCard: null,
    currentSection: null,
    sections: [],
    blocks: [],

    /**
     * Initialize the builder
     */
    init: async function() {
        await this.loadStudyCards();
        this.attachEventListeners();
        Logger.log('Study Card Builder initialized');
    },

    /**
     * Attach event listeners
     */
    attachEventListeners: function() {
        // Study card selection
        const cardSelect = document.getElementById('studyCardSelect');
        if (cardSelect) {
            cardSelect.addEventListener('change', (e) => {
                this.selectStudyCard(parseInt(e.target.value));
            });
        }

        // Add section button
        const addSectionBtn = document.getElementById('addSectionBtn');
        if (addSectionBtn) {
            addSectionBtn.addEventListener('click', () => this.addSection());
        }

        // Delete section button
        const deleteSectionBtn = document.getElementById('deleteSectionBtn');
        if (deleteSectionBtn) {
            deleteSectionBtn.addEventListener('click', () => this.deleteSection());
        }

        // Add first block button
        const addFirstBlock = document.getElementById('addFirstBlock');
        if (addFirstBlock) {
            addFirstBlock.addEventListener('click', () => this.showBlockTypeModal());
        }

        // Save button
        const saveAllBtn = document.getElementById('saveAllBtn');
        if (saveAllBtn) {
            saveAllBtn.addEventListener('click', () => this.saveAll());
        }

        // Section title auto-save
        const sectionTitle = document.getElementById('sectionTitle');
        if (sectionTitle) {
            sectionTitle.addEventListener('blur', () => this.saveSectionTitle());
        }

        // Type selector modal
        const typeSelectModal = document.getElementById('typeSelectModal');
        const cancelTypeSelect = document.getElementById('cancelTypeSelect');
        if (cancelTypeSelect) {
            cancelTypeSelect.addEventListener('click', () => {
                typeSelectModal.classList.add('hidden');
                typeSelectModal.classList.remove('flex');
            });
        }

        // Type selector buttons
        document.querySelectorAll('.type-selector-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.addBlock(type);
                typeSelectModal.classList.add('hidden');
                typeSelectModal.classList.remove('flex');
            });
        });
    },

    /**
     * Load all study cards
     */
    loadStudyCards: async function() {
        try {
            const response = await APIService.get('/api/admin/study-cards');
            const cards = await response.json();

            const select = document.getElementById('studyCardSelect');
            if (select) {
                select.innerHTML = '<option value="">Kart seçin...</option>' +
                    cards.map(card => `<option value="${card.id}">${Formatters.escapeHtml(card.title)}</option>`).join('');
            }
        } catch (error) {
            Logger.error('Error loading study cards:', error);
            UIHelpers.showError('Kartlar yüklenemedi!');
        }
    },

    /**
     * Select a study card
     */
    selectStudyCard: async function(cardId) {
        if (!cardId) {
            this.currentStudyCard = null;
            this.hideEditor();
            return;
        }

        this.currentStudyCard = cardId;
        await this.loadSections();
        this.renderSectionTree();

        // Select first section if available
        if (this.sections.length > 0) {
            this.selectSection(this.sections[0]);
        } else {
            this.hideEditor();
        }
    },

    /**
     * Load sections for current card
     */
    loadSections: async function() {
        try {
            const response = await APIService.get(`/api/admin/study-cards/${this.currentStudyCard}/sections`);
            this.sections = await response.json();
            this.sections.sort((a, b) => a.displayOrder - b.displayOrder);
        } catch (error) {
            Logger.error('Error loading sections:', error);
            throw error;
        }
    },

    /**
     * Render section tree in sidebar
     */
    renderSectionTree: function() {
        const tree = document.getElementById('sectionTree');
        if (!tree) return;

        if (this.sections.length === 0) {
            tree.innerHTML = '<p class="text-sm text-gray-500 text-center py-4">Henüz bölüm yok</p>';
            return;
        }

        tree.innerHTML = this.sections.map((section, idx) => `
            <div class="section-item px-3 py-2 rounded-lg cursor-pointer ${this.currentSection?.id === section.id ? 'active' : ''}"
                 data-section-id="${section.id}">
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-900">${Formatters.escapeHtml(section.title)}</span>
                    <span class="text-xs text-gray-500">#${idx + 1}</span>
                </div>
            </div>
        `).join('');

        // Attach click handlers
        tree.querySelectorAll('.section-item').forEach(item => {
            item.addEventListener('click', () => {
                const sectionId = parseInt(item.dataset.sectionId);
                const section = this.sections.find(s => s.id === sectionId);
                if (section) this.selectSection(section);
            });
        });

        UIHelpers.refreshIcons();
    },

    /**
     * Select a section
     */
    selectSection: async function(section) {
        this.currentSection = section;
        this.renderSectionTree(); // Update active state
        await this.loadBlocks();
        this.showEditor();
        this.renderBlocks();
    },

    /**
     * Load blocks for current section
     */
    loadBlocks: async function() {
        try {
            const response = await APIService.get(`/api/admin/content-items/section/${this.currentSection.id}`);
            this.blocks = await response.json();
            this.blocks.sort((a, b) => a.displayOrder - b.displayOrder);
        } catch (error) {
            Logger.error('Error loading blocks:', error);
            this.blocks = [];
        }
    },

    /**
     * Show editor area
     */
    showEditor: function() {
        const emptyState = document.getElementById('emptyState');
        const editor = document.getElementById('contentEditor');
        if (emptyState) emptyState.classList.add('hidden');
        if (editor) editor.classList.remove('hidden');

        // Update section title
        const titleInput = document.getElementById('sectionTitle');
        if (titleInput && this.currentSection) {
            titleInput.value = this.currentSection.title;
        }
    },

    /**
     * Hide editor area
     */
    hideEditor: function() {
        const emptyState = document.getElementById('emptyState');
        const editor = document.getElementById('contentEditor');
        if (emptyState) emptyState.classList.remove('hidden');
        if (editor) editor.classList.add('hidden');
    },

    /**
     * Render blocks in editor
     */
    renderBlocks: function() {
        const container = document.getElementById('contentBlocks');
        const addFirstBlock = document.getElementById('addFirstBlock');

        if (!container) return;

        if (this.blocks.length === 0) {
            container.innerHTML = '';
            if (addFirstBlock) addFirstBlock.classList.remove('hidden');
            return;
        }

        if (addFirstBlock) addFirstBlock.classList.add('hidden');

        container.innerHTML = this.blocks.map((block, idx) =>
            this.renderBlock(block, idx)
        ).join('');

        // Initialize slash commands for TEXT blocks
        this.initializeTextBlocks();

        // Attach event handlers
        this.attachBlockEventHandlers();

        UIHelpers.refreshIcons();
    },

    /**
     * Render single block
     */
    renderBlock: function(block, index) {
        const blockId = `block-${block.id}`;

        return `
            <div class="block-wrapper" data-block-id="${block.id}" data-index="${index}">
                <div class="content-block bg-white rounded-lg border border-gray-200 p-4 relative group">
                    <!-- Block Controls -->
                    <div class="absolute -left-10 top-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="drag-handle p-1 hover:bg-gray-100 rounded" title="Sürükle">
                            <i data-lucide="grip-vertical" class="w-4 h-4 text-gray-400"></i>
                        </button>
                    </div>
                    <div class="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="delete-block p-1.5 hover:bg-red-50 rounded text-red-600 bg-white border border-gray-200 shadow-sm" title="Sil" data-block-id="${block.id}">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>

                    <!-- Block Content -->
                    ${this.renderBlockContent(block, blockId)}
                </div>

                <!-- Add Block Button (appears on hover) -->
                <div class="add-block-btn flex justify-center py-2">
                    <button class="add-block-between px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center gap-1"
                            data-after-index="${index}">
                        <i data-lucide="plus" class="w-3 h-3"></i>
                        <span>Ekle</span>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Render block content based on type
     */
    renderBlockContent: function(block, blockId) {
        switch(block.contentType) {
            case 'TEXT':
                return `
                    <div class="text-block">
                        <div contenteditable="true"
                             id="${blockId}"
                             class="prose max-w-none focus:outline-none min-h-[60px]"
                             data-block-id="${block.id}"
                             data-placeholder="'/' yazarak komutları görün veya yazmaya başlayın...">
                            ${block.textContent || '<p>İçerik yazın...</p>'}
                        </div>
                    </div>
                `;

            case 'PROBLEM':
                return `
                    <div class="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <i data-lucide="link" class="w-5 h-5 text-green-600 flex-shrink-0"></i>
                        <div class="flex-1">
                            <div class="text-sm font-medium text-gray-900">Problem Bağlantısı</div>
                            <div class="text-xs text-gray-600">Problem ID: ${block.relatedProblemId || 'Seçilmedi'}</div>
                        </div>
                    </div>
                `;

            case 'QUIZ':
                return `
                    <div class="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <i data-lucide="link-2" class="w-5 h-5 text-purple-600 flex-shrink-0"></i>
                        <div class="flex-1">
                            <div class="text-sm font-medium text-gray-900">Test Bağlantısı</div>
                            <div class="text-xs text-gray-600">Test ID: ${block.relatedQuizId || 'Seçilmedi'}</div>
                        </div>
                    </div>
                `;

            case 'STUDY_PROBLEM':
                if (!block.studyProblem) {
                    return `<div class="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <span class="text-sm text-amber-700">Problem yükleniyor...</span>
                    </div>`;
                }
                const problem = block.studyProblem;
                return `
                    <div class="bg-amber-50 rounded-lg border border-amber-200 overflow-hidden">
                        <!-- Problem Header -->
                        <div class="bg-amber-100 px-4 py-3 border-b border-amber-200 flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <i data-lucide="calculator" class="w-5 h-5 text-amber-600"></i>
                                <span class="font-semibold text-gray-900">${Formatters.escapeHtml(problem.title)}</span>
                                <span class="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs rounded-full">${problem.difficulty}</span>
                            </div>
                        </div>

                        <!-- Problem Content -->
                        <div class="p-4 space-y-3">
                            <div class="prose max-w-none">
                                ${problem.content}
                            </div>

                            ${problem.hint ? `
                                <div class="bg-white border border-amber-300 rounded-lg p-3">
                                    <div class="flex items-start gap-2">
                                        <i data-lucide="lightbulb" class="w-4 h-4 text-amber-600 mt-0.5"></i>
                                        <div>
                                            <span class="text-xs font-semibold text-amber-800">İpucu:</span>
                                            <p class="text-sm text-gray-700 mt-1">${Formatters.escapeHtml(problem.hint)}</p>
                                        </div>
                                    </div>
                                </div>
                            ` : ''}

                            ${problem.correctEntries && problem.correctEntries.length > 0 ? `
                                <div class="mt-3">
                                    <div class="text-xs font-semibold text-amber-800 mb-2">Doğru Cevaplar (${problem.correctEntries.length} kayıt):</div>
                                    <div class="bg-white border border-amber-200 rounded-lg overflow-hidden">
                                        <table class="w-full text-xs">
                                            <thead class="bg-amber-50 border-b border-amber-200">
                                                <tr>
                                                    <th class="px-2 py-1 text-left">Hesap Kodu</th>
                                                    <th class="px-2 py-1 text-left">Hesap Adı</th>
                                                    <th class="px-2 py-1 text-right">Borç</th>
                                                    <th class="px-2 py-1 text-right">Alacak</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${problem.correctEntries.map(entry => `
                                                    <tr class="border-t border-amber-100">
                                                        <td class="px-2 py-1">${Formatters.escapeHtml(entry.accountCode)}</td>
                                                        <td class="px-2 py-1">${Formatters.escapeHtml(entry.accountName)}</td>
                                                        <td class="px-2 py-1 text-right">${entry.debitAmount.toFixed(2)}</td>
                                                        <td class="px-2 py-1 text-right">${entry.creditAmount.toFixed(2)}</td>
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;

            case 'STUDY_QUIZ':
                if (!block.studyQuiz) {
                    return `<div class="p-3 bg-pink-50 rounded-lg border border-pink-200">
                        <span class="text-sm text-pink-700">Soru yükleniyor...</span>
                    </div>`;
                }
                const quiz = block.studyQuiz;
                return `
                    <div class="bg-pink-50 rounded-lg border border-pink-200 overflow-hidden">
                        <!-- Quiz Header -->
                        <div class="bg-pink-100 px-4 py-3 border-b border-pink-200">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <i data-lucide="help-circle" class="w-5 h-5 text-pink-600"></i>
                                    <span class="font-semibold text-gray-900">${Formatters.escapeHtml(quiz.title)}</span>
                                </div>
                                <div class="flex items-center gap-3 text-xs">
                                    ${quiz.timeLimitMinutes ? `
                                        <span class="flex items-center gap-1 text-pink-700">
                                            <i data-lucide="clock" class="w-3 h-3"></i>
                                            ${quiz.timeLimitMinutes} dk
                                        </span>
                                    ` : ''}
                                    <span class="px-2 py-0.5 bg-pink-200 text-pink-800 rounded-full">
                                        Geçme: %${quiz.passPercentage}
                                    </span>
                                </div>
                            </div>
                            ${quiz.description ? `
                                <p class="text-sm text-gray-600 mt-2">${Formatters.escapeHtml(quiz.description)}</p>
                            ` : ''}
                        </div>

                        <!-- Quiz Questions -->
                        <div class="p-4 space-y-3">
                            ${quiz.questions && quiz.questions.length > 0 ? `
                                <div class="text-xs font-semibold text-pink-800 mb-2">${quiz.questions.length} Soru:</div>
                                ${quiz.questions.map((q, qIdx) => `
                                    <div class="bg-white border border-pink-200 rounded-lg p-3">
                                        <div class="font-medium text-sm text-gray-900 mb-2">
                                            ${qIdx + 1}. ${Formatters.escapeHtml(q.questionText)}
                                        </div>
                                        <div class="space-y-1.5 ml-4">
                                            ${q.options.map((opt, optIdx) => `
                                                <div class="flex items-center gap-2 text-xs ${opt.isCorrect ? 'text-green-700 font-medium' : 'text-gray-600'}">
                                                    <span class="w-5 h-5 flex items-center justify-center rounded-full ${opt.isCorrect ? 'bg-green-100 text-green-700' : 'bg-gray-100'}">
                                                        ${String.fromCharCode(65 + optIdx)}
                                                    </span>
                                                    <span>${Formatters.escapeHtml(opt.optionText)}</span>
                                                    ${opt.isCorrect ? '<i data-lucide="check" class="w-3 h-3 text-green-600"></i>' : ''}
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                `).join('')}
                            ` : '<p class="text-sm text-pink-700">Henüz soru eklenmedi.</p>'}
                        </div>
                    </div>
                `;

            default:
                return `<p class="text-gray-500">Bilinmeyen içerik tipi: ${block.contentType}</p>`;
        }
    },

    /**
     * Initialize slash commands for TEXT blocks
     */
    initializeTextBlocks: function() {
        document.querySelectorAll('.text-block [contenteditable="true"]').forEach(editor => {
            if (typeof SlashCommands !== 'undefined') {
                SlashCommands.init(editor);
            }

            // Add placeholder behavior
            const placeholder = editor.dataset.placeholder;
            if (placeholder && !editor.textContent.trim()) {
                editor.classList.add('empty');
            }

            editor.addEventListener('focus', () => {
                if (editor.classList.contains('empty')) {
                    editor.classList.remove('empty');
                }
            });

            editor.addEventListener('blur', () => {
                if (!editor.textContent.trim()) {
                    editor.classList.add('empty');
                }
                // Auto-save on blur
                this.saveBlockContent(editor);
            });
        });
    },

    /**
     * Attach event handlers to blocks
     */
    attachBlockEventHandlers: function() {
        // Delete block
        document.querySelectorAll('.delete-block').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const blockId = parseInt(e.currentTarget.dataset.blockId);
                if (confirm('Bu bloğu silmek istediğinize emin misiniz?')) {
                    await this.deleteBlock(blockId);
                }
            });
        });

        // Add block between
        document.querySelectorAll('.add-block-between').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const afterIndex = parseInt(e.currentTarget.dataset.afterIndex);
                this.showBlockTypeModal(afterIndex + 1);
            });
        });
    },

    /**
     * Show block type selection modal
     */
    showBlockTypeModal: function(insertAtIndex = null) {
        const modal = document.getElementById('typeSelectModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            modal.dataset.insertIndex = insertAtIndex;
        }
    },

    /**
     * Add new block
     */
    addBlock: async function(type, insertAtIndex = null) {
        if (!this.currentSection) {
            UIHelpers.showError('Önce bir bölüm seçin!');
            return;
        }

        // For STUDY_PROBLEM and STUDY_QUIZ, open modal instead
        if (type === 'STUDY_PROBLEM') {
            this.openStudyProblemModal();
            return;
        }
        if (type === 'STUDY_QUIZ') {
            this.openStudyQuizModal();
            return;
        }

        const modal = document.getElementById('typeSelectModal');
        if (insertAtIndex === null && modal?.dataset.insertIndex) {
            insertAtIndex = parseInt(modal.dataset.insertIndex);
        }

        const displayOrder = insertAtIndex !== null ? insertAtIndex : this.blocks.length;

        try {
            const blockData = {
                cardSectionId: this.currentSection.id,
                contentType: type,
                displayOrder: displayOrder,
                isActive: true
            };

            // Add default content for TEXT type
            if (type === 'TEXT') {
                blockData.textContent = '<p>İçerik yazın...</p>';
            }

            const response = await APIService.post('/api/admin/content-items', blockData);
            if (response.ok) {
                UIHelpers.showSuccess('Blok eklendi!');
                await this.loadBlocks();
                this.renderBlocks();
            } else {
                UIHelpers.showError('Blok eklenemedi!');
            }
        } catch (error) {
            Logger.error('Error adding block:', error);
            UIHelpers.showError('Bir hata oluştu!');
        }
    },

    /**
     * Delete block
     */
    deleteBlock: async function(blockId) {
        try {
            const response = await APIService.delete(`/api/admin/content-items/${blockId}`);
            if (response.ok) {
                UIHelpers.showSuccess('Blok silindi!');
                await this.loadBlocks();
                this.renderBlocks();
            } else {
                UIHelpers.showError('Blok silinemedi!');
            }
        } catch (error) {
            Logger.error('Error deleting block:', error);
            UIHelpers.showError('Bir hata oluştu!');
        }
    },

    /**
     * Save block content
     */
    saveBlockContent: async function(editor) {
        const blockId = parseInt(editor.dataset.blockId);
        const block = this.blocks.find(b => b.id === blockId);
        if (!block) return;

        try {
            const response = await APIService.put(`/api/admin/content-items/${blockId}`, {
                ...block,
                textContent: editor.innerHTML
            });

            if (response.ok) {
                Logger.log('Block content saved:', blockId);
            }
        } catch (error) {
            Logger.error('Error saving block content:', error);
        }
    },

    /**
     * Save section title
     */
    saveSectionTitle: async function() {
        if (!this.currentSection) return;

        const titleInput = document.getElementById('sectionTitle');
        if (!titleInput) return;

        const newTitle = titleInput.value.trim();
        if (!newTitle || newTitle === this.currentSection.title) return;

        try {
            const response = await APIService.put(`/api/admin/study-cards/sections/${this.currentSection.id}`, {
                ...this.currentSection,
                title: newTitle
            });

            if (response.ok) {
                this.currentSection.title = newTitle;
                await this.loadSections();
                this.renderSectionTree();
                UIHelpers.showSuccess('Başlık kaydedildi!');
            }
        } catch (error) {
            Logger.error('Error saving section title:', error);
        }
    },

    /**
     * Add new section
     */
    addSection: async function() {
        if (!this.currentStudyCard) {
            UIHelpers.showError('Önce bir çalışma kartı seçin!');
            return;
        }

        const title = prompt('Yeni bölüm başlığı:');
        if (!title) return;

        try {
            const response = await APIService.post('/api/admin/study-cards/sections', {
                studyCardId: this.currentStudyCard,
                title: title,
                displayOrder: this.sections.length,
                isActive: true
            });

            if (response.ok) {
                const newSection = await response.json();
                UIHelpers.showSuccess('Bölüm oluşturuldu!');
                await this.loadSections();
                this.renderSectionTree();
                this.selectSection(newSection);
            } else {
                UIHelpers.showError('Bölüm oluşturulamadı!');
            }
        } catch (error) {
            Logger.error('Error adding section:', error);
            UIHelpers.showError('Bir hata oluştu!');
        }
    },

    /**
     * Delete current section
     */
    deleteSection: async function() {
        if (!this.currentSection) return;

        if (!confirm(`"${this.currentSection.title}" bölümünü silmek istediğinize emin misiniz?`)) return;

        try {
            const response = await APIService.delete(`/api/admin/study-cards/sections/${this.currentSection.id}`);
            if (response.ok) {
                UIHelpers.showSuccess('Bölüm silindi!');
                await this.loadSections();
                this.renderSectionTree();

                if (this.sections.length > 0) {
                    this.selectSection(this.sections[0]);
                } else {
                    this.currentSection = null;
                    this.hideEditor();
                }
            } else {
                UIHelpers.showError('Bölüm silinemedi!');
            }
        } catch (error) {
            Logger.error('Error deleting section:', error);
            UIHelpers.showError('Bir hata oluştu!');
        }
    },

    /**
     * Save all changes
     */
    saveAll: async function() {
        // Save all TEXT block contents
        const editors = document.querySelectorAll('.text-block [contenteditable="true"]');
        const savePromises = Array.from(editors).map(editor => this.saveBlockContent(editor));

        try {
            await Promise.all(savePromises);
            UIHelpers.showSuccess('Tüm değişiklikler kaydedildi!');
        } catch (error) {
            Logger.error('Error saving all:', error);
            UIHelpers.showError('Kaydetme sırasında hata oluştu!');
        }
    },

    // ========== STUDY PROBLEM METHODS ==========

    currentStudyProblemBlockId: null,
    correctEntries: [],

    /**
     * Open StudyProblem modal
     */
    openStudyProblemModal: function(blockId = null) {
        this.currentStudyProblemBlockId = blockId;
        this.correctEntries = [];

        // Reset form
        document.getElementById('studyProblemTitle').value = '';
        document.getElementById('studyProblemContent').innerHTML = '';
        document.getElementById('studyProblemHint').value = '';
        document.getElementById('studyProblemDifficulty').value = 'ORTA';
        document.getElementById('correctEntriesTable').innerHTML = '';

        // Initialize slash commands for content editor
        const contentEditor = document.getElementById('studyProblemContent');
        if (contentEditor && typeof SlashCommands !== 'undefined') {
            SlashCommands.init(contentEditor);
        }

        // Show modal
        const modal = document.getElementById('studyProblemModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        UIHelpers.refreshIcons();
    },

    /**
     * Close StudyProblem modal
     */
    closeStudyProblemModal: function() {
        const modal = document.getElementById('studyProblemModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
        this.currentStudyProblemBlockId = null;
        this.correctEntries = [];
    },

    /**
     * Add correct entry row
     */
    addCorrectEntry: function() {
        const entryId = Date.now();
        const entry = {
            id: entryId,
            accountCode: '',
            accountName: '',
            debit: 0,
            credit: 0
        };
        this.correctEntries.push(entry);
        this.renderCorrectEntries();
    },

    /**
     * Remove correct entry
     */
    removeCorrectEntry: function(entryId) {
        this.correctEntries = this.correctEntries.filter(e => e.id !== entryId);
        this.renderCorrectEntries();
    },

    /**
     * Render correct entries table
     */
    renderCorrectEntries: function() {
        const tbody = document.getElementById('correctEntriesTable');
        if (!tbody) return;

        tbody.innerHTML = this.correctEntries.map(entry => `
            <tr>
                <td class="px-4 py-2 border-t border-slate-200" style="width: 120px;">
                    <input type="text" value="${entry.accountCode || ''}"
                           onchange="StudyCardBuilder.updateCorrectEntry(${entry.id}, 'accountCode', this.value)"
                           class="w-full px-2 py-1 border border-slate-300 rounded"
                           placeholder="100">
                </td>
                <td class="px-4 py-2 border-t border-slate-200" style="width: 200px;">
                    <input type="text" value="${entry.accountName || ''}"
                           onchange="StudyCardBuilder.updateCorrectEntry(${entry.id}, 'accountName', this.value)"
                           class="w-full px-2 py-1 border border-slate-300 rounded"
                           placeholder="Kasa">
                </td>
                <td class="px-4 py-2 border-t border-slate-200" style="width: 120px;">
                    <input type="number" value="${entry.debit || 0}" step="0.01"
                           onchange="StudyCardBuilder.updateCorrectEntry(${entry.id}, 'debit', parseFloat(this.value))"
                           class="w-full px-2 py-1 border border-slate-300 rounded text-right">
                </td>
                <td class="px-4 py-2 border-t border-slate-200" style="width: 120px;">
                    <input type="number" value="${entry.credit || 0}" step="0.01"
                           onchange="StudyCardBuilder.updateCorrectEntry(${entry.id}, 'credit', parseFloat(this.value))"
                           class="w-full px-2 py-1 border border-slate-300 rounded text-right">
                </td>
                <td class="px-4 py-2 border-t border-slate-200 text-center" style="width: 60px;">
                    <button type="button" onclick="StudyCardBuilder.removeCorrectEntry(${entry.id})"
                            class="text-red-600 hover:text-red-800 inline-flex items-center justify-center p-1">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        UIHelpers.refreshIcons();
    },

    /**
     * Update correct entry value
     */
    updateCorrectEntry: function(entryId, field, value) {
        const entry = this.correctEntries.find(e => e.id === entryId);
        if (entry) {
            entry[field] = value;
        }
    },

    /**
     * Save StudyProblem
     */
    saveStudyProblem: async function() {
        const title = document.getElementById('studyProblemTitle').value.trim();
        const content = document.getElementById('studyProblemContent').innerHTML.trim();
        const hint = document.getElementById('studyProblemHint').value.trim();
        const difficulty = document.getElementById('studyProblemDifficulty').value;

        // Validation
        if (!title) {
            UIHelpers.showError('Problem başlığı zorunludur!');
            return;
        }
        if (!content) {
            UIHelpers.showError('Problem içeriği zorunludur!');
            return;
        }
        if (this.correctEntries.length === 0) {
            UIHelpers.showError('En az bir doğru yevmiye kaydı eklemelisiniz!');
            return;
        }

        try {
            const studyProblemData = {
                title,
                content,
                hint: hint || null,
                difficulty,
                correctEntries: this.correctEntries.map(e => ({
                    accountCode: e.accountCode,
                    accountName: e.accountName,
                    debitAmount: parseFloat(e.debit) || 0,
                    creditAmount: parseFloat(e.credit) || 0
                }))
            };

            // Create ContentItem with StudyProblem
            const contentItemData = {
                cardSectionId: this.currentSection.id,
                contentType: 'STUDY_PROBLEM',
                displayOrder: this.blocks.length,
                isActive: true,
                studyProblem: studyProblemData
            };

            const response = await APIService.post('/api/admin/content-items', contentItemData);
            if (response.ok) {
                UIHelpers.showSuccess('Özel problem eklendi!');
                await this.loadBlocks();
                this.renderBlocks();
                this.closeStudyProblemModal();
            } else {
                UIHelpers.showError('Problem eklenemedi!');
            }
        } catch (error) {
            Logger.error('Error saving StudyProblem:', error);
            UIHelpers.showError('Bir hata oluştu!');
        }
    },

    // ========== STUDY QUIZ METHODS ==========

    currentStudyQuizBlockId: null,
    quizQuestions: [],
    quizQuestionIdCounter: 0,

    /**
     * Open StudyQuiz modal
     */
    openStudyQuizModal: function(blockId = null) {
        this.currentStudyQuizBlockId = blockId;
        this.quizQuestions = [];
        this.quizQuestionIdCounter = 0;

        // Reset form
        document.getElementById('studyQuizTitle').value = '';
        document.getElementById('studyQuizDescription').value = '';
        document.getElementById('studyQuizTimeLimit').value = '';
        document.getElementById('studyQuizPassPercentage').value = '70';
        document.getElementById('quizQuestionsList').innerHTML = '';

        // Show modal
        const modal = document.getElementById('studyQuizModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        UIHelpers.refreshIcons();
    },

    /**
     * Close StudyQuiz modal
     */
    closeStudyQuizModal: function() {
        const modal = document.getElementById('studyQuizModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
        this.currentStudyQuizBlockId = null;
        this.quizQuestions = [];
    },

    /**
     * Add quiz question
     */
    addQuizQuestion: function() {
        const questionId = ++this.quizQuestionIdCounter;
        const question = {
            id: questionId,
            questionText: '',
            options: [
                { id: 1, optionText: '', isCorrect: false },
                { id: 2, optionText: '', isCorrect: false },
                { id: 3, optionText: '', isCorrect: false },
                { id: 4, optionText: '', isCorrect: false }
            ]
        };
        this.quizQuestions.push(question);
        this.renderQuizQuestions();
    },

    /**
     * Remove quiz question
     */
    removeQuizQuestion: function(questionId) {
        this.quizQuestions = this.quizQuestions.filter(q => q.id !== questionId);
        this.renderQuizQuestions();
    },

    /**
     * Render quiz questions
     */
    renderQuizQuestions: function() {
        const container = document.getElementById('quizQuestionsList');
        if (!container) return;

        container.innerHTML = this.quizQuestions.map((q, qIndex) => `
            <div class="border border-slate-300 rounded-lg p-4 bg-slate-50">
                <div class="flex items-start justify-between mb-3">
                    <label class="text-sm font-semibold text-slate-900">Soru ${qIndex + 1}</label>
                    <button type="button" onclick="StudyCardBuilder.removeQuizQuestion(${q.id})"
                            class="text-red-600 hover:text-red-800 flex-shrink-0 inline-flex items-center justify-center p-1">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
                <textarea rows="2"
                          onchange="StudyCardBuilder.updateQuestionText(${q.id}, this.value)"
                          class="w-full px-3 py-2 border border-slate-300 rounded-lg mb-3"
                          placeholder="Soru metnini girin...">${q.questionText}</textarea>
                <div class="space-y-2">
                    ${q.options.map((opt, optIndex) => `
                        <div class="flex items-center gap-2">
                            <input type="radio" name="correct_${q.id}" ${opt.isCorrect ? 'checked' : ''}
                                   onchange="StudyCardBuilder.setCorrectOption(${q.id}, ${opt.id})"
                                   class="w-4 h-4 text-indigo-600">
                            <input type="text" value="${opt.optionText || ''}"
                                   onchange="StudyCardBuilder.updateOptionText(${q.id}, ${opt.id}, this.value)"
                                   class="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                                   placeholder="Şık ${String.fromCharCode(65 + optIndex)}">
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        UIHelpers.refreshIcons();
    },

    /**
     * Update question text
     */
    updateQuestionText: function(questionId, text) {
        const question = this.quizQuestions.find(q => q.id === questionId);
        if (question) {
            question.questionText = text;
        }
    },

    /**
     * Update option text
     */
    updateOptionText: function(questionId, optionId, text) {
        const question = this.quizQuestions.find(q => q.id === questionId);
        if (question) {
            const option = question.options.find(o => o.id === optionId);
            if (option) {
                option.optionText = text;
            }
        }
    },

    /**
     * Set correct option
     */
    setCorrectOption: function(questionId, optionId) {
        const question = this.quizQuestions.find(q => q.id === questionId);
        if (question) {
            question.options.forEach(o => o.isCorrect = (o.id === optionId));
        }
    },

    /**
     * Save StudyQuiz
     */
    saveStudyQuiz: async function() {
        const title = document.getElementById('studyQuizTitle').value.trim();
        const description = document.getElementById('studyQuizDescription').value.trim();
        const timeLimit = document.getElementById('studyQuizTimeLimit').value;
        const passPercentage = parseInt(document.getElementById('studyQuizPassPercentage').value);

        // Validation
        if (!title) {
            UIHelpers.showError('Soru başlığı zorunludur!');
            return;
        }
        if (this.quizQuestions.length === 0) {
            UIHelpers.showError('En az bir soru eklemelisiniz!');
            return;
        }

        // Validate questions
        for (let q of this.quizQuestions) {
            if (!q.questionText.trim()) {
                UIHelpers.showError('Tüm soruların metni doldurulmalıdır!');
                return;
            }
            if (!q.options.some(o => o.isCorrect)) {
                UIHelpers.showError('Her soru için doğru şık seçilmelidir!');
                return;
            }
            if (q.options.some(o => !o.optionText.trim())) {
                UIHelpers.showError('Tüm şıkların metni doldurulmalıdır!');
                return;
            }
        }

        try {
            const studyQuizData = {
                title,
                description: description || null,
                timeLimitMinutes: timeLimit ? parseInt(timeLimit) : null,
                passPercentage,
                questions: this.quizQuestions.map((q, idx) => ({
                    questionText: q.questionText,
                    displayOrder: idx,
                    options: q.options.map(o => ({
                        optionText: o.optionText,
                        isCorrect: o.isCorrect
                    }))
                }))
            };

            // Create ContentItem with StudyQuiz
            const contentItemData = {
                cardSectionId: this.currentSection.id,
                contentType: 'STUDY_QUIZ',
                displayOrder: this.blocks.length,
                isActive: true,
                studyQuiz: studyQuizData
            };

            const response = await APIService.post('/api/admin/content-items', contentItemData);
            if (response.ok) {
                UIHelpers.showSuccess('Özel soru eklendi!');
                await this.loadBlocks();
                this.renderBlocks();
                this.closeStudyQuizModal();
            } else {
                UIHelpers.showError('Soru eklenemedi!');
            }
        } catch (error) {
            Logger.error('Error saving StudyQuiz:', error);
            UIHelpers.showError('Bir hata oluştu!');
        }
    }
};
