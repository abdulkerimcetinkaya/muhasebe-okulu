/**
 * Study Card Admin Management
 * Simple CRUD interface for managing study cards and their sections with block-based content
 */

class StudyCardAdmin {
    constructor() {
        this.cards = [];
        this.currentCard = null;
        this.currentSection = null;
        this.blockEditor = null;
        this.apiBase = '/api/admin/study-cards';
        this.token = localStorage.getItem('token');
    }

    async init() {
        try {
            await this.loadCards();
            this.renderCardsList();
            this.attachEventListeners();
        } catch (error) {
            console.error('Failed to initialize Study Card Admin:', error);
            this.showToast('Başlatma hatası', 'error');
        }
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

    async createCard(data) {
        return await this.apiCall(this.apiBase, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateCard(id, data) {
        return await this.apiCall(`${this.apiBase}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteCard(id) {
        await this.apiCall(`${this.apiBase}/${id}`, {
            method: 'DELETE'
        });
    }

    async loadSections(cardId) {
        return await this.apiCall(`${this.apiBase}/${cardId}/sections`);
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

    renderCardsList() {
        const container = document.getElementById('study-cards-container');
        if (!container) return;

        if (this.cards.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        container.innerHTML = `
            <div class="mb-4 flex justify-between items-center">
                <h3 class="text-lg font-semibold text-slate-900">Öğrenme Kartları</h3>
                <button onclick="window.studyCardAdmin.showCardModal()" class="btn-primary">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    Yeni Kart
                </button>
            </div>
            <div class="grid gap-4">
                ${this.cards.map(card => this.renderCardItem(card)).join('')}
            </div>
        `;

        if (window.lucide) lucide.createIcons();
    }

    renderEmptyState() {
        return `
            <div class="text-center py-16">
                <i data-lucide="book-open" class="w-16 h-16 text-slate-300 mx-auto mb-4"></i>
                <h3 class="text-lg font-medium text-slate-900 mb-2">Henüz kart yok</h3>
                <p class="text-slate-600 mb-4">İlk öğrenme kartınızı oluşturun</p>
                <button onclick="window.studyCardAdmin.showCardModal()" class="btn-primary">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    Yeni Kart Ekle
                </button>
            </div>
        `;
    }

    renderCardItem(card) {
        return `
            <div class="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <span class="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded">
                                Sıra: ${card.displayOrder}
                            </span>
                            <h4 class="text-lg font-semibold text-slate-900">${this.escapeHtml(card.title)}</h4>
                        </div>
                        ${card.description ? `<p class="text-sm text-slate-600 mb-3">${this.escapeHtml(card.description)}</p>` : ''}
                        <div class="flex items-center gap-4 text-sm text-slate-500">
                            <span class="flex items-center gap-1">
                                <i data-lucide="layers" class="w-4 h-4"></i>
                                ${card.sectionCount || 0} bölüm
                            </span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="window.studyCardAdmin.showCardModal(${card.id})"
                                class="btn-icon btn-icon-primary" title="Düzenle">
                            <i data-lucide="edit-2" class="w-4 h-4"></i>
                        </button>
                        <button onclick="window.studyCardAdmin.showSectionsModal(${card.id})"
                                class="btn-icon btn-icon-success" title="Bölümleri Yönet">
                            <i data-lucide="layers" class="w-4 h-4"></i>
                        </button>
                        <button onclick="window.studyCardAdmin.confirmDelete(${card.id})"
                                class="btn-icon btn-icon-danger" title="Sil">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ============ Card Modal ============

    showCardModal(cardId = null) {
        const card = cardId ? this.cards.find(c => c.id === cardId) : null;
        const isEdit = !!card;

        const modal = this.createModal('card-modal', isEdit ? 'Kartı Düzenle' : 'Yeni Kart', `
            <form id="card-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Kart Başlığı *</label>
                    <input type="text" name="title" value="${card?.title || ''}"
                           class="input-field" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                    <textarea name="description" rows="3" class="input-field">${card?.description || ''}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Sıra Numarası *</label>
                    <input type="number" name="displayOrder" value="${card?.displayOrder || this.cards.length + 1}"
                           min="1" class="input-field" required>
                </div>
                <div class="flex justify-end gap-3 pt-4 border-t border-slate-200">
                    <button type="button" onclick="window.studyCardAdmin.closeModal('card-modal')" class="btn-secondary">
                        İptal
                    </button>
                    <button type="submit" class="btn-primary">
                        ${isEdit ? 'Güncelle' : 'Oluştur'}
                    </button>
                </div>
            </form>
        `);

        document.body.appendChild(modal);
        if (window.lucide) lucide.createIcons();

        document.getElementById('card-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleCardSubmit(cardId, new FormData(e.target));
        });
    }

    async handleCardSubmit(cardId, formData) {
        const data = {
            title: formData.get('title'),
            description: formData.get('description') || null,
            displayOrder: parseInt(formData.get('displayOrder')),
            isActive: true
        };

        try {
            if (cardId) {
                await this.updateCard(cardId, data);
                this.showToast('Kart güncellendi', 'success');
            } else {
                await this.createCard(data);
                this.showToast('Kart oluşturuldu', 'success');
            }

            this.closeModal('card-modal');
            await this.loadCards();
            this.renderCardsList();
        } catch (error) {
            console.error('Error saving card:', error);
            this.showToast('Kaydetme hatası', 'error');
        }
    }

    async confirmDelete(cardId) {
        if (!confirm('Bu kartı silmek istediğinizden emin misiniz? Tüm bölümler ve içerikler silinecektir.')) {
            return;
        }

        try {
            await this.deleteCard(cardId);
            this.showToast('Kart silindi', 'success');
            await this.loadCards();
            this.renderCardsList();
        } catch (error) {
            console.error('Error deleting card:', error);
            this.showToast('Silme hatası', 'error');
        }
    }

    // ============ Sections Modal ============

    async showSectionsModal(cardId) {
        this.currentCard = this.cards.find(c => c.id === cardId);
        if (!this.currentCard) return;

        const sections = await this.loadSections(cardId);

        const modal = this.createModal('sections-modal',
            `${this.currentCard.title} - Bölüm Yönetimi`, `
            <div class="space-y-4">
                <div class="flex justify-between items-center pb-3 border-b border-slate-200">
                    <h4 class="font-medium text-slate-900">Bölümler</h4>
                    <button onclick="window.studyCardAdmin.showSectionModal()" class="btn-success btn-sm">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                        Yeni Bölüm
                    </button>
                </div>
                <div id="sections-list" class="space-y-3">
                    ${sections.length === 0 ? this.renderEmptySections() : sections.map(s => this.renderSectionItem(s)).join('')}
                </div>
            </div>
        `, 'max-w-4xl');

        document.body.appendChild(modal);
        if (window.lucide) lucide.createIcons();
    }

    renderEmptySections() {
        return `
            <div class="text-center py-8 bg-slate-50 rounded-lg">
                <i data-lucide="layers" class="w-12 h-12 text-slate-300 mx-auto mb-3"></i>
                <p class="text-slate-500">Henüz bölüm eklenmemiş</p>
            </div>
        `;
    }

    renderSectionItem(section) {
        return `
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h5 class="font-semibold text-slate-900 mb-1">${this.escapeHtml(section.title)}</h5>
                        <p class="text-sm text-slate-600">Sıra: ${section.displayOrder} | ${section.contentItems?.length || 0} içerik öğesi</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="window.studyCardAdmin.showSectionModal(${section.id})"
                                class="btn-icon btn-icon-primary" title="İçeriği Düzenle">
                            <i data-lucide="edit" class="w-4 h-4"></i>
                        </button>
                        <button onclick="window.studyCardAdmin.confirmDeleteSection(${section.id})"
                                class="btn-icon btn-icon-danger" title="Sil">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ============ Section Editor Modal ============

    async showSectionModal(sectionId = null) {
        // This will be implemented with the block editor
        alert('Section editor with block editor will be implemented next');
    }

    async confirmDeleteSection(sectionId) {
        if (!confirm('Bu bölümü silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            await this.deleteSection(sectionId);
            this.showToast('Bölüm silindi', 'success');

            // Refresh sections list
            const sections = await this.loadSections(this.currentCard.id);
            document.getElementById('sections-list').innerHTML =
                sections.length === 0 ? this.renderEmptySections() : sections.map(s => this.renderSectionItem(s)).join('');

            if (window.lucide) lucide.createIcons();
        } catch (error) {
            console.error('Error deleting section:', error);
            this.showToast('Silme hatası', 'error');
        }
    }

    // ============ Utility Methods ============

    createModal(id, title, content, widthClass = 'max-w-2xl') {
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content ${widthClass}">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button onclick="window.studyCardAdmin.closeModal('${id}')" class="modal-close">
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

    attachEventListeners() {
        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal('card-modal');
                this.closeModal('sections-modal');
                this.closeModal('section-editor-modal');
            }
        });
    }
}

// Initialize on page load
let studyCardAdmin;
if (typeof window !== 'undefined') {
    window.studyCardAdmin = new StudyCardAdmin();
}
