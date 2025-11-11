/**
 * Rich Text Editor with Slash Command Support
 * Simple contenteditable-based editor with formatting options
 */

class RichTextEditor {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            placeholder: options.placeholder || 'Yazmaya başlamak için "/" yazın...',
            initialContent: options.initialContent || '',
            onChange: options.onChange || (() => {})
        };

        this.editor = null;
        this.commandMenu = null;
        this.isCommandMenuOpen = false;
        this.commandFilter = '';
        this.selectedCommandIndex = 0;

        this.commands = [
            { id: 'heading1', label: 'Başlık 1', icon: 'type', action: () => this.formatBlock('h1') },
            { id: 'heading2', label: 'Başlık 2', icon: 'type', action: () => this.formatBlock('h2') },
            { id: 'heading3', label: 'Başlık 3', icon: 'type', action: () => this.formatBlock('h3') },
            { id: 'paragraph', label: 'Paragraf', icon: 'align-left', action: () => this.formatBlock('p') },
            { id: 'bold', label: 'Kalın', icon: 'bold', action: () => this.format('bold') },
            { id: 'italic', label: 'İtalik', icon: 'italic', action: () => this.format('italic') },
            { id: 'underline', label: 'Altı Çizili', icon: 'underline', action: () => this.format('underline') },
            { id: 'bulletList', label: 'Madde İşaretli Liste', icon: 'list', action: () => this.format('insertUnorderedList') },
            { id: 'numberedList', label: 'Numaralı Liste', icon: 'list-ordered', action: () => this.format('insertOrderedList') },
            { id: 'code', label: 'Kod Bloğu', icon: 'code', action: () => this.insertCodeBlock() },
            { id: 'quote', label: 'Alıntı', icon: 'quote', action: () => this.insertQuote() },
            { id: 'table', label: 'Tablo', icon: 'table', action: () => this.insertTable() },
            { id: 'divider', label: 'Ayırıcı Çizgi', icon: 'minus', action: () => this.insertDivider() }
        ];

        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
        if (this.options.initialContent) {
            this.setContent(this.options.initialContent);
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="rich-text-editor-wrapper border border-gray-300 rounded-lg bg-white" style="overflow: visible;">
                <!-- Toolbar -->
                <div class="editor-toolbar flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200 flex-wrap">
                    <button type="button" data-command="bold" class="p-2 hover:bg-gray-200 rounded" title="Kalın (Ctrl+B)">
                        <i data-lucide="bold" class="w-4 h-4"></i>
                    </button>
                    <button type="button" data-command="italic" class="p-2 hover:bg-gray-200 rounded" title="İtalik (Ctrl+I)">
                        <i data-lucide="italic" class="w-4 h-4"></i>
                    </button>
                    <button type="button" data-command="underline" class="p-2 hover:bg-gray-200 rounded" title="Altı Çizili (Ctrl+U)">
                        <i data-lucide="underline" class="w-4 h-4"></i>
                    </button>
                    <div class="w-px h-6 bg-gray-300 mx-1"></div>
                    <button type="button" data-command="h1" class="px-3 py-2 hover:bg-gray-200 rounded text-sm font-semibold" title="Başlık 1">
                        H1
                    </button>
                    <button type="button" data-command="h2" class="px-3 py-2 hover:bg-gray-200 rounded text-sm font-semibold" title="Başlık 2">
                        H2
                    </button>
                    <button type="button" data-command="h3" class="px-3 py-2 hover:bg-gray-200 rounded text-sm font-semibold" title="Başlık 3">
                        H3
                    </button>
                    <div class="w-px h-6 bg-gray-300 mx-1"></div>
                    <button type="button" data-command="insertUnorderedList" class="p-2 hover:bg-gray-200 rounded" title="Madde İşaretli Liste">
                        <i data-lucide="list" class="w-4 h-4"></i>
                    </button>
                    <button type="button" data-command="insertOrderedList" class="p-2 hover:bg-gray-200 rounded" title="Numaralı Liste">
                        <i data-lucide="list-ordered" class="w-4 h-4"></i>
                    </button>
                    <div class="w-px h-6 bg-gray-300 mx-1"></div>
                    <button type="button" data-command="table" class="p-2 hover:bg-gray-200 rounded" title="Tablo Ekle">
                        <i data-lucide="table" class="w-4 h-4"></i>
                    </button>
                    <button type="button" data-command="code" class="p-2 hover:bg-gray-200 rounded" title="Kod Bloğu">
                        <i data-lucide="code" class="w-4 h-4"></i>
                    </button>
                    <button type="button" data-command="quote" class="p-2 hover:bg-gray-200 rounded" title="Alıntı">
                        <i data-lucide="quote" class="w-4 h-4"></i>
                    </button>
                    <button type="button" data-command="divider" class="p-2 hover:bg-gray-200 rounded" title="Ayırıcı Çizgi">
                        <i data-lucide="minus" class="w-4 h-4"></i>
                    </button>
                </div>

                <!-- Editor Content Container -->
                <div class="relative" style="overflow: visible;">
                    <div id="richTextEditorContent"
                         contenteditable="true"
                         class="editor-content min-h-[400px] max-h-[600px] p-4 focus:outline-none overflow-y-auto"
                         data-placeholder="${this.options.placeholder}">
                    </div>

                    <!-- Command Menu - Using body append for proper positioning -->
                    <div id="slashCommandMenu" class="hidden fixed bg-white border border-gray-300 rounded-lg shadow-2xl min-w-[250px]" style="z-index: 999999;">
                        <div id="commandMenuItems" class="py-1 max-h-[300px] overflow-y-auto"></div>
                    </div>
                </div>
            </div>
        `;

        this.editor = this.container.querySelector('#richTextEditorContent');
        this.commandMenu = this.container.querySelector('#slashCommandMenu');

        // Initialize Lucide icons
        if (window.lucide) lucide.createIcons();
    }

    attachEventListeners() {
        // Toolbar buttons - use mousedown instead of click to prevent selection loss
        const toolbarButtons = this.container.querySelectorAll('.editor-toolbar button[data-command]');
        toolbarButtons.forEach(btn => {
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault(); // Prevent focus change
                const command = btn.dataset.command;
                this.handleToolbarCommand(command);
            });
        });

        // Editor input
        this.editor.addEventListener('input', () => {
            this.options.onChange(this.getContent());
        });

        // Slash command detection
        this.editor.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });

        // Store bound function for later removal
        this.handleClickOutside = (e) => {
            if (this.isCommandMenuOpen &&
                !this.commandMenu.contains(e.target) &&
                !this.editor.contains(e.target)) {
                this.closeCommandMenu();
            }
        };
    }

    handleKeyDown(e) {
        // Slash command trigger
        if (e.key === '/' && !this.isCommandMenuOpen) {
            // Check if we're at the start of a line or after a space
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const textNode = range.startContainer;

                // Safely get text content
                const textContent = textNode.textContent || textNode.nodeValue || '';
                const textBefore = textContent.substring(0, range.startOffset);

                if (textBefore.trim() === '' || textBefore.endsWith(' ')) {
                    e.preventDefault();
                    this.openCommandMenu();
                    return; // Don't process "/" as a filter character
                }
            }
        }

        // Command menu navigation
        if (this.isCommandMenuOpen) {
            if (e.key === 'Escape') {
                e.preventDefault();
                this.closeCommandMenu();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.selectNextCommand();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.selectPreviousCommand();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this.executeSelectedCommand();
            } else if (e.key === 'Backspace' && this.commandFilter === '') {
                this.closeCommandMenu();
            } else if (e.key.length === 1) {
                // Filter commands as user types
                this.commandFilter += e.key;
                this.updateCommandMenu();
            }
        }

        // Keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch(e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    this.format('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    this.format('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    this.format('underline');
                    break;
            }
        }
    }

    handleToolbarCommand(command) {
        // mousedown preventDefault keeps selection, just execute command
        if (command === 'h1' || command === 'h2' || command === 'h3') {
            this.formatBlock(command);
        } else if (command === 'table') {
            this.insertTable();
        } else if (command === 'code') {
            this.insertCodeBlock();
        } else if (command === 'quote') {
            this.insertQuote();
        } else if (command === 'divider') {
            this.insertDivider();
        } else {
            this.format(command);
        }
    }

    format(command) {
        document.execCommand(command, false, null);
    }

    formatBlock(tag) {
        // document.execCommand requires <tag> format, not just tag
        const formattedTag = tag.startsWith('<') ? tag : `<${tag}>`;
        document.execCommand('formatBlock', false, formattedTag);
    }

    insertCodeBlock() {
        const code = prompt('Kod bloğu içeriği:');
        if (code) {
            const pre = document.createElement('pre');
            const codeEl = document.createElement('code');
            codeEl.textContent = code;
            codeEl.className = 'bg-gray-100 p-4 rounded block';
            pre.appendChild(codeEl);
            this.insertNode(pre);
        }
    }

    insertQuote() {
        const blockquote = document.createElement('blockquote');
        blockquote.className = 'border-l-4 border-indigo-500 pl-4 italic text-gray-700 my-4';
        blockquote.textContent = 'Alıntı metni...';
        this.insertNode(blockquote);
    }

    insertTable() {
        const rows = prompt('Satır sayısı:', '3');
        const cols = prompt('Sütun sayısı:', '3');

        if (rows && cols) {
            const table = document.createElement('table');
            table.className = 'border-collapse border border-gray-300 my-4 w-full';

            for (let i = 0; i < parseInt(rows); i++) {
                const tr = document.createElement('tr');
                for (let j = 0; j < parseInt(cols); j++) {
                    const td = document.createElement('td');
                    td.className = 'border border-gray-300 px-4 py-2';
                    td.textContent = i === 0 ? `Başlık ${j+1}` : `Hücre ${i},${j+1}`;
                    tr.appendChild(td);
                }
                table.appendChild(tr);
            }

            this.insertNode(table);
        }
    }

    insertDivider() {
        const hr = document.createElement('hr');
        hr.className = 'my-6 border-t-2 border-gray-300';
        this.insertNode(hr);
    }

    insertNode(node) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(node);

            // Move cursor after inserted node
            range.setStartAfter(node);
            range.setEndAfter(node);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    openCommandMenu() {
        this.isCommandMenuOpen = true;
        this.commandFilter = '';
        this.selectedCommandIndex = 0;
        this.updateCommandMenu();

        // Position menu ABOVE cursor (like Notion) - using fixed positioning
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Fixed positioning uses viewport coordinates directly
        // Position menu just above the cursor line (8px above)
        const top = rect.top - 8;
        const left = rect.left;

        this.commandMenu.style.top = `${top}px`;
        this.commandMenu.style.left = `${left}px`;

        // Ensure menu doesn't go off-screen
        this.commandMenu.classList.remove('hidden');

        // Adjust if menu would go off bottom of viewport
        const menuHeight = this.commandMenu.offsetHeight || 300;
        if (top + menuHeight > window.innerHeight) {
            this.commandMenu.style.top = `${rect.bottom + 5}px`; // Below cursor instead
        }

        // Adjust if menu would go off right of viewport
        const menuWidth = this.commandMenu.offsetWidth || 250;
        if (left + menuWidth > window.innerWidth) {
            this.commandMenu.style.left = `${window.innerWidth - menuWidth - 10}px`;
        }

        // Add click outside listener when menu opens
        // Use timeout to prevent immediate closing from the same click
        setTimeout(() => {
            document.addEventListener('mousedown', this.handleClickOutside);
        }, 0);
    }

    closeCommandMenu() {
        this.isCommandMenuOpen = false;
        this.commandFilter = '';
        this.commandMenu.classList.add('hidden');

        // Remove click outside listener when menu closes
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    updateCommandMenu() {
        const filteredCommands = this.commands.filter(cmd =>
            cmd.label.toLowerCase().includes(this.commandFilter.toLowerCase())
        );

        const menuItems = this.container.querySelector('#commandMenuItems');
        menuItems.innerHTML = filteredCommands.map((cmd, index) => `
            <div class="command-item px-4 py-2 cursor-pointer hover:bg-indigo-50 flex items-center gap-3 ${index === this.selectedCommandIndex ? 'bg-indigo-100' : ''}"
                 data-command-id="${cmd.id}">
                <i data-lucide="${cmd.icon}" class="w-4 h-4 text-gray-600"></i>
                <span class="text-sm font-medium">${cmd.label}</span>
            </div>
        `).join('');

        if (window.lucide) lucide.createIcons();

        // Add click handlers
        menuItems.querySelectorAll('.command-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.selectedCommandIndex = index;
                this.executeSelectedCommand();
            });
        });
    }

    selectNextCommand() {
        const filteredCommands = this.commands.filter(cmd =>
            cmd.label.toLowerCase().includes(this.commandFilter.toLowerCase())
        );
        this.selectedCommandIndex = (this.selectedCommandIndex + 1) % filteredCommands.length;
        this.updateCommandMenu();
    }

    selectPreviousCommand() {
        const filteredCommands = this.commands.filter(cmd =>
            cmd.label.toLowerCase().includes(this.commandFilter.toLowerCase())
        );
        this.selectedCommandIndex = (this.selectedCommandIndex - 1 + filteredCommands.length) % filteredCommands.length;
        this.updateCommandMenu();
    }

    executeSelectedCommand() {
        const filteredCommands = this.commands.filter(cmd =>
            cmd.label.toLowerCase().includes(this.commandFilter.toLowerCase())
        );

        if (filteredCommands[this.selectedCommandIndex]) {
            filteredCommands[this.selectedCommandIndex].action();
            this.closeCommandMenu();
        }
    }

    getContent() {
        return this.editor.innerHTML;
    }

    setContent(html) {
        this.editor.innerHTML = html;
    }

    clear() {
        this.editor.innerHTML = '';
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.RichTextEditor = RichTextEditor;
}
