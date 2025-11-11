/**
 * Bulk Problem Import Module
 *
 * Handles bulk importing of problems from JSON files.
 * Provides file upload, validation, preview, and import functionality.
 *
 * Dependencies: Logger, APIService, UIHelpers
 *
 * @module bulk-import
 */

const BulkImport = {
    // State variables
    selectedFile: null,
    parsedData: null,
    importedProblems: [],
    currentPreviewIndex: 0,

    /**
     * Show bulk import modal
     */
    showModal: () => {
        const modal = document.getElementById('bulkImportModal');
        if (!modal) return;

        // Reset modal state
        BulkImport.resetModal();

        modal.classList.remove('hidden');
        lucide.createIcons();
        Logger.log('Toplu içe aktarma modalı açıldı');
    },

    /**
     * Close bulk import modal
     */
    closeModal: () => {
        const modal = document.getElementById('bulkImportModal');
        if (modal) modal.classList.add('hidden');

        BulkImport.resetModal();
        Logger.log('Toplu içe aktarma modalı kapatıldı');
    },

    /**
     * Reset modal to initial state
     */
    resetModal: () => {
        // Reset file input
        const fileInput = document.getElementById('bulkImportFile');
        if (fileInput) fileInput.value = '';

        // Hide preview
        const preview = document.getElementById('bulkImportPreview');
        if (preview) preview.classList.add('hidden');

        // Hide results
        const results = document.getElementById('bulkImportResults');
        if (results) results.classList.add('hidden');

        // Disable import button
        const button = document.getElementById('bulkImportButton');
        if (button) button.disabled = true;

        // Reset state
        BulkImport.selectedFile = null;
        BulkImport.parsedData = null;
    },

    /**
     * Handle file selection
     * @param {Event} event - File input change event
     */
    handleFileSelect: (event) => {
        const file = event.target.files[0];
        if (!file) {
            BulkImport.resetModal();
            return;
        }

        if (!file.name.endsWith('.json')) {
            UIHelpers.showError('Lütfen sadece JSON dosyası seçin!');
            BulkImport.resetModal();
            return;
        }

        BulkImport.selectedFile = file;
        BulkImport.readAndValidateFile(file);
    },

    /**
     * Read and validate JSON file
     * @param {File} file - Selected file
     */
    readAndValidateFile: (file) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const data = JSON.parse(content);

                // Validate structure
                if (!BulkImport.validateJsonStructure(data)) {
                    UIHelpers.showError('Geçersiz JSON yapısı! Lütfen örnek şablonu kontrol edin.');
                    BulkImport.resetModal();
                    return;
                }

                BulkImport.parsedData = data;
                BulkImport.showPreview(content, data);

                // Enable import button
                const button = document.getElementById('bulkImportButton');
                if (button) button.disabled = false;

                Logger.log('JSON dosyası başarıyla okundu', { problemCount: data.problems.length });
            } catch (error) {
                Logger.error('JSON parse hatası:', error);
                UIHelpers.showError('JSON dosyası okunamadı! Lütfen dosyanın geçerli bir JSON olduğundan emin olun.');
                BulkImport.resetModal();
            }
        };

        reader.onerror = () => {
            Logger.error('Dosya okuma hatası');
            UIHelpers.showError('Dosya okunamadı!');
            BulkImport.resetModal();
        };

        reader.readAsText(file);
    },

    /**
     * Convert Turkish difficulty to English
     * @param {string} difficulty - Difficulty value
     * @returns {string} - English difficulty value
     */
    convertDifficulty: (difficulty) => {
        const upperDifficulty = difficulty.toUpperCase();
        const difficultyMap = {
            'KOLAY': 'EASY',
            'ORTA': 'MEDIUM',
            'ZOR': 'HARD',
            'EASY': 'EASY',
            'MEDIUM': 'MEDIUM',
            'HARD': 'HARD'
        };
        return difficultyMap[upperDifficulty] || upperDifficulty;
    },

    /**
     * Validate JSON structure
     * @param {Object} data - Parsed JSON data
     * @returns {boolean} - True if valid
     */
    validateJsonStructure: (data) => {
        if (!data || !data.problems || !Array.isArray(data.problems)) {
            return false;
        }

        if (data.problems.length === 0) {
            UIHelpers.showError('JSON dosyası en az bir problem içermelidir!');
            return false;
        }

        // Validate each problem
        for (let i = 0; i < data.problems.length; i++) {
            const problem = data.problems[i];

            if (!problem.title || !problem.content || !problem.difficulty) {
                UIHelpers.showError(`Problem ${i + 1}: Başlık, içerik ve zorluk seviyesi zorunludur!`);
                return false;
            }

            if (!problem.correctEntries || !Array.isArray(problem.correctEntries) || problem.correctEntries.length === 0) {
                UIHelpers.showError(`Problem ${i + 1}: En az bir doğru kayıt girişi gereklidir!`);
                return false;
            }

            // Validate difficulty
            const validDifficulties = ['KOLAY', 'ORTA', 'ZOR', 'EASY', 'MEDIUM', 'HARD'];
            if (!validDifficulties.includes(problem.difficulty.toUpperCase())) {
                UIHelpers.showError(`Problem ${i + 1}: Geçersiz zorluk seviyesi! (EASY, MEDIUM, HARD veya KOLAY, ORTA, ZOR olmalı)`);
                return false;
            }

            // Convert Turkish to English
            problem.difficulty = BulkImport.convertDifficulty(problem.difficulty);

            // Validate entries
            for (let j = 0; j < problem.correctEntries.length; j++) {
                const entry = problem.correctEntries[j];
                if (!entry.accountCode || !entry.accountName) {
                    UIHelpers.showError(`Problem ${i + 1}, Kayıt ${j + 1}: Hesap kodu ve hesap adı zorunludur!`);
                    return false;
                }
            }
        }

        return true;
    },

    /**
     * Show file preview
     * @param {string} content - File content
     * @param {Object} data - Parsed data
     */
    showPreview: (content, data) => {
        const preview = document.getElementById('bulkImportPreview');
        const previewContent = document.getElementById('bulkImportPreviewContent');

        if (!preview || !previewContent) return;

        // Create summary
        const summary = {
            toplamProblem: data.problems.length,
            zorlukDagilimi: {
                kolay: data.problems.filter(p => {
                    const diff = p.difficulty.toUpperCase();
                    return diff === 'KOLAY' || diff === 'EASY';
                }).length,
                orta: data.problems.filter(p => {
                    const diff = p.difficulty.toUpperCase();
                    return diff === 'ORTA' || diff === 'MEDIUM';
                }).length,
                zor: data.problems.filter(p => {
                    const diff = p.difficulty.toUpperCase();
                    return diff === 'ZOR' || diff === 'HARD';
                }).length
            },
            problemBasliklari: data.problems.map(p => p.title)
        };

        previewContent.textContent = JSON.stringify(summary, null, 2);
        preview.classList.remove('hidden');
        lucide.createIcons();
    },

    /**
     * Show bulk import preview (before actual import)
     */
    showBulkImportPreview: () => {
        if (!BulkImport.parsedData) {
            UIHelpers.showError('Lütfen önce bir dosya seçin!');
            return;
        }

        BulkImport.importedProblems = BulkImport.parsedData.problems;
        BulkImport.showProblemPreview();
    },

    /**
     * Process bulk import (actual import after review)
     */
    processBulkImport: async () => {
        if (!BulkImport.importedProblems || BulkImport.importedProblems.length === 0) {
            UIHelpers.showError('İçe aktarılacak problem bulunamadı!');
            return;
        }

        // Save current edits first
        BulkImport.saveCurrentProblemEdits();

        // Prepare data for import
        const dataToImport = {
            problems: BulkImport.importedProblems
        };

        // Close preview modal
        BulkImport.closeProblemPreviewModal();

        // Show loading in bulk import modal
        const bulkModal = document.getElementById('bulkImportModal');
        const resultsDiv = document.getElementById('bulkImportResults');

        if (resultsDiv) {
            resultsDiv.classList.remove('hidden');
            resultsDiv.innerHTML = '<div class="flex items-center justify-center gap-2 p-4"><i data-lucide="loader" class="w-5 h-5 animate-spin"></i><span>İçe aktarılıyor...</span></div>';
            lucide.createIcons();
        }

        try {
            const response = await APIService.post('/api/admin/problems/bulk', dataToImport);

            if (response.ok) {
                const result = await response.json();
                BulkImport.showResults(result);
                Logger.log('Toplu içe aktarma tamamlandı', result);

                // Reload problems list if available
                if (typeof ProblemManagement !== 'undefined' && typeof ProblemManagement.loadProblems === 'function') {
                    setTimeout(() => ProblemManagement.loadProblems(), 1000);
                }

                // Close bulk import modal after short delay
                setTimeout(() => {
                    BulkImport.closeModal();
                }, 2000);
            } else {
                const error = await response.json();
                UIHelpers.showError('İçe aktarma başarısız: ' + (error.message || 'Bilinmeyen hata'));
            }
        } catch (error) {
            Logger.error('Toplu içe aktarma hatası:', error);
            UIHelpers.showError('Bir hata oluştu! Lütfen tekrar deneyin.');
        }
    },

    /**
     * Show import results
     * @param {Object} result - Import result from API
     */
    showResults: (result) => {
        const resultsDiv = document.getElementById('bulkImportResults');
        const totalProblems = document.getElementById('totalProblems');
        const successCount = document.getElementById('successCount');
        const failureCount = document.getElementById('failureCount');
        const errorDetails = document.getElementById('errorDetails');
        const errorList = document.getElementById('errorList');

        if (!resultsDiv) return;

        // Update counts
        if (totalProblems) totalProblems.textContent = result.totalProblems;
        if (successCount) successCount.textContent = result.successCount;
        if (failureCount) failureCount.textContent = result.failureCount;

        // Show error details if any
        if (result.failureCount > 0 && result.errors && result.errors.length > 0 && errorDetails && errorList) {
            errorList.innerHTML = result.errors.map(error => `
                <div class="bg-red-50 border border-red-200 rounded p-2">
                    <div class="text-xs font-medium text-red-900">Problem #${error.problemIndex + 1}: ${error.problemTitle || 'Başlıksız'}</div>
                    <div class="text-xs text-red-700 mt-1">${error.errorMessage}</div>
                </div>
            `).join('');
            errorDetails.classList.remove('hidden');
        }

        resultsDiv.classList.remove('hidden');

        // Hide preview
        const preview = document.getElementById('bulkImportPreview');
        if (preview) preview.classList.add('hidden');

        // Show success message if all imported
        if (result.failureCount === 0) {
            UIHelpers.showSuccess(`${result.successCount} problem başarıyla içe aktarıldı!`);
        } else if (result.successCount > 0) {
            UIHelpers.showSuccess(`${result.successCount} problem başarıyla içe aktarıldı, ${result.failureCount} problem başarısız oldu.`);
        } else {
            UIHelpers.showError('Hiçbir problem içe aktarılamadı!');
        }

        lucide.createIcons();
    },

    /**
     * Show problem preview modal
     */
    showProblemPreview: () => {
        if (!BulkImport.importedProblems || BulkImport.importedProblems.length === 0) {
            Logger.warn('No problems to preview');
            return;
        }

        const modal = document.getElementById('problemPreviewModal');
        if (!modal) {
            Logger.error('Problem preview modal not found');
            return;
        }

        BulkImport.currentPreviewIndex = 0;
        BulkImport.renderCurrentProblem();
        modal.classList.remove('hidden');
        lucide.createIcons();
        Logger.log('Problem preview modal opened');
    },

    /**
     * Close problem preview modal
     */
    closeProblemPreviewModal: () => {
        const modal = document.getElementById('problemPreviewModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        BulkImport.importedProblems = [];
        BulkImport.currentPreviewIndex = 0;
        Logger.log('Problem preview modal closed');
    },

    /**
     * Save current problem edits
     */
    saveCurrentProblemEdits: () => {
        if (!BulkImport.importedProblems[BulkImport.currentPreviewIndex]) return;

        const problem = BulkImport.importedProblems[BulkImport.currentPreviewIndex];

        // Get values from inputs
        const title = document.getElementById('previewTitle');
        const content = document.getElementById('previewContent');
        const hint = document.getElementById('previewHint');
        const difficulty = document.getElementById('previewDifficulty');
        const tags = document.getElementById('previewTags');

        if (title) problem.title = title.value;
        if (content) problem.content = content.value;
        if (hint) problem.hint = hint.value;
        if (difficulty) problem.difficulty = difficulty.value;
        if (tags) problem.tags = tags.value;

        Logger.debug('Problem edits saved', { index: BulkImport.currentPreviewIndex, problem });
    },

    /**
     * Render current problem in preview
     */
    renderCurrentProblem: () => {
        const problem = BulkImport.importedProblems[BulkImport.currentPreviewIndex];
        if (!problem) return;

        // Update counter
        const counter = document.getElementById('problemCounter');
        if (counter) {
            counter.textContent = `Soru ${BulkImport.currentPreviewIndex + 1} / ${BulkImport.importedProblems.length}`;
        }

        // Update title
        const title = document.getElementById('previewTitle');
        if (title) {
            title.value = problem.title || '';
        }

        // Update content
        const content = document.getElementById('previewContent');
        if (content) {
            content.value = problem.content || '';
        }

        // Update hint
        const hint = document.getElementById('previewHint');
        if (hint) {
            hint.value = problem.hint || '';
        }

        // Update difficulty
        const difficulty = document.getElementById('previewDifficulty');
        if (difficulty) {
            difficulty.value = problem.difficulty || 'EASY';
        }

        // Update tags
        const tagsInput = document.getElementById('previewTags');
        if (tagsInput) {
            tagsInput.value = problem.tags || '';
        }

        // Update correct entries (read-only table for now)
        const entriesBody = document.getElementById('previewEntriesBody');
        if (entriesBody) {
            if (problem.correctEntries && problem.correctEntries.length > 0) {
                entriesBody.innerHTML = problem.correctEntries.map(entry => `
                    <tr>
                        <td class="px-4 py-2 text-sm text-slate-900">${entry.accountCode}</td>
                        <td class="px-4 py-2 text-sm text-slate-700">${entry.accountName}</td>
                        <td class="px-4 py-2 text-sm text-slate-900 text-right">${entry.debitAmount > 0 ? entry.debitAmount.toLocaleString('tr-TR') : '-'}</td>
                        <td class="px-4 py-2 text-sm text-slate-900 text-right">${entry.creditAmount > 0 ? entry.creditAmount.toLocaleString('tr-TR') : '-'}</td>
                    </tr>
                `).join('');
            } else {
                entriesBody.innerHTML = '<tr><td colspan="4" class="px-4 py-2 text-sm text-slate-500 text-center">Kayıt yok</td></tr>';
            }
        }

        // Update navigation buttons
        BulkImport.updateNavigationButtons();

        // Refresh icons
        lucide.createIcons();
    },

    /**
     * Update navigation button states
     */
    updateNavigationButtons: () => {
        const prevBtn = document.getElementById('prevProblemBtn');
        const nextBtn = document.getElementById('nextProblemBtn');
        const nextBtnContent = document.getElementById('nextBtnContent');

        if (prevBtn) {
            prevBtn.disabled = BulkImport.currentPreviewIndex === 0;
        }

        if (nextBtn && nextBtnContent) {
            const isLastProblem = BulkImport.currentPreviewIndex === BulkImport.importedProblems.length - 1;

            if (isLastProblem) {
                // Change button to "Kaydet ve Aktar"
                nextBtn.onclick = () => BulkImport.processBulkImport();
                nextBtnContent.innerHTML = `
                    <i data-lucide="save" class="w-4 h-4"></i>
                    Kaydet ve Aktar
                `;
            } else {
                // Keep as "İlerle"
                nextBtn.onclick = () => BulkImport.showNextProblem();
                nextBtnContent.innerHTML = `
                    İlerle
                    <i data-lucide="chevron-right" class="w-4 h-4"></i>
                `;
            }
            lucide.createIcons();
        }
    },

    /**
     * Show next problem
     */
    showNextProblem: () => {
        // Save current edits first
        BulkImport.saveCurrentProblemEdits();

        if (BulkImport.currentPreviewIndex < BulkImport.importedProblems.length - 1) {
            BulkImport.currentPreviewIndex++;
            BulkImport.renderCurrentProblem();
        }
    },

    /**
     * Show previous problem
     */
    showPreviousProblem: () => {
        // Save current edits first
        BulkImport.saveCurrentProblemEdits();

        if (BulkImport.currentPreviewIndex > 0) {
            BulkImport.currentPreviewIndex--;
            BulkImport.renderCurrentProblem();
        }
    },

    /**
     * Initialize bulk import module
     */
    initialize: () => {
        Logger.log('Bulk Import modülü başlatıldı');

        // Set up file input change listener
        const fileInput = document.getElementById('bulkImportFile');
        if (fileInput) {
            fileInput.addEventListener('change', BulkImport.handleFileSelect);
        }
    }
};

// Global functions for onclick handlers
function showBulkImportModal() {
    BulkImport.showModal();
}

function closeBulkImportModal() {
    BulkImport.closeModal();
}

function showBulkImportPreview() {
    BulkImport.showBulkImportPreview();
}

function processBulkImport() {
    BulkImport.processBulkImport();
}

function closeProblemPreviewModal() {
    BulkImport.closeProblemPreviewModal();
}

function showNextProblem() {
    BulkImport.showNextProblem();
}

function showPreviousProblem() {
    BulkImport.showPreviousProblem();
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BulkImport;
}
