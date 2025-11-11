/**
 * Study Card CRUD Management
 * Simple interface for managing StudyCard entities (name, description, order only)
 */

class StudyCardCRUD {
    constructor() {
        this.cards = [];
        this.apiBase = '/api/admin/study-cards';
        this.token = localStorage.getItem('token');
    }

    async init() {
        await this.loadCards();
        this.renderCardsList();
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

    // ============ UI Rendering ============

    renderCardsList() {
        const container = document.getElementById('study-cards-crud-container');
        if (!container) return;

        if (this.cards.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        container.innerHTML = `
            <div class="mb-6 flex justify-between items-center">
                <div>
                    <h3 class="text-xl font-bold text-slate-900">Öğrenme Kartları</h3>
                    <p class="text-sm text-slate-600 mt-1">Kart bilgilerini yönetin (ad, açıklama, sıra)</p>
                </div>
                <button onclick="window.studyCardCRUD.showCardModal()" class="btn-primary">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    Yeni Kart
                </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${this.cards.map(card => this.renderCardItem(card)).join('')}
            </div>
        `;

        if (window.lucide) lucide.createIcons();
    }

    renderEmptyState() {
        return `
            <div class="text-center py-20">
                <i data-lucide="book-open" class="w-20 h-20 text-slate-300 mx-auto mb-4"></i>
                <h3 class="text-xl font-semibold text-slate-900 mb-2">Henüz kart yok</h3>
                <p class="text-slate-600 mb-6">İlk öğrenme kartınızı oluşturun</p>
                <button onclick="window.studyCardCRUD.showCardModal()" class="btn-primary">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    Yeni Kart Ekle
                </button>
            </div>
        `;
    }

    renderCardItem(card) {
        return `
            <div class="bg-white border-2 border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-lg transition-all">
                <div class="flex items-start justify-between mb-3">
                    <span class="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg">
                        #${card.displayOrder}
                    </span>
                    <div class="flex gap-1">
                        <button onclick="window.studyCardCRUD.showCardModal(${card.id})"
                                title="Düzenle"
                                class="p-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors">
                            <i data-lucide="edit-2" class="w-4 h-4"></i>
                        </button>
                        <button onclick="window.studyCardCRUD.confirmDelete(${card.id})"
                                title="Sil"
                                class="p-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
                <h4 class="text-lg font-bold text-slate-900 mb-2">${this.escapeHtml(card.title)}</h4>
                ${card.description ? `<p class="text-sm text-slate-600 leading-relaxed mb-3 line-clamp-2">${this.escapeHtml(card.description)}</p>` : '<p class="text-sm text-slate-400 italic mb-3">Açıklama yok</p>'}
                <div class="pt-3 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-500">
                    <span class="flex items-center gap-1">
                        <i data-lucide="layers" class="w-3.5 h-3.5"></i>
                        ${card.sectionCount || 0} bölüm
                    </span>
                    <span class="flex items-center gap-1">
                        <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
                        ${new Date(card.createdAt || Date.now()).toLocaleDateString('tr-TR')}
                    </span>
                </div>
            </div>
        `;
    }

    // ============ Card Modal ============

    showCardModal(cardId = null) {
        const card = cardId ? this.cards.find(c => c.id === cardId) : null;
        const isEdit = !!card;

        const modal = this.createModal('card-crud-modal', isEdit ? 'Kartı Düzenle' : 'Yeni Kart Oluştur', `
            <form id="card-crud-form" class="space-y-5">
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">
                        Kart Adı *
                    </label>
                    <input type="text" name="title" value="${this.escapeHtml(card?.title || '')}"
                           class="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                           placeholder="Örn: Temel Muhasebe" required>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">
                        Açıklama
                    </label>
                    <textarea name="description" rows="4"
                              class="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                              placeholder="Kartın içeriği hakkında kısa açıklama...">${this.escapeHtml(card?.description || '')}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">
                        Sıra Numarası *
                    </label>
                    <input type="number" name="displayOrder" value="${card?.displayOrder || this.cards.length + 1}"
                           min="1"
                           class="w-32 px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                           required>
                    <p class="text-xs text-slate-500 mt-1.5">Kartların gösterim sırası</p>
                </div>
                <div class="flex justify-end gap-3 pt-4 border-t border-slate-200">
                    <button type="button" onclick="window.studyCardCRUD.closeModal('card-crud-modal')"
                            class="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors">
                        İptal
                    </button>
                    <button type="submit"
                            class="px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
                        <i data-lucide="save" class="w-4 h-4"></i>
                        ${isEdit ? 'Güncelle' : 'Oluştur'}
                    </button>
                </div>
            </form>
        `);

        document.body.appendChild(modal);
        if (window.lucide) lucide.createIcons();

        document.getElementById('card-crud-form').addEventListener('submit', async (e) => {
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
                this.showToast('Kart başarıyla güncellendi', 'success');
            } else {
                await this.createCard(data);
                this.showToast('Kart başarıyla oluşturuldu', 'success');
            }

            this.closeModal('card-crud-modal');
            await this.loadCards();
            this.renderCardsList();
        } catch (error) {
            console.error('Error saving card:', error);
            this.showToast('Kaydetme hatası: ' + error.message, 'error');
        }
    }

    async confirmDelete(cardId) {
        const card = this.cards.find(c => c.id === cardId);
        if (!confirm(`"${card?.title}" kartını silmek istediğinizden emin misiniz?\n\nTüm bölümler ve içerikler silinecektir.`)) {
            return;
        }

        try {
            await this.deleteCard(cardId);
            this.showToast('Kart başarıyla silindi', 'success');
            await this.loadCards();
            this.renderCardsList();
        } catch (error) {
            console.error('Error deleting card:', error);
            this.showToast('Silme hatası: ' + error.message, 'error');
        }
    }

    // ============ Utility Methods ============

    createModal(id, title, content) {
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal-overlay';
        modal.style.cssText = 'position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; padding: 1rem; z-index: 9999;';
        modal.innerHTML = `
            <div class="modal-content max-w-2xl" style="background-color: white; border-radius: 0.75rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); width: 100%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 10000;">
                <div class="modal-header" style="padding: 1.5rem; border-bottom: 2px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background-color: white; z-index: 10001; border-radius: 0.75rem 0.75rem 0 0;">
                    <h3 class="modal-title" style="font-size: 1.25rem; font-weight: 700; color: #0f172a;">${title}</h3>
                    <button onclick="window.studyCardCRUD.closeModal('${id}')" class="modal-close"
                            style="color: #94a3b8; transition: color 0.15s; cursor: pointer; background: none; border: none; padding: 0.25rem; display: flex; align-items: center; justify-content: center;"
                            onMouseOver="this.style.color='#64748b';"
                            onMouseOut="this.style.color='#94a3b8';">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                <div class="modal-body" style="padding: 1.5rem;">
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
}

// Initialize on page load
if (typeof window !== 'undefined') {
    window.studyCardCRUD = new StudyCardCRUD();
}
