/**
 * Slash Commands Module - Notion-style command palette
 * Provides rich editing capabilities with keyboard-driven interface
 */

const SlashCommands = {
    // State
    initialized: false,
    isOpen: false,
    currentQuery: '',
    selectedIndex: 0,
    filteredCommands: [],
    triggerPosition: null,
    editor: null,

    // DOM elements
    menu: null,
    menuList: null,

    /**
     * Command registry with categories
     */
    commands: {
        // Text Formatting
        heading1: {
            category: 'Metin Formatı',
            icon: 'heading-1',
            label: 'Başlık 1',
            keywords: ['h1', 'baslik', 'başlık', 'heading'],
            execute: (editor) => {
                // Save current selection
                const selection = window.getSelection();
                const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

                document.execCommand('formatBlock', false, 'h1');
                SlashCommands.applyStyle('text-3xl font-bold text-gray-900 mb-4 mt-6');

                // Restore focus and cursor
                editor.focus();
                if (range) {
                    try {
                        selection.removeAllRanges();
                        selection.addRange(range);
                    } catch (e) {
                        console.log('Could not restore range:', e);
                    }
                }
            }
        },
        heading2: {
            category: 'Metin Formatı',
            icon: 'heading-2',
            label: 'Başlık 2',
            keywords: ['h2', 'baslik', 'başlık'],
            execute: (editor) => {
                const selection = window.getSelection();
                const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

                document.execCommand('formatBlock', false, 'h2');
                SlashCommands.applyStyle('text-2xl font-semibold text-gray-900 mb-3 mt-5');

                editor.focus();
                if (range) {
                    try {
                        selection.removeAllRanges();
                        selection.addRange(range);
                    } catch (e) {
                        console.log('Could not restore range:', e);
                    }
                }
            }
        },
        heading3: {
            category: 'Metin Formatı',
            icon: 'heading-3',
            label: 'Başlık 3',
            keywords: ['h3', 'baslik', 'başlık'],
            execute: (editor) => {
                const selection = window.getSelection();
                const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

                document.execCommand('formatBlock', false, 'h3');
                SlashCommands.applyStyle('text-xl font-semibold text-gray-900 mb-2 mt-4');

                editor.focus();
                if (range) {
                    try {
                        selection.removeAllRanges();
                        selection.addRange(range);
                    } catch (e) {
                        console.log('Could not restore range:', e);
                    }
                }
            }
        },
        paragraph: {
            category: 'Metin Formatı',
            icon: 'text',
            label: 'Paragraf',
            keywords: ['p', 'paragraph', 'metin', 'text'],
            execute: (editor) => {
                const selection = window.getSelection();
                const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

                document.execCommand('formatBlock', false, 'p');
                SlashCommands.applyStyle('text-gray-700 leading-relaxed mb-4');

                editor.focus();
                if (range) {
                    try {
                        selection.removeAllRanges();
                        selection.addRange(range);
                    } catch (e) {
                        console.log('Could not restore range:', e);
                    }
                }
            }
        },
        bold: {
            category: 'Metin Formatı',
            icon: 'bold',
            label: 'Kalın',
            keywords: ['bold', 'kalin', 'kalın', 'strong'],
            execute: (editor) => {
                document.execCommand('bold', false, null);
            }
        },
        italic: {
            category: 'Metin Formatı',
            icon: 'italic',
            label: 'İtalik',
            keywords: ['italic', 'italik', 'em'],
            execute: (editor) => {
                document.execCommand('italic', false, null);
            }
        },
        underline: {
            category: 'Metin Formatı',
            icon: 'underline',
            label: 'Altı Çizili',
            keywords: ['underline', 'alti', 'altı', 'cizgi'],
            execute: (editor) => {
                document.execCommand('underline', false, null);
            }
        },
        highlight: {
            category: 'Metin Formatı',
            icon: 'highlighter',
            label: 'Vurgula',
            keywords: ['highlight', 'vurgu', 'mark'],
            execute: (editor) => {
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const mark = document.createElement('mark');
                    mark.className = 'bg-yellow-200 px-1';
                    range.surroundContents(mark);
                }
            }
        },

        // Lists
        bulletList: {
            category: 'Listeler',
            icon: 'list',
            label: 'Madde İşaretli Liste',
            keywords: ['ul', 'list', 'liste', 'madde', 'bullet'],
            execute: (editor) => {
                document.execCommand('insertUnorderedList', false, null);
                SlashCommands.applyStyle('list-disc list-inside space-y-2 mb-4 ml-4');
            }
        },
        numberedList: {
            category: 'Listeler',
            icon: 'list-ordered',
            label: 'Numaralı Liste',
            keywords: ['ol', 'numbered', 'numara', 'numaralı', 'sırali'],
            execute: (editor) => {
                document.execCommand('insertOrderedList', false, null);
                SlashCommands.applyStyle('list-decimal list-inside space-y-2 mb-4 ml-4');
            }
        },

        // Block Elements
        table: {
            category: 'Bloklar',
            icon: 'table',
            label: 'Tablo',
            keywords: ['table', 'tablo'],
            execute: (editor) => {
                const rows = prompt('Satır sayısı:', '3');
                const cols = prompt('Sütun sayısı:', '3');
                if (rows && cols) {
                    const table = SlashCommands.createTable(parseInt(rows), parseInt(cols));
                    SlashCommands.insertHTML(table);
                }
            }
        },
        codeBlock: {
            category: 'Bloklar',
            icon: 'code',
            label: 'Kod Bloğu',
            keywords: ['code', 'kod', 'pre'],
            execute: (editor) => {
                const code = `<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4"><code contenteditable="true">// Kodunuzu buraya yazın...</code></pre>`;
                SlashCommands.insertHTML(code);
            }
        },
        quote: {
            category: 'Bloklar',
            icon: 'quote',
            label: 'Alıntı',
            keywords: ['quote', 'alinti', 'alıntı', 'blockquote'],
            execute: (editor) => {
                const quote = `<blockquote class="border-l-4 border-indigo-500 pl-4 py-2 italic text-gray-700 bg-indigo-50 rounded-r-lg mb-4">Alıntı metni...</blockquote>`;
                SlashCommands.insertHTML(quote);
            }
        },
        divider: {
            category: 'Bloklar',
            icon: 'minus',
            label: 'Ayırıcı Çizgi',
            keywords: ['hr', 'divider', 'ayirici', 'ayırıcı', 'cizgi'],
            execute: (editor) => {
                document.execCommand('insertHorizontalRule', false, null);
            }
        },
        infoBox: {
            category: 'Bloklar',
            icon: 'info',
            label: 'Bilgi Kutusu',
            keywords: ['info', 'bilgi', 'box', 'kutu', 'not'],
            execute: (editor) => {
                const box = `<div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded-r-lg">
                    <div class="flex items-start">
                        <i data-lucide="info" class="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5"></i>
                        <div class="text-blue-900">
                            <strong class="font-semibold">Bilgi:</strong>
                            <p class="mt-1">Bilgi metni...</p>
                        </div>
                    </div>
                </div>`;
                SlashCommands.insertHTML(box);
                UIHelpers.refreshIcons();
            }
        },
        warningBox: {
            category: 'Bloklar',
            icon: 'alert-triangle',
            label: 'Uyarı Kutusu',
            keywords: ['warning', 'uyari', 'uyarı', 'dikkat'],
            execute: (editor) => {
                const box = `<div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4 rounded-r-lg">
                    <div class="flex items-start">
                        <i data-lucide="alert-triangle" class="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5"></i>
                        <div class="text-yellow-900">
                            <strong class="font-semibold">Uyarı:</strong>
                            <p class="mt-1">Uyarı metni...</p>
                        </div>
                    </div>
                </div>`;
                SlashCommands.insertHTML(box);
                UIHelpers.refreshIcons();
            }
        },

        // Accounting Specific
        accountCode: {
            category: 'Muhasebe',
            icon: 'hash',
            label: 'Hesap Kodu Referansı',
            keywords: ['hesap', 'kod', 'account', 'code'],
            execute: async (editor) => {
                const code = prompt('Hesap kodu (örn: 100):', '');
                if (code) {
                    try {
                        const response = await APIService.get(`/api/account-plans/code/${code}`);
                        if (response.ok) {
                            const account = await response.json();
                            const html = `<span class="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md font-mono text-sm">${account.code} - ${account.name}</span>`;
                            SlashCommands.insertHTML(html);
                        } else {
                            UIHelpers.showError('Hesap kodu bulunamadı!');
                        }
                    } catch (error) {
                        Logger.error('Error fetching account code:', error);
                        UIHelpers.showError('Hesap kodu yüklenemedi!');
                    }
                }
            }
        },
        tAccount: {
            category: 'Muhasebe',
            icon: 'calculator',
            label: 'T-Hesap Şablonu',
            keywords: ['t-hesap', 'thesap', 'muhasebe', 'borç', 'alacak'],
            execute: (editor) => {
                const accountName = prompt('Hesap adı:', 'Hesap Adı');
                const html = `
                <div class="mb-6 border border-gray-300 rounded-lg overflow-hidden">
                    <div class="bg-gray-100 text-center font-semibold py-2 border-b border-gray-300">
                        ${accountName}
                    </div>
                    <div class="grid grid-cols-2 divide-x divide-gray-300">
                        <div class="p-4">
                            <div class="text-center font-semibold mb-2 text-gray-700">Borç</div>
                            <div contenteditable="true" class="min-h-[100px] focus:outline-none">
                                <p>Borç kayıtları...</p>
                            </div>
                        </div>
                        <div class="p-4">
                            <div class="text-center font-semibold mb-2 text-gray-700">Alacak</div>
                            <div contenteditable="true" class="min-h-[100px] focus:outline-none">
                                <p>Alacak kayıtları...</p>
                            </div>
                        </div>
                    </div>
                </div>`;
                SlashCommands.insertHTML(html);
            }
        },
        journalEntry: {
            category: 'Muhasebe',
            icon: 'book-open',
            label: 'Yevmiye Kaydı Şablonu',
            keywords: ['yevmiye', 'kayit', 'kayıt', 'journal'],
            execute: (editor) => {
                const html = `
                <div class="mb-6 border border-gray-300 rounded-lg overflow-hidden">
                    <table class="w-full">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-4 py-2 text-left border-r border-gray-300">Hesap Kodu</th>
                                <th class="px-4 py-2 text-left border-r border-gray-300">Hesap Adı</th>
                                <th class="px-4 py-2 text-right border-r border-gray-300">Borç</th>
                                <th class="px-4 py-2 text-right">Alacak</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-t border-gray-300">
                                <td contenteditable="true" class="px-4 py-2 border-r border-gray-300">100</td>
                                <td contenteditable="true" class="px-4 py-2 border-r border-gray-300">Kasa</td>
                                <td contenteditable="true" class="px-4 py-2 text-right border-r border-gray-300">1.000</td>
                                <td class="px-4 py-2 text-right">-</td>
                            </tr>
                            <tr class="border-t border-gray-300">
                                <td contenteditable="true" class="px-4 py-2 border-r border-gray-300">600</td>
                                <td contenteditable="true" class="px-4 py-2 border-r border-gray-300">Satışlar</td>
                                <td class="px-4 py-2 text-right border-r border-gray-300">-</td>
                                <td contenteditable="true" class="px-4 py-2 text-right">1.000</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="bg-gray-50 px-4 py-2 text-sm text-gray-600 border-t border-gray-300">
                        <span contenteditable="true">Açıklama: ...</span>
                    </div>
                </div>`;
                SlashCommands.insertHTML(html);
            }
        }
    },

    /**
     * Initialize slash commands
     */
    init: function(editorElement) {
        // Prevent duplicate initialization
        if (this.initialized) {
            console.log('⚠️ Slash commands already initialized, skipping');
            return;
        }

        this.editor = editorElement;
        this.createMenu();
        this.attachEventListeners();
        this.initialized = true;
        Logger.log('Slash commands initialized');
    },

    /**
     * Create the command menu dropdown
     */
    createMenu: function() {
        const menu = document.createElement('div');
        menu.id = 'slashCommandMenu';
        menu.className = 'absolute hidden bg-white rounded-lg shadow-xl border border-gray-200 z-50 w-80 max-h-96 overflow-y-auto';
        menu.innerHTML = `
            <div class="p-2 border-b border-gray-100">
                <input
                    type="text"
                    id="commandSearch"
                    placeholder="Komut ara..."
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            <div id="commandList" class="py-2">
                <!-- Commands will be rendered here -->
            </div>
        `;
        document.body.appendChild(menu);
        this.menu = menu;
        this.menuList = menu.querySelector('#commandList');
    },

    /**
     * Attach event listeners
     */
    attachEventListeners: function() {
        if (!this.editor) return;

        // Listen for "/" key - use high priority by capturing
        this.editor.addEventListener('keydown', (e) => {
            // If menu is open, handle navigation first
            if (this.isOpen) {
                this.handleMenuNavigation(e);
                return;
            }

            // Handle slash key to open menu
            if (e.key === '/') {
                this.handleSlashKey(e);
            }
        }, true); // Use capture phase for priority

        // Close menu on click outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.menu.contains(e.target) && e.target !== this.editor) {
                this.closeMenu();
            }
        });

        // Search input
        const searchInput = this.menu.querySelector('#commandSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentQuery = e.target.value.toLowerCase();
                this.filterAndRenderCommands();
            });

            // Handle arrow keys in search input
            searchInput.addEventListener('keydown', (e) => {
                if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key)) {
                    this.handleMenuNavigation(e);
                }
            });
        }
    },

    /**
     * Handle slash key press
     */
    handleSlashKey: function(e) {
        // Show menu on next tick (after "/" is inserted)
        setTimeout(() => {
            // Save cursor position AFTER "/" is inserted
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                this.triggerPosition = selection.getRangeAt(0).cloneRange();
            }
            this.openMenu();
        }, 10);
    },

    /**
     * Open command menu
     */
    openMenu: function() {
        this.isOpen = true;
        this.currentQuery = '';
        this.selectedIndex = 0;
        this.filterAndRenderCommands();
        this.positionMenu();
        this.menu.classList.remove('hidden');

        // Focus search
        const searchInput = this.menu.querySelector('#commandSearch');
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
    },

    /**
     * Close command menu
     */
    closeMenu: function() {
        this.isOpen = false;
        this.menu.classList.add('hidden');

        // Return focus to editor
        if (this.editor) {
            this.editor.focus();

            // Try to restore cursor position if we have it
            if (this.triggerPosition) {
                try {
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(this.triggerPosition.cloneRange());
                } catch (e) {
                    console.log('Could not restore cursor position:', e);
                }
            }
        }

        this.triggerPosition = null;
    },

    /**
     * Position menu near cursor
     */
    positionMenu: function() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            this.menu.style.left = `${rect.left}px`;
            this.menu.style.top = `${rect.bottom + window.scrollY + 5}px`;
        }
    },

    /**
     * Filter and render commands based on query
     */
    filterAndRenderCommands: function() {
        const query = this.currentQuery.toLowerCase();

        // Filter commands
        this.filteredCommands = Object.entries(this.commands)
            .filter(([key, cmd]) => {
                if (!query) return true;
                return cmd.label.toLowerCase().includes(query) ||
                       cmd.keywords.some(k => k.includes(query));
            })
            .map(([key, cmd]) => ({ key, ...cmd }));

        // Group by category
        const grouped = {};
        this.filteredCommands.forEach(cmd => {
            if (!grouped[cmd.category]) {
                grouped[cmd.category] = [];
            }
            grouped[cmd.category].push(cmd);
        });

        // Render
        let html = '';
        Object.entries(grouped).forEach(([category, commands]) => {
            html += `
                <div class="mb-2">
                    <div class="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">${category}</div>
                    ${commands.map((cmd, idx) => this.renderCommandItem(cmd, idx)).join('')}
                </div>
            `;
        });

        if (html === '') {
            html = '<div class="px-3 py-4 text-center text-gray-500 text-sm">Komut bulunamadı</div>';
        }

        this.menuList.innerHTML = html;
        UIHelpers.refreshIcons();

        // Attach click handlers
        this.menuList.querySelectorAll('.command-item').forEach((item, idx) => {
            item.addEventListener('click', () => {
                this.executeCommand(this.filteredCommands[idx]);
            });
        });

        // Highlight first item
        this.updateSelection();
    },

    /**
     * Render single command item
     */
    renderCommandItem: function(cmd, index) {
        return `
            <div class="command-item px-3 py-2 cursor-pointer hover:bg-indigo-50 rounded-md flex items-center gap-3" data-index="${index}">
                <i data-lucide="${cmd.icon}" class="w-5 h-5 text-gray-600"></i>
                <div>
                    <div class="text-sm font-medium text-gray-900">${cmd.label}</div>
                </div>
            </div>
        `;
    },

    /**
     * Handle keyboard navigation in menu
     */
    handleMenuNavigation: function(e) {
        if (!this.isOpen) return;

        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                e.stopPropagation();
                this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredCommands.length - 1);
                this.updateSelection();
                break;
            case 'ArrowUp':
                e.preventDefault();
                e.stopPropagation();
                this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                this.updateSelection();
                break;
            case 'Enter':
                e.preventDefault();
                e.stopPropagation();
                if (this.filteredCommands[this.selectedIndex]) {
                    this.executeCommand(this.filteredCommands[this.selectedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                e.stopPropagation();
                this.closeMenu();
                break;
        }
    },

    /**
     * Update visual selection in menu
     */
    updateSelection: function() {
        const items = this.menuList.querySelectorAll('.command-item');
        items.forEach((item, idx) => {
            if (idx === this.selectedIndex) {
                item.classList.add('bg-indigo-100', 'ring-2', 'ring-indigo-500');
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.classList.remove('bg-indigo-100', 'ring-2', 'ring-indigo-500');
            }
        });
    },

    /**
     * Execute selected command
     */
    executeCommand: function(command) {
        // Remove the "/" trigger character
        this.removeSlashTrigger();

        // Execute command
        command.execute(this.editor);

        // Close menu
        this.closeMenu();

        Logger.log('Command executed:', command.label);
    },

    /**
     * Remove the "/" character that triggered the menu
     */
    removeSlashTrigger: function() {
        if (!this.triggerPosition) return;

        try {
            const selection = window.getSelection();

            // Restore the saved trigger position
            selection.removeAllRanges();
            selection.addRange(this.triggerPosition.cloneRange());

            // Move back one character to select the "/"
            const range = selection.getRangeAt(0);
            range.setStart(range.startContainer, Math.max(0, range.startOffset - 1));
            range.setEnd(range.endContainer, range.endOffset);

            // Delete the "/" character
            range.deleteContents();

            // Keep cursor at the same position
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        } catch (error) {
            console.error('Error removing slash trigger:', error);
        }
    },

    /**
     * Insert HTML at cursor position
     */
    insertHTML: function(html) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();

            const div = document.createElement('div');
            div.innerHTML = html;

            const frag = document.createDocumentFragment();
            while (div.firstChild) {
                frag.appendChild(div.firstChild);
            }

            range.insertNode(frag);

            // Move cursor after inserted content
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    },

    /**
     * Apply Tailwind classes to current selection/block
     */
    applyStyle: function(classes) {
        setTimeout(() => {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const element = selection.anchorNode.parentElement;
                if (element && element !== this.editor) {
                    element.className = classes;
                }
            }
        }, 10);
    },

    /**
     * Create HTML table
     */
    createTable: function(rows, cols) {
        let html = '<table class="w-full border-collapse border border-gray-300 mb-4 table-fixed">';

        // Header row
        html += '<thead class="bg-gray-100"><tr>';
        for (let j = 0; j < cols; j++) {
            html += `<th contenteditable="true" class="border border-gray-300 px-4 py-2 text-left font-semibold">Başlık ${j + 1}</th>`;
        }
        html += '</tr></thead>';

        // Body rows
        html += '<tbody>';
        for (let i = 0; i < rows - 1; i++) {
            html += '<tr>';
            for (let j = 0; j < cols; j++) {
                html += '<td contenteditable="true" class="border border-gray-300 px-4 py-2">Hücre</td>';
            }
            html += '</tr>';
        }
        html += '</tbody></table>';

        return html;
    }
};
