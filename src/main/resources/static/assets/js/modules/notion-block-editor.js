/**
 * Notion-like Block Editor
 * Supports slash commands for creating different block types
 */

class NotionBlockEditor {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container ${containerId} not found`);
        }

        this.blocks = [];
        this.currentBlock = null;
        this.slashMenuVisible = false;
        this.options = {
            placeholder: 'Yazmaya başlayın veya "/" ile komut menüsünü açın...',
            onChange: null,
            ...options
        };

        this.blockTypes = {
            paragraph: {
                name: 'Paragraf',
                icon: '📝',
                description: 'Basit metin paragrafı',
                template: this.createParagraphBlock.bind(this)
            },
            heading1: {
                name: 'Başlık 1',
                icon: 'H1',
                description: 'Büyük başlık',
                template: this.createHeadingBlock.bind(this, 1)
            },
            heading2: {
                name: 'Başlık 2',
                icon: 'H2',
                description: 'Orta başlık',
                template: this.createHeadingBlock.bind(this, 2)
            },
            heading3: {
                name: 'Başlık 3',
                icon: 'H3',
                description: 'Küçük başlık',
                template: this.createHeadingBlock.bind(this, 3)
            },
            bulletList: {
                name: 'Madde İşaretli Liste',
                icon: '•',
                description: 'Basit madde işaretli liste',
                template: this.createListBlock.bind(this, 'bullet')
            },
            numberedList: {
                name: 'Numaralı Liste',
                icon: '1.',
                description: 'Numaralandırılmış liste',
                template: this.createListBlock.bind(this, 'numbered')
            },
            table: {
                name: 'Tablo',
                icon: '📊',
                description: 'Tablo ekle',
                template: this.createTableBlock.bind(this)
            },
            divider: {
                name: 'Ayırıcı',
                icon: '—',
                description: 'Görsel ayırıcı çizgi',
                template: this.createDividerBlock.bind(this)
            },
            code: {
                name: 'Kod Bloğu',
                icon: '</>',
                description: 'Kod snippet\'i',
                template: this.createCodeBlock.bind(this)
            },
            quote: {
                name: 'Alıntı',
                icon: '"',
                description: 'Alıntı bloğu',
                template: this.createQuoteBlock.bind(this)
            },
            callout: {
                name: 'Uyarı Kutusu',
                icon: '💡',
                description: 'Önemli bilgi kutusu',
                template: this.createCalloutBlock.bind(this)
            },
            problem: {
                name: 'Muhasebe Problemi',
                icon: '🧮',
                description: 'Özel muhasebe problemi ekle',
                template: this.createProblemBlock.bind(this)
            },
            quiz: {
                name: 'Test Sorusu',
                icon: '❓',
                description: 'Çoktan seçmeli test sorusu ekle',
                template: this.createQuizBlock.bind(this)
            }
        };

        this.init();
    }

    init() {
        this.container.innerHTML = '';
        this.container.className = 'notion-editor min-h-[400px] p-6 bg-white rounded-lg border border-slate-200';

        // Add initial paragraph block
        this.addBlock('paragraph');
    }

    addBlock(type, content = '', index = null) {
        const blockId = 'block-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const blockData = {
            id: blockId,
            type: type,
            content: content,
            properties: {}
        };

        const blockElement = this.blockTypes[type].template(blockData);

        if (index === null) {
            this.container.appendChild(blockElement);
            this.blocks.push(blockData);
        } else {
            const referenceBlock = this.container.children[index];
            this.container.insertBefore(blockElement, referenceBlock.nextSibling);
            this.blocks.splice(index + 1, 0, blockData);
        }

        // Focus on the new block
        const contentEditable = blockElement.querySelector('[contenteditable="true"]');
        if (contentEditable) {
            contentEditable.focus();
        }

        this.triggerChange();
        return blockElement;
    }

    createParagraphBlock(blockData) {
        const block = document.createElement('div');
        block.className = 'notion-block notion-paragraph group relative mb-2';
        block.dataset.blockId = blockData.id;
        block.dataset.blockType = 'paragraph';

        block.innerHTML = `
            <div class="flex items-start gap-2">
                <div class="notion-block-actions opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pt-1">
                    <button type="button" class="block-drag-handle text-slate-400 hover:text-slate-600 p-1" title="Taşı">
                        <i data-lucide="grip-vertical" class="w-4 h-4"></i>
                    </button>
                    <button type="button" class="block-add text-slate-400 hover:text-slate-600 p-1" title="Ekle">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                    </button>
                    <button type="button" class="block-delete text-slate-400 hover:text-red-600 p-1" title="Sil">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
                <div
                    class="notion-block-content flex-1 outline-none py-1 px-2 hover:bg-slate-50 rounded min-h-[28px]"
                    contenteditable="true"
                    data-placeholder="${this.options.placeholder}"
                >${blockData.content || ''}</div>
            </div>
        `;

        this.attachBlockHandlers(block, blockData);
        return block;
    }

    createHeadingBlock(level, blockData) {
        const block = document.createElement('div');
        block.className = 'notion-block notion-heading group relative mb-3';
        block.dataset.blockId = blockData.id;
        block.dataset.blockType = `heading${level}`;

        const sizeClasses = {
            1: 'text-3xl font-bold',
            2: 'text-2xl font-semibold',
            3: 'text-xl font-semibold'
        };

        block.innerHTML = `
            <div class="flex items-start gap-2">
                <div class="notion-block-actions opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pt-1">
                    <button type="button" class="block-drag-handle text-slate-400 hover:text-slate-600 p-1">
                        <i data-lucide="grip-vertical" class="w-4 h-4"></i>
                    </button>
                    <button type="button" class="block-add text-slate-400 hover:text-slate-600 p-1">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                    </button>
                    <button type="button" class="block-delete text-slate-400 hover:text-red-600 p-1">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
                <div
                    class="notion-block-content flex-1 outline-none py-1 px-2 hover:bg-slate-50 rounded ${sizeClasses[level]}"
                    contenteditable="true"
                    data-placeholder="Başlık..."
                >${blockData.content || ''}</div>
            </div>
        `;

        this.attachBlockHandlers(block, blockData);
        return block;
    }

    createListBlock(listType, blockData) {
        const block = document.createElement('div');
        block.className = 'notion-block notion-list group relative mb-1';
        block.dataset.blockId = blockData.id;
        block.dataset.blockType = listType === 'bullet' ? 'bulletList' : 'numberedList';

        const icon = listType === 'bullet' ? '•' : '1.';

        block.innerHTML = `
            <div class="flex items-start gap-2">
                <div class="notion-block-actions opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pt-1">
                    <button type="button" class="block-drag-handle text-slate-400 hover:text-slate-600 p-1">
                        <i data-lucide="grip-vertical" class="w-4 h-4"></i>
                    </button>
                    <button type="button" class="block-add text-slate-400 hover:text-slate-600 p-1">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                    </button>
                    <button type="button" class="block-delete text-slate-400 hover:text-red-600 p-1">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
                <span class="text-slate-600 font-medium pt-1">${icon}</span>
                <div
                    class="notion-block-content flex-1 outline-none py-1 px-2 hover:bg-slate-50 rounded"
                    contenteditable="true"
                    data-placeholder="Liste öğesi..."
                >${blockData.content || ''}</div>
            </div>
        `;

        this.attachBlockHandlers(block, blockData);
        return block;
    }

    createTableBlock(blockData) {
        const block = document.createElement('div');
        block.className = 'notion-block notion-table group relative mb-4';
        block.dataset.blockId = blockData.id;
        block.dataset.blockType = 'table';

        // Default 3x3 table
        const rows = blockData.properties?.rows || 3;
        const cols = blockData.properties?.cols || 3;

        let tableHTML = '<table class="w-full border-collapse border border-slate-300"><tbody>';
        for (let i = 0; i < rows; i++) {
            tableHTML += '<tr>';
            for (let j = 0; j < cols; j++) {
                tableHTML += `<td class="border border-slate-300 p-2" contenteditable="true"></td>`;
            }
            tableHTML += '</tr>';
        }
        tableHTML += '</tbody></table>';

        block.innerHTML = `
            <div class="flex items-start gap-2">
                <div class="notion-block-actions opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pt-1">
                    <button type="button" class="block-drag-handle text-slate-400 hover:text-slate-600 p-1">
                        <i data-lucide="grip-vertical" class="w-4 h-4"></i>
                    </button>
                    <button type="button" class="block-add text-slate-400 hover:text-slate-600 p-1">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                    </button>
                    <button type="button" class="block-delete text-slate-400 hover:text-red-600 p-1">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                    <button type="button" class="block-table-add-row text-slate-400 hover:text-slate-600 p-1" title="Satır ekle">
                        <i data-lucide="plus-square" class="w-4 h-4"></i>
                    </button>
                    <button type="button" class="block-table-add-col text-slate-400 hover:text-slate-600 p-1" title="Sütun ekle">
                        <i data-lucide="columns" class="w-4 h-4"></i>
                    </button>
                </div>
                <div class="notion-block-content flex-1 overflow-x-auto">
                    ${tableHTML}
                </div>
            </div>
        `;

        this.attachBlockHandlers(block, blockData);
        this.attachTableHandlers(block);
        return block;
    }

    createDividerBlock(blockData) {
        const block = document.createElement('div');
        block.className = 'notion-block notion-divider group relative my-4';
        block.dataset.blockId = blockData.id;
        block.dataset.blockType = 'divider';

        block.innerHTML = `
            <div class="flex items-center gap-2">
                <div class="notion-block-actions opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button type="button" class="block-drag-handle text-slate-400 hover:text-slate-600 p-1">
                        <i data-lucide="grip-vertical" class="w-4 h-4"></i>
                    </button>
                    <button type="button" class="block-delete text-slate-400 hover:text-red-600 p-1">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
                <hr class="flex-1 border-t-2 border-slate-200">
            </div>
        `;

        this.attachBlockHandlers(block, blockData);
        return block;
    }

    createCodeBlock(blockData) {
        const block = document.createElement('div');
        block.className = 'notion-block notion-code group relative mb-4';
        block.dataset.blockId = blockData.id;
        block.dataset.blockType = 'code';

        block.innerHTML = `
            <div class="flex items-start gap-2">
                <div class="notion-block-actions opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pt-1">
                    <button type="button" class="block-drag-handle text-slate-400 hover:text-slate-600 p-1">
                        <i data-lucide="grip-vertical" class="w-4 h-4"></i>
                    </button>
                    <button type="button" class="block-add text-slate-400 hover:text-slate-600 p-1">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                    </button>
                    <button type="button" class="block-delete text-slate-400 hover:text-red-600 p-1">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
                <div class="notion-block-content flex-1">
                    <pre class="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto"><code contenteditable="true" class="outline-none" data-placeholder="Kod yazın...">${blockData.content || ''}</code></pre>
                </div>
            </div>
        `;

        this.attachBlockHandlers(block, blockData);
        return block;
    }

    createQuoteBlock(blockData) {
        const block = document.createElement('div');
        block.className = 'notion-block notion-quote group relative mb-3';
        block.dataset.blockId = blockData.id;
        block.dataset.blockType = 'quote';

        block.innerHTML = `
            <div class="flex items-start gap-2">
                <div class="notion-block-actions opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pt-1">
                    <button type="button" class="block-drag-handle text-slate-400 hover:text-slate-600 p-1">
                        <i data-lucide="grip-vertical" class="w-4 h-4"></i>
                    </button>
                    <button type="button" class="block-add text-slate-400 hover:text-slate-600 p-1">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                    </button>
                    <button type="button" class="block-delete text-slate-400 hover:text-red-600 p-1">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
                <div class="border-l-4 border-slate-300 pl-4 flex-1">
                    <div
                        class="notion-block-content outline-none py-1 italic text-slate-600"
                        contenteditable="true"
                        data-placeholder="Alıntı..."
                    >${blockData.content || ''}</div>
                </div>
            </div>
        `;

        this.attachBlockHandlers(block, blockData);
        return block;
    }

    createCalloutBlock(blockData) {
        const block = document.createElement('div');
        block.className = 'notion-block notion-callout group relative mb-3';
        block.dataset.blockId = blockData.id;
        block.dataset.blockType = 'callout';

        const emoji = blockData.properties?.emoji || '💡';
        const bgColor = blockData.properties?.bgColor || 'bg-blue-50';

        block.innerHTML = `
            <div class="flex items-start gap-2">
                <div class="notion-block-actions opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pt-1">
                    <button type="button" class="block-drag-handle text-slate-400 hover:text-slate-600 p-1">
                        <i data-lucide="grip-vertical" class="w-4 h-4"></i>
                    </button>
                    <button type="button" class="block-add text-slate-400 hover:text-slate-600 p-1">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                    </button>
                    <button type="button" class="block-delete text-slate-400 hover:text-red-600 p-1">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
                <div class="${bgColor} rounded-lg p-4 flex-1 flex items-start gap-3">
                    <span class="text-2xl">${emoji}</span>
                    <div
                        class="notion-block-content flex-1 outline-none"
                        contenteditable="true"
                        data-placeholder="Uyarı metni..."
                    >${blockData.content || ''}</div>
                </div>
            </div>
        `;

        this.attachBlockHandlers(block, blockData);
        return block;
    }

    createProblemBlock(blockData) {
        const block = document.createElement('div');
        block.className = 'notion-block notion-problem group relative mb-4';
        block.dataset.blockId = blockData.id;
        block.dataset.blockType = 'problem';

        block.innerHTML = `
            <div class="flex items-start gap-2">
                <div class="notion-block-actions opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pt-1">
                    <button type="button" class="block-drag-handle text-slate-400 hover:text-slate-600 p-1">
                        <i data-lucide="grip-vertical" class="w-4 h-4"></i>
                    </button>
                    <button type="button" class="block-delete text-slate-400 hover:text-red-600 p-1">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
                <div class="notion-block-content flex-1 border-2 border-indigo-200 bg-indigo-50 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">🧮</span>
                        <h4 class="text-lg font-semibold text-indigo-900">Muhasebe Problemi</h4>
                    </div>
                    <div class="problem-editor space-y-3">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Problem Metni</label>
                            <textarea
                                class="problem-description w-full p-2 border border-slate-300 rounded-md"
                                rows="4"
                                placeholder="Problem açıklamasını yazın..."
                            >${blockData.content || ''}</textarea>
                        </div>
                        <button type="button" class="configure-problem-btn text-sm bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                            Yevmiye Kayıtlarını Yapılandır
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.attachBlockHandlers(block, blockData);
        this.attachProblemHandlers(block, blockData);
        return block;
    }

    createQuizBlock(blockData) {
        const block = document.createElement('div');
        block.className = 'notion-block notion-quiz group relative mb-4';
        block.dataset.blockId = blockData.id;
        block.dataset.blockType = 'quiz';

        block.innerHTML = `
            <div class="flex items-start gap-2">
                <div class="notion-block-actions opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pt-1">
                    <button type="button" class="block-drag-handle text-slate-400 hover:text-slate-600 p-1">
                        <i data-lucide="grip-vertical" class="w-4 h-4"></i>
                    </button>
                    <button type="button" class="block-delete text-slate-400 hover:text-red-600 p-1">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
                <div class="notion-block-content flex-1 border-2 border-green-200 bg-green-50 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">❓</span>
                        <h4 class="text-lg font-semibold text-green-900">Test Sorusu</h4>
                    </div>
                    <div class="quiz-editor space-y-3">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Soru Metni</label>
                            <textarea
                                class="quiz-question w-full p-2 border border-slate-300 rounded-md"
                                rows="3"
                                placeholder="Soruyu yazın..."
                            >${blockData.content || ''}</textarea>
                        </div>
                        <button type="button" class="configure-quiz-btn text-sm bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                            Cevap Seçeneklerini Yapılandır
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.attachBlockHandlers(block, blockData);
        this.attachQuizHandlers(block, blockData);
        return block;
    }

    attachBlockHandlers(block, blockData) {
        // Drag handle
        const dragHandle = block.querySelector('.block-drag-handle');
        if (dragHandle) {
            dragHandle.addEventListener('mousedown', (e) => this.handleDragStart(e, block));
        }

        // Add block
        const addBtn = block.querySelector('.block-add');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.handleAddBlock(block));
        }

        // Delete block
        const deleteBtn = block.querySelector('.block-delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.handleDeleteBlock(block));
        }

        // Content editable slash command detection
        const contentEditable = block.querySelector('[contenteditable="true"]');
        if (contentEditable) {
            contentEditable.addEventListener('input', (e) => this.handleContentInput(e, block, blockData));
            contentEditable.addEventListener('keydown', (e) => this.handleContentKeydown(e, block, blockData));
            contentEditable.addEventListener('blur', () => this.saveBlockContent(block, blockData));
        }

        // Initialize lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    attachTableHandlers(block) {
        const addRowBtn = block.querySelector('.block-table-add-row');
        const addColBtn = block.querySelector('.block-table-add-col');

        if (addRowBtn) {
            addRowBtn.addEventListener('click', () => this.addTableRow(block));
        }

        if (addColBtn) {
            addColBtn.addEventListener('click', () => this.addTableColumn(block));
        }
    }

    attachProblemHandlers(block, blockData) {
        const configureBtn = block.querySelector('.configure-problem-btn');
        if (configureBtn) {
            configureBtn.addEventListener('click', () => {
                this.openProblemConfigModal(block, blockData);
            });
        }

        const textarea = block.querySelector('.problem-description');
        if (textarea) {
            textarea.addEventListener('input', () => {
                blockData.content = textarea.value;
                this.triggerChange();
            });
        }
    }

    attachQuizHandlers(block, blockData) {
        const configureBtn = block.querySelector('.configure-quiz-btn');
        if (configureBtn) {
            configureBtn.addEventListener('click', () => {
                this.openQuizConfigModal(block, blockData);
            });
        }

        const textarea = block.querySelector('.quiz-question');
        if (textarea) {
            textarea.addEventListener('input', () => {
                blockData.content = textarea.value;
                this.triggerChange();
            });
        }
    }

    handleContentInput(e, block, blockData) {
        const content = e.target.textContent;

        // Detect slash command
        if (content.startsWith('/')) {
            this.showSlashMenu(block, content.substring(1));
        } else {
            this.hideSlashMenu();
        }
    }

    handleContentKeydown(e, block, blockData) {
        // Handle Enter key
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const index = Array.from(this.container.children).indexOf(block);
            this.addBlock('paragraph', '', index);
        }

        // Handle Backspace on empty block
        if (e.key === 'Backspace' && e.target.textContent === '') {
            e.preventDefault();
            this.handleDeleteBlock(block);
        }
    }

    showSlashMenu(block, filter = '') {
        this.hideSlashMenu();

        const menu = document.createElement('div');
        menu.id = 'slash-menu';
        menu.className = 'absolute z-50 bg-white rounded-lg shadow-lg border border-slate-200 p-2 mt-1 w-80 max-h-96 overflow-y-auto';

        const filteredTypes = Object.entries(this.blockTypes).filter(([key, type]) => {
            return type.name.toLowerCase().includes(filter.toLowerCase()) ||
                   type.description.toLowerCase().includes(filter.toLowerCase());
        });

        if (filteredTypes.length === 0) {
            menu.innerHTML = '<div class="p-2 text-sm text-slate-500">Sonuç bulunamadı</div>';
        } else {
            filteredTypes.forEach(([key, type]) => {
                const item = document.createElement('button');
                item.type = 'button';
                item.className = 'w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 flex items-start gap-3';
                item.innerHTML = `
                    <span class="text-xl">${type.icon}</span>
                    <div class="flex-1">
                        <div class="font-medium text-sm">${type.name}</div>
                        <div class="text-xs text-slate-500">${type.description}</div>
                    </div>
                `;
                item.addEventListener('click', () => {
                    this.convertBlockType(block, key);
                    this.hideSlashMenu();
                });
                menu.appendChild(item);
            });
        }

        block.appendChild(menu);
        this.slashMenuVisible = true;
        this.currentBlock = block;
    }

    hideSlashMenu() {
        const menu = document.getElementById('slash-menu');
        if (menu) {
            menu.remove();
        }
        this.slashMenuVisible = false;
    }

    convertBlockType(block, newType) {
        const blockId = block.dataset.blockId;
        const blockIndex = this.blocks.findIndex(b => b.id === blockId);
        if (blockIndex === -1) return;

        const oldBlockData = this.blocks[blockIndex];
        const contentEditable = block.querySelector('[contenteditable="true"]');
        const content = contentEditable ? contentEditable.textContent.replace(/^\/\w*\s*/, '') : '';

        // Remove old block
        block.remove();
        this.blocks.splice(blockIndex, 1);

        // Create new block
        const newBlockData = {
            id: blockId,
            type: newType,
            content: content,
            properties: {}
        };

        const newBlock = this.blockTypes[newType].template(newBlockData);

        if (blockIndex < this.container.children.length) {
            this.container.insertBefore(newBlock, this.container.children[blockIndex]);
        } else {
            this.container.appendChild(newBlock);
        }

        this.blocks.splice(blockIndex, 0, newBlockData);

        // Focus new block
        const newContentEditable = newBlock.querySelector('[contenteditable="true"]');
        if (newContentEditable) {
            newContentEditable.focus();
        }

        this.triggerChange();
    }

    handleAddBlock(afterBlock) {
        const index = Array.from(this.container.children).indexOf(afterBlock);
        this.addBlock('paragraph', '', index);
    }

    handleDeleteBlock(block) {
        const blockId = block.dataset.blockId;
        const blockIndex = this.blocks.findIndex(b => b.id === blockId);

        if (blockIndex !== -1) {
            this.blocks.splice(blockIndex, 1);
        }

        block.remove();

        // Focus previous block or add new paragraph if empty
        if (this.container.children.length === 0) {
            this.addBlock('paragraph');
        } else {
            const prevBlock = this.container.children[Math.max(0, blockIndex - 1)];
            const contentEditable = prevBlock?.querySelector('[contenteditable="true"]');
            if (contentEditable) {
                contentEditable.focus();
            }
        }

        this.triggerChange();
    }

    saveBlockContent(block, blockData) {
        const contentEditable = block.querySelector('[contenteditable="true"]');
        if (contentEditable) {
            blockData.content = contentEditable.innerHTML;
            this.triggerChange();
        }
    }

    addTableRow(block) {
        const table = block.querySelector('table tbody');
        if (!table) return;

        const cols = table.querySelector('tr')?.children.length || 3;
        const newRow = document.createElement('tr');

        for (let i = 0; i < cols; i++) {
            const cell = document.createElement('td');
            cell.className = 'border border-slate-300 p-2';
            cell.contentEditable = true;
            newRow.appendChild(cell);
        }

        table.appendChild(newRow);
        this.triggerChange();
    }

    addTableColumn(block) {
        const table = block.querySelector('table tbody');
        if (!table) return;

        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const cell = document.createElement('td');
            cell.className = 'border border-slate-300 p-2';
            cell.contentEditable = true;
            row.appendChild(cell);
        });

        this.triggerChange();
    }

    openProblemConfigModal(block, blockData) {
        // This will be implemented with the full problem configuration UI
        console.log('Opening problem config modal for', blockData);
        // TODO: Implement full problem configuration modal
    }

    openQuizConfigModal(block, blockData) {
        // This will be implemented with the full quiz configuration UI
        console.log('Opening quiz config modal for', blockData);
        // TODO: Implement full quiz configuration modal
    }

    handleDragStart(e, block) {
        // TODO: Implement drag and drop functionality
        console.log('Drag started', block);
    }

    triggerChange() {
        if (this.options.onChange && typeof this.options.onChange === 'function') {
            this.options.onChange(this.getBlocks());
        }
    }

    getBlocks() {
        // Sync current content with block data
        this.blocks.forEach(blockData => {
            const blockElement = this.container.querySelector(`[data-block-id="${blockData.id}"]`);
            if (!blockElement) return;

            if (blockData.type === 'table') {
                // Extract table data
                const table = blockElement.querySelector('table');
                blockData.content = table ? table.outerHTML : '';
            } else if (blockData.type === 'problem') {
                const textarea = blockElement.querySelector('.problem-description');
                blockData.content = textarea ? textarea.value : '';
            } else if (blockData.type === 'quiz') {
                const textarea = blockElement.querySelector('.quiz-question');
                blockData.content = textarea ? textarea.value : '';
            } else {
                const contentEditable = blockElement.querySelector('[contenteditable="true"]');
                blockData.content = contentEditable ? contentEditable.innerHTML : '';
            }
        });

        return this.blocks;
    }

    setBlocks(blocks) {
        this.container.innerHTML = '';
        this.blocks = [];

        blocks.forEach(blockData => {
            const blockElement = this.blockTypes[blockData.type].template(blockData);
            this.container.appendChild(blockElement);
            this.blocks.push(blockData);
        });

        if (this.blocks.length === 0) {
            this.addBlock('paragraph');
        }
    }

    destroy() {
        this.hideSlashMenu();
        this.container.innerHTML = '';
        this.blocks = [];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotionBlockEditor;
}
