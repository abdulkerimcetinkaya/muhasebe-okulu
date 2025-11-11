/**
 * Account Helper Utilities for Admin Panel
 *
 * Provides functions for managing accounting entries (hesap plan),
 * answer rows, totals calculation, and balance checking.
 * Depends on: Logger, Formatters, UIHelpers
 *
 * @module account-helpers
 */

const AccountHelpers = {
    /**
     * Fetch account name from API by account code
     * @param {string} code - 3-digit account code
     * @param {HTMLElement} displayElement - Element to display account name
     */
    updateAccountName: async (code, displayElement) => {
        try {
            const response = await fetch(
                `${CommonConfig.API_URL}/account-plans/search?code=${encodeURIComponent(code)}`
            );

            if (response.ok) {
                const data = await response.json();
                if (data && data.name) {
                    displayElement.textContent = data.name;
                    displayElement.className = 'account-name-display text-sm text-green-600 py-1.5 px-2.5 rounded-md border border-green-200 bg-green-50 min-h-[38px] flex items-center';
                    Logger.debug(`Account found: ${code} - ${data.name}`);
                } else {
                    displayElement.textContent = 'Hesap bulunamadı';
                    displayElement.className = 'account-name-display text-sm text-red-500 py-1.5 px-2.5 rounded-md border border-red-200 bg-red-50 min-h-[38px] flex items-center';
                }
            } else {
                displayElement.textContent = 'Hesap adı alınamadı';
                displayElement.className = 'account-name-display text-sm text-red-500 py-1.5 px-2.5 rounded-md border border-red-200 bg-red-50 min-h-[38px] flex items-center';
            }
        } catch (error) {
            Logger.error('Account name fetch error:', error);
            displayElement.textContent = 'Bağlantı hatası';
            displayElement.className = 'account-name-display text-sm text-red-500 py-1.5 px-2.5 rounded-md border border-red-200 bg-red-50 min-h-[38px] flex items-center';
        }
    },

    /**
     * Add a new answer row to accounting table
     * @param {string} tbodyId - ID of tbody element
     * @param {string} hesapKodu - Account code (optional)
     * @param {string} hesapAdi - Account name (optional)
     * @param {string} borc - Debit amount (optional)
     * @param {string} alacak - Credit amount (optional)
     */
    addAnswerRow: (tbodyId, hesapKodu = '', hesapAdi = '', borc = '', alacak = '') => {
        const tbody = document.getElementById(tbodyId);
        if (!tbody) {
            Logger.error(`Tbody not found: ${tbodyId}`);
            return;
        }

        const tr = document.createElement('tr');
        tr.className = 'align-top';
        tr.innerHTML = `
            <td class="px-4 py-2">
                <input type="text" value="${Formatters.escapeAttr(hesapKodu)}" placeholder="Örn: 100"
                       class="account-code-input w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300" />
            </td>
            <td class="px-4 py-2">
                <div class="account-name-display text-sm text-slate-600 py-1.5 px-2.5 rounded-md border border-slate-200 bg-slate-50 min-h-[38px] flex items-center">
                    ${Formatters.escapeAttr(hesapAdi)}
                </div>
            </td>
            <td class="px-4 py-2">
                <div class="relative">
                    <span class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₺</span>
                    <input type="number" step="0.01" value="${Formatters.escapeAttr(borc)}"
                           class="debit-input w-full rounded-md border border-slate-300 bg-white pl-6 pr-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300" />
                </div>
            </td>
            <td class="px-4 py-2">
                <div class="relative">
                    <span class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₺</span>
                    <input type="number" step="0.01" value="${Formatters.escapeAttr(alacak)}"
                           class="credit-input w-full rounded-md border border-slate-300 bg-white pl-6 pr-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300" />
                </div>
            </td>
            <td class="px-4 py-2 text-right">
                <div class="flex items-center justify-end gap-2">
                    <button type="button" class="add-row-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-green-200 text-green-700 hover:bg-green-50">
                        <i data-lucide="plus" class="w-3.5 h-3.5" style="stroke-width:1.5;"></i>
                        Ekle
                    </button>
                    <button type="button" class="remove-row-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-red-200 text-red-700 hover:bg-red-50">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5" style="stroke-width:1.5;"></i>
                        Sil
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);

        // Get elements
        const debitInput = tr.querySelector('.debit-input');
        const creditInput = tr.querySelector('.credit-input');
        const accountCodeInput = tr.querySelector('.account-code-input');
        const accountNameDisplay = tr.querySelector('.account-name-display');

        // Account code input listener - fetch account name for 3-digit codes
        accountCodeInput.addEventListener('input', function() {
            const code = this.value.trim();

            if (code && code.length === 3) {
                AccountHelpers.updateAccountName(code, accountNameDisplay);
            } else if (code.length > 0 && code.length < 3) {
                accountNameDisplay.textContent = '';
                accountNameDisplay.className = 'account-name-display text-sm text-slate-600 py-1.5 px-2.5 rounded-md border border-slate-200 bg-slate-50 min-h-[38px] flex items-center';
            } else {
                accountNameDisplay.textContent = '';
                accountNameDisplay.className = 'account-name-display text-sm text-slate-600 py-1.5 px-2.5 rounded-md border border-slate-200 bg-slate-50 min-h-[38px] flex items-center';
            }
        });

        // Debit/Credit mutual exclusion
        debitInput.addEventListener('input', function() {
            if (this.value && parseFloat(this.value) > 0) {
                creditInput.value = '';
            }
            AccountHelpers.updateTotals(tbodyId);
        });

        creditInput.addEventListener('input', function() {
            if (this.value && parseFloat(this.value) > 0) {
                debitInput.value = '';
            }
            AccountHelpers.updateTotals(tbodyId);
        });

        // Add row button
        tr.querySelector('.add-row-btn').addEventListener('click', () => {
            AccountHelpers.addAnswerRow(tbodyId);
        });

        // Remove row button
        tr.querySelector('.remove-row-btn').addEventListener('click', () => {
            tr.remove();
            AccountHelpers.updateTotals(tbodyId);
        });

        UIHelpers.refreshIcons();
        Logger.debug(`Answer row added to ${tbodyId}`);
    },

    /**
     * Update debit/credit totals and balance status
     * @param {string} tbodyId - ID of tbody element
     */
    updateTotals: (tbodyId) => {
        const rows = Array.from(document.querySelectorAll(`#${tbodyId} tr`));
        let totalDebit = 0;
        let totalCredit = 0;

        rows.forEach(row => {
            const inputs = row.querySelectorAll('input[type="number"]');
            if (inputs.length >= 2) {
                totalDebit += parseFloat(inputs[0].value) || 0;
                totalCredit += parseFloat(inputs[1].value) || 0;
            }
        });

        // Determine form prefix (c for create, e for edit)
        const isCreateForm = tbodyId === 'c-answersBody';
        const prefix = isCreateForm ? 'c' : 'e';

        // Update totals
        const debitTotalElement = document.getElementById(`${prefix}-debit-total`);
        const creditTotalElement = document.getElementById(`${prefix}-credit-total`);
        const balanceElement = document.getElementById(`${prefix}-balance`);

        if (debitTotalElement) {
            debitTotalElement.textContent = totalDebit.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        if (creditTotalElement) {
            creditTotalElement.textContent = totalCredit.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        // Update balance status
        if (balanceElement) {
            if (totalDebit === 0 && totalCredit === 0) {
                balanceElement.innerHTML = '<i data-lucide="minus-circle" class="w-4 h-4" style="stroke-width: 1.5;"></i><span>Kayıt Boş</span>';
                balanceElement.className = 'flex items-center gap-2 text-slate-500';
            } else if (Math.abs(totalDebit - totalCredit) < 0.01) {
                balanceElement.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4" style="stroke-width: 1.5;"></i><span>Dengeli</span>';
                balanceElement.className = 'flex items-center gap-2 text-green-600';
            } else {
                const difference = Math.abs(totalDebit - totalCredit);
                const farkText = difference.toLocaleString('tr-TR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                balanceElement.innerHTML = `<i data-lucide="alert-triangle" class="w-4 h-4" style="stroke-width: 1.5;"></i><span>Dengesiz (Fark: ${farkText}₺)</span>`;
                balanceElement.className = 'flex items-center gap-2 text-amber-600';
            }
            UIHelpers.refreshIcons();
        }

        Logger.debug(`Totals updated for ${tbodyId}: Debit=${totalDebit}, Credit=${totalCredit}`);
    },

    /**
     * Collect answers from tbody rows
     * @param {string} tbodyId - ID of tbody element
     * @returns {Array} Array of answer objects
     */
    collectAnswers: (tbodyId) => {
        const rows = Array.from(document.querySelectorAll(`#${tbodyId} tr`));
        const answers = rows.map(r => {
            const inputs = r.querySelectorAll('input');
            const accountNameDisplay = r.querySelector('.account-name-display');
            return {
                accountCode: (inputs[0].value || '').trim(),
                accountName: accountNameDisplay ? accountNameDisplay.textContent.trim() : '',
                debitAmount: Number(inputs[1].value || 0),
                creditAmount: Number(inputs[2].value || 0),
            };
        }).filter(a => a.accountCode || a.debitAmount || a.creditAmount);

        Logger.debug(`Collected ${answers.length} answers from ${tbodyId}`);
        return answers;
    },

    /**
     * Initialize account helpers event listeners
     * Sets up global add row button listeners
     */
    initialize: () => {
        const cAddRow = document.getElementById('c-addRow');
        const eAddRow = document.getElementById('e-addRow');

        if (cAddRow) {
            cAddRow.addEventListener('click', () => AccountHelpers.addAnswerRow('c-answersBody'));
        }

        if (eAddRow) {
            eAddRow.addEventListener('click', () => AccountHelpers.addAnswerRow('e-answersBody'));
        }

        Logger.debug('Account helpers initialized');
    }
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccountHelpers;
}
