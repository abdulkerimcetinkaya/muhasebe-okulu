/**
 * Study Section Manager with Notion-style Block Editor
 * Manages CardSection entities with JSON block-based content
 */

class StudySectionManager {
    constructor() {
        this.cards = [];
        this.sections = [];
        this.currentCard = null;
        this.currentSection = null;
        this.blockEditor = null;
        this.apiBase = '/api/admin/study-cards';
        this.token = localStorage.getItem('token');
    }

    async init() {
        await this.loadCards();
        this.renderCardSelector();
        this.renderSectionArea();
    }

    // ============ API Methods ============

    async apiCall(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
        };

        const response = await fetch(url, { ...defaultOptions, ...options });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        if (response.status === 204) {
            return null;
        }

        return response.json();
    }

    async loadCards() {
        this.cards = await this.apiCall(this.apiBase);
        this.cards.sort((a, b) => a.displayOrder - b.displayOrder);
    }

    async loadSections(cardId) {
        this.sections = await this.apiCall(`${this.apiBase}/${cardId}/sections`);
        this.sections.sort((a, b) => a.displayOrder - b.displayOrder);
        return this.sections;
    }

    async createSection(data) {
        return await this.apiCall(`${this.apiBase}/sections`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateSection(id, data) {
        return await this.apiCall(`${this.apiBase}/sections/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteSection(id) {
        await this.apiCall(`${this.apiBase}/sections/${id}`, {
            method: 'DELETE'
        });
    }

    // ============ UI Rendering ============

    renderCardSelector() {
        const container = document.getElementById('study-section-card-selector');
        if (!container) return;

        if (this.cards.length === 0) {
            container.innerHTML = `
                <div class="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                    <i data-lucide="alert-triangle" class="w-16 h-16 text-amber-500 mx-auto mb-4"></i>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Henüz kart yok</h3>
                    <p class="text-gray-600 text-sm">Önce "Kart Yönetimi" sekmesinden bir kart oluşturun</p>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        // Modern dropdown selector
        container.innerHTML = `
            <div class="bg-white rounded-lg border border-gray-200 p-5">
                <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <i data-lucide="book-open" class="w-4 h-4 text-indigo-600"></i>
                    Çalışma Kartı Seçin
                </label>

                <div class="relative">
                    <select id="card-select" class="study-card-dropdown">
                        <option value="">Kart seçiniz...</option>
                        ${this.cards.map(card => `
                            <option value="${card.id}" ${this.currentCard?.id === card.id ? 'selected' : ''}>
                                ${card.displayOrder}. ${this.escapeHtml(card.title)} (${card.sectionCount || 0} bölüm)
                            </option>
                        `).join('')}
                    </select>
                    <i data-lucide="chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"></i>
                </div>

                ${this.currentCard ? `
                    <div class="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                        <div class="flex items-start gap-3">
                            <div class="flex-shrink-0 w-10 h-10 rounded-lg ${this.currentCard.color || 'bg-indigo-100'} flex items-center justify-center shadow-sm">
                                ${this.currentCard.icon ? `<span class="text-2xl">${this.currentCard.icon}</span>` : `<i data-lucide="book" class="w-5 h-5 text-indigo-600"></i>`}
                            </div>
                            <div class="flex-1 min-w-0">
                                <h4 class="font-semibold text-gray-900 text-sm mb-1">
                                    ${this.escapeHtml(this.currentCard.title)}
                                </h4>
                                ${this.currentCard.description ? `
                                    <p class="text-xs text-gray-600 mb-2">
                                        ${this.escapeHtml(this.currentCard.description)}
                                    </p>
                                ` : ''}
                                <div class="flex items-center gap-3 text-xs text-gray-600">
                                    <span class="flex items-center gap-1">
                                        <i data-lucide="hash" class="w-3 h-3"></i>
                                        Sıra: ${this.currentCard.displayOrder}
                                    </span>
                                    <span class="flex items-center gap-1">
                                        <i data-lucide="layers" class="w-3 h-3"></i>
                                        ${this.currentCard.sectionCount || 0} bölüm
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        if (window.lucide) lucide.createIcons();

        // Add event listener for dropdown
        const selectElement = document.getElementById('card-select');
        if (selectElement) {
            selectElement.addEventListener('change', async (e) => {
                const cardId = parseInt(e.target.value);
                if (cardId) {
                    await this.selectCard(cardId);
                } else {
                    this.currentCard = null;
                    this.renderSectionArea();
                }
            });
        }
    }

    async selectCard(cardId) {
        this.currentCard = this.cards.find(c => c.id === cardId);
        await this.loadSections(cardId);

        // Re-render both card selector (to show active state) and section area
        this.renderCardSelector();
        this.renderSectionArea();
    }

    renderSectionArea() {
        const container = document.getElementById('study-section-area');
        if (!container) return;

        if (!this.currentCard) {
            container.innerHTML = `
                <div class="flex items-center justify-center h-64 text-center">
                    <div>
                        <i data-lucide="inbox" class="w-20 h-20 text-gray-300 mx-auto mb-4"></i>
                        <p class="text-gray-500 text-lg">Bölüm yönetimi için yukarıdan bir kart seçin</p>
                    </div>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        container.innerHTML = `
            <div class="space-y-4">
                <!-- Card Info Header -->
                <div class="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                    <div class="flex items-center justify-between gap-4">
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-gray-900">${this.escapeHtml(this.currentCard.title)}</h3>
                            ${this.currentCard.description ? `<p class="text-gray-500 text-sm mt-1">${this.escapeHtml(this.currentCard.description)}</p>` : ''}
                        </div>
                        <button onclick="window.studySectionManager.showSectionModal()"
                                class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors border border-gray-200 whitespace-nowrap">
                            <i data-lucide="plus" class="w-4 h-4"></i>
                            <span>Yeni Bölüm</span>
                        </button>
                    </div>
                </div>

                <!-- AI Content Generation Info -->
                <div class="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                    <div class="flex items-start gap-3">
                        <div class="text-purple-600 mt-0.5">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h4 class="font-semibold text-purple-900 mb-1 flex items-center gap-2">
                                🤖 AI ile İçerik Üretimi
                                <span class="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-medium">YENİ</span>
                            </h4>
                            <p class="text-sm text-purple-800 mb-2">
                                ChatGPT veya Claude gibi AI araçlarına vereceğiniz hazır prompt şablonuyla zengin içerik üretebilirsiniz.
                            </p>
                            <a href="/assets/templates/AI-CONTENT-GENERATION-PROMPT.md" target="_blank"
                               class="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-700 hover:text-purple-900 transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                </svg>
                                AI Prompt Şablonunu Görüntüle
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Sections List -->
                <div id="sections-list-container">
                    ${this.renderSectionsList()}
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
    }

    renderSectionsList() {
        if (this.sections.length === 0) {
            return `
                <div class="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <i data-lucide="layers" class="w-12 h-12 text-gray-300 mx-auto mb-3"></i>
                    <p class="text-gray-600 font-medium mb-1">Bu kartta henüz bölüm yok</p>
                    <p class="text-gray-400 text-sm mb-4">İlk bölümü oluşturarak içerik eklemeye başlayın</p>

                    <!-- AI Prompt Quick Link -->
                    <div class="mb-6 inline-block">
                        <a href="/assets/templates/AI-CONTENT-GENERATION-PROMPT.md" target="_blank"
                           class="inline-flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg transition-colors border border-purple-200">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                            </svg>
                            🤖 AI ile İçerik Üret
                        </a>
                    </div>

                    <div>
                        <button onclick="window.studySectionManager.showSectionModal()"
                                class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            <i data-lucide="plus" class="w-4 h-4"></i>
                            <span>İlk Bölümü Ekle</span>
                        </button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="space-y-2">
                ${this.sections.map(section => this.renderSectionItem(section)).join('')}
            </div>
        `;
    }

    renderSectionItem(section) {
        const contentCount = section.contentItems?.length || 0;
        return `
            <div class="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 p-4 group">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4 flex-1">
                        <div class="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-semibold text-gray-700">
                            ${section.displayOrder}
                        </div>
                        <div class="flex-1">
                            <h4 class="text-base font-medium text-gray-900">${this.escapeHtml(section.title)}</h4>
                            <p class="text-xs text-gray-500 mt-1">
                                ${contentCount} içerik bloğu
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center gap-1">
                        <button onclick="window.studySectionManager.showSectionModal(${section.id})"
                                class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Düzenle">
                            <i data-lucide="edit" class="w-4 h-4"></i>
                        </button>
                        <button onclick="window.studySectionManager.confirmDeleteSection(${section.id})"
                                class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Sil">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ============ Section Editor Modal ============

    async showSectionModal(sectionId = null) {
        let section = null;
        if (sectionId) {
            // API'den full section detayını çek (contentItems ile birlikte)
            try {
                section = await this.apiCall(`${this.apiBase}/sections/${sectionId}`);
            } catch (error) {
                console.error('Error loading section:', error);
                this.showToast('Bölüm yüklenemedi: ' + error.message, 'error');
                return;
            }
        }

        const isEdit = !!section;

        // Yeni bölüm oluştururken sadece başlık ve sıra numarası
        // Düzenlerken tam içerik editörü
        const contentSection = isEdit ? `
            <div class="border-t border-slate-200 pt-6 mt-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-slate-900">İçerik Yönetimi</h3>
                    <div class="flex gap-2">
                        <button type="button" onclick="window.studySectionManager.showWordImportForSection(${sectionId})"
                                class="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                            <i data-lucide="file-text" class="w-4 h-4"></i>
                            Word'den Ekle
                        </button>
                        <button type="button" onclick="window.studySectionManager.addContentItem()"
                                class="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
                            <i data-lucide="plus" class="w-4 h-4"></i>
                            Manuel Ekle
                        </button>
                    </div>
                </div>
                <div id="content-items-list" class="space-y-3 mb-3">
                    <!-- Content items will be added here -->
                </div>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p class="text-xs text-blue-800">
                        💡 <strong>İpucu:</strong> Word'den içerik yapıştırabilir veya manuel olarak tek tek ekleyebilirsiniz.
                    </p>
                </div>
            </div>
        ` : `
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <div class="flex gap-3">
                    <i data-lucide="info" class="w-5 h-5 text-yellow-600 flex-shrink-0"></i>
                    <p class="text-sm text-yellow-800">
                        Bölüm oluşturulduktan sonra içerik eklemek için <strong>"Düzenle"</strong> butonuna tıklayın.
                    </p>
                </div>
            </div>
        `;

        const modal = this.createModal('section-editor-modal',
            isEdit ? 'Bölümü Düzenle' : 'Yeni Bölüm Oluştur', `
            <form id="section-form" class="space-y-6">
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">
                        Bölüm Başlığı *
                    </label>
                    <input type="text" name="title" value="${this.escapeHtml(section?.title || '')}"
                           class="input-field text-lg font-semibold"
                           placeholder="Örn: Temel Kavramlar" required>
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">
                        Sıra Numarası *
                    </label>
                    <input type="number" name="displayOrder" value="${section?.displayOrder || this.sections.length + 1}"
                           min="1" class="input-field" required>
                </div>

                ${contentSection}

                <div class="flex justify-end gap-3 pt-4 border-t border-slate-200">
                    <button type="button" onclick="window.studySectionManager.closeModal('section-editor-modal')"
                            class="btn-secondary">
                        İptal
                    </button>
                    <button type="submit" class="btn-primary">
                        <i data-lucide="save" class="w-4 h-4"></i>
                        ${isEdit ? 'Güncelle' : 'Oluştur'}
                    </button>
                </div>
            </form>
        `, 'max-w-5xl');

        document.body.appendChild(modal);
        if (window.lucide) lucide.createIcons();

        // Initialize content items array
        this.currentContentItems = [];

        // Load existing content if editing
        if (section && section.contentItems && section.contentItems.length > 0) {
            this.currentContentItems = section.contentItems.map((item, idx) => ({
                id: Date.now() + idx,
                contentType: item.contentType,
                content: item.textContent || ''
            }));
            this.renderContentItems();
        }

        // Form submit handler
        document.getElementById('section-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSimpleSectionSubmit(sectionId, new FormData(e.target));
        });
    }

    // ============ Simple Content Editor Methods ============

    addContentItem() {
        const itemId = Date.now();
        this.currentContentItems.push({
            id: itemId,
            contentType: 'PARAGRAPH',
            content: ''
        });
        this.renderContentItems();
    }

    removeContentItem(itemId) {
        this.currentContentItems = this.currentContentItems.filter(item => item.id !== itemId);
        this.renderContentItems();
    }

    updateContentItem(itemId, field, value) {
        const item = this.currentContentItems.find(item => item.id === itemId);
        if (item) {
            item[field] = value;
        }
    }

    renderContentItems() {
        const container = document.getElementById('content-items-list');
        if (!container) return;

        if (this.currentContentItems.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <i data-lucide="file-text" class="w-12 h-12 mx-auto mb-2 text-gray-400"></i>
                    <p class="text-sm">Henuz icerik eklenmedi</p>
                    <p class="text-xs mt-1">Yukaridaki "Icerik Ekle" butonuna tiklayin</p>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        container.innerHTML = this.currentContentItems.map((item, index) => `
            <div class="bg-white border border-gray-300 rounded-lg p-4 hover:border-indigo-400 transition-colors">
                <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-semibold text-indigo-700">
                        ${index + 1}
                    </div>
                    <div class="flex-1 space-y-3">
                        <div>
                            <label class="block text-xs font-semibold text-gray-700 mb-1">Icerik Tipi</label>
                            <select onchange="window.studySectionManager.updateContentItem(${item.id}, 'contentType', this.value)"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="PARAGRAPH" ${item.contentType === 'PARAGRAPH' ? 'selected' : ''}>Paragraf</option>
                                <option value="HEADING" ${item.contentType === 'HEADING' ? 'selected' : ''}>Baslik</option>
                                <option value="LIST" ${item.contentType === 'LIST' ? 'selected' : ''}>Liste</option>
                                <option value="CODE" ${item.contentType === 'CODE' ? 'selected' : ''}>Kod</option>
                                <option value="QUOTE" ${item.contentType === 'QUOTE' ? 'selected' : ''}>Alinti</option>
                                <option value="TABLE" ${item.contentType === 'TABLE' ? 'selected' : ''}>Tablo</option>
                                <option value="DIVIDER" ${item.contentType === 'DIVIDER' ? 'selected' : ''}>Ayrac</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-700 mb-1">Icerik</label>
                            <textarea onchange="window.studySectionManager.updateContentItem(${item.id}, 'content', this.value)"
                                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                      rows="4"
                                      placeholder="Icerigi buraya yazin... (HTML destekli)">${this.escapeHtml(item.content || '')}</textarea>
                            <p class="text-xs text-gray-500 mt-1">
                                ${item.contentType === 'LIST' ? 'Liste icin: <li>Madde 1</li><li>Madde 2</li>' : ''}
                                ${item.contentType === 'HEADING' ? 'Baslik metni yazin' : ''}
                                ${item.contentType === 'CODE' ? 'Kod blogunu yazin' : ''}
                                ${item.contentType === 'TABLE' ? 'HTML tablo formatinda: <table><tr><td>...</td></tr></table>' : ''}
                            </p>
                        </div>
                    </div>
                    <button type="button" onclick="window.studySectionManager.removeContentItem(${item.id})"
                            class="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sil">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `).join('');

        if (window.lucide) lucide.createIcons();
    }

    convertContentItemsToBlocks(contentItems) {
        return contentItems.map(item => {
            if (item.blockData) {
                try {
                    // blockData string ise parse et, object ise direkt kullan
                    return typeof item.blockData === 'string'
                        ? JSON.parse(item.blockData)
                        : item.blockData;
                } catch (e) {
                    console.error('Failed to parse blockData:', e);
                }
            }

            // Fallback for legacy content
            return {
                id: `block-${item.id}`,
                type: 'paragraph',
                content: item.textContent || '',
                properties: {}
            };
        });
    }

    async handleSimpleSectionSubmit(sectionId, formData) {
        // Get data from simple content items
        const data = {
            studyCardId: this.currentCard.id,
            title: formData.get('title'),
            displayOrder: parseInt(formData.get('displayOrder')),
            active: true,
            contentItems: this.currentContentItems.map((item, index) => {
                // Create blockData object
                const blockId = `block-${Date.now()}-${index}`;
                let blockType = item.contentType.toLowerCase();

                // Adjust block type for specific content types
                if (blockType === 'paragraph') {
                    blockType = 'paragraph';
                } else if (blockType === 'heading') {
                    blockType = 'heading1';
                } else if (blockType === 'list') {
                    blockType = 'bulletList';
                } else if (blockType === 'code') {
                    blockType = 'code';
                } else if (blockType === 'quote') {
                    blockType = 'quote';
                } else if (blockType === 'table') {
                    blockType = 'table';
                } else if (blockType === 'divider') {
                    blockType = 'divider';
                }

                const blockData = {
                    id: blockId,
                    type: blockType,
                    content: item.content || '',
                    properties: {}
                };

                // Strip HTML for textContent
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = item.content || '';
                const textContent = tempDiv.textContent || tempDiv.innerText || '';

                return {
                    contentType: item.contentType,
                    displayOrder: index,
                    blockData: JSON.stringify(blockData),
                    textContent: textContent,
                    active: true
                };
            })
        };

        try {
            if (sectionId) {
                await this.updateSection(sectionId, data);
                this.showToast('Bölüm başarıyla güncellendi', 'success');
            } else {
                await this.createSection(data);
                this.showToast('Bölüm başarıyla oluşturuldu', 'success');
            }

            this.closeModal('section-editor-modal');
            await this.loadSections(this.currentCard.id);
            this.renderSectionArea();
        } catch (error) {
            console.error('Error saving section:', error);
            this.showToast('Kaydetme hatası: ' + error.message, 'error');
        }
    }

    async confirmDeleteSection(sectionId) {
        const section = this.sections.find(s => s.id === sectionId);
        if (!confirm(`"${section?.title}" bölümünü silmek istediğinizden emin misiniz?`)) {
            return;
        }

        try {
            await this.deleteSection(sectionId);
            this.showToast('Bölüm başarıyla silindi', 'success');
            await this.loadSections(this.currentCard.id);
            this.renderSectionArea();
        } catch (error) {
            console.error('Error deleting section:', error);
            this.showToast('Silme hatası: ' + error.message, 'error');
        }
    }

    mapBlockTypeToContentType(blockType) {
        const mapping = {
            'paragraph': 'PARAGRAPH',
            'heading1': 'HEADING',
            'heading2': 'HEADING',
            'heading3': 'HEADING',
            'bulletList': 'LIST',
            'numberedList': 'LIST',
            'todoList': 'LIST',
            'quote': 'QUOTE',
            'code': 'CODE',
            'divider': 'DIVIDER',
            'image': 'TEXT',
            'table': 'TABLE'
        };
        return mapping[blockType] || 'TEXT';
    }

    extractTextFromBlock(block) {
        // Strip HTML tags for plain text content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = block.content;
        return tempDiv.textContent || tempDiv.innerText || '';
    }

    // ============ Word Import Methods ============

    showWordImportForSection(sectionId) {
        const modal = this.createModal('word-import-inline-modal',
            'Word İçeriğini Ekle', `
            <div class="space-y-4">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div class="flex gap-3">
                        <i data-lucide="info" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"></i>
                        <div class="text-sm text-blue-800">
                            <p class="font-medium mb-2">Word İçeriğini Kopyala-Yapıştır</p>
                            <p>Word dosyanızdan içeriği kopyalayıp aşağıya yapıştırın. Mevcut içeriklere eklenecektir.</p>
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">
                        Word İçeriğini Buraya Yapıştırın *
                    </label>
                    <textarea id="word-content-inline-input"
                              class="w-full h-96 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Word dosyanızdan içeriği kopyalayıp buraya yapıştırın...

Otomatik algılanacak formatlar:
• Başlıklar (büyük harf veya # işareti ile)
• Paragraflar
• Maddeli listeler (• veya - ile başlayan satırlar)
• Numaralı listeler (1., 2., vs.)
• Kod blokları (\`\`\`...\`\`\` ile çevrelenen)"></textarea>
                </div>

                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p class="text-xs text-yellow-800">
                        <strong>İpucu:</strong> Word'de düzenli formatlanmış içeriği kopyalayın. Sistem otomatik olarak ayrıştıracaktır.
                    </p>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-slate-200">
                    <button type="button" onclick="window.studySectionManager.closeModal('word-import-inline-modal')"
                            class="btn-secondary">
                        İptal
                    </button>
                    <button type="button" onclick="window.studySectionManager.handleWordImportInline()"
                            class="btn-primary">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                        İçerikleri Ekle
                    </button>
                </div>
            </div>
        `, 'max-w-4xl');

        document.body.appendChild(modal);
        if (window.lucide) lucide.createIcons();
    }

    handleWordImportInline() {
        const wordContent = document.getElementById('word-content-inline-input').value.trim();

        if (!wordContent) {
            this.showToast('Lütfen Word içeriğini yapıştırın', 'error');
            return;
        }

        try {
            // Parse Word content
            const parsedItems = this.parseWordContent(wordContent);

            if (parsedItems.length === 0) {
                this.showToast('İçerik ayrıştırılamadı. Lütfen formatı kontrol edin.', 'error');
                return;
            }

            // Add to current content items
            parsedItems.forEach(item => {
                this.currentContentItems.push({
                    id: Date.now() + Math.random(),
                    contentType: item.contentType,
                    content: item.content
                });
            });

            // Re-render
            this.renderContentItems();

            // Close modal
            this.closeModal('word-import-inline-modal');
            this.showToast(`${parsedItems.length} içerik öğesi eklendi!`, 'success');

        } catch (error) {
            console.error('Word import error:', error);
            this.showToast('Ayrıştırma hatası: ' + error.message, 'error');
        }
    }

    parseWordContent(content) {
        const contentItems = [];
        const lines = content.split('\n');
        let currentParagraph = '';
        let currentList = [];
        let currentListType = null;
        let inCodeBlock = false;
        let currentCode = '';

        const flushParagraph = () => {
            if (currentParagraph.trim()) {
                contentItems.push({
                    contentType: 'PARAGRAPH',
                    blockType: 'paragraph',
                    content: currentParagraph.trim(),
                    properties: {}
                });
                currentParagraph = '';
            }
        };

        const flushList = () => {
            if (currentList.length > 0) {
                const listContent = currentList.map(item => `<li>${item}</li>`).join('');
                contentItems.push({
                    contentType: 'LIST',
                    blockType: currentListType === 'numbered' ? 'numberedList' : 'bulletList',
                    content: listContent,
                    properties: {}
                });
                currentList = [];
                currentListType = null;
            }
        };

        const flushCode = () => {
            if (currentCode.trim()) {
                contentItems.push({
                    contentType: 'CODE',
                    blockType: 'code',
                    content: currentCode.trim(),
                    properties: { language: 'plaintext' }
                });
                currentCode = '';
            }
        };

        for (let line of lines) {
            const trimmedLine = line.trim();

            // Skip empty lines
            if (!trimmedLine && !inCodeBlock) {
                flushParagraph();
                flushList();
                continue;
            }

            // Code block detection
            if (trimmedLine.startsWith('```')) {
                if (inCodeBlock) {
                    flushCode();
                    inCodeBlock = false;
                } else {
                    flushParagraph();
                    flushList();
                    inCodeBlock = true;
                }
                continue;
            }

            if (inCodeBlock) {
                currentCode += line + '\n';
                continue;
            }

            // Heading detection (all caps or starts with #)
            if (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 3 && /[A-ZÇĞİÖŞÜ]/.test(trimmedLine)) {
                flushParagraph();
                flushList();
                contentItems.push({
                    contentType: 'HEADING',
                    blockType: 'heading1',
                    content: trimmedLine,
                    properties: {}
                });
                continue;
            }

            if (trimmedLine.startsWith('#')) {
                flushParagraph();
                flushList();
                const level = trimmedLine.match(/^#+/)[0].length;
                const headingText = trimmedLine.replace(/^#+\s*/, '');
                contentItems.push({
                    contentType: 'HEADING',
                    blockType: level === 1 ? 'heading1' : level === 2 ? 'heading2' : 'heading3',
                    content: headingText,
                    properties: {}
                });
                continue;
            }

            // Bullet list detection
            if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
                flushParagraph();
                if (currentListType !== 'bullet') {
                    flushList();
                    currentListType = 'bullet';
                }
                const listItem = trimmedLine.replace(/^[•\-\*]\s*/, '');
                currentList.push(listItem);
                continue;
            }

            // Numbered list detection
            if (/^\d+[\.\)]\s/.test(trimmedLine)) {
                flushParagraph();
                if (currentListType !== 'numbered') {
                    flushList();
                    currentListType = 'numbered';
                }
                const listItem = trimmedLine.replace(/^\d+[\.\)]\s*/, '');
                currentList.push(listItem);
                continue;
            }

            // Regular paragraph
            flushList();
            if (currentParagraph) {
                currentParagraph += ' ' + trimmedLine;
            } else {
                currentParagraph = trimmedLine;
            }
        }

        // Flush remaining content
        flushParagraph();
        flushList();
        flushCode();

        return contentItems;
    }

    // ============ Utility Methods ============

    createModal(id, title, content, widthClass = 'max-w-4xl') {
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content ${widthClass}">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button onclick="window.studySectionManager.closeModal('${id}')" class="modal-close">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        return modal;
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
    }

    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            alert(message);
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    downloadJSON(data, filename) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showToast(`Şablon indirildi: ${filename}`, 'success');
    }
}

// Initialize on page load
if (typeof window !== 'undefined') {
    window.studySectionManager = new StudySectionManager();
}
