/**
 * Study Card Manager
 * Comprehensive CRUD interface for managing StudyCards with Notion-like editor
 */

class StudyCardManager {
    constructor() {
        this.cards = [];
        this.currentCard = null;
        this.currentSection = null;
        this.blockEditor = null;
        this.init();
    }

    async init() {
        await this.loadCards();
        this.renderCardList();
        this.attachEventListeners();
    }

    async loadCards() {
        try {
            const response = await fetch('/api/admin/study-cards', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to load study cards');

            this.cards = await response.json();
            this.cards.sort((a, b) => a.displayOrder - b.displayOrder);
        } catch (error) {
            console.error('Error loading study cards:', error);
            window.showToast('Kartlar yüklenirken hata oluştu', 'error');
        }
    }

    renderCardList() {
        const container = document.getElementById('study-cards-container');
        if (!container) return;

        if (this.cards.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <i data-lucide="book-open" class="w-16 h-16 text-slate-300 mx-auto mb-4"></i>
                    <p class="text-slate-500">Henüz kart eklenmemiş</p>
                    <button type="button" onclick="studyCardManager.showCardForm()" class="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
                        İlk Kartı Ekle
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="mb-4 flex justify-between items-center">
                <h3 class="text-lg font-semibold text-slate-900">Öğrenme Kartları</h3>
                <button type="button" onclick="studyCardManager.showCardForm()" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    Yeni Kart
                </button>
            </div>
            <div class="space-y-3">
                ${this.cards.map(card => this.renderCardItem(card)).join('')}
            </div>
        `;

        if (window.lucide) lucide.createIcons();
    }

    renderCardItem(card) {
        return `
            <div class="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <span class="text-sm font-medium text-slate-500">Sıra: ${card.displayOrder}</span>
                            <h4 class="text-lg font-semibold text-slate-900">${this.escapeHtml(card.name)}</h4>
                        </div>
                        <p class="text-sm text-slate-600 mb-3">${this.escapeHtml(card.description || '')}</p>
                        <div class="flex items-center gap-2 text-sm text-slate-500">
                            <i data-lucide="layers" class="w-4 h-4"></i>
                            <span>${card.sections?.length || 0} bölüm</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button type="button" onclick="studyCardManager.editCard(${card.id})" class="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Düzenle">
                            <i data-lucide="edit-2" class="w-4 h-4"></i>
                        </button>
                        <button type="button" onclick="studyCardManager.manageSections(${card.id})" class="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Bölümleri Yönet">
                            <i data-lucide="layers" class="w-4 h-4"></i>
                        </button>
                        <button type="button" onclick="studyCardManager.moveCard(${card.id}, 'up')" class="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Yukarı Taşı" ${card.displayOrder === 1 ? 'disabled' : ''}>
                            <i data-lucide="arrow-up" class="w-4 h-4"></i>
                        </button>
                        <button type="button" onclick="studyCardManager.moveCard(${card.id}, 'down')" class="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Aşağı Taşı" ${card.displayOrder === this.cards.length ? 'disabled' : ''}>
                            <i data-lucide="arrow-down" class="w-4 h-4"></i>
                        </button>
                        <button type="button" onclick="studyCardManager.deleteCard(${card.id})" class="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Sil">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showCardForm(cardId = null) {
        const card = cardId ? this.cards.find(c => c.id === cardId) : null;
        const isEdit = !!card;

        const modalHTML = `
            <div id="card-form-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6 border-b border-slate-200">
                        <h3 class="text-xl font-semibold text-slate-900">${isEdit ? 'Kartı Düzenle' : 'Yeni Kart Ekle'}</h3>
                    </div>
                    <form id="card-form" class="p-6 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Kart Adı *</label>
                            <input type="text" name="name" value="${card?.name || ''}" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                            <textarea name="description" rows="3" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">${card?.description || ''}</textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Sıra Numarası *</label>
                            <input type="number" name="displayOrder" value="${card?.displayOrder || this.cards.length + 1}" min="1" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                        </div>
                        <div class="flex justify-end gap-3 pt-4 border-t border-slate-200">
                            <button type="button" onclick="studyCardManager.closeModal()" class="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg">İptal</button>
                            <button type="submit" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">${isEdit ? 'Güncelle' : 'Oluştur'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const form = document.getElementById('card-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveCard(cardId, new FormData(form));
        });
    }

    async saveCard(cardId, formData) {
        const data = {
            name: formData.get('name'),
            description: formData.get('description'),
            displayOrder: parseInt(formData.get('displayOrder'))
        };

        try {
            const url = cardId ? `/api/admin/study-cards/${cardId}` : '/api/admin/study-cards';
            const method = cardId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to save card');

            window.showToast(cardId ? 'Kart güncellendi' : 'Kart oluşturuldu', 'success');
            this.closeModal();
            await this.loadCards();
            this.renderCardList();
        } catch (error) {
            console.error('Error saving card:', error);
            window.showToast('Kart kaydedilirken hata oluştu', 'error');
        }
    }

    async editCard(cardId) {
        this.showCardForm(cardId);
    }

    async deleteCard(cardId) {
        if (!confirm('Bu kartı silmek istediğinizden emin misiniz? Tüm bölümler ve içerikler silinecektir.')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/study-cards/${cardId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete card');

            window.showToast('Kart silindi', 'success');
            await this.loadCards();
            this.renderCardList();
        } catch (error) {
            console.error('Error deleting card:', error);
            window.showToast('Kart silinirken hata oluştu', 'error');
        }
    }

    async moveCard(cardId, direction) {
        const card = this.cards.find(c => c.id === cardId);
        if (!card) return;

        const currentOrder = card.displayOrder;
        const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;

        if (newOrder < 1 || newOrder > this.cards.length) return;

        try {
            // Swap orders
            const otherCard = this.cards.find(c => c.displayOrder === newOrder);
            if (otherCard) {
                await this.updateCardOrder(otherCard.id, currentOrder);
            }
            await this.updateCardOrder(cardId, newOrder);

            await this.loadCards();
            this.renderCardList();
        } catch (error) {
            console.error('Error moving card:', error);
            window.showToast('Kart taşınırken hata oluştu', 'error');
        }
    }

    async updateCardOrder(cardId, newOrder) {
        const response = await fetch(`/api/admin/study-cards/${cardId}/order`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ displayOrder: newOrder })
        });

        if (!response.ok) throw new Error('Failed to update order');
    }

    async manageSections(cardId) {
        this.currentCard = this.cards.find(c => c.id === cardId);
        if (!this.currentCard) return;

        // Load sections for this card
        await this.loadSections(cardId);
        this.showSectionManager();
    }

    async loadSections(cardId) {
        try {
            const response = await fetch(`/api/admin/study-cards/${cardId}/sections`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to load sections');

            this.currentCard.sections = await response.json();
        } catch (error) {
            console.error('Error loading sections:', error);
            window.showToast('Bölümler yüklenirken hata oluştu', 'error');
        }
    }

    showSectionManager() {
        const modalHTML = `
            <div id="section-manager-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                    <div class="p-6 border-b border-slate-200 flex justify-between items-center">
                        <div>
                            <h3 class="text-xl font-semibold text-slate-900">${this.escapeHtml(this.currentCard.name)} - Bölüm Yönetimi</h3>
                            <p class="text-sm text-slate-600 mt-1">Notion-benzeri editör ile içerik oluşturun</p>
                        </div>
                        <button type="button" onclick="studyCardManager.closeModal()" class="text-slate-400 hover:text-slate-600">
                            <i data-lucide="x" class="w-6 h-6"></i>
                        </button>
                    </div>
                    <div class="flex-1 overflow-y-auto p-6">
                        <div class="mb-4 flex justify-between items-center">
                            <h4 class="text-lg font-semibold text-slate-900">Bölümler</h4>
                            <button type="button" onclick="studyCardManager.showSectionForm()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                                <i data-lucide="plus" class="w-4 h-4"></i>
                                Yeni Bölüm
                            </button>
                        </div>
                        <div id="sections-list" class="space-y-3">
                            ${this.renderSectionsList()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        if (window.lucide) lucide.createIcons();
    }

    renderSectionsList() {
        if (!this.currentCard.sections || this.currentCard.sections.length === 0) {
            return `
                <div class="text-center py-12 bg-slate-50 rounded-lg">
                    <i data-lucide="layers" class="w-12 h-12 text-slate-300 mx-auto mb-3"></i>
                    <p class="text-slate-500">Henüz bölüm eklenmemiş</p>
                </div>
            `;
        }

        return this.currentCard.sections.map(section => `
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h5 class="font-semibold text-slate-900">${this.escapeHtml(section.title)}</h5>
                        <p class="text-sm text-slate-600 mt-1">Sıra: ${section.displayOrder} | ${section.contentItems?.length || 0} içerik öğesi</p>
                    </div>
                    <div class="flex gap-2">
                        <button type="button" onclick="studyCardManager.editSection(${section.id})" class="p-2 text-slate-600 hover:text-indigo-600 hover:bg-white rounded" title="İçeriği Düzenle">
                            <i data-lucide="edit" class="w-4 h-4"></i>
                        </button>
                        <button type="button" onclick="studyCardManager.deleteSection(${section.id})" class="p-2 text-slate-600 hover:text-red-600 hover:bg-white rounded" title="Sil">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showSectionForm(sectionId = null) {
        const section = sectionId ? this.currentCard.sections.find(s => s.id === sectionId) : null;
        const isEdit = !!section;

        const modalHTML = `
            <div id="section-form-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6 border-b border-slate-200 flex justify-between items-center">
                        <h3 class="text-xl font-semibold text-slate-900">${isEdit ? 'Bölümü Düzenle' : 'Yeni Bölüm Ekle'}</h3>
                        <button type="button" onclick="studyCardManager.closeSectionForm()" class="text-slate-400 hover:text-slate-600">
                            <i data-lucide="x" class="w-6 h-6"></i>
                        </button>
                    </div>
                    <form id="section-form" class="p-6 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Bölüm Başlığı *</label>
                            <input type="text" name="title" value="${section?.title || ''}" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Sıra Numarası *</label>
                            <input type="number" name="displayOrder" value="${section?.displayOrder || this.currentCard.sections.length + 1}" min="1" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">İçerik (Notion-benzeri Editör)</label>
                            <p class="text-sm text-slate-600 mb-3">Yazmaya başlayın veya <kbd class="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs">/</kbd> tuşu ile komut menüsünü açın</p>
                            <div id="notion-editor-container" class="border border-slate-300 rounded-lg"></div>
                        </div>
                        <div class="flex justify-end gap-3 pt-4 border-t border-slate-200">
                            <button type="button" onclick="studyCardManager.closeSectionForm()" class="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg">İptal</button>
                            <button type="submit" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">${isEdit ? 'Güncelle' : 'Oluştur'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        if (window.lucide) lucide.createIcons();

        // Initialize Notion editor
        this.blockEditor = new NotionBlockEditor('notion-editor-container', {
            onChange: (blocks) => {
                console.log('Blocks changed:', blocks);
            }
        });

        // Load existing content if editing
        if (section && section.contentItems) {
            this.blockEditor.setBlocks(this.convertContentItemsToBlocks(section.contentItems));
        }

        const form = document.getElementById('section-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveSection(sectionId, new FormData(form));
        });
    }

    convertContentItemsToBlocks(contentItems) {
        // Convert backend ContentItem format to Notion editor block format
        return contentItems.map(item => {
            if (item.blockData) {
                try {
                    return JSON.parse(item.blockData);
                } catch (e) {
                    console.error('Failed to parse blockData:', e);
                }
            }

            // Fallback for legacy textContent
            return {
                id: `block-${item.id}`,
                type: 'paragraph',
                content: item.textContent || '',
                properties: {}
            };
        });
    }

    async saveSection(sectionId, formData) {
        const blocks = this.blockEditor.getBlocks();

        const data = {
            studyCardId: this.currentCard.id,
            title: formData.get('title'),
            displayOrder: parseInt(formData.get('displayOrder')),
            active: true,
            contentItems: blocks.map((block, index) => ({
                contentType: this.mapBlockTypeToContentType(block.type),
                displayOrder: index,
                blockData: JSON.stringify(block),
                textContent: block.content,
                active: true
            }))
        };

        try {
            const url = sectionId ? `/api/admin/card-sections/${sectionId}` : '/api/admin/card-sections';
            const method = sectionId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to save section');

            window.showToast(sectionId ? 'Bölüm güncellendi' : 'Bölüm oluşturuldu', 'success');
            this.closeSectionForm();
            await this.loadSections(this.currentCard.id);

            // Update sections list
            const sectionsList = document.getElementById('sections-list');
            if (sectionsList) {
                sectionsList.innerHTML = this.renderSectionsList();
                if (window.lucide) lucide.createIcons();
            }
        } catch (error) {
            console.error('Error saving section:', error);
            window.showToast('Bölüm kaydedilirken hata oluştu', 'error');
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
            'table': 'TABLE',
            'divider': 'DIVIDER',
            'code': 'CODE',
            'quote': 'QUOTE',
            'callout': 'CALLOUT',
            'problem': 'STUDY_PROBLEM',
            'quiz': 'STUDY_QUIZ'
        };

        return mapping[blockType] || 'TEXT';
    }

    async editSection(sectionId) {
        this.showSectionForm(sectionId);
    }

    async deleteSection(sectionId) {
        if (!confirm('Bu bölümü silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/card-sections/${sectionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete section');

            window.showToast('Bölüm silindi', 'success');
            await this.loadSections(this.currentCard.id);

            // Update sections list
            const sectionsList = document.getElementById('sections-list');
            if (sectionsList) {
                sectionsList.innerHTML = this.renderSectionsList();
                if (window.lucide) lucide.createIcons();
            }
        } catch (error) {
            console.error('Error deleting section:', error);
            window.showToast('Bölüm silinirken hata oluştu', 'error');
        }
    }

    closeModal() {
        const modal = document.getElementById('card-form-modal') || document.getElementById('section-manager-modal');
        if (modal) {
            modal.remove();
        }
    }

    closeSectionForm() {
        const modal = document.getElementById('section-form-modal');
        if (modal) {
            modal.remove();
        }
        if (this.blockEditor) {
            this.blockEditor.destroy();
            this.blockEditor = null;
        }
    }

    attachEventListeners() {
        // Close modals on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeSectionForm();
            }
        });
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
}

// Initialize on page load
let studyCardManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        studyCardManager = new StudyCardManager();
    });
} else {
    studyCardManager = new StudyCardManager();
}

// Export for global use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StudyCardManager;
}
