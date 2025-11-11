/**
 * Simple Block Editor
 * Basic Notion-like editor with heading, paragraph, and table blocks
 */

class SimpleBlockEditor {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container ${containerId} not found`);
        }

        this.blocks = [];
        this.slashMenuVisible = false;
        this.selectedMenuIndex = 0;
        this.currentBlockIndex = null;
        this.filteredMenuTypes = [];
        this.formattingToolbarVisible = false;
        this.options = {
            onChange: null,
            ...options
        };

        this.blockTypes = {
            paragraph: {
                name: 'Paragraf',
                icon: '📝',
                create: this.createParagraphBlock.bind(this)
            },
            heading1: {
                name: 'Başlık 1',
                icon: 'H1',
                create: this.createHeadingBlock.bind(this, 1)
            },
            heading2: {
                name: 'Başlık 2',
                icon: 'H2',
                create: this.createHeadingBlock.bind(this, 2)
            },
            heading3: {
                name: 'Başlık 3',
                icon: 'H3',
                create: this.createHeadingBlock.bind(this, 3)
            },
            bulletList: {
                name: 'Madde İşaretli Liste',
                icon: '•',
                create: this.createBulletListBlock.bind(this)
            },
            numberedList: {
                name: 'Numaralı Liste',
                icon: '1.',
                create: this.createNumberedListBlock.bind(this)
            },
            todoList: {
                name: 'Yapılacaklar Listesi',
                icon: '☑',
                create: this.createTodoListBlock.bind(this)
            },
            quote: {
                name: 'Alıntı',
                icon: '💬',
                create: this.createQuoteBlock.bind(this)
            },
            code: {
                name: 'Kod Bloğu',
                icon: '⌨️',
                create: this.createCodeBlock.bind(this)
            },
            divider: {
                name: 'Ayırıcı Çizgi',
                icon: '─',
                create: this.createDividerBlock.bind(this)
            },
            image: {
                name: 'Resim Ekle',
                icon: '🖼️',
                create: this.createImageBlock.bind(this)
            },
            table: {
                name: 'Tablo',
                icon: '📊',
                create: this.createTableBlock.bind(this)
            }
        };

        this.init();
    }

    init() {
        this.container.innerHTML = '';
        this.container.className = 'simple-block-editor space-y-2 p-4 bg-white rounded-lg border border-slate-200 min-h-[400px]';

        if (this.blocks.length === 0) {
            this.addBlock('paragraph');
        } else {
            this.renderBlocks();
        }
    }

    addBlock(type, content = '', index = null) {
        const blockId = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const blockData = {
            id: blockId,
            type: type,
            content: content,
            properties: {}
        };

        if (index === null) {
            this.blocks.push(blockData);
        } else {
            this.blocks.splice(index + 1, 0, blockData);
        }

        this.renderBlocks();
        this.focusBlock(blockId);
        this.triggerChange();
    }

    renderBlocks() {
        this.container.innerHTML = '';
        this.blocks.forEach((block, index) => {
            const blockElement = this.blockTypes[block.type].create(block, index);
            this.container.appendChild(blockElement);
        });

        if (window.lucide) lucide.createIcons();
    }

    createParagraphBlock(blockData, index) {
        const block = document.createElement('div');
        block.className = 'block-wrapper group';
        block.dataset.blockId = blockData.id;
        block.dataset.blockIndex = index;

        block.innerHTML = `
            <div class="flex items-start gap-2">
                <div class="block-actions opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pt-1">
                    <button type="button" class="btn-icon-sm btn-icon-secondary" onclick="window.blockEditor && window.blockEditor.addBlockAfter(${index})" title="Ekle">
                        <i data-lucide="plus" class="w-3 h-3"></i>
                    </button>
                    <button type="button" class="btn-icon-sm btn-icon-danger" onclick="window.blockEditor && window.blockEditor.deleteBlock(${index})" title="Sil">
                        <i data-lucide="trash-2" class="w-3 h-3"></i>
                    </button>
                </div>
                <div
                    class="block-content flex-1 outline-none py-2 px-3 hover:bg-slate-50 rounded min-h-[32px]"
                    contenteditable="true"
                    data-placeholder="Metin yazın veya '/' ile komut menüsünü açın..."
                    oninput="window.blockEditor && window.blockEditor.handleInput(event, ${index})"
                    onkeydown="window.blockEditor && window.blockEditor.handleKeydown(event, ${index})"
                    onmouseup="window.blockEditor && window.blockEditor.handleTextSelection(event)"
                    onkeyup="window.blockEditor && window.blockEditor.handleTextSelection(event)"
                >${blockData.content || ''}</div>
            </div>
        `;

        return block;
    }

    createHeadingBlock(level, blockData, index) {
        const sizeClasses = {
            1: 'text-3xl font-bold',
            2: 'text-2xl font-semibold',
            3: 'text-xl font-semibold'
        };

        const block = document.createElement('div');
        block.className = 'block-wrapper group';
        block.dataset.blockId = blockData.id;
        block.dataset.blockIndex = index;

        block.innerHTML = `
            <div class="flex items-start gap-2">
                <div class="block-actions opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pt-1">
                    <button type="button" class="btn-icon-sm btn-icon-secondary" onclick="window.blockEditor && window.blockEditor.addBlockAfter(${index})" title="Ekle">
                        <i data-lucide="plus" class="w-3 h-3"></i>
                    </button>
                    <button type="button" class="btn-icon-sm btn-icon-danger" onclick="window.blockEditor && window.blockEditor.deleteBlock(${index})" title="Sil">
                        <i data-lucide="trash-2" class="w-3 h-3"></i>
                    </button>
                </div>
                <div
                    class="block-content flex-1 outline-none py-2 px-3 hover:bg-slate-50 rounded ${sizeClasses[level]}"
                    contenteditable="true"
                    data-placeholder="Başlık..."
                    oninput="window.blockEditor && window.blockEditor.handleInput(event, ${index})"
                    onkeydown="window.blockEditor && window.blockEditor.handleKeydown(event, ${index})"
                    onmouseup="window.blockEditor && window.blockEditor.handleTextSelection(event)"
                    onkeyup="window.blockEditor && window.blockEditor.handleTextSelection(event)"
                >${blockData.content || ''}</div>
            </div>
        `;

        return block;
    }

    createTableBlock(blockData, index) {
        const rows = blockData.properties?.rows || 3;
        const cols = blockData.properties?.cols || 3;

        let tableHTML = '<table class="w-full border-collapse border border-slate-300"><tbody>';
        for (let i = 0; i < rows; i++) {
            tableHTML += '<tr>';
            for (let j = 0; j < cols; j++) {
                const cellContent = blockData.properties?.cells?.[i]?.[j] || '';
                tableHTML += `<td class="border border-slate-300 p-2" contenteditable="true" oninput="blockEditor.updateTableCell(${index}, ${i}, ${j}, event)">${cellContent}</td>`;
            }
            tableHTML += '</tr>';
        }
        tableHTML += '</tbody></table>';

        const block = document.createElement('div');
        block.className = 'block-wrapper group';
        block.dataset.blockId = blockData.id;
        block.dataset.blockIndex = index;

        block.innerHTML = `
            <div class="flex items-start gap-2">
                <div class="block-actions opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 pt-1">
                    <button type="button" class="btn-icon-sm btn-icon-secondary" onclick="window.blockEditor && window.blockEditor.addTableRow(${index})" title="Satır Ekle">
                        <i data-lucide="plus-square" class="w-3 h-3"></i>
                    </button>
                    <button type="button" class="btn-icon-sm btn-icon-secondary" onclick="window.blockEditor && window.blockEditor.addTableColumn(${index})" title="Sütun Ekle">
                        <i data-lucide="columns" class="w-3 h-3"></i>
                    </button>
                    <button type="button" class="btn-icon-sm btn-icon-danger" onclick="window.blockEditor && window.blockEditor.deleteBlock(${index})" title="Sil">
                        <i data-lucide="trash-2" class="w-3 h-3"></i>
                    </button>
                </div>
                <div class="block-content flex-1 overflow-x-auto">
                    ${tableHTML}
                </div>
            </div>
        `;

        return block;
    }

    createBulletListBlock(blockData, index) {
        const block = document.createElement('div');
        block.className = 'block-wrapper group';
        block.dataset.blockId = blockData.id;
        block.dataset.blockIndex = index;

        block.innerHTML = `
            <div class="flex items-start gap-2">
                <div class="block-actions opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pt-1">
                    <button type="button" class="btn-icon-sm btn-icon-secondary" onclick="window.blockEditor && window.blockEditor.addBlockAfter(${index})" title="Ekle">
                        <i data-lucide="plus" class="w-3 h-3"></i>
                    </button>
                    <button type="button" class="btn-icon-sm btn-icon-danger" onclick="window.blockEditor && window.blockEditor.deleteBlock(${index})" title="Sil">
                        <i data-lucide="trash-2" class="w-3 h-3"></i>
                    </button>
                </div>
                <div class="flex items-start gap-3 flex-1">
                    <span class="text-lg font-bold pt-1">•</span>
                    <div
                        class="block-content flex-1 outline-none py-2 px-3 hover:bg-slate-50 rounded min-h-[32px]"
                        contenteditable="true"
                        data-placeholder="Liste öğesi..."
                        oninput="window.blockEditor && window.blockEditor.handleInput(event, ${index})"
                        onkeydown="window.blockEditor && window.blockEditor.handleKeydown(event, ${index})"
                        onmouseup="window.blockEditor && window.blockEditor.handleTextSelection(event)"
                        onkeyup="window.blockEditor && window.blockEditor.handleTextSelection(event)"
                    >${blockData.content || ''}</div>
                </div>
            </div>
        `;

        return block;
    }

    createNumberedListBlock(blockData, index) {
        const block = document.createElement('div');
        block.className = 'block-wrapper group';
        block.dataset.blockId = blockData.id;
        block.dataset.blockIndex = index;

        const listNumber = (blockData.properties?.listNumber || 1);

        block.innerHTML = `
            <div class="flex items-start gap-2">
                <div class="block-actions opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pt-1">
                    <button type="button" class="btn-icon-sm btn-icon-secondary" onclick="window.blockEditor && window.blockEditor.addBlockAfter(${index})" title="Ekle">
                        <i data-lucide="plus" class="w-3 h-3"></i>
                    </button>
                    <button type="button" class="btn-icon-sm btn-icon-danger" onclick="window.blockEditor && window.blockEditor.deleteBlock(${index})" title="Sil">
                        <i data-lucide="trash-2" class="w-3 h-3"></i>
                    </button>
                </div>
                <div class="flex items-start gap-3 flex-1">
                    <span class="text-sm font-semibold pt-2 min-w-[20px]">${listNumber}.</span>
                    <div
                        class="block-content flex-1 outline-none py-2 px-3 hover:bg-slate-50 rounded min-h-[32px]"
                        contenteditable="true"
                        data-placeholder="Liste öğesi..."
                        oninput="window.blockEditor && window.blockEditor.handleInput(event, ${index})"
                        onkeydown="window.blockEditor && window.blockEditor.handleKeydown(event, ${index})"
                        onmouseup="window.blockEditor && window.blockEditor.handleTextSelection(event)"
                        onkeyup="window.blockEditor && window.blockEditor.handleTextSelection(event)"
                    >${blockData.content || ''}</div>
                </div>
            </div>
        `;

        return block;
    }

    createTodoListBlock(blockData, index) {
        const block = document.createElement('div');
        block.className = 'block-wrapper group';
        block.dataset.blockId = blockData.id;
        block.dataset.blockIndex = index;

        const checked = blockData.properties?.checked || false;

        block.innerHTML = `
            <div class="flex items-start gap-2">
                <div class="block-actions opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pt-1">
                    <button type="button" class="btn-icon-sm btn-icon-secondary" onclick="window.blockEditor && window.blockEditor.addBlockAfter(${index})" title="Ekle">
                        <i data-lucide="plus" class="w-3 h-3"></i>
                    </button>
                    <button type="button" class="btn-icon-sm btn-icon-danger" onclick="window.blockEditor && window.blockEditor.deleteBlock(${index})" title="Sil">
                        <i data-lucide="trash-2" class="w-3 h-3"></i>
                    </button>
                </div>
                <div class="flex items-start gap-3 flex-1">
                    <input type="checkbox" ${checked ? 'checked' : ''}
                           class="mt-3 w-4 h-4 cursor-pointer"
                           onchange="window.blockEditor && window.blockEditor.toggleTodoCheck(${index}, event)">
                    <div
                        class="block-content flex-1 outline-none py-2 px-3 hover:bg-slate-50 rounded min-h-[32px] ${checked ? 'line-through text-slate-500' : ''}"
                        contenteditable="true"
                        data-placeholder="Yapılacak..."
                        oninput="window.blockEditor && window.blockEditor.handleInput(event, ${index})"
                        onkeydown="window.blockEditor && window.blockEditor.handleKeydown(event, ${index})"
                        onmouseup="window.blockEditor && window.blockEditor.handleTextSelection(event)"
                        onkeyup="window.blockEditor && window.blockEditor.handleTextSelection(event)"
                    >${blockData.content || ''}</div>
                </div>
            </div>
        `;

        return block;
    }

    createQuoteBlock(blockData, index) {
        const block = document.createElement('div');
        block.className = 'block-wrapper group';
        block.dataset.blockId = blockData.id;
        block.dataset.blockIndex = index;

        block.innerHTML = `
            <div class="flex items-start gap-2">
                <div class="block-actions opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pt-1">
                    <button type="button" class="btn-icon-sm btn-icon-secondary" onclick="window.blockEditor && window.blockEditor.addBlockAfter(${index})" title="Ekle">
                        <i data-lucide="plus" class="w-3 h-3"></i>
                    </button>
                    <button type="button" class="btn-icon-sm btn-icon-danger" onclick="window.blockEditor && window.blockEditor.deleteBlock(${index})" title="Sil">
                        <i data-lucide="trash-2" class="w-3 h-3"></i>
                    </button>
                </div>
                <div class="flex items-start gap-3 flex-1">
                    <div class="w-1 bg-slate-300 rounded-full self-stretch"></div>
                    <div
                        class="block-content flex-1 outline-none py-2 px-3 hover:bg-slate-50 rounded min-h-[32px] italic text-slate-600"
                        contenteditable="true"
                        data-placeholder="Alıntı yazın..."
                        oninput="window.blockEditor && window.blockEditor.handleInput(event, ${index})"
                        onkeydown="window.blockEditor && window.blockEditor.handleKeydown(event, ${index})"
                        onmouseup="window.blockEditor && window.blockEditor.handleTextSelection(event)"
                        onkeyup="window.blockEditor && window.blockEditor.handleTextSelection(event)"
                    >${blockData.content || ''}</div>
                </div>
            </div>
        `;

        return block;
    }

    createCodeBlock(blockData, index) {
        const block = document.createElement('div');
        block.className = 'block-wrapper group';
        block.dataset.blockId = blockData.id;
        block.dataset.blockIndex = index;

        block.innerHTML = `
            <div class="flex items-start gap-2">
                <div class="block-actions opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pt-1">
                    <button type="button" class="btn-icon-sm btn-icon-secondary" onclick="window.blockEditor && window.blockEditor.addBlockAfter(${index})" title="Ekle">
                        <i data-lucide="plus" class="w-3 h-3"></i>
                    </button>
                    <button type="button" class="btn-icon-sm btn-icon-danger" onclick="window.blockEditor && window.blockEditor.deleteBlock(${index})" title="Sil">
                        <i data-lucide="trash-2" class="w-3 h-3"></i>
                    </button>
                </div>
                <div
                    class="block-content flex-1 outline-none py-3 px-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-sm whitespace-pre-wrap"
                    contenteditable="true"
                    data-placeholder="Kod yazın..."
                    oninput="window.blockEditor && window.blockEditor.handleInput(event, ${index})"
                    onkeydown="window.blockEditor && window.blockEditor.handleKeydown(event, ${index})"
                    onmouseup="window.blockEditor && window.blockEditor.handleTextSelection(event)"
                    onkeyup="window.blockEditor && window.blockEditor.handleTextSelection(event)"
                >${blockData.content || ''}</div>
            </div>
        `;

        return block;
    }

    createDividerBlock(blockData, index) {
        const block = document.createElement('div');
        block.className = 'block-wrapper group';
        block.dataset.blockId = blockData.id;
        block.dataset.blockIndex = index;

        block.innerHTML = `
            <div class="flex items-center gap-2 py-2">
                <div class="block-actions opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button type="button" class="btn-icon-sm btn-icon-secondary" onclick="window.blockEditor && window.blockEditor.addBlockAfter(${index})" title="Ekle">
                        <i data-lucide="plus" class="w-3 h-3"></i>
                    </button>
                    <button type="button" class="btn-icon-sm btn-icon-danger" onclick="window.blockEditor && window.blockEditor.deleteBlock(${index})" title="Sil">
                        <i data-lucide="trash-2" class="w-3 h-3"></i>
                    </button>
                </div>
                <div class="flex-1 h-px bg-slate-300"></div>
            </div>
        `;

        return block;
    }

    createImageBlock(blockData, index) {
        const block = document.createElement('div');
        block.className = 'block-wrapper group';
        block.dataset.blockId = blockData.id;
        block.dataset.blockIndex = index;

        const imageUrl = blockData.properties?.imageUrl || '';
        const caption = blockData.properties?.caption || '';

        block.innerHTML = `
            <div class="flex items-start gap-2">
                <div class="block-actions opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pt-1">
                    <button type="button" class="btn-icon-sm btn-icon-secondary" onclick="window.blockEditor && window.blockEditor.addBlockAfter(${index})" title="Ekle">
                        <i data-lucide="plus" class="w-3 h-3"></i>
                    </button>
                    <button type="button" class="btn-icon-sm btn-icon-danger" onclick="window.blockEditor && window.blockEditor.deleteBlock(${index})" title="Sil">
                        <i data-lucide="trash-2" class="w-3 h-3"></i>
                    </button>
                </div>
                <div class="flex-1">
                    ${imageUrl ? `
                        <div class="relative">
                            <img src="${imageUrl}" alt="${caption}" class="w-full rounded-lg border border-slate-200 mb-2">
                            <input type="text" value="${caption}" placeholder="Resim açıklaması..."
                                   class="w-full px-3 py-2 text-sm text-slate-600 border-none outline-none"
                                   oninput="window.blockEditor && window.blockEditor.updateImageCaption(${index}, event)">
                        </div>
                    ` : `
                        <div class="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer"
                             onclick="window.blockEditor && window.blockEditor.triggerImageUpload(${index})">
                            <i data-lucide="image" class="w-12 h-12 text-slate-400 mx-auto mb-3"></i>
                            <p class="text-slate-600 font-medium">Resim yüklemek için tıklayın</p>
                            <p class="text-slate-500 text-sm mt-1">veya buraya sürükleyip bırakın</p>
                        </div>
                        <input type="file" accept="image/*" class="hidden" id="image-upload-${index}"
                               onchange="window.blockEditor && window.blockEditor.handleImageUpload(${index}, event)">
                    `}
                </div>
            </div>
        `;

        return block;
    }

    handleInput(event, index) {
        const content = event.target.textContent || event.target.innerHTML;

        // Detect slash command
        if (content.startsWith('/')) {
            this.showSlashMenu(index, content.substring(1));
        } else {
            this.hideSlashMenu();
        }

        // Update block content
        this.blocks[index].content = content;
        this.triggerChange();
    }

    handleKeydown(event, index) {
        // Keyboard shortcuts for text formatting
        if (event.ctrlKey || event.metaKey) {
            const selection = window.getSelection();
            const hasSelection = selection && selection.toString().trim().length > 0;

            if (hasSelection) {
                switch(event.key.toLowerCase()) {
                    case 'b':
                        event.preventDefault();
                        this.applyFormat('bold');
                        return;
                    case 'i':
                        event.preventDefault();
                        this.applyFormat('italic');
                        return;
                    case 'u':
                        event.preventDefault();
                        this.applyFormat('underline');
                        return;
                    case 'e':
                        event.preventDefault();
                        this.applyFormat('code');
                        return;
                }
            }
        }

        // Arrow keys for menu navigation
        if (this.slashMenuVisible) {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                this.navigateMenu('down');
                return;
            }
            if (event.key === 'ArrowUp') {
                event.preventDefault();
                this.navigateMenu('up');
                return;
            }
            if (event.key === 'Enter') {
                event.preventDefault();
                this.selectMenuItem();
                return;
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                this.hideSlashMenu();
                return;
            }
        }

        // Enter key - add new paragraph (only when menu is not visible)
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.addBlock('paragraph', '', index);
        }

        // Backspace on empty block
        if (event.key === 'Backspace' && event.target.textContent === '') {
            event.preventDefault();
            this.deleteBlock(index);
        }

        // Escape - hide slash menu
        if (event.key === 'Escape') {
            this.hideSlashMenu();
        }
    }

    showSlashMenu(blockIndex, filter = '') {
        this.hideSlashMenu();

        const blockElement = document.querySelector(`[data-block-index="${blockIndex}"]`);
        if (!blockElement) return;

        const filteredTypes = Object.entries(this.blockTypes).filter(([key, type]) =>
            type.name.toLowerCase().includes(filter.toLowerCase())
        );

        if (filteredTypes.length === 0) return;

        // Store filtered types and reset selection
        this.filteredMenuTypes = filteredTypes;
        this.selectedMenuIndex = 0;
        this.currentBlockIndex = blockIndex;

        const menu = document.createElement('div');
        menu.id = 'slash-menu';
        menu.className = 'absolute z-50 bg-white rounded-lg shadow-lg border border-slate-200 p-2 mt-1 w-64 max-h-64 overflow-y-auto';

        filteredTypes.forEach(([key, type], index) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = `menu-item w-full text-left px-3 py-2 rounded-md flex items-center gap-3 ${index === 0 ? 'bg-indigo-50 border border-indigo-300' : 'hover:bg-slate-100'}`;
            item.dataset.menuIndex = index;
            item.innerHTML = `
                <span class="text-xl">${type.icon}</span>
                <span class="font-medium text-sm">${type.name}</span>
            `;
            item.addEventListener('click', () => {
                this.convertBlock(blockIndex, key);
                this.hideSlashMenu();
            });
            menu.appendChild(item);
        });

        blockElement.appendChild(menu);
        this.slashMenuVisible = true;
    }

    hideSlashMenu() {
        const menu = document.getElementById('slash-menu');
        if (menu) menu.remove();
        this.slashMenuVisible = false;
        this.selectedMenuIndex = 0;
        this.currentBlockIndex = null;
        this.filteredMenuTypes = [];
    }

    updateMenuSelection() {
        const menu = document.getElementById('slash-menu');
        if (!menu) return;

        const items = menu.querySelectorAll('.menu-item');
        items.forEach((item, index) => {
            if (index === this.selectedMenuIndex) {
                item.className = 'menu-item w-full text-left px-3 py-2 rounded-md flex items-center gap-3 bg-indigo-50 border border-indigo-300';
                // Scroll item into view if needed
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.className = 'menu-item w-full text-left px-3 py-2 rounded-md flex items-center gap-3 hover:bg-slate-100';
            }
        });
    }

    navigateMenu(direction) {
        if (!this.slashMenuVisible || this.filteredMenuTypes.length === 0) return false;

        if (direction === 'down') {
            this.selectedMenuIndex = (this.selectedMenuIndex + 1) % this.filteredMenuTypes.length;
        } else if (direction === 'up') {
            this.selectedMenuIndex = (this.selectedMenuIndex - 1 + this.filteredMenuTypes.length) % this.filteredMenuTypes.length;
        }

        this.updateMenuSelection();
        return true;
    }

    selectMenuItem() {
        if (!this.slashMenuVisible || this.filteredMenuTypes.length === 0) return false;

        const [key] = this.filteredMenuTypes[this.selectedMenuIndex];
        this.convertBlock(this.currentBlockIndex, key);
        this.hideSlashMenu();
        return true;
    }

    convertBlock(index, newType) {
        const block = this.blocks[index];
        const content = block.content.replace(/^\/\w*\s*/, '');

        this.blocks[index] = {
            id: block.id,
            type: newType,
            content: content,
            properties: {}
        };

        this.renderBlocks();
        this.triggerChange();
    }

    addBlockAfter(index) {
        this.addBlock('paragraph', '', index);
    }

    deleteBlock(index) {
        if (this.blocks.length === 1) return; // Keep at least one block

        this.blocks.splice(index, 1);
        this.renderBlocks();

        // Focus previous or next block
        const newIndex = Math.max(0, index - 1);
        if (this.blocks[newIndex]) {
            this.focusBlock(this.blocks[newIndex].id);
        }

        this.triggerChange();
    }

    updateTableCell(blockIndex, row, col, event) {
        const block = this.blocks[blockIndex];
        if (!block.properties.cells) {
            block.properties.cells = [];
        }

        if (!block.properties.cells[row]) {
            block.properties.cells[row] = [];
        }

        block.properties.cells[row][col] = event.target.textContent;
        this.triggerChange();
    }

    addTableRow(blockIndex) {
        const block = this.blocks[blockIndex];
        const cols = block.properties?.cols || 3;

        block.properties.rows = (block.properties.rows || 3) + 1;

        this.renderBlocks();
        this.triggerChange();
    }

    addTableColumn(blockIndex) {
        const block = this.blocks[blockIndex];

        block.properties.cols = (block.properties.cols || 3) + 1;

        this.renderBlocks();
        this.triggerChange();
    }

    toggleTodoCheck(index, event) {
        const block = this.blocks[index];
        if (!block.properties) block.properties = {};
        block.properties.checked = event.target.checked;
        this.renderBlocks();
        this.triggerChange();
    }

    triggerImageUpload(index) {
        const fileInput = document.getElementById(`image-upload-${index}`);
        if (fileInput) {
            fileInput.click();
        }
    }

    handleImageUpload(index, event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const block = this.blocks[index];
                if (!block.properties) block.properties = {};
                block.properties.imageUrl = e.target.result;
                block.properties.caption = block.properties.caption || '';
                this.renderBlocks();
                this.triggerChange();
            };
            reader.readAsDataURL(file);
        }
    }

    updateImageCaption(index, event) {
        const block = this.blocks[index];
        if (!block.properties) block.properties = {};
        block.properties.caption = event.target.value;
        this.triggerChange();
    }

    // ============ Text Formatting Toolbar ============

    handleTextSelection(event) {
        setTimeout(() => {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();

            // Hide toolbar if no text selected
            if (!selectedText || selectedText.length === 0) {
                this.hideFormattingToolbar();
                return;
            }

            // Check if selection is within a contenteditable block
            const selectedElement = selection.anchorNode?.parentElement;
            const isInEditor = selectedElement?.closest('.block-content');

            if (isInEditor && selectedText.length > 0) {
                this.showFormattingToolbar(selection);
            } else {
                this.hideFormattingToolbar();
            }
        }, 50);
    }

    showFormattingToolbar(selection) {
        this.hideFormattingToolbar();

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        const toolbar = document.createElement('div');
        toolbar.id = 'formatting-toolbar';
        toolbar.className = 'fixed flex items-center gap-1 bg-slate-900 rounded-lg shadow-xl p-1.5';
        toolbar.style.left = `${rect.left + (rect.width / 2)}px`;
        toolbar.style.top = `${rect.top - 45}px`;
        toolbar.style.transform = 'translateX(-50%)';
        toolbar.style.zIndex = '9999';

        const formats = [
            { name: 'bold', icon: 'B', title: 'Kalın (Ctrl+B)', class: 'font-bold' },
            { name: 'italic', icon: 'I', title: 'İtalik (Ctrl+I)', class: 'italic' },
            { name: 'underline', icon: 'U', title: 'Altı çizili (Ctrl+U)', class: 'underline' },
            { name: 'strikethrough', icon: 'S', title: 'Üstü çizili', class: 'line-through' },
            { name: 'code', icon: '</>', title: 'Kod (Ctrl+E)', class: 'font-mono text-xs' }
        ];

        formats.forEach(format => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `px-2.5 py-1.5 text-white hover:bg-slate-700 rounded transition-colors ${format.class}`;
            btn.title = format.title;
            btn.innerHTML = format.icon;
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.applyFormat(format.name);
            });
            toolbar.appendChild(btn);
        });

        document.body.appendChild(toolbar);
        this.formattingToolbarVisible = true;
    }

    hideFormattingToolbar() {
        const toolbar = document.getElementById('formatting-toolbar');
        if (toolbar) {
            toolbar.remove();
            this.formattingToolbarVisible = false;
        }
    }

    applyFormat(formatType) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const selectedText = range.toString();

        if (!selectedText) return;

        // Create formatting element
        let formattedElement;
        switch (formatType) {
            case 'bold':
                formattedElement = document.createElement('strong');
                break;
            case 'italic':
                formattedElement = document.createElement('em');
                break;
            case 'underline':
                formattedElement = document.createElement('u');
                break;
            case 'strikethrough':
                formattedElement = document.createElement('s');
                break;
            case 'code':
                formattedElement = document.createElement('code');
                formattedElement.className = 'px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded text-sm font-mono';
                break;
        }

        if (formattedElement) {
            try {
                range.surroundContents(formattedElement);
                this.triggerChange();
            } catch (e) {
                // If surroundContents fails, use alternative method
                formattedElement.textContent = selectedText;
                range.deleteContents();
                range.insertNode(formattedElement);
                this.triggerChange();
            }
        }

        // Clear selection and hide toolbar
        selection.removeAllRanges();
        this.hideFormattingToolbar();
    }

    focusBlock(blockId) {
        setTimeout(() => {
            const block = document.querySelector(`[data-block-id="${blockId}"] .block-content`);
            if (block) {
                block.focus();
                // Move cursor to end
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(block);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }, 0);
    }

    triggerChange() {
        if (this.options.onChange && typeof this.options.onChange === 'function') {
            this.options.onChange(this.getBlocks());
        }
    }

    getBlocks() {
        // Sync content from DOM
        this.blocks.forEach((block, index) => {
            const blockElement = document.querySelector(`[data-block-index="${index}"] .block-content`);
            if (blockElement && block.type !== 'table') {
                block.content = blockElement.innerHTML;
            }
        });

        return this.blocks;
    }

    setBlocks(blocks) {
        this.blocks = blocks || [];
        if (this.blocks.length === 0) {
            this.blocks.push({
                id: `block-${Date.now()}`,
                type: 'paragraph',
                content: '',
                properties: {}
            });
        }
        this.renderBlocks();
    }

    clear() {
        this.blocks = [];
        this.init();
    }
}

// Global instance
let blockEditor;
if (typeof window !== 'undefined') {
    window.SimpleBlockEditor = SimpleBlockEditor;
}
