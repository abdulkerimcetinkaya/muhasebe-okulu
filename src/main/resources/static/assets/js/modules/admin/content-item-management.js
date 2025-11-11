/**
 * ContentItem Management Module
 * Handles mixed content management within CardSections
 */

const ContentItemManagement = {
    currentSectionId: null,
    currentContentType: null,
    editingItemId: null,

    /**
     * Open content management modal for a section
     */
    openManagementModal: async function(sectionId, sectionTitle) {
        this.currentSectionId = sectionId;
        document.getElementById('currentSectionId').value = sectionId;
        document.getElementById('contentItemSectionTitle').textContent = sectionTitle;

        // Show modal
        document.getElementById('contentItemManagementModal').classList.remove('hidden');

        // Load content items
        await this.loadContentItems(sectionId);

        // Initialize lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    /**
     * Close management modal
     */
    closeManagementModal: function() {
        document.getElementById('contentItemManagementModal').classList.add('hidden');
        this.currentSectionId = null;

        // Refresh section list if needed
        if (typeof StudyManagement !== 'undefined' && StudyManagement.currentCardId) {
            StudyManagement.loadCardSections(StudyManagement.currentCardId);
        }
    },

    /**
     * Load content items for a section
     */
    loadContentItems: async function(sectionId) {
        try {
            const response = await fetch(`/api/admin/content-items/section/${sectionId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const items = await response.json();
                this.renderContentItems(items);
            } else {
                UIHelpers.showError('İçerikler yüklenemedi');
            }
        } catch (error) {
            console.error('Error loading content items:', error);
            UIHelpers.showError('Bir hata oluştu');
        }
    },

    /**
     * Render content items list
     */
    renderContentItems: function(items) {
        const emptyState = document.getElementById('emptyContentState');
        const itemsList = document.getElementById('contentItemsList');
        const addButton = document.getElementById('addContentButton');

        if (items.length === 0) {
            emptyState.classList.remove('hidden');
            itemsList.innerHTML = '';
            addButton.classList.add('hidden');
        } else {
            emptyState.classList.add('hidden');
            addButton.classList.remove('hidden');

            itemsList.innerHTML = items.map((item, index) => {
                const typeInfo = this.getContentTypeInfo(item.contentType);
                const preview = this.getContentPreview(item);

                return `
                    <div class="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors" data-item-id="${item.id}">
                        <div class="flex items-start gap-4">
                            <div class="flex-shrink-0 w-10 h-10 rounded-lg ${typeInfo.bgColor} ${typeInfo.textColor} flex items-center justify-center">
                                <i data-lucide="${typeInfo.icon}" class="w-5 h-5"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="px-2 py-0.5 text-xs font-medium rounded ${typeInfo.badgeClass}">${typeInfo.label}</span>
                                    <span class="text-xs text-slate-500">#${item.displayOrder + 1}</span>
                                </div>
                                <div class="text-sm text-slate-900 font-medium mb-1">${preview.title}</div>
                                <div class="text-xs text-slate-500 line-clamp-2">${preview.description}</div>
                            </div>
                            <div class="flex items-center gap-2">
                                <button onclick="ContentItemManagement.editContentItem(${item.id})" class="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors" title="Düzenle">
                                    <i data-lucide="edit-2" class="w-4 h-4"></i>
                                </button>
                                <button onclick="ContentItemManagement.deleteContentItem(${item.id})" class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors" title="Sil">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                                <div class="h-6 w-px bg-slate-200"></div>
                                <button class="p-2 text-slate-400 hover:text-slate-600 cursor-move" title="Sürükle">
                                    <i data-lucide="grip-vertical" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // Initialize lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    },

    /**
     * Get content type information
     */
    getContentTypeInfo: function(contentType) {
        const types = {
            'TEXT': {
                icon: 'file-text',
                label: 'Metin',
                bgColor: 'bg-blue-50',
                textColor: 'text-blue-600',
                badgeClass: 'bg-blue-100 text-blue-700'
            },
            'PROBLEM': {
                icon: 'link',
                label: 'Problem Link',
                bgColor: 'bg-purple-50',
                textColor: 'text-purple-600',
                badgeClass: 'bg-purple-100 text-purple-700'
            },
            'QUIZ': {
                icon: 'link',
                label: 'Test Link',
                bgColor: 'bg-green-50',
                textColor: 'text-green-600',
                badgeClass: 'bg-green-100 text-green-700'
            },
            'STUDY_PROBLEM': {
                icon: 'calculator',
                label: 'Özel Problem',
                bgColor: 'bg-orange-50',
                textColor: 'text-orange-600',
                badgeClass: 'bg-orange-100 text-orange-700'
            },
            'STUDY_QUIZ': {
                icon: 'check-square',
                label: 'Özel Test',
                bgColor: 'bg-teal-50',
                textColor: 'text-teal-600',
                badgeClass: 'bg-teal-100 text-teal-700'
            }
        };
        return types[contentType] || types['TEXT'];
    },

    /**
     * Get content preview
     */
    getContentPreview: function(item) {
        switch (item.contentType) {
            case 'TEXT':
                const textPreview = item.textContent ? item.textContent.replace(/<[^>]*>/g, '').substring(0, 100) : '';
                return {
                    title: 'Metin İçeriği',
                    description: textPreview || 'Boş içerik'
                };
            case 'STUDY_PROBLEM':
                return {
                    title: item.studyProblem?.title || 'Problem',
                    description: item.studyProblem?.content?.substring(0, 100) || 'Problem açıklaması'
                };
            case 'STUDY_QUIZ':
                return {
                    title: item.studyQuiz?.title || 'Test',
                    description: item.studyQuiz?.description?.substring(0, 100) || 'Test açıklaması'
                };
            case 'PROBLEM':
                return {
                    title: item.relatedProblem?.title || 'Problem',
                    description: `Problem ID: ${item.relatedProblemId}`
                };
            case 'QUIZ':
                return {
                    title: item.relatedQuiz?.title || 'Test',
                    description: `Test ID: ${item.relatedQuizId}`
                };
            default:
                return {
                    title: 'İçerik',
                    description: ''
                };
        }
    },

    /**
     * Show add content item form
     */
    showAddForm: function() {
        this.editingItemId = null;
        this.currentContentType = null;

        document.getElementById('contentItemModalTitle').textContent = 'Yeni İçerik';
        document.getElementById('contentItemId').value = '';
        document.getElementById('contentItemSectionId').value = this.currentSectionId;
        document.getElementById('contentItemForm').reset();

        // Reset all content type buttons and forms
        document.querySelectorAll('.content-type-btn').forEach(btn => {
            btn.classList.remove('border-slate-800', 'bg-slate-50');
            btn.classList.add('border-slate-300');
        });
        document.querySelectorAll('#textContentForm, #problemLinkForm, #quizLinkForm, #studyProblemForm, #studyQuizForm').forEach(form => {
            form.classList.add('hidden');
        });

        document.getElementById('contentItemModal').classList.remove('hidden');

        // Initialize lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    /**
     * Close content item modal
     */
    closeContentItemModal: function() {
        document.getElementById('contentItemModal').classList.add('hidden');
        this.editingItemId = null;
        this.currentContentType = null;
    },

    /**
     * Select content type
     */
    selectContentType: function(type) {
        this.currentContentType = type;

        // Update button styles
        document.querySelectorAll('.content-type-btn').forEach(btn => {
            if (btn.getAttribute('data-type') === type) {
                btn.classList.remove('border-slate-300');
                btn.classList.add('border-slate-800', 'bg-slate-50');
            } else {
                btn.classList.add('border-slate-300');
                btn.classList.remove('border-slate-800', 'bg-slate-50');
            }
        });

        // Show/hide forms
        document.getElementById('textContentForm').classList.add('hidden');
        document.getElementById('problemLinkForm').classList.add('hidden');
        document.getElementById('quizLinkForm').classList.add('hidden');
        document.getElementById('studyProblemForm').classList.add('hidden');
        document.getElementById('studyQuizForm').classList.add('hidden');

        switch (type) {
            case 'TEXT':
                document.getElementById('textContentForm').classList.remove('hidden');
                // Initialize SimpleBlockEditor for TEXT content
                this.initBlockEditor();
                break;
            case 'PROBLEM':
                document.getElementById('problemLinkForm').classList.remove('hidden');
                this.loadProblemsForSelect();
                break;
            case 'QUIZ':
                document.getElementById('quizLinkForm').classList.remove('hidden');
                this.loadQuizzesForSelect();
                break;
            case 'STUDY_PROBLEM':
                document.getElementById('studyProblemForm').classList.remove('hidden');
                break;
            case 'STUDY_QUIZ':
                document.getElementById('studyQuizForm').classList.remove('hidden');
                break;
        }
    },

    /**
     * Initialize Block Editor for TEXT content type
     */
    initBlockEditor: function(existingBlocks = null) {
        // Clean up existing editor if any
        if (window.contentBlockEditor) {
            delete window.contentBlockEditor;
        }

        // Initialize new block editor
        window.contentBlockEditor = new SimpleBlockEditor('blockEditorContainer', {
            onChange: () => {
                // Content changed
            }
        });

        // Load existing blocks if provided
        if (existingBlocks && existingBlocks.length > 0) {
            window.contentBlockEditor.setBlocks(existingBlocks);
        }
    },

    /**
     * Save content item
     */
    saveContentItem: async function(event) {
        event.preventDefault();

        if (!this.currentContentType) {
            UIHelpers.showError('Lütfen içerik tipi seçin');
            return;
        }

        const dto = {
            cardSectionId: parseInt(document.getElementById('contentItemSectionId').value),
            contentType: this.currentContentType,
            active: true
        };

        // Build DTO based on content type
        switch (this.currentContentType) {
            case 'TEXT':
                // Get blocks from SimpleBlockEditor
                if (!window.contentBlockEditor || !window.contentBlockEditor.blocks || window.contentBlockEditor.blocks.length === 0) {
                    UIHelpers.showError('Lütfen en az bir içerik bloğu ekleyin');
                    return;
                }

                // For TEXT type, we'll create multiple ContentItems - one for each block
                // This allows block-based mixed content
                const blocks = window.contentBlockEditor.blocks;
                try {
                    await this.saveMultipleBlockItems(blocks);
                    return; // Early return since we handle save internally
                } catch (error) {
                    UIHelpers.showError('Bloklar kaydedilemedi: ' + error.message);
                    return;
                }
                break;
            case 'PROBLEM':
                dto.relatedProblemId = parseInt(document.getElementById('problemLinkSelect').value);
                if (!dto.relatedProblemId) {
                    UIHelpers.showError('Lütfen problem seçin');
                    return;
                }
                break;
            case 'QUIZ':
                dto.relatedQuizId = parseInt(document.getElementById('quizLinkSelect').value);
                if (!dto.relatedQuizId) {
                    UIHelpers.showError('Lütfen test seçin');
                    return;
                }
                break;
            case 'STUDY_PROBLEM':
                const problemTitle = document.getElementById('studyProblemTitle').value;
                const problemContent = document.getElementById('studyProblemContent').value;
                if (!problemTitle || !problemContent) {
                    UIHelpers.showError('Lütfen başlık ve içerik girin');
                    return;
                }
                dto.studyProblem = {
                    title: problemTitle,
                    content: problemContent,
                    difficulty: 'ORTA',
                    correctEntries: []
                };
                break;
            case 'STUDY_QUIZ':
                const quizTitle = document.getElementById('studyQuizTitle').value;
                if (!quizTitle) {
                    UIHelpers.showError('Lütfen başlık girin');
                    return;
                }
                dto.studyQuiz = {
                    title: quizTitle,
                    description: document.getElementById('studyQuizDescription').value,
                    passPercentage: 70,
                    questions: []
                };
                break;
        }

        try {
            const itemId = document.getElementById('contentItemId').value;
            const url = itemId ? `/api/admin/content-items/${itemId}` : '/api/admin/content-items';
            const method = itemId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(dto)
            });

            if (response.ok) {
                UIHelpers.showSuccess('İçerik kaydedildi');
                this.closeContentItemModal();
                await this.loadContentItems(this.currentSectionId);
            } else {
                const error = await response.text();
                UIHelpers.showError('Kaydedilemedi: ' + error);
            }
        } catch (error) {
            console.error('Error saving content item:', error);
            UIHelpers.showError('Bir hata oluştu');
        }
    },

    /**
     * Edit content item
     */
    editContentItem: async function(itemId) {
        try {
            const response = await fetch(`/api/admin/content-items/${itemId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const item = await response.json();
                this.populateEditForm(item);
                document.getElementById('contentItemModal').classList.remove('hidden');
            } else {
                UIHelpers.showError('İçerik yüklenemedi');
            }
        } catch (error) {
            console.error('Error loading content item:', error);
            UIHelpers.showError('Bir hata oluştu');
        }
    },

    /**
     * Populate edit form with item data
     */
    populateEditForm: function(item) {
        this.editingItemId = item.id;

        document.getElementById('contentItemModalTitle').textContent = 'İçeriği Düzenle';
        document.getElementById('contentItemId').value = item.id;
        document.getElementById('contentItemSectionId').value = item.cardSectionId;

        // Select content type
        this.selectContentType(item.contentType);

        // Populate fields based on type
        switch (item.contentType) {
            case 'TEXT':
                document.getElementById('textContentInput').value = item.textContent || '';
                break;
            case 'PROBLEM':
                document.getElementById('problemLinkSelect').value = item.relatedProblemId || '';
                break;
            case 'QUIZ':
                document.getElementById('quizLinkSelect').value = item.relatedQuizId || '';
                break;
            case 'STUDY_PROBLEM':
                if (item.studyProblem) {
                    document.getElementById('studyProblemTitle').value = item.studyProblem.title || '';
                    document.getElementById('studyProblemContent').value = item.studyProblem.content || '';
                }
                break;
            case 'STUDY_QUIZ':
                if (item.studyQuiz) {
                    document.getElementById('studyQuizTitle').value = item.studyQuiz.title || '';
                    document.getElementById('studyQuizDescription').value = item.studyQuiz.description || '';
                }
                break;
        }

        // Initialize lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    /**
     * Delete content item
     */
    deleteContentItem: async function(itemId) {
        if (!confirm('Bu içeriği silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/content-items/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok || response.status === 204) {
                UIHelpers.showSuccess('İçerik silindi');
                await this.loadContentItems(this.currentSectionId);
            } else {
                UIHelpers.showError('Silinemedi');
            }
        } catch (error) {
            console.error('Error deleting content item:', error);
            UIHelpers.showError('Bir hata oluştu');
        }
    },

    /**
     * Save multiple block items (for TEXT content type)
     * Each block becomes a separate ContentItem with appropriate contentType
     */
    saveMultipleBlockItems: async function(blocks) {
        const sectionId = parseInt(document.getElementById('contentItemSectionId').value);

        // Map block types to ContentItem contentTypes
        const typeMapping = {
            'paragraph': 'PARAGRAPH',
            'heading1': 'HEADING',
            'heading2': 'HEADING',
            'heading3': 'HEADING',
            'bulletList': 'LIST',
            'numberedList': 'LIST',
            'todoList': 'LIST',
            'table': 'TABLE',
            'code': 'CODE',
            'quote': 'QUOTE',
            'callout': 'CALLOUT',
            'divider': 'DIVIDER'
        };

        const contentItems = blocks.map((block, index) => ({
            cardSectionId: sectionId,
            contentType: typeMapping[block.type] || 'PARAGRAPH',
            displayOrder: index,
            blockData: JSON.stringify({
                id: block.id,
                type: block.type,
                content: block.content || '',
                properties: block.properties || {}
            }),
            active: true
        }));

        // Send all blocks at once
        try {
            const promises = contentItems.map(item =>
                fetch('/api/admin/content-items', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(item)
                })
            );

            await Promise.all(promises);

            UIHelpers.showSuccess(`${contentItems.length} içerik bloğu kaydedildi`);
            this.closeContentItemModal();
            await this.loadContentItems(this.currentSectionId);
        } catch (error) {
            throw new Error('Bloklar kaydedilirken hata oluştu');
        }
    },

    /**
     * Load problems for select dropdown
     */
    loadProblemsForSelect: async function() {
        try {
            const response = await fetch('/api/problems', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const problems = data.content || data; // Handle both paginated and array responses
                const select = document.getElementById('problemLinkSelect');
                select.innerHTML = '<option value="">Problem seçin...</option>' +
                    problems.map(p => `<option value="${p.id}">${p.title}</option>`).join('');
            }
        } catch (error) {
            console.error('Error loading problems:', error);
        }
    },

    /**
     * Load quizzes for select dropdown
     */
    loadQuizzesForSelect: async function() {
        try {
            const response = await fetch('/api/quizzes', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const quizzes = data.content || data; // Handle both paginated and array responses
                const select = document.getElementById('quizLinkSelect');
                select.innerHTML = '<option value="">Test seçin...</option>' +
                    quizzes.map(q => `<option value="${q.id}">${q.title}</option>`).join('');
            }
        } catch (error) {
            console.error('Error loading quizzes:', error);
        }
    },

    /**
     * Show text import modal
     */
    showTextImportModal: function() {
        document.getElementById('textImportModal').classList.remove('hidden');
        document.getElementById('textImportContent').value = '';
        document.getElementById('importBlockCount').textContent = '0';
        if (window.lucide) lucide.createIcons();
    },

    /**
     * Close text import modal
     */
    closeTextImportModal: function() {
        document.getElementById('textImportModal').classList.add('hidden');
    },

    /**
     * Parse and import text content
     */
    parseAndImportText: async function() {
        const content = document.getElementById('textImportContent').value;

        if (!content.trim()) {
            UIHelpers.showError('Lütfen içerik girin');
            return;
        }

        try {
            // Parse markdown-like content to blocks
            const blocks = this.parseMarkdownToBlocks(content);

            if (blocks.length === 0) {
                UIHelpers.showError('İçerik parse edilemedi');
                return;
            }

            // Save blocks using existing function
            await this.saveMultipleBlockItems(blocks);

            this.closeTextImportModal();
        } catch (error) {
            console.error('Error importing text:', error);
            UIHelpers.showError('İçe aktarma hatası: ' + error.message);
        }
    },

    /**
     * Parse markdown-style text to block objects
     */
    parseMarkdownToBlocks: function(text) {
        const lines = text.split('\n');
        const blocks = [];
        let currentBlock = null;
        let currentCodeBlock = null;
        let currentListItems = [];
        let currentTableRows = [];

        const finishCurrentBlock = () => {
            if (currentBlock) {
                blocks.push(currentBlock);
                currentBlock = null;
            }
            if (currentListItems.length > 0) {
                blocks.push({
                    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: currentListItems[0].type,
                    content: currentListItems.map(item => item.content).join(''),
                    properties: {}
                });
                currentListItems = [];
            }
            if (currentTableRows.length > 0) {
                const tableContent = '<table>' + currentTableRows.join('') + '</table>';
                blocks.push({
                    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'table',
                    content: tableContent,
                    properties: {
                        rows: currentTableRows.length,
                        cols: currentTableRows[0]?.split('</td>').length - 1 || 0
                    }
                });
                currentTableRows = [];
            }
        };

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Skip empty lines (but finish current blocks)
            if (!trimmed) {
                finishCurrentBlock();
                continue;
            }

            // Code block start/end
            if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
                if (currentCodeBlock) {
                    // End code block
                    blocks.push({
                        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        type: 'code',
                        content: currentCodeBlock.join('\n'),
                        properties: { language: 'plaintext' }
                    });
                    currentCodeBlock = null;
                } else {
                    // Start code block
                    finishCurrentBlock();
                    currentCodeBlock = [];
                }
                continue;
            }

            // Inside code block
            if (currentCodeBlock) {
                currentCodeBlock.push(line);
                continue;
            }

            // Headings
            if (trimmed.startsWith('##')) {
                finishCurrentBlock();
                const level = (trimmed.match(/^#+/) || [''])[0].length;
                const content = trimmed.replace(/^#+\s*/, '');
                blocks.push({
                    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: level === 2 ? 'heading1' : level === 3 ? 'heading2' : 'heading3',
                    content: content,
                    properties: {}
                });
                continue;
            }

            // Divider
            if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
                finishCurrentBlock();
                blocks.push({
                    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'divider',
                    content: '',
                    properties: {}
                });
                continue;
            }

            // Quote
            if (trimmed.startsWith('>')) {
                finishCurrentBlock();
                const content = trimmed.replace(/^>\s*/, '');
                blocks.push({
                    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'quote',
                    content: content,
                    properties: {}
                });
                continue;
            }

            // Callout
            if (trimmed.startsWith('[!')) {
                finishCurrentBlock();
                const match = trimmed.match(/\[!(WARNING|INFO|TIP|ERROR)\]/);
                if (match) {
                    const nextLine = lines[i + 1] || '';
                    blocks.push({
                        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        type: 'callout',
                        content: nextLine.trim(),
                        properties: { style: match[1].toLowerCase() }
                    });
                    i++; // Skip next line
                }
                continue;
            }

            // Bullet List
            if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                if (currentListItems.length === 0 || currentListItems[0].type !== 'bulletList') {
                    finishCurrentBlock();
                }
                const content = trimmed.replace(/^[*-]\s+/, '');
                currentListItems.push({
                    type: 'bulletList',
                    content: `<li>${content}</li>`
                });
                continue;
            }

            // Numbered List
            if (/^\d+\.\s/.test(trimmed)) {
                if (currentListItems.length === 0 || currentListItems[0].type !== 'numberedList') {
                    finishCurrentBlock();
                }
                const content = trimmed.replace(/^\d+\.\s+/, '');
                currentListItems.push({
                    type: 'numberedList',
                    content: `<li>${content}</li>`
                });
                continue;
            }

            // Todo List
            if (trimmed.startsWith('[ ]') || trimmed.startsWith('[x]')) {
                if (currentListItems.length === 0 || currentListItems[0].type !== 'todoList') {
                    finishCurrentBlock();
                }
                const checked = trimmed.startsWith('[x]');
                const content = trimmed.replace(/^\[[ x]\]\s+/, '');
                currentListItems.push({
                    type: 'todoList',
                    content: `<li data-checked='${checked}'>${content}</li>`
                });
                continue;
            }

            // Table
            if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
                if (currentTableRows.length === 0) {
                    finishCurrentBlock();
                }
                // Skip separator rows
                if (!/^\|[\s-:|]+\|$/.test(trimmed)) {
                    const cells = trimmed.split('|').slice(1, -1);
                    const row = '<tr>' + cells.map(cell => `<td>${cell.trim()}</td>`).join('') + '</tr>';
                    currentTableRows.push(row);
                }
                continue;
            }

            // Regular paragraph
            finishCurrentBlock();
            blocks.push({
                id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: 'paragraph',
                content: trimmed,
                properties: {}
            });
        }

        // Finish any remaining blocks
        finishCurrentBlock();

        // Update block count in UI
        document.getElementById('importBlockCount').textContent = blocks.length.toString();

        return blocks;
    }
};

// Make it globally accessible
window.ContentItemManagement = ContentItemManagement;
