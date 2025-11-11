/**
 * Word Document Importer using Mammoth.js
 * Converts .docx files to HTML for rich text editor
 */

class WordImporter {
    constructor() {
        if (typeof mammoth === 'undefined') {
            console.error('Mammoth.js is not loaded! Make sure to include mammoth.browser.min.js');
        }
    }

    /**
     * Import Word document and convert to HTML
     * @param {File} file - The .docx file to import
     * @returns {Promise<{html: string, messages: Array}>}
     */
    async importWordFile(file) {
        if (!file) {
            throw new Error('Dosya seçilmedi');
        }

        if (!file.name.endsWith('.docx')) {
            throw new Error('Sadece .docx uzantılı Word dosyaları desteklenmektedir');
        }

        try {
            const arrayBuffer = await this.readFileAsArrayBuffer(file);
            const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });

            // Clean and enhance the HTML
            const cleanedHtml = this.cleanHtml(result.value);

            return {
                html: cleanedHtml,
                messages: result.messages // Any warnings or errors from Mammoth
            };
        } catch (error) {
            console.error('Word import error:', error);
            throw new Error(`Word dosyası içe aktarılamadı: ${error.message}`);
        }
    }

    /**
     * Read file as ArrayBuffer for Mammoth.js
     * @param {File} file
     * @returns {Promise<ArrayBuffer>}
     */
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                resolve(event.target.result);
            };

            reader.onerror = (error) => {
                reject(error);
            };

            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * Clean and enhance HTML from Mammoth
     * @param {string} html
     * @returns {string}
     */
    cleanHtml(html) {
        // Create a temporary div to manipulate HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Add Tailwind classes to common elements
        this.enhanceElements(tempDiv);

        return tempDiv.innerHTML;
    }

    /**
     * Add Tailwind CSS classes to HTML elements
     * @param {HTMLElement} container
     */
    enhanceElements(container) {
        // Headings
        container.querySelectorAll('h1').forEach(el => {
            el.className = 'text-3xl font-bold mb-4 mt-6';
        });

        container.querySelectorAll('h2').forEach(el => {
            el.className = 'text-2xl font-bold mb-3 mt-5';
        });

        container.querySelectorAll('h3').forEach(el => {
            el.className = 'text-xl font-bold mb-2 mt-4';
        });

        // Paragraphs
        container.querySelectorAll('p').forEach(el => {
            el.className = 'mb-4 text-gray-800 leading-relaxed';
        });

        // Lists
        container.querySelectorAll('ul').forEach(el => {
            el.className = 'list-disc list-inside mb-4 space-y-2';
        });

        container.querySelectorAll('ol').forEach(el => {
            el.className = 'list-decimal list-inside mb-4 space-y-2';
        });

        container.querySelectorAll('li').forEach(el => {
            el.className = 'text-gray-800';
        });

        // Tables
        container.querySelectorAll('table').forEach(el => {
            el.className = 'border-collapse border border-gray-300 my-4 w-full';
        });

        container.querySelectorAll('td, th').forEach(el => {
            el.className = 'border border-gray-300 px-4 py-2';
        });

        container.querySelectorAll('th').forEach(el => {
            el.classList.add('bg-gray-100', 'font-semibold');
        });

        // Blockquotes
        container.querySelectorAll('blockquote').forEach(el => {
            el.className = 'border-l-4 border-indigo-500 pl-4 italic text-gray-700 my-4';
        });

        // Code blocks
        container.querySelectorAll('pre').forEach(el => {
            el.className = 'bg-gray-100 p-4 rounded my-4 overflow-x-auto';
        });

        container.querySelectorAll('code').forEach(el => {
            if (!el.parentElement || el.parentElement.tagName !== 'PRE') {
                el.className = 'bg-gray-100 px-2 py-1 rounded text-sm font-mono';
            }
        });

        // Strong/Bold
        container.querySelectorAll('strong').forEach(el => {
            el.className = 'font-bold';
        });

        // Emphasis/Italic
        container.querySelectorAll('em').forEach(el => {
            el.className = 'italic';
        });

        // Links
        container.querySelectorAll('a').forEach(el => {
            el.className = 'text-indigo-600 hover:text-indigo-800 underline';
        });
    }

    /**
     * Show file picker dialog
     * @returns {Promise<File>}
     */
    async pickFile() {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.docx';

            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    resolve(file);
                } else {
                    reject(new Error('Dosya seçilmedi'));
                }
            };

            input.click();
        });
    }

    /**
     * Complete import workflow with UI feedback
     * @param {RichTextEditor} editor - The editor instance to insert content into
     * @param {Function} showLoadingFn - Optional loading indicator function
     * @param {Function} hideLoadingFn - Optional loading hide function
     */
    async importToEditor(editor, showLoadingFn, hideLoadingFn) {
        try {
            if (showLoadingFn) showLoadingFn('Word dosyası yükleniyor...');

            const file = await this.pickFile();
            const result = await this.importWordFile(file);

            // Insert HTML into editor
            editor.setContent(result.html);

            if (hideLoadingFn) hideLoadingFn();

            // Show any warnings from Mammoth
            if (result.messages && result.messages.length > 0) {
                console.warn('Word import warnings:', result.messages);
            }

            return result;
        } catch (error) {
            if (hideLoadingFn) hideLoadingFn();
            throw error;
        }
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.WordImporter = WordImporter;
}
