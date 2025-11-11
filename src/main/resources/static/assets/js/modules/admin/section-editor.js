/**
 * Simple Section Editor Manager
 * Manages CardSection with rich text content (no complex ContentItems)
 */

class SectionEditor {
    constructor() {
        this.cards = [];
        this.sections = [];
        this.currentCard = null;
        this.currentSection = null;
        this.editor = null;
        this.wordImporter = null;
        this.apiBase = '/api/admin/study-cards';
        this.token = localStorage.getItem('token');
    }

    async init() {
        await this.loadCards();
        this.render();
        this.initWordImporter();
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
            const error = await response.text();
            throw new Error(`API Error: ${response.status} - ${error}`);
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

    render() {
        const container = document.getElementById('section-editor-container');
        if (!container) {
            console.error('section-editor-container not found');
            return;
        }

        container.innerHTML = `
            <div class="space-y-6">
                <!-- Card Selector -->
                <div id="cardSelectorArea" class="bg-white rounded-lg border border-gray-200 p-5">
                    ${this.renderCardSelector()}
                </div>

                <!-- Sections List -->
                <div id="sectionsListArea" class="bg-white rounded-lg border border-gray-200 p-5">
                    ${this.currentCard ? this.renderSectionsList() : this.renderEmptyState()}
                </div>
            </div>

            <!-- Edit Modal -->
            ${this.renderEditModal()}
        `;

        this.attachEventListeners();
        if (window.lucide) lucide.createIcons();
    }

    renderCardSelector() {
        if (this.cards.length === 0) {
            return `
                <div class="text-center text-gray-500 py-8">
                    <i data-lucide="alert-triangle" class="w-12 h-12 mx-auto mb-3 text-amber-500"></i>
                    <p>Henüz kart yok. Önce "Kart Yönetimi" sekmesinden bir kart oluşturun.</p>
                </div>
            `;
        }

        return `
            <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <i data-lucide="book-open" class="w-4 h-4 text-indigo-600"></i>
                Çalışma Kartı Seçin
            </label>
            <select id="cardSelect" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="">-- Kart Seçin --</option>
                ${this.cards.map(card => `
                    <option value="${card.id}" ${this.currentCard && this.currentCard.id === card.id ? 'selected' : ''}>
                        ${card.title}
                    </option>
                `).join('')}
            </select>
        `;
    }

    renderSectionsList() {
        if (this.sections.length === 0) {
            return `
                <div class="text-center text-gray-500 py-8">
                    <i data-lucide="file-text" class="w-12 h-12 mx-auto mb-3 text-gray-400"></i>
                    <p class="mb-4">Bu kartta henüz bölüm yok</p>
                    <button onclick="sectionEditor.openNewSectionModal()"
                            class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                        <i data-lucide="plus" class="w-4 h-4 inline mr-2"></i>
                        İlk Bölümü Oluştur
                    </button>
                </div>
            `;
        }

        return `
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <i data-lucide="layers" class="w-5 h-5 text-indigo-600"></i>
                    Bölümler (${this.sections.length})
                </h3>
                <button onclick="sectionEditor.openNewSectionModal()"
                        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                    <i data-lucide="plus" class="w-4 h-4 inline mr-1"></i>
                    Yeni Bölüm
                </button>
            </div>

            <div class="space-y-4">
                ${this.sections.map((section, index) => this.renderSectionCard(section, index)).join('')}
            </div>
        `;
    }

    renderSectionCard(section, index) {
        // Extract clean text preview from HTML content
        const getTextPreview = (html) => {
            if (!html) return 'İçerik yok';

            // Create a temporary div to parse HTML safely
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const text = tempDiv.textContent || tempDiv.innerText || '';

            // Return truncated text
            return text.length > 150 ? text.substring(0, 150).trim() + '...' : text.trim();
        };

        const preview = getTextPreview(section.content);

        return `
            <div class="border border-gray-200 rounded-lg hover:shadow-md transition-all bg-white">
                <!-- Section Header -->
                <div class="flex items-start gap-4 p-5 border-b border-gray-100">
                    <span class="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm flex items-center justify-center">
                        ${index + 1}
                    </span>
                    <div class="flex-1 min-w-0">
                        <h4 class="text-lg font-semibold text-gray-900 mb-2">${this.escapeHtml(section.title)}</h4>
                        <p class="text-sm text-gray-600 leading-relaxed line-clamp-3">
                            ${this.escapeHtml(preview)}
                        </p>
                    </div>
                </div>

                <!-- Section Actions -->
                <div class="flex items-center justify-end gap-2 p-4 bg-gray-50">
                    <button onclick="sectionEditor.openEditModal(${section.id})"
                            class="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-sm font-medium">
                        <i data-lucide="edit-2" class="w-4 h-4 inline mr-1"></i>
                        Düzenle
                    </button>
                    <button onclick="sectionEditor.deleteSection(${section.id})"
                            class="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                        <i data-lucide="trash-2" class="w-4 h-4 inline mr-1"></i>
                        Sil
                    </button>
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    renderEmptyState() {
        return `
            <div class="text-center text-gray-500 py-12">
                <i data-lucide="inbox" class="w-16 h-16 mx-auto mb-4 text-gray-400"></i>
                <p class="text-lg">Lütfen yukarıdan bir kart seçin</p>
            </div>
        `;
    }

    renderEditModal() {
        return `
            <div id="sectionEditModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                    <!-- Header -->
                    <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
                        <h3 id="modalTitle" class="text-xl font-bold text-gray-900">Bölüm Düzenle</h3>
                        <button onclick="sectionEditor.closeEditModal()" class="text-gray-500 hover:text-gray-700">
                            <i data-lucide="x" class="w-6 h-6"></i>
                        </button>
                    </div>

                    <!-- Content -->
                    <div class="flex-1 overflow-y-auto p-6 space-y-5">
                        <!-- Title Input -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Bölüm Başlığı</label>
                            <input type="text" id="sectionTitleInput"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                   placeholder="Örn: Giriş, Temel Kavramlar, Uygulama">
                        </div>

                        <!-- Word Import Button -->
                        <div class="flex gap-3">
                            <button onclick="sectionEditor.importWordDocument()"
                                    class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-medium shadow-md">
                                <i data-lucide="file-up" class="w-5 h-5 inline mr-2"></i>
                                Word Dosyasından Aktar
                            </button>
                            <button onclick="sectionEditor.clearEditor()"
                                    class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium">
                                <i data-lucide="trash-2" class="w-5 h-5 inline mr-2"></i>
                                İçeriği Temizle
                            </button>
                        </div>

                        <!-- Rich Text Editor -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">İçerik</label>
                            <div id="richTextEditorContainer"></div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                        <button onclick="sectionEditor.closeEditModal()"
                                class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                            İptal
                        </button>
                        <button onclick="sectionEditor.saveSection()"
                                class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                            <i data-lucide="save" class="w-5 h-5 inline mr-2"></i>
                            Kaydet
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ============ Event Listeners ============

    attachEventListeners() {
        const cardSelect = document.getElementById('cardSelect');
        if (cardSelect) {
            cardSelect.addEventListener('change', async (e) => {
                const cardId = e.target.value;
                if (cardId) {
                    this.currentCard = this.cards.find(c => c.id == cardId);
                    await this.loadSections(cardId);
                    this.renderSections();
                } else {
                    this.currentCard = null;
                    this.sections = [];
                    this.renderSections();
                }
            });
        }
    }

    renderSections() {
        const sectionsArea = document.getElementById('sectionsListArea');
        if (sectionsArea) {
            sectionsArea.innerHTML = this.currentCard ? this.renderSectionsList() : this.renderEmptyState();
            if (window.lucide) lucide.createIcons();
        }
    }

    // ============ Modal Operations ============

    openNewSectionModal() {
        if (!this.currentCard) {
            alert('Lütfen önce bir kart seçin');
            return;
        }

        this.currentSection = null;
        document.getElementById('modalTitle').textContent = 'Yeni Bölüm Oluştur';
        document.getElementById('sectionTitleInput').value = '';
        this.initEditor();
        document.getElementById('sectionEditModal').classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
    }

    async openEditModal(sectionId) {
        const section = this.sections.find(s => s.id === sectionId);
        if (!section) {
            alert('Bölüm bulunamadı');
            return;
        }

        this.currentSection = section;
        document.getElementById('modalTitle').textContent = 'Bölüm Düzenle';
        document.getElementById('sectionTitleInput').value = section.title;
        this.initEditor(section.content || '');
        document.getElementById('sectionEditModal').classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
    }

    closeEditModal() {
        document.getElementById('sectionEditModal').classList.add('hidden');
        this.currentSection = null;
        this.editor = null;
    }

    initEditor(initialContent = '') {
        // Initialize Rich Text Editor
        const container = document.getElementById('richTextEditorContainer');
        container.innerHTML = '<div id="richTextEditor"></div>';

        // Wait for DOM update
        setTimeout(() => {
            this.editor = new RichTextEditor('richTextEditor', {
                placeholder: 'Yazmaya başlamak için "/" yazın veya toolbar\'dan seçim yapın...',
                initialContent: initialContent,
                onChange: () => {}
            });
        }, 0);
    }

    initWordImporter() {
        this.wordImporter = new WordImporter();
    }

    async importWordDocument() {
        if (!this.editor) {
            alert('Editör başlatılmadı');
            return;
        }

        try {
            UIHelpers.showLoading('Word dosyası içe aktarılıyor...');

            const result = await this.wordImporter.importToEditor(
                this.editor,
                (msg) => UIHelpers.showLoading(msg),
                () => UIHelpers.hideLoading()
            );

            UIHelpers.showSuccess('Word dosyası başarıyla içe aktarıldı!');

            if (result.messages && result.messages.length > 0) {
                console.warn('Word import uyarıları:', result.messages);
            }
        } catch (error) {
            console.error('Word import error:', error);
            UIHelpers.showError(error.message || 'Word dosyası içe aktarılamadı');
        }
    }

    clearEditor() {
        if (confirm('İçeriği temizlemek istediğinizden emin misiniz?')) {
            if (this.editor) {
                this.editor.clear();
            }
        }
    }

    // ============ Save/Delete Operations ============

    async saveSection() {
        if (!this.currentCard) {
            UIHelpers.showError('Lütfen önce bir kart seçin');
            return;
        }

        const title = document.getElementById('sectionTitleInput').value.trim();
        if (!title) {
            UIHelpers.showError('Lütfen bölüm başlığı girin');
            return;
        }

        const content = this.editor ? this.editor.getContent() : '';

        try {
            UIHelpers.showLoading('Kaydediliyor...');

            const data = {
                studyCardId: this.currentCard.id,
                title: title,
                content: content,
                displayOrder: this.currentSection ? this.currentSection.displayOrder : this.sections.length,
                active: true
            };

            if (this.currentSection) {
                // Update existing
                await this.updateSection(this.currentSection.id, data);
                UIHelpers.showSuccess('Bölüm güncellendi!');
            } else {
                // Create new
                await this.createSection(data);
                UIHelpers.showSuccess('Yeni bölüm oluşturuldu!');
            }

            await this.loadSections(this.currentCard.id);
            this.renderSections();
            this.closeEditModal();

        } catch (error) {
            console.error('Save error:', error);
            UIHelpers.showError(error.message || 'Bölüm kaydedilemedi');
        } finally {
            UIHelpers.hideLoading();
        }
    }

    async deleteSection(sectionId) {
        if (!confirm('Bu bölümü silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            UIHelpers.showLoading('Siliniyor...');

            await this.apiCall(`${this.apiBase}/sections/${sectionId}`, {
                method: 'DELETE'
            });

            UIHelpers.showSuccess('Bölüm silindi!');

            await this.loadSections(this.currentCard.id);
            this.renderSections();

        } catch (error) {
            console.error('Delete error:', error);
            UIHelpers.showError(error.message || 'Bölüm silinemedi');
        } finally {
            UIHelpers.hideLoading();
        }
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.SectionEditor = SectionEditor;
}

// Note: Manual initialization handled by admin-controller.js
// Automatic initialization removed to prevent duplicate instances
